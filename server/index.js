import crypto from "node:crypto";
import http from "node:http";
import { WebSocket, WebSocketServer } from "ws";

const PORT = Number(process.env.PORT) || 8787;
const MAX_ROOM_PLAYERS = 4;
const MAX_MESSAGE_BYTES = 16 * 1024;
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_ALLOWED_ORIGINS = [
  "https://nornttyy.github.io",
  "http://localhost:8766",
  "http://127.0.0.1:8766",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
];
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const rooms = new Map();
const clients = new Set();

function text(value, maximumLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maximumLength);
}

function clampNumber(value, minimum, maximum, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(minimum, Math.min(maximum, number))
    : fallback;
}

function createRoomCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let code = "";
    const bytes = crypto.randomBytes(6);
    for (const byte of bytes) code += ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length];
    if (!rooms.has(code)) return code;
  }
  return crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
}

function hashPassword(password) {
  if (!password) return null;
  const salt = crypto.randomBytes(16);
  const digest = crypto.scryptSync(password, salt, 32);
  return `${salt.toString("hex")}:${digest.toString("hex")}`;
}

function passwordMatches(password, storedPassword) {
  if (!storedPassword) return !password;
  const [saltHex, digestHex] = storedPassword.split(":");
  if (!saltHex || !digestHex) return false;
  const expected = Buffer.from(digestHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function roomSummary(room) {
  return {
    id: room.id,
    name: room.name,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
    locked: Boolean(room.passwordHash),
    createdAt: room.createdAt
  };
}

function publicRooms() {
  return [...rooms.values()]
    .filter((room) => room.players.size > 0)
    .sort((left, right) => right.players.size - left.players.size || left.createdAt - right.createdAt)
    .map(roomSummary);
}

function send(client, payload) {
  if (client.ws.readyState !== WebSocket.OPEN) return;
  client.ws.send(JSON.stringify(payload));
}

function sendError(client, code, message, requestId) {
  send(client, { type: "error", code, message, requestId });
}

function broadcastRoomList() {
  const payload = { type: "rooms", rooms: publicRooms() };
  for (const client of clients) send(client, payload);
}

function roomMember(client) {
  return {
    playerId: client.id,
    nickname: client.nickname,
    state: client.playerState
  };
}

function broadcastRoomState(room) {
  const payload = {
    type: "room_state",
    room: roomSummary(room),
    players: [...room.players].map(roomMember)
  };
  for (const member of room.players) send(member, payload);
}

function leaveRoom(client, notifyClient = false) {
  if (!client.roomId) return;
  const room = rooms.get(client.roomId);
  client.roomId = null;
  client.playerState = null;
  if (!room) return;

  room.players.delete(client);
  if (room.ownerId === client.id) {
    room.ownerId = room.players.values().next().value?.id || null;
  }
  if (room.players.size === 0) {
    rooms.delete(room.id);
  } else {
    for (const member of room.players) {
      send(member, {
        type: "player_left",
        playerId: client.id,
        nickname: client.nickname
      });
    }
    broadcastRoomState(room);
  }
  if (notifyClient) send(client, { type: "left_room" });
  broadcastRoomList();
}

function joinRoom(client, room, requestId) {
  if (client.roomId) leaveRoom(client);
  room.players.add(client);
  client.roomId = room.id;
  client.playerState = null;
  send(client, {
    type: "room_joined",
    requestId,
    selfId: client.id,
    room: {
      ...roomSummary(room),
      seed: room.seed
    },
    players: [...room.players].map(roomMember)
  });
  for (const member of room.players) {
    if (member === client) continue;
    send(member, {
      type: "player_joined",
      player: roomMember(client)
    });
  }
  broadcastRoomState(room);
  broadcastRoomList();
}

function createRoom(client, message, requestId, automatic = false) {
  const password = text(message.password, 32);
  const maxPlayers = Math.round(clampNumber(message.maxPlayers, 2, MAX_ROOM_PLAYERS, MAX_ROOM_PLAYERS));
  const fallbackName = automatic ? `${client.nickname}的快速房间` : `${client.nickname}的房间`;
  const room = {
    id: createRoomCode(),
    name: text(message.name, 24) || fallbackName,
    passwordHash: hashPassword(password),
    maxPlayers,
    seed: crypto.randomInt(1, 2_147_483_647),
    ownerId: client.id,
    createdAt: Date.now(),
    players: new Set()
  };
  rooms.set(room.id, room);
  joinRoom(client, room, requestId);
}

function sanitizePlayerState(state) {
  if (!state || typeof state !== "object") return null;
  return {
    x: clampNumber(state.x, 0, 144000, 72024),
    y: clampNumber(state.y, 0, 144000, 72134),
    classRow: Math.round(clampNumber(state.classRow, 0, 5, 0)),
    moving: Boolean(state.moving),
    dirX: clampNumber(state.dirX, -1, 1, 0),
    dirY: clampNumber(state.dirY, -1, 1, -1),
    animation: clampNumber(state.animation, 0, 1_000_000, 0),
    flashlight: Boolean(state.flashlight),
    health: Math.round(clampNumber(state.health, 0, 100, 100)),
    heldType: text(state.heldType, 24).replace(/[^a-z0-9_]/gi, ""),
    emote: ["thunder_spin", "de_dance", "wave"].includes(state.emote) ? state.emote : ""
  };
}

function rateLimited(client) {
  const now = Date.now();
  if (now - client.messageWindowStartedAt >= 1000) {
    client.messageWindowStartedAt = now;
    client.messageCount = 0;
  }
  client.messageCount += 1;
  return client.messageCount > 45;
}

function handleMessage(client, rawData) {
  if (rawData.length > MAX_MESSAGE_BYTES || rateLimited(client)) {
    client.ws.close(1008, "消息过多");
    return;
  }

  let message;
  try {
    message = JSON.parse(rawData.toString());
  } catch {
    sendError(client, "BAD_MESSAGE", "服务器没有看懂这条消息");
    return;
  }
  const requestId = text(message.requestId, 64) || undefined;

  if (message.type === "hello") {
    client.nickname = text(message.nickname, 14) || client.nickname;
    send(client, {
      type: "welcome",
      requestId,
      playerId: client.id,
      rooms: publicRooms()
    });
    return;
  }

  if (message.type === "list_rooms") {
    send(client, { type: "rooms", requestId, rooms: publicRooms() });
    return;
  }

  if (message.type === "create_room") {
    client.nickname = text(message.nickname, 14) || client.nickname;
    createRoom(client, message, requestId);
    return;
  }

  if (message.type === "quick_join") {
    client.nickname = text(message.nickname, 14) || client.nickname;
    const room = [...rooms.values()].find((candidate) => (
      !candidate.passwordHash && candidate.players.size < candidate.maxPlayers
    ));
    if (room) joinRoom(client, room, requestId);
    else createRoom(client, { name: "", password: "", maxPlayers: MAX_ROOM_PLAYERS }, requestId, true);
    return;
  }

  if (message.type === "join_room") {
    client.nickname = text(message.nickname, 14) || client.nickname;
    const roomId = text(message.roomId, 12).toUpperCase();
    const room = rooms.get(roomId);
    if (!room) {
      sendError(client, "ROOM_NOT_FOUND", "这个房间已经消失了", requestId);
      return;
    }
    if (room.players.size >= room.maxPlayers) {
      sendError(client, "ROOM_FULL", "这个房间已经满员", requestId);
      return;
    }
    if (!passwordMatches(text(message.password, 32), room.passwordHash)) {
      sendError(client, "WRONG_PASSWORD", "房间密码不正确", requestId);
      return;
    }
    joinRoom(client, room, requestId);
    return;
  }

  if (message.type === "leave_room") {
    leaveRoom(client, true);
    return;
  }

  if (message.type === "player_state") {
    const room = rooms.get(client.roomId);
    if (!room) return;
    const state = sanitizePlayerState(message.state);
    if (!state) return;
    client.playerState = state;
    const payload = {
      type: "player_state",
      playerId: client.id,
      nickname: client.nickname,
      state
    };
    for (const member of room.players) {
      if (member !== client) send(member, payload);
    }
  }
}

function requestOriginAllowed(request) {
  const origin = request.headers.origin;
  if (!origin) return process.env.NODE_ENV !== "production";
  return allowedOrigins.has(origin);
}

const server = http.createServer((request, response) => {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({
      ok: true,
      rooms: rooms.size,
      players: [...rooms.values()].reduce((total, room) => total + room.players.size, 0)
    }));
    return;
  }
  if (request.method === "GET" && request.url === "/api/rooms") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ rooms: publicRooms() }));
    return;
  }
  response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ error: "Not found" }));
});

const webSocketServer = new WebSocketServer({
  server,
  path: "/ws",
  maxPayload: MAX_MESSAGE_BYTES
});

webSocketServer.on("connection", (ws, request) => {
  if (!requestOriginAllowed(request)) {
    ws.close(1008, "Origin not allowed");
    return;
  }
  const client = {
    id: crypto.randomUUID(),
    ws,
    nickname: `旅人${crypto.randomInt(100, 1000)}`,
    roomId: null,
    playerState: null,
    alive: true,
    messageCount: 0,
    messageWindowStartedAt: Date.now()
  };
  clients.add(client);

  ws.on("pong", () => {
    client.alive = true;
  });
  ws.on("message", (data) => handleMessage(client, data));
  ws.on("close", () => {
    leaveRoom(client);
    clients.delete(client);
  });
  ws.on("error", () => {});
});

const heartbeat = setInterval(() => {
  for (const client of clients) {
    if (!client.alive) {
      client.ws.terminate();
      continue;
    }
    client.alive = false;
    client.ws.ping();
  }
}, 30_000);
heartbeat.unref();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`归林联机服务器已启动：http://0.0.0.0:${PORT}`);
});

function shutdown() {
  clearInterval(heartbeat);
  for (const client of clients) client.ws.close(1001, "服务器正在重启");
  webSocketServer.close(() => server.close(() => process.exit(0)));
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

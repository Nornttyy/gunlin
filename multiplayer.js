const PRODUCTION_SERVER_URL = "wss://gunlin-multiplayer-nornttyy.onrender.com/ws";
const REQUEST_TIMEOUT = 20_000;
const CONNECT_TIMEOUT = 75_000;

function browserServerUrl() {
  const queryUrl = new URLSearchParams(window.location.search).get("server");
  if (queryUrl && /^wss?:\/\//i.test(queryUrl)) return queryUrl;
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return "ws://localhost:8787/ws";
  }
  return PRODUCTION_SERVER_URL;
}

function requestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class GuilinMultiplayerClient extends EventTarget {
  constructor(url = browserServerUrl()) {
    super();
    this.url = url;
    this.socket = null;
    this.nickname = "";
    this.playerId = "";
    this.room = null;
    this.pendingRequests = new Map();
    this.connectPromise = null;
    this.intentionalClose = false;
  }

  get connected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  connect(nickname) {
    this.nickname = String(nickname || this.nickname || "").trim().slice(0, 14);
    if (this.connected) return Promise.resolve();
    if (this.connectPromise) return this.connectPromise;
    this.intentionalClose = false;
    this.emit("status", { status: "connecting" });

    this.connectPromise = new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.socket = socket;
      const timeout = window.setTimeout(() => {
        socket.close();
        reject(new Error("服务器启动时间过长，请稍后重试"));
      }, CONNECT_TIMEOUT);

      socket.addEventListener("open", () => {
        this.sendRaw({
          type: "hello",
          nickname: this.nickname,
          requestId: requestId()
        });
      });

      socket.addEventListener("message", (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === "welcome") {
          window.clearTimeout(timeout);
          this.playerId = message.playerId || "";
          this.emit("status", { status: "connected" });
          this.emit("rooms", { rooms: message.rooms || [] });
          resolve();
        }
        this.handleMessage(message);
      });

      socket.addEventListener("close", () => {
        window.clearTimeout(timeout);
        const error = new Error("与联机服务器的连接已断开");
        for (const pending of this.pendingRequests.values()) pending.reject(error);
        this.pendingRequests.clear();
        this.connectPromise = null;
        this.socket = null;
        this.playerId = "";
        if (!this.intentionalClose) this.emit("status", { status: "disconnected" });
        if (!this.intentionalClose) reject(error);
      }, { once: true });

      socket.addEventListener("error", () => {
        this.emit("status", { status: "error" });
      });
    });
    return this.connectPromise;
  }

  handleMessage(message) {
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const pending = this.pendingRequests.get(message.requestId);
      this.pendingRequests.delete(message.requestId);
      window.clearTimeout(pending.timeout);
      if (message.type === "error") pending.reject(new Error(message.message || "请求失败"));
      else pending.resolve(message);
    }

    if (message.type === "rooms") this.emit("rooms", { rooms: message.rooms || [] });
    if (message.type === "room_joined") {
      this.room = message.room || null;
      this.playerId = message.selfId || this.playerId;
      this.emit("room_joined", message);
    }
    if (message.type === "room_state") {
      this.room = message.room ? { ...this.room, ...message.room } : this.room;
      this.emit("room_state", message);
    }
    if (message.type === "player_joined") this.emit("player_joined", message);
    if (message.type === "player_left") this.emit("player_left", message);
    if (message.type === "player_state") this.emit("player_state", message);
    if (message.type === "left_room") {
      this.room = null;
      this.emit("left_room", message);
    }
    if (message.type === "error" && !message.requestId) this.emit("server_error", message);
  }

  sendRaw(payload) {
    if (!this.connected) return false;
    this.socket.send(JSON.stringify(payload));
    return true;
  }

  async request(type, payload = {}) {
    await this.connect(this.nickname);
    const id = requestId();
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error("服务器没有及时回应"));
      }, REQUEST_TIMEOUT);
      this.pendingRequests.set(id, { resolve, reject, timeout });
      this.sendRaw({ type, requestId: id, ...payload });
    });
  }

  listRooms() {
    return this.request("list_rooms");
  }

  quickJoin(nickname) {
    this.nickname = String(nickname || "").trim().slice(0, 14);
    return this.request("quick_join", { nickname: this.nickname });
  }

  createRoom({ nickname, name, password, maxPlayers = 4 }) {
    this.nickname = String(nickname || "").trim().slice(0, 14);
    return this.request("create_room", {
      nickname: this.nickname,
      name,
      password,
      maxPlayers
    });
  }

  joinRoom({ nickname, roomId, password = "" }) {
    this.nickname = String(nickname || "").trim().slice(0, 14);
    return this.request("join_room", {
      nickname: this.nickname,
      roomId,
      password
    });
  }

  leaveRoom() {
    if (this.room) this.sendRaw({ type: "leave_room" });
    this.room = null;
  }

  sendPlayerState(state) {
    if (!this.room) return;
    this.sendRaw({ type: "player_state", state });
  }

  disconnect() {
    this.intentionalClose = true;
    this.room = null;
    this.socket?.close(1000, "返回主菜单");
    this.socket = null;
    this.connectPromise = null;
  }
}

export function defaultMultiplayerServerUrl() {
  return browserServerUrl();
}

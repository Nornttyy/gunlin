import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import test from "node:test";
import WebSocket from "ws";

const TEST_PORT = 18787;
const HTTP_URL = `http://127.0.0.1:${TEST_PORT}`;
const WS_URL = `ws://127.0.0.1:${TEST_PORT}/ws`;

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${HTTP_URL}/health`);
      if (response.ok) return;
    } catch {
      // 服务器进程还在启动，稍后继续检查。
    }
    await wait(100);
  }
  throw new Error("测试服务器没有启动");
}

async function openClient() {
  const socket = new WebSocket(WS_URL, {
    headers: { Origin: "https://nornttyy.github.io" }
  });
  const inbox = [];
  const listeners = [];
  socket.on("message", (raw) => {
    const message = JSON.parse(raw.toString());
    const listenerIndex = listeners.findIndex((listener) => listener.predicate(message));
    if (listenerIndex >= 0) {
      const [listener] = listeners.splice(listenerIndex, 1);
      clearTimeout(listener.timeout);
      listener.resolve(message);
      return;
    }
    inbox.push(message);
  });
  await new Promise((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });
  return {
    socket,
    next(predicate, timeoutMs = 2500) {
      const inboxIndex = inbox.findIndex(predicate);
      if (inboxIndex >= 0) return Promise.resolve(inbox.splice(inboxIndex, 1)[0]);
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const index = listeners.findIndex((listener) => listener.resolve === resolve);
          if (index >= 0) listeners.splice(index, 1);
          reject(new Error("等待服务器消息超时"));
        }, timeoutMs);
        listeners.push({ predicate, resolve, reject, timeout });
      });
    }
  };
}

test("公开房间支持密码和玩家状态同步", { timeout: 15_000 }, async (context) => {
  const server = spawn(process.execPath, ["index.js"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      NODE_ENV: "production",
      ALLOWED_ORIGINS: "https://nornttyy.github.io"
    },
    stdio: "ignore"
  });
  context.after(() => server.kill("SIGTERM"));
  await waitForServer();

  const first = await openClient();
  const second = await openClient();
  context.after(() => {
    first.socket.close();
    second.socket.close();
  });

  first.socket.send(JSON.stringify({ type: "hello", nickname: "甲", requestId: "hello-a" }));
  second.socket.send(JSON.stringify({ type: "hello", nickname: "乙", requestId: "hello-b" }));
  await first.next((message) => message.type === "welcome");
  await second.next((message) => message.type === "welcome");

  first.socket.send(JSON.stringify({
    type: "create_room",
    requestId: "create",
    nickname: "甲",
    name: "测试木屋",
    password: "1234",
    maxPlayers: 4
  }));
  const created = await first.next((message) => (
    message.type === "room_joined" && message.requestId === "create"
  ));
  assert.equal(created.room.name, "测试木屋");
  assert.equal(created.room.locked, true);
  assert.equal(created.room.playerCount, 1);

  second.socket.send(JSON.stringify({
    type: "join_room",
    requestId: "wrong",
    nickname: "乙",
    roomId: created.room.id,
    password: "错误"
  }));
  const wrongPassword = await second.next((message) => message.requestId === "wrong");
  assert.equal(wrongPassword.type, "error");
  assert.equal(wrongPassword.code, "WRONG_PASSWORD");

  second.socket.send(JSON.stringify({
    type: "join_room",
    requestId: "correct",
    nickname: "乙",
    roomId: created.room.id,
    password: "1234"
  }));
  const joined = await second.next((message) => (
    message.type === "room_joined" && message.requestId === "correct"
  ));
  assert.equal(joined.room.playerCount, 2);

  first.socket.send(JSON.stringify({
    type: "player_state",
    state: {
      x: 72030,
      y: 72140,
      classRow: 2,
      moving: true,
      dirX: 1,
      dirY: 0,
      flashlight: true,
      health: 87,
      heldType: "axe"
    }
  }));
  const synchronized = await second.next((message) => message.type === "player_state");
  assert.equal(synchronized.nickname, "甲");
  assert.equal(synchronized.state.x, 72030);
  assert.equal(synchronized.state.classRow, 2);
  assert.equal(synchronized.state.heldType, "axe");
});

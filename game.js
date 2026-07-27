const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const WORLD = { width: 2400, height: 1600, margin: 72 };
const DAY_LENGTH = 62;
const NIGHT_LENGTH = 42;
const CYCLE_LENGTH = DAY_LENGTH + NIGHT_LENGTH;

const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const gameOverPanel = document.getElementById("gameOver");
const messageElement = document.getElementById("message");
const classButtons = [...document.querySelectorAll(".class-button")];
const phaseLabel = document.getElementById("phaseLabel");
const dayLabel = document.getElementById("dayLabel");
const healthLabel = document.getElementById("healthLabel");
const resourceLabel = document.getElementById("resourceLabel");
const flashlightLabel = document.getElementById("flashlightLabel");

const sprite = new Image();
sprite.src = "assets/player.png";

const keys = new Set();
let state = "title";
let lastTime = 0;
let elapsed = 0;
let dayNumber = 1;
let wasNight = false;
let messageTimer = 0;
let spawnTimer = 0;
let resourceId = 0;
let barricadeId = 0;

const player = {
  x: 330,
  y: 820,
  radius: 10,
  speed: 132,
  health: 100,
  wood: 12,
  stone: 4,
  flashlight: true,
  classRow: 0,
  moving: false,
  dirX: 0,
  dirY: -1,
  animation: 0,
  attackTimer: 0,
  attackCooldown: 0,
  hurtTimer: 0
};

const resources = [];
const monsters = [];
const barricades = [];
const camera = { x: 0, y: 0 };
const campfire = { x: 330, y: 710 };

function hash(index) {
  const value = Math.sin(index * 91.173 + 12.91) * 43758.5453;
  return value - Math.floor(value);
}

function resetWorld() {
  resources.length = 0;
  monsters.length = 0;
  barricades.length = 0;
  resourceId = 0;
  barricadeId = 0;
  for (let i = 0; i < 78; i += 1) {
    const x = 120 + hash(i * 3 + 1) * 2160;
    const y = 120 + hash(i * 3 + 2) * 1360;
    if (Math.hypot(x - campfire.x, y - campfire.y) < 230) continue;
    const roll = hash(i * 3 + 3);
    resources.push({
      id: resourceId++,
      x,
      y,
      type: roll < 0.58 ? "tree" : roll < 0.82 ? "rock" : "berry",
      radius: roll < 0.58 ? 24 : roll < 0.82 ? 15 : 18
    });
  }
}

function startGame() {
  state = "game";
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameOverPanel.classList.add("hidden");
  elapsed = 0;
  dayNumber = 1;
  wasNight = false;
  spawnTimer = 4;
  Object.assign(player, { x: 330, y: 820, health: 100, wood: 12, stone: 4, flashlight: true, attackTimer: 0, attackCooldown: 0 });
  resetWorld();
  showMessage("白天开始：先收集材料并建造营地");
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function endGame() {
  state = "over";
  gameOverPanel.classList.remove("hidden");
}

function showMessage(text, duration = 2.4) {
  messageElement.textContent = text;
  messageTimer = duration;
}

function isNight() {
  return elapsed % CYCLE_LENGTH >= DAY_LENGTH;
}

function currentPhaseProgress() {
  const cycle = elapsed % CYCLE_LENGTH;
  return isNight() ? (cycle - DAY_LENGTH) / NIGHT_LENGTH : cycle / DAY_LENGTH;
}

function update(delta) {
  elapsed += delta;
  dayNumber = Math.floor(elapsed / CYCLE_LENGTH) + 1;
  const night = isNight();

  if (night !== wasNight) {
    wasNight = night;
    showMessage(night ? "夜幕降临：森林里的东西醒了" : "天亮了：怪物正在退回深林");
    if (night) spawnMonster();
  }

  updatePlayer(delta);
  updateMonsters(delta, night);
  spawnTimer -= delta;
  if (night && spawnTimer <= 0) {
    spawnMonster();
    spawnTimer = Math.max(5, 15 - dayNumber * 0.8);
  }

  if (messageTimer > 0) {
    messageTimer -= delta;
    if (messageTimer <= 0) messageElement.textContent = "";
  }

  player.attackTimer = Math.max(0, player.attackTimer - delta);
  player.attackCooldown = Math.max(0, player.attackCooldown - delta);
  player.hurtTimer = Math.max(0, player.hurtTimer - delta);
  updateHud();
}

function updatePlayer(delta) {
  let x = 0;
  let y = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) y -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) y += 1;
  const length = Math.hypot(x, y) || 1;
  x /= length;
  y /= length;
  player.moving = Math.abs(x) + Math.abs(y) > 0;
  if (player.moving) {
    player.dirX = x;
    player.dirY = y;
    player.animation += delta * (keys.has("ShiftLeft") || keys.has("ShiftRight") ? 11 : 8);
  }

  const sprinting = keys.has("ShiftLeft") || keys.has("ShiftRight");
  const speed = player.speed * (sprinting ? 1.45 : 1);
  const nextX = player.x + x * speed * delta;
  const nextY = player.y + y * speed * delta;
  if (!collides(nextX, player.y)) player.x = nextX;
  if (!collides(player.x, nextY)) player.y = nextY;
  player.x = Math.max(WORLD.margin, Math.min(WORLD.width - WORLD.margin, player.x));
  player.y = Math.max(WORLD.margin, Math.min(WORLD.height - WORLD.margin, player.y));

  if (player.health <= 0) endGame();
}

function collides(x, y) {
  for (const barricade of barricades) {
    if (Math.abs(x - barricade.x) < barricade.width / 2 + player.radius && Math.abs(y - barricade.y) < barricade.height / 2 + player.radius) return true;
  }
  for (const resource of resources) {
    if (resource.type === "berry") continue;
    if (Math.hypot(x - resource.x, y - resource.y) < resource.radius + player.radius - 2) return true;
  }
  return false;
}

function interact() {
  let closest = null;
  let distance = 48;
  for (const resource of resources) {
    const current = Math.hypot(player.x - resource.x, player.y - resource.y);
    if (current < distance) {
      distance = current;
      closest = resource;
    }
  }
  if (!closest) {
    if (Math.hypot(player.x - campfire.x, player.y - campfire.y) < 72) {
      player.health = Math.min(100, player.health + 8);
      showMessage("篝火让你平静了一点");
    } else {
      showMessage("附近没有可以互动的东西", 1.2);
    }
    return;
  }

  const index = resources.indexOf(closest);
  resources.splice(index, 1);
  if (closest.type === "tree") {
    player.wood += 3;
    showMessage("获得木材 ×3");
  } else if (closest.type === "rock") {
    player.stone += 2;
    showMessage("获得石头 ×2");
  } else {
    player.health = Math.min(100, player.health + 10);
    showMessage("吃下浆果，恢复生命");
  }
}

function buildBarricade() {
  if (player.wood < 3 || player.stone < 1) {
    showMessage("建造需要木材 ×3、石头 ×1");
    return;
  }
  const x = player.x + player.dirX * 42;
  const y = player.y + player.dirY * 42;
  barricades.push({ id: barricadeId++, x, y, width: 54, height: 16 });
  player.wood -= 3;
  player.stone -= 1;
  showMessage("建造了一段木墙");
}

function attack() {
  if (player.attackCooldown > 0) return;
  player.attackCooldown = 0.38;
  player.attackTimer = 0.16;
  let hit = false;
  for (const monster of monsters) {
    const dx = monster.x - player.x;
    const dy = monster.y - player.y;
    if (Math.hypot(dx, dy) < 58) {
      monster.health -= 35;
      monster.x += (dx / (Math.hypot(dx, dy) || 1)) * 24;
      monster.y += (dy / (Math.hypot(dx, dy) || 1)) * 24;
      hit = true;
    }
  }
  showMessage(hit ? "击中了怪物" : "攻击落空", 0.7);
}

function spawnMonster() {
  const side = Math.floor(Math.random() * 4);
  const x = side === 0 ? 100 : side === 1 ? WORLD.width - 100 : 160 + Math.random() * (WORLD.width - 320);
  const y = side === 2 ? 100 : side === 3 ? WORLD.height - 100 : 160 + Math.random() * (WORLD.height - 320);
  monsters.push({ x, y, radius: 13, health: 70 + dayNumber * 7, speed: 37 + dayNumber * 3, attackCooldown: 0, hurtTimer: 0 });
}

function updateMonsters(delta, night) {
  for (let i = monsters.length - 1; i >= 0; i -= 1) {
    const monster = monsters[i];
    if (!night) {
      monster.x += (monster.x < WORLD.width / 2 ? -1 : 1) * 20 * delta;
      monster.y += (monster.y < WORLD.height / 2 ? -1 : 1) * 20 * delta;
      if (monster.x < 40 || monster.x > WORLD.width - 40 || monster.y < 40 || monster.y > WORLD.height - 40) monsters.splice(i, 1);
      continue;
    }
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance > 27) {
      monster.x += (dx / distance) * monster.speed * delta;
      monster.y += (dy / distance) * monster.speed * delta;
    } else {
      monster.attackCooldown -= delta;
      if (monster.attackCooldown <= 0 && player.hurtTimer <= 0) {
        player.health = Math.max(0, player.health - 12);
        player.hurtTimer = 0.8;
        monster.attackCooldown = 1.1;
        showMessage("你被怪物抓伤了", 0.8);
      }
    }
    monster.hurtTimer = Math.max(0, monster.hurtTimer - delta);
    if (monster.health <= 0) {
      monsters.splice(i, 1);
      if (Math.random() < .45) player.wood += 1;
      showMessage("怪物倒下了");
    }
  }
}

function updateHud() {
  phaseLabel.textContent = isNight() ? "夜晚" : "白天";
  dayLabel.textContent = `第 ${dayNumber} 天`;
  healthLabel.textContent = `生命 ${Math.max(0, Math.round(player.health))}`;
  resourceLabel.textContent = `木材 ${player.wood}　石头 ${player.stone}`;
  flashlightLabel.textContent = `手电筒 ${player.flashlight ? "开" : "关"}`;
}

function render() {
  const targetX = Math.max(0, Math.min(WORLD.width - W, player.x - W / 2));
  const targetY = Math.max(0, Math.min(WORLD.height - H, player.y - H / 2));
  camera.x += (targetX - camera.x) * 0.12;
  camera.y += (targetY - camera.y) * 0.12;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));
  drawForest();
  drawCampfire();
  drawBarricades();
  drawResources();
  drawMonsters();
  drawPlayer();
  ctx.restore();

  if (isNight()) drawNightOverlay();
}

function drawForest() {
  ctx.fillStyle = "#294d39";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  for (let x = 0; x < WORLD.width; x += 48) {
    for (let y = 0; y < WORLD.height; y += 48) {
      const value = Math.sin(x * 0.037 + y * 0.019) + Math.cos(x * 0.011 - y * 0.047);
      ctx.fillStyle = value > 0.65 ? "#31583e" : value < -0.7 ? "#244534" : "#2c513b";
      ctx.fillRect(x, y, 48, 48);
    }
  }
  ctx.fillStyle = "#9a8058";
  ctx.fillRect(0, 790, WORLD.width, 34);
  ctx.fillRect(790, 0, 34, WORLD.height);
  ctx.fillStyle = "#b49a6b";
  ctx.fillRect(0, 796, WORLD.width, 22);
  ctx.fillRect(796, 0, 22, WORLD.height);
  ctx.strokeStyle = "#526f4c";
  ctx.lineWidth = 4;
  ctx.strokeRect(WORLD.margin, WORLD.margin, WORLD.width - WORLD.margin * 2, WORLD.height - WORLD.margin * 2);
}

function drawCampfire() {
  ctx.fillStyle = "#593b2a";
  ctx.fillRect(campfire.x - 22, campfire.y - 5, 44, 10);
  ctx.fillRect(campfire.x - 5, campfire.y - 22, 10, 44);
  ctx.fillStyle = "#f2b94b";
  ctx.beginPath();
  ctx.arc(campfire.x, campfire.y - 15, 15 + Math.sin(elapsed * 8) * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4e09c";
  ctx.beginPath();
  ctx.arc(campfire.x, campfire.y - 18, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawResources() {
  for (const resource of resources) {
    if (resource.type === "tree") {
      ctx.fillStyle = "#5c3d2b";
      ctx.fillRect(resource.x - 7, resource.y - 2, 14, 36);
      ctx.fillStyle = "#153b2c";
      ctx.beginPath(); ctx.arc(resource.x - 12, resource.y - 18, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1f593a";
      ctx.beginPath(); ctx.arc(resource.x + 13, resource.y - 12, 25, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2e7548";
      ctx.beginPath(); ctx.arc(resource.x, resource.y - 34, 21, 0, Math.PI * 2); ctx.fill();
    } else if (resource.type === "rock") {
      ctx.fillStyle = "#7d8a7b";
      ctx.beginPath(); ctx.moveTo(resource.x - 16, resource.y + 8); ctx.lineTo(resource.x - 10, resource.y - 10); ctx.lineTo(resource.x + 7, resource.y - 16); ctx.lineTo(resource.x + 17, resource.y + 3); ctx.lineTo(resource.x + 6, resource.y + 13); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#a3b09b";
      ctx.fillRect(resource.x - 7, resource.y - 7, 8, 5);
    } else {
      ctx.fillStyle = "#245d3d";
      ctx.beginPath(); ctx.arc(resource.x, resource.y, 19, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8b334d";
      ctx.fillRect(resource.x - 8, resource.y - 2, 6, 6); ctx.fillRect(resource.x + 2, resource.y + 4, 6, 6);
    }
  }
}

function drawBarricades() {
  for (const barricade of barricades) {
    ctx.fillStyle = "#6d452d";
    ctx.fillRect(barricade.x - barricade.width / 2, barricade.y - barricade.height / 2, barricade.width, barricade.height);
    ctx.fillStyle = "#a06c3f";
    ctx.fillRect(barricade.x - barricade.width / 2, barricade.y - 2, barricade.width, 4);
  }
}

function drawMonsters() {
  for (const monster of monsters) {
    ctx.save();
    ctx.globalAlpha = monster.hurtTimer > 0 ? .5 : 1;
    ctx.fillStyle = "#14191b";
    ctx.beginPath(); ctx.arc(monster.x, monster.y, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d05a4e";
    ctx.fillRect(monster.x - 8, monster.y - 3, 5, 4); ctx.fillRect(monster.x + 3, monster.y - 3, 5, 4);
    ctx.restore();
  }
}

function drawPlayer() {
  const drawX = player.x - 24;
  const drawY = player.y - 37;
  if (sprite.complete && sprite.naturalWidth >= 128 && sprite.naturalHeight >= 96) {
    ctx.save();
    const frameRow = player.classRow * 16;
    const frameColumn = player.moving ? 2 + (Math.floor(player.animation) % 6) : (Math.floor(elapsed * 2) % 2);
    // 这组手绘帧默认朝右，所以向左移动时才需要水平翻转。
    if (player.dirX < -0.1) {
      ctx.translate(player.x * 2, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, frameColumn * 16, frameRow, 16, 16, player.x - 24, drawY, 48, 48);
    } else {
      ctx.drawImage(sprite, frameColumn * 16, frameRow, 16, 16, drawX, drawY, 48, 48);
    }
    ctx.restore();
  } else {
    ctx.fillStyle = player.hurtTimer > 0 ? "#f08f7b" : "#c6e7b8";
    ctx.fillRect(player.x - 10, player.y - 24, 20, 24);
  }
  if (player.attackTimer > 0) {
    ctx.strokeStyle = "#f2d596";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(player.x + player.dirX * 20, player.y + player.dirY * 20, 23, -0.8, 0.8);
    ctx.stroke();
  }
}

function drawNightOverlay() {
  const px = player.x - camera.x;
  const py = player.y - camera.y - 12;
  const dark = player.flashlight ? 0.72 : 0.9;
  const gradient = ctx.createRadialGradient(px, py, 30, px, py, player.flashlight ? 220 : 80);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.55, `rgba(4,8,10,${dark * .35})`);
  gradient.addColorStop(1, `rgba(3,6,8,${dark})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function loop(now) {
  if (state !== "game") return;
  const delta = Math.min(0.04, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;
  update(delta);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (state !== "game") return;
  if (event.code === "KeyE") interact();
  if (event.code === "KeyB") buildBarricade();
  if (event.code === "Space") attack();
  if (event.code === "KeyF") {
    player.flashlight = !player.flashlight;
    showMessage(player.flashlight ? "打开手电筒" : "关闭手电筒", 1);
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

classButtons.forEach((button) => {
  button.addEventListener("click", () => {
    player.classRow = Number(button.dataset.class || 0);
    classButtons.forEach((item) => item.classList.toggle("selected", item === button));
  });
});

updateHud();

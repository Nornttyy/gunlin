const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const WORLD = { width: 2400, height: 1600, margin: 72 };
const DAY_LENGTH = 62;
const NIGHT_LENGTH = 42;
const CYCLE_LENGTH = DAY_LENGTH + NIGHT_LENGTH;
const BUILD_GRID_SIZE = 48;
const DEFENSE_COLLIDER = {
  wall: { length: 48, thickness: 15, edgeOffset: 16 },
  door: { length: 48, thickness: 9, edgeOffset: 16 }
};
const SOLID_BUILDING_COLLIDER = {
  chest: { width: 44, height: 42, offsetY: 2 },
  workbench: { width: 44, height: 42, offsetY: 2 }
};

const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");
const loadingStatus = document.getElementById("loadingStatus");
const loadingText = document.getElementById("loadingText");
const loadingCount = document.getElementById("loadingCount");
const loadingProgress = document.getElementById("loadingProgress");
const retryAssetsButton = document.getElementById("retryAssetsButton");
const restartButton = document.getElementById("restartButton");
const gameOverPanel = document.getElementById("gameOver");
const messageElement = document.getElementById("message");
const classButtons = [...document.querySelectorAll(".class-button")];
const phaseLabel = document.getElementById("phaseLabel");
const dayLabel = document.getElementById("dayLabel");
const healthLabel = document.getElementById("healthLabel");
const resourceLabel = document.getElementById("resourceLabel");
const flashlightLabel = document.getElementById("flashlightLabel");
const buildingLabel = document.getElementById("buildingLabel");
const inventoryButton = document.getElementById("inventoryButton");
const inventoryButtonLabel = document.getElementById("inventoryButtonLabel");
const inventoryPanel = document.getElementById("inventoryPanel");
const inventoryWoodCount = document.getElementById("inventoryWoodCount");
const inventoryStoneCount = document.getElementById("inventoryStoneCount");
const inventoryBerryCount = document.getElementById("inventoryBerryCount");
const inventoryCapacity = document.getElementById("inventoryCapacity");
const useBerryButton = document.getElementById("useBerryButton");
const quickSlots = [...document.querySelectorAll(".quick-slot")];
const quickBerryCount = document.getElementById("quickBerryCount");

const ASSET_VERSION = "20260728-assets2";
const sprite = new Image();
const worldSprite = new Image();
sprite.decoding = "async";
worldSprite.decoding = "async";

// 建筑素材在 128×96 图集的第 4 行（每格 16×16）。
const BUILDING_ROW = 3;
const BUILDING_FRAME = {
  campfire: 0,
  wall: 1,
  doorClosed: 2,
  doorOpen: 3,
  floor: 4,
  chest: 5,
  workbench: 6,
  trap: 7
};

const TERRAIN_FRAME = {
  grass: 0,
  sand: 4,
  water: 5
};

const PROP_FRAME = {
  bareBush: 0,
  berryBush: 1,
  stump: 2,
  tallGrass: 3,
  stone: 6
};

const BUILD_TYPES = [
  { type: "wall", label: "木墙", cost: { wood: 3, stone: 1 }, health: 120 },
  { type: "door", label: "木门", cost: { wood: 4, stone: 1 }, health: 90 },
  { type: "floor", label: "木地板", cost: { wood: 2, stone: 0 } },
  { type: "chest", label: "储物箱", cost: { wood: 5, stone: 0 } },
  { type: "workbench", label: "工作台", cost: { wood: 6, stone: 2 } },
  { type: "trap", label: "陷阱", cost: { wood: 2, stone: 1 }, uses: 3 }
];

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
let doorId = 0;
let buildingId = 0;
let selectedBuild = 0;
let selectedQuickSlot = -1;
let inventoryOpen = false;
let assetsReady = false;
let assetsLoading = false;

const player = {
  x: 330,
  y: 820,
  radius: 10,
  speed: 132,
  health: 100,
  wood: 12,
  stone: 4,
  berry: 0,
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
const doors = [];
const buildings = [];
const camera = { x: 0, y: 0 };
const campfire = { x: 330, y: 710 };

function hash(index) {
  const value = Math.sin(index * 91.173 + 12.91) * 43758.5453;
  return value - Math.floor(value);
}

function assetUrl(path, retry = 0) {
  const retryText = retry > 0 ? `&retry=${retry}` : "";
  return `${path}?v=${ASSET_VERSION}${retryText}`;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// 图片第一次没拿到时会自动换一个地址再试，最多尝试三次。
async function loadImageWithRetry(image, path, attempts = 3) {
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error(`${path} 加载失败`));
        image.src = assetUrl(path, attempt);
      });
      if (image.decode) await image.decode().catch(() => {});
      return image;
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await wait(350 * (attempt + 1));
    }
  }
  throw lastError;
}

// 字体也会等待并重试，成功后才让玩家进入游戏。
async function loadFontWithRetry(attempts = 3) {
  if (!("FontFace" in window) || !document.fonts) return null;
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const url = assetUrl("assets/ark-pixel-12px-zh_cn.woff2", attempt);
      const font = new FontFace("ArkPixel", `url("${url}") format("woff2")`, { style: "normal", weight: "400" });
      await font.load();
      document.fonts.add(font);
      return font;
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await wait(350 * (attempt + 1));
    }
  }
  throw lastError;
}

function showLoadingProgress(loaded, total, label) {
  loadingText.textContent = label;
  loadingCount.textContent = `${loaded} / ${total}`;
  loadingProgress.style.width = `${Math.round((loaded / total) * 100)}%`;
}

async function loadGameAssets() {
  if (assetsLoading) return;
  assetsLoading = true;
  assetsReady = false;
  startButton.disabled = true;
  startButton.textContent = "素材加载中…";
  retryAssetsButton.classList.add("hidden");
  loadingStatus.classList.remove("ready", "failed");
  showLoadingProgress(0, 3, "正在准备像素素材…");

  let loaded = 0;
  const jobs = [
    ["玩家图", () => loadImageWithRetry(sprite, "assets/player.png")],
    ["场景图", () => loadImageWithRetry(worldSprite, "assets/forest-assets.png")],
    ["像素字体", loadFontWithRetry]
  ];
  const results = await Promise.allSettled(jobs.map(async ([label, load]) => {
    const result = await load();
    loaded += 1;
    showLoadingProgress(loaded, jobs.length, `已加载：${label}`);
    return result;
  }));

  const failed = results.filter((result) => result.status === "rejected");
  assetsLoading = false;
  if (failed.length === 0) {
    assetsReady = true;
    loadingStatus.classList.add("ready");
    showLoadingProgress(jobs.length, jobs.length, "素材准备完成");
    startButton.disabled = false;
    startButton.textContent = "进入森林";
    return;
  }

  loadingStatus.classList.add("failed");
  loadingText.textContent = `${failed.length} 个素材加载失败`;
  startButton.textContent = "素材未准备完成";
  retryAssetsButton.classList.remove("hidden");
}

function resetWorld() {
  resources.length = 0;
  monsters.length = 0;
  barricades.length = 0;
  doors.length = 0;
  buildings.length = 0;
  resourceId = 0;
  barricadeId = 0;
  doorId = 0;
  buildingId = 0;
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
  // 先放一扇测试门，后续可由建造系统生成更多门。
  doors.push({
    id: doorId++,
    x: 790,
    y: 790,
    vertical: false,
    rotation: 0,
    open: false,
    animation: 0,
    health: 90,
    maxHealth: 90
  });
}

function startGame() {
  if (!assetsReady) {
    loadGameAssets();
    return;
  }
  state = "game";
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameOverPanel.classList.add("hidden");
  elapsed = 0;
  dayNumber = 1;
  wasNight = false;
  spawnTimer = 4;
  selectedBuild = 0;
  selectedQuickSlot = -1;
  Object.assign(player, { x: 330, y: 820, health: 100, wood: 12, stone: 4, berry: 0, flashlight: true, attackTimer: 0, attackCooldown: 0 });
  setInventoryOpen(false);
  resetWorld();
  showMessage("白天开始：按 I 可以打开物品栏");
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function endGame() {
  state = "over";
  setInventoryOpen(false);
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

// 黄昏和黎明会慢慢变暗、变亮，避免画面突然跳黑。
function nightIntensity() {
  const cycle = elapsed % CYCLE_LENGTH;
  const transition = 8;
  if (cycle < DAY_LENGTH - transition) return 0;
  if (cycle < DAY_LENGTH) {
    const progress = (cycle - DAY_LENGTH + transition) / transition;
    return progress * progress * (3 - 2 * progress);
  }
  if (cycle < CYCLE_LENGTH - transition) return 1;
  const progress = (cycle - CYCLE_LENGTH + transition) / transition;
  const smooth = progress * progress * (3 - 2 * progress);
  return 1 - smooth;
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
  updateDoors(delta);
  updateTraps(delta);
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

// 木墙和木门的有效像素靠近图块边缘，碰撞盒也要跟着旋转到同一条边上。
function getDefenseCollider(item, type) {
  const shape = DEFENSE_COLLIDER[type];
  const rotation = item.rotation || 0;
  const vertical = Math.abs(Math.sin(rotation)) > 0.5;
  return {
    x: item.x - Math.sin(rotation) * shape.edgeOffset,
    y: item.y + Math.cos(rotation) * shape.edgeOffset,
    width: vertical ? shape.thickness : shape.length,
    height: vertical ? shape.length : shape.thickness
  };
}

function getSolidBuildingCollider(building) {
  const shape = SOLID_BUILDING_COLLIDER[building.type];
  if (!shape) return null;
  return {
    x: building.x,
    y: building.y + shape.offsetY,
    width: shape.width,
    height: shape.height
  };
}

function collides(x, y) {
  for (const door of doors) {
    if (door.animation < 0.82 && circleHitsRectangle(x, y, player.radius, getDefenseCollider(door, "door"))) return true;
  }
  for (const barricade of barricades) {
    if (circleHitsRectangle(x, y, player.radius, getDefenseCollider(barricade, "wall"))) return true;
  }
  for (const building of buildings) {
    const collider = getSolidBuildingCollider(building);
    if (collider && circleHitsRectangle(x, y, player.radius, collider)) return true;
  }
  for (const resource of resources) {
    if (resource.type === "berry") continue;
    if (Math.hypot(x - resource.x, y - resource.y) < resource.radius + player.radius - 2) return true;
  }
  return false;
}

function updateDoors(delta) {
  for (const door of doors) {
    const target = door.open ? 1 : 0;
    const speed = 5.5;
    if (door.animation < target) door.animation = Math.min(target, door.animation + delta * speed);
    if (door.animation > target) door.animation = Math.max(target, door.animation - delta * speed);
  }
}

function interact() {
  const nearbyDoor = doors.find((door) => Math.hypot(player.x - door.x, player.y - door.y) < 72);
  if (nearbyDoor) {
    nearbyDoor.open = !nearbyDoor.open;
    showMessage(nearbyDoor.open ? "木门打开了" : "木门关上了", 1.1);
    return;
  }
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
    player.berry += 1;
    showMessage("浆果已放进物品栏");
  }
}

// 背包打开时会暂停游戏，就像先把桌面上的玩具按下暂停键再整理盒子。
function setInventoryOpen(open) {
  inventoryOpen = open && state === "game";
  inventoryPanel.classList.toggle("hidden", !inventoryOpen);
  inventoryButton.classList.toggle("active", inventoryOpen);
  inventoryButton.setAttribute("aria-expanded", String(inventoryOpen));
  inventoryButtonLabel.textContent = inventoryOpen ? "关闭" : "背包";
  if (inventoryOpen) keys.clear();
  updateHud();
}

function useBerry() {
  if (state !== "game" || player.berry <= 0) {
    showMessage("背包里还没有浆果", 1.1);
    return;
  }
  if (player.health >= 100) {
    showMessage("生命已经满了，先把浆果留着吧", 1.3);
    return;
  }
  player.berry -= 1;
  player.health = Math.min(100, player.health + 12);
  showMessage("吃下浆果，恢复 12 点生命", 1.2);
  updateHud();
}

function buildBarricade() {
  if (player.wood < 3 || player.stone < 1) {
    showMessage("建造需要木材 ×3、石头 ×1");
    return;
  }
  const placement = getBuildPlacement();
  if (!canBuildAt(placement.x, placement.y)) return;
  barricades.push({
    id: barricadeId++,
    x: placement.x,
    y: placement.y,
    vertical: placement.vertical,
    rotation: placement.rotation,
    health: 120,
    maxHealth: 120
  });
  player.wood -= 3;
  player.stone -= 1;
  showMessage("建造了一段木墙");
}

function buildDoor() {
  if (player.wood < 4 || player.stone < 1) {
    showMessage("建造木门需要木材 ×4、石头 ×1");
    return;
  }
  const placement = getBuildPlacement();
  if (!canBuildAt(placement.x, placement.y)) return;
  doors.push({
    id: doorId++,
    x: placement.x,
    y: placement.y,
    vertical: placement.vertical,
    rotation: placement.rotation,
    open: false,
    animation: 0,
    health: 90,
    maxHealth: 90
  });
  player.wood -= 4;
  player.stone -= 1;
  showMessage("建造了一扇木门");
}

function buildProp(type, cost, label) {
  if (player.wood < cost.wood || player.stone < cost.stone) {
    const stoneText = cost.stone ? `、石头 ×${cost.stone}` : "";
    showMessage(`建造${label}需要木材 ×${cost.wood}${stoneText}`);
    return;
  }
  const placement = getBuildPlacement();
  if (!canBuildAt(placement.x, placement.y)) return;
  const building = { id: buildingId++, type, x: placement.x, y: placement.y };
  // 陷阱像一只有三颗牙的夹子，命中三次后就会坏掉。
  if (type === "trap") Object.assign(building, { uses: 3, cooldown: 0 });
  buildings.push(building);
  player.wood -= cost.wood;
  player.stone -= cost.stone;
  showMessage(`建造了${label}`);
}

function getBuildDirection() {
  if (Math.abs(player.dirX) > Math.abs(player.dirY)) {
    const x = player.dirX < 0 ? -1 : 1;
    return { x, y: 0, vertical: true, rotation: x < 0 ? -Math.PI / 2 : Math.PI / 2 };
  }
  const y = player.dirY < 0 ? -1 : 1;
  return { x: 0, y, vertical: false, rotation: y < 0 ? 0 : Math.PI };
}

// 建筑会贴在 48 像素网格上，鼠标所在方向决定相邻的目标格。
function getBuildPlacement() {
  const direction = getBuildDirection();
  const playerGridX = Math.round(player.x / BUILD_GRID_SIZE) * BUILD_GRID_SIZE;
  const playerGridY = Math.round(player.y / BUILD_GRID_SIZE) * BUILD_GRID_SIZE;
  return {
    x: playerGridX + direction.x * BUILD_GRID_SIZE,
    y: playerGridY + direction.y * BUILD_GRID_SIZE,
    vertical: direction.vertical,
    rotation: direction.rotation
  };
}

function getBuildBlockReason(x, y) {
  if (x < WORLD.margin + 24 || x > WORLD.width - WORLD.margin - 24 || y < WORLD.margin + 24 || y > WORLD.height - WORLD.margin - 24) {
    return "这里太靠近森林边缘，不能建造";
  }
  const occupied = barricades.some((item) => Math.hypot(x - item.x, y - item.y) < 44)
    || doors.some((item) => Math.hypot(x - item.x, y - item.y) < 44)
    || buildings.some((item) => Math.hypot(x - item.x, y - item.y) < 38)
    || resources.some((item) => Math.hypot(x - item.x, y - item.y) < item.radius + 25)
    || monsters.some((item) => Math.hypot(x - item.x, y - item.y) < item.radius + 25)
    || Math.hypot(x - campfire.x, y - campfire.y) < 55;
  if (occupied) return "这里被挡住了，换个位置试试";
  return "";
}

function canBuildAt(x, y, silent = false) {
  const reason = getBuildBlockReason(x, y);
  if (reason) {
    if (!silent) showMessage(reason);
    return false;
  }
  return true;
}

function buildSelected() {
  if (selectedQuickSlot < 0 || selectedQuickSlot >= BUILD_TYPES.length) {
    showMessage("请先用 1-6 选择一种建筑");
    return;
  }
  const selected = BUILD_TYPES[selectedBuild];
  if (selected.type === "wall") {
    buildBarricade();
  } else if (selected.type === "door") {
    buildDoor();
  } else {
    buildProp(selected.type, selected.cost, selected.label);
  }
}

function selectBuild(index) {
  if (index < 0 || index >= BUILD_TYPES.length) return;
  selectedBuild = index;
  selectedQuickSlot = index;
  const selected = BUILD_TYPES[selectedBuild];
  showMessage(`选择建筑：${selected.label}`, 0.9);
  updateHud();
}

function selectEmptyHand() {
  selectedQuickSlot = -1;
  showMessage("已经收起建筑，现在是空手", 1);
  updateHud();
}

// 快捷栏就像桌边最顺手的一排小格子，按数字或点击就能马上选中。
function activateQuickSlot(index) {
  if (index < 0 || index >= quickSlots.length) return;
  selectedQuickSlot = index;
  if (index < BUILD_TYPES.length) {
    selectBuild(index);
    return;
  }
  if (index === 6) {
    useBerry();
  } else {
    showMessage(`快捷格 ${index + 1} 还是空的`, 1);
  }
  updateHud();
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
      monster.hurtTimer = 0.18;
      monster.x += (dx / (Math.hypot(dx, dy) || 1)) * 24;
      monster.y += (dy / (Math.hypot(dx, dy) || 1)) * 24;
      hit = true;
    }
  }
  showMessage(hit ? "击中了怪物" : "攻击落空", 0.7);
}

// 把鼠标位置换算成游戏世界方向，让攻击和建筑都朝向点击处。
function aimAtPointer(event) {
  const rectangle = canvas.getBoundingClientRect();
  if (rectangle.width <= 0 || rectangle.height <= 0) return;
  const canvasX = (event.clientX - rectangle.left) * (W / rectangle.width);
  const canvasY = (event.clientY - rectangle.top) * (H / rectangle.height);
  const worldX = canvasX + camera.x;
  const worldY = canvasY + camera.y;
  const deltaX = worldX - player.x;
  const deltaY = worldY - player.y;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance < 1) return;
  player.dirX = deltaX / distance;
  player.dirY = deltaY / distance;
}

function spawnMonster() {
  const side = Math.floor(Math.random() * 4);
  const x = side === 0 ? 100 : side === 1 ? WORLD.width - 100 : 160 + Math.random() * (WORLD.width - 320);
  const y = side === 2 ? 100 : side === 3 ? WORLD.height - 100 : 160 + Math.random() * (WORLD.height - 320);
  monsters.push({ x, y, radius: 13, health: 70 + dayNumber * 7, speed: 37 + dayNumber * 3, attackCooldown: 0, hurtTimer: 0 });
}

function updateTraps(delta) {
  for (let i = buildings.length - 1; i >= 0; i -= 1) {
    const trap = buildings[i];
    if (trap.type !== "trap") continue;
    trap.cooldown = Math.max(0, trap.cooldown - delta);
    if (trap.cooldown > 0) continue;
    const monster = monsters.find((item) => Math.hypot(item.x - trap.x, item.y - trap.y) < 35);
    if (!monster) continue;
    monster.health -= 45;
    monster.hurtTimer = 0.25;
    trap.uses -= 1;
    trap.cooldown = 0.65;
    if (trap.uses <= 0) {
      buildings.splice(i, 1);
      showMessage("陷阱命中了怪物，然后损坏了");
    } else {
      showMessage(`陷阱命中！还可使用 ${trap.uses} 次`, 0.9);
    }
  }
}

function updateMonsters(delta, night) {
  for (let i = monsters.length - 1; i >= 0; i -= 1) {
    const monster = monsters[i];
    monster.attackCooldown = Math.max(0, monster.attackCooldown - delta);
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
      const nextX = monster.x + (dx / distance) * monster.speed * delta;
      const nextY = monster.y + (dy / distance) * monster.speed * delta;
      const defense = findBlockingDefense(nextX, nextY, monster.radius);
      if (defense) {
        attackDefense(monster, defense);
      } else {
        monster.x = nextX;
        monster.y = nextY;
      }
    } else {
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

// 圆形怪物碰到长方形建筑时，就像小球撞到积木，会停下来。
function circleHitsRectangle(x, y, radius, rectangle) {
  const closestX = Math.max(rectangle.x - rectangle.width / 2, Math.min(x, rectangle.x + rectangle.width / 2));
  const closestY = Math.max(rectangle.y - rectangle.height / 2, Math.min(y, rectangle.y + rectangle.height / 2));
  return Math.hypot(x - closestX, y - closestY) < radius;
}

function findBlockingDefense(x, y, radius) {
  const wall = barricades.find((item) => circleHitsRectangle(x, y, radius, getDefenseCollider(item, "wall")));
  if (wall) return { item: wall, list: barricades, label: "木墙" };
  const door = doors.find((item) => item.animation < 0.82 && circleHitsRectangle(x, y, radius, getDefenseCollider(item, "door")));
  if (door) return { item: door, list: doors, label: "木门" };
  return null;
}

function attackDefense(monster, defense) {
  if (monster.attackCooldown > 0) return;
  defense.item.health -= 12 + dayNumber * 2;
  monster.attackCooldown = 0.8;
  if (defense.item.health > 0) return;
  const index = defense.list.indexOf(defense.item);
  if (index >= 0) defense.list.splice(index, 1);
  showMessage(`${defense.label}被怪物破坏了！`, 1.4);
}

function updateHud() {
  const cycle = elapsed % CYCLE_LENGTH;
  if (!isNight() && cycle > DAY_LENGTH - 8) {
    phaseLabel.textContent = "黄昏";
  } else if (isNight() && cycle > CYCLE_LENGTH - 8) {
    phaseLabel.textContent = "黎明";
  } else {
    phaseLabel.textContent = isNight() ? "夜晚" : "白天";
  }
  dayLabel.textContent = `第 ${dayNumber} 天`;
  healthLabel.textContent = `生命 ${Math.max(0, Math.round(player.health))}`;
  healthLabel.classList.toggle("danger", player.health <= 30);
  resourceLabel.textContent = `木材 ${player.wood}　石头 ${player.stone}　浆果 ${player.berry}`;
  flashlightLabel.textContent = `手电筒 ${player.flashlight ? "开" : "关"}`;
  const selected = BUILD_TYPES[selectedBuild];
  inventoryWoodCount.textContent = player.wood;
  inventoryStoneCount.textContent = player.stone;
  inventoryBerryCount.textContent = player.berry;
  const occupiedSlots = [player.wood, player.stone, player.berry].filter((amount) => amount > 0).length;
  inventoryCapacity.textContent = `${occupiedSlots} / 12 格`;
  useBerryButton.classList.toggle("unavailable", player.berry <= 0);
  useBerryButton.setAttribute("aria-disabled", String(player.berry <= 0));
  quickBerryCount.textContent = player.berry;
  quickSlots.forEach((slot, index) => {
    const selectedSlot = index === selectedQuickSlot;
    slot.classList.toggle("selected", selectedSlot);
    slot.setAttribute("aria-pressed", String(selectedSlot));
  });
  if (selectedQuickSlot >= 0 && selectedQuickSlot < BUILD_TYPES.length) {
    buildingLabel.textContent = `快捷 ${selectedQuickSlot + 1}：${selected.label}（木${selected.cost.wood} 石${selected.cost.stone}）`;
  } else if (selectedQuickSlot === 6) {
    buildingLabel.textContent = `快捷 7：浆果（${player.berry}）`;
  } else if (selectedQuickSlot < 0) {
    buildingLabel.textContent = "当前：空手（按 1-6 选择建筑）";
  } else {
    buildingLabel.textContent = `快捷 ${selectedQuickSlot + 1}：空`;
  }
}

function render() {
  const targetX = Math.max(0, Math.min(WORLD.width - W, player.x - W / 2));
  const targetY = Math.max(0, Math.min(WORLD.height - H, player.y - H / 2));
  camera.x += (targetX - camera.x) * 0.12;
  camera.y += (targetY - camera.y) * 0.12;
  const shakeStrength = player.hurtTimer > 0 ? Math.min(5, player.hurtTimer * 7) : 0;
  const shakeX = Math.sin(elapsed * 89) * shakeStrength;
  const shakeY = Math.cos(elapsed * 113) * shakeStrength;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(-Math.floor(camera.x) + shakeX, -Math.floor(camera.y) + shakeY);
  drawForest();
  drawBuildGrid();
  drawBuildings();
  drawCampfire();
  drawBarricades();
  drawDoors();
  drawResources();
  drawMonsters();
  drawBuildPreview();
  drawPlayer();
  ctx.restore();

  drawAtmosphere();
}

function drawForest() {
  for (let x = 0; x < WORLD.width; x += 48) {
    for (let y = 0; y < WORLD.height; y += 48) {
      drawTerrainTile(terrainAt(x / 48, y / 48), x, y);
    }
  }
  ctx.strokeStyle = "#526f4c";
  ctx.lineWidth = 4;
  ctx.strokeRect(WORLD.margin, WORLD.margin, WORLD.width - WORLD.margin * 2, WORLD.height - WORLD.margin * 2);
}

function isBuildMode() {
  return state === "game"
    && !inventoryOpen
    && selectedQuickSlot >= 0
    && selectedQuickSlot < BUILD_TYPES.length;
}

function drawBuildGrid() {
  if (!isBuildMode()) return;
  const startX = Math.floor(camera.x / BUILD_GRID_SIZE) * BUILD_GRID_SIZE;
  const endX = camera.x + W + BUILD_GRID_SIZE;
  const startY = Math.floor(camera.y / BUILD_GRID_SIZE) * BUILD_GRID_SIZE;
  const endY = camera.y + H + BUILD_GRID_SIZE;
  ctx.save();
  ctx.strokeStyle = "rgba(210, 236, 188, .2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = startX; x <= endX; x += BUILD_GRID_SIZE) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (let y = startY; y <= endY; y += BUILD_GRID_SIZE) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawBuildPreview() {
  if (!isBuildMode()) return;
  const selected = BUILD_TYPES[selectedBuild];
  const placement = getBuildPlacement();
  const valid = canBuildAt(placement.x, placement.y, true);
  const preview = {
    x: placement.x,
    y: placement.y,
    vertical: placement.vertical,
    rotation: placement.rotation
  };

  ctx.save();
  ctx.globalAlpha = valid ? 0.62 : 0.3;
  if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
    if (selected.type === "wall") {
      drawRotatedBuildingFrame(BUILDING_FRAME.wall, preview);
    } else if (selected.type === "door") {
      drawRotatedBuildingFrame(BUILDING_FRAME.doorClosed, preview);
    } else {
      const frame = BUILDING_FRAME[selected.type];
      ctx.drawImage(worldSprite, frame * 16, BUILDING_ROW * 16, 16, 16, placement.x - 24, placement.y - 24, 48, 48);
    }
  } else {
    ctx.fillStyle = valid ? "#a7cf8f" : "#cf6758";
    ctx.fillRect(placement.x - 22, placement.y - 22, 44, 44);
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = valid ? "#d1f2b7" : "#f07c69";
  ctx.fillStyle = valid ? "rgba(126, 188, 105, .12)" : "rgba(202, 79, 64, .18)";
  ctx.lineWidth = 2;
  ctx.fillRect(placement.x - 23, placement.y - 23, 46, 46);
  ctx.strokeRect(placement.x - 23, placement.y - 23, 46, 46);
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 8);
  ctx.lineTo(placement.x, placement.y);
  ctx.stroke();
  ctx.restore();
}

// 湖泊由固定公式生成，所以每次进入游戏，水域形状都保持一致。
function isWaterTile(tileX, tileY) {
  const lakeA = ((tileX - 35) / 8) ** 2 + ((tileY - 9) / 5) ** 2 < 1;
  const lakeB = ((tileX - 11) / 5) ** 2 + ((tileY - 27) / 4) ** 2 < 1;
  return lakeA || lakeB;
}

// 只有紧挨着水面的方块才会变成沙滩，不会在草地中间乱生成沙子。
function isBesideWater(tileX, tileY) {
  for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      if (offsetX === 0 && offsetY === 0) continue;
      if (isWaterTile(tileX + offsetX, tileY + offsetY)) return true;
    }
  }
  return false;
}

function terrainAt(tileX, tileY) {
  if (isWaterTile(tileX, tileY)) return TERRAIN_FRAME.water;
  if (isBesideWater(tileX, tileY)) return TERRAIN_FRAME.sand;
  return TERRAIN_FRAME.grass;
}

function drawTerrainTile(frame, x, y) {
  if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
    ctx.drawImage(worldSprite, frame * 16, 0, 16, 16, x, y, 48, 48);
    return;
  }
  const fallback = {
    [TERRAIN_FRAME.grass]: "#2c513b",
    [TERRAIN_FRAME.sand]: "#88794f",
    [TERRAIN_FRAME.water]: "#2d92a0"
  };
  ctx.fillStyle = fallback[frame] || fallback[TERRAIN_FRAME.grass];
  ctx.fillRect(x, y, 48, 48);
}

function drawBuildings() {
  for (const building of buildings) {
    if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
      const frame = BUILDING_FRAME[building.type];
      ctx.drawImage(worldSprite, frame * 16, BUILDING_ROW * 16, 16, 16, building.x - 24, building.y - 24, 48, 48);
      continue;
    }
    ctx.fillStyle = building.type === "floor" ? "#76543a" : "#67432d";
    ctx.fillRect(building.x - 22, building.y - 22, 44, 44);
  }
}

function drawCampfire() {
  if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
    ctx.drawImage(worldSprite, BUILDING_FRAME.campfire * 16, BUILDING_ROW * 16, 16, 16, campfire.x - 24, campfire.y - 42, 48, 48);
  } else {
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

  // 小火星让静态像素素材也有呼吸感。
  for (let index = 0; index < 3; index += 1) {
    const life = (elapsed * (0.8 + index * 0.14) + index * 0.31) % 1;
    const sparkX = campfire.x + Math.sin(elapsed * 4 + index * 2.1) * (3 + life * 7);
    const sparkY = campfire.y - 22 - life * 28;
    ctx.fillStyle = `rgba(255, ${180 + index * 18}, 92, ${1 - life})`;
    ctx.fillRect(Math.round(sparkX), Math.round(sparkY), 2, 2);
  }
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
      if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
        ctx.drawImage(worldSprite, PROP_FRAME.stone * 16, 16, 16, 16, resource.x - 24, resource.y - 24, 48, 48);
        continue;
      }
      ctx.fillStyle = "#7d8a7b";
      ctx.beginPath(); ctx.moveTo(resource.x - 16, resource.y + 8); ctx.lineTo(resource.x - 10, resource.y - 10); ctx.lineTo(resource.x + 7, resource.y - 16); ctx.lineTo(resource.x + 17, resource.y + 3); ctx.lineTo(resource.x + 6, resource.y + 13); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#a3b09b";
      ctx.fillRect(resource.x - 7, resource.y - 7, 8, 5);
    } else {
      if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
        ctx.drawImage(worldSprite, PROP_FRAME.berryBush * 16, 16, 16, 16, resource.x - 24, resource.y - 24, 48, 48);
        continue;
      }
      ctx.fillStyle = "#245d3d";
      ctx.beginPath(); ctx.arc(resource.x, resource.y, 19, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8b334d";
      ctx.fillRect(resource.x - 8, resource.y - 2, 6, 6); ctx.fillRect(resource.x + 2, resource.y + 4, 6, 6);
    }
  }
}

function drawBarricades() {
  for (const barricade of barricades) {
    if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
      drawRotatedBuildingFrame(BUILDING_FRAME.wall, barricade);
    } else {
      const collider = getDefenseCollider(barricade, "wall");
      ctx.fillStyle = "#6d452d";
      ctx.fillRect(collider.x - collider.width / 2, collider.y - collider.height / 2, collider.width, collider.height);
      ctx.fillStyle = "#a06c3f";
      if (barricade.vertical) {
        ctx.fillRect(collider.x - 2, collider.y - collider.height / 2, 4, collider.height);
      } else {
        ctx.fillRect(collider.x - collider.width / 2, collider.y - 2, collider.width, 4);
      }
    }
    drawDefenseHealth(barricade);
  }
}

function drawDoors() {
  for (const door of doors) {
    const frame = door.animation > 0.5 ? BUILDING_FRAME.doorOpen : BUILDING_FRAME.doorClosed;
    if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
      drawRotatedBuildingFrame(frame, door);
    } else {
      const collider = getDefenseCollider(door, "door");
      ctx.fillStyle = door.animation > 0.82 ? "rgba(120,78,46,.35)" : "#75492d";
      ctx.fillRect(collider.x - collider.width / 2, collider.y - collider.height / 2, collider.width, collider.height);
      ctx.fillStyle = "#b27a47";
      if (door.vertical) {
        ctx.fillRect(collider.x - 2, collider.y - collider.height / 2 + 4, 4, collider.height - 8);
      } else {
        ctx.fillRect(collider.x - collider.width / 2 + 4, collider.y - 2, collider.width - 8, 4);
      }
    }
    drawDefenseHealth(door);
  }
}

function drawRotatedBuildingFrame(frame, item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.rotation || 0);
  ctx.drawImage(worldSprite, frame * 16, BUILDING_ROW * 16, 16, 16, -24, -24, 48, 48);
  ctx.restore();
}

function drawDefenseHealth(defense) {
  if (defense.health >= defense.maxHealth) return;
  const width = 42;
  const ratio = Math.max(0, defense.health / defense.maxHealth);
  ctx.fillStyle = "rgba(10, 13, 13, .8)";
  ctx.fillRect(defense.x - width / 2, defense.y - 34, width, 5);
  ctx.fillStyle = ratio > 0.45 ? "#b6d477" : "#d36b54";
  ctx.fillRect(defense.x - width / 2 + 1, defense.y - 33, (width - 2) * ratio, 3);
}

function drawMonsters() {
  for (const monster of monsters) {
    const bob = Math.sin(elapsed * 4.6 + monster.x * 0.025) * 2;
    ctx.save();
    ctx.globalAlpha = monster.hurtTimer > 0 ? .5 : 1;
    ctx.fillStyle = "rgba(3, 7, 9, .45)";
    ctx.beginPath();
    ctx.ellipse(monster.x, monster.y + 15, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(monster.x, monster.y + bob);
    ctx.fillStyle = "#0a0e12";
    ctx.beginPath();
    ctx.moveTo(-13, 12);
    ctx.quadraticCurveTo(-20, -6, -10, -17);
    ctx.quadraticCurveTo(0, -25, 11, -16);
    ctx.quadraticCurveTo(21, -5, 14, 13);
    ctx.quadraticCurveTo(8, 9, 4, 16);
    ctx.quadraticCurveTo(-1, 9, -6, 16);
    ctx.quadraticCurveTo(-9, 10, -13, 12);
    ctx.fill();

    ctx.shadowColor = "#a82f32";
    ctx.shadowBlur = 9;
    ctx.fillStyle = "#d85150";
    ctx.fillRect(-9, -5, 5, 3);
    ctx.fillRect(4, -5, 5, 3);
    ctx.shadowBlur = 0;
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
    const attackAngle = Math.atan2(player.dirY, player.dirX);
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(attackAngle);
    ctx.strokeStyle = "#f2d596";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(20, 0, 23, -0.8, 0.8);
    ctx.stroke();
    ctx.restore();
  }
}

function drawAtmosphere() {
  const darkness = nightIntensity();
  drawSkyTint(darkness);
  drawCampfireGlow(darkness);
  drawFlashlightGlow(darkness);
  drawDriftingFog(darkness);
  drawVignette(darkness);
  drawDamageFlash();
}

function drawSkyTint(darkness) {
  const tint = ctx.createLinearGradient(0, 0, 0, H);
  tint.addColorStop(0, `rgba(5, 11, 19, ${0.08 + darkness * 0.64})`);
  tint.addColorStop(0.62, `rgba(8, 14, 18, ${0.04 + darkness * 0.52})`);
  tint.addColorStop(1, `rgba(2, 6, 9, ${0.12 + darkness * 0.66})`);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, W, H);
}

function drawCampfireGlow(darkness) {
  const fireX = campfire.x - camera.x;
  const fireY = campfire.y - camera.y - 18;
  if (fireX < -180 || fireY < -180 || fireX > W + 180 || fireY > H + 180) return;
  const flicker = 1 + Math.sin(elapsed * 11.3) * 0.045 + Math.sin(elapsed * 17.7) * 0.025;
  const radius = (105 + darkness * 95) * flicker;
  const glow = ctx.createRadialGradient(fireX, fireY, 8, fireX, fireY, radius);
  glow.addColorStop(0, `rgba(255, 222, 135, ${0.22 + darkness * 0.2})`);
  glow.addColorStop(0.28, `rgba(246, 139, 59, ${0.12 + darkness * 0.14})`);
  glow.addColorStop(1, "rgba(107, 45, 26, 0)");
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = glow;
  ctx.fillRect(fireX - radius, fireY - radius, radius * 2, radius * 2);
  ctx.restore();
}

function drawFlashlightGlow(darkness) {
  if (!player.flashlight) return;
  const px = player.x - camera.x;
  const py = player.y - camera.y - 12;
  const angle = Math.atan2(player.dirY, player.dirX);
  const radius = 285;
  const flicker = 0.96 + Math.sin(elapsed * 21) * 0.025;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.translate(px, py);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, radius, -0.5, 0.5);
  ctx.closePath();
  ctx.clip();
  const beam = ctx.createRadialGradient(0, 0, 14, 0, 0, radius);
  beam.addColorStop(0, `rgba(229, 240, 195, ${(0.16 + darkness * 0.18) * flicker})`);
  beam.addColorStop(0.5, `rgba(189, 213, 172, ${(0.09 + darkness * 0.11) * flicker})`);
  beam.addColorStop(1, "rgba(150, 183, 150, 0)");
  ctx.fillStyle = beam;
  ctx.fillRect(0, -radius, radius, radius * 2);
  ctx.restore();

  const local = ctx.createRadialGradient(px, py, 10, px, py, 74);
  local.addColorStop(0, `rgba(223, 236, 192, ${0.08 + darkness * 0.13})`);
  local.addColorStop(1, "rgba(170, 201, 160, 0)");
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = local;
  ctx.fillRect(px - 74, py - 74, 148, 148);
  ctx.restore();
}

function drawDriftingFog(darkness) {
  for (let index = 0; index < 9; index += 1) {
    const width = 160 + hash(index + 70) * 260;
    const height = 22 + hash(index + 90) * 40;
    const speed = 5 + hash(index + 110) * 9;
    const loopWidth = W + width * 2;
    const x = ((hash(index + 130) * loopWidth + elapsed * speed - camera.x * 0.025) % loopWidth) - width;
    const y = hash(index + 150) * H + Math.sin(elapsed * 0.16 + index) * 18;
    const alpha = (0.026 + darkness * 0.035) * (0.55 + hash(index + 170));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(width * 0.5, height * 0.5);
    const fog = ctx.createRadialGradient(0, 0, 0.08, 0, 0, 1);
    fog.addColorStop(0, `rgba(185, 199, 191, ${alpha})`);
    fog.addColorStop(0.56, `rgba(154, 174, 165, ${alpha * 0.56})`);
    fog.addColorStop(1, "rgba(125, 149, 140, 0)");
    ctx.fillStyle = fog;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawVignette(darkness) {
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.16, W / 2, H / 2, W * 0.67);
  vignette.addColorStop(0, "rgba(1, 4, 6, 0)");
  vignette.addColorStop(0.63, `rgba(1, 4, 6, ${0.03 + darkness * 0.08})`);
  vignette.addColorStop(1, `rgba(0, 2, 4, ${0.38 + darkness * 0.34})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function drawDamageFlash() {
  if (player.hurtTimer <= 0) return;
  const strength = Math.min(1, player.hurtTimer / 0.8);
  const damage = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.7);
  damage.addColorStop(0, "rgba(130, 17, 20, 0)");
  damage.addColorStop(1, `rgba(142, 17, 22, ${strength * 0.42})`);
  ctx.fillStyle = damage;
  ctx.fillRect(0, 0, W, H);
}

function loop(now) {
  if (state !== "game") return;
  const delta = Math.min(0.04, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;
  // 打开物品栏时只画画面，不推进时间、玩家或怪物。
  if (!inventoryOpen) update(delta);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  if (state !== "game") return;
  if (event.code === "KeyI" || event.code === "Tab") {
    if (!event.repeat) setInventoryOpen(!inventoryOpen);
    return;
  }
  if (inventoryOpen) return;
  if (event.code === "Escape") {
    selectEmptyHand();
    return;
  }
  keys.add(event.code);
  if (event.code.startsWith("Digit")) {
    activateQuickSlot(Number(event.code.slice(5)) - 1);
    return;
  }
  // E 等一次性操作不能因为按键自动重复而反复触发。
  if (event.repeat && ["KeyE", "KeyF"].includes(event.code)) return;
  if (event.code === "KeyE") interact();
  if (event.code === "KeyF") {
    player.flashlight = !player.flashlight;
    showMessage(player.flashlight ? "打开手电筒" : "关闭手电筒", 1);
  }
});

canvas.addEventListener("pointerdown", (event) => {
  if (state !== "game" || inventoryOpen) return;
  if (event.button !== 0 && event.button !== 2) return;
  event.preventDefault();
  aimAtPointer(event);
  if (event.button === 0) attack();
  if (event.button === 2) buildSelected();
});

canvas.addEventListener("pointermove", (event) => {
  if (state !== "game" || inventoryOpen) return;
  aimAtPointer(event);
});

// 在游戏画布上按右键时只负责建造，不弹出浏览器菜单。
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());
startButton.addEventListener("click", startGame);
retryAssetsButton.addEventListener("click", loadGameAssets);
restartButton.addEventListener("click", startGame);
inventoryButton.addEventListener("click", () => setInventoryOpen(!inventoryOpen));
useBerryButton.addEventListener("click", useBerry);
quickSlots.forEach((slot) => {
  slot.addEventListener("click", () => activateQuickSlot(Number(slot.dataset.quickSlot)));
});

classButtons.forEach((button) => {
  button.addEventListener("click", () => {
    player.classRow = Number(button.dataset.class || 0);
    classButtons.forEach((item) => item.classList.toggle("selected", item === button));
  });
});

updateHud();
loadGameAssets();

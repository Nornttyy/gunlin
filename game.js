const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const TILE_SIZE = 48;
const WORLD = {
  tileWidth: 3000,
  tileHeight: 3000,
  width: 3000 * TILE_SIZE,
  height: 3000 * TILE_SIZE,
  margin: 72
};
const CAMP_POSITION = {
  x: Math.floor(WORLD.width / 2 / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2,
  y: Math.floor(WORLD.height / 2 / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2
};
const PLAYER_START = { x: CAMP_POSITION.x, y: CAMP_POSITION.y + 110 };
const SPAWN_CORRIDOR = {
  halfLength: 600,
  radius: 84
};
const DAY_LENGTH = 62;
const NIGHT_LENGTH = 42;
const CYCLE_LENGTH = DAY_LENGTH + NIGHT_LENGTH;
const MIMIC_DETECTION_DISTANCE = 360;
const MIMIC_LOSE_DISTANCE = 540;
const MIMIC_ATTACK_DISTANCE = 27;
const MIMIC_JUMPSCARE_DAMAGE = 50;
const MIMIC_TELEPORT_MIN_DISTANCE = 650;
const MIMIC_TELEPORT_MAX_DISTANCE = 860;
const MIMIC_FRAME_SIZE = 32;
const MIMIC_DEATH_DURATION = 0.72;
const AUDIO_PAN_DISTANCE = 420;
const BUILD_GRID_SIZE = TILE_SIZE;
const ESCAPE_GATE_MIN_DISTANCE = 600 * TILE_SIZE;
const ESCAPE_GATE_MAX_DISTANCE = 900 * TILE_SIZE;
const ESCAPE_GATE_DISCOVERY_DISTANCE = 550;
const ESCAPE_GATE_INTERACT_DISTANCE = 120;
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
const continueButton = document.getElementById("continueButton");
const titleSettingsButton = document.getElementById("titleSettingsButton");
const loadingStatus = document.getElementById("loadingStatus");
const loadingText = document.getElementById("loadingText");
const loadingCount = document.getElementById("loadingCount");
const loadingProgress = document.getElementById("loadingProgress");
const retryAssetsButton = document.getElementById("retryAssetsButton");
const restartButton = document.getElementById("restartButton");
const gameOverPanel = document.getElementById("gameOver");
const victoryPanel = document.getElementById("victoryPanel");
const victorySummary = document.getElementById("victorySummary");
const victoryTitleButton = document.getElementById("victoryTitleButton");
const mimicJumpscare = document.getElementById("mimicJumpscare");
const audioButton = document.getElementById("audioButton");
const audioButtonLabel = document.getElementById("audioButtonLabel");
const settingsPanel = document.getElementById("settingsPanel");
const settingsCloseButton = document.getElementById("settingsCloseButton");
const volumeSetting = document.getElementById("volumeSetting");
const volumeSettingValue = document.getElementById("volumeSettingValue");
const brightnessSetting = document.getElementById("brightnessSetting");
const brightnessSettingValue = document.getElementById("brightnessSettingValue");
const fogSetting = document.getElementById("fogSetting");
const fogSettingValue = document.getElementById("fogSettingValue");
const screenShakeSetting = document.getElementById("screenShakeSetting");
const jumpscareSetting = document.getElementById("jumpscareSetting");
const fullscreenButton = document.getElementById("fullscreenButton");
const resetSettingsButton = document.getElementById("resetSettingsButton");
const pausePanel = document.getElementById("pausePanel");
const resumeButton = document.getElementById("resumeButton");
const saveButton = document.getElementById("saveButton");
const pauseSettingsButton = document.getElementById("pauseSettingsButton");
const exitToTitleButton = document.getElementById("exitToTitleButton");
const saveStatus = document.getElementById("saveStatus");
const messageElement = document.getElementById("message");
const classButtons = [...document.querySelectorAll(".class-button")];
const classSelectPanel = document.getElementById("classSelectPanel");
const classLabel = document.getElementById("classLabel");
const phaseProgress = document.getElementById("phaseProgress");
const healthBar = document.getElementById("healthBar");
const objectiveLabel = document.getElementById("objectiveLabel");
const threatLabel = document.getElementById("threatLabel");
const threatMeter = document.getElementById("threatMeter");
const phaseLabel = document.getElementById("phaseLabel");
const dayLabel = document.getElementById("dayLabel");
const healthLabel = document.getElementById("healthLabel");
const resourceLabel = document.getElementById("resourceLabel");
const flashlightLabel = document.getElementById("flashlightLabel");
const buildingLabel = document.getElementById("buildingLabel");
const inventoryButton = document.getElementById("inventoryButton");
const inventoryButtonLabel = document.getElementById("inventoryButtonLabel");
const inventoryWorkspace = document.getElementById("inventoryWorkspace");
const craftPanel = document.getElementById("craftPanel");
const inventoryPanel = document.getElementById("inventoryPanel");
const inventoryCapacity = document.getElementById("inventoryCapacity");
const inventorySlots = [...document.querySelectorAll("[data-inventory-slot]")];
const chestPanel = document.getElementById("chestPanel");
const chestCapacity = document.getElementById("chestCapacity");
const chestSlots = [...document.querySelectorAll("[data-chest-slot]")];
const craftButtons = [...document.querySelectorAll(".craft-button")];
const weaponCraftButtons = [...document.querySelectorAll(".weapon-craft-button")];
const craftStatus = document.getElementById("craftStatus");
const workbenchStatus = document.getElementById("workbenchStatus");
const inventoryItems = Array(12).fill(null);
const quickSlots = [...document.querySelectorAll(".quick-slot")];
const quickbarItems = Array(9).fill(null);
const RESOURCE_ITEMS = [
  { type: "wood", kind: "material", label: "木材" },
  { type: "stone", kind: "material", label: "石头" },
  { type: "berry", kind: "food", label: "浆果" }
];
const PORTABLE_ITEMS = [
  { type: "ammo_box", kind: "ammo", label: "弹药箱" },
  { type: "medkit", kind: "consumable", label: "医疗包" },
  { type: "healing_potion", kind: "consumable", label: "治疗药水" },
  { type: "strength_potion", kind: "consumable", label: "力量药水" }
];
const PISTOL_MAGAZINE_SIZE = 7;
const PISTOL_BULLET_SPEED = 1600;
const PISTOL_BULLET_WIDTH = 10;
const CLASS_NAMES = ["枪手", "护士", "伐木工", "守望者", "棒球女", "科学家"];
const CLASS_SKILLS = [
  { name: "精准射击", description: "武器伤害 +25%，攻击速度 +15%" },
  { name: "急救护理", description: "浆果治疗翻倍，医疗包恢复 50 点生命" },
  { name: "熟练采伐", description: "少砍树 1 次，并获得更多木材" },
  { name: "远光观察", description: "手电筒照得更远、更宽" },
  { name: "强力挥击", description: "击退更远，木棒额外造成 20 伤害" },
  { name: "陷阱改良", description: "陷阱范围、伤害和使用次数提升" }
];
const CLASS_STARTING_LOADOUTS = [
  { label: "手枪、弹药箱 ×2", items: [{ type: "pistol", count: 1, loadedAmmo: 7 }, { type: "ammo_box", count: 2 }] },
  { label: "医疗包 ×3", items: [{ type: "medkit", count: 3 }] },
  { label: "石斧", items: [{ type: "axe", count: 1 }] },
  { label: "浆果 ×2、陷阱 ×1", items: [{ type: "berry", count: 2 }, { type: "trap", count: 1 }] },
  { label: "木棒", items: [{ type: "club", count: 1 }] },
  {
    label: "治疗药水、力量药水",
    items: [{ type: "healing_potion", count: 1 }, { type: "strength_potion", count: 1 }]
  }
];

function hasClassSkill(classIndex) {
  return selectedClass === classIndex;
}

function berryHealAmount() {
  return hasClassSkill(1) ? 24 : 12;
}

function resourceHarvestHits(type) {
  const baseHits = RESOURCE_HARVEST_HITS[type] || 1;
  return type === "tree" && hasClassSkill(2) ? Math.max(1, baseHits - 1) : baseHits;
}

function resourceHarvestYield(type) {
  if (type === "tree") return hasClassSkill(2) ? 5 : 3;
  if (type === "rock") return 2;
  return 1;
}

function flashlightBeamRadius() {
  return hasClassSkill(3) ? 302 : 232;
}

function flashlightBeamHalfAngle() {
  return hasClassSkill(3) ? 0.5 : 0.39;
}

function weaponDamage(weapon) {
  let damage = weapon?.damage || 35;
  if (hasClassSkill(0)) damage = Math.round(damage * 1.25);
  if (hasClassSkill(4) && weapon?.type === "club") damage += 20;
  if (player.strengthTimer > 0) damage = Math.round(damage * 1.5);
  return damage;
}

function weaponAttackCooldown(weapon) {
  const cooldown = weapon?.cooldown || 0.38;
  return hasClassSkill(0) ? cooldown * 0.85 : cooldown;
}

function weaponKnockback() {
  return hasClassSkill(4) ? 48 : 24;
}

function trapStats() {
  return hasClassSkill(5)
    ? { uses: 5, range: 48, damage: 70 }
    : { uses: 3, range: 35, damage: 45 };
}

const ASSET_VERSION = "20260728-assets2";
const PLAYER_ASSET_VERSION = "20260728-player-redraw1";
const TREE_ASSET_VERSION = "20260728-tree-visible2";
const MIMIC_ASSET_VERSION = "20260728-mimic-drawn1";
const ESCAPE_GATE_ASSET_VERSION = "20260729-gate-drawn1";
const HELD_WEAPON_FRAME = { club: 0, axe: 1, pistol: 3 };
const sprite = new Image();
const worldSprite = new Image();
const treeSprite = new Image();
const mimicSprite = new Image();
const escapeGateSprite = new Image();
sprite.decoding = "async";
worldSprite.decoding = "async";
treeSprite.decoding = "async";
mimicSprite.decoding = "async";
escapeGateSprite.decoding = "async";

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
  stone: 1
};

const BUILD_TYPES = [
  { type: "wall", label: "木墙", cost: { wood: 3, stone: 1 }, health: 120 },
  { type: "door", label: "木门", cost: { wood: 4, stone: 1 }, health: 90 },
  { type: "floor", label: "木地板", cost: { wood: 2, stone: 0 } },
  { type: "chest", label: "储物箱", cost: { wood: 5, stone: 0 } },
  { type: "workbench", label: "工作台", cost: { wood: 6, stone: 2 } },
  { type: "trap", label: "陷阱", cost: { wood: 2, stone: 1 }, uses: 3 }
];
const WEAPON_TYPES = [
  { type: "club", kind: "weapon", label: "木棒", cost: { wood: 4, stone: 0 }, damage: 25, range: 54, cooldown: 0.48 },
  { type: "axe", kind: "weapon", label: "石斧", cost: { wood: 4, stone: 3 }, damage: 45, range: 62, cooldown: 0.62 },
  {
    type: "pistol",
    kind: "weapon",
    label: "手枪",
    cost: { wood: 0, stone: 0 },
    damage: 32,
    range: 720,
    cooldown: 0.42,
    magazineSize: PISTOL_MAGAZINE_SIZE
  }
];
const RESOURCE_HARVEST_HITS = { tree: 4, rock: 3, berry: 2 };
const craftedCounts = Array(BUILD_TYPES.length).fill(0);
const DEFAULT_GAME_SETTINGS = {
  volume: 70,
  nightBrightness: 50,
  fogDensity: 100,
  screenShake: true,
  jumpscare: true
};

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
let selectedClass = -1;
let classSelectionOpen = false;
let inventoryOpen = false;
let settingsOpen = false;
let pauseOpen = false;
let settingsReturnTarget = "title";
let autosaveTimer = 20;
let activeChestId = null;
let draggedInventorySlot = -1;
let draggedChestSlot = -1;
let draggedQuickSlot = -1;
let jumpscareSequence = 0;
let audioContext = null;
let masterGain = null;
let noiseBuffer = null;
let audioEnabled = true;
let ambienceTimer = 1.5;
let nightMaskCanvas = null;
let nightMaskContext = null;
let assetsReady = false;
let assetsLoading = false;
let gameSettings = loadGameSettings();

const player = {
  x: PLAYER_START.x,
  y: PLAYER_START.y,
  radius: 10,
  speed: 132,
  health: 100,
  wood: 0,
  stone: 0,
  berry: 0,
  flashlight: true,
  classRow: 0,
  moving: false,
  dirX: 0,
  dirY: -1,
  animation: 0,
  attackTimer: 0,
  attackCooldown: 0,
  gatherCooldown: 0,
  hurtTimer: 0,
  strengthTimer: 0
};

const resources = [];
const terrainCache = new Map();
const loadedResourceChunks = new Set();
const harvestedResourceKeys = new Set();
const RESOURCE_CHUNK_TILES = 16;
const RESOURCE_CHUNK_SIZE = RESOURCE_CHUNK_TILES * TILE_SIZE;
const RESOURCE_CHUNK_LOAD_RADIUS = 1;
const RESOURCE_CHUNK_KEEP_RADIUS = 2;
let activeResourceChunk = "";
const monsters = [];
const projectiles = [];
const barricades = [];
const doors = [];
const buildings = [];
const camera = { x: 0, y: 0 };
const pointerAim = { x: W / 2, y: H / 2, active: false };
const pistolShot = {
  timer: 0,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  hit: false
};
const campfire = { ...CAMP_POSITION };
const escapeGate = { x: 0, y: 0, discovered: false };

function hash(index) {
  const value = Math.sin(index * 91.173 + 12.91) * 43758.5453;
  return value - Math.floor(value);
}

function gridHash(x, y, seed = 0) {
  return hash(x * 374761 + y * 668265 + seed * 69069);
}

function escapeGateGroundIsClear(x, y) {
  const points = [
    [-72, -48], [0, -48], [72, -48],
    [-72, 0], [0, 0], [72, 0],
    [-72, 48], [0, 48], [72, 48]
  ];
  return points.every(([offsetX, offsetY]) => (
    terrainAtWorld(x + offsetX, y + offsetY) === TERRAIN_FRAME.grass
  ));
}

function generateEscapeGate() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = ESCAPE_GATE_MIN_DISTANCE
      + Math.random() * (ESCAPE_GATE_MAX_DISTANCE - ESCAPE_GATE_MIN_DISTANCE);
    const x = Math.floor((CAMP_POSITION.x + Math.cos(angle) * distance) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
    const y = Math.floor((CAMP_POSITION.y + Math.sin(angle) * distance) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
    if (x < WORLD.margin + 180 || y < WORLD.margin + 220
      || x > WORLD.width - WORLD.margin - 180 || y > WORLD.height - WORLD.margin - 180) continue;
    if (!escapeGateGroundIsClear(x, y)) continue;
    Object.assign(escapeGate, { x, y, discovered: false });
    return;
  }
  Object.assign(escapeGate, {
    x: CAMP_POSITION.x + ESCAPE_GATE_MIN_DISTANCE,
    y: CAMP_POSITION.y,
    discovered: false
  });
}

function restoreEscapeGate(savedGate) {
  const savedDistance = Math.hypot(
    Number(savedGate?.x) - CAMP_POSITION.x,
    Number(savedGate?.y) - CAMP_POSITION.y
  );
  const valid = Number.isFinite(savedGate?.x)
    && Number.isFinite(savedGate?.y)
    && savedGate.x > WORLD.margin
    && savedGate.y > WORLD.margin
    && savedGate.x < WORLD.width - WORLD.margin
    && savedGate.y < WORLD.height - WORLD.margin
    && savedDistance >= ESCAPE_GATE_MIN_DISTANCE - TILE_SIZE
    && savedDistance <= ESCAPE_GATE_MAX_DISTANCE + TILE_SIZE;
  if (!valid) {
    generateEscapeGate();
    return;
  }
  Object.assign(escapeGate, {
    x: savedGate.x,
    y: savedGate.y,
    discovered: Boolean(savedGate.discovered)
  });
}

function escapeGateDistance() {
  return Math.hypot(player.x - escapeGate.x, player.y - escapeGate.y);
}

function escapeGateDirection() {
  const angle = Math.atan2(escapeGate.y - player.y, escapeGate.x - player.x);
  const directions = ["东", "东南", "南", "西南", "西", "西北", "北", "东北"];
  const index = Math.round(angle / (Math.PI / 4));
  return directions[(index + 8) % 8];
}

function resourceOverlapsEscapeGate(x, y, radius) {
  return Math.abs(x - escapeGate.x) < 118 + radius
    && Math.abs(y - escapeGate.y) < 105 + radius;
}

function resourceChunkKey(chunkX, chunkY) {
  return `${chunkX}:${chunkY}`;
}

function isInsideSpawnCorridor(x, y) {
  const segmentOffsetX = Math.max(0, Math.abs(x - PLAYER_START.x) - SPAWN_CORRIDOR.halfLength);
  return Math.hypot(segmentOffsetX, y - PLAYER_START.y) < SPAWN_CORRIDOR.radius;
}

function generateResourceChunk(chunkX, chunkY) {
  const key = resourceChunkKey(chunkX, chunkY);
  if (loadedResourceChunks.has(key)) return;
  loadedResourceChunks.add(key);
  const originX = chunkX * RESOURCE_CHUNK_SIZE;
  const originY = chunkY * RESOURCE_CHUNK_SIZE;
  let generated = 0;

  for (let candidate = 0; candidate < 30 && generated < 14; candidate += 1) {
    const spawnKey = `${key}:${candidate}`;
    if (harvestedResourceKeys.has(spawnKey)) continue;
    const x = originX + 36 + gridHash(chunkX, chunkY, candidate * 4 + 1) * (RESOURCE_CHUNK_SIZE - 72);
    const y = originY + 36 + gridHash(chunkX, chunkY, candidate * 4 + 2) * (RESOURCE_CHUNK_SIZE - 72);
    if (x < WORLD.margin || y < WORLD.margin || x > WORLD.width - WORLD.margin || y > WORLD.height - WORLD.margin) continue;
    if (Math.hypot(x - campfire.x, y - campfire.y) < 230) continue;
    if (isInsideSpawnCorridor(x, y)) continue;
    const roll = gridHash(chunkX, chunkY, candidate * 4 + 3);
    const type = roll < 0.58 ? "tree" : roll < 0.82 ? "rock" : "berry";
    const radius = type === "tree" ? 24 : type === "rock" ? 15 : 18;
    if (resourceOverlapsEscapeGate(x, y, radius)) continue;
    const treeFrame = type === "tree" && gridHash(chunkX, chunkY, candidate * 7 + 101) < 0.22 ? 1 : 0;
    if ((type === "tree" || type === "berry") && !canPlantGrowAt(x, y, radius)) continue;
    if (resources.some((item) => Math.hypot(x - item.x, y - item.y) < radius + item.radius + 22)) continue;
    resources.push({
      id: resourceId++,
      spawnKey,
      chunkX,
      chunkY,
      x,
      y,
      type,
      treeFrame,
      radius,
      harvestHits: 0
    });
    generated += 1;
  }
}

function updateResourceChunks(force = false) {
  const chunkX = Math.floor(player.x / RESOURCE_CHUNK_SIZE);
  const chunkY = Math.floor(player.y / RESOURCE_CHUNK_SIZE);
  const currentKey = resourceChunkKey(chunkX, chunkY);
  if (!force && currentKey === activeResourceChunk) return;
  activeResourceChunk = currentKey;
  const maxChunkX = Math.ceil(WORLD.width / RESOURCE_CHUNK_SIZE) - 1;
  const maxChunkY = Math.ceil(WORLD.height / RESOURCE_CHUNK_SIZE) - 1;

  for (let offsetY = -RESOURCE_CHUNK_LOAD_RADIUS; offsetY <= RESOURCE_CHUNK_LOAD_RADIUS; offsetY += 1) {
    for (let offsetX = -RESOURCE_CHUNK_LOAD_RADIUS; offsetX <= RESOURCE_CHUNK_LOAD_RADIUS; offsetX += 1) {
      const targetX = chunkX + offsetX;
      const targetY = chunkY + offsetY;
      if (targetX < 0 || targetY < 0 || targetX > maxChunkX || targetY > maxChunkY) continue;
      generateResourceChunk(targetX, targetY);
    }
  }

  for (let index = resources.length - 1; index >= 0; index -= 1) {
    const item = resources[index];
    if (!Number.isInteger(item.chunkX) || !Number.isInteger(item.chunkY)) continue;
    if (Math.abs(item.chunkX - chunkX) > RESOURCE_CHUNK_KEEP_RADIUS
      || Math.abs(item.chunkY - chunkY) > RESOURCE_CHUNK_KEEP_RADIUS) {
      resources.splice(index, 1);
    }
  }
  for (const key of [...loadedResourceChunks]) {
    const [loadedX, loadedY] = key.split(":").map(Number);
    if (Math.abs(loadedX - chunkX) > RESOURCE_CHUNK_KEEP_RADIUS
      || Math.abs(loadedY - chunkY) > RESOURCE_CHUNK_KEEP_RADIUS) {
      loadedResourceChunks.delete(key);
    }
  }
}

function assetUrl(path, retry = 0) {
  const retryText = retry > 0 ? `&retry=${retry}` : "";
  const version = path === "assets/player.png"
    ? PLAYER_ASSET_VERSION
    : path === "assets/tree-sprites.png"
      ? TREE_ASSET_VERSION
      : path === "assets/mimic.png"
        ? MIMIC_ASSET_VERSION
        : path === "assets/escape-gate.png" ? ESCAPE_GATE_ASSET_VERSION : ASSET_VERSION;
  return `${path}?v=${version}${retryText}`;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function clampPercent(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : fallback;
}

function loadGameSettings() {
  try {
    const saved = window.localStorage?.getItem("guilin-settings-v1");
    if (!saved) return { ...DEFAULT_GAME_SETTINGS };
    const parsed = JSON.parse(saved);
    return {
      volume: clampPercent(parsed.volume, DEFAULT_GAME_SETTINGS.volume),
      nightBrightness: clampPercent(parsed.nightBrightness, DEFAULT_GAME_SETTINGS.nightBrightness),
      fogDensity: clampPercent(parsed.fogDensity, DEFAULT_GAME_SETTINGS.fogDensity),
      screenShake: parsed.screenShake !== false,
      jumpscare: parsed.jumpscare !== false
    };
  } catch {
    return { ...DEFAULT_GAME_SETTINGS };
  }
}

function saveGameSettings() {
  try {
    window.localStorage?.setItem("guilin-settings-v1", JSON.stringify(gameSettings));
  } catch {
    // 隐私模式或禁用网站存储时，设置仍会在本次游戏中生效。
  }
}

function masterVolumeValue() {
  return Math.max(0.0001, 0.6 * gameSettings.volume / 100);
}

function renderSettings() {
  if (volumeSetting) volumeSetting.value = String(gameSettings.volume);
  if (volumeSettingValue) volumeSettingValue.textContent = `${Math.round(gameSettings.volume)}%`;
  if (brightnessSetting) brightnessSetting.value = String(gameSettings.nightBrightness);
  if (brightnessSettingValue) brightnessSettingValue.textContent = `${Math.round(gameSettings.nightBrightness)}%`;
  if (fogSetting) fogSetting.value = String(gameSettings.fogDensity);
  if (fogSettingValue) fogSettingValue.textContent = `${Math.round(gameSettings.fogDensity)}%`;
  if (screenShakeSetting) screenShakeSetting.checked = gameSettings.screenShake;
  if (jumpscareSetting) jumpscareSetting.checked = gameSettings.jumpscare;
  if (masterGain && audioContext) {
    masterGain.gain.setTargetAtTime(audioEnabled ? masterVolumeValue() : 0.0001, audioContext.currentTime, 0.025);
  }
}

function updateGameSetting(key, value) {
  gameSettings = { ...gameSettings, [key]: value };
  saveGameSettings();
  renderSettings();
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
    } else {
      await document.documentElement?.requestFullscreen?.();
    }
  } catch {
    showMessage("浏览器没有允许全屏", 1.1);
  }
}

function readSavedGame() {
  try {
    const raw = window.localStorage?.getItem("guilin-save-v1");
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved?.version !== 1 || !saved.player || !Number.isFinite(saved.elapsed)) return null;
    return saved;
  } catch {
    return null;
  }
}

function updateContinueButton() {
  if (!continueButton) return;
  const saved = readSavedGame();
  continueButton.disabled = !assetsReady || !saved;
  continueButton.textContent = saved
    ? `继续游戏 · 第 ${Math.max(1, saved.dayNumber || 1)} 天`
    : "继续游戏 · 暂无存档";
}

function saveGame(announce = true) {
  if (state !== "game" || selectedClass < 0 || classSelectionOpen) return false;
  const saveData = {
    version: 1,
    savedAt: Date.now(),
    elapsed,
    dayNumber,
    wasNight,
    spawnTimer,
    selectedBuild,
    selectedQuickSlot,
    selectedClass,
    player: {
      x: player.x,
      y: player.y,
      health: player.health,
      wood: player.wood,
      stone: player.stone,
      berry: player.berry,
      flashlight: player.flashlight,
      strengthTimer: player.strengthTimer,
      classRow: player.classRow,
      dirX: player.dirX,
      dirY: player.dirY
    },
    inventoryItems,
    quickbarItems,
    craftedCounts,
    harvestedResourceKeys: [...harvestedResourceKeys],
    monsters,
    barricades,
    doors,
    buildings,
    escapeGate: { ...escapeGate }
  };
  try {
    window.localStorage?.setItem("guilin-save-v1", JSON.stringify(saveData));
    autosaveTimer = 20;
    updateContinueButton();
    if (announce) {
      if (saveStatus) saveStatus.textContent = "存档完成";
      showMessage("游戏已保存", 1);
    }
    return true;
  } catch {
    if (announce) {
      if (saveStatus) saveStatus.textContent = "浏览器无法保存存档";
      showMessage("存档失败", 1);
    }
    return false;
  }
}

function restoreList(target, savedList) {
  target.length = 0;
  if (Array.isArray(savedList)) target.push(...savedList);
}

function restoreFixedList(target, savedList) {
  target.fill(null);
  if (!Array.isArray(savedList)) return;
  for (let index = 0; index < target.length && index < savedList.length; index += 1) {
    target[index] = savedList[index];
  }
}

function nextEntityId(list) {
  return list.reduce((highest, item) => Math.max(highest, Number(item?.id) || 0), -1) + 1;
}

function audioPanForWorldX(worldX) {
  return Math.max(-1, Math.min(1, (worldX - player.x) / AUDIO_PAN_DISTANCE));
}

function ensureAudio() {
  if (!audioEnabled) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) {
    try {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = masterVolumeValue();
      masterGain.connect(audioContext.destination);
    } catch {
      audioContext = null;
      masterGain = null;
      return null;
    }
  }
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function connectAudioOutput(node, worldX = null, panOverride = null) {
  if (!audioContext || !masterGain) return;
  const pan = panOverride === null
    ? (worldX === null ? 0 : audioPanForWorldX(worldX))
    : Math.max(-1, Math.min(1, panOverride));
  if (audioContext.createStereoPanner) {
    const panner = audioContext.createStereoPanner();
    panner.pan.setValueAtTime(pan, audioContext.currentTime);
    node.connect(panner);
    panner.connect(masterGain);
  } else {
    node.connect(masterGain);
  }
}

function playTone({
  frequency,
  endFrequency = frequency,
  duration = 0.12,
  volume = 0.05,
  type = "sine",
  delay = 0,
  worldX = null,
  pan = null
}) {
  const context = ensureAudio();
  if (!context) return;
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + Math.min(0.018, duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  connectAudioOutput(gain, worldX, pan);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function getNoiseBuffer() {
  const context = ensureAudio();
  if (!context) return null;
  if (noiseBuffer) return noiseBuffer;
  noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const samples = noiseBuffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function playNoise({
  duration = 0.16,
  volume = 0.05,
  frequency = 700,
  filterType = "lowpass",
  delay = 0,
  worldX = null,
  pan = null
} = {}) {
  const context = ensureAudio();
  const buffer = getNoiseBuffer();
  if (!context || !buffer) return;
  const start = context.currentTime + delay;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, start);
  filter.Q.setValueAtTime(0.8, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + Math.min(0.025, duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  connectAudioOutput(gain, worldX, pan);
  source.start(start, Math.random() * Math.max(0.01, buffer.duration - duration), duration);
}

function distanceVolume(worldX, worldY, maximum, range = 700) {
  const distance = Math.hypot(worldX - player.x, worldY - player.y);
  return maximum * Math.max(0.08, 1 - distance / range);
}

function playGatherSound(type, worldX) {
  if (type === "wood") {
    playTone({ frequency: 128, endFrequency: 92, type: "square", duration: 0.09, volume: 0.055, worldX });
    playTone({ frequency: 104, endFrequency: 76, type: "square", duration: 0.08, volume: 0.04, delay: 0.075, worldX });
  } else if (type === "stone") {
    playTone({ frequency: 510, endFrequency: 330, type: "triangle", duration: 0.07, volume: 0.045, worldX });
    playTone({ frequency: 720, endFrequency: 440, type: "triangle", duration: 0.055, volume: 0.035, delay: 0.06, worldX });
  } else {
    playTone({ frequency: 570, endFrequency: 820, type: "sine", duration: 0.13, volume: 0.04, worldX });
  }
}

function playWeaponSound(worldX) {
  playNoise({ duration: 0.11, volume: 0.065, frequency: 1250, filterType: "bandpass", worldX });
  playTone({ frequency: 185, endFrequency: 95, type: "sawtooth", duration: 0.1, volume: 0.035, worldX });
}

function playPistolSound(worldX) {
  playNoise({ duration: 0.13, volume: 0.12, frequency: 1900, filterType: "highpass", worldX });
  playTone({ frequency: 220, endFrequency: 82, type: "square", duration: 0.12, volume: 0.055, worldX });
}

function playBuildSound(worldX) {
  playTone({ frequency: 118, endFrequency: 72, type: "square", duration: 0.11, volume: 0.05, worldX });
  playNoise({ duration: 0.075, volume: 0.04, frequency: 480, delay: 0.06, worldX });
}

function playDoorSound(worldX, open) {
  playTone({
    frequency: open ? 155 : 105,
    endFrequency: open ? 92 : 72,
    type: "sawtooth",
    duration: 0.18,
    volume: 0.035,
    worldX
  });
}

function playMimicDetected(monster) {
  const volume = distanceVolume(monster.x, monster.y, 0.075, MIMIC_DETECTION_DISTANCE + 120);
  playNoise({ duration: 0.42, volume, frequency: 390, filterType: "bandpass", worldX: monster.x });
  playTone({ frequency: 86, endFrequency: 62, type: "sawtooth", duration: 0.34, volume: volume * 0.55, worldX: monster.x });
}

function playMimicFootstep(monster) {
  const volume = distanceVolume(monster.x, monster.y, 0.105, MIMIC_LOSE_DISTANCE + 100);
  playNoise({ duration: 0.12, volume, frequency: 190, worldX: monster.x });
  playTone({ frequency: 72, endFrequency: 48, type: "sine", duration: 0.1, volume: volume * 0.72, worldX: monster.x });
}

function playMimicJumpscare(worldX) {
  playNoise({ duration: 0.48, volume: 0.19, frequency: 1050, filterType: "bandpass", worldX });
  playTone({ frequency: 62, endFrequency: 310, type: "sawtooth", duration: 0.48, volume: 0.14, worldX });
}

function playPhaseSound(night) {
  if (night) {
    playTone({ frequency: 94, endFrequency: 48, type: "sawtooth", duration: 0.7, volume: 0.065 });
    playNoise({ duration: 0.8, volume: 0.035, frequency: 330 });
  } else {
    playTone({ frequency: 180, endFrequency: 360, type: "sine", duration: 0.45, volume: 0.04 });
  }
}

function updateAudioAmbience(delta) {
  ambienceTimer -= delta;
  if (ambienceTimer > 0) return;
  ambienceTimer = 3.5 + Math.random() * 4.5;
  playNoise({
    duration: 1.8,
    volume: isNight() ? 0.026 : 0.014,
    frequency: isNight() ? 430 : 620,
    pan: Math.random() * 2 - 1
  });
}

function updateAudioButton() {
  if (!audioButton || !audioButtonLabel) return;
  audioButtonLabel.textContent = audioEnabled ? "声音 开" : "声音 关";
  audioButton.classList.toggle("muted", !audioEnabled);
  audioButton.setAttribute("aria-pressed", String(audioEnabled));
}

function setAudioEnabled(enabled, announce = true) {
  audioEnabled = Boolean(enabled);
  if (audioEnabled) ensureAudio();
  if (masterGain && audioContext) {
    masterGain.gain.setTargetAtTime(audioEnabled ? masterVolumeValue() : 0.0001, audioContext.currentTime, 0.025);
  }
  updateAudioButton();
  if (announce && state === "game") showMessage(audioEnabled ? "声音已打开" : "声音已关闭", 0.9);
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
  if (continueButton) continueButton.disabled = true;
  retryAssetsButton.classList.add("hidden");
  loadingStatus.classList.remove("ready", "failed");
  showLoadingProgress(0, 6, "正在准备像素素材…");

  let loaded = 0;
  const jobs = [
    ["玩家图", () => loadImageWithRetry(sprite, "assets/player.png")],
    ["场景图", () => loadImageWithRetry(worldSprite, "assets/forest-assets.png")],
    ["树木图", () => loadImageWithRetry(treeSprite, "assets/tree-sprites.png")],
    ["模仿者", () => loadImageWithRetry(mimicSprite, "assets/mimic.png")],
    ["逃生大门", () => loadImageWithRetry(escapeGateSprite, "assets/escape-gate.png")],
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
    startButton.textContent = "新游戏";
    updateContinueButton();
    return;
  }

  loadingStatus.classList.add("failed");
  loadingText.textContent = `${failed.length} 个素材加载失败`;
  startButton.textContent = "素材未准备完成";
  retryAssetsButton.classList.remove("hidden");
  updateContinueButton();
}

function resetWorld() {
  resources.length = 0;
  loadedResourceChunks.clear();
  harvestedResourceKeys.clear();
  activeResourceChunk = "";
  monsters.length = 0;
  projectiles.length = 0;
  barricades.length = 0;
  doors.length = 0;
  buildings.length = 0;
  resourceId = 0;
  barricadeId = 0;
  doorId = 0;
  buildingId = 0;
  generateEscapeGate();
  updateResourceChunks(true);
}

function startGame() {
  if (!assetsReady) {
    loadGameAssets();
    return;
  }
  state = "game";
  ensureAudio();
  ambienceTimer = 0.8;
  updateAudioButton();
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameOverPanel.classList.add("hidden");
  victoryPanel?.classList.add("hidden");
  elapsed = 0;
  dayNumber = 1;
  wasNight = false;
  spawnTimer = 4;
  autosaveTimer = 20;
  selectedBuild = 0;
  selectedQuickSlot = -1;
  selectedClass = -1;
  classSelectionOpen = true;
  pistolShot.timer = 0;
  jumpscareSequence += 1;
  if (mimicJumpscare) {
    mimicJumpscare.classList.remove("active");
    mimicJumpscare.setAttribute("aria-hidden", "true");
  }
  draggedInventorySlot = -1;
  draggedChestSlot = -1;
  draggedQuickSlot = -1;
  activeChestId = null;
  inventoryItems.fill(null);
  quickbarItems.fill(null);
  craftedCounts.fill(0);
  Object.assign(player, {
    x: PLAYER_START.x,
    y: PLAYER_START.y,
    health: 100,
    wood: 0,
    stone: 0,
    berry: 0,
    flashlight: true,
    classRow: 0,
    attackTimer: 0,
    attackCooldown: 0,
    gatherCooldown: 0,
    strengthTimer: 0
  });
  camera.x = Math.max(0, Math.min(WORLD.width - W, player.x - W / 2));
  camera.y = Math.max(0, Math.min(WORLD.height - H, player.y - H / 2));
  setPauseOpen(false);
  setSettingsOpen(false);
  setInventoryOpen(false);
  inventoryButton.disabled = true;
  classButtons.forEach((button) => button.classList.remove("selected"));
  classSelectPanel.classList.remove("hidden");
  resetWorld();
  updateHud();
  showMessage("请先选择职业");
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function continueGame() {
  if (!assetsReady) {
    loadGameAssets();
    return;
  }
  const saved = readSavedGame();
  if (!saved) {
    updateContinueButton();
    return;
  }

  state = "game";
  ensureAudio();
  updateAudioButton();
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameOverPanel.classList.add("hidden");
  victoryPanel?.classList.add("hidden");
  classSelectPanel.classList.add("hidden");
  classSelectionOpen = false;
  pistolShot.timer = 0;
  projectiles.length = 0;
  inventoryOpen = false;
  settingsOpen = false;
  pauseOpen = false;
  activeChestId = null;
  inventoryWorkspace?.classList.add("hidden");
  inventoryWorkspace?.classList.remove("chest-open");
  gameScreen.classList.remove("inventory-open");
  craftPanel?.classList.remove("hidden");
  chestPanel?.classList.add("hidden");
  inventoryPanel.classList.add("hidden");
  settingsPanel?.classList.add("hidden");
  pausePanel?.classList.add("hidden");
  inventoryButton.disabled = false;
  inventoryButton.classList.remove("active");
  inventoryButton.setAttribute("aria-expanded", "false");
  inventoryButtonLabel.textContent = "背包";

  elapsed = Math.max(0, Number(saved.elapsed) || 0);
  dayNumber = Math.floor(elapsed / CYCLE_LENGTH) + 1;
  wasNight = Boolean(saved.wasNight);
  spawnTimer = Number.isFinite(saved.spawnTimer) ? saved.spawnTimer : 4;
  autosaveTimer = 20;
  selectedBuild = Math.max(0, Math.min(
    BUILD_TYPES.length - 1,
    Number.isInteger(saved.selectedBuild) ? saved.selectedBuild : 0
  ));
  selectedQuickSlot = Math.max(-1, Math.min(
    quickbarItems.length - 1,
    Number.isInteger(saved.selectedQuickSlot) ? saved.selectedQuickSlot : -1
  ));
  selectedClass = Math.max(0, Math.min(CLASS_NAMES.length - 1, Number(saved.selectedClass) || 0));

  Object.assign(player, {
    x: Number.isFinite(saved.player.x) ? saved.player.x : PLAYER_START.x,
    y: Number.isFinite(saved.player.y) ? saved.player.y : PLAYER_START.y,
    health: Math.max(1, Number(saved.player.health) || 100),
    wood: Math.max(0, Number(saved.player.wood) || 0),
    stone: Math.max(0, Number(saved.player.stone) || 0),
    berry: Math.max(0, Number(saved.player.berry) || 0),
    flashlight: saved.player.flashlight !== false,
    strengthTimer: Math.max(0, Number(saved.player.strengthTimer) || 0),
    classRow: selectedClass,
    moving: false,
    dirX: Number.isFinite(saved.player.dirX) ? saved.player.dirX : 0,
    dirY: Number.isFinite(saved.player.dirY) ? saved.player.dirY : -1,
    animation: 0,
    attackTimer: 0,
    attackCooldown: 0,
    gatherCooldown: 0,
    hurtTimer: 0
  });

  restoreFixedList(inventoryItems, saved.inventoryItems);
  restoreFixedList(quickbarItems, saved.quickbarItems);
  craftedCounts.fill(0);
  if (Array.isArray(saved.craftedCounts)) {
    saved.craftedCounts.slice(0, craftedCounts.length).forEach((count, index) => {
      craftedCounts[index] = Math.max(0, Number(count) || 0);
    });
  }
  inventoryItems.forEach((item, index) => {
    if (!item) return;
    const resource = resourceItemDefinition(item.type);
    const fallback = resource
      ? player[item.type]
      : item.kind === "building" ? craftedCounts[item.buildIndex] || 1 : 1;
    inventoryItems[index] = normalizePortableItem(item, fallback);
  });
  quickbarItems.forEach((item, index) => {
    if (!item) return;
    const resource = resourceItemDefinition(item.type);
    const fallback = resource
      ? player[item.type]
      : item.kind === "building" ? craftedCounts[item.buildIndex] || 1 : 1;
    quickbarItems[index] = normalizePortableItem(item, fallback);
  });

  resources.length = 0;
  loadedResourceChunks.clear();
  activeResourceChunk = "";
  harvestedResourceKeys.clear();
  if (Array.isArray(saved.harvestedResourceKeys)) {
    saved.harvestedResourceKeys.forEach((key) => harvestedResourceKeys.add(String(key)));
  }
  restoreList(monsters, saved.monsters);
  restoreList(barricades, saved.barricades);
  restoreList(doors, saved.doors);
  restoreList(buildings, saved.buildings);
  for (let index = buildings.length - 1; index >= 0; index -= 1) {
    if (buildings[index]?.type === "beacon") buildings.splice(index, 1);
  }
  buildings.filter((building) => building.type === "chest").forEach(normalizeChestStorage);
  restoreEscapeGate(saved.escapeGate);
  BUILD_TYPES.forEach((recipe, buildIndex) => {
    const carried = [...inventoryItems, ...quickbarItems]
      .filter((item) => item?.kind === "building" && item.buildIndex === buildIndex)
      .reduce((sum, item) => sum + Math.max(0, Number(item.count) || 0), 0);
    const stored = buildings
      .filter((building) => building.type === "chest")
      .flatMap((building) => building.items || [])
      .filter((item) => item?.kind === "building" && item.buildIndex === buildIndex)
      .reduce((sum, item) => sum + Math.max(0, Number(item.count) || 0), 0);
    craftedCounts[buildIndex] = Math.max(craftedCounts[buildIndex], carried + stored);
  });
  resourceId = 0;
  barricadeId = nextEntityId(barricades);
  doorId = nextEntityId(doors);
  buildingId = nextEntityId(buildings);
  updateResourceChunks(true);

  camera.x = Math.max(0, Math.min(WORLD.width - W, player.x - W / 2));
  camera.y = Math.max(0, Math.min(WORLD.height - H, player.y - H / 2));
  classButtons.forEach((button, index) => button.classList.toggle("selected", index === selectedClass));
  if (mimicJumpscare) {
    jumpscareSequence += 1;
    mimicJumpscare.classList.remove("active");
    mimicJumpscare.setAttribute("aria-hidden", "true");
  }
  updateHud();
  showMessage(`已读取第 ${dayNumber} 天的存档`, 1.4);
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function returnToTitle() {
  state = "title";
  keys.clear();
  inventoryOpen = false;
  settingsOpen = false;
  pauseOpen = false;
  activeChestId = null;
  classSelectionOpen = false;
  inventoryWorkspace?.classList.add("hidden");
  gameScreen.classList.remove("inventory-open");
  inventoryPanel.classList.add("hidden");
  settingsPanel?.classList.add("hidden");
  pausePanel?.classList.add("hidden");
  classSelectPanel.classList.add("hidden");
  gameOverPanel.classList.add("hidden");
  victoryPanel?.classList.add("hidden");
  gameScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  updateContinueButton();
}

function endGame() {
  state = "over";
  classSelectionOpen = false;
  classSelectPanel.classList.add("hidden");
  setPauseOpen(false);
  setSettingsOpen(false);
  setInventoryOpen(false);
  victoryPanel?.classList.add("hidden");
  gameOverPanel.classList.remove("hidden");
}

function winGame() {
  if (state !== "game") return;
  state = "won";
  keys.clear();
  classSelectionOpen = false;
  classSelectPanel.classList.add("hidden");
  setPauseOpen(false);
  setSettingsOpen(false);
  setInventoryOpen(false);
  gameOverPanel.classList.add("hidden");
  if (victorySummary) {
    victorySummary.textContent = `你在第 ${dayNumber} 天找到了逃生大门，终于离开了森林。`;
  }
  victoryPanel?.classList.remove("hidden");
  playTone({ frequency: 392, endFrequency: 784, type: "sine", duration: 0.7, volume: 0.08 });
  try {
    window.localStorage?.setItem("guilin-record-v1", JSON.stringify({
      completedAt: Date.now(),
      dayNumber
    }));
    window.localStorage?.removeItem("guilin-save-v1");
  } catch {
    // 通关画面不应该因为浏览器拒绝本地存储而失效。
  }
  updateContinueButton();
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

function updateEscapeGateDiscovery() {
  if (escapeGate.discovered || escapeGateDistance() > ESCAPE_GATE_DISCOVERY_DISTANCE) return;
  escapeGate.discovered = true;
  showMessage("你发现了逃生大门！靠近后按 E 离开森林", 2);
  saveGame(false);
}

function update(delta) {
  elapsed += delta;
  dayNumber = Math.floor(elapsed / CYCLE_LENGTH) + 1;
  autosaveTimer -= delta;
  if (autosaveTimer <= 0) saveGame(false);
  const night = isNight();

  if (night !== wasNight) {
    wasNight = night;
    playPhaseSound(night);
    showMessage(night ? "夜幕降临：不要相信雾里的眼睛" : "天亮了：怪物正在退回深林");
    if (night) spawnMonster();
  }

  updatePlayer(delta);
  updateEscapeGateDiscovery();
  updateDoors(delta);
  updateProjectiles(delta);
  updateTraps(delta);
  updateMonsters(delta, night);
  updateAudioAmbience(delta);
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
  player.gatherCooldown = Math.max(0, player.gatherCooldown - delta);
  player.hurtTimer = Math.max(0, player.hurtTimer - delta);
  player.strengthTimer = Math.max(0, player.strengthTimer - delta);
  pistolShot.timer = Math.max(0, pistolShot.timer - delta);
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
  updateResourceChunks();

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

function getEscapeGateCollider() {
  return {
    x: escapeGate.x,
    y: escapeGate.y + 7,
    width: 148,
    height: 36
  };
}

function collides(x, y) {
  if (circleHitsRectangle(x, y, player.radius, getEscapeGateCollider())) return true;
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
  if (escapeGateDistance() < ESCAPE_GATE_INTERACT_DISTANCE) {
    escapeGate.discovered = true;
    showMessage("逃生大门打开了", 1);
    winGame();
    return;
  }
  const nearbyDoor = doors.find((door) => Math.hypot(player.x - door.x, player.y - door.y) < 72);
  if (nearbyDoor) {
    nearbyDoor.open = !nearbyDoor.open;
    playDoorSound(nearbyDoor.x, nearbyDoor.open);
    showMessage(nearbyDoor.open ? "木门打开了" : "木门关上了", 1.1);
    return;
  }
  const chest = nearbyChest();
  if (chest) {
    openChest(chest);
    return;
  }
  if (nearbyWorkbench()) {
    setInventoryOpen(true);
    if (craftStatus) craftStatus.textContent = "工作台已连接：选择一种武器制作";
    showMessage("打开工作台", 1);
    return;
  }
  if (Math.hypot(player.x - campfire.x, player.y - campfire.y) < 72) {
    player.health = Math.min(100, player.health + 8);
    showMessage("篝火让你平静了一点");
  } else {
    showMessage("附近没有可以互动的东西", 1.2);
  }
}

function resourceItemDefinition(type) {
  return RESOURCE_ITEMS.find((item) => item.type === type);
}

function portableItemDefinition(type) {
  return PORTABLE_ITEMS.find((item) => item.type === type);
}

const CHEST_SLOT_COUNT = 12;

function normalizePortableItem(item, fallbackCount = 1) {
  if (!item?.type) return null;
  const count = Math.max(1, Math.floor(Number(item.count) || fallbackCount || 1));
  const resource = resourceItemDefinition(item.type);
  if (resource) return { ...resource, count, source: item.source || "inventory" };
  const portable = portableItemDefinition(item.type);
  if (portable) {
    return {
      ...portable,
      count,
      source: item.source || "inventory"
    };
  }
  const buildIndex = Number.isInteger(item.buildIndex)
    ? item.buildIndex
    : BUILD_TYPES.findIndex((recipe) => recipe.type === item.type);
  if (buildIndex >= 0 && BUILD_TYPES[buildIndex]) {
    const recipe = BUILD_TYPES[buildIndex];
    return {
      type: recipe.type,
      kind: "building",
      label: recipe.label,
      buildIndex,
      count,
      source: "crafted"
    };
  }
  const weapon = WEAPON_TYPES.find((recipe) => recipe.type === item.type);
  if (weapon) {
    const normalized = {
      ...weapon,
      cost: { ...weapon.cost },
      count: 1,
      source: "workbench"
    };
    if (weapon.type === "pistol") {
      normalized.loadedAmmo = Math.max(0, Math.min(
        PISTOL_MAGAZINE_SIZE,
        Number.isFinite(item.loadedAmmo) ? Math.floor(item.loadedAmmo) : PISTOL_MAGAZINE_SIZE
      ));
    }
    return normalized;
  }
  return null;
}

function giveClassStartingItems(classIndex) {
  const loadout = CLASS_STARTING_LOADOUTS[classIndex];
  if (!loadout) return "";
  for (const definition of loadout.items) {
    const amount = Math.max(1, Math.floor(Number(definition.count) || 1));
    if (resourceItemDefinition(definition.type)) {
      addResource(definition.type, amount);
      continue;
    }
    const item = normalizePortableItem(definition, amount);
    if (!item) continue;
    item.count = amount;
    if (item.type === "pistol") item.loadedAmmo = PISTOL_MAGAZINE_SIZE;
    if (item.kind === "building") craftedCounts[item.buildIndex] += amount;
    const quickIndex = quickbarItems.findIndex((slot) => slot === null);
    const inventoryIndex = inventoryItems.findIndex((slot) => slot === null);
    if (quickIndex >= 0) quickbarItems[quickIndex] = item;
    else if (inventoryIndex >= 0) inventoryItems[inventoryIndex] = item;
  }
  selectedQuickSlot = -1;
  return loadout.label;
}

function isStackableItem(item) {
  return Boolean(item) && item.kind !== "weapon";
}

function normalizeChestStorage(chest) {
  if (!chest || chest.type !== "chest") return [];
  const previous = Array.isArray(chest.items) ? chest.items : [];
  chest.items = Array.from(
    { length: CHEST_SLOT_COUNT },
    (_, index) => normalizePortableItem(previous[index])
  );
  return chest.items;
}

function currentChest() {
  if (activeChestId === null) return null;
  return buildings.find((building) => (
    building.type === "chest" && building.id === activeChestId
  )) || null;
}

function nearbyChest() {
  return buildings.find((building) => (
    building.type === "chest"
    && Math.hypot(player.x - building.x, player.y - building.y) < 86
  )) || null;
}

function openChest(chest) {
  normalizeChestStorage(chest);
  activeChestId = chest.id;
  setInventoryOpen(true);
  showMessage("储物箱已打开，拖动物品即可存取", 1.2);
}

function ensureInventoryResource(type) {
  const definition = resourceItemDefinition(type);
  if (!definition || inventoryItems.some((item) => item?.type === type)) return;
  const emptyIndex = inventoryItems.findIndex((item) => item === null);
  if (emptyIndex >= 0) {
    inventoryItems[emptyIndex] = {
      ...definition,
      count: Math.max(0, Math.floor(Number(player[type]) || 0)),
      source: "inventory"
    };
  }
}

function ensureQuickbarResource(type) {
  const definition = resourceItemDefinition(type);
  if (!definition || quickbarItems.some((item) => (
    item?.source === "inventory" && item.type === type
  ))) return;
  const emptyIndex = quickbarItems.findIndex((item) => item === null);
  if (emptyIndex >= 0) {
    quickbarItems[emptyIndex] = { ...definition, source: "inventory" };
  }
}

// 资源第一次到手时进入最前面的空格，所以顺序取决于实际采集先后。
function addResource(type, amount) {
  const definition = resourceItemDefinition(type);
  if (!definition || amount <= 0) return;
  player[type] += amount;
  const existing = inventoryItems.find((item) => item?.type === type);
  if (existing) {
    existing.count = Math.max(0, Math.floor(Number(existing.count) || 0)) + amount;
  } else {
    const emptyIndex = inventoryItems.findIndex((item) => item === null);
    if (emptyIndex >= 0) {
      inventoryItems[emptyIndex] = { ...definition, count: amount, source: "inventory" };
    }
  }
  ensureQuickbarResource(type);
}

function spendResource(type, amount) {
  if (!resourceItemDefinition(type) || amount <= 0 || player[type] < amount) return false;
  syncInventoryItems();
  let remaining = amount;
  for (let index = 0; index < inventoryItems.length && remaining > 0; index += 1) {
    const item = inventoryItems[index];
    if (item?.type !== type) continue;
    const available = Math.max(0, Math.floor(Number(item.count) || 0));
    const used = Math.min(available, remaining);
    item.count = available - used;
    remaining -= used;
    if (item.count <= 0) inventoryItems[index] = null;
  }
  player[type] -= amount;
  return true;
}

function collectResource() {
  if (player.gatherCooldown > 0) return;
  let target = null;
  let bestScore = Infinity;
  const gatherDistance = 68;
  for (const resource of resources) {
    const dx = resource.x - player.x;
    const dy = resource.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance > gatherDistance) continue;
    const facing = (dx * player.dirX + dy * player.dirY) / (distance || 1);
    if (distance > 24 && facing < 0.18) continue;
    const score = distance + (1 - facing) * 28;
    if (score < bestScore) {
      bestScore = score;
      target = resource;
    }
  }
  if (!target) {
    showMessage("这个方向没有可以采集的资源", 1);
    return;
  }

  player.gatherCooldown = 0.24;
  playGatherSound(target.type === "tree" ? "wood" : target.type === "rock" ? "stone" : "berry", target.x);
  const requiredHits = resourceHarvestHits(target.type);
  target.harvestHits = Math.min(requiredHits, (target.harvestHits || 0) + 1);
  if (target.harvestHits < requiredHits) {
    const action = target.type === "tree" ? "砍伐" : target.type === "rock" ? "敲击" : "采摘";
    showMessage(`${action}中 ${target.harvestHits}/${requiredHits}`, 0.6);
    updateHud();
    return;
  }

  const index = resources.indexOf(target);
  resources.splice(index, 1);
  if (target.spawnKey) harvestedResourceKeys.add(target.spawnKey);
  if (target.type === "tree") {
    const amount = resourceHarvestYield("tree");
    addResource("wood", amount);
    showMessage(`获得木材 ×${amount}`);
  } else if (target.type === "rock") {
    addResource("stone", 2);
    showMessage("获得石头 ×2");
  } else {
    addResource("berry", 1);
    showMessage("浆果已放进物品栏");
  }
  updateHud();
}

function craftedQuickSlot(buildIndex) {
  return quickbarItems.findIndex((item) => (
    item?.kind === "building" && item.source === "crafted" && item.buildIndex === buildIndex
  ));
}

function craftedInventorySlot(buildIndex) {
  return inventoryItems.findIndex((item) => (
    item?.kind === "building" && item.source === "crafted" && item.buildIndex === buildIndex
  ));
}

function recipeCostText(cost) {
  return `木材 ${cost.wood}${cost.stone ? ` · 石头 ${cost.stone}` : ""}`;
}

function renderCrafting() {
  craftButtons.forEach((button) => {
    const buildIndex = Number(button.dataset.recipe);
    if (!Number.isInteger(buildIndex) || !BUILD_TYPES[buildIndex]) return;
    const recipe = BUILD_TYPES[buildIndex];
    const existingSlot = craftedInventorySlot(buildIndex) >= 0 || craftedQuickSlot(buildIndex) >= 0;
    const hasSpace = existingSlot
      || inventoryItems.some((item) => item === null)
      || quickbarItems.some((item) => item === null);
    const affordable = player.wood >= recipe.cost.wood && player.stone >= recipe.cost.stone;
    button.disabled = !affordable || !hasSpace;
    button.classList.toggle("craft-ready", affordable && hasSpace);
    button.title = !hasSpace
      ? "背包和快捷栏都已满"
      : affordable ? `制作${recipe.label}：${recipeCostText(recipe.cost)}` : `材料不足：${recipeCostText(recipe.cost)}`;
    const owned = button.querySelector?.(".craft-owned");
    if (owned) owned.textContent = String(craftedCounts[buildIndex]);
  });
}

function nearbyWorkbench() {
  return buildings.find((building) => (
    building.type === "workbench"
    && Math.hypot(player.x - building.x, player.y - building.y) < 86
  )) || null;
}

function renderWeaponCrafting() {
  const unlocked = Boolean(nearbyWorkbench());
  if (workbenchStatus) workbenchStatus.textContent = unlocked ? "工作台已连接" : "靠近工作台后解锁";
  weaponCraftButtons.forEach((button) => {
    const recipe = WEAPON_TYPES[Number(button.dataset.weaponRecipe)];
    if (!recipe) return;
    const hasSpace = inventoryItems.some((item) => item === null)
      || quickbarItems.some((item) => item === null);
    const affordable = player.wood >= recipe.cost.wood && player.stone >= recipe.cost.stone;
    button.disabled = !unlocked || !affordable || !hasSpace;
    button.classList.toggle("weapon-ready", unlocked && affordable && hasSpace);
    button.classList.toggle("workbench-locked", !unlocked);
    button.title = !unlocked
      ? "需要靠近已放置的工作台"
      : !hasSpace
        ? "背包和快捷栏都已满"
        : affordable
          ? `制作${recipe.label}：${recipeCostText(recipe.cost)}`
          : `材料不足：${recipeCostText(recipe.cost)}`;
  });
}

function craftWeapon(weaponIndex) {
  if (state !== "game" || !inventoryOpen) return;
  const recipe = WEAPON_TYPES[weaponIndex];
  if (!recipe) return;
  if (!nearbyWorkbench()) {
    if (craftStatus) craftStatus.textContent = "需要靠近已放置的工作台才能制作武器";
    renderWeaponCrafting();
    return;
  }
  const inventoryIndex = inventoryItems.findIndex((item) => item === null);
  const quickIndex = quickbarItems.findIndex((item) => item === null);
  if (inventoryIndex < 0 && quickIndex < 0) {
    if (craftStatus) craftStatus.textContent = "背包和快捷栏都满了，先腾出一个位置";
    return;
  }
  if (player.wood < recipe.cost.wood || player.stone < recipe.cost.stone) {
    if (craftStatus) craftStatus.textContent = `材料不足：${recipeCostText(recipe.cost)}`;
    return;
  }
  spendResource("wood", recipe.cost.wood);
  spendResource("stone", recipe.cost.stone);
  const weapon = { ...recipe, cost: { ...recipe.cost }, count: 1, source: "workbench" };
  if (inventoryIndex >= 0) inventoryItems[inventoryIndex] = weapon;
  else quickbarItems[quickIndex] = weapon;
  playBuildSound(player.x);
  if (craftStatus) {
    craftStatus.textContent = inventoryIndex >= 0
      ? `已制作${recipe.label}，放入背包 ${inventoryIndex + 1}`
      : `背包已满，${recipe.label}放入快捷栏 ${quickIndex + 1}`;
  }
  updateHud();
}

function craftBuilding(buildIndex) {
  if (state !== "game" || !inventoryOpen) return;
  const recipe = BUILD_TYPES[buildIndex];
  if (!recipe) return;
  const inventoryStack = craftedInventorySlot(buildIndex);
  const quickStack = craftedQuickSlot(buildIndex);
  const emptyInventory = inventoryItems.findIndex((item) => item === null);
  const emptyQuick = quickbarItems.findIndex((item) => item === null);
  if (inventoryStack < 0 && quickStack < 0 && emptyInventory < 0 && emptyQuick < 0) {
    if (craftStatus) craftStatus.textContent = "背包和快捷栏都满了，先腾出一个位置";
    return;
  }
  if (player.wood < recipe.cost.wood || player.stone < recipe.cost.stone) {
    if (craftStatus) craftStatus.textContent = `材料不足：${recipeCostText(recipe.cost)}`;
    return;
  }
  spendResource("wood", recipe.cost.wood);
  spendResource("stone", recipe.cost.stone);
  craftedCounts[buildIndex] += 1;
  let destination = "";
  if (inventoryStack >= 0) {
    inventoryItems[inventoryStack].count = Math.max(0, Number(inventoryItems[inventoryStack].count) || 0) + 1;
    destination = `背包 ${inventoryStack + 1}`;
  } else if (quickStack >= 0) {
    quickbarItems[quickStack].count = Math.max(0, Number(quickbarItems[quickStack].count) || 0) + 1;
    destination = `快捷栏 ${quickStack + 1}`;
  } else {
    const item = {
      type: recipe.type,
      kind: "building",
      label: recipe.label,
      buildIndex,
      count: 1,
      source: "crafted"
    };
    if (emptyInventory >= 0) {
      inventoryItems[emptyInventory] = item;
      destination = `背包 ${emptyInventory + 1}`;
    } else {
      quickbarItems[emptyQuick] = item;
      destination = `快捷栏 ${emptyQuick + 1}`;
    }
  }
  if (craftStatus) craftStatus.textContent = `已制作${recipe.label}，放入${destination}`;
  updateHud();
}

// 背包打开时会暂停游戏，就像先把桌面上的玩具按下暂停键再整理盒子。
function setInventoryOpen(open) {
  inventoryOpen = open && state === "game" && !classSelectionOpen;
  if (!inventoryOpen) activeChestId = null;
  const chest = inventoryOpen ? currentChest() : null;
  if (inventoryWorkspace) inventoryWorkspace.classList.toggle("hidden", !inventoryOpen);
  gameScreen.classList.toggle("inventory-open", inventoryOpen);
  inventoryWorkspace?.classList.toggle("chest-open", Boolean(chest));
  craftPanel?.classList.toggle("hidden", Boolean(chest));
  chestPanel?.classList.toggle("hidden", !chest);
  inventoryPanel.classList.toggle("hidden", !inventoryOpen);
  inventoryButton.classList.toggle("active", inventoryOpen);
  inventoryButton.setAttribute("aria-expanded", String(inventoryOpen));
  inventoryButtonLabel.textContent = inventoryOpen ? (chest ? "关闭箱子" : "关闭") : "背包";
  if (inventoryOpen) {
    keys.clear();
    if (craftStatus && !chest) craftStatus.textContent = "选择配方制作，成品会优先进入背包";
  }
  updateHud();
}

function setSettingsOpen(open, returnTarget = null) {
  if (open) {
    settingsReturnTarget = returnTarget || (state === "game" && pauseOpen ? "pause" : "title");
    settingsOpen = true;
    if (settingsReturnTarget === "pause") pausePanel?.classList.add("hidden");
    settingsPanel?.classList.remove("hidden");
    keys.clear();
    renderSettings();
    return;
  }
  settingsOpen = false;
  settingsPanel?.classList.add("hidden");
  if (settingsReturnTarget === "pause" && pauseOpen && state === "game") {
    pausePanel?.classList.remove("hidden");
  }
}

function setPauseOpen(open) {
  const shouldOpen = Boolean(open) && state === "game" && !classSelectionOpen;
  if (shouldOpen && inventoryOpen) setInventoryOpen(false);
  pauseOpen = shouldOpen;
  pausePanel?.classList.toggle("hidden", !pauseOpen);
  if (pauseOpen) {
    keys.clear();
    const saved = saveGame(false);
    if (saveStatus) saveStatus.textContent = saved ? "已自动保存" : "游戏已暂停";
  } else {
    lastTime = performance.now();
  }
}

function portableItemCount(type) {
  return [...inventoryItems, ...quickbarItems].reduce((total, item) => (
    item?.type === type ? total + Math.max(0, Math.floor(Number(item.count) || 0)) : total
  ), 0);
}

function spendPortableItem(type, amount = 1) {
  if (portableItemCount(type) < amount) return false;
  let remaining = amount;
  for (const collection of [quickbarItems, inventoryItems]) {
    for (let index = 0; index < collection.length && remaining > 0; index += 1) {
      const item = collection[index];
      if (item?.type !== type) continue;
      const available = Math.max(0, Math.floor(Number(item.count) || 0));
      const used = Math.min(available, remaining);
      item.count = available - used;
      remaining -= used;
      if (item.count <= 0) {
        collection[index] = null;
        if (collection === quickbarItems && selectedQuickSlot === index) selectedQuickSlot = -1;
      }
    }
  }
  return remaining === 0;
}

function useConsumable(type) {
  const item = portableItemDefinition(type);
  if (!item || item.kind !== "consumable" || portableItemCount(type) <= 0) return false;
  if (type === "strength_potion") {
    spendPortableItem(type, 1);
    player.strengthTimer = Math.min(120, player.strengthTimer + 60);
    playTone({ frequency: 180, endFrequency: 520, type: "sawtooth", duration: 0.3, volume: 0.045 });
    showMessage("喝下力量药水：60 秒内武器伤害 +50%", 1.8);
    updateHud();
    return true;
  }
  if (player.health >= 100) {
    showMessage("生命已经满了，先留着治疗物品", 1.3);
    return false;
  }
  const baseHealing = type === "medkit" ? 35 : 50;
  const healing = type === "medkit" && hasClassSkill(1) ? 50 : baseHealing;
  spendPortableItem(type, 1);
  player.health = Math.min(100, player.health + healing);
  playTone({ frequency: 390, endFrequency: 760, type: "sine", duration: 0.22, volume: 0.04 });
  showMessage(`使用${item.label}，恢复 ${healing} 点生命`, 1.4);
  updateHud();
  return true;
}

function reloadPistol() {
  const pistol = quickbarItems[selectedQuickSlot];
  if (pistol?.type !== "pistol") {
    showMessage("先把手枪拿在手上才能换弹", 1.1);
    return false;
  }
  if (pistol.loadedAmmo >= PISTOL_MAGAZINE_SIZE) {
    showMessage("手枪弹夹已经装满", 1);
    return false;
  }
  if (!spendPortableItem("ammo_box", 1)) {
    showMessage("没有弹药箱了", 1.1);
    return false;
  }
  pistol.loadedAmmo = PISTOL_MAGAZINE_SIZE;
  player.attackCooldown = Math.max(player.attackCooldown, 0.7);
  playTone({ frequency: 155, endFrequency: 245, type: "square", duration: 0.12, volume: 0.035 });
  showMessage(`换上新弹夹：${PISTOL_MAGAZINE_SIZE}/${PISTOL_MAGAZINE_SIZE}，剩余弹药箱 ${portableItemCount("ammo_box")}`, 1.5);
  updateHud();
  return true;
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
  spendResource("berry", 1);
  const healing = berryHealAmount();
  player.health = Math.min(100, player.health + healing);
  playTone({ frequency: 420, endFrequency: 690, type: "sine", duration: 0.18, volume: 0.035 });
  showMessage(`吃下浆果，恢复 ${healing} 点生命`, 1.2);
  updateHud();
}

function buildBarricade(payCost = true) {
  if (payCost && (player.wood < 3 || player.stone < 1)) {
    showMessage("建造需要木材 ×3、石头 ×1");
    return false;
  }
  const placement = getBuildPlacement();
  if (!canBuildAt(placement.x, placement.y)) return false;
  barricades.push({
    id: barricadeId++,
    x: placement.x,
    y: placement.y,
    vertical: placement.vertical,
    rotation: placement.rotation,
    health: 120,
    maxHealth: 120
  });
  playBuildSound(placement.x);
  if (payCost) {
    spendResource("wood", 3);
    spendResource("stone", 1);
  }
  showMessage("建造了一段木墙");
  return true;
}

function buildDoor(payCost = true) {
  if (payCost && (player.wood < 4 || player.stone < 1)) {
    showMessage("建造木门需要木材 ×4、石头 ×1");
    return false;
  }
  const placement = getBuildPlacement();
  if (!canBuildAt(placement.x, placement.y)) return false;
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
  playBuildSound(placement.x);
  if (payCost) {
    spendResource("wood", 4);
    spendResource("stone", 1);
  }
  showMessage("建造了一扇木门");
  return true;
}

function buildProp(type, cost, label, payCost = true) {
  if (payCost && (player.wood < cost.wood || player.stone < cost.stone)) {
    const stoneText = cost.stone ? `、石头 ×${cost.stone}` : "";
    showMessage(`建造${label}需要木材 ×${cost.wood}${stoneText}`);
    return false;
  }
  const placement = getBuildPlacement();
  if (!canBuildAt(placement.x, placement.y)) return false;
  const building = { id: buildingId++, type, x: placement.x, y: placement.y };
  if (type === "trap") Object.assign(building, { uses: trapStats().uses, cooldown: 0 });
  if (type === "chest") building.items = Array(CHEST_SLOT_COUNT).fill(null);
  buildings.push(building);
  playBuildSound(placement.x);
  if (payCost) {
    spendResource("wood", cost.wood);
    spendResource("stone", cost.stone);
  }
  if (type === "chest") {
    showMessage("建造了储物箱，靠近后按 E 打开");
  } else {
    showMessage(`建造了${label}`);
  }
  return true;
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
    || (Math.abs(x - escapeGate.x) < 128 && Math.abs(y - escapeGate.y) < 112)
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
  const heldItem = quickbarItems[selectedQuickSlot];
  if (heldItem?.kind !== "building") {
    showMessage("手上没有可以建造的物品");
    return;
  }
  selectedBuild = heldItem.buildIndex;
  const selected = BUILD_TYPES[selectedBuild];
  const crafted = heldItem.source === "crafted";
  if (crafted && (heldItem.count <= 0 || craftedCounts[selectedBuild] <= 0)) {
    quickbarItems[selectedQuickSlot] = null;
    selectedQuickSlot = -1;
    showMessage("这个建筑已经用完了");
    updateHud();
    return;
  }
  let placed = false;
  if (selected.type === "wall") {
    placed = buildBarricade(!crafted);
  } else if (selected.type === "door") {
    placed = buildDoor(!crafted);
  } else {
    placed = buildProp(selected.type, selected.cost, selected.label, !crafted);
  }
  if (placed && crafted) {
    craftedCounts[selectedBuild] -= 1;
    heldItem.count -= 1;
    if (heldItem.count <= 0) {
      quickbarItems[selectedQuickSlot] = null;
      selectedQuickSlot = -1;
    }
    updateHud();
  }
}

function selectBuild(index, quickSlotIndex = index) {
  if (index < 0 || index >= BUILD_TYPES.length) return;
  selectedBuild = index;
  selectedQuickSlot = quickSlotIndex;
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
  const item = quickbarItems[index];
  if (!item) {
    selectedQuickSlot = -1;
    showMessage(`快捷格 ${index + 1} 是空的`, 1);
    updateHud();
    return;
  }
  selectedQuickSlot = index;
  if (item.kind === "building") {
    selectBuild(item.buildIndex, index);
    return;
  }
  if (item.kind === "food" && item.type === "berry") {
    useBerry();
  } else if (item.kind === "consumable") {
    useConsumable(item.type);
  } else {
    showMessage(`拿起了${item.label || "物品"}`, 1);
  }
  updateHud();
}

function isWeaponEquipped() {
  if (selectedQuickSlot < 0 || selectedQuickSlot >= quickSlots.length) return false;
  return quickbarItems[selectedQuickSlot]?.kind === "weapon";
}

function usePrimaryAction() {
  if (isWeaponEquipped()) {
    attack();
  } else {
    collectResource();
  }
}

function firePistol(weapon) {
  const loadedAmmo = Math.max(0, Math.floor(Number(weapon.loadedAmmo) || 0));
  if (loadedAmmo <= 0) {
    player.attackCooldown = 0.18;
    playTone({ frequency: 105, endFrequency: 78, type: "square", duration: 0.05, volume: 0.025 });
    showMessage(`弹夹空了，按 R 换弹 · 弹药箱 ${portableItemCount("ammo_box")}`, 1.2);
    return;
  }

  weapon.loadedAmmo = loadedAmmo - 1;
  player.attackCooldown = weaponAttackCooldown(weapon);
  player.attackTimer = 0.12;
  const range = weapon.range || 720;
  const directionLength = Math.hypot(player.dirX, player.dirY) || 1;
  const directionX = player.dirX / directionLength;
  const directionY = player.dirY / directionLength;
  const startX = player.x + directionX * 19;
  const startY = player.y - 15 + directionY * 5;
  Object.assign(pistolShot, {
    timer: 0.12,
    startX,
    startY,
    endX: startX,
    endY: startY,
    hit: false
  });
  projectiles.push({
    x: startX,
    y: startY,
    previousX: startX,
    previousY: startY,
    directionX,
    directionY,
    angle: Math.atan2(directionY, directionX),
    speed: PISTOL_BULLET_SPEED,
    distance: 0,
    range,
    damage: weaponDamage(weapon)
  });
  playPistolSound(player.x);
  const ammoText = `${weapon.loadedAmmo}/${PISTOL_MAGAZINE_SIZE}`;
  showMessage(`手枪开火 · 弹夹 ${ammoText}`, 0.75);
  updateHud();
}

function segmentDistanceToPoint(startX, startY, endX, endY, pointX, pointY) {
  const segmentX = endX - startX;
  const segmentY = endY - startY;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;
  if (lengthSquared <= 0.0001) return Math.hypot(pointX - startX, pointY - startY);
  const projection = Math.max(0, Math.min(
    1,
    ((pointX - startX) * segmentX + (pointY - startY) * segmentY) / lengthSquared
  ));
  return Math.hypot(
    pointX - (startX + segmentX * projection),
    pointY - (startY + segmentY * projection)
  );
}

function updateProjectiles(delta) {
  for (let index = projectiles.length - 1; index >= 0; index -= 1) {
    const bullet = projectiles[index];
    bullet.previousX = bullet.x;
    bullet.previousY = bullet.y;
    const step = bullet.speed * delta;
    bullet.x += bullet.directionX * step;
    bullet.y += bullet.directionY * step;
    bullet.distance += step;

    const target = monsters.find((monster) => (
      !monster.dead
      && segmentDistanceToPoint(
        bullet.previousX,
        bullet.previousY,
        bullet.x,
        bullet.y,
        monster.x,
        monster.y - 5
      ) <= (monster.radius || 13) + 4
    ));
    if (target) {
      target.health -= bullet.damage;
      target.hurtTimer = 0.2;
      target.x += bullet.directionX * 12;
      target.y += bullet.directionY * 12;
      pistolShot.hit = true;
      playTone({ frequency: 610, endFrequency: 250, type: "triangle", duration: 0.08, volume: 0.03, worldX: target.x });
      showMessage("手枪子弹命中怪物", 0.65);
      projectiles.splice(index, 1);
      continue;
    }
    if (bullet.distance >= bullet.range
      || bullet.x < WORLD.margin || bullet.y < WORLD.margin
      || bullet.x > WORLD.width - WORLD.margin || bullet.y > WORLD.height - WORLD.margin) {
      projectiles.splice(index, 1);
    }
  }
}

function attack() {
  if (player.attackCooldown > 0) return;
  const weapon = quickbarItems[selectedQuickSlot];
  if (weapon?.type === "pistol") {
    firePistol(weapon);
    return;
  }
  const damage = weaponDamage(weapon);
  const range = weapon?.range || 58;
  const knockback = weaponKnockback();
  player.attackCooldown = weaponAttackCooldown(weapon);
  player.attackTimer = 0.16;
  let hit = false;
  let soundX = player.x + player.dirX * 52;
  for (const monster of monsters) {
    if (monster.dead) continue;
    const dx = monster.x - player.x;
    const dy = monster.y - player.y;
    if (Math.hypot(dx, dy) < range) {
      monster.health -= damage;
      monster.hurtTimer = 0.18;
      monster.x += (dx / (Math.hypot(dx, dy) || 1)) * knockback;
      monster.y += (dy / (Math.hypot(dx, dy) || 1)) * knockback;
      hit = true;
      soundX = monster.x;
    }
  }
  playWeaponSound(soundX);
  showMessage(hit ? "击中了怪物" : "攻击落空", 0.7);
}

function updatePointerFacing() {
  if (!pointerAim.active) return;
  const worldX = pointerAim.x + camera.x;
  const worldY = pointerAim.y + camera.y;
  const deltaX = worldX - player.x;
  const deltaY = worldY - player.y;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance < 1) return;
  player.dirX = deltaX / distance;
  player.dirY = deltaY / distance;
}

// 记录鼠标在画布中的位置；移动、手电筒和建造方向都只使用这一个朝向来源。
function aimAtPointer(event) {
  const rectangle = canvas.getBoundingClientRect();
  if (rectangle.width <= 0 || rectangle.height <= 0) return;
  pointerAim.x = (event.clientX - rectangle.left) * (W / rectangle.width);
  pointerAim.y = (event.clientY - rectangle.top) * (H / rectangle.height);
  pointerAim.active = true;
  updatePointerFacing();
}

function spawnMonster() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 560 + Math.random() * 180;
  const x = Math.max(WORLD.margin, Math.min(WORLD.width - WORLD.margin, player.x + Math.cos(angle) * distance));
  const y = Math.max(WORLD.margin, Math.min(WORLD.height - WORLD.margin, player.y + Math.sin(angle) * distance));
  monsters.push({
    type: "mimic",
    name: "模仿者",
    x,
    y,
    radius: 13,
    health: 70 + dayNumber * 7,
    speed: 37 + dayNumber * 3,
    alerted: false,
    detectionCooldown: 0,
    attackCooldown: 0,
    hurtTimer: 0,
    footstepTimer: 0,
    animation: Math.random() * 2,
    dead: false,
    deathTimer: 0
  });
}

function triggerMimicJumpscare(worldX = player.x) {
  if (!mimicJumpscare || !gameSettings.jumpscare) return;
  playMimicJumpscare(worldX);
  const sequence = ++jumpscareSequence;
  mimicJumpscare.classList.remove("active");
  void mimicJumpscare.offsetWidth;
  mimicJumpscare.classList.add("active");
  mimicJumpscare.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    if (sequence !== jumpscareSequence) return;
    mimicJumpscare.classList.remove("active");
    mimicJumpscare.setAttribute("aria-hidden", "true");
  }, 560);
}

function teleportMimicAway(monster) {
  for (let attempt = 0; attempt < 14; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = MIMIC_TELEPORT_MIN_DISTANCE
      + Math.random() * (MIMIC_TELEPORT_MAX_DISTANCE - MIMIC_TELEPORT_MIN_DISTANCE);
    const x = Math.max(WORLD.margin, Math.min(WORLD.width - WORLD.margin, player.x + Math.cos(angle) * distance));
    const y = Math.max(WORLD.margin, Math.min(WORLD.height - WORLD.margin, player.y + Math.sin(angle) * distance));
    if (Math.hypot(x - player.x, y - player.y) < MIMIC_TELEPORT_MIN_DISTANCE * 0.9) continue;
    if (terrainAtWorld(x, y) === TERRAIN_FRAME.water) continue;
    monster.x = x;
    monster.y = y;
    return;
  }
  monster.x = Math.max(WORLD.margin, Math.min(WORLD.width - WORLD.margin, player.x + MIMIC_TELEPORT_MIN_DISTANCE));
  monster.y = player.y;
}

function updateTraps(delta) {
  const stats = trapStats();
  for (let i = buildings.length - 1; i >= 0; i -= 1) {
    const trap = buildings[i];
    if (trap.type !== "trap") continue;
    trap.cooldown = Math.max(0, trap.cooldown - delta);
    if (trap.cooldown > 0) continue;
    const monster = monsters.find((item) => !item.dead
      && Math.hypot(item.x - trap.x, item.y - trap.y) < stats.range);
    if (!monster) continue;
    monster.health -= stats.damage;
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
    monster.attackCooldown = Math.max(0, (monster.attackCooldown || 0) - delta);
    monster.detectionCooldown = Math.max(0, (monster.detectionCooldown || 0) - delta);
    monster.footstepTimer = Math.max(0, (monster.footstepTimer || 0) - delta);
    monster.hurtTimer = Math.max(0, (monster.hurtTimer || 0) - delta);

    if (monster.dead) {
      monster.deathTimer = (monster.deathTimer || 0) + delta;
      if (monster.deathTimer >= MIMIC_DEATH_DURATION) {
        monsters.splice(i, 1);
        if (Math.random() < .45) addResource("wood", 1);
        showMessage("模仿者倒下了");
      }
      continue;
    }
    if (monster.health <= 0) {
      monster.dead = true;
      monster.alerted = false;
      monster.deathTimer = 0;
      continue;
    }

    monster.animation = (monster.animation || 0) + delta * (monster.alerted ? 7.5 : 2.2);
    if (!night) {
      monster.alerted = false;
      const retreatX = monster.x - player.x;
      const retreatY = monster.y - player.y;
      const retreatDistance = Math.hypot(retreatX, retreatY) || 1;
      monster.x += (retreatX / retreatDistance) * 28 * delta;
      monster.y += (retreatY / retreatDistance) * 28 * delta;
      if (retreatDistance > 980) monsters.splice(i, 1);
      continue;
    }
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.hypot(dx, dy) || 1;

    if (!monster.alerted && monster.detectionCooldown <= 0 && distance <= MIMIC_DETECTION_DISTANCE) {
      monster.alerted = true;
      playMimicDetected(monster);
      showMessage("附近传来模仿你的脚步声", 1.2);
    } else if (monster.alerted && distance > MIMIC_LOSE_DISTANCE) {
      monster.alerted = false;
    }

    if (monster.alerted) {
      if (distance > MIMIC_ATTACK_DISTANCE) {
        const nextX = monster.x + (dx / distance) * monster.speed * delta;
        const nextY = monster.y + (dy / distance) * monster.speed * delta;
        const defense = findBlockingDefense(nextX, nextY, monster.radius);
        if (defense) {
          attackDefense(monster, defense);
        } else {
          monster.x = nextX;
          monster.y = nextY;
          if (monster.footstepTimer <= 0) {
            playMimicFootstep(monster);
            monster.footstepTimer = 0.32;
          }
        }
      } else {
        if (monster.attackCooldown <= 0 && player.hurtTimer <= 0) {
          player.health = Math.max(0, player.health - MIMIC_JUMPSCARE_DAMAGE);
          player.hurtTimer = 0.9;
          monster.attackCooldown = 2.2;
          monster.alerted = false;
          monster.detectionCooldown = 1.4;
          triggerMimicJumpscare(monster.x);
          teleportMimicAway(monster);
          showMessage("模仿者扑到了你脸上！生命 -50", 1.25);
        }
      }
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

function syncInventoryItems() {
  for (const definition of RESOURCE_ITEMS) {
    const total = Math.max(0, Math.floor(Number(player[definition.type]) || 0));
    const matchingIndexes = [];
    let stacked = 0;
    inventoryItems.forEach((item, index) => {
      if (item?.type !== definition.type) return;
      item.count = Math.max(0, Math.floor(Number(item.count) || 0));
      if (item.count <= 0) {
        inventoryItems[index] = null;
        return;
      }
      matchingIndexes.push(index);
      stacked += item.count;
    });
    if (total <= 0) {
      matchingIndexes.forEach((index) => { inventoryItems[index] = null; });
      continue;
    }
    if (matchingIndexes.length === 0) {
      ensureInventoryResource(definition.type);
      continue;
    }
    const difference = total - stacked;
    if (difference > 0) {
      inventoryItems[matchingIndexes[0]].count += difference;
    } else if (difference < 0) {
      let excess = -difference;
      for (let offset = matchingIndexes.length - 1; offset >= 0 && excess > 0; offset -= 1) {
        const index = matchingIndexes[offset];
        const item = inventoryItems[index];
        const removed = Math.min(item.count, excess);
        item.count -= removed;
        excess -= removed;
        if (item.count <= 0) inventoryItems[index] = null;
      }
    }
  }
}

function renderInventory() {
  syncInventoryItems();
  inventorySlots.forEach((slot, index) => {
    const item = inventoryItems[index];
    const amount = item
      ? resourceItemDefinition(item.type)
        ? Math.max(0, Number(item.count) || 0)
        : Math.max(1, Number(item.count) || 1)
      : 0;
    slot.classList.toggle("item-empty", !item);
    slot.classList.toggle("empty-slot", !item);
    slot.dataset.itemType = item?.type || "empty";
    slot.dataset.label = item?.label || "";
    slot.dataset.count = item ? String(amount) : "";
    slot.draggable = Boolean(item);
    const useTip = item?.type === "berry"
      ? "，点击食用"
      : item?.kind === "consumable" ? "，点击使用" : "";
    const pistolTip = item?.type === "pistol"
      ? `，弹夹 ${item.loadedAmmo}/${PISTOL_MAGAZINE_SIZE}`
      : "";
    slot.title = item
      ? `${item.label} ×${amount}${pistolTip}${useTip}；拖动可整理，右键拆分`
      : "空格，可以把物品拖到这里";
    slot.setAttribute("aria-label", slot.title);
  });
  inventoryCapacity.textContent = `${inventoryItems.filter(Boolean).length} / 12 格`;
}

function renderChestStorage() {
  const chest = currentChest();
  const items = chest ? normalizeChestStorage(chest) : [];
  chestSlots.forEach((slot, index) => {
    const item = items[index] || null;
    slot.classList.toggle("item-empty", !item);
    slot.classList.toggle("empty-slot", !item);
    slot.dataset.itemType = item?.type || "empty";
    slot.dataset.label = item?.label || "";
    slot.dataset.count = item ? String(item.count) : "";
    slot.draggable = Boolean(item);
    slot.title = item
      ? `${item.label} ×${item.count}；拖回背包可取出，右键拆分`
      : "储物箱空格，把背包物品拖到这里";
    slot.setAttribute("aria-label", slot.title);
  });
  if (chestCapacity) {
    chestCapacity.textContent = `${items.filter(Boolean).length} / ${CHEST_SLOT_COUNT} 格`;
  }
}

function finishStorageMove(message) {
  updateHud();
  saveGame(false);
  showMessage(message, 0.9);
}

function moveInventoryToChest(inventoryIndex, chestIndex) {
  const chest = currentChest();
  const item = inventoryItems[inventoryIndex];
  const carried = normalizePortableItem(item);
  const amount = carried ? Math.max(1, Math.floor(Number(item.count) || 1)) : 0;
  if (!chest || !carried || amount <= 0) return false;
  const items = normalizeChestStorage(chest);
  const target = items[chestIndex];
  if (target && (target.type !== carried.type || !isStackableItem(carried))) {
    showMessage("这个箱子格已经放了其他物品", 1);
    return false;
  }
  if (target) {
    target.count += amount;
  } else {
    items[chestIndex] = { ...carried, count: amount };
  }
  if (resourceItemDefinition(carried.type)) {
    player[carried.type] = Math.max(0, player[carried.type] - amount);
  }
  inventoryItems[inventoryIndex] = null;
  finishStorageMove(`已存入${carried.label} ×${amount}`);
  return true;
}

function moveChestToInventory(chestIndex, inventoryIndex) {
  const chest = currentChest();
  if (!chest) return false;
  const items = normalizeChestStorage(chest);
  const item = items[chestIndex];
  const carried = normalizePortableItem(item);
  if (!item || !carried || item.count <= 0) return false;
  const target = inventoryItems[inventoryIndex];
  if (target && (target.type !== carried.type || !isStackableItem(carried))) {
    showMessage("请拖到背包空格或相同物品上", 1);
    return false;
  }
  if (target) {
    target.count = Math.max(1, Number(target.count) || 1) + item.count;
  } else {
    inventoryItems[inventoryIndex] = { ...carried, count: item.count };
  }
  if (resourceItemDefinition(carried.type)) {
    player[carried.type] += item.count;
    ensureQuickbarResource(carried.type);
  }
  const amount = item.count;
  items[chestIndex] = null;
  finishStorageMove(`已取出${carried.label} ×${amount}`);
  return true;
}

function moveChestItem(chestIndex, targetIndex) {
  const chest = currentChest();
  if (!chest || chestIndex === targetIndex) return false;
  const items = normalizeChestStorage(chest);
  const source = items[chestIndex];
  const target = items[targetIndex];
  if (!source) return false;
  if (target?.type === source.type && isStackableItem(source)) {
    target.count += source.count;
    items[chestIndex] = null;
    finishStorageMove("相同物品已经合并");
  } else {
    [items[chestIndex], items[targetIndex]] = [target || null, source];
    finishStorageMove(target ? "箱内物品已交换位置" : "箱内物品已移动");
  }
  return true;
}

function splitInventoryStack(index) {
  const item = inventoryItems[index];
  const count = Math.max(0, Math.floor(Number(item?.count) || 0));
  const emptyIndex = inventoryItems.findIndex((entry) => entry === null);
  if (!item || count < 2) {
    showMessage("这个物品不能再拆分", 0.9);
    return false;
  }
  if (emptyIndex < 0) {
    showMessage("背包没有空格用来拆分", 1);
    return false;
  }
  const splitCount = Math.floor(count / 2);
  item.count -= splitCount;
  inventoryItems[emptyIndex] = { ...item, count: splitCount };
  finishStorageMove(`已拆分${item.label} ×${splitCount}`);
  return true;
}

function splitChestStack(index) {
  const chest = currentChest();
  if (!chest) return false;
  const items = normalizeChestStorage(chest);
  const item = items[index];
  const count = Math.max(0, Math.floor(Number(item?.count) || 0));
  const emptyIndex = items.findIndex((entry) => entry === null);
  if (!item || count < 2) {
    showMessage("这个物品不能再拆分", 0.9);
    return false;
  }
  if (emptyIndex < 0) {
    showMessage("储物箱没有空格用来拆分", 1);
    return false;
  }
  const splitCount = Math.floor(count / 2);
  item.count -= splitCount;
  items[emptyIndex] = { ...item, count: splitCount };
  finishStorageMove(`已拆分${item.label} ×${splitCount}`);
  return true;
}

function moveInventoryToQuickbar(inventoryIndex, quickIndex) {
  const item = inventoryItems[inventoryIndex];
  const carried = normalizePortableItem(item);
  const target = quickbarItems[quickIndex];
  if (!carried) return false;
  if (resourceItemDefinition(carried.type)) {
    if (target && target.type !== carried.type) {
      showMessage("请拖到空的快捷格", 0.9);
      return false;
    }
    quickbarItems[quickIndex] = { ...resourceItemDefinition(carried.type), source: "inventory" };
    finishStorageMove(`${carried.label}已放入快捷栏 ${quickIndex + 1}`);
    return true;
  }
  if (target && (target.type !== carried.type || !isStackableItem(carried))) {
    showMessage("请拖到空的快捷格或相同物品上", 1);
    return false;
  }
  if (target) target.count = Math.max(1, Number(target.count) || 1) + carried.count;
  else quickbarItems[quickIndex] = carried;
  inventoryItems[inventoryIndex] = null;
  finishStorageMove(`${carried.label}已放入快捷栏 ${quickIndex + 1}`);
  return true;
}

function moveQuickbarToInventory(quickIndex, inventoryIndex) {
  const item = quickbarItems[quickIndex];
  const carried = normalizePortableItem(item);
  if (!carried) return false;
  if (resourceItemDefinition(carried.type)) {
    quickbarItems[quickIndex] = null;
    if (selectedQuickSlot === quickIndex) selectedQuickSlot = -1;
    finishStorageMove(`${carried.label}已从快捷栏移除`);
    return true;
  }
  const target = inventoryItems[inventoryIndex];
  if (target && (target.type !== carried.type || !isStackableItem(carried))) {
    showMessage("请拖到背包空格或相同物品上", 1);
    return false;
  }
  if (target) target.count = Math.max(1, Number(target.count) || 1) + carried.count;
  else inventoryItems[inventoryIndex] = carried;
  quickbarItems[quickIndex] = null;
  if (selectedQuickSlot === quickIndex) selectedQuickSlot = -1;
  finishStorageMove(`${carried.label}已放回背包`);
  return true;
}

function moveQuickbarItem(sourceIndex, targetIndex) {
  if (sourceIndex === targetIndex || !quickbarItems[sourceIndex]) return false;
  [quickbarItems[sourceIndex], quickbarItems[targetIndex]] = [
    quickbarItems[targetIndex],
    quickbarItems[sourceIndex]
  ];
  if (selectedQuickSlot === sourceIndex) selectedQuickSlot = targetIndex;
  else if (selectedQuickSlot === targetIndex) selectedQuickSlot = sourceIndex;
  finishStorageMove("快捷栏位置已调整");
  return true;
}

function syncResourceQuickbar() {
  quickbarItems.forEach((item, index) => {
    if (item?.source === "inventory" && player[item.type] <= 0) {
      quickbarItems[index] = null;
      if (selectedQuickSlot === index) selectedQuickSlot = -1;
    }
  });
}

function quickbarItemAmount(item) {
  if (!item) return null;
  if (item.type === "pistol") return Math.max(0, Number(item.loadedAmmo) || 0);
  if (item.kind === "building") return Math.max(0, Number(item.count) || 0);
  if (resourceItemDefinition(item.type)) return player[item.type];
  if (portableItemDefinition(item.type)) return Math.max(0, Number(item.count) || 0);
  return null;
}

function updateSurvivalReadout() {
  if (objectiveLabel) {
    const gateDistance = escapeGateDistance();
    if (classSelectionOpen) {
      objectiveLabel.textContent = "选择职业后进入森林";
    } else if (gateDistance < ESCAPE_GATE_INTERACT_DISTANCE * 1.4) {
      objectiveLabel.textContent = "逃生大门就在前方 · 靠近按 E";
    } else if (player.health <= 30) {
      objectiveLabel.textContent = "寻找浆果，先处理伤势";
    } else if (escapeGate.discovered) {
      objectiveLabel.textContent = `返回逃生大门 · 大致在${escapeGateDirection()}方`;
    } else if (isNight()) {
      objectiveLabel.textContent = `活过夜晚 · 继续向${escapeGateDirection()}方搜索`;
    } else {
      objectiveLabel.textContent = `寻找逃生大门 · 迹象指向${escapeGateDirection()}方`;
    }
  }

  let nearestMonster = Infinity;
  for (const monster of monsters) {
    if (monster.dead) continue;
    nearestMonster = Math.min(nearestMonster, Math.hypot(monster.x - player.x, monster.y - player.y));
  }
  const threatStrength = Number.isFinite(nearestMonster)
    ? Math.round(Math.max(0, Math.min(1, 1 - nearestMonster / 650)) * 100)
    : 0;
  const threatState = threatStrength >= 70 ? "danger" : threatStrength >= 30 ? "watch" : "calm";
  if (threatLabel) {
    threatLabel.textContent = threatState === "danger" ? "正在逼近" : threatState === "watch" ? "发现动静" : "安静";
  }
  if (threatMeter) threatMeter.style.width = `${threatStrength}%`;
  gameScreen.dataset.threat = threatState;
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
  if (phaseProgress) {
    phaseProgress.style.width = `${Math.round(currentPhaseProgress() * 100)}%`;
  }
  if (healthBar) {
    healthBar.style.width = `${Math.max(0, Math.min(100, player.health))}%`;
    healthBar.classList.toggle("danger", player.health <= 30);
  }
  if (classLabel) {
    classLabel.textContent = selectedClass >= 0 ? CLASS_NAMES[selectedClass] : "未选择";
    classLabel.title = selectedClass >= 0
      ? `${CLASS_SKILLS[selectedClass].name}：${CLASS_SKILLS[selectedClass].description}`
      : "进入游戏后选择职业";
  }
  healthLabel.classList.toggle("danger", player.health <= 30);
  resourceLabel.textContent = `木材 ${player.wood}　石头 ${player.stone}　浆果 ${player.berry}`;
  flashlightLabel.textContent = `手电筒 ${player.flashlight ? "开" : "关"}`;
  updateSurvivalReadout();
  const selected = BUILD_TYPES[selectedBuild];
  renderInventory();
  renderChestStorage();
  syncResourceQuickbar();
  renderCrafting();
  renderWeaponCrafting();
  quickSlots.forEach((slot, index) => {
    const item = quickbarItems[index];
    const amount = quickbarItemAmount(item);
    const selectedSlot = Boolean(item) && index === selectedQuickSlot;
    slot.classList.toggle("selected", selectedSlot);
    slot.classList.toggle("slot-empty", !item);
    slot.classList.toggle("quick-empty", !item);
    slot.dataset.itemKind = item?.kind || "empty";
    slot.dataset.itemType = item?.type || "empty";
    slot.dataset.label = item?.label || "空";
    slot.dataset.count = amount === null ? "" : String(amount);
    slot.draggable = Boolean(item);
    slot.title = item
      ? item.type === "pistol"
        ? `${item.label} · 弹夹 ${amount}/${PISTOL_MAGAZINE_SIZE} · R 换弹`
        : `${item.label}${amount === null ? "" : ` ×${amount}`}`
      : "空快捷格";
    slot.setAttribute("aria-pressed", String(selectedSlot));
  });
  const selectedItem = quickbarItems[selectedQuickSlot];
  if (selectedItem?.kind === "building") {
    buildingLabel.textContent = `快捷 ${selectedQuickSlot + 1}：${selected.label}（木${selected.cost.wood} 石${selected.cost.stone}）`;
  } else if (selectedItem?.kind === "food" && selectedItem.type === "berry") {
    buildingLabel.textContent = `快捷 ${selectedQuickSlot + 1}：浆果（${player.berry}）`;
  } else if (selectedItem?.type === "pistol") {
    buildingLabel.textContent = `当前武器：手枪 · 弹夹 ${selectedItem.loadedAmmo}/${PISTOL_MAGAZINE_SIZE} · 弹药箱 ${portableItemCount("ammo_box")} · R 换弹`;
  } else if (selectedItem?.kind === "weapon") {
    buildingLabel.textContent = `当前武器：${selectedItem.label || "武器"}`;
  } else if (selectedItem?.kind === "material") {
    buildingLabel.textContent = `当前物品：${selectedItem.label}`;
  } else if (selectedItem) {
    buildingLabel.textContent = `当前物品：${selectedItem.label}`;
  } else {
    buildingLabel.textContent = "当前：空手";
  }
  if (player.strengthTimer > 0) {
    buildingLabel.textContent += ` · 力量增强 ${Math.ceil(player.strengthTimer)}秒`;
  }
}

function render() {
  const targetX = Math.max(0, Math.min(WORLD.width - W, player.x - W / 2));
  const targetY = Math.max(0, Math.min(WORLD.height - H, player.y - H / 2));
  camera.x += (targetX - camera.x) * 0.12;
  camera.y += (targetY - camera.y) * 0.12;
  updatePointerFacing();
  const shakeStrength = gameSettings.screenShake && player.hurtTimer > 0
    ? Math.min(5, player.hurtTimer * 7)
    : 0;
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
  drawEscapeGate();
  drawMonsters();
  drawBuildPreview();
  drawPlayer();
  ctx.restore();

  drawAtmosphere();
  ctx.save();
  ctx.translate(-Math.floor(camera.x) + shakeX, -Math.floor(camera.y) + shakeY);
  drawProjectiles();
  ctx.restore();
}

function drawForest() {
  const startTileX = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 1);
  const endTileX = Math.min(WORLD.tileWidth - 1, Math.ceil((camera.x + W) / TILE_SIZE) + 1);
  const startTileY = Math.max(0, Math.floor(camera.y / TILE_SIZE) - 1);
  const endTileY = Math.min(WORLD.tileHeight - 1, Math.ceil((camera.y + H) / TILE_SIZE) + 1);
  for (let tileY = startTileY; tileY <= endTileY; tileY += 1) {
    for (let tileX = startTileX; tileX <= endTileX; tileX += 1) {
      drawTerrainTile(terrainAt(tileX, tileY), tileX * TILE_SIZE, tileY * TILE_SIZE);
    }
  }

  const viewLeft = camera.x - 8;
  const viewRight = camera.x + W + 8;
  const viewTop = camera.y - 8;
  const viewBottom = camera.y + H + 8;
  const left = WORLD.margin;
  const right = WORLD.width - WORLD.margin;
  const top = WORLD.margin;
  const bottom = WORLD.height - WORLD.margin;
  ctx.strokeStyle = "#526f4c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (left >= viewLeft && left <= viewRight) {
    ctx.moveTo(left, Math.max(top, viewTop));
    ctx.lineTo(left, Math.min(bottom, viewBottom));
  }
  if (right >= viewLeft && right <= viewRight) {
    ctx.moveTo(right, Math.max(top, viewTop));
    ctx.lineTo(right, Math.min(bottom, viewBottom));
  }
  if (top >= viewTop && top <= viewBottom) {
    ctx.moveTo(Math.max(left, viewLeft), top);
    ctx.lineTo(Math.min(right, viewRight), top);
  }
  if (bottom >= viewTop && bottom <= viewBottom) {
    ctx.moveTo(Math.max(left, viewLeft), bottom);
    ctx.lineTo(Math.min(right, viewRight), bottom);
  }
  ctx.stroke();
}

function isBuildMode() {
  return state === "game"
    && !classSelectionOpen
    && !inventoryOpen
    && !settingsOpen
    && !pauseOpen
    && selectedQuickSlot >= 0
    && quickbarItems[selectedQuickSlot]?.kind === "building";
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

// 每个 48×48 地块区域都有确定的湖泊参数，因此超大地图不需要预存 900 万格。
function isWaterTile(tileX, tileY) {
  if (tileX < 0 || tileY < 0 || tileX >= WORLD.tileWidth || tileY >= WORLD.tileHeight) return false;
  const campTileX = Math.floor(campfire.x / TILE_SIZE);
  const campTileY = Math.floor(campfire.y / TILE_SIZE);
  if (Math.abs(tileX - campTileX) <= 7 && Math.abs(tileY - campTileY) <= 7) return false;
  const lakeRegionSize = 48;
  const regionX = Math.floor(tileX / lakeRegionSize);
  const regionY = Math.floor(tileY / lakeRegionSize);

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      const lakeRegionX = regionX + offsetX;
      const lakeRegionY = regionY + offsetY;
      const centerX = lakeRegionX * lakeRegionSize + 10 + gridHash(lakeRegionX, lakeRegionY, 1) * 28;
      const centerY = lakeRegionY * lakeRegionSize + 10 + gridHash(lakeRegionX, lakeRegionY, 2) * 28;
      const radiusX = 5 + gridHash(lakeRegionX, lakeRegionY, 3) * 7;
      const radiusY = 4 + gridHash(lakeRegionX, lakeRegionY, 4) * 6;
      const insideLake = ((tileX - centerX) / radiusX) ** 2 + ((tileY - centerY) / radiusY) ** 2 < 1;
      if (insideLake) return true;
    }
  }
  return false;
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
  const key = `${tileX}:${tileY}`;
  const cached = terrainCache.get(key);
  if (cached !== undefined) return cached;
  const terrain = isWaterTile(tileX, tileY)
    ? TERRAIN_FRAME.water
    : isBesideWater(tileX, tileY)
      ? TERRAIN_FRAME.sand
      : TERRAIN_FRAME.grass;
  if (terrainCache.size > 50000) terrainCache.clear();
  terrainCache.set(key, terrain);
  return terrain;
}

function terrainAtWorld(worldX, worldY) {
  return terrainAt(Math.floor(worldX / TILE_SIZE), Math.floor(worldY / TILE_SIZE));
}

// 植物不仅检查中心，还检查根部周围，防止树或灌木压到沙滩和水面上。
function canPlantGrowAt(x, y, radius) {
  const footprint = Math.max(12, radius * 0.72);
  const points = [
    [0, 0],
    [-footprint, 0],
    [footprint, 0],
    [0, -footprint],
    [0, footprint]
  ];
  return points.every(([offsetX, offsetY]) => (
    terrainAtWorld(x + offsetX, y + offsetY) === TERRAIN_FRAME.grass
  ));
}

function drawTerrainTile(frame, x, y) {
  if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
    ctx.drawImage(worldSprite, frame * 16, 0, 16, 16, x, y, TILE_SIZE, TILE_SIZE);
    return;
  }
  const fallback = {
    [TERRAIN_FRAME.grass]: "#2c513b",
    [TERRAIN_FRAME.sand]: "#88794f",
    [TERRAIN_FRAME.water]: "#2d92a0"
  };
  ctx.fillStyle = fallback[frame] || fallback[TERRAIN_FRAME.grass];
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
}

function drawEscapeGate() {
  if (escapeGate.x < camera.x - 170 || escapeGate.x > camera.x + W + 170
    || escapeGate.y < camera.y - 80 || escapeGate.y > camera.y + H + 260) return;
  ctx.save();
  ctx.translate(escapeGate.x, escapeGate.y);
  ctx.fillStyle = "rgba(1, 4, 5, .48)";
  ctx.beginPath();
  ctx.ellipse(-4, 9, 78, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  if (escapeGateSprite.complete
    && escapeGateSprite.naturalWidth >= 64
    && escapeGateSprite.naturalHeight >= 64) {
    ctx.drawImage(escapeGateSprite, 0, 0, 64, 64, -128, -244, 256, 256);
  } else {
    ctx.fillStyle = "#18201d";
    ctx.fillRect(-70, -190, 140, 196);
    ctx.fillStyle = "#566158";
    ctx.fillRect(-70, -190, 10, 196);
    ctx.fillRect(60, -190, 10, 196);
    ctx.fillRect(-60, -190, 120, 10);
    ctx.fillStyle = "#303b35";
    ctx.fillRect(-52, -172, 104, 178);
    ctx.fillStyle = "#69746a";
    ctx.fillRect(-4, -172, 8, 178);
  }

  if (escapeGateDistance() < ESCAPE_GATE_DISCOVERY_DISTANCE) {
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(3, 7, 7, .88)";
    ctx.fillRect(-63, 31, 126, 23);
    ctx.strokeStyle = "#7c4a43";
    ctx.strokeRect(-63, 31, 126, 23);
    ctx.fillStyle = "#ded7bd";
    ctx.font = "10px ArkPixel, monospace";
    ctx.fillText("靠近按 E 逃离森林", 0, 47);
  }
  ctx.restore();
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
    if (resource.x < camera.x - 100 || resource.x > camera.x + W + 100
      || resource.y < camera.y - 90 || resource.y > camera.y + H + 180) continue;
    if (resource.type === "tree") {
      if (treeSprite.complete && treeSprite.naturalWidth >= 64 && treeSprite.naturalHeight >= 64) {
        const frame = resource.treeFrame === 1 ? 1 : 0;
        ctx.drawImage(treeSprite, frame * 32, 0, 32, 64, resource.x - 48, resource.y - 160, 96, 192);
        drawHarvestProgress(resource);
        continue;
      }
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
        // 石头在物品行（第 3 行）的第 2 格，不是植物行里的透明格。
        ctx.drawImage(worldSprite, PROP_FRAME.stone * 16, 2 * 16, 16, 16, resource.x - 24, resource.y - 24, 48, 48);
        drawHarvestProgress(resource);
        continue;
      }
      ctx.fillStyle = "#7d8a7b";
      ctx.beginPath(); ctx.moveTo(resource.x - 16, resource.y + 8); ctx.lineTo(resource.x - 10, resource.y - 10); ctx.lineTo(resource.x + 7, resource.y - 16); ctx.lineTo(resource.x + 17, resource.y + 3); ctx.lineTo(resource.x + 6, resource.y + 13); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#a3b09b";
      ctx.fillRect(resource.x - 7, resource.y - 7, 8, 5);
    } else {
      if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
        ctx.drawImage(worldSprite, PROP_FRAME.berryBush * 16, 16, 16, 16, resource.x - 24, resource.y - 24, 48, 48);
        drawHarvestProgress(resource);
        continue;
      }
      ctx.fillStyle = "#245d3d";
      ctx.beginPath(); ctx.arc(resource.x, resource.y, 19, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8b334d";
      ctx.fillRect(resource.x - 8, resource.y - 2, 6, 6); ctx.fillRect(resource.x + 2, resource.y + 4, 6, 6);
    }
    drawHarvestProgress(resource);
  }
}

function drawHarvestProgress(resource) {
  const hits = resource.harvestHits || 0;
  if (hits <= 0) return;
  const requiredHits = RESOURCE_HARVEST_HITS[resource.type] || 1;
  const width = 38;
  const x = Math.round(resource.x - width / 2);
  const y = Math.round(resource.y - (resource.type === "tree" ? 171 : 36));
  ctx.fillStyle = "rgba(2, 4, 4, .9)";
  ctx.fillRect(x - 2, y - 2, width + 4, 7);
  ctx.fillStyle = "#6d292c";
  ctx.fillRect(x, y, width, 3);
  ctx.fillStyle = "#b8c59a";
  ctx.fillRect(x, y, Math.round(width * Math.min(1, hits / requiredHits)), 3);
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
    const bob = monster.dead
      ? 0
      : Math.sin(elapsed * (monster.alerted ? 8 : 3.5) + monster.x * 0.025) * (monster.alerted ? 2 : 1);
    ctx.save();
    ctx.fillStyle = "rgba(3, 7, 9, .45)";
    ctx.beginPath();
    ctx.ellipse(monster.x, monster.y + 15, monster.dead ? 17 : 20, monster.dead ? 5 : 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (mimicSprite.complete && mimicSprite.naturalWidth >= 384 && mimicSprite.naturalHeight >= 32) {
      const frame = getMimicFrame(monster);
      ctx.drawImage(
        mimicSprite,
        frame * MIMIC_FRAME_SIZE,
        0,
        MIMIC_FRAME_SIZE,
        MIMIC_FRAME_SIZE,
        monster.x - 32,
        monster.y - 48 + bob,
        64,
        64
      );
      ctx.restore();
      continue;
    }

    ctx.globalAlpha = monster.hurtTimer > 0 ? .5 : 1;
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

function getMimicFrame(monster) {
  if (monster.dead) {
    const progress = Math.max(0, Math.min(0.999, (monster.deathTimer || 0) / MIMIC_DEATH_DURATION));
    return 8 + Math.floor(progress * 4);
  }
  if (monster.hurtTimer > 0) return 7;
  if (monster.alerted) return 2 + (Math.floor(monster.animation || 0) % 5);
  return Math.floor(monster.animation || 0) % 2;
}

function drawProjectiles() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  if (pistolShot.timer > 0) {
    const flashStrength = Math.min(1, pistolShot.timer / 0.12);
    const flash = ctx.createRadialGradient(
      pistolShot.startX,
      pistolShot.startY,
      0,
      pistolShot.startX,
      pistolShot.startY,
      18
    );
    flash.addColorStop(0, `rgba(255, 249, 190, ${0.76 * flashStrength})`);
    flash.addColorStop(0.42, `rgba(255, 162, 65, ${0.48 * flashStrength})`);
    flash.addColorStop(1, "rgba(255, 112, 34, 0)");
    ctx.fillStyle = flash;
    ctx.fillRect(pistolShot.startX - 18, pistolShot.startY - 18, 36, 36);
  }
  for (const bullet of projectiles) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.angle);
    ctx.shadowColor = "#ffd469";
    ctx.shadowBlur = 13;
    ctx.fillStyle = "rgba(255, 185, 72, .72)";
    ctx.fillRect(-PISTOL_BULLET_WIDTH / 2 - 2, -3, PISTOL_BULLET_WIDTH + 4, 6);
    ctx.shadowColor = "#fff0a6";
    ctx.shadowBlur = 7;
    ctx.fillStyle = "#fff4ba";
    ctx.fillRect(-PISTOL_BULLET_WIDTH / 2, -1.5, PISTOL_BULLET_WIDTH, 3);
    ctx.restore();
  }
  ctx.restore();
}

function drawHeldWeapon(weapon) {
  const frame = HELD_WEAPON_FRAME[weapon?.type];
  if (!Number.isInteger(frame)) return;
  const angle = Math.atan2(player.dirY, player.dirX);
  const firing = weapon.type === "pistol" && pistolShot.timer > 0;
  const recoil = firing ? -3 * Math.min(1, pistolShot.timer / 0.12) : 0;
  ctx.save();
  ctx.translate(
    player.x + player.dirX * 5,
    player.y - 15 + player.dirY * 3
  );
  ctx.rotate(angle);
  if (player.dirX < 0) ctx.scale(1, -1);
  if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
    ctx.drawImage(worldSprite, frame * 16, 64, 16, 16, -3 + recoil, -16, 32, 32);
  } else {
    ctx.fillStyle = weapon.type === "pistol" ? "#5a5144" : "#76523b";
    ctx.fillRect(recoil, -3, weapon.type === "pistol" ? 24 : 27, 6);
  }
  if (firing) {
    ctx.fillStyle = "#fff0a4";
    ctx.fillRect(27 + recoil, -4, 8, 8);
    ctx.fillStyle = "#ef8a3f";
    ctx.fillRect(31 + recoil, -2, 8, 4);
  }
  ctx.restore();
}

function drawPlayer() {
  const heldWeapon = quickbarItems[selectedQuickSlot]?.kind === "weapon"
    ? quickbarItems[selectedQuickSlot]
    : null;
  const drawX = player.x - 24;
  const drawY = player.y - 37;
  if (heldWeapon && player.dirY < -0.28) drawHeldWeapon(heldWeapon);
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
  if (heldWeapon && player.dirY >= -0.28) drawHeldWeapon(heldWeapon);
  if (player.attackTimer > 0 && heldWeapon?.type !== "pistol") {
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
  gameScreen.classList.toggle("is-night", darkness > 0.68);
  drawSkyTint(darkness);
  drawNightCurtain(darkness);
  drawCampfireGlow(darkness);
  drawFlashlightGlow(darkness);
  drawDriftingFog(darkness);
  drawWatchingEyes(darkness);
  drawAirborneSpecks(darkness);
  drawFilmGrain(darkness);
  drawVignette(darkness);
  drawDamageFlash();
}

function drawSkyTint(darkness) {
  const tint = ctx.createLinearGradient(0, 0, 0, H);
  tint.addColorStop(0, `rgba(2, 6, 12, ${0.16 + darkness * 0.62})`);
  tint.addColorStop(0.62, `rgba(3, 7, 10, ${0.11 + darkness * 0.57})`);
  tint.addColorStop(1, `rgba(0, 3, 6, ${0.18 + darkness * 0.66})`);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, W, H);
}

function getNightMaskContext() {
  if (!nightMaskCanvas) {
    nightMaskCanvas = document.createElement("canvas");
    nightMaskCanvas.width = W;
    nightMaskCanvas.height = H;
    nightMaskContext = nightMaskCanvas.getContext("2d");
    nightMaskContext.imageSmoothingEnabled = false;
  }
  return nightMaskContext;
}

function drawNightCurtain(darkness) {
  if (darkness <= 0.02) return;
  const px = player.x - camera.x;
  const py = player.y - camera.y - 12;
  const fireX = campfire.x - camera.x;
  const fireY = campfire.y - camera.y - 18;
  const angle = Math.atan2(player.dirY, player.dirX);
  const beamRadius = flashlightBeamRadius();
  const beamHalfAngle = flashlightBeamHalfAngle();
  const mask = getNightMaskContext();

  mask.clearRect(0, 0, W, H);
  mask.globalCompositeOperation = "source-over";
  const brightnessScale = 1.25 - gameSettings.nightBrightness / 200;
  mask.fillStyle = `rgba(0, 1, 3, ${darkness * (player.flashlight ? 0.74 : 0.9) * brightnessScale})`;
  mask.fillRect(0, 0, W, H);
  mask.globalCompositeOperation = "destination-out";
  mask.fillStyle = "#000";

  if (player.flashlight) {
    mask.beginPath();
    mask.moveTo(px, py);
    mask.arc(px, py, beamRadius, angle - beamHalfAngle, angle + beamHalfAngle);
    mask.closePath();
    mask.fill();
    mask.beginPath();
    mask.arc(px, py, 48, 0, Math.PI * 2);
    mask.fill();
  }

  if (fireX > -150 && fireY > -150 && fireX < W + 150 && fireY < H + 150) {
    const safeRadius = 68 + darkness * 32;
    mask.beginPath();
    mask.arc(fireX, fireY, safeRadius, 0, Math.PI * 2);
    mask.fill();
  }

  mask.globalCompositeOperation = "source-over";
  ctx.drawImage(nightMaskCanvas, 0, 0);
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
  const radius = flashlightBeamRadius() + 6;
  const halfAngle = flashlightBeamHalfAngle();
  const stutter = darkness > 0.55 && Math.sin(elapsed * 0.73) > 0.985 ? 0.42 : 1;
  const flicker = (0.89 + Math.sin(elapsed * 21) * 0.055 + Math.sin(elapsed * 7.7) * 0.035) * stutter;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.translate(px, py);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, radius, -halfAngle, halfAngle);
  ctx.closePath();
  ctx.clip();
  const beam = ctx.createRadialGradient(0, 0, 14, 0, 0, radius);
  beam.addColorStop(0, `rgba(229, 240, 195, ${(0.14 + darkness * 0.14) * flicker})`);
  beam.addColorStop(0.5, `rgba(189, 213, 172, ${(0.08 + darkness * 0.08) * flicker})`);
  beam.addColorStop(1, "rgba(150, 183, 150, 0)");
  ctx.fillStyle = beam;
  ctx.fillRect(0, -radius, radius, radius * 2);
  ctx.restore();

  const local = ctx.createRadialGradient(px, py, 10, px, py, 74);
  local.addColorStop(0, `rgba(223, 236, 192, ${0.07 + darkness * 0.1})`);
  local.addColorStop(1, "rgba(170, 201, 160, 0)");
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = local;
  ctx.fillRect(px - 74, py - 74, 148, 148);
  ctx.restore();
}

function getFogShape(index, time = elapsed, darkness = nightIntensity()) {
  const baseWidth = 320 + hash(index + 70) * 480;
  const baseHeight = 58 + hash(index + 90) * 105;
  const speed = 8 + hash(index + 110) * 14;
  const direction = hash(index + 121) > 0.5 ? 1 : -1;
  const widthBreath = 0.88 + Math.sin(time * (0.12 + hash(index + 181) * 0.16) + index) * 0.18;
  const heightBreath = 0.86 + Math.cos(time * (0.15 + hash(index + 193) * 0.13) + index * 1.7) * 0.2;
  const width = baseWidth * widthBreath;
  const height = baseHeight * heightBreath;
  const loopWidth = W + baseWidth * 2;
  const rawX = hash(index + 130) * loopWidth + time * speed * direction - camera.x * 0.04;
  const wrappedX = ((rawX % loopWidth) + loopWidth) % loopWidth;
  const y = hash(index + 150) * H
    + Math.sin(time * 0.19 + index * 1.31) * 34
    + Math.cos(time * 0.075 + index) * 17;
  const alphaPulse = 0.7 + Math.sin(time * 0.29 + index * 2.17) * 0.3;
  return {
    width,
    height,
    x: wrappedX - baseWidth,
    y,
    rotation: Math.sin(time * 0.11 + index) * 0.055,
    alpha: (0.052 + darkness * 0.115) * (0.62 + hash(index + 170)) * alphaPulse
  };
}

function drawDriftingFog(darkness) {
  const fogCount = Math.round(16 * gameSettings.fogDensity / 100);
  for (let index = 0; index < fogCount; index += 1) {
    const fogShape = getFogShape(index, elapsed, darkness);
    ctx.save();
    ctx.translate(fogShape.x, fogShape.y);
    ctx.rotate(fogShape.rotation);
    ctx.scale(fogShape.width * 0.5, fogShape.height * 0.5);
    const fog = ctx.createRadialGradient(0, 0, 0.08, 0, 0, 1);
    fog.addColorStop(0, `rgba(185, 199, 191, ${fogShape.alpha})`);
    fog.addColorStop(0.56, `rgba(154, 174, 165, ${fogShape.alpha * 0.56})`);
    fog.addColorStop(1, "rgba(125, 149, 140, 0)");
    ctx.fillStyle = fog;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawWatchingEyes(darkness) {
  const px = player.x - camera.x;
  const py = player.y - camera.y - 12;
  const flashlightAngle = Math.atan2(player.dirY, player.dirX);
  const positions = [
    { x: 0.08, y: 0.28, seed: 241 },
    { x: 0.91, y: 0.38, seed: 257 },
    { x: 0.14, y: 0.76, seed: 269 },
    { x: 0.84, y: 0.78, seed: 283 },
    { x: 0.35, y: 0.09, seed: 307 },
    { x: 0.66, y: 0.91, seed: 331 }
  ];

  for (let index = 0; index < positions.length; index += 1) {
    const position = positions[index];
    const driftX = Math.sin(elapsed * 0.13 + position.seed) * 16;
    const driftY = Math.cos(elapsed * 0.09 + position.seed) * 10;
    const x = W * position.x + driftX;
    const y = H * position.y + driftY;
    const dx = x - px;
    const dy = y - py;
    const distance = Math.hypot(dx, dy);
    const pulse = Math.max(0, Math.sin(elapsed * 0.58 + index * 1.91));
    let alpha = (0.12 + darkness * 0.88) * (0.015 + Math.pow(pulse, 7) * (0.07 + darkness * 0.42));

    if (player.flashlight && distance < 330) {
      const eyeAngle = Math.atan2(dy, dx);
      const angleDifference = Math.abs(Math.atan2(Math.sin(eyeAngle - flashlightAngle), Math.cos(eyeAngle - flashlightAngle)));
      if (angleDifference < 0.57) alpha *= 0.08;
    }
    if (distance < 105) alpha = 0;

    const eyeGap = 7 + Math.round(hash(position.seed) * 3);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "#c62e35";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#d94a4d";
    ctx.fillRect(Math.round(x - eyeGap), Math.round(y), 4, 2);
    ctx.fillRect(Math.round(x + eyeGap - 4), Math.round(y), 4, 2);
    ctx.restore();
  }
}

function drawAirborneSpecks(darkness) {
  ctx.save();
  for (let index = 0; index < 46; index += 1) {
    const drift = elapsed * (3 + hash(index + 521) * 8);
    const x = (hash(index + 503) * (W + 80) + drift - camera.x * 0.012) % (W + 80) - 40;
    const y = (hash(index + 547) * (H + 60) + Math.sin(elapsed * 0.3 + index) * 13) % (H + 60) - 30;
    const size = hash(index + 563) > 0.78 ? 2 : 1;
    ctx.globalAlpha = (0.08 + darkness * 0.11) * (0.4 + hash(index + 577));
    ctx.fillStyle = hash(index + 593) > 0.72 ? "#a8b1a5" : "#07100d";
    ctx.fillRect(Math.round(x), Math.round(y), size, size);
  }
  ctx.restore();
}

function drawFilmGrain(darkness) {
  const frameSeed = Math.floor(elapsed * 10);
  ctx.save();
  ctx.globalAlpha = 0.035 + darkness * 0.045;
  for (let index = 0; index < 95; index += 1) {
    const x = Math.floor(hash(frameSeed * 191 + index * 17) * W);
    const y = Math.floor(hash(frameSeed * 223 + index * 29) * H);
    const light = hash(frameSeed * 251 + index * 31) > 0.83;
    ctx.fillStyle = light ? "#b5beb4" : "#000304";
    ctx.fillRect(x, y, light ? 1 : 2, 1);
  }
  ctx.restore();
}

function drawVignette(darkness) {
  const breathing = darkness * (0.02 + (Math.sin(elapsed * 0.72) + 1) * 0.018);
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.16, W / 2, H / 2, W * 0.67);
  vignette.addColorStop(0, "rgba(1, 4, 6, 0)");
  vignette.addColorStop(0.55, `rgba(1, 4, 6, ${0.055 + darkness * 0.1})`);
  vignette.addColorStop(1, `rgba(0, 2, 4, ${0.5 + darkness * 0.34 + breathing})`);
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
  // 打开物品栏、设置或暂停菜单时只画画面，不推进时间、玩家或怪物。
  if (!inventoryOpen && !settingsOpen && !pauseOpen && !classSelectionOpen) update(delta);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  if (settingsOpen) {
    if (event.code === "Escape" && !event.repeat) setSettingsOpen(false);
    return;
  }
  if (state !== "game") return;
  if (classSelectionOpen) return;
  if (event.code === "Escape") {
    if (event.repeat) return;
    if (inventoryOpen) setInventoryOpen(false);
    else setPauseOpen(!pauseOpen);
    return;
  }
  if (pauseOpen) return;
  if (event.code === "KeyM") {
    if (!event.repeat) setAudioEnabled(!audioEnabled);
    return;
  }
  if (event.code === "KeyI" || event.code === "Tab") {
    if (!event.repeat) setInventoryOpen(!inventoryOpen);
    return;
  }
  if (inventoryOpen) return;
  keys.add(event.code);
  if (event.code.startsWith("Digit")) {
    activateQuickSlot(Number(event.code.slice(5)) - 1);
    return;
  }
  // E 等一次性操作不能因为按键自动重复而反复触发。
  if (event.repeat && ["KeyE", "KeyF", "KeyR"].includes(event.code)) return;
  if (event.code === "KeyE") interact();
  if (event.code === "KeyR") reloadPistol();
  if (event.code === "KeyF") {
    player.flashlight = !player.flashlight;
    playTone({
      frequency: player.flashlight ? 520 : 310,
      endFrequency: player.flashlight ? 680 : 220,
      type: "square",
      duration: 0.055,
      volume: 0.025
    });
    showMessage(player.flashlight ? "打开手电筒" : "关闭手电筒", 1);
  }
});

canvas.addEventListener("pointerdown", (event) => {
  if (state !== "game" || inventoryOpen || settingsOpen || pauseOpen || classSelectionOpen) return;
  if (event.button !== 0 && event.button !== 2) return;
  event.preventDefault();
  aimAtPointer(event);
  if (event.button === 0) usePrimaryAction();
  if (event.button === 2) buildSelected();
});

canvas.addEventListener("pointermove", (event) => {
  if (state !== "game" || inventoryOpen || settingsOpen || pauseOpen || classSelectionOpen) return;
  aimAtPointer(event);
});

// 在游戏画布上按右键时只负责建造，不弹出浏览器菜单。
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());
startButton.addEventListener("click", startGame);
continueButton?.addEventListener("click", continueGame);
titleSettingsButton?.addEventListener("click", () => setSettingsOpen(true, "title"));
retryAssetsButton.addEventListener("click", loadGameAssets);
restartButton.addEventListener("click", startGame);
victoryTitleButton?.addEventListener("click", returnToTitle);
inventoryButton.addEventListener("click", () => {
  if (!pauseOpen && !settingsOpen) setInventoryOpen(!inventoryOpen);
});
audioButton?.addEventListener("click", () => setAudioEnabled(!audioEnabled));
resumeButton?.addEventListener("click", () => setPauseOpen(false));
saveButton?.addEventListener("click", () => saveGame(true));
pauseSettingsButton?.addEventListener("click", () => setSettingsOpen(true, "pause"));
exitToTitleButton?.addEventListener("click", () => {
  saveGame(false);
  returnToTitle();
});
settingsCloseButton?.addEventListener("click", () => setSettingsOpen(false));
volumeSetting?.addEventListener("input", () => updateGameSetting("volume", clampPercent(volumeSetting.value, 70)));
brightnessSetting?.addEventListener("input", () => (
  updateGameSetting("nightBrightness", clampPercent(brightnessSetting.value, 50))
));
fogSetting?.addEventListener("input", () => updateGameSetting("fogDensity", clampPercent(fogSetting.value, 100)));
screenShakeSetting?.addEventListener("change", () => updateGameSetting("screenShake", screenShakeSetting.checked));
jumpscareSetting?.addEventListener("change", () => updateGameSetting("jumpscare", jumpscareSetting.checked));
fullscreenButton?.addEventListener("click", toggleFullscreen);
resetSettingsButton?.addEventListener("click", () => {
  gameSettings = { ...DEFAULT_GAME_SETTINGS };
  saveGameSettings();
  renderSettings();
  showMessage("设置已恢复默认", 1);
});

function clearStorageDragState() {
  draggedInventorySlot = -1;
  draggedChestSlot = -1;
  draggedQuickSlot = -1;
  [...inventorySlots, ...chestSlots, ...quickSlots]
    .forEach((item) => item.classList.remove("dragging", "drag-over"));
}

inventorySlots.forEach((slot, index) => {
  slot.addEventListener("dragstart", (event) => {
    if (!inventoryItems[index]) {
      event.preventDefault();
      return;
    }
    draggedInventorySlot = index;
    draggedChestSlot = -1;
    draggedQuickSlot = -1;
    slot.classList.add("dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    }
  });
  slot.addEventListener("dragover", (event) => {
    if (draggedInventorySlot < 0 && draggedChestSlot < 0 && draggedQuickSlot < 0) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    [...inventorySlots, ...chestSlots, ...quickSlots].forEach((item) => item.classList.remove("drag-over"));
    slot.classList.add("drag-over");
  });
  slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
  slot.addEventListener("drop", (event) => {
    event.preventDefault();
    const sourceIndex = draggedInventorySlot;
    const sourceChestIndex = draggedChestSlot;
    const sourceQuickIndex = draggedQuickSlot;
    clearStorageDragState();
    if (sourceQuickIndex >= 0) {
      moveQuickbarToInventory(sourceQuickIndex, index);
      return;
    }
    if (sourceChestIndex >= 0) {
      moveChestToInventory(sourceChestIndex, index);
      return;
    }
    if (sourceIndex < 0 || sourceIndex === index || !inventoryItems[sourceIndex]) return;
    [inventoryItems[sourceIndex], inventoryItems[index]] = [
      inventoryItems[index],
      inventoryItems[sourceIndex]
    ];
    updateHud();
    saveGame(false);
    showMessage(inventoryItems[sourceIndex] ? "两个物品交换了位置" : "物品已移动", 0.9);
  });
  slot.addEventListener("dragend", clearStorageDragState);
  slot.addEventListener("click", () => {
    const item = inventoryItems[index];
    if (item?.type === "berry") useBerry();
    else if (item?.kind === "consumable") useConsumable(item.type);
  });
  slot.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    splitInventoryStack(index);
  });
});
chestSlots.forEach((slot, index) => {
  slot.addEventListener("dragstart", (event) => {
    const chest = currentChest();
    const items = chest ? normalizeChestStorage(chest) : [];
    if (!items[index]) {
      event.preventDefault();
      return;
    }
    draggedChestSlot = index;
    draggedInventorySlot = -1;
    draggedQuickSlot = -1;
    slot.classList.add("dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", `chest:${index}`);
    }
  });
  slot.addEventListener("dragover", (event) => {
    if (draggedInventorySlot < 0 && draggedChestSlot < 0) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    [...inventorySlots, ...chestSlots, ...quickSlots].forEach((item) => item.classList.remove("drag-over"));
    slot.classList.add("drag-over");
  });
  slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
  slot.addEventListener("drop", (event) => {
    event.preventDefault();
    const sourceInventoryIndex = draggedInventorySlot;
    const sourceChestIndex = draggedChestSlot;
    clearStorageDragState();
    if (sourceInventoryIndex >= 0) {
      moveInventoryToChest(sourceInventoryIndex, index);
      return;
    }
    if (sourceChestIndex >= 0) moveChestItem(sourceChestIndex, index);
  });
  slot.addEventListener("dragend", clearStorageDragState);
  slot.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    splitChestStack(index);
  });
});
quickSlots.forEach((slot, index) => {
  slot.addEventListener("click", () => {
    if (!pauseOpen && !settingsOpen) activateQuickSlot(Number(slot.dataset.quickSlot));
  });
  slot.addEventListener("dragstart", (event) => {
    if (!quickbarItems[index] || !inventoryOpen) {
      event.preventDefault();
      return;
    }
    draggedQuickSlot = index;
    draggedInventorySlot = -1;
    draggedChestSlot = -1;
    slot.classList.add("dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", `quick:${index}`);
    }
  });
  slot.addEventListener("dragover", (event) => {
    if (!inventoryOpen || (draggedInventorySlot < 0 && draggedQuickSlot < 0)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    [...inventorySlots, ...chestSlots, ...quickSlots].forEach((item) => item.classList.remove("drag-over"));
    slot.classList.add("drag-over");
  });
  slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
  slot.addEventListener("drop", (event) => {
    event.preventDefault();
    const sourceInventoryIndex = draggedInventorySlot;
    const sourceQuickIndex = draggedQuickSlot;
    clearStorageDragState();
    if (sourceInventoryIndex >= 0) {
      moveInventoryToQuickbar(sourceInventoryIndex, index);
      return;
    }
    if (sourceQuickIndex >= 0) moveQuickbarItem(sourceQuickIndex, index);
  });
  slot.addEventListener("dragend", clearStorageDragState);
});
craftButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const buildIndex = Number(button.dataset.recipe);
    if (Number.isInteger(buildIndex)) craftBuilding(buildIndex);
  });
});
weaponCraftButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const weaponIndex = Number(button.dataset.weaponRecipe);
    if (Number.isInteger(weaponIndex)) craftWeapon(weaponIndex);
  });
});

classButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state !== "game" || !classSelectionOpen) return;
    selectedClass = Number(button.dataset.class || 0);
    player.classRow = selectedClass;
    classButtons.forEach((item) => item.classList.toggle("selected", item === button));
    classSelectionOpen = false;
    classSelectPanel.classList.add("hidden");
    inventoryButton.disabled = false;
    keys.clear();
    lastTime = performance.now();
    const skill = CLASS_SKILLS[selectedClass];
    const startingItems = giveClassStartingItems(selectedClass);
    showMessage(`${CLASS_NAMES[selectedClass]} · ${skill.name}已生效；获得${startingItems}`, 2.6);
    updateHud();
    saveGame(false);
  });
});

window.addEventListener("beforeunload", () => saveGame(false));
updateHud();
updateAudioButton();
renderSettings();
updateContinueButton();
loadGameAssets();

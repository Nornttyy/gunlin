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
const DAY_LENGTH = 10 * 60;
const NIGHT_LENGTH = 15 * 60;
const CYCLE_LENGTH = DAY_LENGTH + NIGHT_LENGTH;
const WEATHER_TRANSITION_DURATION = 10;
const WEATHER_DEFINITIONS = {
  clear: { label: "晴朗", minDuration: 120, maxDuration: 240 },
  cloudy: { label: "阴天", minDuration: 100, maxDuration: 210 },
  rain: { label: "降雨", minDuration: 110, maxDuration: 230 },
  storm: { label: "雷暴", minDuration: 75, maxDuration: 150 }
};
const BLOOD_MOON_CHANCE = 0.22;
const BLOOD_MOON_HEALTH_MULTIPLIER = 1.5;
const BLOOD_MOON_DAMAGE_MULTIPLIER = 1.35;
const BLOOD_MOON_SPEED_MULTIPLIER = 1.3;
const BLOOD_MOON_SPAWN_INTERVAL_MULTIPLIER = 0.5;
const MIMIC_DETECTION_DISTANCE = 360;
const MIMIC_LOSE_DISTANCE = 540;
const MIMIC_ATTACK_DISTANCE = 27;
const MIMIC_JUMPSCARE_DAMAGE = 50;
const MIMIC_TELEPORT_MIN_DISTANCE = 650;
const MIMIC_TELEPORT_MAX_DISTANCE = 860;
const MIMIC_FRAME_SIZE = 32;
const MIMIC_DEATH_DURATION = 0.72;
const ZOMBIE_DETECTION_DISTANCE = 420;
const ZOMBIE_LOSE_DISTANCE = 620;
const ZOMBIE_ATTACK_DISTANCE = 25;
const ZOMBIE_ATTACK_DAMAGE = 18;
const ZOMBIE_FRAME_SIZE = 16;
const ZOMBIE_DEATH_DURATION = 0.72;
const AUDIO_PAN_DISTANCE = 420;
const PLAYER_ACCELERATION = 1200;
const PLAYER_TURN_ACCELERATION = 1900;
const PLAYER_DECELERATION = 900;
const PLAYER_STOP_SPEED = 2;
const BUILD_GRID_SIZE = TILE_SIZE;
const ESCAPE_GATE_MIN_DISTANCE = 700 * TILE_SIZE;
const ESCAPE_GATE_MAX_DISTANCE = 900 * TILE_SIZE;
const ESCAPE_GATE_DISCOVERY_DISTANCE = 550;
const ESCAPE_GATE_INTERACT_DISTANCE = 120;
const ABANDONED_CABIN_COUNT = 20;
const ABANDONED_CABIN_MIN_DISTANCE = 90 * TILE_SIZE;
const ABANDONED_CABIN_MAX_DISTANCE = 420 * TILE_SIZE;
const ABANDONED_CABIN_MIN_SPACING = 60 * TILE_SIZE;
const ABANDONED_CABIN_LANDMARK = "abandoned_cabin";
const SUPPLY_CACHE_COUNT = 12;
const SUPPLY_CACHE_MIN_DISTANCE = 28 * TILE_SIZE;
const SUPPLY_CACHE_MAX_DISTANCE = 88 * TILE_SIZE;
const SUPPLY_CACHE_MIN_SPACING = 16 * TILE_SIZE;
const SUPPLY_CACHE_LANDMARK = "supply_cache";
const SUPPLY_CACHE_TYPES = ["builder", "forager", "scavenger", "hunter"];
const MAP_CELL_TILES = 24;
const MAP_CELL_WORLD_SIZE = MAP_CELL_TILES * TILE_SIZE;
const MAP_COLUMNS = Math.ceil(WORLD.tileWidth / MAP_CELL_TILES);
const MAP_ROWS = Math.ceil(WORLD.tileHeight / MAP_CELL_TILES);
const ABANDONED_CABIN_TYPES = {
  normal: { label: "普通木屋" },
  damaged: { label: "破损木屋" },
  tool: { label: "工具木屋" },
  danger: { label: "危险木屋" }
};
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
const howToPlayButton = document.getElementById("howToPlayButton");
const howToPlayPanel = document.getElementById("howToPlayPanel");
const howToPlayCloseButton = document.getElementById("howToPlayCloseButton");
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
const fullscreenButton = document.getElementById("fullscreenButton");
const resetSettingsButton = document.getElementById("resetSettingsButton");
const pausePanel = document.getElementById("pausePanel");
const resumeButton = document.getElementById("resumeButton");
const saveButton = document.getElementById("saveButton");
const pauseSettingsButton = document.getElementById("pauseSettingsButton");
const exitToTitleButton = document.getElementById("exitToTitleButton");
const saveStatus = document.getElementById("saveStatus");
const emotePanel = document.getElementById("emotePanel");
const emoteButtons = [...document.querySelectorAll(".emote-button")];
const mapPanel = document.getElementById("mapPanel");
const mapCanvas = document.getElementById("mapCanvas");
const mapContext = mapCanvas?.getContext("2d");
const mapCloseButton = document.getElementById("mapCloseButton");
const mapStatus = document.getElementById("mapStatus");
const mapExplored = document.getElementById("mapExplored");
if (mapContext) mapContext.imageSmoothingEnabled = false;
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
const weatherLabel = document.getElementById("weatherLabel");
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
const supplyCraftButtons = [...document.querySelectorAll(".supply-craft-button")];
const craftStatus = document.getElementById("craftStatus");
const workbenchStatus = document.getElementById("workbenchStatus");
const inventoryItems = Array(12).fill(null);
const quickSlots = [...document.querySelectorAll(".quick-slot")];
const quickbarItems = Array(9).fill(null);
const RESOURCE_ITEMS = [
  { type: "wood", kind: "material", label: "木材" },
  { type: "stone", kind: "material", label: "石头" },
  { type: "berry", kind: "food", label: "浆果" },
  { type: "scrap", kind: "material", label: "废铁" }
];
const PORTABLE_ITEMS = [
  { type: "ammo_box", kind: "ammo", label: "弹药箱" },
  { type: "medkit", kind: "consumable", label: "医疗包" },
  { type: "healing_potion", kind: "consumable", label: "治疗药水" },
  { type: "strength_potion", kind: "consumable", label: "力量药水" },
  { type: "glass_bottle", kind: "container", label: "空玻璃瓶" },
  { type: "water_bottle", kind: "container", label: "水瓶" }
];
const PISTOL_MAGAZINE_SIZE = 7;
const SHOTGUN_MAGAZINE_SIZE = 2;
const PISTOL_BULLET_SPEED = 1600;
const PISTOL_BULLET_WIDTH = 10;
const SHOTGUN_PELLET_COUNT = 5;
const EQUIPMENT_TIERS = {
  wood: { harvestHitModifier: 2 },
  stone: { harvestHitModifier: 0 },
  iron: { harvestHitModifier: -2 }
};
const EMOTES = {
  thunder_spin: { label: "雷霆旋转", kind: "dance", duration: 0 },
  de_dance: { label: "德舞", kind: "dance", duration: 0 },
  wave: { label: "挥手", kind: "action", duration: 2.3 }
};
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

function equipmentTierDefinition(item) {
  return EQUIPMENT_TIERS[item?.tier] || null;
}

function equipmentDisplayLabel(item) {
  return item?.label || "";
}

function isHarvestTool(item) {
  return item?.equipmentClass === "tool"
    && (item.toolType === "axe" || item.toolType === "pickaxe");
}

function resourceHarvestHits(type, tool = null) {
  let hits = RESOURCE_HARVEST_HITS[type] || 1;
  if (type === "tree" && hasClassSkill(2)) hits -= 1;
  const requiredToolType = type === "tree" ? "axe" : type === "rock" ? "pickaxe" : "";
  if (requiredToolType && tool?.toolType === requiredToolType) {
    hits += equipmentTierDefinition(tool)?.harvestHitModifier || 0;
  }
  return Math.max(1, hits);
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

const ASSET_VERSION = "20260730-bottles1";
const PLAYER_ASSET_VERSION = "20260728-player-redraw1";
const TREE_ASSET_VERSION = "20260728-tree-visible2";
const MIMIC_ASSET_VERSION = "20260728-mimic-drawn1";
const ZOMBIE_ASSET_VERSION = "20260730-zombie1";
const ESCAPE_GATE_ASSET_VERSION = "20260729-gate-drawn1";
const HELD_WEAPON_FRAME = {
  club: 0,
  stone_hammer: 0,
  wood_axe: 1,
  axe: 1,
  iron_axe: 1,
  knife: 2,
  pistol: 3,
  shotgun: 4,
  wood_pickaxe: 5,
  pickaxe: 5,
  iron_pickaxe: 5
};
const MELEE_SWING_DURATION = 0.36;
const TOOL_SWING_DURATION = 0.44;
const PISTOL_RECOIL_DURATION = 0.18;
const SHOTGUN_RECOIL_DURATION = 0.26;
const ACTION_IMPACT_DURATION = 0.42;
const sprite = new Image();
const worldSprite = new Image();
const treeSprite = new Image();
const mimicSprite = new Image();
const zombieSprite = new Image();
const escapeGateSprite = new Image();
sprite.decoding = "async";
worldSprite.decoding = "async";
treeSprite.decoding = "async";
mimicSprite.decoding = "async";
zombieSprite.decoding = "async";
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
  { type: "wall", label: "木墙", cost: { wood: 3, stone: 1 }, health: 120, requiresWorkbench: true },
  { type: "door", label: "木门", cost: { wood: 4, stone: 1 }, health: 90, requiresWorkbench: true },
  { type: "floor", label: "木地板", cost: { wood: 2, stone: 0 }, health: 50, requiresWorkbench: true },
  { type: "chest", label: "储物箱", cost: { wood: 5, stone: 0 }, health: 110, requiresWorkbench: true },
  { type: "workbench", label: "工作台", cost: { wood: 6, stone: 2 }, health: 150, requiresWorkbench: false },
  { type: "trap", label: "陷阱", cost: { wood: 2, stone: 1 }, health: 40, uses: 3, requiresWorkbench: true }
];
const WEAPON_TYPES = [
  {
    type: "club", kind: "weapon", equipmentClass: "weapon", tier: "wood",
    label: "木棒", cost: { wood: 6, stone: 0 },
    damage: 25, range: 54, cooldown: 0.48, requiresWorkbench: true
  },
  {
    type: "axe", kind: "weapon", equipmentClass: "tool", toolType: "axe", tier: "stone",
    label: "石斧", cost: { wood: 6, stone: 6 },
    damage: 45, range: 62, cooldown: 0.62, requiresWorkbench: true
  },
  {
    type: "pickaxe", kind: "weapon", equipmentClass: "tool", toolType: "pickaxe", tier: "stone",
    label: "石镐", cost: { wood: 6, stone: 8 },
    damage: 38, range: 60, cooldown: 0.64, requiresWorkbench: true
  },
  {
    type: "knife", kind: "weapon", equipmentClass: "weapon", tier: "iron",
    label: "铁刀", cost: { wood: 8, stone: 10, scrap: 16 },
    damage: 42, range: 50, cooldown: 0.27, requiresWorkbench: true
  },
  {
    type: "pistol",
    kind: "weapon",
    equipmentClass: "weapon",
    tier: "iron",
    label: "手枪",
    cost: { wood: 16, stone: 18, scrap: 32 },
    damage: 32,
    range: 720,
    cooldown: 0.42,
    requiresWorkbench: true,
    magazineSize: PISTOL_MAGAZINE_SIZE
  },
  {
    type: "shotgun",
    kind: "weapon",
    equipmentClass: "weapon",
    tier: "iron",
    label: "霰弹枪",
    cost: { wood: 24, stone: 28, scrap: 52 },
    damage: 16,
    range: 500,
    cooldown: 0.8,
    requiresWorkbench: true,
    magazineSize: SHOTGUN_MAGAZINE_SIZE,
    pellets: SHOTGUN_PELLET_COUNT
  },
  {
    type: "wood_axe", kind: "weapon", equipmentClass: "tool", toolType: "axe", tier: "wood",
    label: "木斧", cost: { wood: 3 },
    damage: 24, range: 57, cooldown: 0.72, requiresWorkbench: true
  },
  {
    type: "iron_axe", kind: "weapon", equipmentClass: "tool", toolType: "axe", tier: "iron",
    label: "铁斧", cost: { wood: 10, stone: 12, scrap: 18 },
    damage: 58, range: 65, cooldown: 0.52, requiresWorkbench: true
  },
  {
    type: "wood_pickaxe", kind: "weapon", equipmentClass: "tool", toolType: "pickaxe", tier: "wood",
    label: "木镐", cost: { wood: 3 },
    damage: 20, range: 55, cooldown: 0.74, requiresWorkbench: true
  },
  {
    type: "iron_pickaxe", kind: "weapon", equipmentClass: "tool", toolType: "pickaxe", tier: "iron",
    label: "铁镐", cost: { wood: 10, stone: 16, scrap: 22 },
    damage: 52, range: 63, cooldown: 0.54, requiresWorkbench: true
  },
  {
    type: "stone_hammer", kind: "weapon", equipmentClass: "weapon", tier: "stone",
    label: "石锤", cost: { wood: 10, stone: 12 },
    damage: 38, range: 57, cooldown: 0.55, requiresWorkbench: true
  }
];
const SUPPLY_RECIPES = [
  { type: "ammo_box", label: "弹药箱", cost: { stone: 4, scrap: 8 }, requiresWorkbench: true },
  { type: "medkit", label: "医疗包", cost: { berry: 4, scrap: 1 }, requiresWorkbench: true },
  { type: "healing_potion", label: "治疗药水", cost: { berry: 3, water_bottle: 1 }, requiresWorkbench: true },
  { type: "strength_potion", label: "力量药水", cost: { berry: 5, water_bottle: 1 }, requiresWorkbench: true }
];
const RESOURCE_HARVEST_HITS = {
  tree: 7,
  rock: 6,
  berry: 3,
  branch: 1,
  pebble: 1,
  scrap: 2,
  glass_bottle: 1
};
const RESOURCE_GATHER_COOLDOWN = {
  tree: 0.42,
  rock: 0.46,
  berry: 0.3,
  branch: 0.16,
  pebble: 0.18,
  scrap: 0.28,
  glass_bottle: 0.16
};
const craftedCounts = Array(BUILD_TYPES.length).fill(0);
const DEFAULT_GAME_SETTINGS = {
  volume: 70,
  nightBrightness: 50,
  fogDensity: 100,
  screenShake: true
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
let howToPlayOpen = false;
let settingsOpen = false;
let pauseOpen = false;
let emoteOpen = false;
let mapOpen = false;
let activeEmote = null;
let emoteStartedAt = 0;
let settingsReturnTarget = "title";
let autosaveTimer = 20;
let activeChestId = null;
let draggedInventorySlot = -1;
let draggedChestSlot = -1;
let draggedQuickSlot = -1;
let jumpscareSequence = 0;
let audioContext = null;
let masterGain = null;
let effectsGain = null;
let ambienceGain = null;
let masterWarmthFilter = null;
let audioCompressor = null;
let noiseBuffer = null;
let audioEnabled = true;
let ambienceTimer = 1.5;
let weatherAudioTimer = 0.5;
let playerFootstepTimer = 0;
let playerFootstepSide = -1;
let nightMaskCanvas = null;
let nightMaskContext = null;
let assetsReady = false;
let assetsLoading = false;
let gameSettings = loadGameSettings();
const weather = {
  type: "clear",
  previousType: "clear",
  timer: 150,
  transition: 1,
  lightningTimer: 8,
  lightningFlash: 0,
  thunderDelay: -1,
  thunderPan: 0,
  wind: 0.18
};
let bloodMoonActive = false;
let bloodMoonNightNumber = 0;
let bloodMoonPulse = 0;
let actionEffectId = 0;

const player = {
  x: PLAYER_START.x,
  y: PLAYER_START.y,
  radius: 10,
  speed: 132,
  velocityX: 0,
  velocityY: 0,
  health: 100,
  wood: 0,
  stone: 0,
  berry: 0,
  scrap: 0,
  flashlight: true,
  classRow: 0,
  moving: false,
  dirX: 0,
  dirY: -1,
  animation: 0,
  attackTimer: 0,
  toolSwingTimer: 0,
  toolSwingType: "",
  toolSwingAngle: 0,
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
const RESOURCE_MAX_PER_CHUNK = 8;
const RESOURCE_MIN_GAP = 34;
const STARTER_RESOURCES = [
  { type: "branch", offsetX: -132, offsetY: 18 },
  { type: "branch", offsetX: 142, offsetY: 48 },
  { type: "branch", offsetX: -78, offsetY: 174 },
  { type: "pebble", offsetX: -164, offsetY: 108 },
  { type: "pebble", offsetX: 158, offsetY: 142 },
  { type: "scrap", offsetX: 34, offsetY: 214 },
  { type: "glass_bottle", offsetX: 188, offsetY: 82 }
];
let activeResourceChunk = "";
const monsters = [];
const projectiles = [];
const actionImpacts = [];
const barricades = [];
const doors = [];
const buildings = [];
const camera = { x: 0, y: 0 };
const pointerAim = { x: W / 2, y: H / 2, active: false };
const pistolShot = {
  timer: 0,
  duration: PISTOL_RECOIL_DURATION,
  weaponType: "pistol",
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  hit: false
};
const campfire = { ...CAMP_POSITION };
const escapeGate = { x: 0, y: 0, discovered: false };
const abandonedCabins = [];
const supplyCaches = [];
const exploredMapCells = new Set();

function hash(index) {
  const value = Math.sin(index * 91.173 + 12.91) * 43758.5453;
  return value - Math.floor(value);
}

function gridHash(x, y, seed = 0) {
  return hash(x * 374761 + y * 668265 + seed * 69069);
}

function mapCellKey(column, row) {
  return `${column}:${row}`;
}

function parseMapCellKey(key) {
  const [rawColumn, rawRow] = String(key).split(":");
  const column = Number(rawColumn);
  const row = Number(rawRow);
  if (!Number.isInteger(column) || !Number.isInteger(row)
    || column < 0 || row < 0 || column >= MAP_COLUMNS || row >= MAP_ROWS) return null;
  return { column, row };
}

function revealMapAroundPlayer() {
  const column = Math.max(0, Math.min(
    MAP_COLUMNS - 1,
    Math.floor(player.x / MAP_CELL_WORLD_SIZE)
  ));
  const row = Math.max(0, Math.min(
    MAP_ROWS - 1,
    Math.floor(player.y / MAP_CELL_WORLD_SIZE)
  ));
  exploredMapCells.add(mapCellKey(column, row));
}

function restoreExploredMapCells(savedCells) {
  exploredMapCells.clear();
  if (Array.isArray(savedCells)) {
    savedCells.forEach((key) => {
      const cell = parseMapCellKey(key);
      if (cell) exploredMapCells.add(mapCellKey(cell.column, cell.row));
    });
  }
  revealMapAroundPlayer();
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

function abandonedCabinGroundIsClear(x, y) {
  if (x < WORLD.margin + 210 || y < WORLD.margin + 210
    || x > WORLD.width - WORLD.margin - 210 || y > WORLD.height - WORLD.margin - 210) return false;
  if (Math.hypot(x - CAMP_POSITION.x, y - CAMP_POSITION.y) < ABANDONED_CABIN_MIN_DISTANCE - TILE_SIZE) return false;
  if (Math.hypot(x - escapeGate.x, y - escapeGate.y) < 420) return false;
  for (let offsetY = -120; offsetY <= 120; offsetY += 48) {
    for (let offsetX = -120; offsetX <= 120; offsetX += 48) {
      if (terrainAtWorld(x + offsetX, y + offsetY) !== TERRAIN_FRAME.grass) return false;
    }
  }
  return true;
}

function abandonedCabinSiteIsClear(x, y) {
  if (!abandonedCabinGroundIsClear(x, y)) return false;
  if (abandonedCabins.some((cabin) => (
    Math.hypot(x - cabin.x, y - cabin.y) < ABANDONED_CABIN_MIN_SPACING
  ))) return false;
  return !barricades.some((item) => Math.hypot(x - item.x, y - item.y) < 260)
    && !doors.some((item) => Math.hypot(x - item.x, y - item.y) < 260)
    && !buildings.some((item) => Math.hypot(x - item.x, y - item.y) < 260);
}

function normalizeAbandonedCabinType(type) {
  return ABANDONED_CABIN_TYPES[type] ? type : "normal";
}

function chooseAbandonedCabinType() {
  const types = Object.keys(ABANDONED_CABIN_TYPES);
  const counts = Object.fromEntries(types.map((type) => [type, 0]));
  abandonedCabins.forEach((cabin) => {
    counts[normalizeAbandonedCabinType(cabin.type)] += 1;
  });
  const minimum = Math.min(...Object.values(counts));
  const candidates = types.filter((type) => counts[type] === minimum);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function cabinLootItem(type, count = 1) {
  return normalizePortableItem({
    type,
    count,
    source: ABANDONED_CABIN_LANDMARK
  });
}

function createAbandonedCabinLoot(cabinType = "normal") {
  const type = normalizeAbandonedCabinType(cabinType);
  let loot = [];
  if (type === "damaged") {
    loot = [
      cabinLootItem("scrap", 2 + Math.floor(Math.random() * 4)),
      cabinLootItem("wood", 2 + Math.floor(Math.random() * 3)),
      cabinLootItem("stone", 1 + Math.floor(Math.random() * 3)),
      cabinLootItem("berry", 1 + Math.floor(Math.random() * 2))
    ];
    if (Math.random() < 0.35) loot.push(cabinLootItem("glass_bottle"));
  } else if (type === "tool") {
    const toolTypes = ["wood_axe", "axe", "wood_pickaxe", "pickaxe"];
    loot = [
      cabinLootItem("scrap", 8 + Math.floor(Math.random() * 7)),
      cabinLootItem("wood", 4 + Math.floor(Math.random() * 4)),
      cabinLootItem("stone", 4 + Math.floor(Math.random() * 4)),
      cabinLootItem(toolTypes[Math.floor(Math.random() * toolTypes.length)]),
      cabinLootItem("glass_bottle")
    ];
    if (Math.random() < 0.45) loot.push(cabinLootItem("medkit"));
  } else if (type === "danger") {
    loot = [
      cabinLootItem("scrap", 10 + Math.floor(Math.random() * 6)),
      cabinLootItem("wood", 6 + Math.floor(Math.random() * 5)),
      cabinLootItem("stone", 6 + Math.floor(Math.random() * 4)),
      cabinLootItem("berry", 3 + Math.floor(Math.random() * 4)),
      cabinLootItem("glass_bottle"),
      cabinLootItem("medkit"),
      cabinLootItem("ammo_box")
    ];
    if (Math.random() < 0.35) loot.push(cabinLootItem("strength_potion"));
  } else {
    loot = [
      cabinLootItem("scrap", 5 + Math.floor(Math.random() * 5)),
      cabinLootItem("wood", 4 + Math.floor(Math.random() * 4)),
      cabinLootItem("stone", 3 + Math.floor(Math.random() * 4)),
      cabinLootItem("berry", 2 + Math.floor(Math.random() * 3)),
      cabinLootItem("glass_bottle")
    ];
    if (Math.random() < 0.6) loot.push(cabinLootItem("medkit"));
    if (Math.random() < 0.35) loot.push(cabinLootItem("ammo_box"));
  }
  return Array.from({ length: CHEST_SLOT_COUNT }, (_, index) => loot[index] || null);
}

function generateAbandonedCabin(cabinIndex = abandonedCabins.length) {
  if (cabinIndex >= ABANDONED_CABIN_COUNT) return null;
  let cabinX = 0;
  let cabinY = 0;

  for (let attempt = 0; attempt < 800; attempt += 1) {
    const distanceRoll = Math.sqrt(Math.random());
    const distance = ABANDONED_CABIN_MIN_DISTANCE
      + distanceRoll * (ABANDONED_CABIN_MAX_DISTANCE - ABANDONED_CABIN_MIN_DISTANCE);
    const angle = Math.random() * Math.PI * 2;
    const rawX = CAMP_POSITION.x + Math.cos(angle) * distance;
    const rawY = CAMP_POSITION.y + Math.sin(angle) * distance;
    const x = Math.round(rawX / BUILD_GRID_SIZE) * BUILD_GRID_SIZE;
    const y = Math.round(rawY / BUILD_GRID_SIZE) * BUILD_GRID_SIZE;
    if (!abandonedCabinSiteIsClear(x, y)) continue;
    cabinX = x;
    cabinY = y;
    break;
  }
  if (!cabinX || !cabinY) return null;

  const wallDefinition = playerBuildingDefinition("wall");
  const doorDefinition = playerBuildingDefinition("door");
  const floorDefinition = playerBuildingDefinition("floor");
  const chestDefinition = playerBuildingDefinition("chest");
  const cabinId = `${ABANDONED_CABIN_LANDMARK}:${cabinIndex}`;
  const cabinType = chooseAbandonedCabinType();
  const addWall = (offsetX, offsetY, rotation) => {
    const health = wallDefinition.health;
    barricades.push({
      id: barricadeId++,
      x: cabinX + offsetX * BUILD_GRID_SIZE,
      y: cabinY + offsetY * BUILD_GRID_SIZE,
      vertical: Math.abs(Math.sin(rotation)) > 0.5,
      rotation,
      health,
      maxHealth: health,
      landmark: ABANDONED_CABIN_LANDMARK,
      landmarkId: cabinId
    });
  };

  const wallSegments = [];
  for (let gridX = -2; gridX <= 2; gridX += 1) {
    wallSegments.push([gridX, -2, 0]);
    if (gridX !== 0) wallSegments.push([gridX, 2, Math.PI]);
  }
  for (let gridY = -1; gridY <= 1; gridY += 1) {
    wallSegments.push([-2, gridY, -Math.PI / 2]);
    wallSegments.push([2, gridY, Math.PI / 2]);
  }
  const missingWalls = new Set();
  while (cabinType === "damaged" && missingWalls.size < 4) {
    missingWalls.add(Math.floor(Math.random() * wallSegments.length));
  }
  wallSegments.forEach((segment, index) => {
    if (!missingWalls.has(index)) addWall(...segment);
  });

  doors.push({
    id: doorId++,
    x: cabinX,
    y: cabinY + 2 * BUILD_GRID_SIZE,
    vertical: false,
    rotation: Math.PI,
    open: false,
    animation: 0,
    health: doorDefinition.health,
    maxHealth: doorDefinition.health,
    landmark: ABANDONED_CABIN_LANDMARK,
    landmarkId: cabinId
  });

  const floorTiles = [];
  for (let gridY = -1; gridY <= 1; gridY += 1) {
    for (let gridX = -1; gridX <= 1; gridX += 1) {
      floorTiles.push([gridX, gridY]);
    }
  }
  const missingFloors = new Set();
  while (cabinType === "damaged" && missingFloors.size < 3) {
    missingFloors.add(Math.floor(Math.random() * floorTiles.length));
  }
  floorTiles.forEach(([gridX, gridY], index) => {
    if (!missingFloors.has(index)) {
      buildings.push({
        id: buildingId++,
        type: "floor",
        x: cabinX + gridX * BUILD_GRID_SIZE,
        y: cabinY + gridY * BUILD_GRID_SIZE,
        health: floorDefinition.health,
        maxHealth: floorDefinition.health,
        landmark: ABANDONED_CABIN_LANDMARK,
        landmarkId: cabinId
      });
    }
  });

  if (cabinType === "tool") {
    const workbenchDefinition = playerBuildingDefinition("workbench");
    buildings.push({
      id: buildingId++,
      type: "workbench",
      x: cabinX - BUILD_GRID_SIZE,
      y: cabinY - BUILD_GRID_SIZE,
      health: workbenchDefinition.health,
      maxHealth: workbenchDefinition.health,
      landmark: ABANDONED_CABIN_LANDMARK,
      landmarkId: cabinId
    });
  }

  const chest = {
    id: buildingId++,
    type: "chest",
    x: cabinX + BUILD_GRID_SIZE,
    y: cabinY - BUILD_GRID_SIZE,
    health: chestDefinition.health,
    maxHealth: chestDefinition.health,
    items: createAbandonedCabinLoot(cabinType),
    landmark: ABANDONED_CABIN_LANDMARK,
    landmarkId: cabinId
  };
  buildings.push(chest);
  const cabin = {
    id: cabinId,
    x: cabinX,
    y: cabinY,
    type: cabinType,
    chestId: chest.id,
    searched: false,
    hasGateClue: cabinIndex % 4 === 0,
    clueFound: false
  };
  abandonedCabins.push(cabin);
  if (cabinType === "danger") {
    spawnMonsterAt("mimic", cabinX, cabinY, {
      cabinGuard: true,
      cabinId
    });
  }
  return cabin;
}

function generateAbandonedCabins() {
  while (abandonedCabins.length < ABANDONED_CABIN_COUNT) {
    if (!generateAbandonedCabin(abandonedCabins.length)) break;
  }
  return abandonedCabins.length;
}

function restoreAbandonedCabins(savedCabins, savedLegacyCabin) {
  abandonedCabins.length = 0;
  if (Array.isArray(savedCabins)) {
    savedCabins.slice(0, ABANDONED_CABIN_COUNT).forEach((cabin, index) => {
      if (!Number.isFinite(cabin?.x) || !Number.isFinite(cabin?.y)) return;
      abandonedCabins.push({
        id: typeof cabin.id === "string"
          ? cabin.id
          : `${ABANDONED_CABIN_LANDMARK}:${index}`,
        x: cabin.x,
        y: cabin.y,
        type: normalizeAbandonedCabinType(cabin.type),
        chestId: Number.isFinite(cabin.chestId) ? cabin.chestId : null,
        searched: Boolean(cabin.searched),
        hasGateClue: typeof cabin.hasGateClue === "boolean"
          ? cabin.hasGateClue
          : index % 4 === 0,
        clueFound: Boolean(cabin.clueFound)
      });
    });
  } else if (savedLegacyCabin?.generated
    && Number.isFinite(savedLegacyCabin.x)
    && Number.isFinite(savedLegacyCabin.y)) {
    const legacyId = `${ABANDONED_CABIN_LANDMARK}:0`;
    abandonedCabins.push({
      id: legacyId,
      x: savedLegacyCabin.x,
      y: savedLegacyCabin.y,
      type: normalizeAbandonedCabinType(savedLegacyCabin.type),
      chestId: Number.isFinite(savedLegacyCabin.chestId) ? savedLegacyCabin.chestId : null,
      searched: Boolean(savedLegacyCabin.searched),
      hasGateClue: true,
      clueFound: Boolean(savedLegacyCabin.clueFound)
    });
    for (const item of [...barricades, ...doors, ...buildings]) {
      if (item.landmark === ABANDONED_CABIN_LANDMARK && !item.landmarkId) {
        item.landmarkId = legacyId;
      }
    }
  }
  generateAbandonedCabins();
}

function normalizeSupplyCacheType(type) {
  return SUPPLY_CACHE_TYPES.includes(type) ? type : SUPPLY_CACHE_TYPES[0];
}

function chooseSupplyCacheType() {
  const counts = Object.fromEntries(SUPPLY_CACHE_TYPES.map((type) => [type, 0]));
  supplyCaches.forEach((cache) => {
    counts[normalizeSupplyCacheType(cache.type)] += 1;
  });
  const minimum = Math.min(...Object.values(counts));
  const candidates = SUPPLY_CACHE_TYPES.filter((type) => counts[type] === minimum);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function supplyCacheLootItem(type, count = 1) {
  return normalizePortableItem({
    type,
    count,
    source: SUPPLY_CACHE_LANDMARK
  });
}

function createSupplyCacheLoot(cacheType = SUPPLY_CACHE_TYPES[0]) {
  const type = normalizeSupplyCacheType(cacheType);
  let loot = [];
  if (type === "forager") {
    loot = [
      supplyCacheLootItem("berry", 2 + Math.floor(Math.random() * 3)),
      supplyCacheLootItem("wood", 1 + Math.floor(Math.random() * 2))
    ];
    if (Math.random() < 0.35) loot.push(supplyCacheLootItem("medkit"));
    if (Math.random() < 0.45) loot.push(supplyCacheLootItem("glass_bottle"));
  } else if (type === "scavenger") {
    loot = [
      supplyCacheLootItem("scrap", 3 + Math.floor(Math.random() * 3)),
      supplyCacheLootItem("stone", 1 + Math.floor(Math.random() * 2))
    ];
    if (Math.random() < 0.55) loot.push(supplyCacheLootItem("glass_bottle"));
  } else if (type === "hunter") {
    loot = [
      supplyCacheLootItem("berry", 2 + Math.floor(Math.random() * 2)),
      supplyCacheLootItem("scrap", 2 + Math.floor(Math.random() * 2))
    ];
    if (Math.random() < 0.3) loot.push(supplyCacheLootItem("ammo_box"));
  } else {
    loot = [
      supplyCacheLootItem("wood", 3 + Math.floor(Math.random() * 3)),
      supplyCacheLootItem("stone", 2 + Math.floor(Math.random() * 2))
    ];
    if (Math.random() < 0.4) loot.push(supplyCacheLootItem("scrap", 1 + Math.floor(Math.random() * 2)));
  }
  return Array.from({ length: CHEST_SLOT_COUNT }, (_, index) => loot[index] || null);
}

function supplyCacheSiteIsClear(x, y) {
  if (x < WORLD.margin + 80 || y < WORLD.margin + 80
    || x > WORLD.width - WORLD.margin - 80 || y > WORLD.height - WORLD.margin - 80) return false;
  const distanceFromCamp = Math.hypot(x - CAMP_POSITION.x, y - CAMP_POSITION.y);
  if (distanceFromCamp < SUPPLY_CACHE_MIN_DISTANCE - TILE_SIZE
    || distanceFromCamp > SUPPLY_CACHE_MAX_DISTANCE + TILE_SIZE) return false;
  const groundPoints = [
    [0, 0],
    [-32, 0],
    [32, 0],
    [0, -32],
    [0, 32]
  ];
  if (!groundPoints.every(([offsetX, offsetY]) => (
    terrainAtWorld(x + offsetX, y + offsetY) === TERRAIN_FRAME.grass
  ))) return false;
  if (Math.hypot(x - escapeGate.x, y - escapeGate.y) < 250) return false;
  if (abandonedCabins.some((cabin) => Math.hypot(x - cabin.x, y - cabin.y) < 300)) return false;
  if (supplyCaches.some((cache) => (
    Math.hypot(x - cache.x, y - cache.y) < SUPPLY_CACHE_MIN_SPACING
  ))) return false;
  return !barricades.some((item) => Math.hypot(x - item.x, y - item.y) < 96)
    && !doors.some((item) => Math.hypot(x - item.x, y - item.y) < 96)
    && !buildings.some((item) => Math.hypot(x - item.x, y - item.y) < 96);
}

function generateSupplyCache(cacheIndex = supplyCaches.length) {
  if (cacheIndex >= SUPPLY_CACHE_COUNT) return null;
  let cacheX = 0;
  let cacheY = 0;
  for (let attempt = 0; attempt < 600; attempt += 1) {
    const distanceRoll = Math.pow(Math.random(), 1.35);
    const distance = SUPPLY_CACHE_MIN_DISTANCE
      + distanceRoll * (SUPPLY_CACHE_MAX_DISTANCE - SUPPLY_CACHE_MIN_DISTANCE);
    const angle = Math.random() * Math.PI * 2;
    const x = Math.round(
      (CAMP_POSITION.x + Math.cos(angle) * distance) / BUILD_GRID_SIZE
    ) * BUILD_GRID_SIZE;
    const y = Math.round(
      (CAMP_POSITION.y + Math.sin(angle) * distance) / BUILD_GRID_SIZE
    ) * BUILD_GRID_SIZE;
    if (!supplyCacheSiteIsClear(x, y)) continue;
    cacheX = x;
    cacheY = y;
    break;
  }
  if (!cacheX || !cacheY) return null;

  const cacheId = `${SUPPLY_CACHE_LANDMARK}:${cacheIndex}`;
  const cacheType = chooseSupplyCacheType();
  const chestDefinition = playerBuildingDefinition("chest");
  const chest = {
    id: buildingId++,
    type: "chest",
    x: cacheX,
    y: cacheY,
    health: chestDefinition.health,
    maxHealth: chestDefinition.health,
    items: createSupplyCacheLoot(cacheType),
    landmark: SUPPLY_CACHE_LANDMARK,
    landmarkId: cacheId,
    cacheType,
    searched: false
  };
  buildings.push(chest);
  const cache = {
    id: cacheId,
    x: cacheX,
    y: cacheY,
    type: cacheType,
    chestId: chest.id,
    searched: false,
    destroyed: false
  };
  supplyCaches.push(cache);
  return cache;
}

function generateSupplyCaches() {
  while (supplyCaches.length < SUPPLY_CACHE_COUNT) {
    if (!generateSupplyCache(supplyCaches.length)) break;
  }
  return supplyCaches.length;
}

function restoreSupplyCaches(savedCaches) {
  supplyCaches.length = 0;
  if (Array.isArray(savedCaches)) {
    savedCaches.slice(0, SUPPLY_CACHE_COUNT).forEach((cache, index) => {
      if (!Number.isFinite(cache?.x) || !Number.isFinite(cache?.y)) return;
      const chest = buildings.find((building) => (
        building.type === "chest"
        && (building.id === cache.chestId || building.landmarkId === cache.id)
      ));
      const id = typeof cache.id === "string"
        ? cache.id
        : `${SUPPLY_CACHE_LANDMARK}:${index}`;
      if (chest) {
        chest.landmark = SUPPLY_CACHE_LANDMARK;
        chest.landmarkId = id;
        chest.cacheType = normalizeSupplyCacheType(cache.type);
        chest.searched = Boolean(cache.searched);
      }
      supplyCaches.push({
        id,
        x: cache.x,
        y: cache.y,
        type: normalizeSupplyCacheType(cache.type),
        chestId: chest?.id ?? (Number.isFinite(cache.chestId) ? cache.chestId : null),
        searched: Boolean(cache.searched),
        destroyed: Boolean(cache.destroyed) || !chest
      });
    });
  } else {
    buildings.filter((building) => (
      building.type === "chest" && building.landmark === SUPPLY_CACHE_LANDMARK
    )).slice(0, SUPPLY_CACHE_COUNT).forEach((chest, index) => {
      const id = chest.landmarkId || `${SUPPLY_CACHE_LANDMARK}:${index}`;
      chest.landmarkId = id;
      supplyCaches.push({
        id,
        x: chest.x,
        y: chest.y,
        type: normalizeSupplyCacheType(chest.cacheType),
        chestId: chest.id,
        searched: Boolean(chest.searched),
        destroyed: false
      });
    });
  }
  generateSupplyCaches();
}

function escapeGateDistance() {
  return Math.hypot(player.x - escapeGate.x, player.y - escapeGate.y);
}

function directionToWorldPosition(x, y) {
  const angle = Math.atan2(y - player.y, x - player.x);
  const directions = ["东", "东南", "南", "西南", "西", "西北", "北", "东北"];
  const index = Math.round(angle / (Math.PI / 4));
  return directions[(index + 8) % 8];
}

function escapeGateDirection() {
  return directionToWorldPosition(escapeGate.x, escapeGate.y);
}

function qualitativeDistance(distance) {
  const tiles = distance / TILE_SIZE;
  if (tiles < 12) return "就在附近";
  if (tiles < 36) return "不远处";
  if (tiles < 72) return "较远处";
  return "远处";
}

function resourceOverlapsEscapeGate(x, y, radius) {
  return Math.abs(x - escapeGate.x) < 118 + radius
    && Math.abs(y - escapeGate.y) < 105 + radius;
}

function resourceOverlapsAbandonedCabin(x, y, radius) {
  return abandonedCabins.some((cabin) => (
    Math.abs(x - cabin.x) < 176 + radius
    && Math.abs(y - cabin.y) < 176 + radius
  ));
}

function resourceOverlapsSupplyCache(x, y, radius) {
  return supplyCaches.some((cache) => (
    !cache.destroyed
    && Math.abs(x - cache.x) < 56 + radius
    && Math.abs(y - cache.y) < 56 + radius
  ));
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

  for (let candidate = 0; candidate < 30 && generated < RESOURCE_MAX_PER_CHUNK; candidate += 1) {
    const spawnKey = `${key}:${candidate}`;
    if (harvestedResourceKeys.has(spawnKey)) continue;
    const x = originX + 36 + gridHash(chunkX, chunkY, candidate * 4 + 1) * (RESOURCE_CHUNK_SIZE - 72);
    const y = originY + 36 + gridHash(chunkX, chunkY, candidate * 4 + 2) * (RESOURCE_CHUNK_SIZE - 72);
    if (x < WORLD.margin || y < WORLD.margin || x > WORLD.width - WORLD.margin || y > WORLD.height - WORLD.margin) continue;
    if (Math.hypot(x - campfire.x, y - campfire.y) < 230) continue;
    if (isInsideSpawnCorridor(x, y)) continue;
    const roll = gridHash(chunkX, chunkY, candidate * 4 + 3);
    const type = roll < 0.42
      ? "tree"
      : roll < 0.60
        ? "rock"
        : roll < 0.73
          ? "berry"
          : roll < 0.82
            ? "branch"
            : roll < 0.89
              ? "pebble"
              : roll < 0.96 ? "scrap" : "glass_bottle";
    const radius = type === "tree"
      ? 24
      : type === "rock"
        ? 15
        : type === "berry" ? 18 : type === "scrap" ? 9 : 8;
    if (resourceOverlapsEscapeGate(x, y, radius)) continue;
    if (resourceOverlapsAbandonedCabin(x, y, radius)) continue;
    if (resourceOverlapsSupplyCache(x, y, radius)) continue;
    const treeFrame = type === "tree" && gridHash(chunkX, chunkY, candidate * 7 + 101) < 0.22 ? 1 : 0;
    if ((type === "tree" || type === "berry") && !canPlantGrowAt(x, y, radius)) continue;
    if (type === "rock" && !canResourceRestOnDryGround(x, y, radius)) continue;
    if ((type === "branch" || type === "pebble" || type === "scrap")
      && terrainAtWorld(x, y) !== TERRAIN_FRAME.grass) continue;
    if (type === "glass_bottle" && terrainAtWorld(x, y) === TERRAIN_FRAME.water) continue;
    if (resources.some((item) => (
      Math.hypot(x - item.x, y - item.y) < radius + item.radius + RESOURCE_MIN_GAP
    ))) continue;
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

function findStarterResourceSpot(definition) {
  const baseX = PLAYER_START.x + definition.offsetX;
  const baseY = PLAYER_START.y + definition.offsetY;
  for (let ring = 0; ring <= 6; ring += 1) {
    for (let gridY = -ring; gridY <= ring; gridY += 1) {
      for (let gridX = -ring; gridX <= ring; gridX += 1) {
        if (ring > 0 && Math.abs(gridX) !== ring && Math.abs(gridY) !== ring) continue;
        const x = baseX + gridX * 16;
        const y = baseY + gridY * 16;
        if (terrainAtWorld(x, y) !== TERRAIN_FRAME.grass) continue;
        if (Math.hypot(x - campfire.x, y - campfire.y) < 44) continue;
        if (Math.hypot(x - PLAYER_START.x, y - PLAYER_START.y) < 24) continue;
        if (resources.some((item) => Math.hypot(x - item.x, y - item.y) < item.radius + 20)) continue;
        return { x, y };
      }
    }
  }
  return null;
}

function generateStarterResources() {
  STARTER_RESOURCES.forEach((definition, index) => {
    const spawnKey = `starter:${definition.type}:${index}`;
    if (harvestedResourceKeys.has(spawnKey)
      || resources.some((item) => item.spawnKey === spawnKey)) return;
    const position = findStarterResourceSpot(definition);
    if (!position) return;
    resources.push({
      id: resourceId++,
      spawnKey,
      x: position.x,
      y: position.y,
      type: definition.type,
      radius: 8,
      harvestHits: 0
    });
  });
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
        : path === "assets/zombie.png"
          ? ZOMBIE_ASSET_VERSION
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
      screenShake: parsed.screenShake !== false
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
    weather: serializeWeather(),
    bloodMoon: {
      active: bloodMoonActive,
      nightNumber: bloodMoonNightNumber
    },
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
      scrap: player.scrap,
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
    escapeGate: { ...escapeGate },
    exploredMapCells: [...exploredMapCells],
    abandonedCabins: abandonedCabins.map((cabin) => ({ ...cabin })),
    supplyCaches: supplyCaches.map((cache) => ({ ...cache })),
    abandonedCabin: abandonedCabins[0]
      ? { generated: true, ...abandonedCabins[0] }
      : { generated: false }
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

function spatialAttenuation(worldX, worldY, range = 720) {
  if (!Number.isFinite(worldX) || !Number.isFinite(worldY)) return 1;
  const distance = Math.hypot(worldX - player.x, worldY - player.y);
  const normalized = Math.max(0, 1 - distance / Math.max(1, range));
  return normalized ** 1.35;
}

function ensureAudio() {
  if (!audioEnabled) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) {
    try {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      effectsGain = audioContext.createGain();
      ambienceGain = audioContext.createGain();
      masterWarmthFilter = audioContext.createBiquadFilter();
      audioCompressor = audioContext.createDynamicsCompressor?.() || null;
      masterGain.gain.value = masterVolumeValue();
      effectsGain.gain.value = 0.78;
      ambienceGain.gain.value = 0.34;
      masterWarmthFilter.type = "lowpass";
      masterWarmthFilter.frequency.setValueAtTime(4600, audioContext.currentTime);
      masterWarmthFilter.Q.setValueAtTime(0.35, audioContext.currentTime);
      effectsGain.connect(masterGain);
      ambienceGain.connect(masterGain);
      masterGain.connect(masterWarmthFilter);
      if (audioCompressor) {
        audioCompressor.threshold.setValueAtTime(-22, audioContext.currentTime);
        audioCompressor.knee.setValueAtTime(18, audioContext.currentTime);
        audioCompressor.ratio.setValueAtTime(8, audioContext.currentTime);
        audioCompressor.attack.setValueAtTime(0.006, audioContext.currentTime);
        audioCompressor.release.setValueAtTime(0.28, audioContext.currentTime);
        masterWarmthFilter.connect(audioCompressor);
        audioCompressor.connect(audioContext.destination);
      } else {
        masterWarmthFilter.connect(audioContext.destination);
      }
    } catch {
      audioContext = null;
      masterGain = null;
      effectsGain = null;
      ambienceGain = null;
      masterWarmthFilter = null;
      audioCompressor = null;
      return null;
    }
  }
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function connectAudioOutput(node, worldX = null, panOverride = null, bus = "effects") {
  if (!audioContext || !masterGain) return;
  const output = bus === "ambience" ? (ambienceGain || masterGain) : (effectsGain || masterGain);
  const pan = panOverride === null
    ? (worldX === null ? 0 : audioPanForWorldX(worldX))
    : Math.max(-1, Math.min(1, panOverride));
  if (audioContext.createStereoPanner) {
    const panner = audioContext.createStereoPanner();
    panner.pan.setValueAtTime(pan, audioContext.currentTime);
    node.connect(panner);
    panner.connect(output);
  } else {
    node.connect(output);
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
  worldY = null,
  range = 720,
  pan = null,
  bus = "effects",
  attack = 0.012
}) {
  const context = ensureAudio();
  if (!context) return;
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const toneFilter = context.createBiquadFilter();
  const gain = context.createGain();
  oscillator.type = type === "sine" ? "sine" : "triangle";
  const startFrequency = Math.max(20, Math.min(1600, frequency));
  const finishFrequency = Math.max(20, Math.min(1600, endFrequency));
  oscillator.frequency.setValueAtTime(startFrequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(finishFrequency, start + duration);
  toneFilter.type = "lowpass";
  toneFilter.frequency.setValueAtTime(2100, start);
  toneFilter.Q.setValueAtTime(0.3, start);
  const spatialVolume = Math.min(0.085, volume) * spatialAttenuation(worldX, worldY, range);
  const safeAttack = Math.max(0.004, attack);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, spatialVolume),
    start + Math.min(safeAttack, duration * 0.4)
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(toneFilter);
  toneFilter.connect(gain);
  connectAudioOutput(gain, worldX, pan, bus);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function getNoiseBuffer() {
  const context = ensureAudio();
  if (!context) return null;
  if (noiseBuffer) return noiseBuffer;
  noiseBuffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
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
  resonance = 0.8,
  delay = 0,
  worldX = null,
  worldY = null,
  range = 720,
  pan = null,
  bus = "effects",
  attack = 0.018
} = {}) {
  const context = ensureAudio();
  const buffer = getNoiseBuffer();
  if (!context || !buffer) return;
  const start = context.currentTime + delay;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = filterType === "highpass" ? "bandpass" : filterType;
  filter.frequency.setValueAtTime(Math.max(80, Math.min(2200, frequency)), start);
  filter.Q.setValueAtTime(Math.max(0.2, Math.min(1.4, resonance)), start);
  const spatialVolume = Math.min(0.11, volume) * spatialAttenuation(worldX, worldY, range);
  const safeAttack = Math.max(0.003, attack);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, spatialVolume),
    start + Math.min(safeAttack, duration * 0.4)
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  connectAudioOutput(gain, worldX, pan, bus);
  source.start(start, Math.random() * Math.max(0.01, buffer.duration - duration), duration);
}

function distanceVolume(worldX, worldY, maximum, range = 700) {
  return maximum * spatialAttenuation(worldX, worldY, range);
}

function playGatherSound(type, worldX, worldY) {
  if (type === "wood") {
    playNoise({
      duration: 0.075, volume: 0.065, frequency: 640, filterType: "bandpass",
      resonance: 1.4, attack: 0.004, worldX, worldY, range: 260
    });
    playTone({
      frequency: 156, endFrequency: 82, type: "triangle", duration: 0.09,
      volume: 0.052, attack: 0.004, worldX, worldY, range: 260
    });
    playNoise({
      duration: 0.055, volume: 0.026, frequency: 1050, filterType: "bandpass",
      delay: 0.055, attack: 0.003, worldX, worldY, range: 260
    });
  } else if (type === "stone" || type === "scrap") {
    playNoise({
      duration: 0.055, volume: 0.042, frequency: 1250, filterType: "bandpass",
      attack: 0.004, worldX, worldY, range: 280
    });
    playTone({
      frequency: 760, endFrequency: 420, type: "triangle", duration: 0.11,
      volume: 0.046, attack: 0.002, worldX, worldY, range: 280
    });
    playTone({
      frequency: 1120, endFrequency: 620, type: "sine", duration: 0.08,
      volume: 0.025, delay: 0.026, attack: 0.002, worldX, worldY, range: 280
    });
  } else {
    playNoise({
      duration: 0.13, volume: 0.026, frequency: 1500, filterType: "bandpass",
      resonance: 0.5, worldX, worldY, range: 220
    });
    playTone({
      frequency: 490, endFrequency: 710, type: "sine", duration: 0.12,
      volume: 0.026, worldX, worldY, range: 220
    });
  }
}

function playPickupSound(type) {
  const stone = type === "stone" || type === "scrap";
  const berry = type === "berry";
  playNoise({
    duration: berry ? 0.09 : 0.055,
    volume: berry ? 0.018 : 0.028,
    frequency: stone ? 1050 : berry ? 620 : 480,
    filterType: stone ? "bandpass" : "lowpass",
    resonance: 0.45,
    attack: 0.006
  });
  if (berry) return;
  playTone({
    frequency: stone ? 360 : 112,
    endFrequency: stone ? 245 : 72,
    type: "triangle",
    duration: stone ? 0.075 : 0.065,
    volume: stone ? 0.02 : 0.018,
    attack: 0.005
  });
}

function playDryFireSound() {
  playNoise({
    duration: 0.032, volume: 0.025, frequency: 820,
    filterType: "bandpass", resonance: 0.65, attack: 0.004
  });
  playTone({
    frequency: 135, endFrequency: 98, type: "triangle",
    duration: 0.038, volume: 0.016, delay: 0.012, attack: 0.004
  });
}

function playFlashlightSwitchSound(enabled) {
  playNoise({
    duration: 0.028, volume: 0.024, frequency: enabled ? 760 : 590,
    filterType: "bandpass", resonance: 0.55, attack: 0.004
  });
  playTone({
    frequency: enabled ? 150 : 118,
    endFrequency: enabled ? 185 : 82,
    type: "triangle", duration: 0.045, volume: 0.014,
    delay: 0.008, attack: 0.004
  });
}

function playPlayerFootstep() {
  const sand = terrainAtWorld(player.x, player.y) === TERRAIN_FRAME.sand;
  playerFootstepSide *= -1;
  playNoise({
    duration: sand ? 0.095 : 0.065,
    volume: sand ? 0.028 : 0.022,
    frequency: sand ? 720 : 460,
    filterType: sand ? "lowpass" : "bandpass",
    resonance: sand ? 0.45 : 0.8,
    pan: playerFootstepSide * 0.065,
    attack: 0.003
  });
  playTone({
    frequency: sand ? 92 : 78,
    endFrequency: sand ? 58 : 46,
    type: "sine",
    duration: 0.075,
    volume: sand ? 0.013 : 0.017,
    pan: playerFootstepSide * 0.065,
    attack: 0.003
  });
}

function playWeaponSound(worldX, worldY, hit) {
  playNoise({
    duration: 0.13, volume: 0.04, frequency: 900, filterType: "bandpass",
    resonance: 0.45, attack: 0.008, worldX, worldY, range: 400
  });
  if (!hit) return;
  playNoise({
    duration: 0.085, volume: 0.075, frequency: 440, filterType: "bandpass",
    resonance: 0.7, delay: 0.035, attack: 0.003, worldX, worldY, range: 430
  });
  playTone({
    frequency: 142, endFrequency: 66, type: "triangle", duration: 0.11,
    volume: 0.055, delay: 0.035, attack: 0.003, worldX, worldY, range: 430
  });
}

function playPistolSound(worldX, worldY = player.y) {
  playNoise({
    duration: 0.065, volume: 0.095, frequency: 1850, filterType: "bandpass",
    resonance: 0.5, attack: 0.004, worldX, worldY, range: 1200
  });
  playTone({
    frequency: 148, endFrequency: 52, type: "triangle", duration: 0.15,
    volume: 0.058, attack: 0.004, worldX, worldY, range: 1200
  });
  playTone({
    frequency: 720, endFrequency: 410, type: "triangle", duration: 0.045,
    volume: 0.018, delay: 0.038, attack: 0.004, worldX, worldY, range: 420
  });
  playNoise({
    duration: 0.22, volume: 0.026, frequency: 880, filterType: "bandpass",
    resonance: 1.2, delay: 0.095, pan: (Math.random() - 0.5) * 0.5,
    bus: "ambience", attack: 0.012
  });
}

function playShotgunSound(worldX, worldY = player.y) {
  playNoise({
    duration: 0.11, volume: 0.105, frequency: 980, filterType: "bandpass",
    resonance: 0.42, attack: 0.003, worldX, worldY, range: 1400
  });
  playTone({
    frequency: 112, endFrequency: 38, type: "triangle", duration: 0.24,
    volume: 0.085, attack: 0.003, worldX, worldY, range: 1400
  });
  playNoise({
    duration: 0.28, volume: 0.038, frequency: 520, filterType: "lowpass",
    delay: 0.07, attack: 0.01, worldX, worldY, range: 900
  });
}

function playBulletImpact(worldX, worldY) {
  playNoise({
    duration: 0.065, volume: 0.075, frequency: 1350, filterType: "bandpass",
    resonance: 1.1, attack: 0.002, worldX, worldY, range: 900
  });
  playTone({
    frequency: 430, endFrequency: 130, type: "triangle", duration: 0.09,
    volume: 0.04, attack: 0.002, worldX, worldY, range: 900
  });
}

function playReloadSound() {
  playNoise({ duration: 0.04, volume: 0.03, frequency: 1050, filterType: "bandpass", attack: 0.004 });
  playTone({
    frequency: 210, endFrequency: 150, type: "triangle", duration: 0.06,
    volume: 0.02, delay: 0.025, attack: 0.004
  });
  playNoise({
    duration: 0.045, volume: 0.048, frequency: 1250, filterType: "bandpass",
    delay: 0.18, attack: 0.004
  });
  playTone({
    frequency: 170, endFrequency: 260, type: "triangle", duration: 0.07,
    volume: 0.024, delay: 0.205, attack: 0.004
  });
}

function playBuildSound(worldX, worldY = player.y) {
  playTone({
    frequency: 132, endFrequency: 68, type: "triangle", duration: 0.1,
    volume: 0.055, attack: 0.003, worldX, worldY, range: 360
  });
  playNoise({
    duration: 0.07, volume: 0.052, frequency: 520, filterType: "bandpass",
    delay: 0.055, attack: 0.002, worldX, worldY, range: 360
  });
  playTone({
    frequency: 102, endFrequency: 62, type: "triangle", duration: 0.08,
    volume: 0.035, delay: 0.1, attack: 0.002, worldX, worldY, range: 360
  });
}

function playDoorSound(worldX, worldY, open) {
  playNoise({
    duration: open ? 0.25 : 0.11, volume: 0.04, frequency: open ? 520 : 310,
    filterType: "bandpass", resonance: 2.2, worldX, worldY, range: 420
  });
  playTone({
    frequency: open ? 185 : 118, endFrequency: open ? 78 : 62,
    type: "triangle", duration: open ? 0.28 : 0.13, volume: 0.026,
    worldX, worldY, range: 420
  });
  if (!open) {
    playNoise({
      duration: 0.04, volume: 0.038, frequency: 720, filterType: "bandpass",
      delay: 0.075, attack: 0.004, worldX, worldY, range: 420
    });
  }
}

function playContainerSound(worldX, worldY) {
  playTone({
    frequency: 138, endFrequency: 76, type: "triangle", duration: 0.2,
    volume: 0.032, worldX, worldY, range: 320
  });
  playNoise({
    duration: 0.06, volume: 0.04, frequency: 780, filterType: "bandpass",
    delay: 0.12, attack: 0.002, worldX, worldY, range: 320
  });
}

function playMimicDetected(monster) {
  const range = MIMIC_DETECTION_DISTANCE + 180;
  const volume = 0.12;
  playNoise({
    duration: 0.46, volume, frequency: 430, filterType: "bandpass",
    resonance: 2.4, worldX: monster.x, worldY: monster.y, range
  });
  playTone({
    frequency: 84, endFrequency: 46, type: "triangle", duration: 0.44,
    volume: volume * 0.55, worldX: monster.x, worldY: monster.y, range
  });
  playTone({
    frequency: 310, endFrequency: 92, type: "triangle", duration: 0.22,
    volume: volume * 0.35, delay: 0.1, worldX: monster.x, worldY: monster.y, range
  });
}

function playMimicFootstep(monster) {
  const range = MIMIC_LOSE_DISTANCE + 180;
  const volume = 0.15;
  const pitchJitter = 0.9 + Math.random() * 0.18;
  playNoise({
    duration: 0.11, volume, frequency: 230 * pitchJitter, filterType: "lowpass",
    attack: 0.003, worldX: monster.x, worldY: monster.y, range
  });
  playTone({
    frequency: 68 * pitchJitter, endFrequency: 38, type: "sine", duration: 0.105,
    volume: volume * 0.62, attack: 0.003, worldX: monster.x, worldY: monster.y, range
  });
}

function playZombieDetected(monster) {
  playNoise({
    duration: 0.38, volume: 0.062, frequency: 330, filterType: "lowpass",
    resonance: 0.5, worldX: monster.x, worldY: monster.y, range: ZOMBIE_LOSE_DISTANCE
  });
  playTone({
    frequency: 96, endFrequency: 58, type: "triangle", duration: 0.34,
    volume: 0.04, worldX: monster.x, worldY: monster.y, range: ZOMBIE_LOSE_DISTANCE
  });
}

function playZombieFootstep(monster) {
  const pitchJitter = 0.9 + Math.random() * 0.16;
  playNoise({
    duration: 0.09, volume: 0.075, frequency: 190 * pitchJitter, filterType: "lowpass",
    attack: 0.004, worldX: monster.x, worldY: monster.y, range: ZOMBIE_LOSE_DISTANCE
  });
}

function playZombieAttack(monster) {
  playNoise({
    duration: 0.14, volume: 0.08, frequency: 410, filterType: "lowpass",
    attack: 0.004, worldX: monster.x, worldY: monster.y, range: 260
  });
  playTone({
    frequency: 104, endFrequency: 62, type: "triangle", duration: 0.16,
    volume: 0.038, worldX: monster.x, worldY: monster.y, range: 260
  });
}

function playMimicJumpscare(worldX) {
  playNoise({
    duration: 0.46, volume: 0.1, frequency: 820, filterType: "lowpass",
    resonance: 0.6, attack: 0.006, worldX, worldY: player.y, range: 240
  });
  playTone({
    frequency: 52, endFrequency: 118, type: "triangle", duration: 0.44,
    volume: 0.075, attack: 0.006, worldX, worldY: player.y, range: 240
  });
  playNoise({
    duration: 0.2, volume: 0.038, frequency: 980, filterType: "bandpass",
    delay: 0.12, pan: audioPanForWorldX(worldX) * -0.35, attack: 0.006
  });
}

function playPhaseSound(night) {
  if (night) {
    playTone({ frequency: 82, endFrequency: 42, type: "sine", duration: 0.9, volume: 0.04, bus: "ambience" });
    playNoise({ duration: 1.15, volume: 0.032, frequency: 360, bus: "ambience", attack: 0.12 });
  } else {
    playTone({ frequency: 170, endFrequency: 410, type: "sine", duration: 0.5, volume: 0.036, bus: "ambience" });
    playTone({
      frequency: 255, endFrequency: 510, type: "triangle", duration: 0.36,
      volume: 0.018, delay: 0.12, bus: "ambience"
    });
  }
}

function playBloodMoonStartSound() {
  playTone({
    frequency: 64,
    endFrequency: 31,
    type: "sine",
    duration: 1.8,
    volume: 0.058,
    pan: -0.2,
    bus: "ambience",
    attack: 0.12
  });
  playNoise({
    duration: 1.9,
    volume: 0.045,
    frequency: 180,
    filterType: "lowpass",
    resonance: 0.35,
    pan: 0.25,
    bus: "ambience",
    attack: 0.18
  });
  playTone({
    frequency: 92,
    endFrequency: 46,
    type: "triangle",
    duration: 1.15,
    volume: 0.026,
    delay: 0.32,
    pan: 0.35,
    bus: "ambience",
    attack: 0.1
  });
}

function playRainAmbience(intensity) {
  const stormStrength = weatherBlend("storm");
  const pan = Math.max(-0.85, Math.min(0.85, weather.wind * 0.55 + (Math.random() - 0.5) * 0.35));
  playNoise({
    duration: 2.1,
    volume: 0.012 + intensity * 0.022,
    frequency: 760 + intensity * 260,
    filterType: "bandpass",
    resonance: 0.45,
    pan,
    bus: "ambience",
    attack: 0.18
  });
  playNoise({
    duration: 1.8,
    volume: 0.006 + intensity * 0.012 + stormStrength * 0.006,
    frequency: 310,
    filterType: "lowpass",
    resonance: 0.3,
    pan: -pan * 0.6,
    bus: "ambience",
    attack: 0.24
  });
}

function playThunderSound(pan = 0) {
  playNoise({
    duration: 1.8,
    volume: 0.072,
    frequency: 145,
    filterType: "lowpass",
    resonance: 0.35,
    pan,
    bus: "ambience",
    attack: 0.055
  });
  playTone({
    frequency: 58,
    endFrequency: 27,
    type: "sine",
    duration: 1.35,
    volume: 0.052,
    pan,
    bus: "ambience",
    attack: 0.04
  });
  playNoise({
    duration: 0.9,
    volume: 0.028,
    frequency: 260,
    filterType: "lowpass",
    resonance: 0.4,
    delay: 0.18,
    pan: pan * 0.72,
    bus: "ambience",
    attack: 0.08
  });
}

function updateWeatherAudio(delta) {
  weatherAudioTimer -= delta;
  if (weatherAudioTimer > 0) return;
  const rain = precipitationIntensity();
  if (rain > 0.08) {
    playRainAmbience(rain);
    weatherAudioTimer = 1.35 + Math.random() * 0.55;
    return;
  }
  const cloud = overcastIntensity();
  if (cloud > 0.2) {
    playNoise({
      duration: 2.4,
      volume: 0.008 + cloud * 0.012,
      frequency: 280 + Math.random() * 100,
      filterType: "lowpass",
      resonance: 0.3,
      pan: weather.wind,
      bus: "ambience",
      attack: 0.35
    });
    weatherAudioTimer = 4 + Math.random() * 3;
    return;
  }
  weatherAudioTimer = 5;
}

function updateAudioAmbience(delta) {
  ambienceTimer -= delta;
  if (ambienceTimer > 0) return;
  ambienceTimer = isNight() ? 2.8 + Math.random() * 3.8 : 4.5 + Math.random() * 5.5;
  const pan = Math.random() * 2 - 1;
  playNoise({
    duration: 2.2 + Math.random() * 1.2,
    volume: isNight() ? 0.03 : 0.017,
    frequency: isNight() ? 380 + Math.random() * 140 : 560 + Math.random() * 180,
    filterType: "lowpass",
    resonance: 0.35,
    pan,
    bus: "ambience",
    attack: 0.18
  });
  if (!isNight() || Math.random() > 0.55) return;
  const side = Math.random() < 0.5 ? -1 : 1;
  const worldX = player.x + side * (320 + Math.random() * 330);
  const worldY = player.y + (Math.random() - 0.5) * 520;
  playNoise({
    duration: 0.07, volume: 0.065, frequency: 920, filterType: "bandpass",
    resonance: 1.8, delay: 0.2 + Math.random() * 0.7, attack: 0.002,
    worldX, worldY, range: 900
  });
  playTone({
    frequency: 190, endFrequency: 72, type: "triangle", duration: 0.09,
    volume: 0.035, delay: 0.23 + Math.random() * 0.7, attack: 0.002,
    worldX, worldY, range: 900
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
  let loaded = 0;
  const jobs = [
    ["玩家图", () => loadImageWithRetry(sprite, "assets/player.png")],
    ["场景图", () => loadImageWithRetry(worldSprite, "assets/forest-assets.png")],
    ["树木图", () => loadImageWithRetry(treeSprite, "assets/tree-sprites.png")],
    ["模仿者", () => loadImageWithRetry(mimicSprite, "assets/mimic.png")],
    ["僵尸", () => loadImageWithRetry(zombieSprite, "assets/zombie.png")],
    ["逃生大门", () => loadImageWithRetry(escapeGateSprite, "assets/escape-gate.png")],
    ["像素字体", loadFontWithRetry]
  ];
  showLoadingProgress(0, jobs.length, "正在准备像素素材…");
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
  actionImpacts.length = 0;
  barricades.length = 0;
  doors.length = 0;
  buildings.length = 0;
  resourceId = 0;
  barricadeId = 0;
  doorId = 0;
  buildingId = 0;
  actionEffectId = 0;
  generateEscapeGate();
  abandonedCabins.length = 0;
  generateAbandonedCabins();
  supplyCaches.length = 0;
  generateSupplyCaches();
  updateResourceChunks(true);
  generateStarterResources();
  exploredMapCells.clear();
  revealMapAroundPlayer();
}

function startGame() {
  if (!assetsReady) {
    loadGameAssets();
    return;
  }
  state = "game";
  setHowToPlayOpen(false);
  ensureAudio();
  ambienceTimer = 0.8;
  weatherAudioTimer = 0.35;
  playerFootstepTimer = 0;
  updateAudioButton();
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameOverPanel.classList.add("hidden");
  victoryPanel?.classList.add("hidden");
  elapsed = 0;
  dayNumber = 1;
  wasNight = false;
  spawnTimer = 4;
  resetWeather();
  resetBloodMoon();
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
    velocityX: 0,
    velocityY: 0,
    health: 100,
    wood: 0,
    stone: 0,
    berry: 0,
    scrap: 0,
    flashlight: true,
    classRow: 0,
    attackTimer: 0,
    toolSwingTimer: 0,
    toolSwingType: "",
    toolSwingAngle: 0,
    attackCooldown: 0,
    gatherCooldown: 0,
    strengthTimer: 0
  });
  camera.x = Math.max(0, Math.min(WORLD.width - W, player.x - W / 2));
  camera.y = Math.max(0, Math.min(WORLD.height - H, player.y - H / 2));
  setPauseOpen(false);
  setSettingsOpen(false);
  setInventoryOpen(false);
  setEmoteOpen(false);
  setMapOpen(false);
  stopEmote();
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
  setHowToPlayOpen(false);
  ensureAudio();
  ambienceTimer = 0.8;
  weatherAudioTimer = 0.35;
  playerFootstepTimer = 0;
  updateAudioButton();
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameOverPanel.classList.add("hidden");
  victoryPanel?.classList.add("hidden");
  classSelectPanel.classList.add("hidden");
  classSelectionOpen = false;
  pistolShot.timer = 0;
  projectiles.length = 0;
  actionImpacts.length = 0;
  inventoryOpen = false;
  settingsOpen = false;
  pauseOpen = false;
  emoteOpen = false;
  mapOpen = false;
  activeEmote = null;
  activeChestId = null;
  inventoryWorkspace?.classList.add("hidden");
  inventoryWorkspace?.classList.remove("chest-open");
  gameScreen.classList.remove("inventory-open");
  craftPanel?.classList.remove("hidden");
  chestPanel?.classList.add("hidden");
  inventoryPanel.classList.add("hidden");
  settingsPanel?.classList.add("hidden");
  pausePanel?.classList.add("hidden");
  emotePanel?.classList.add("hidden");
  mapPanel?.classList.add("hidden");
  gameScreen.dataset.emote = "";
  inventoryButton.disabled = false;
  inventoryButton.classList.remove("active");
  inventoryButton.setAttribute("aria-expanded", "false");
  inventoryButtonLabel.textContent = "背包";

  elapsed = Math.max(0, Number(saved.elapsed) || 0);
  dayNumber = Math.floor(elapsed / CYCLE_LENGTH) + 1;
  wasNight = Boolean(saved.wasNight);
  spawnTimer = Number.isFinite(saved.spawnTimer) ? saved.spawnTimer : 4;
  restoreWeather(saved.weather);
  restoreBloodMoon(saved.bloodMoon);
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
    velocityX: 0,
    velocityY: 0,
    health: Math.max(1, Number(saved.player.health) || 100),
    wood: Math.max(0, Number(saved.player.wood) || 0),
    stone: Math.max(0, Number(saved.player.stone) || 0),
    berry: Math.max(0, Number(saved.player.berry) || 0),
    scrap: Math.max(0, Number(saved.player.scrap) || 0),
    flashlight: saved.player.flashlight !== false,
    strengthTimer: Math.max(0, Number(saved.player.strengthTimer) || 0),
    classRow: selectedClass,
    moving: false,
    dirX: Number.isFinite(saved.player.dirX) ? saved.player.dirX : 0,
    dirY: Number.isFinite(saved.player.dirY) ? saved.player.dirY : -1,
    animation: 0,
    attackTimer: 0,
    toolSwingTimer: 0,
    toolSwingType: "",
    toolSwingAngle: 0,
    attackCooldown: 0,
    gatherCooldown: 0,
    hurtTimer: 0
  });
  if (playerTouchesWater(player.x, player.y)) {
    const dryPosition = nearestDryPlayerPosition(player.x, player.y);
    player.x = dryPosition.x;
    player.y = dryPosition.y;
  }

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
  if (bloodMoonActive) monsters.forEach(applyBloodMoonBuff);
  restoreList(barricades, saved.barricades);
  restoreList(doors, saved.doors);
  restoreList(buildings, saved.buildings);
  barricades.forEach((building) => normalizePlayerBuildingHealth(building, "wall"));
  doors.forEach((building) => normalizePlayerBuildingHealth(building, "door"));
  buildings.forEach((building) => normalizePlayerBuildingHealth(building, building.type));
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
  restoreAbandonedCabins(saved.abandonedCabins, saved.abandonedCabin);
  restoreSupplyCaches(saved.supplyCaches);
  restoreExploredMapCells(saved.exploredMapCells);
  updateResourceChunks(true);
  generateStarterResources();

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
  stopPlayerMotion();
  inventoryOpen = false;
  howToPlayOpen = false;
  settingsOpen = false;
  pauseOpen = false;
  emoteOpen = false;
  mapOpen = false;
  activeEmote = null;
  activeChestId = null;
  classSelectionOpen = false;
  inventoryWorkspace?.classList.add("hidden");
  gameScreen.classList.remove("inventory-open");
  inventoryPanel.classList.add("hidden");
  settingsPanel?.classList.add("hidden");
  howToPlayPanel?.classList.add("hidden");
  pausePanel?.classList.add("hidden");
  emotePanel?.classList.add("hidden");
  mapPanel?.classList.add("hidden");
  gameScreen.dataset.emote = "";
  classSelectPanel.classList.add("hidden");
  gameOverPanel.classList.add("hidden");
  victoryPanel?.classList.add("hidden");
  gameScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  updateContinueButton();
}

function endGame() {
  state = "over";
  stopPlayerMotion();
  classSelectionOpen = false;
  classSelectPanel.classList.add("hidden");
  setPauseOpen(false);
  setSettingsOpen(false);
  setInventoryOpen(false);
  setEmoteOpen(false);
  setMapOpen(false);
  stopEmote();
  victoryPanel?.classList.add("hidden");
  gameOverPanel.classList.remove("hidden");
}

function winGame() {
  if (state !== "game") return;
  state = "won";
  keys.clear();
  stopPlayerMotion();
  classSelectionOpen = false;
  classSelectPanel.classList.add("hidden");
  setPauseOpen(false);
  setSettingsOpen(false);
  setInventoryOpen(false);
  setEmoteOpen(false);
  setMapOpen(false);
  stopEmote();
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

function stopEmote(showStoppedMessage = false) {
  if (!activeEmote) return;
  activeEmote = null;
  gameScreen.dataset.emote = "";
  if (showStoppedMessage) showMessage("动作已停止", 0.7);
}

function setEmoteOpen(open) {
  const shouldOpen = Boolean(open)
    && state === "game"
    && !classSelectionOpen
    && !inventoryOpen
    && !settingsOpen
    && !pauseOpen
    && !mapOpen;
  emoteOpen = shouldOpen;
  emotePanel?.classList.toggle("hidden", !emoteOpen);
  keys.clear();
  stopPlayerMotion();
  if (!emoteOpen) lastTime = performance.now();
}

function startEmote(type) {
  const emote = EMOTES[type];
  if (!emote || state !== "game" || classSelectionOpen) return;
  activeEmote = type;
  emoteStartedAt = elapsed;
  player.moving = false;
  gameScreen.dataset.emote = type;
  setEmoteOpen(false);
  showMessage(`${emote.kind === "dance" ? "开始跳" : "做出动作"}：${emote.label}`, 1);
}

function updateEmote() {
  if (!activeEmote) return;
  const emote = EMOTES[activeEmote];
  if (!emote) {
    stopEmote();
    return;
  }
  if (player.hurtTimer > 0 || (emote.duration > 0 && elapsed - emoteStartedAt >= emote.duration)) {
    stopEmote();
  }
}

function activeEmoteTime() {
  return activeEmote ? Math.max(0, elapsed - emoteStartedAt) : 0;
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

function weatherDuration(type) {
  const definition = WEATHER_DEFINITIONS[type] || WEATHER_DEFINITIONS.clear;
  return definition.minDuration + Math.random() * (definition.maxDuration - definition.minDuration);
}

function weatherBlend(type) {
  if (weather.type === weather.previousType) return weather.type === type ? 1 : 0;
  let amount = 0;
  if (weather.previousType === type) amount += 1 - weather.transition;
  if (weather.type === type) amount += weather.transition;
  return Math.max(0, Math.min(1, amount));
}

function precipitationIntensity() {
  return Math.max(0, Math.min(1, weatherBlend("rain") * 0.72 + weatherBlend("storm")));
}

function overcastIntensity() {
  return Math.max(0, Math.min(
    1,
    weatherBlend("cloudy") * 0.65 + weatherBlend("rain") * 0.82 + weatherBlend("storm")
  ));
}

function weatherMonsterDetectionScale() {
  return 1 - precipitationIntensity() * 0.25;
}

function serializeWeather() {
  return {
    type: weather.type,
    previousType: weather.previousType,
    timer: weather.timer,
    transition: weather.transition,
    lightningTimer: weather.lightningTimer,
    wind: weather.wind
  };
}

function resetWeather() {
  Object.assign(weather, {
    type: "clear",
    previousType: "clear",
    timer: weatherDuration("clear"),
    transition: 1,
    lightningTimer: 7 + Math.random() * 7,
    lightningFlash: 0,
    thunderDelay: -1,
    thunderPan: 0,
    wind: (Math.random() - 0.5) * 0.32
  });
}

function restoreWeather(savedWeather) {
  if (!savedWeather || !WEATHER_DEFINITIONS[savedWeather.type]) {
    resetWeather();
    return;
  }
  const previousType = WEATHER_DEFINITIONS[savedWeather.previousType]
    ? savedWeather.previousType
    : savedWeather.type;
  Object.assign(weather, {
    type: savedWeather.type,
    previousType,
    timer: Math.max(1, Number(savedWeather.timer) || weatherDuration(savedWeather.type)),
    transition: Math.max(0, Math.min(1, Number(savedWeather.transition) || 0)),
    lightningTimer: Math.max(0.5, Number(savedWeather.lightningTimer) || 7),
    lightningFlash: 0,
    thunderDelay: -1,
    thunderPan: 0,
    wind: Math.max(-1, Math.min(1, Number(savedWeather.wind) || 0.18))
  });
}

function chooseNextWeather(type = weather.type, roll = Math.random()) {
  if (type === "clear") return roll < 0.72 ? "cloudy" : "rain";
  if (type === "cloudy") return roll < 0.32 ? "clear" : roll < 0.82 ? "rain" : "storm";
  if (type === "rain") return roll < 0.48 ? "cloudy" : roll < 0.78 ? "storm" : "clear";
  return roll < 0.7 ? "rain" : "cloudy";
}

function setWeather(type, duration = null) {
  if (!WEATHER_DEFINITIONS[type]) return false;
  if (weather.type === type && weather.transition >= 1) {
    weather.timer = Number.isFinite(duration) ? Math.max(1, duration) : weatherDuration(type);
    return true;
  }
  weather.previousType = weather.type;
  weather.type = type;
  weather.transition = 0;
  weather.timer = Number.isFinite(duration) ? Math.max(1, duration) : weatherDuration(type);
  const windStrength = type === "storm"
    ? 0.72 + Math.random() * 0.26
    : type === "rain"
      ? 0.38 + Math.random() * 0.3
      : type === "cloudy" ? 0.2 + Math.random() * 0.28 : 0.08 + Math.random() * 0.18;
  weather.wind = windStrength * (Math.random() < 0.5 ? -1 : 1);
  weather.lightningTimer = type === "storm" ? 3 + Math.random() * 6 : 8;
  weatherAudioTimer = 0.1;
  showMessage(`天气变化：${WEATHER_DEFINITIONS[type].label}`, 1.2);
  return true;
}

function triggerWeatherLightning(pan = null) {
  if (weatherBlend("storm") <= 0.15) return false;
  weather.lightningFlash = 0.32;
  weather.thunderPan = Number.isFinite(pan)
    ? Math.max(-1, Math.min(1, pan))
    : (Math.random() < 0.5 ? -1 : 1) * (0.28 + Math.random() * 0.72);
  weather.thunderDelay = 0.32 + Math.random() * 1.15;
  weather.lightningTimer = 5 + Math.random() * 10;
  return true;
}

function updateWeather(delta) {
  weather.transition = Math.min(1, weather.transition + delta / WEATHER_TRANSITION_DURATION);
  weather.timer -= delta;
  weather.lightningFlash = Math.max(0, weather.lightningFlash - delta);
  if (weather.thunderDelay >= 0) {
    weather.thunderDelay -= delta;
    if (weather.thunderDelay < 0) playThunderSound(weather.thunderPan);
  }
  if (weather.timer <= 0) setWeather(chooseNextWeather());

  const storm = weatherBlend("storm");
  if (storm > 0.15) {
    weather.lightningTimer -= delta * (0.35 + storm * 0.65);
    if (weather.lightningTimer <= 0) triggerWeatherLightning();
  } else {
    weather.lightningTimer = Math.max(weather.lightningTimer, 3);
  }
  updateWeatherAudio(delta);
}

function resetBloodMoon() {
  bloodMoonActive = false;
  bloodMoonNightNumber = 0;
  bloodMoonPulse = 0;
}

function restoreBloodMoon(savedBloodMoon) {
  bloodMoonNightNumber = Math.max(0, Math.floor(Number(savedBloodMoon?.nightNumber) || 0));
  bloodMoonActive = Boolean(savedBloodMoon?.active) && isNight();
  bloodMoonPulse = 0;
  if (!savedBloodMoon && isNight()) {
    beginNightSpecialWeather(Math.random(), false);
  }
}

function setBloodMoon(active, playSound = true) {
  bloodMoonActive = Boolean(active) && isNight();
  bloodMoonPulse = 0;
  if (bloodMoonActive && playSound) playBloodMoonStartSound();
  gameScreen.classList.toggle("blood-moon", bloodMoonActive);
  gameScreen.dataset.bloodMoon = bloodMoonActive ? "active" : "inactive";
  return bloodMoonActive;
}

function beginNightSpecialWeather(roll = Math.random(), playSound = true) {
  bloodMoonNightNumber = dayNumber;
  return setBloodMoon(roll < BLOOD_MOON_CHANCE, playSound);
}

function bloodMoonSpawnInterval() {
  const normalInterval = Math.max(5, 15 - dayNumber * 0.8);
  return bloodMoonActive
    ? Math.max(2.8, normalInterval * BLOOD_MOON_SPAWN_INTERVAL_MULTIPLIER)
    : normalInterval;
}

function bloodMoonMonsterDamage(monster, baseDamage) {
  return Math.max(1, Math.round(
    baseDamage * (monster?.bloodMoonBuffed ? BLOOD_MOON_DAMAGE_MULTIPLIER : 1)
  ));
}

function applyBloodMoonBuff(monster) {
  if (!monster || monster.bloodMoonBuffed) return monster;
  monster.health = Math.round(Math.max(1, monster.health) * BLOOD_MOON_HEALTH_MULTIPLIER);
  monster.speed *= BLOOD_MOON_SPEED_MULTIPLIER;
  monster.bloodMoonBuffed = true;
  return monster;
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
  updateWeather(delta);
  autosaveTimer -= delta;
  if (autosaveTimer <= 0) saveGame(false);
  const night = isNight();

  if (night !== wasNight) {
    wasNight = night;
    if (night) beginNightSpecialWeather();
    else setBloodMoon(false, false);
    playPhaseSound(night);
    showMessage(night ? "夜幕降临：不要相信雾里的眼睛" : "天亮了：怪物正在退回深林");
    if (night) {
      spawnMonster();
      spawnTimer = bloodMoonActive ? 2.8 : 4;
    }
  }

  if (bloodMoonActive) bloodMoonPulse += delta;
  updatePlayer(delta);
  revealMapAroundPlayer();
  updateEscapeGateDiscovery();
  updateDoors(delta);
  updateProjectiles(delta);
  updateActionImpacts(delta);
  updateTraps(delta);
  updateMonsters(delta, night);
  updateEmote();
  updateAudioAmbience(delta);
  spawnTimer -= delta;
  if (night && spawnTimer <= 0) {
    spawnMonster();
    spawnTimer = bloodMoonSpawnInterval();
  }

  if (messageTimer > 0) {
    messageTimer -= delta;
    if (messageTimer <= 0) messageElement.textContent = "";
  }

  player.attackTimer = Math.max(0, player.attackTimer - delta);
  player.toolSwingTimer = Math.max(0, player.toolSwingTimer - delta);
  if (player.toolSwingTimer <= 0) player.toolSwingType = "";
  player.attackCooldown = Math.max(0, player.attackCooldown - delta);
  player.gatherCooldown = Math.max(0, player.gatherCooldown - delta);
  player.hurtTimer = Math.max(0, player.hurtTimer - delta);
  player.strengthTimer = Math.max(0, player.strengthTimer - delta);
  pistolShot.timer = Math.max(0, pistolShot.timer - delta);
  updateHud();
}

function updatePlayer(delta) {
  let inputX = 0;
  let inputY = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) inputX -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) inputX += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) inputY -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) inputY += 1;
  const inputLength = Math.hypot(inputX, inputY);
  const hasMoveInput = inputLength > 0;
  if (hasMoveInput) {
    inputX /= inputLength;
    inputY /= inputLength;
  }

  const sprinting = keys.has("ShiftLeft") || keys.has("ShiftRight");
  const targetSpeed = player.speed * (sprinting ? 1.45 : 1);
  const targetVelocityX = inputX * targetSpeed;
  const targetVelocityY = inputY * targetSpeed;
  const reversing = hasMoveInput
    && player.velocityX * inputX + player.velocityY * inputY < -PLAYER_STOP_SPEED;
  const velocityChange = (
    hasMoveInput
      ? reversing ? PLAYER_TURN_ACCELERATION : PLAYER_ACCELERATION
      : PLAYER_DECELERATION
  ) * delta;
  movePlayerVelocityToward(targetVelocityX, targetVelocityY, velocityChange);
  if (!hasMoveInput && Math.hypot(player.velocityX, player.velocityY) < PLAYER_STOP_SPEED) {
    player.velocityX = 0;
    player.velocityY = 0;
  }

  const movementSpeed = Math.hypot(player.velocityX, player.velocityY);
  player.moving = movementSpeed >= PLAYER_STOP_SPEED;
  if (player.moving) {
    if (hasMoveInput) stopEmote();
    const speedRatio = Math.min(1.45, movementSpeed / player.speed);
    player.animation += delta * (1.7 + speedRatio * 6.3);
  }

  if (player.moving) {
    playerFootstepTimer -= delta;
    if (playerFootstepTimer <= 0) {
      playPlayerFootstep();
      const speedRatio = Math.max(0.55, movementSpeed / player.speed);
      playerFootstepTimer = 0.31 / speedRatio;
    }
  } else {
    playerFootstepTimer = Math.min(playerFootstepTimer, 0.06);
  }

  const nextX = player.x + player.velocityX * delta;
  const nextY = player.y + player.velocityY * delta;
  if (!collides(nextX, player.y)) player.x = nextX;
  else player.velocityX = 0;
  if (!collides(player.x, nextY)) player.y = nextY;
  else player.velocityY = 0;

  const boundedX = Math.max(WORLD.margin, Math.min(WORLD.width - WORLD.margin, player.x));
  const boundedY = Math.max(WORLD.margin, Math.min(WORLD.height - WORLD.margin, player.y));
  if (boundedX !== player.x) player.velocityX = 0;
  if (boundedY !== player.y) player.velocityY = 0;
  player.x = boundedX;
  player.y = boundedY;
  updateResourceChunks();

  if (player.health <= 0) endGame();
}

function movePlayerVelocityToward(targetX, targetY, maximumChange) {
  const differenceX = targetX - player.velocityX;
  const differenceY = targetY - player.velocityY;
  const differenceLength = Math.hypot(differenceX, differenceY);
  if (differenceLength <= maximumChange || differenceLength <= 0.0001) {
    player.velocityX = targetX;
    player.velocityY = targetY;
    return;
  }
  player.velocityX += differenceX / differenceLength * maximumChange;
  player.velocityY += differenceY / differenceLength * maximumChange;
}

function stopPlayerMotion() {
  player.velocityX = 0;
  player.velocityY = 0;
  player.moving = false;
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

function playerBuildingDefinition(type) {
  return BUILD_TYPES.find((definition) => definition.type === type) || null;
}

function normalizePlayerBuildingHealth(building, type = building?.type) {
  if (!building) return building;
  const maximum = Math.max(1, Number(playerBuildingDefinition(type)?.health) || 60);
  building.maxHealth = Math.max(1, Number(building.maxHealth) || maximum);
  building.health = Number.isFinite(Number(building.health))
    ? Math.max(0, Math.min(building.maxHealth, Number(building.health)))
    : building.maxHealth;
  return building;
}

function getEscapeGateCollider() {
  return {
    x: escapeGate.x,
    y: escapeGate.y + 7,
    width: 148,
    height: 36
  };
}

function playerTouchesWater(x, y, radius = player.radius) {
  const edge = Math.max(4, radius - 2);
  const diagonal = edge * 0.7;
  const points = [
    [0, 0],
    [-edge, 0],
    [edge, 0],
    [0, -edge],
    [0, edge],
    [-diagonal, -diagonal],
    [diagonal, -diagonal],
    [-diagonal, diagonal],
    [diagonal, diagonal]
  ];
  return points.some(([offsetX, offsetY]) => (
    terrainAtWorld(x + offsetX, y + offsetY) === TERRAIN_FRAME.water
  ));
}

function isNearWaterShore(x = player.x, y = player.y, maximumDistance = 62) {
  const centerTileX = Math.floor(x / TILE_SIZE);
  const centerTileY = Math.floor(y / TILE_SIZE);
  const tileRadius = Math.ceil(maximumDistance / TILE_SIZE) + 1;
  for (let tileY = centerTileY - tileRadius; tileY <= centerTileY + tileRadius; tileY += 1) {
    for (let tileX = centerTileX - tileRadius; tileX <= centerTileX + tileRadius; tileX += 1) {
      if (!isWaterTile(tileX, tileY)) continue;
      const left = tileX * TILE_SIZE;
      const top = tileY * TILE_SIZE;
      const closestX = Math.max(left, Math.min(x, left + TILE_SIZE));
      const closestY = Math.max(top, Math.min(y, top + TILE_SIZE));
      if (Math.hypot(x - closestX, y - closestY) <= maximumDistance) return true;
    }
  }
  return false;
}

function nearestDryPlayerPosition(x, y) {
  const originTileX = Math.floor(x / TILE_SIZE);
  const originTileY = Math.floor(y / TILE_SIZE);
  for (let ring = 0; ring <= 12; ring += 1) {
    for (let offsetY = -ring; offsetY <= ring; offsetY += 1) {
      for (let offsetX = -ring; offsetX <= ring; offsetX += 1) {
        if (ring > 0 && Math.abs(offsetX) !== ring && Math.abs(offsetY) !== ring) continue;
        const candidateX = (originTileX + offsetX) * TILE_SIZE + TILE_SIZE / 2;
        const candidateY = (originTileY + offsetY) * TILE_SIZE + TILE_SIZE / 2;
        if (candidateX < WORLD.margin || candidateY < WORLD.margin
          || candidateX > WORLD.width - WORLD.margin || candidateY > WORLD.height - WORLD.margin) continue;
        if (!playerTouchesWater(candidateX, candidateY)) {
          return { x: candidateX, y: candidateY };
        }
      }
    }
  }
  return { x: PLAYER_START.x, y: PLAYER_START.y };
}

function collides(x, y) {
  if (playerTouchesWater(x, y)) return true;
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
    if (resource.type === "berry" || resource.type === "branch"
      || resource.type === "pebble" || resource.type === "scrap"
      || resource.type === "glass_bottle") continue;
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
    playDoorSound(nearbyDoor.x, nearbyDoor.y, nearbyDoor.open);
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
    if (craftStatus) craftStatus.textContent = "工作台已连接：选择要制作的工具或武器";
    showMessage("打开工作台", 1);
    return;
  }
  if (isNearWaterShore()) {
    fillGlassBottle();
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
      source: item.source || (weapon.requiresWorkbench === false ? "handcrafted" : "workbench")
    };
    if (weapon.magazineSize) {
      normalized.loadedAmmo = Math.max(0, Math.min(
        weapon.magazineSize,
        Number.isFinite(item.loadedAmmo) ? Math.floor(item.loadedAmmo) : weapon.magazineSize
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
    if (item.magazineSize) item.loadedAmmo = item.magazineSize;
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
  if (chest.landmark === ABANDONED_CABIN_LANDMARK) {
    const cabin = abandonedCabins.find((item) => (
      item.id === chest.landmarkId || item.chestId === chest.id
    ));
    if (cabin) {
      cabin.searched = true;
      if (cabin.hasGateClue) {
        cabin.clueFound = true;
        showMessage(`箱底的旧地图标出了逃生大门：${escapeGateDirection()}方`, 1.6);
      }
    }
  } else if (chest.landmark === SUPPLY_CACHE_LANDMARK) {
    const cache = supplyCaches.find((item) => (
      item.id === chest.landmarkId || item.chestId === chest.id
    ));
    if (cache) {
      cache.searched = true;
      chest.searched = true;
    }
  }
  playContainerSound(chest.x, chest.y);
  setInventoryOpen(true);
  updateHud();
  if (chest.landmark === ABANDONED_CABIN_LANDMARK
    || chest.landmark === SUPPLY_CACHE_LANDMARK) saveGame(false);
  showMessage("储物箱已打开，拖动物品即可存取", 1.2);
}

function ensureInventoryResource(type) {
  const definition = resourceItemDefinition(type);
  if (!definition || player[type] <= 0 || [...quickbarItems, ...inventoryItems].some((item) => (
    item?.type === type
  ))) return;
  const emptyIndex = inventoryItems.findIndex((item) => item === null);
  if (emptyIndex >= 0) {
    inventoryItems[emptyIndex] = {
      ...definition,
      count: Math.max(0, Math.floor(Number(player[type]) || 0)),
      source: "carried"
    };
  }
}

function carriedItem(type) {
  return quickbarItems.find((item) => item?.type === type)
    || inventoryItems.find((item) => item?.type === type)
    || null;
}

function addToFirstCarriedSlot(item) {
  const quickIndex = quickbarItems.findIndex((slot) => slot === null);
  if (quickIndex >= 0) {
    quickbarItems[quickIndex] = item;
    return { collection: "quickbar", index: quickIndex };
  }
  const inventoryIndex = inventoryItems.findIndex((slot) => slot === null);
  if (inventoryIndex >= 0) {
    inventoryItems[inventoryIndex] = item;
    return { collection: "inventory", index: inventoryIndex };
  }
  return null;
}

// 资源第一次到手时进入最前面的空格，所以顺序取决于实际采集先后。
function addResource(type, amount) {
  const definition = resourceItemDefinition(type);
  if (!definition || amount <= 0) return;
  player[type] += amount;
  const existing = carriedItem(type);
  if (existing) {
    existing.count = Math.max(0, Math.floor(Number(existing.count) || 0)) + amount;
  } else {
    addToFirstCarriedSlot({ ...definition, count: amount, source: "carried" });
  }
}

function spendResource(type, amount) {
  if (!resourceItemDefinition(type) || amount <= 0 || player[type] < amount) return false;
  syncInventoryItems();
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
        if (collection === quickbarItems && selectedQuickSlot === index) {
          selectedQuickSlot = -1;
        }
      }
    }
  }
  player[type] -= amount;
  return true;
}

function findGatherTarget() {
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
  return target;
}

function requiredHarvestTool(type) {
  if (type === "tree") return { toolType: "axe", label: "斧头" };
  if (type === "rock") return { toolType: "pickaxe", label: "镐子" };
  return null;
}

function equippedQuickbarItem() {
  if (selectedQuickSlot < 0 || selectedQuickSlot >= quickSlots.length) return null;
  return quickbarItems[selectedQuickSlot];
}

function beginToolSwing(tool, target) {
  if (!tool || !target) return;
  player.attackTimer = 0;
  player.toolSwingTimer = TOOL_SWING_DURATION;
  player.toolSwingType = tool.type;
  player.toolSwingAngle = Math.atan2(
    target.y - (player.y - 15),
    target.x - player.x
  );
}

function spawnActionImpact(type, x, y, angle = 0) {
  actionImpacts.push({
    id: actionEffectId++,
    type,
    x,
    y,
    angle,
    timer: ACTION_IMPACT_DURATION,
    duration: ACTION_IMPACT_DURATION
  });
  if (actionImpacts.length > 80) actionImpacts.splice(0, actionImpacts.length - 80);
}

function updateActionImpacts(delta) {
  for (let index = actionImpacts.length - 1; index >= 0; index -= 1) {
    actionImpacts[index].timer -= delta;
    if (actionImpacts[index].timer <= 0) actionImpacts.splice(index, 1);
  }
}

function collectResource(target = findGatherTarget()) {
  if (player.gatherCooldown > 0) return;
  if (!target) {
    showMessage("这个方向没有可以采集的资源", 1);
    return;
  }

  const requiredTool = requiredHarvestTool(target.type);
  const heldItem = equippedQuickbarItem();
  if (requiredTool && heldItem?.toolType !== requiredTool.toolType) {
    const action = target.type === "tree" ? "砍树" : "采石";
    showMessage(`${action}需要先装备${requiredTool.label}`, 1.2);
    return;
  }
  if (target.type === "glass_bottle" && !canAddPortableItem("glass_bottle")) {
    showMessage("背包和快捷栏都满了，先腾出一个位置", 1.2);
    return;
  }

  player.gatherCooldown = RESOURCE_GATHER_COOLDOWN[target.type] || 0.32;
  if (requiredTool) beginToolSwing(heldItem, target);
  const gatheredType = target.type === "tree" || target.type === "branch"
    ? "wood"
    : target.type === "rock" || target.type === "pebble"
      ? "stone"
      : target.type === "scrap"
        ? "scrap"
        : target.type === "glass_bottle" ? "glass" : "berry";
  if (requiredTool) {
    spawnActionImpact(
      gatheredType,
      target.x,
      target.type === "tree" ? target.y - 28 : target.y - 4,
      player.toolSwingAngle
    );
  }
  playGatherSound(gatheredType, target.x, target.y);
  const requiredHits = resourceHarvestHits(target.type, heldItem);
  target.harvestHits = Math.min(requiredHits, (target.harvestHits || 0) + 1);
  if (target.harvestHits < requiredHits) {
    const action = target.type === "tree"
      ? "砍伐"
      : target.type === "rock"
        ? "敲击"
        : target.type === "scrap" ? "拆解" : target.type === "glass_bottle" ? "拾取" : "采摘";
    showMessage(`${action}中 ${target.harvestHits}/${requiredHits}`, 0.6);
    updateHud();
    return;
  }

  const index = resources.indexOf(target);
  resources.splice(index, 1);
  playPickupSound(gatheredType);
  if (target.spawnKey) harvestedResourceKeys.add(target.spawnKey);
  if (target.type === "tree") {
    const amount = resourceHarvestYield("tree");
    addResource("wood", amount);
    showMessage(`获得木材 ×${amount}`);
  } else if (target.type === "rock") {
    addResource("stone", 2);
    showMessage("获得石头 ×2");
  } else if (target.type === "branch") {
    addResource("wood", 1);
    showMessage("捡到树枝：获得木材 ×1");
  } else if (target.type === "pebble") {
    addResource("stone", 1);
    showMessage("捡到小石块：获得石头 ×1");
  } else if (target.type === "scrap") {
    addResource("scrap", 2);
    showMessage("拆出废铁 ×2");
  } else if (target.type === "glass_bottle") {
    addPortableItem("glass_bottle", 1, "pickup");
    showMessage("捡到空玻璃瓶，靠近水边按 E 装水", 1.5);
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
  const labels = {
    wood: "木材",
    stone: "石头",
    berry: "浆果",
    scrap: "废铁",
    glass_bottle: "空玻璃瓶",
    water_bottle: "水瓶"
  };
  return ["wood", "stone", "berry", "scrap", "glass_bottle", "water_bottle"]
    .filter((type) => Math.max(0, Number(cost?.[type]) || 0) > 0)
    .map((type) => `${labels[type]} ${Math.max(0, Number(cost[type]) || 0)}`)
    .join(" · ");
}

function canAffordRecipe(cost) {
  return ["wood", "stone", "berry", "scrap", "glass_bottle", "water_bottle"].every((type) => (
    (resourceItemDefinition(type) ? player[type] : portableItemCount(type))
      >= Math.max(0, Number(cost?.[type]) || 0)
  ));
}

function spendRecipeCost(cost) {
  for (const type of ["wood", "stone", "berry", "scrap", "glass_bottle", "water_bottle"]) {
    const amount = Math.max(0, Number(cost?.[type]) || 0);
    if (amount <= 0) continue;
    if (resourceItemDefinition(type)) spendResource(type, amount);
    else spendPortableItem(type, amount);
  }
}

function recipeCostWillFreePortableSlot(cost) {
  const remaining = {};
  for (const type of ["glass_bottle", "water_bottle"]) {
    remaining[type] = Math.max(0, Number(cost?.[type]) || 0);
  }
  for (const collection of [quickbarItems, inventoryItems]) {
    for (const item of collection) {
      if (!item || !Object.prototype.hasOwnProperty.call(remaining, item.type)
        || remaining[item.type] <= 0) continue;
      const count = Math.max(1, Math.floor(Number(item.count) || 1));
      const used = Math.min(count, remaining[item.type]);
      if (used >= count) return true;
      remaining[item.type] -= used;
    }
  }
  return false;
}

function renderCrafting() {
  const hasWorkbench = Boolean(nearbyWorkbench());
  craftButtons.forEach((button) => {
    const buildIndex = Number(button.dataset.recipe);
    if (!Number.isInteger(buildIndex) || !BUILD_TYPES[buildIndex]) return;
    const recipe = BUILD_TYPES[buildIndex];
    const unlocked = recipe.requiresWorkbench === false || hasWorkbench;
    const existingSlot = craftedInventorySlot(buildIndex) >= 0 || craftedQuickSlot(buildIndex) >= 0;
    const hasSpace = existingSlot
      || inventoryItems.some((item) => item === null)
      || quickbarItems.some((item) => item === null);
    const affordable = canAffordRecipe(recipe.cost);
    button.disabled = !unlocked || !affordable || !hasSpace;
    button.classList.toggle("craft-ready", unlocked && affordable && hasSpace);
    button.classList.toggle("workbench-locked", !unlocked);
    button.title = !unlocked
      ? "需要靠近已放置的工作台"
      : !hasSpace
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
  const hasWorkbench = Boolean(nearbyWorkbench());
  if (workbenchStatus) {
    workbenchStatus.textContent = hasWorkbench ? "工具与武器已解锁" : "靠近工作台后解锁";
  }
  weaponCraftButtons.forEach((button) => {
    const recipe = WEAPON_TYPES[Number(button.dataset.weaponRecipe)];
    if (!recipe) return;
    button.dataset.itemTier = recipe.tier || "";
    button.dataset.equipmentClass = recipe.equipmentClass || "weapon";
    const unlocked = recipe.requiresWorkbench === false || hasWorkbench;
    const hasSpace = inventoryItems.some((item) => item === null)
      || quickbarItems.some((item) => item === null);
    const affordable = canAffordRecipe(recipe.cost);
    button.disabled = !unlocked || !affordable || !hasSpace;
    button.classList.toggle("weapon-ready", unlocked && affordable && hasSpace);
    button.classList.toggle("workbench-locked", !unlocked);
    button.title = !unlocked
      ? "需要靠近已放置的工作台"
      : !hasSpace
        ? "背包和快捷栏都已满"
        : affordable
          ? `制作${equipmentDisplayLabel(recipe)}：${recipeCostText(recipe.cost)}`
          : `材料不足：${recipeCostText(recipe.cost)}`;
  });
}

function craftWeapon(weaponIndex) {
  if (state !== "game" || !inventoryOpen) return;
  const recipe = WEAPON_TYPES[weaponIndex];
  if (!recipe) return;
  const needsWorkbench = recipe.requiresWorkbench !== false;
  if (needsWorkbench && !nearbyWorkbench()) {
    if (craftStatus) craftStatus.textContent = `制作${equipmentDisplayLabel(recipe)}需要靠近工作台`;
    renderWeaponCrafting();
    return;
  }
  const inventoryIndex = inventoryItems.findIndex((item) => item === null);
  const quickIndex = quickbarItems.findIndex((item) => item === null);
  if (inventoryIndex < 0 && quickIndex < 0) {
    if (craftStatus) craftStatus.textContent = "背包和快捷栏都满了，先腾出一个位置";
    return;
  }
  if (!canAffordRecipe(recipe.cost)) {
    if (craftStatus) craftStatus.textContent = `材料不足：${recipeCostText(recipe.cost)}`;
    return;
  }
  spendRecipeCost(recipe.cost);
  const source = needsWorkbench ? "workbench" : "handcrafted";
  const weapon = { ...recipe, cost: { ...recipe.cost }, count: 1, source };
  if (weapon.magazineSize) weapon.loadedAmmo = 0;
  if (quickIndex >= 0) quickbarItems[quickIndex] = weapon;
  else inventoryItems[inventoryIndex] = weapon;
  playBuildSound(player.x, player.y);
  if (craftStatus) {
    craftStatus.textContent = quickIndex >= 0
      ? `已制作${equipmentDisplayLabel(recipe)}，放入快捷栏 ${quickIndex + 1}`
      : `快捷栏已满，${equipmentDisplayLabel(recipe)}放入背包 ${inventoryIndex + 1}`;
  }
  updateHud();
}

function craftBuilding(buildIndex) {
  if (state !== "game" || !inventoryOpen) return;
  const recipe = BUILD_TYPES[buildIndex];
  if (!recipe) return;
  if (recipe.requiresWorkbench !== false && !nearbyWorkbench()) {
    if (craftStatus) craftStatus.textContent = `制作${recipe.label}需要靠近工作台`;
    renderCrafting();
    return;
  }
  const inventoryStack = craftedInventorySlot(buildIndex);
  const quickStack = craftedQuickSlot(buildIndex);
  const emptyInventory = inventoryItems.findIndex((item) => item === null);
  const emptyQuick = quickbarItems.findIndex((item) => item === null);
  if (inventoryStack < 0 && quickStack < 0 && emptyInventory < 0 && emptyQuick < 0) {
    if (craftStatus) craftStatus.textContent = "背包和快捷栏都满了，先腾出一个位置";
    return;
  }
  if (!canAffordRecipe(recipe.cost)) {
    if (craftStatus) craftStatus.textContent = `材料不足：${recipeCostText(recipe.cost)}`;
    return;
  }
  spendRecipeCost(recipe.cost);
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
    if (emptyQuick >= 0) {
      quickbarItems[emptyQuick] = item;
      destination = `快捷栏 ${emptyQuick + 1}`;
    } else {
      inventoryItems[emptyInventory] = item;
      destination = `背包 ${emptyInventory + 1}`;
    }
  }
  if (craftStatus) craftStatus.textContent = `已制作${recipe.label}，放入${destination}`;
  updateHud();
}

function renderSupplyCrafting() {
  const hasWorkbench = Boolean(nearbyWorkbench());
  supplyCraftButtons.forEach((button) => {
    const recipe = SUPPLY_RECIPES[Number(button.dataset.supplyRecipe)];
    if (!recipe) return;
    const existingSlot = inventoryItems.some((item) => item?.type === recipe.type)
      || quickbarItems.some((item) => item?.type === recipe.type);
    const hasSpace = existingSlot
      || inventoryItems.some((item) => item === null)
      || quickbarItems.some((item) => item === null)
      || recipeCostWillFreePortableSlot(recipe.cost);
    const affordable = canAffordRecipe(recipe.cost);
    button.disabled = !hasWorkbench || !affordable || !hasSpace;
    button.classList.toggle("supply-ready", hasWorkbench && affordable && hasSpace);
    button.classList.toggle("workbench-locked", !hasWorkbench);
    button.title = !hasWorkbench
      ? "需要靠近已放置的工作台"
      : !hasSpace
        ? "背包和快捷栏都已满"
        : affordable
          ? `制作${recipe.label}：${recipeCostText(recipe.cost)}`
          : `材料不足：${recipeCostText(recipe.cost)}`;
  });
}

function craftSupply(recipeIndex) {
  if (state !== "game" || !inventoryOpen) return;
  const recipe = SUPPLY_RECIPES[recipeIndex];
  if (!recipe) return;
  if (!nearbyWorkbench()) {
    if (craftStatus) craftStatus.textContent = `制作${recipe.label}需要靠近工作台`;
    renderSupplyCrafting();
    return;
  }
  const inventoryStack = inventoryItems.findIndex((item) => item?.type === recipe.type);
  const quickStack = quickbarItems.findIndex((item) => item?.type === recipe.type);
  let emptyInventory = inventoryItems.findIndex((item) => item === null);
  let emptyQuick = quickbarItems.findIndex((item) => item === null);
  if (inventoryStack < 0 && quickStack < 0 && emptyInventory < 0 && emptyQuick < 0
    && !recipeCostWillFreePortableSlot(recipe.cost)) {
    if (craftStatus) craftStatus.textContent = "背包和快捷栏都满了，先腾出一个位置";
    return;
  }
  if (!canAffordRecipe(recipe.cost)) {
    if (craftStatus) craftStatus.textContent = `材料不足：${recipeCostText(recipe.cost)}`;
    return;
  }
  spendRecipeCost(recipe.cost);
  emptyInventory = inventoryItems.findIndex((item) => item === null);
  emptyQuick = quickbarItems.findIndex((item) => item === null);
  let destination = "";
  if (inventoryStack >= 0) {
    inventoryItems[inventoryStack].count = Math.max(0, Number(inventoryItems[inventoryStack].count) || 0) + 1;
    destination = `背包 ${inventoryStack + 1}`;
  } else if (quickStack >= 0) {
    quickbarItems[quickStack].count = Math.max(0, Number(quickbarItems[quickStack].count) || 0) + 1;
    destination = `快捷栏 ${quickStack + 1}`;
  } else {
    const item = normalizePortableItem({ type: recipe.type, count: 1, source: "workbench" });
    if (emptyQuick >= 0) {
      quickbarItems[emptyQuick] = item;
      destination = `快捷栏 ${emptyQuick + 1}`;
    } else {
      inventoryItems[emptyInventory] = item;
      destination = `背包 ${emptyInventory + 1}`;
    }
  }
  playBuildSound(player.x, player.y);
  if (craftStatus) craftStatus.textContent = `已制作${recipe.label}，放入${destination}`;
  updateHud();
}

// 背包打开时会暂停游戏，就像先把桌面上的玩具按下暂停键再整理盒子。
function setInventoryOpen(open) {
  inventoryOpen = open && state === "game" && !classSelectionOpen && !mapOpen;
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
    stopPlayerMotion();
    if (craftStatus && !chest) craftStatus.textContent = "选择配方制作，成品会优先进入快捷栏";
  }
  updateHud();
}

function setMapOpen(open) {
  const shouldOpen = Boolean(open)
    && state === "game"
    && !classSelectionOpen
    && !inventoryOpen
    && !settingsOpen
    && !pauseOpen
    && !emoteOpen;
  mapOpen = shouldOpen;
  mapPanel?.classList.toggle("hidden", !mapOpen);
  keys.clear();
  stopPlayerMotion();
  if (mapOpen) renderExplorationMap();
  else lastTime = performance.now();
}

function setHowToPlayOpen(open) {
  howToPlayOpen = Boolean(open) && state === "title";
  howToPlayPanel?.classList.toggle("hidden", !howToPlayOpen);
  howToPlayButton?.setAttribute("aria-expanded", String(howToPlayOpen));
  if (howToPlayOpen) keys.clear();
}

function setSettingsOpen(open, returnTarget = null) {
  if (open) {
    settingsReturnTarget = returnTarget || (state === "game" && pauseOpen ? "pause" : "title");
    settingsOpen = true;
    if (settingsReturnTarget === "pause") pausePanel?.classList.add("hidden");
    settingsPanel?.classList.remove("hidden");
    keys.clear();
    stopPlayerMotion();
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
  if (shouldOpen && mapOpen) setMapOpen(false);
  pauseOpen = shouldOpen;
  pausePanel?.classList.toggle("hidden", !pauseOpen);
  if (pauseOpen) {
    keys.clear();
    stopPlayerMotion();
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

function canAddPortableItem(type) {
  return portableItemCount(type) > 0
    || inventoryItems.some((item) => item === null)
    || quickbarItems.some((item) => item === null);
}

function addPortableItem(type, amount = 1, source = "pickup") {
  const definition = portableItemDefinition(type);
  const count = Math.max(1, Math.floor(Number(amount) || 1));
  if (!definition || !canAddPortableItem(type)) return false;
  const existing = quickbarItems.find((item) => item?.type === type)
    || inventoryItems.find((item) => item?.type === type);
  if (existing) {
    existing.count = Math.max(0, Math.floor(Number(existing.count) || 0)) + count;
    return true;
  }
  const item = normalizePortableItem({ type, count, source }, count);
  return Boolean(addToFirstCarriedSlot(item));
}

function convertPortableItem(inputType, outputType) {
  const outputDefinition = portableItemDefinition(outputType);
  if (!outputDefinition) return false;
  const locations = [];
  if (selectedQuickSlot >= 0 && quickbarItems[selectedQuickSlot]?.type === inputType) {
    locations.push({ collection: quickbarItems, index: selectedQuickSlot });
  }
  inventoryItems.forEach((item, index) => {
    if (item?.type === inputType) locations.push({ collection: inventoryItems, index });
  });
  quickbarItems.forEach((item, index) => {
    if (index !== selectedQuickSlot && item?.type === inputType) {
      locations.push({ collection: quickbarItems, index });
    }
  });
  const inputLocation = locations[0];
  if (!inputLocation) return false;
  const input = inputLocation.collection[inputLocation.index];
  const existingOutput = inventoryItems.find((item) => item?.type === outputType)
    || quickbarItems.find((item) => item?.type === outputType);
  if (existingOutput) {
    input.count -= 1;
    existingOutput.count = Math.max(0, Math.floor(Number(existingOutput.count) || 0)) + 1;
    if (input.count <= 0) {
      inputLocation.collection[inputLocation.index] = null;
      if (inputLocation.collection === quickbarItems && selectedQuickSlot === inputLocation.index) {
        selectedQuickSlot = -1;
      }
    }
    return true;
  }
  if (input.count <= 1) {
    inputLocation.collection[inputLocation.index] = normalizePortableItem({
      type: outputType,
      count: 1,
      source: "filled"
    });
    return true;
  }
  const quickIndex = quickbarItems.findIndex((item) => item === null);
  const inventoryIndex = inventoryItems.findIndex((item) => item === null);
  if (inventoryIndex < 0 && quickIndex < 0) return false;
  input.count -= 1;
  const output = normalizePortableItem({ type: outputType, count: 1, source: "filled" });
  if (quickIndex >= 0) quickbarItems[quickIndex] = output;
  else inventoryItems[inventoryIndex] = output;
  return true;
}

function fillGlassBottle() {
  if (!isNearWaterShore()) {
    showMessage("要靠近水边才能装水", 1.1);
    return false;
  }
  if (portableItemCount("glass_bottle") <= 0) {
    showMessage("需要先捡到一个空玻璃瓶", 1.2);
    return false;
  }
  if (!convertPortableItem("glass_bottle", "water_bottle")) {
    showMessage("背包没有空间放水瓶", 1.1);
    return false;
  }
  playNoise({
    duration: 0.2,
    volume: 0.024,
    frequency: 520,
    filterType: "lowpass",
    attack: 0.008
  });
  playTone({
    frequency: 310,
    endFrequency: 410,
    type: "sine",
    duration: 0.16,
    volume: 0.018,
    attack: 0.006
  });
  showMessage("装满了一瓶水", 1.1);
  updateHud();
  return true;
}

function useConsumable(type) {
  const item = portableItemDefinition(type);
  if (!item || item.kind !== "consumable" || portableItemCount(type) <= 0) return false;
  if (type === "strength_potion") {
    if (!convertPortableItem(type, "glass_bottle")) {
      showMessage("背包没有空间留下空玻璃瓶", 1.2);
      return false;
    }
    player.strengthTimer = Math.min(120, player.strengthTimer + 60);
    playTone({ frequency: 180, endFrequency: 420, type: "triangle", duration: 0.32, volume: 0.032 });
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
  if (type === "healing_potion") {
    if (!convertPortableItem(type, "glass_bottle")) {
      showMessage("背包没有空间留下空玻璃瓶", 1.2);
      return false;
    }
  } else {
    spendPortableItem(type, 1);
  }
  player.health = Math.min(100, player.health + healing);
  playTone({ frequency: 390, endFrequency: 760, type: "sine", duration: 0.22, volume: 0.04 });
  showMessage(`使用${item.label}，恢复 ${healing} 点生命`, 1.4);
  updateHud();
  return true;
}

function reloadPistol() {
  const firearm = quickbarItems[selectedQuickSlot];
  if (!firearm?.magazineSize) {
    showMessage("先把枪拿在手上才能换弹", 1.1);
    return false;
  }
  if (firearm.loadedAmmo >= firearm.magazineSize) {
    showMessage(`${firearm.label}弹仓已经装满`, 1);
    return false;
  }
  if (!spendPortableItem("ammo_box", 1)) {
    showMessage("没有弹药箱了", 1.1);
    return false;
  }
  firearm.loadedAmmo = firearm.magazineSize;
  player.attackCooldown = Math.max(player.attackCooldown, 0.7);
  playReloadSound();
  showMessage(
    `${firearm.label}装填完成：${firearm.loadedAmmo}/${firearm.magazineSize}，剩余弹药箱 ${portableItemCount("ammo_box")}`,
    1.5
  );
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
  playBuildSound(placement.x, placement.y);
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
  playBuildSound(placement.x, placement.y);
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
  const maximumHealth = Math.max(1, Number(playerBuildingDefinition(type)?.health) || 60);
  const building = {
    id: buildingId++,
    type,
    x: placement.x,
    y: placement.y,
    health: maximumHealth,
    maxHealth: maximumHealth
  };
  if (type === "trap") Object.assign(building, { uses: trapStats().uses, cooldown: 0 });
  if (type === "chest") building.items = Array(CHEST_SLOT_COUNT).fill(null);
  buildings.push(building);
  playBuildSound(placement.x, placement.y);
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
  } else if (item.type === "glass_bottle") {
    showMessage("拿起空玻璃瓶，靠近水边按 E 装水", 1.4);
  } else if (item.type === "water_bottle") {
    showMessage("水瓶可以在工作台制作药水", 1.2);
  } else {
    showMessage(`拿起了${item.label || "物品"}`, 1);
  }
  updateHud();
}

function isWeaponEquipped() {
  return equippedQuickbarItem()?.kind === "weapon";
}

function hasMonsterInWeaponRange(weapon) {
  const range = weapon?.range || 58;
  return monsters.some((monster) => (
    !monster.dead && Math.hypot(monster.x - player.x, monster.y - player.y) < range
  ));
}

function usePrimaryAction() {
  stopEmote();
  const heldItem = equippedQuickbarItem();
  if (!isWeaponEquipped()) {
    collectResource();
    return;
  }
  if (!isHarvestTool(heldItem) || hasMonsterInWeaponRange(heldItem)) {
    attack();
    return;
  }
  if (findPlayerBuildingTarget(heldItem.range || 58)) {
    attack();
    return;
  }
  const target = findGatherTarget();
  if (target) collectResource(target);
  else attack();
}

function fireFirearm(weapon) {
  const loadedAmmo = Math.max(0, Math.floor(Number(weapon.loadedAmmo) || 0));
  if (loadedAmmo <= 0) {
    player.attackCooldown = 0.18;
    playDryFireSound();
    showMessage(`${weapon.label}没子弹了，按 R 换弹 · 弹药箱 ${portableItemCount("ammo_box")}`, 1.2);
    return;
  }

  weapon.loadedAmmo = loadedAmmo - 1;
  player.attackCooldown = weaponAttackCooldown(weapon);
  player.toolSwingTimer = 0;
  player.toolSwingType = "";
  const recoilDuration = weapon.type === "shotgun"
    ? SHOTGUN_RECOIL_DURATION
    : PISTOL_RECOIL_DURATION;
  player.attackTimer = recoilDuration;
  const range = weapon.range || 720;
  const directionLength = Math.hypot(player.dirX, player.dirY) || 1;
  const baseDirectionX = player.dirX / directionLength;
  const baseDirectionY = player.dirY / directionLength;
  const startX = player.x + baseDirectionX * 19;
  const startY = player.y - 15 + baseDirectionY * 5;
  Object.assign(pistolShot, {
    timer: recoilDuration,
    duration: recoilDuration,
    weaponType: weapon.type,
    startX,
    startY,
    endX: startX,
    endY: startY,
    hit: false
  });
  const pelletCount = Math.max(1, Number(weapon.pellets) || 1);
  const baseAngle = Math.atan2(baseDirectionY, baseDirectionX);
  for (let pellet = 0; pellet < pelletCount; pellet += 1) {
    const spread = pelletCount === 1
      ? 0
      : (pellet / (pelletCount - 1) - 0.5) * 0.28;
    const angle = baseAngle + spread;
    projectiles.push({
      x: startX,
      y: startY,
      previousX: startX,
      previousY: startY,
      directionX: Math.cos(angle),
      directionY: Math.sin(angle),
      angle,
      speed: weapon.type === "shotgun" ? 1350 : PISTOL_BULLET_SPEED,
      distance: 0,
      range,
      damage: weaponDamage(weapon),
      width: weapon.type === "shotgun" ? 7 : PISTOL_BULLET_WIDTH,
      sourceType: weapon.type,
      sourceLabel: weapon.label
    });
  }
  if (weapon.type === "shotgun") playShotgunSound(player.x, player.y);
  else playPistolSound(player.x, player.y);
  const ammoText = `${weapon.loadedAmmo}/${weapon.magazineSize}`;
  showMessage(`${weapon.label}开火 · 弹药 ${ammoText}`, 0.75);
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

function playerBuildingTargets() {
  return [
    ...barricades.map((building) => ({ building, collection: barricades, type: "wall" })),
    ...doors.map((building) => ({ building, collection: doors, type: "door" })),
    ...buildings.map((building) => ({ building, collection: buildings, type: building.type }))
  ];
}

function playerBuildingTargetCenter(target) {
  if (target.type === "wall" || target.type === "door") {
    const collider = getDefenseCollider(target.building, target.type);
    return { x: collider.x, y: collider.y };
  }
  return { x: target.building.x, y: target.building.y };
}

function playerBuildingTargetRadius(target) {
  if (target.type === "door") return 22;
  if (target.type === "wall" || target.type === "floor") return 26;
  return 24;
}

function findPlayerBuildingTarget(range = 58) {
  const directionLength = Math.hypot(player.dirX, player.dirY) || 1;
  const directionX = player.dirX / directionLength;
  const directionY = player.dirY / directionLength;
  const reach = Math.max(30, range) + 28;
  const endX = player.x + directionX * reach;
  const endY = player.y + directionY * reach;
  return playerBuildingTargets()
    .map((target) => {
      const center = playerBuildingTargetCenter(target);
      const distance = Math.hypot(center.x - player.x, center.y - player.y);
      const lineDistance = segmentDistanceToPoint(
        player.x,
        player.y,
        endX,
        endY,
        center.x,
        center.y
      );
      return {
        ...target,
        center,
        distance,
        lineDistance,
        aimDistance: Math.hypot(center.x - endX, center.y - endY)
      };
    })
    .filter((target) => (
      target.distance <= reach
      && target.lineDistance <= playerBuildingTargetRadius(target)
    ))
    .sort((left, right) => left.aimDistance - right.aimDistance)[0] || null;
}

function findPlayerBuildingSegmentTarget(startX, startY, endX, endY) {
  const segmentX = endX - startX;
  const segmentY = endY - startY;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;
  return playerBuildingTargets()
    .map((target) => {
      const center = playerBuildingTargetCenter(target);
      return {
        ...target,
        center,
        distance: Math.hypot(center.x - startX, center.y - startY),
        projection: lengthSquared <= 0.0001
          ? -1
          : ((center.x - startX) * segmentX + (center.y - startY) * segmentY) / lengthSquared,
        lineDistance: segmentDistanceToPoint(startX, startY, endX, endY, center.x, center.y)
      };
    })
    .filter((target) => (
      target.projection >= 0
      && target.projection <= 1
      && target.lineDistance <= playerBuildingTargetRadius(target)
    ))
    .sort((left, right) => left.distance - right.distance)[0] || null;
}

function damagePlayerBuilding(target, damage, angle = 0) {
  if (!target?.building) return { hit: false, destroyed: false, blocked: false };
  const building = target.building;
  if (target.type === "chest" && normalizeChestStorage(building).some(Boolean)) {
    showMessage("先清空储物箱，避免里面的物品丢失", 1.1);
    return { hit: false, destroyed: false, blocked: true };
  }

  normalizePlayerBuildingHealth(building, target.type);
  building.health = Math.max(0, building.health - Math.max(1, Math.round(damage)));
  building.hitUntil = elapsed + 0.14;
  const center = target.center || playerBuildingTargetCenter(target);
  spawnActionImpact("wood", center.x, center.y - 5, angle);
  if (building.health > 0) {
    return { hit: true, destroyed: false, blocked: false };
  }

  if (building.landmark === SUPPLY_CACHE_LANDMARK) {
    const cache = supplyCaches.find((item) => (
      item.id === building.landmarkId || item.chestId === building.id
    ));
    if (cache) cache.destroyed = true;
  }
  const index = target.collection.indexOf(building);
  if (index >= 0) target.collection.splice(index, 1);
  if (activeChestId === building.id) activeChestId = null;
  saveGame(false);
  updateHud();
  return { hit: true, destroyed: true, blocked: false };
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
      const bulletKnockback = bullet.sourceType === "shotgun" ? 3 : 12;
      target.x += bullet.directionX * bulletKnockback;
      target.y += bullet.directionY * bulletKnockback;
      pistolShot.hit = true;
      spawnActionImpact("monster", target.x, target.y - 7, bullet.angle);
      playBulletImpact(target.x, target.y);
      showMessage(`${bullet.sourceLabel || "子弹"}命中怪物`, 0.65);
      projectiles.splice(index, 1);
      continue;
    }
    const buildingTarget = findPlayerBuildingSegmentTarget(
      bullet.previousX,
      bullet.previousY,
      bullet.x,
      bullet.y
    );
    if (buildingTarget) {
      damagePlayerBuilding(buildingTarget, bullet.damage, bullet.angle);
      playBulletImpact(buildingTarget.center.x, buildingTarget.center.y);
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
  if (weapon?.magazineSize) {
    fireFirearm(weapon);
    return;
  }
  const damage = weaponDamage(weapon);
  const range = weapon?.range || 58;
  const knockback = weaponKnockback();
  player.attackCooldown = weaponAttackCooldown(weapon);
  player.toolSwingTimer = 0;
  player.toolSwingType = "";
  player.attackTimer = MELEE_SWING_DURATION;
  let hit = false;
  let soundX = player.x + player.dirX * 52;
  let soundY = player.y + player.dirY * 52;
  for (const monster of monsters) {
    if (monster.dead) continue;
    const dx = monster.x - player.x;
    const dy = monster.y - player.y;
    if (Math.hypot(dx, dy) < range) {
      monster.health -= damage;
      monster.hurtTimer = 0.18;
      monster.x += (dx / (Math.hypot(dx, dy) || 1)) * knockback;
      monster.y += (dy / (Math.hypot(dx, dy) || 1)) * knockback;
      spawnActionImpact(
        "monster",
        monster.x,
        monster.y - 8,
        Math.atan2(dy, dx)
      );
      hit = true;
      soundX = monster.x;
      soundY = monster.y;
    }
  }
  if (!hit) {
    const buildingTarget = findPlayerBuildingTarget(range);
    if (buildingTarget) {
      const result = damagePlayerBuilding(
        buildingTarget,
        damage,
        Math.atan2(
          buildingTarget.center.y - player.y,
          buildingTarget.center.x - player.x
        )
      );
      hit = result.hit || result.blocked;
      soundX = buildingTarget.center.x;
      soundY = buildingTarget.center.y;
    }
  }
  playWeaponSound(soundX, soundY, hit);
  showMessage(hit ? "攻击命中" : "攻击落空", 0.7);
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

function spawnMonster(forcedType = null) {
  const type = forcedType === "zombie" || forcedType === "mimic"
    ? forcedType
    : Math.random() < 0.65 ? "zombie" : "mimic";
  const isZombie = type === "zombie";
  const angle = Math.random() * Math.PI * 2;
  const distance = (isZombie ? 480 : 560) + Math.random() * 180;
  const x = Math.max(WORLD.margin, Math.min(WORLD.width - WORLD.margin, player.x + Math.cos(angle) * distance));
  const y = Math.max(WORLD.margin, Math.min(WORLD.height - WORLD.margin, player.y + Math.sin(angle) * distance));
  return spawnMonsterAt(type, x, y);
}

function spawnMonsterAt(type, x, y, extra = {}) {
  const isZombie = type === "zombie";
  const monster = {
    type,
    name: isZombie ? "僵尸" : "模仿者",
    x,
    y,
    radius: isZombie ? 10 : 13,
    health: isZombie ? 48 + dayNumber * 6 : 70 + dayNumber * 7,
    speed: isZombie ? 31 + dayNumber * 1.8 : 37 + dayNumber * 3,
    alerted: false,
    detectionCooldown: 0,
    attackCooldown: 0,
    hurtTimer: 0,
    footstepTimer: 0,
    dirX: 1,
    animation: Math.random() * 2,
    dead: false,
    deathTimer: 0,
    ...extra
  };
  monsters.push(monster);
  if (bloodMoonActive) applyBloodMoonBuff(monster);
  return monster;
}

function triggerMimicJumpscare(worldX = player.x) {
  if (!mimicJumpscare) return;
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
  monster.cabinGuard = false;
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
    const isZombie = monster.type === "zombie";
    const deathDuration = isZombie ? ZOMBIE_DEATH_DURATION : MIMIC_DEATH_DURATION;
    const detectionDistance = (isZombie ? ZOMBIE_DETECTION_DISTANCE : MIMIC_DETECTION_DISTANCE)
      * weatherMonsterDetectionScale();
    const loseDistance = isZombie ? ZOMBIE_LOSE_DISTANCE : MIMIC_LOSE_DISTANCE;
    const attackDistance = isZombie ? ZOMBIE_ATTACK_DISTANCE : MIMIC_ATTACK_DISTANCE;
    monster.attackCooldown = Math.max(0, (monster.attackCooldown || 0) - delta);
    monster.detectionCooldown = Math.max(0, (monster.detectionCooldown || 0) - delta);
    monster.footstepTimer = Math.max(0, (monster.footstepTimer || 0) - delta);
    monster.hurtTimer = Math.max(0, (monster.hurtTimer || 0) - delta);

    if (monster.dead) {
      monster.deathTimer = (monster.deathTimer || 0) + delta;
      if (monster.deathTimer >= deathDuration) {
        monsters.splice(i, 1);
        const dropRoll = Math.random();
        if (isZombie) {
          if (dropRoll < 0.42) addResource("scrap", 1);
        } else {
          if (dropRoll < 0.55) {
            addResource("scrap", 1);
            showMessage("模仿者留下了废铁 ×1");
          } else if (dropRoll < 0.8) {
            addResource("wood", 1);
            showMessage("模仿者留下了木材 ×1");
          } else {
            showMessage("模仿者倒下了");
          }
        }
      }
      continue;
    }
    if (monster.health <= 0) {
      monster.dead = true;
      monster.alerted = false;
      monster.deathTimer = 0;
      continue;
    }

    monster.animation = (monster.animation || 0)
      + delta * (monster.alerted ? (isZombie ? 6 : 7.5) : (isZombie ? 1.8 : 2.2));
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (!night && monster.cabinGuard) {
      if (!monster.alerted && monster.detectionCooldown <= 0 && distance <= detectionDistance) {
        monster.alerted = true;
        playMimicDetected(monster);
      }
      if (!monster.alerted) continue;
    } else if (!night) {
      monster.alerted = false;
      const retreatX = monster.x - player.x;
      const retreatY = monster.y - player.y;
      const retreatDistance = Math.hypot(retreatX, retreatY) || 1;
      monster.dirX = retreatX / retreatDistance;
      monster.x += (retreatX / retreatDistance) * 28 * delta;
      monster.y += (retreatY / retreatDistance) * 28 * delta;
      if (retreatDistance > 980) monsters.splice(i, 1);
      continue;
    }

    if (!monster.alerted && monster.detectionCooldown <= 0 && distance <= detectionDistance) {
      monster.alerted = true;
      if (isZombie) playZombieDetected(monster);
      else {
        playMimicDetected(monster);
        showMessage("附近传来模仿你的脚步声", 1.2);
      }
    } else if (monster.alerted && distance > loseDistance) {
      monster.alerted = false;
    }

    if (monster.alerted) {
      if (distance > attackDistance) {
        monster.dirX = dx / distance;
        const nextX = monster.x + (dx / distance) * monster.speed * delta;
        const nextY = monster.y + (dy / distance) * monster.speed * delta;
        const defense = findBlockingDefense(nextX, nextY, monster.radius);
        if (defense) {
          attackDefense(monster, defense);
        } else {
          monster.x = nextX;
          monster.y = nextY;
          if (monster.footstepTimer <= 0) {
            if (isZombie) playZombieFootstep(monster);
            else playMimicFootstep(monster);
            monster.footstepTimer = isZombie ? 0.44 : 0.32;
          }
        }
      } else {
        if (monster.attackCooldown <= 0 && player.hurtTimer <= 0) {
          if (isZombie) {
            const damage = bloodMoonMonsterDamage(monster, ZOMBIE_ATTACK_DAMAGE);
            player.health = Math.max(0, player.health - damage);
            player.hurtTimer = 0.62;
            monster.attackCooldown = 1.15;
            playZombieAttack(monster);
          } else {
            const damage = bloodMoonMonsterDamage(monster, MIMIC_JUMPSCARE_DAMAGE);
            player.health = Math.max(0, player.health - damage);
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
  const baseDamage = monster.type === "zombie" ? 9 + dayNumber : 12 + dayNumber * 2;
  defense.item.health -= bloodMoonMonsterDamage(monster, baseDamage);
  monster.attackCooldown = monster.type === "zombie" ? 1.1 : 0.8;
  if (defense.item.health > 0) return;
  const index = defense.list.indexOf(defense.item);
  if (index >= 0) defense.list.splice(index, 1);
  showMessage(`${defense.label}被怪物破坏了！`, 1.4);
}

function syncInventoryItems() {
  for (const definition of RESOURCE_ITEMS) {
    const total = Math.max(0, Math.floor(Number(player[definition.type]) || 0));
    const quickIndexes = [];
    const matchingIndexes = [];
    let stacked = 0;
    quickbarItems.forEach((item, index) => {
      if (item?.type === definition.type) quickIndexes.push(index);
    });
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
      quickIndexes.forEach((index) => {
        quickbarItems[index] = null;
        if (selectedQuickSlot === index) selectedQuickSlot = -1;
      });
      matchingIndexes.forEach((index) => { inventoryItems[index] = null; });
      continue;
    }
    // 旧存档曾把背包资源复制成快捷栏“镜像”。只要快捷栏中已有这种
    // 资源，就把总数合并为一个真实堆叠，并清掉背包中的镜像来源。
    if (quickIndexes.length > 0) {
      const keepIndex = quickIndexes[0];
      quickbarItems[keepIndex] = {
        ...definition,
        count: total,
        source: "carried"
      };
      quickIndexes.slice(1).forEach((index) => {
        quickbarItems[index] = null;
        if (selectedQuickSlot === index) selectedQuickSlot = keepIndex;
      });
      matchingIndexes.forEach((index) => { inventoryItems[index] = null; });
      continue;
    }
    if (matchingIndexes.length === 0) {
      const placed = addToFirstCarriedSlot({
        ...definition,
        count: total,
        source: "carried"
      });
      if (!placed) ensureInventoryResource(definition.type);
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
    slot.dataset.itemTier = item?.tier || "";
    slot.dataset.equipmentClass = item?.equipmentClass || "";
    slot.dataset.label = item ? equipmentDisplayLabel(item, true) : "";
    slot.dataset.count = item ? String(amount) : "";
    slot.draggable = Boolean(item);
    const useTip = item?.type === "berry"
      ? "，点击食用"
      : item?.kind === "consumable"
        ? "，点击使用"
        : item?.type === "glass_bottle" ? "，靠近水边按 E 装水" : "";
    const firearmTip = item?.magazineSize
      ? `，弹药 ${item.loadedAmmo}/${item.magazineSize}`
      : "";
    slot.title = item
      ? `${equipmentDisplayLabel(item)} ×${amount}${firearmTip}${useTip}；拖动可整理，右键拆分`
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
    slot.classList.toggle("has-item", Boolean(item));
    slot.dataset.itemType = item?.type || "empty";
    slot.dataset.itemTier = item?.tier || "";
    slot.dataset.equipmentClass = item?.equipmentClass || "";
    slot.dataset.label = item ? equipmentDisplayLabel(item, true) : "";
    slot.dataset.count = item ? String(item.count) : "";
    slot.draggable = Boolean(item);
    slot.title = item
      ? `${equipmentDisplayLabel(item)} ×${item.count}；单击直接拿取，也可拖动，右键拆分`
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
  }
  const amount = item.count;
  items[chestIndex] = null;
  finishStorageMove(`已取出${carried.label} ×${amount}`);
  return true;
}

function takeChestItem(chestIndex) {
  const chest = currentChest();
  if (!chest) return false;
  const items = normalizeChestStorage(chest);
  const item = items[chestIndex];
  const carried = normalizePortableItem(item);
  const amount = Math.max(1, Math.floor(Number(item?.count) || 1));
  if (!item || !carried) return false;

  let destination = null;
  if (isStackableItem(carried)) {
    const quickIndex = quickbarItems.findIndex((entry) => entry?.type === carried.type);
    const inventoryIndex = inventoryItems.findIndex((entry) => entry?.type === carried.type);
    if (quickIndex >= 0) {
      quickbarItems[quickIndex].count += amount;
      destination = `快捷栏 ${quickIndex + 1}`;
    } else if (inventoryIndex >= 0) {
      inventoryItems[inventoryIndex].count += amount;
      destination = `背包 ${inventoryIndex + 1}`;
    }
  }
  if (!destination) {
    const placed = addToFirstCarriedSlot({ ...carried, count: amount });
    if (!placed) {
      showMessage("快捷栏和背包都已满", 1);
      return false;
    }
    destination = placed.collection === "quickbar"
      ? `快捷栏 ${placed.index + 1}`
      : `背包 ${placed.index + 1}`;
  }

  if (resourceItemDefinition(carried.type)) {
    player[carried.type] = Math.max(0, Number(player[carried.type]) || 0) + amount;
  }
  items[chestIndex] = null;
  finishStorageMove(`已取出${carried.label} ×${amount}，放入${destination}`);
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
  syncInventoryItems();
  const item = inventoryItems[inventoryIndex];
  const carried = normalizePortableItem(item);
  const target = quickbarItems[quickIndex];
  if (!carried) return false;
  if (resourceItemDefinition(carried.type)) {
    if (target && target.type !== carried.type) {
      showMessage("请拖到空的快捷格", 0.9);
      return false;
    }
    quickbarItems.forEach((entry, index) => {
      if (entry?.type !== carried.type || index === quickIndex) return;
      quickbarItems[index] = null;
      if (selectedQuickSlot === index) selectedQuickSlot = quickIndex;
    });
    inventoryItems.forEach((entry, index) => {
      if (entry?.type === carried.type) inventoryItems[index] = null;
    });
    quickbarItems[quickIndex] = {
      ...resourceItemDefinition(carried.type),
      count: Math.max(0, Math.floor(Number(player[carried.type]) || 0)),
      source: "carried"
    };
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
  syncInventoryItems();
  const item = quickbarItems[quickIndex];
  const carried = normalizePortableItem(item);
  if (!carried) return false;
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

function quickbarItemAmount(item) {
  if (!item) return null;
  if (item.magazineSize) return Math.max(0, Number(item.loadedAmmo) || 0);
  if (item.kind === "building") return Math.max(0, Number(item.count) || 0);
  if (resourceItemDefinition(item.type)) return Math.max(0, Number(item.count) || 0);
  if (portableItemDefinition(item.type)) return Math.max(0, Number(item.count) || 0);
  return null;
}

function updateSurvivalReadout() {
  if (objectiveLabel) {
    const gateDistance = escapeGateDistance();
    const gateClueCount = abandonedCabins.filter((cabin) => cabin.clueFound).length;
    const nearestCabin = abandonedCabins
      .filter((cabin) => !cabin.searched)
      .map((cabin) => ({
        cabin,
        distance: Math.hypot(player.x - cabin.x, player.y - cabin.y)
      }))
      .sort((left, right) => left.distance - right.distance)[0] || null;
    const nearestCache = supplyCaches
      .filter((cache) => !cache.searched && !cache.destroyed)
      .map((cache) => ({
        cache,
        distance: Math.hypot(player.x - cache.x, player.y - cache.y)
      }))
      .sort((left, right) => left.distance - right.distance)[0] || null;
    const nearestExplorationTarget = [
      nearestCache ? {
        x: nearestCache.cache.x,
        y: nearestCache.cache.y,
        distance: nearestCache.distance,
        label: "废弃物资箱"
      } : null,
      nearestCabin ? {
        x: nearestCabin.cabin.x,
        y: nearestCabin.cabin.y,
        distance: nearestCabin.distance,
        label: ABANDONED_CABIN_TYPES[
          normalizeAbandonedCabinType(nearestCabin.cabin.type)
        ].label
      } : null
    ].filter(Boolean).sort((left, right) => left.distance - right.distance)[0] || null;
    if (classSelectionOpen) {
      objectiveLabel.textContent = "选择职业后进入森林";
    } else if (gateDistance < ESCAPE_GATE_INTERACT_DISTANCE * 1.4) {
      objectiveLabel.textContent = "逃生大门就在前方 · 靠近按 E";
    } else if (nearestCabin?.distance < 440) {
      const cabinType = normalizeAbandonedCabinType(nearestCabin.cabin.type);
      objectiveLabel.textContent = `发现${ABANDONED_CABIN_TYPES[cabinType].label} · 搜索里面的储物箱`;
    } else if (nearestCache?.distance < 300) {
      objectiveLabel.textContent = "发现废弃物资箱 · 靠近按 E";
    } else if (player.health <= 30) {
      objectiveLabel.textContent = "寻找浆果，先处理伤势";
    } else if (escapeGate.discovered) {
      objectiveLabel.textContent = `返回逃生大门 · 大致在${escapeGateDirection()}方`;
    } else if (gateClueCount > 0 && isNight()) {
      objectiveLabel.textContent = `活过夜晚 · 继续向${escapeGateDirection()}方搜索`;
    } else if (gateClueCount > 0) {
      objectiveLabel.textContent = `找到木屋地图 · 逃生大门大致在${escapeGateDirection()}方`;
    } else if (isNight()) {
      objectiveLabel.textContent = "活过夜晚 · 搜索木屋寻找大门线索";
    } else if (nearestExplorationTarget) {
      objectiveLabel.textContent = `向${directionToWorldPosition(
        nearestExplorationTarget.x,
        nearestExplorationTarget.y
      )}探索 · ${qualitativeDistance(nearestExplorationTarget.distance)}有${nearestExplorationTarget.label}`;
    } else {
      objectiveLabel.textContent = "搜索废弃木屋 · 寻找逃生大门线索";
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
  if (weatherLabel) {
    const normalWeather = WEATHER_DEFINITIONS[weather.type]?.label || "晴朗";
    weatherLabel.textContent = bloodMoonActive ? `血月·${normalWeather}` : normalWeather;
    weatherLabel.title = bloodMoonActive
      ? "血月：怪物生命、伤害、速度与刷新率全部提高"
      : precipitationIntensity() > 0.1
        ? "雨声会掩盖脚步，怪物更难发现你"
        : "当前天气不会影响怪物的感知";
  }
  gameScreen.dataset.weather = weather.type;
  gameScreen.dataset.bloodMoon = bloodMoonActive ? "active" : "inactive";
  gameScreen.classList.toggle("blood-moon", bloodMoonActive);
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
  resourceLabel.textContent = `木材 ${player.wood}　石头 ${player.stone}　浆果 ${player.berry}　废铁 ${player.scrap}`;
  flashlightLabel.textContent = `手电筒 ${player.flashlight ? "开" : "关"}`;
  updateSurvivalReadout();
  const selected = BUILD_TYPES[selectedBuild];
  renderInventory();
  renderChestStorage();
  renderCrafting();
  renderWeaponCrafting();
  renderSupplyCrafting();
  quickSlots.forEach((slot, index) => {
    const item = quickbarItems[index];
    const amount = quickbarItemAmount(item);
    const selectedSlot = Boolean(item) && index === selectedQuickSlot;
    slot.classList.toggle("selected", selectedSlot);
    slot.classList.toggle("slot-empty", !item);
    slot.classList.toggle("quick-empty", !item);
    slot.dataset.itemKind = item?.kind || "empty";
    slot.dataset.itemType = item?.type || "empty";
    slot.dataset.itemTier = item?.tier || "";
    slot.dataset.equipmentClass = item?.equipmentClass || "";
    slot.dataset.label = item ? equipmentDisplayLabel(item, true) : "空";
    slot.dataset.count = amount === null ? "" : String(amount);
    slot.draggable = Boolean(item);
    slot.title = item
      ? item.magazineSize
        ? `${equipmentDisplayLabel(item)} · 弹药 ${amount}/${item.magazineSize} · R 换弹`
        : `${equipmentDisplayLabel(item)}${amount === null ? "" : ` ×${amount}`}${
          item.type === "glass_bottle" ? " · 靠近水边按 E 装水" : ""
        }`
      : "空快捷格";
    slot.setAttribute("aria-pressed", String(selectedSlot));
  });
  const selectedItem = quickbarItems[selectedQuickSlot];
  if (selectedItem?.kind === "building") {
    buildingLabel.textContent = `快捷 ${selectedQuickSlot + 1}：${selected.label}（木${selected.cost.wood} 石${selected.cost.stone}）`;
  } else if (selectedItem?.kind === "food" && selectedItem.type === "berry") {
    buildingLabel.textContent = `快捷 ${selectedQuickSlot + 1}：浆果（${player.berry}）`;
  } else if (selectedItem?.magazineSize) {
    buildingLabel.textContent = `当前武器：${equipmentDisplayLabel(selectedItem)} · 弹药 ${selectedItem.loadedAmmo}/${selectedItem.magazineSize} · 弹药箱 ${portableItemCount("ammo_box")} · R 换弹`;
  } else if (selectedItem?.equipmentClass === "tool") {
    const efficiency = selectedItem.tier === "wood"
      ? "基础开采"
      : selectedItem.tier === "iron" ? "快速开采" : "标准开采";
    buildingLabel.textContent = `当前工具：${equipmentDisplayLabel(selectedItem)} · ${efficiency}`;
  } else if (selectedItem?.kind === "weapon") {
    buildingLabel.textContent = `当前武器：${equipmentDisplayLabel(selectedItem) || "武器"}`;
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
  drawResources("back");
  drawEscapeGate();
  drawMonsters();
  drawBuildPreview();
  drawPlayer();
  drawResources("front");
  drawActionImpacts();
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

function mapPointFromWorld(worldX, worldY) {
  return {
    x: worldX / WORLD.width * mapCanvas.width,
    y: worldY / WORLD.height * mapCanvas.height
  };
}

function drawExplorationMapSprite(
  image,
  sourceX,
  sourceY,
  sourceWidth,
  sourceHeight,
  worldX,
  worldY,
  drawWidth,
  drawHeight,
  glowColor = ""
) {
  if (!mapContext || !mapCanvas || !image?.complete
    || image.naturalWidth < sourceX + sourceWidth
    || image.naturalHeight < sourceY + sourceHeight) return;
  const point = mapPointFromWorld(worldX, worldY);
  mapContext.save();
  mapContext.translate(point.x, point.y);
  if (glowColor) {
    mapContext.shadowColor = glowColor;
    mapContext.shadowBlur = 5;
  }
  mapContext.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );
  mapContext.restore();
}

function drawExplorationCabin(cabin) {
  if (!mapContext || !worldSprite.complete
    || worldSprite.naturalWidth < 128 || worldSprite.naturalHeight < 96) return;
  const point = mapPointFromWorld(cabin.x, cabin.y);
  const previewTileSize = 1.8;
  const drawCabinPiece = (item, frame, rotation = 0) => {
    const offsetX = (item.x - cabin.x) / BUILD_GRID_SIZE * previewTileSize;
    const offsetY = (item.y - cabin.y) / BUILD_GRID_SIZE * previewTileSize;
    mapContext.save();
    mapContext.translate(offsetX, offsetY);
    mapContext.rotate(rotation);
    mapContext.drawImage(
      worldSprite,
      frame * 16,
      BUILDING_ROW * 16,
      16,
      16,
      -previewTileSize / 2,
      -previewTileSize / 2,
      previewTileSize,
      previewTileSize
    );
    mapContext.restore();
  };
  const cabinBuildings = buildings.filter((item) => item.landmarkId === cabin.id);
  const cabinWalls = barricades.filter((item) => item.landmarkId === cabin.id);
  const cabinDoors = doors.filter((item) => item.landmarkId === cabin.id);

  mapContext.save();
  mapContext.translate(point.x, point.y);
  mapContext.shadowColor = "rgba(218, 224, 199, .45)";
  mapContext.shadowBlur = 3;
  cabinBuildings.filter((item) => item.type === "floor")
    .forEach((item) => drawCabinPiece(item, BUILDING_FRAME.floor));
  cabinWalls.forEach((item) => (
    drawCabinPiece(item, BUILDING_FRAME.wall, item.rotation || 0)
  ));
  cabinDoors.forEach((item) => (
    drawCabinPiece(
      item,
      item.open ? BUILDING_FRAME.doorOpen : BUILDING_FRAME.doorClosed,
      item.rotation || 0
    )
  ));
  cabinBuildings.filter((item) => item.type !== "floor").forEach((item) => {
    const frame = BUILDING_FRAME[item.type];
    if (Number.isFinite(frame)) drawCabinPiece(item, frame);
  });
  mapContext.restore();
}

function drawExplorationLandmarks() {
  abandonedCabins.filter((cabin) => cabin.searched).forEach(drawExplorationCabin);
  supplyCaches.filter((cache) => cache.searched && !cache.destroyed).forEach((cache) => {
    drawExplorationMapSprite(
      worldSprite,
      BUILDING_FRAME.chest * 16,
      BUILDING_ROW * 16,
      16,
      16,
      cache.x,
      cache.y,
      7,
      7,
      "rgba(201, 162, 100, .55)"
    );
  });

  if (escapeGate.discovered) {
    drawExplorationMapSprite(
      escapeGateSprite,
      0,
      0,
      64,
      64,
      escapeGate.x,
      escapeGate.y,
      15,
      15,
      "rgba(225, 196, 91, .75)"
    );
  }

  drawExplorationMapSprite(
    worldSprite,
    BUILDING_FRAME.campfire * 16,
    BUILDING_ROW * 16,
    16,
    16,
    CAMP_POSITION.x,
    CAMP_POSITION.y,
    11,
    11,
    "rgba(223, 139, 77, .7)"
  );

  const playerFrame = Math.floor(elapsed * 2) % 2;
  const playerPoint = mapPointFromWorld(player.x, player.y);
  if (sprite.complete && sprite.naturalWidth >= 16 && sprite.naturalHeight >= 16) {
    mapContext.save();
    mapContext.translate(playerPoint.x, playerPoint.y);
    if (player.dirX < 0) mapContext.scale(-1, 1);
    mapContext.shadowColor = "rgba(244, 233, 183, .72)";
    mapContext.shadowBlur = 5;
    mapContext.drawImage(
      sprite,
      playerFrame * 16,
      player.classRow * 16,
      16,
      16,
      -6,
      -7,
      12,
      12
    );
    mapContext.restore();
  }
}

function approximateEscapeGateMapRegion() {
  const gateTileX = Math.floor(escapeGate.x / TILE_SIZE);
  const gateTileY = Math.floor(escapeGate.y / TILE_SIZE);
  const angle = gridHash(gateTileX, gateTileY, 503) * Math.PI * 2;
  const offset = (42 + gridHash(gateTileX, gateTileY, 509) * 46) * TILE_SIZE;
  return {
    x: Math.max(0, Math.min(WORLD.width, escapeGate.x + Math.cos(angle) * offset)),
    y: Math.max(0, Math.min(WORLD.height, escapeGate.y + Math.sin(angle) * offset)),
    radius: 118 * TILE_SIZE
  };
}

function renderExplorationMap() {
  if (!mapContext || !mapCanvas) return;
  const width = mapCanvas.width;
  const height = mapCanvas.height;
  const cellWidth = width / MAP_COLUMNS;
  const cellHeight = height / MAP_ROWS;
  const terrainDetail = 5;
  const detailWidth = cellWidth / terrainDetail;
  const detailHeight = cellHeight / terrainDetail;
  const terrainColors = {
    [TERRAIN_FRAME.grass]: "#294437",
    [TERRAIN_FRAME.sand]: "#655e41",
    [TERRAIN_FRAME.water]: "#205361"
  };

  mapContext.clearRect(0, 0, width, height);
  mapContext.fillStyle = "#020707";
  mapContext.fillRect(0, 0, width, height);

  exploredMapCells.forEach((key) => {
    const cell = parseMapCellKey(key);
    if (!cell) return;
    for (let detailY = 0; detailY < terrainDetail; detailY += 1) {
      for (let detailX = 0; detailX < terrainDetail; detailX += 1) {
        const worldX = Math.min(
          WORLD.width - 1,
          (cell.column + (detailX + 0.5) / terrainDetail) * MAP_CELL_WORLD_SIZE
        );
        const worldY = Math.min(
          WORLD.height - 1,
          (cell.row + (detailY + 0.5) / terrainDetail) * MAP_CELL_WORLD_SIZE
        );
        const terrain = terrainAtWorld(worldX, worldY);
        mapContext.fillStyle = terrainColors[terrain] || terrainColors[TERRAIN_FRAME.grass];
        mapContext.fillRect(
          cell.column * cellWidth + detailX * detailWidth,
          cell.row * cellHeight + detailY * detailHeight,
          Math.ceil(detailWidth + 0.2),
          Math.ceil(detailHeight + 0.2)
        );
      }
    }
  });

  mapContext.save();
  mapContext.strokeStyle = "rgba(120, 148, 132, .2)";
  mapContext.lineWidth = 1;
  mapContext.strokeRect(.5, .5, width - 1, height - 1);
  mapContext.restore();

  const clueFound = abandonedCabins.some((cabin) => cabin.clueFound);
  if (!escapeGate.discovered && clueFound) {
    const region = approximateEscapeGateMapRegion();
    const point = mapPointFromWorld(region.x, region.y);
    const radiusX = region.radius / WORLD.width * width;
    const radiusY = region.radius / WORLD.height * height;
    mapContext.save();
    mapContext.beginPath();
    mapContext.ellipse(point.x, point.y, radiusX, radiusY, 0, 0, Math.PI * 2);
    mapContext.fillStyle = "rgba(204, 177, 78, .13)";
    mapContext.fill();
    mapContext.restore();
  }

  drawExplorationLandmarks();

  if (mapStatus) {
    mapStatus.textContent = escapeGate.discovered
      ? "逃生大门已准确定位"
      : clueFound
        ? "旧地图只能确定大门的大致区域"
        : "尚未找到逃生大门线索";
  }
  if (mapExplored) {
    const percentage = exploredMapCells.size / (MAP_COLUMNS * MAP_ROWS) * 100;
    const label = percentage > 0 && percentage < 0.1 ? "不足 0.1" : percentage.toFixed(1);
    const searchedCabinCount = abandonedCabins.filter((cabin) => cabin.searched).length;
    const searchedCacheCount = supplyCaches.filter((cache) => cache.searched).length;
    mapExplored.textContent = `已探索 ${label}% · 木屋 ${searchedCabinCount}/${ABANDONED_CABIN_COUNT} · 物资箱 ${searchedCacheCount}/${SUPPLY_CACHE_COUNT}`;
  }
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

function canResourceRestOnDryGround(x, y, radius) {
  const footprint = Math.max(8, radius * 0.72);
  const points = [
    [0, 0],
    [-footprint, 0],
    [footprint, 0],
    [0, -footprint],
    [0, footprint]
  ];
  return points.every(([offsetX, offsetY]) => (
    terrainAtWorld(x + offsetX, y + offsetY) !== TERRAIN_FRAME.water
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
    ctx.save();
    if ((building.hitUntil || 0) > elapsed) ctx.filter = "brightness(1.9)";
    if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
      const frame = BUILDING_FRAME[building.type];
      ctx.drawImage(worldSprite, frame * 16, BUILDING_ROW * 16, 16, 16, building.x - 24, building.y - 24, 48, 48);
    } else {
      ctx.fillStyle = building.type === "floor" ? "#76543a" : "#67432d";
      ctx.fillRect(building.x - 22, building.y - 22, 44, 44);
    }
    ctx.restore();
    drawDefenseHealth(building);
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

const GROUND_RESOURCE_TYPES = new Set(["branch", "pebble", "scrap", "glass_bottle"]);

function resourceRenderLayer(resource) {
  if (GROUND_RESOURCE_TYPES.has(resource.type)) return "back";
  return resource.y > player.y ? "front" : "back";
}

function resourceIsVisible(resource) {
  return resource.x >= camera.x - 100
    && resource.x <= camera.x + W + 100
    && resource.y >= camera.y - 90
    && resource.y <= camera.y + H + 180;
}

function drawResources(layer = "all") {
  const visibleResources = resources
    .filter((resource) => (
      resourceIsVisible(resource)
      && (layer === "all" || resourceRenderLayer(resource) === layer)
    ))
    .sort((left, right) => (
      left.y - right.y
      || left.x - right.x
      || (left.id || 0) - (right.id || 0)
    ));

  for (const resource of visibleResources) {
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
    } else if (resource.type === "branch") {
      if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
        ctx.drawImage(worldSprite, 0, 2 * 16, 16, 16, resource.x - 16, resource.y - 16, 32, 32);
        continue;
      }
      ctx.strokeStyle = "#7b4c2b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(resource.x - 12, resource.y + 7);
      ctx.lineTo(resource.x + 12, resource.y - 7);
      ctx.stroke();
    } else if (resource.type === "pebble") {
      if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
        ctx.drawImage(worldSprite, PROP_FRAME.stone * 16, 2 * 16, 16, 16, resource.x - 13, resource.y - 13, 26, 26);
        continue;
      }
      ctx.fillStyle = "#869187";
      ctx.beginPath();
      ctx.ellipse(resource.x, resource.y, 9, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (resource.type === "scrap") {
      if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
        ctx.drawImage(worldSprite, 4 * 16, 2 * 16, 16, 16, resource.x - 16, resource.y - 16, 32, 32);
        drawHarvestProgress(resource);
        continue;
      }
      ctx.fillStyle = "#81858a";
      ctx.fillRect(resource.x - 11, resource.y - 5, 9, 6);
      ctx.fillRect(resource.x + 1, resource.y - 9, 8, 13);
      ctx.fillRect(resource.x - 4, resource.y + 4, 12, 5);
    } else if (resource.type === "glass_bottle") {
      if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
        ctx.drawImage(worldSprite, 6 * 16, 16, 16, 16, resource.x - 16, resource.y - 16, 32, 32);
        continue;
      }
      ctx.save();
      ctx.fillStyle = "rgba(3, 7, 7, .35)";
      ctx.beginPath();
      ctx.ellipse(resource.x, resource.y + 8, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#263536";
      ctx.fillRect(resource.x - 4, resource.y - 10, 8, 4);
      ctx.fillRect(resource.x - 7, resource.y - 6, 14, 13);
      ctx.fillStyle = "#d9ebe4";
      ctx.fillRect(resource.x - 2, resource.y - 9, 4, 4);
      ctx.fillRect(resource.x - 5, resource.y - 4, 10, 9);
      ctx.fillStyle = "rgba(113, 168, 169, .5)";
      ctx.fillRect(resource.x - 3, resource.y - 2, 3, 5);
      ctx.fillStyle = "rgba(244, 255, 247, .85)";
      ctx.fillRect(resource.x + 2, resource.y - 3, 2, 4);
      ctx.restore();
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
  const requiredHits = resourceHarvestHits(resource.type, equippedQuickbarItem());
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
    ctx.save();
    if ((barricade.hitUntil || 0) > elapsed) ctx.filter = "brightness(1.9)";
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
    ctx.restore();
    drawDefenseHealth(barricade);
  }
}

function drawDoors() {
  for (const door of doors) {
    ctx.save();
    if ((door.hitUntil || 0) > elapsed) ctx.filter = "brightness(1.9)";
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
    ctx.restore();
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
  if (!Number.isFinite(defense.health) || !Number.isFinite(defense.maxHealth)) return;
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
    const isZombie = monster.type === "zombie";
    const bob = monster.dead
      ? 0
      : Math.sin(elapsed * (monster.alerted ? 8 : 3.5) + monster.x * 0.025) * (monster.alerted ? 2 : 1);
    ctx.save();
    ctx.fillStyle = "rgba(3, 7, 9, .45)";
    ctx.beginPath();
    ctx.ellipse(monster.x, monster.y + 15, monster.dead ? 17 : 20, monster.dead ? 5 : 7, 0, 0, Math.PI * 2);
    ctx.fill();
    if (monster.bloodMoonBuffed && !monster.dead) {
      const aura = ctx.createRadialGradient(
        monster.x,
        monster.y - 7,
        4,
        monster.x,
        monster.y - 7,
        34
      );
      aura.addColorStop(0, "rgba(174, 34, 38, .18)");
      aura.addColorStop(1, "rgba(91, 5, 12, 0)");
      ctx.fillStyle = aura;
      ctx.fillRect(monster.x - 34, monster.y - 41, 68, 68);
    }

    if (isZombie && zombieSprite.complete
      && zombieSprite.naturalWidth >= 176 && zombieSprite.naturalHeight >= 16) {
      const frame = getZombieFrame(monster);
      ctx.save();
      ctx.translate(monster.x, 0);
      if ((monster.dirX || 1) < 0) ctx.scale(-1, 1);
      if (monster.hurtTimer > 0 && !monster.dead) {
        // 僵尸没有额外受击帧，命中时直接把当前帧闪成白色。
        ctx.filter = "brightness(0) invert(1)";
      }
      ctx.drawImage(
        zombieSprite,
        frame * ZOMBIE_FRAME_SIZE,
        0,
        ZOMBIE_FRAME_SIZE,
        ZOMBIE_FRAME_SIZE,
        -24,
        monster.y - 37 + bob,
        48,
        48
      );
      ctx.restore();
      ctx.restore();
      continue;
    }

    if (!isZombie && mimicSprite.complete
      && mimicSprite.naturalWidth >= 384 && mimicSprite.naturalHeight >= 32) {
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
    ctx.fillStyle = isZombie ? "#4f6b39" : "#0a0e12";
    ctx.beginPath();
    ctx.moveTo(-13, 12);
    ctx.quadraticCurveTo(-20, -6, -10, -17);
    ctx.quadraticCurveTo(0, -25, 11, -16);
    ctx.quadraticCurveTo(21, -5, 14, 13);
    ctx.quadraticCurveTo(8, 9, 4, 16);
    ctx.quadraticCurveTo(-1, 9, -6, 16);
    ctx.quadraticCurveTo(-9, 10, -13, 12);
    ctx.fill();

    ctx.shadowColor = isZombie ? "#9dc56c" : "#a82f32";
    ctx.shadowBlur = 9;
    ctx.fillStyle = isZombie ? "#d8ef9b" : "#d85150";
    ctx.fillRect(-9, -5, 5, 3);
    ctx.fillRect(4, -5, 5, 3);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

function getZombieFrame(monster) {
  if (monster.dead) {
    const progress = Math.max(0, Math.min(0.999, (monster.deathTimer || 0) / ZOMBIE_DEATH_DURATION));
    return 7 + Math.floor(progress * 4);
  }
  if (monster.alerted) return 2 + (Math.floor(monster.animation || 0) % 5);
  return Math.floor(monster.animation || 0) % 2;
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

function actionImpactPalette(type) {
  if (type === "wood") return ["#f1c97a", "#b7753c", "#72472d"];
  if (type === "stone") return ["#d2d4c8", "#8f948f", "#565d61"];
  if (type === "scrap") return ["#e7a65a", "#9aa0a0", "#5d6263"];
  return ["#fff3dc", "#d96052", "#7d1f29"];
}

function drawActionImpacts() {
  for (const effect of actionImpacts) {
    const remaining = Math.max(0, Math.min(1, effect.timer / effect.duration));
    const progress = 1 - remaining;
    const palette = actionImpactPalette(effect.type);
    ctx.save();
    ctx.translate(effect.x, effect.y);
    ctx.rotate(effect.angle);
    ctx.globalAlpha = Math.min(1, remaining * 1.6);
    ctx.fillStyle = palette[0];
    ctx.fillRect(-7 - progress * 4, -1, 14 + progress * 8, 2);
    ctx.restore();

    for (let particle = 0; particle < 7; particle += 1) {
      const seed = effect.id * 17 + particle * 31;
      const spread = (hash(seed + 3) - 0.5) * 2.8;
      const angle = effect.angle + Math.PI + spread;
      const distance = progress * (10 + hash(seed + 9) * 18);
      const gravity = progress * progress * (9 + hash(seed + 15) * 8);
      const size = 2 + Math.floor(hash(seed + 21) * 3);
      ctx.save();
      ctx.globalAlpha = remaining;
      ctx.fillStyle = palette[particle % palette.length];
      if (effect.type === "monster" && particle < 3) {
        ctx.shadowColor = "#c93835";
        ctx.shadowBlur = 5;
      }
      ctx.translate(
        effect.x + Math.cos(angle) * distance,
        effect.y + Math.sin(angle) * distance - progress * 7 + gravity
      );
      ctx.rotate(angle + progress * (particle % 2 === 0 ? 2.4 : -2.4));
      ctx.fillRect(-size / 2, -1, size + 2, 2);
      ctx.restore();
    }
  }
}

function drawProjectiles() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  if (pistolShot.timer > 0) {
    const flashProgress = 1 - Math.max(0, Math.min(
      1,
      pistolShot.timer / (pistolShot.duration || PISTOL_RECOIL_DURATION)
    ));
    const flashStrength = 1 - actionSmootherStep(flashProgress);
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
    const width = Math.max(5, Number(bullet.width) || PISTOL_BULLET_WIDTH);
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.angle);
    ctx.shadowColor = "#ffd469";
    ctx.shadowBlur = 13;
    ctx.fillStyle = "rgba(255, 185, 72, .72)";
    ctx.fillRect(-width / 2 - 2, -3, width + 4, 6);
    ctx.shadowColor = "#fff0a6";
    ctx.shadowBlur = 7;
    ctx.fillStyle = "#fff4ba";
    ctx.fillRect(-width / 2, -1.5, width, 3);
    ctx.restore();
  }
  ctx.restore();
}

function actionSmootherStep(value) {
  const progress = Math.max(0, Math.min(1, value));
  return progress * progress * progress
    * (progress * (progress * 6 - 15) + 10);
}

function actionEaseInOut(value) {
  const progress = Math.max(0, Math.min(1, value));
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function actionLerp(start, end, progress) {
  return start + (end - start) * progress;
}

function firearmRecoilDuration(weapon) {
  return weapon?.type === "shotgun"
    ? SHOTGUN_RECOIL_DURATION
    : PISTOL_RECOIL_DURATION;
}

function firearmRecoilStrength(weapon) {
  if (!weapon?.magazineSize || pistolShot.timer <= 0) return 0;
  const duration = firearmRecoilDuration(weapon);
  const progress = Math.max(0, Math.min(1, 1 - pistolShot.timer / duration));
  const peakAt = weapon.type === "shotgun" ? 0.3 : 0.24;
  if (progress < peakAt) return actionSmootherStep(progress / peakAt);
  return 1 - actionSmootherStep((progress - peakAt) / (1 - peakAt));
}

function heldWeaponAction(weapon) {
  if (!weapon) return null;
  if (!weapon?.magazineSize
    && player.toolSwingTimer > 0
    && player.toolSwingType === weapon?.type) {
    const progress = Math.max(0, Math.min(
      1,
      1 - player.toolSwingTimer / TOOL_SWING_DURATION
    ));
    return {
      kind: "tool",
      baseAngle: player.toolSwingAngle,
      progress
    };
  }
  if (!weapon?.magazineSize && player.attackTimer > 0) {
    const progress = Math.max(0, Math.min(
      1,
      1 - player.attackTimer / MELEE_SWING_DURATION
    ));
    return {
      kind: "melee",
      baseAngle: Math.atan2(player.dirY, player.dirX),
      progress
    };
  }
  return null;
}

function weaponSwingPose(action) {
  if (!action) return { offset: 0, side: 1, phase: "idle" };
  const side = Math.cos(action.baseAngle) < -0.08 ? -1 : 1;
  const windupEnd = action.kind === "tool" ? 0.24 : 0.2;
  const strikeEnd = action.kind === "tool" ? 0.58 : 0.52;
  const windup = action.kind === "tool" ? -1.28 : -0.96;
  const contact = action.kind === "tool" ? 0.78 : 0.86;
  if (action.progress < windupEnd) {
    const progress = actionSmootherStep(action.progress / windupEnd);
    return {
      side,
      phase: "windup",
      offset: side * actionLerp(0, windup, progress)
    };
  }
  if (action.progress < strikeEnd) {
    const progress = actionEaseInOut(
      (action.progress - windupEnd) / (strikeEnd - windupEnd)
    );
    return {
      side,
      phase: "strike",
      offset: side * actionLerp(windup, contact, progress)
    };
  }
  const progress = actionSmootherStep(
    (action.progress - strikeEnd) / (1 - strikeEnd)
  );
  return {
    side,
    phase: "recover",
    offset: side * actionLerp(contact, 0, progress)
  };
}

function drawWeaponActionTrail(weapon) {
  const action = heldWeaponAction(weapon);
  if (!action) return;
  const pose = weaponSwingPose(action);
  const radius = action.kind === "tool" ? 34 : 31;
  const tail = action.kind === "tool" ? 0.82 : 0.68;
  const windupEnd = action.kind === "tool" ? 0.24 : 0.2;
  const strikeEnd = action.kind === "tool" ? 0.58 : 0.52;
  const fadeIn = actionSmootherStep(
    (action.progress - windupEnd * 0.7) / (strikeEnd - windupEnd * 0.7)
  );
  const fadeOut = 1 - actionSmootherStep(
    (action.progress - strikeEnd) / (1 - strikeEnd)
  );
  const fade = fadeIn * fadeOut;
  ctx.save();
  ctx.translate(player.x, player.y - 14);
  ctx.rotate(action.baseAngle);
  ctx.globalAlpha = fade * 0.76;
  ctx.strokeStyle = weapon.toolType === "pickaxe"
    ? "#c7d5d5"
    : weapon.toolType === "axe"
      ? "#e0b56c"
      : weapon.type === "knife" ? "#e5edf0" : "#d2a56a";
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 7;
  ctx.lineWidth = action.kind === "tool" ? 5 : 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    radius,
    pose.offset - pose.side * tail,
    pose.offset + pose.side * 0.1,
    pose.side < 0
  );
  ctx.stroke();
  ctx.restore();
}

function drawHeldWeapon(weapon) {
  const frame = HELD_WEAPON_FRAME[weapon?.type];
  if (!Number.isInteger(frame)) return;
  const action = heldWeaponAction(weapon);
  const actionPose = weaponSwingPose(action);
  const angle = action?.baseAngle ?? Math.atan2(player.dirY, player.dirX);
  const aimX = Math.cos(angle);
  const aimY = Math.sin(angle);
  const firing = Boolean(weapon.magazineSize) && pistolShot.timer > 0;
  const recoilStrength = firearmRecoilStrength(weapon);
  const recoilScale = weapon.type === "shotgun" ? 9 : 5;
  const recoil = -recoilScale * recoilStrength;
  const recoilRotation = firing
    ? (aimX < 0 ? -1 : 1) * -0.075 * recoilStrength
    : 0;
  ctx.save();
  ctx.translate(
    player.x + aimX * 5,
    player.y - 15 + aimY * 3
  );
  ctx.rotate(angle + actionPose.offset + recoilRotation);
  if (aimX < 0) ctx.scale(1, -1);
  if (worldSprite.complete && worldSprite.naturalWidth >= 128 && worldSprite.naturalHeight >= 96) {
    if (weapon.tier === "wood") ctx.filter = "sepia(.5) saturate(.82) brightness(.9)";
    if (weapon.tier === "stone") ctx.filter = "grayscale(.48) saturate(.62) brightness(1.04)";
    if (weapon.tier === "iron") ctx.filter = "saturate(.55) brightness(1.22)";
    ctx.drawImage(worldSprite, frame * 16, 64, 16, 16, -3 + recoil, -16, 32, 32);
    ctx.filter = "none";
  } else {
    ctx.fillStyle = weapon.tier === "iron"
      ? "#aeb9b9"
      : weapon.tier === "stone" ? "#777b76" : "#76523b";
    ctx.fillRect(recoil, -3, weapon.type === "shotgun" ? 31 : weapon.magazineSize ? 24 : 27, 6);
  }
  if (firing) {
    ctx.fillStyle = "#fff0a4";
    ctx.fillRect(27 + recoil, -4, 8, 8);
    ctx.fillStyle = "#ef8a3f";
    ctx.fillRect(31 + recoil, -2, 8, 4);
  }
  ctx.restore();
}

function playerWeaponActionPose(weapon) {
  const pose = { offsetX: 0, offsetY: 0, rotation: 0 };
  if (!weapon) return pose;
  if (weapon.magazineSize && pistolShot.timer > 0) {
    const recoil = firearmRecoilStrength(weapon);
    pose.offsetX = -player.dirX * recoil * (weapon.type === "shotgun" ? 2.6 : 1.4);
    pose.offsetY = -player.dirY * recoil * (weapon.type === "shotgun" ? 2.6 : 1.4);
    pose.rotation = (player.dirX < 0 ? -1 : 1) * -0.035 * recoil;
    return pose;
  }
  const action = heldWeaponAction(weapon);
  if (!action) return pose;
  const swing = Math.sin(actionSmootherStep(action.progress) * Math.PI);
  const side = Math.cos(action.baseAngle) < -0.08 ? -1 : 1;
  pose.offsetY = swing * 1.5;
  pose.rotation = side * swing * (action.kind === "tool" ? 0.055 : 0.04);
  return pose;
}

function playerMovementLean() {
  const maximumSpeed = player.speed * 1.45;
  return Math.max(-0.04, Math.min(
    0.04,
    player.velocityX / maximumSpeed * 0.04
  ));
}

function playerEmotePose(type = activeEmote, time = activeEmoteTime()) {
  const pose = {
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1
  };
  if (type === "thunder_spin") {
    const turn = Math.cos(time * 9.2);
    pose.scaleX = Math.sign(turn || 1) * Math.max(0.16, Math.abs(turn));
    pose.offsetY = -Math.abs(Math.sin(time * 9.2)) * 2;
    pose.rotation = Math.sin(time * 18.4) * 0.025;
  } else if (type === "de_dance") {
    const beat = time * 7.4;
    pose.offsetX = Math.sin(beat) * 4;
    pose.offsetY = -Math.abs(Math.sin(beat * 0.5)) * 3;
    pose.rotation = Math.sin(beat) * 0.1;
    pose.scaleX = 1 + Math.cos(beat * 2) * 0.045;
    pose.scaleY = 1 - Math.cos(beat * 2) * 0.035;
  } else if (type === "wave") {
    pose.offsetY = -Math.abs(Math.sin(time * 3.6)) * 1.5;
    pose.rotation = Math.sin(time * 4.2) * 0.025;
  }
  return pose;
}

function drawEmoteGesture(type, time) {
  if (type === "de_dance") {
    const beat = Math.sin(time * 7.4);
    ctx.save();
    ctx.strokeStyle = "#cbbf92";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(player.x - 8, player.y - 25);
    ctx.lineTo(player.x - 18, player.y - 30 - beat * 7);
    ctx.moveTo(player.x + 8, player.y - 25);
    ctx.lineTo(player.x + 18, player.y - 30 + beat * 7);
    ctx.stroke();
    ctx.fillStyle = "#e4d7aa";
    ctx.fillRect(player.x - 21, player.y - 34 - beat * 7, 6, 6);
    ctx.fillRect(player.x + 15, player.y - 34 + beat * 7, 6, 6);
    ctx.restore();
    return;
  }
  if (type !== "wave") return;
  const facing = player.dirX < -0.1 ? -1 : 1;
  const swing = Math.sin(time * 12) * 0.55;
  ctx.save();
  ctx.translate(player.x + facing * 10, player.y - 27);
  ctx.rotate(facing * (0.65 + swing));
  ctx.fillStyle = "#9b895f";
  ctx.fillRect(-2, -13, 5, 14);
  ctx.fillStyle = "#e4d7aa";
  ctx.fillRect(-3, -18, 7, 7);
  ctx.restore();
}

function drawThunderSpinEffect(time) {
  ctx.save();
  ctx.translate(player.x, player.y - 17);
  ctx.rotate(time * 4.8);
  ctx.globalAlpha = 0.62 + Math.sin(time * 18) * 0.18;
  ctx.strokeStyle = "#8ed4ff";
  ctx.shadowColor = "#5ab7ff";
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  for (let bolt = 0; bolt < 3; bolt += 1) {
    const angle = bolt * Math.PI * 2 / 3;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(22, 3);
    ctx.lineTo(18, 8);
    ctx.lineTo(29, 12);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "#d8f2ff";
  ctx.fillRect(-25, -3, 4, 4);
  ctx.fillRect(21, 6, 3, 3);
  ctx.fillRect(-2, -29, 3, 3);
  ctx.restore();
}

function drawPlayer() {
  const heldWeapon = !activeEmote && quickbarItems[selectedQuickSlot]?.kind === "weapon"
    ? quickbarItems[selectedQuickSlot]
    : null;
  const drawX = player.x - 24;
  const drawY = player.y - 37;
  const emoteTime = activeEmoteTime();
  const emotePose = playerEmotePose(activeEmote, emoteTime);
  const actionPose = playerWeaponActionPose(heldWeapon);
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.translate(
    emotePose.offsetX + actionPose.offsetX,
    emotePose.offsetY + actionPose.offsetY
  );
  ctx.rotate(emotePose.rotation + actionPose.rotation + playerMovementLean());
  ctx.scale(emotePose.scaleX, emotePose.scaleY);
  ctx.translate(-player.x, -player.y);
  drawWeaponActionTrail(heldWeapon);
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
  drawEmoteGesture(activeEmote, emoteTime);
  if (heldWeapon && player.dirY >= -0.28) drawHeldWeapon(heldWeapon);
  ctx.restore();
  if (activeEmote === "thunder_spin") drawThunderSpinEffect(emoteTime);
}

function drawAtmosphere() {
  const darkness = nightIntensity();
  gameScreen.classList.toggle("is-night", darkness > 0.68);
  drawSkyTint(darkness);
  drawWeatherTint(darkness);
  drawBloodMoonTint(darkness);
  drawNightCurtain(darkness);
  drawBloodMoonOrb(darkness);
  drawCampfireGlow(darkness);
  drawFlashlightGlow(darkness);
  drawDriftingFog(darkness);
  drawWetWeatherSheen();
  drawRain();
  drawWatchingEyes(darkness);
  drawAirborneSpecks(darkness);
  drawFilmGrain(darkness);
  drawVignette(darkness);
  drawWeatherLightning();
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

function drawWeatherTint(darkness) {
  const cloud = overcastIntensity();
  const rain = precipitationIntensity();
  if (cloud <= 0.01) return;
  const tint = ctx.createLinearGradient(0, 0, 0, H);
  tint.addColorStop(0, `rgba(18, 29, 34, ${cloud * (0.2 + darkness * 0.08)})`);
  tint.addColorStop(0.55, `rgba(25, 37, 39, ${cloud * 0.12})`);
  tint.addColorStop(1, `rgba(11, 20, 22, ${cloud * 0.18 + rain * 0.06})`);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, W, H);
}

function drawBloodMoonTint(darkness) {
  if (!bloodMoonActive || darkness <= 0.05) return;
  const pulse = 0.88 + Math.sin(bloodMoonPulse * 0.82) * 0.12;
  const tint = ctx.createRadialGradient(W * 0.78, H * 0.16, 20, W * 0.55, H * 0.45, W * 0.75);
  tint.addColorStop(0, `rgba(126, 15, 20, ${darkness * 0.2 * pulse})`);
  tint.addColorStop(0.48, `rgba(89, 8, 14, ${darkness * 0.14 * pulse})`);
  tint.addColorStop(1, `rgba(42, 0, 8, ${darkness * 0.18})`);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, W, H);
}

function drawBloodMoonOrb(darkness) {
  if (!bloodMoonActive || darkness <= 0.12) return;
  const x = W - 94;
  const y = 82;
  const radius = 28 + Math.sin(bloodMoonPulse * 0.5) * 1.2;
  const cloudCover = overcastIntensity();
  const alpha = darkness * (0.86 - cloudCover * 0.32);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const glow = ctx.createRadialGradient(x, y, 4, x, y, 78);
  glow.addColorStop(0, `rgba(236, 82, 78, ${alpha * 0.4})`);
  glow.addColorStop(0.38, `rgba(161, 24, 31, ${alpha * 0.24})`);
  glow.addColorStop(1, "rgba(86, 4, 12, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 78, y - 78, 156, 156);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#a52931";
  ctx.shadowColor = "#d33c40";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = alpha * 0.34;
  ctx.fillStyle = "#4d0910";
  ctx.beginPath();
  ctx.arc(x - 9, y - 7, 6, 0, Math.PI * 2);
  ctx.arc(x + 8, y + 6, 8, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 11, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getRainDrop(index, time = elapsed, intensity = precipitationIntensity()) {
  const speed = (390 + hash(index + 701) * 440) * (0.78 + intensity * 0.42);
  const loopHeight = H + 190;
  const y = ((hash(index + 733) * loopHeight + time * speed) % loopHeight) - 95;
  const windOffset = weather.wind * (time * 105 + y * 0.28);
  const loopWidth = W + 180;
  const rawX = hash(index + 719) * loopWidth + windOffset;
  const x = ((rawX % loopWidth) + loopWidth) % loopWidth - 90;
  const length = 8 + hash(index + 751) * 15 + intensity * 8;
  return {
    x,
    y,
    length,
    endX: x + weather.wind * length * 0.72,
    endY: y + length,
    alpha: (0.2 + hash(index + 769) * 0.42) * intensity,
    width: hash(index + 787) > 0.83 ? 1.5 : 1
  };
}

function drawWetWeatherSheen() {
  const rain = precipitationIntensity();
  if (rain <= 0.08) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const sheen = ctx.createLinearGradient(0, H * 0.36, 0, H);
  sheen.addColorStop(0, "rgba(125, 157, 164, 0)");
  sheen.addColorStop(1, `rgba(120, 153, 159, ${rain * 0.055})`);
  ctx.fillStyle = sheen;
  ctx.fillRect(0, H * 0.36, W, H * 0.64);
  ctx.globalAlpha = rain * 0.12;
  ctx.fillStyle = "#b5d2d3";
  for (let index = 0; index < 18; index += 1) {
    const x = hash(index + 811) * W;
    const y = H * (0.58 + hash(index + 827) * 0.37);
    const width = 10 + hash(index + 839) * 34;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), 1);
  }
  ctx.restore();
}

function drawRain() {
  const rain = precipitationIntensity();
  if (rain <= 0.04) return;
  const dropCount = Math.round(48 + rain * 116);
  ctx.save();
  ctx.strokeStyle = "#b7d1d3";
  ctx.lineCap = "square";
  for (let index = 0; index < dropCount; index += 1) {
    const drop = getRainDrop(index, elapsed, rain);
    ctx.globalAlpha = drop.alpha;
    ctx.lineWidth = drop.width;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.endX, drop.endY);
    ctx.stroke();
    if (index % 9 === 0 && drop.endY > H * 0.62 && drop.endY < H - 8) {
      ctx.globalAlpha = drop.alpha * 0.48;
      ctx.beginPath();
      ctx.moveTo(drop.endX - 4, drop.endY);
      ctx.lineTo(drop.endX + 4, drop.endY);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawWeatherLightning() {
  if (weather.lightningFlash <= 0) return;
  const progress = Math.max(0, Math.min(1, weather.lightningFlash / 0.32));
  const flicker = Math.sin((0.32 - weather.lightningFlash) * 92) > -0.2 ? 1 : 0.34;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = `rgba(196, 218, 226, ${progress * flicker * 0.34})`;
  ctx.fillRect(0, 0, W, H);
  if (weather.lightningFlash > 0.2) {
    const startX = W * (0.5 + weather.thunderPan * 0.42);
    ctx.globalAlpha = Math.min(0.7, progress);
    ctx.strokeStyle = "#d8edf0";
    ctx.shadowColor = "#a9d4dd";
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, -10);
    ctx.lineTo(startX - 13, H * 0.12);
    ctx.lineTo(startX + 8, H * 0.22);
    ctx.lineTo(startX - 18, H * 0.34);
    ctx.lineTo(startX - 3, H * 0.47);
    ctx.stroke();
  }
  ctx.restore();
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
    if (bloodMoonActive) alpha *= 1.45;

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
  // 打开物品栏、地图、设置或暂停菜单时只画画面，不推进时间、玩家或怪物。
  if (!inventoryOpen && !mapOpen && !settingsOpen && !pauseOpen && !classSelectionOpen && !emoteOpen) update(delta);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  if (howToPlayOpen) {
    if (event.code === "Escape" && !event.repeat) setHowToPlayOpen(false);
    return;
  }
  if (settingsOpen) {
    if (event.code === "Escape" && !event.repeat) setSettingsOpen(false);
    return;
  }
  if (state !== "game") return;
  if (classSelectionOpen) return;
  if (event.code === "Escape") {
    if (event.repeat) return;
    if (mapOpen) setMapOpen(false);
    else if (emoteOpen) setEmoteOpen(false);
    else if (inventoryOpen) setInventoryOpen(false);
    else setPauseOpen(!pauseOpen);
    return;
  }
  if (mapOpen) {
    if (event.code === "KeyM" && !event.repeat) setMapOpen(false);
    return;
  }
  if (emoteOpen) {
    if (event.code === "KeyY" && !event.repeat) setEmoteOpen(false);
    return;
  }
  if (pauseOpen) return;
  if (event.code === "KeyO") {
    if (!event.repeat) setAudioEnabled(!audioEnabled);
    return;
  }
  if (event.code === "KeyI" || event.code === "Tab") {
    if (!event.repeat) setInventoryOpen(!inventoryOpen);
    return;
  }
  if (inventoryOpen) return;
  if (event.code === "KeyM") {
    if (!event.repeat) setMapOpen(true);
    return;
  }
  if (event.code === "KeyY") {
    if (!event.repeat) setEmoteOpen(true);
    return;
  }
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
    playFlashlightSwitchSound(player.flashlight);
    showMessage(player.flashlight ? "打开手电筒" : "关闭手电筒", 1);
  }
});

canvas.addEventListener("pointerdown", (event) => {
  if (state !== "game" || inventoryOpen || mapOpen || settingsOpen || pauseOpen || classSelectionOpen || emoteOpen) return;
  if (event.button !== 0 && event.button !== 2) return;
  event.preventDefault();
  aimAtPointer(event);
  if (event.button === 0) usePrimaryAction();
  if (event.button === 2) buildSelected();
});

canvas.addEventListener("pointermove", (event) => {
  if (state !== "game" || inventoryOpen || mapOpen || settingsOpen || pauseOpen || classSelectionOpen || emoteOpen) return;
  aimAtPointer(event);
});

// 在游戏画布上按右键时只负责建造，不弹出浏览器菜单。
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", () => {
  keys.clear();
  stopPlayerMotion();
});
startButton.addEventListener("click", startGame);
continueButton?.addEventListener("click", continueGame);
howToPlayButton?.addEventListener("click", () => setHowToPlayOpen(true));
howToPlayCloseButton?.addEventListener("click", () => setHowToPlayOpen(false));
titleSettingsButton?.addEventListener("click", () => setSettingsOpen(true, "title"));
retryAssetsButton.addEventListener("click", loadGameAssets);
restartButton.addEventListener("click", startGame);
victoryTitleButton?.addEventListener("click", returnToTitle);
inventoryButton.addEventListener("click", () => {
  if (!pauseOpen && !settingsOpen && !mapOpen) setInventoryOpen(!inventoryOpen);
});
emoteButtons.forEach((button) => {
  button.addEventListener("click", () => startEmote(button.dataset.emote));
});
audioButton?.addEventListener("click", () => setAudioEnabled(!audioEnabled));
mapCloseButton?.addEventListener("click", () => setMapOpen(false));
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
  slot.addEventListener("click", () => takeChestItem(index));
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
supplyCraftButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const recipeIndex = Number(button.dataset.supplyRecipe);
    if (Number.isInteger(recipeIndex)) craftSupply(recipeIndex);
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
    stopPlayerMotion();
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

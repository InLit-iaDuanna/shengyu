"use strict";

const STORAGE_KEYS = {
  invertForward: "echoHomeInvertForward",
  invertRight: "echoHomeInvertRight",
  settings: "echoHomeSettings",
};

const AUDIO_BASE = "./assets/audio/";

const fileCue = (src, fallback, options = {}) => ({
  kind: "file",
  src: AUDIO_BASE + src,
  fallback,
  spatial: true,
  loop: false,
  volume: 0.65,
  ...options,
});

const voiceCue = (src, options = {}) => fileCue(src, "silent", {
  spatial: false,
  volume: 0.82,
  ...options,
});

const GAME_CONFIG = {
  api: {
    settingsUrl: "/api/game-settings",
    authUrl: "/api/game-settings/auth",
    pollMs: 2000,
  },
  control: {
    moveSpeed: 1.45,
    turnSpeed: 92,
    tiltThreshold: 14,
    triggerRadius: 0.72,
    playerRadius: 0.18,
    collisionVibratePattern: [0, 85],
    collisionCooldownMs: 450,
    invertForward: localStorage.getItem(STORAGE_KEYS.invertForward) === "1",
    invertRight: localStorage.getItem(STORAGE_KEYS.invertRight) === "1",
  },
  audio: {
    masterGain: 0.38,
    pulseDuration: 0.18,
    minPulseInterval: 0.45,
    maxPulseInterval: 1.2,
    buffers: new Map(),
  },
  mic: {
    threshold: 0.075,
    holdMs: 350,
    timeoutMs: 5200,
    maxFailures: 2,
  },
  audioCues: {
    heartbeat: fileCue("heartbeat.mp3", "heartbeat", { volume: 0.5 }),
    heartbeatStrong: fileCue("heartbeat-strong.mp3", "heartbeat", { volume: 0.62 }),
    dizzy: fileCue("dizzy.mp3", "heartbeat", { volume: 0.55 }),
    rain: fileCue("rain-light.mp3", "rain", { volume: 0.24 }),
    bedRise: fileCue("bed-rise.mp3", "pickup", { volume: 0.55 }),
    waterBoil: fileCue("water-dispenser.mp3", "waterBoil", { loop: true, volume: 0.64 }),
    pour: fileCue("water-dispenser.mp3", "pour", { volume: 0.62 }),
    drink: fileCue("water-drop-1.mp3", "pour", { volume: 0.44 }),
    cup: fileCue("water-drop.mp3", "drop", { volume: 0.5 }),
    drop: fileCue("bookcase-books-fall.mp3", "drop", { volume: 0.58 }),
    pickup: fileCue("chair-drag.mp3", "pickup", { volume: 0.38 }),
    wind: fileCue("wind.mp3", "wind", { loop: true, volume: 0.36 }),
    windowCreak: fileCue("window-creak.mp3", "wind", { volume: 0.46 }),
    chime: fileCue("wind-chime.mp3", "chime", { loop: true, volume: 0.7 }),
    tape: fileCue("desk-search.mp3", "tape", { loop: true, volume: 0.52 }),
    deskSearch: fileCue("desk-search.mp3", "tape", { volume: 0.6 }),
    tapeMachine: { kind: "synthetic", src: "", spatial: true, loop: false, volume: 0.58, fallback: "tapeMachine" },
    doorOpen: fileCue("door-open.mp3", "pickup", { volume: 0.58 }),
    doorClose: fileCue("door-close.mp3", "drop", { volume: 0.5 }),
    rugStep: fileCue("rug-step.mp3", "pickup", { volume: 0.18 }),
    closetHit: fileCue("closet-hit-1.mp3", "drop", { volume: 0.62 }),
    bedHit: fileCue("sofa-hit-1.mp3", "drop", { volume: 0.56 }),
    sofaHit: fileCue("sofa-hit-2.mp3", "drop", { volume: 0.62 }),
    tvHit: fileCue("tv-cabinet-hit-1.mp3", "drop", { volume: 0.58 }),
    tableHit: fileCue("table-hit-1.mp3", "drop", { volume: 0.62 }),
    bookcaseHit: fileCue("bookcase-books-fall.mp3", "drop", { volume: 0.5 }),
    genericHit: fileCue("table-hit-2.mp3", "drop", { volume: 0.5 }),
    voiceNightmareAgain: voiceCue("voice-nightmare-again.mp3", { volume: 0.84 }),
    voiceRain: voiceCue("voice-rain.mp3", { volume: 0.82 }),
    voiceNeedWater: voiceCue("voice-need-water.mp3", { volume: 0.86 }),
    voiceHeardWater: voiceCue("voice-heard-water.mp3", { volume: 0.86 }),
    voiceWhatThing: voiceCue("voice-what-thing.mp3", { volume: 0.86 }),
    voiceTwoTapes: voiceCue("voice-two-tapes.mp3", { volume: 0.84 }),
    voiceWhatsInside: voiceCue("voice-whats-inside.mp3", { volume: 0.84 }),
    voiceNeedPlayer: voiceCue("voice-need-player.mp3", { volume: 0.86 }),
    voiceRememberChime: voiceCue("voice-remember-chime.mp3", { volume: 0.82 }),
    voiceRememberPlayerLocation: voiceCue("voice-remember-player-location.mp3", { volume: 0.82 }),
    voiceGoFind: voiceCue("voice-go-find.mp3", { volume: 0.84 }),
    voiceFoundPlayer: voiceCue("voice-found-player.mp3", { volume: 0.86 }),
    voiceBackBedroom: voiceCue("voice-back-bedroom.mp3", { volume: 0.86 }),
    rooster: { kind: "synthetic", src: "", spatial: true, loop: false, volume: 0.6, fallback: "rooster" },
    grandma: { kind: "synthetic", src: "", spatial: true, loop: true, volume: 0.72, fallback: "grandma" },
    success: { kind: "synthetic", src: "", spatial: true, loop: false, volume: 0.75, fallback: "success" },
  },
};

const SCENES = {
  bedroom: {
    id: "bedroom",
    name: "卧室",
    width: 14,
    height: 8,
    start: { x: 1.2, y: 3.78, angle: Math.PI / 2 },
    bg: "#f6f4ed",
    ambientPoint: { x: 7, y: 2.2 },
    items: [
      { type: "rect", id: "closet", label: "衣橱", x: 0, y: 0, w: 5.2, h: 1.6, color: "#b15ba2", solid: true, hitCue: "closetHit" },
      { type: "rect", id: "bed", label: "床", x: 0, y: 4.35, w: 6.1, h: 3.35, color: "#ff4d5e", solid: true, hitCue: "bedHit" },
      { type: "rect", id: "water", label: "饮水机", x: 8.8, y: 0, w: 1.05, h: 1.05, color: "#1db6b0", solid: true, hitCue: "genericHit" },
      { type: "rect", id: "desk", label: "书桌", x: 10, y: 0, w: 4, h: 2.35, color: "#f7b74f", solid: true, hitCue: "tvHit" },
      { type: "poly", id: "bookcase", label: "书柜", color: "#82c36b", solid: true, hitCue: "bookcaseHit", points: [[11.6, 6.45], [14, 6.45], [14, 8], [11.6, 8], [11.6, 7.62], [10.4, 7.62], [10.4, 6.88], [11.6, 6.88]] },
      { type: "rect", id: "cup", label: "水杯", x: 0.22, y: 3.05, w: 0.95, h: 1.25, color: "#f5f032", solid: false },
      { type: "door", id: "bedroomDoor", label: "门", x: 9.4, y: 6.25, r: 1.4, from: Math.PI, to: Math.PI * 1.5, solid: false },
    ],
    targets: {
      water: { x: 9.32, y: 1.45, label: "饮水机", cue: "waterBoil" },
      desk: { x: 10.52, y: 2.78, label: "书桌", cue: "cup" },
      door: { x: 9.8, y: 6.7, label: "卧室门", cue: "wind" },
    },
  },
  livingRoom: {
    id: "livingRoom",
    name: "客厅",
    width: 16,
    height: 8,
    start: { x: 9.2, y: 6.42, angle: -Math.PI / 2 },
    bg: "#f8f7f0",
    ambientPoint: { x: 9, y: 2 },
    items: [
      { type: "rect", id: "sofa", label: "沙发", x: 0, y: 0, w: 6.4, h: 2.6, color: "#ef6641", solid: true, hitCue: "sofaHit" },
      { type: "rect", id: "rug", label: "地毯", x: 1.8, y: 3.35, w: 4.9, h: 2.45, color: "#b7d865", solid: false },
      { type: "rect", id: "tv", label: "电视柜", x: 0, y: 6.55, w: 6.4, h: 1.45, color: "#10a6dc", solid: true, hitCue: "tvHit" },
      { type: "rect", id: "table", label: "餐桌", x: 11.7, y: 4.05, w: 4.3, h: 3.95, color: "#fff15a", solid: true, hitCue: "tableHit" },
      { type: "door", id: "bathDoor", label: "厕所", x: 0, y: 5.0, r: 1.7, from: Math.PI * 1.5, to: Math.PI * 2, solid: false },
      { type: "door", id: "bedroomDoor", label: "卧室门", x: 10.55, y: 6.85, r: 1.45, from: Math.PI, to: Math.PI * 1.5, solid: false },
      { type: "door", id: "grandmaDoor", label: "奶奶卧室", x: 9.2, y: 0, r: 1.45, from: Math.PI / 2, to: Math.PI, solid: false },
      { type: "door", id: "frontDoor", label: "大门", x: 15.55, y: 0.65, r: 1.65, from: Math.PI / 2, to: Math.PI, solid: false },
    ],
    targets: {
      windChime: { x: 9.25, y: 2.1, label: "风铃", cue: "chime" },
      tvCabinet: { x: 5.55, y: 6.16, label: "电视机柜", cue: "deskSearch" },
      bedroomDoor: { x: 9.25, y: 6.52, label: "卧室门", cue: "waterBoil" },
    },
  },
  memory: {
    id: "memory",
    name: "回忆",
    width: 14,
    height: 8,
    start: { x: 2, y: 6.2, angle: -0.25 },
    bg: "#161923",
    ambientPoint: { x: 7, y: 4 },
    items: [
      { type: "rect", id: "dawn", label: "清晨", x: 0, y: 0, w: 14, h: 8, color: "#202436", solid: false },
      { type: "circle", id: "grandmaGlow", label: "奶奶", x: 10.2, y: 2.4, r: 0.85, color: "#ffd166", solid: false },
    ],
    targets: {
      grandma: { x: 10.2, y: 2.4, label: "奶奶", cue: "grandma" },
    },
  },
};

const STORY_STEPS = [
  { mode: "story", speaker: "噩梦", text: "眼前突然模糊发黑。医生的声音、争吵的声音，一起压了过来。", cue: "dizzy", instruction: "轻触继续" },
  { mode: "story", speaker: "医生", text: "这是视网膜动脉阻塞。手术比较成功，回家先好好休养。", cue: "heartbeatStrong", instruction: "轻触继续" },
  { mode: "story", speaker: "内心", text: "怎么又是噩梦！", cue: "heartbeat", voice: "voiceNightmareAgain", instruction: "轻触继续" },
  { mode: "story", speaker: "窗外", text: "下雨了。", cue: "rain", voice: "voiceRain", instruction: "轻触继续" },
  { mode: "story", speaker: "内心", text: "水喝完了，去接点。", cue: "waterBoil", voice: "voiceNeedWater", instruction: "轻触屏幕下床" },
  { mode: "tapAction", speaker: "动作", text: "你摸索着从床上坐起来。", instruction: "轻触屏幕下床", cue: "bedRise" },
  { mode: "navigate", scene: "bedroom", target: "water", speaker: "操作", text: "我好像听到了饮水机的声音。", voice: "voiceHeardWater", instruction: "根据声源方向移动到饮水机" },
  { mode: "tapAction", speaker: "操作", text: "到饮水机了。", instruction: "轻触屏幕接水", cue: "success" },
  { mode: "tapAction", speaker: "声音", text: "热水落进杯子里。你喝了一口，手还在抖。", instruction: "轻触屏幕把杯子放到书桌上", cue: "pour" },
  { mode: "tapAction", speaker: "声音", text: "杯子轻轻碰到书桌。旁边有什么东西滚落到了地上。", instruction: "轻触屏幕拾取", cue: "cup" },
  { mode: "tapAction", speaker: "内心", text: "！我去！什么东西？", instruction: "轻触屏幕拾取掉落的东西", cue: "drop", voice: "voiceWhatThing" },
  { mode: "tapAction", speaker: "内心", text: "两卷磁带？在我的印象里怎么从来没见过这个东西。", instruction: "轻触继续", cue: "pickup", voice: "voiceTwoTapes" },
  { mode: "story", speaker: "内心", text: "里面会是什么呢？", cue: "wind", voice: "voiceWhatsInside", instruction: "轻触继续" },
  { mode: "story", speaker: "内心", text: "我需要一个磁带播放机。", voice: "voiceNeedPlayer", instruction: "轻触继续" },
  { mode: "story", speaker: "窗边", text: "风吹过门窗，风铃声从客厅更远的角落传来。", cue: "windowCreak", instruction: "轻触继续" },
  { mode: "navigate", scene: "bedroom", target: "door", speaker: "操作", text: "风把门窗吹得吱呀作响。先走出卧室。", instruction: "跟着风声移动到卧室门" },
  { mode: "tapAction", speaker: "动作", text: "门轴轻轻响了一声，客厅里的风铃更清楚了。", instruction: "轻触屏幕开门", cue: "doorOpen" },
  { mode: "navigate", scene: "livingRoom", target: "windChime", speaker: "内心", text: "这串风铃从我有记忆时就挂在那里。", voice: "voiceRememberChime", instruction: "根据风铃声找到客厅角落" },
  { mode: "navigate", scene: "livingRoom", target: "tvCabinet", speaker: "内心", text: "我想起来了，磁带播放机在离风铃不远的电视机柜上。", voice: "voiceRememberPlayerLocation", instruction: "寻找电视机柜" },
  { mode: "tapAction", speaker: "操作", text: "电视机柜就在手边。", instruction: "轻触屏幕寻找磁带播放器", cue: "success" },
  { mode: "tapAction", speaker: "内心", text: "我去找找看。你摸索着拉开柜门。", instruction: "轻触屏幕寻找机柜上的磁带播放器", cue: "deskSearch", voice: "voiceGoFind" },
  { mode: "tapAction", speaker: "内心", text: "……我找找……找到了！", instruction: "轻触继续", cue: "pickup", voice: "voiceFoundPlayer" },
  { mode: "story", speaker: "内心", text: "我还是拿回卧室去听吧。", voice: "voiceBackBedroom", instruction: "轻触继续" },
  { mode: "navigate", scene: "livingRoom", target: "windChime", speaker: "操作", text: "风铃再次响起，先用它确认自己在客厅里的位置。", instruction: "现在操控手机到达风铃的位置" },
  { mode: "navigate", scene: "livingRoom", target: "bedroomDoor", speaker: "操作", text: "饮水机又响起来了。根据它的方向回卧室。", instruction: "跟着饮水机声音往卧室方向走" },
  { mode: "tapAction", speaker: "动作", text: "卧室门在身后合上，雨声又被隔远了一点。", instruction: "轻触屏幕关门", cue: "doorClose" },
  { mode: "navigate", scene: "bedroom", target: "desk", speaker: "操作", text: "杯子轻轻碰到桌面的声音从书桌方向传来。", instruction: "根据杯子的声音移动到书桌旁" },
  { mode: "tapAction", speaker: "操作", text: "磁带播放器放在桌上。", instruction: "轻触屏幕放入磁带", cue: "success" },
  { mode: "story", speaker: "声音", text: "咔哒。磁带开始转动，奶奶的声音从很远的地方飘出来。", cue: "tapeMachine", instruction: "轻触继续" },
  { mode: "story", speaker: "磁带", text: "今天又下雨了。你小时候最怕打雷，每次都躲到我怀里。", cue: "grandma", instruction: "轻触继续" },
  { mode: "story", speaker: "磁带", text: "饭要好好吃，眼睛不舒服就别硬撑。只要你愿意应我一声，我就在。", cue: "tapeMachine", instruction: "轻触继续" },
  { mode: "story", speaker: "回忆", text: "天刚亮，奶奶起床了，轻轻咳嗽。", cue: "rooster", scene: "memory", instruction: "轻触起身" },
  { mode: "navigate", scene: "memory", target: "grandma", speaker: "操作", text: "朝奶奶的方向走去。", instruction: "跟着奶奶的声音前进" },
  { mode: "micPrompt", speaker: "奶奶", text: "你起床了哇！", cue: "grandma", instruction: "对着麦克风回答一声：唉" },
  { mode: "story", speaker: "回忆", text: "有些声音，只有在失去光之后才重新被听见。", cue: "success", instruction: "轻触继续" },
  { mode: "ending", speaker: "内心", text: "那一声回应，不是回到过去，而是终于愿意面对自己。", cue: "tapeMachine", instruction: "轻触结束" },
];

const TUTORIAL_STEPS = [
  { id: "forward", title: "向前移动", text: "轻轻向前倾斜手机，超过阈值后角色会以固定速度前进。", hint: "向前倾斜并保持一下" },
  { id: "backward", title: "向后移动", text: "再试试向后倾斜。移动速度不会因为倾斜更大而变快。", hint: "向后倾斜并保持一下" },
  { id: "left", title: "向左移动", text: "向左倾斜可以横向移动，用来绕开家具。", hint: "向左倾斜并保持一下" },
  { id: "right", title: "向右移动", text: "向右倾斜可以横向移动。", hint: "向右倾斜并保持一下" },
  { id: "turnLeft", title: "左转头", text: "按住屏幕左半边，角色会持续向左转头。", hint: "按住屏幕左半边" },
  { id: "turnRight", title: "右转头", text: "按住屏幕右半边，角色会持续向右转头。戴耳机时，转头会改变声源方向。", hint: "按住屏幕右半边" },
];

const screens = {
  start: document.querySelector("#startScreen"),
  setup: document.querySelector("#setupScreen"),
  game: document.querySelector("#gameScreen"),
  ending: document.querySelector("#endingScreen"),
  developer: document.querySelector("#developerScreen"),
};

const ui = {
  startButton: document.querySelector("#startButton"),
  playAgainButton: document.querySelector("#playAgainButton"),
  startStatus: document.querySelector("#startStatus"),
  setupTitle: document.querySelector("#setupTitle"),
  setupText: document.querySelector("#setupText"),
  setupHint: document.querySelector("#setupHint"),
  calibrateButton: document.querySelector("#calibrateButton"),
  skipTutorialButton: document.querySelector("#skipTutorialButton"),
  invertForwardButton: document.querySelector("#invertForwardButton"),
  invertRightButton: document.querySelector("#invertRightButton"),
  minimapPanel: document.querySelector("#minimapPanel"),
  canvas: document.querySelector("#mapCanvas"),
  speakerText: document.querySelector("#speakerText"),
  storyText: document.querySelector("#storyText"),
  instructionText: document.querySelector("#instructionText"),
  storyPanel: document.querySelector("#storyPanel"),
  debugHotspot: document.querySelector("#debugHotspot"),
  debugPanel: document.querySelector("#debugPanel"),
  debugScene: document.querySelector("#debugScene"),
  debugStep: document.querySelector("#debugStep"),
  debugDistance: document.querySelector("#debugDistance"),
  debugSensor: document.querySelector("#debugSensor"),
  debugMic: document.querySelector("#debugMic"),
  debugMap: document.querySelector("#debugMap"),
  developerLogin: document.querySelector("#developerLogin"),
  developerPassword: document.querySelector("#developerPassword"),
  developerControls: document.querySelector("#developerControls"),
  minimapToggle: document.querySelector("#minimapToggle"),
  refreshSettingsButton: document.querySelector("#refreshSettingsButton"),
  developerStatus: document.querySelector("#developerStatus"),
};

const ctx = ui.canvas.getContext("2d");

const state = {
  gameStatus: "start",
  rafRunning: true,
  stepIndex: 0,
  sceneId: "bedroom",
  player: { x: SCENES.bedroom.start.x, y: SCENES.bedroom.start.y, angle: SCENES.bedroom.start.angle },
  keys: new Set(),
  touchTurnDirection: 0,
  turnPointerId: null,
  lastFrameAt: 0,
  nextPulseAt: 0,
  lastCollisionAt: 0,
  lastStepSoundAt: 0,
  lastMoveAt: 0,
  lastDistanceToTarget: 0,
  offTargetSince: 0,
  idleSince: 0,
  assistMessageUntil: 0,
  touchPulseBoost: 1,
  canvas: { width: 0, height: 0, dpr: 1 },
  orientation: {
    supported: "DeviceOrientationEvent" in window,
    permission: "unknown",
    latest: null,
    baseline: null,
    calibrated: false,
    pendingCalibration: false,
  },
  setup: {
    tutorialActive: false,
    tutorialIndex: 0,
    heldSince: 0,
  },
  audio: {
    context: null,
    masterGain: null,
    ready: false,
    loops: new Map(),
  },
  mic: {
    status: "idle",
    stream: null,
    source: null,
    analyser: null,
    data: null,
    loudSince: 0,
    promptStartedAt: 0,
    failures: 0,
    fallbackReady: false,
  },
  settings: {
    showMinimap: true,
    updatedAt: "",
    version: 1,
    source: "default",
  },
  developer: {
    authed: false,
    password: "",
  },
  debugVisible: false,
  debugPressTimer: 0,
  settingsPollId: 0,
};

function showScreen(name) {
  Object.entries(screens).forEach(([screenName, element]) => {
    element.classList.toggle("is-active", screenName === name);
  });
}

function currentScene() {
  return SCENES[state.sceneId];
}

function currentStep() {
  return STORY_STEPS[state.stepIndex];
}

function setStatus(message) {
  ui.startStatus.textContent = message;
}

async function startGame() {
  ui.startButton.disabled = true;
  setStatus("正在启用音频和手机姿态...");

  try {
    // Start audio from the same tap before awaiting the iOS sensor prompt.
    const audioReady = initAudio().then(
      () => ({ ok: true }),
      (error) => ({ ok: false, error }),
    );
    const orientationResult = await enableOrientation();
    setStatus("正在启用音频...");
    const audioResult = await audioReady;
    if (!audioResult.ok) {
      throw audioResult.error;
    }
    setStatus(orientationResult.message);
    resetRun();
    showSetupCalibration();
    showScreen("setup");
  } catch (error) {
    console.error(error);
    setStatus("启动失败，请刷新后重试。");
  } finally {
    ui.startButton.disabled = false;
  }
}

function resetRun() {
  stopAllLoops();
  stopMic();
  state.stepIndex = 0;
  state.sceneId = "bedroom";
  placePlayer(SCENES.bedroom.start);
  state.gameStatus = "setup";
  state.nextPulseAt = 0;
  state.touchTurnDirection = 0;
  state.turnPointerId = null;
  state.keys.clear();
  state.lastStepSoundAt = 0;
  state.lastMoveAt = 0;
  state.lastDistanceToTarget = 0;
  state.offTargetSince = 0;
  state.idleSince = 0;
  state.assistMessageUntil = 0;
  state.touchPulseBoost = 1;
  state.setup.tutorialActive = false;
  state.setup.tutorialIndex = 0;
  state.setup.heldSince = 0;
  state.mic.failures = 0;
  state.mic.fallbackReady = false;
  updateDebug();
}

function restartGame() {
  resetRun();
  showScreen("start");
  setStatus("点击后启用音频和手机姿态，iPhone 会请求运动与方向访问。");
}

function showSetupCalibration() {
  state.gameStatus = "setup";
  state.setup.tutorialActive = false;
  ui.setupTitle.textContent = "先校准手机";
  ui.setupText.textContent =
    state.orientation.permission === "granted"
      ? "竖屏自然握持手机，保持现在的姿势不动。"
      : "当前没有读到手机姿态，可以刷新后重新允许，或在桌面用键盘调试。";
  ui.setupHint.textContent = getOrientationSetupHint();
  ui.calibrateButton.textContent = "校准";
  updateInvertButtons();
}

function getOrientationSetupHint() {
  if (!state.orientation.supported) {
    return "这个浏览器没有姿态传感器，可以用 WASD/QE 调试。";
  }
  if (state.orientation.permission === "granted") {
    return "点击校准后，会进入 6 步新手教学。";
  }
  if (state.orientation.permission === "denied") {
    return "iOS 需要 HTTPS，并在系统弹窗中允许“运动与方向访问”。";
  }
  return "如果没有弹出权限框，请用 Safari/Chrome 通过 HTTPS 打开。";
}

function handleCalibrateClick() {
  if (state.orientation.latest) {
    finishCalibration();
  } else {
    state.orientation.baseline = { beta: 0, gamma: 0 };
    state.orientation.calibrated = true;
    state.orientation.pendingCalibration = false;
  }
  startTutorial();
}

function startTutorial() {
  state.gameStatus = "tutorial";
  state.setup.tutorialActive = true;
  state.setup.tutorialIndex = 0;
  state.setup.heldSince = 0;
  showTutorialStep();
}

function showTutorialStep() {
  const step = TUTORIAL_STEPS[state.setup.tutorialIndex];
  if (!step) {
    startStoryRun();
    return;
  }

  ui.setupTitle.textContent = step.title;
  ui.setupText.textContent = step.text;
  ui.setupHint.textContent = step.hint;
  ui.calibrateButton.textContent = "重新校准";
  updateInvertButtons();
}

function startStoryRun() {
  state.setup.tutorialActive = false;
  state.gameStatus = "story";
  state.stepIndex = 0;
  state.sceneId = "bedroom";
  placePlayer(SCENES.bedroom.start);
  showScreen("game");
  resizeCanvas();
  enterStep(0);
}

function skipTutorial() {
  if (!state.orientation.calibrated) {
    finishCalibration();
  }
  startStoryRun();
}

function updateTutorial(now) {
  if (!state.setup.tutorialActive || state.gameStatus !== "tutorial") {
    return;
  }

  const step = TUTORIAL_STEPS[state.setup.tutorialIndex];
  if (!step) {
    return;
  }

  const axis = getCombinedAxes();
  const turn = getTurnDirection();
  let matched = false;
  if (step.id === "forward") {
    matched = axis.forward > 0;
  } else if (step.id === "backward") {
    matched = axis.forward < 0;
  } else if (step.id === "left") {
    matched = axis.right < 0;
  } else if (step.id === "right") {
    matched = axis.right > 0;
  } else if (step.id === "turnLeft") {
    matched = turn < 0;
  } else if (step.id === "turnRight") {
    matched = turn > 0;
  }

  if (matched) {
    if (!state.setup.heldSince) {
      state.setup.heldSince = now;
    }
    ui.setupHint.textContent = "很好，保持一下...";
    if (now - state.setup.heldSince >= 360) {
      state.setup.tutorialIndex += 1;
      state.setup.heldSince = 0;
      playCue("success");
      showTutorialStep();
    }
  } else {
    state.setup.heldSince = 0;
    ui.setupHint.textContent = step.hint;
  }
}

function toggleInvert(axis) {
  if (axis === "forward") {
    GAME_CONFIG.control.invertForward = !GAME_CONFIG.control.invertForward;
    localStorage.setItem(STORAGE_KEYS.invertForward, GAME_CONFIG.control.invertForward ? "1" : "0");
  } else {
    GAME_CONFIG.control.invertRight = !GAME_CONFIG.control.invertRight;
    localStorage.setItem(STORAGE_KEYS.invertRight, GAME_CONFIG.control.invertRight ? "1" : "0");
  }
  updateInvertButtons();
}

function updateInvertButtons() {
  ui.invertForwardButton.textContent = GAME_CONFIG.control.invertForward ? "前后已反转" : "前后反了";
  ui.invertRightButton.textContent = GAME_CONFIG.control.invertRight ? "左右已反转" : "左右反了";
}

async function initAudio() {
  if (state.audio.ready && state.audio.context) {
    await state.audio.context.resume();
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported.");
  }

  const audioContext = new AudioContextClass();
  const masterGain = audioContext.createGain();
  masterGain.gain.value = GAME_CONFIG.audio.masterGain;
  masterGain.connect(audioContext.destination);

  state.audio.context = audioContext;
  state.audio.masterGain = masterGain;
  state.audio.ready = true;
  await audioContext.resume();
  updateListener();
}

async function enableOrientation() {
  if (!state.orientation.supported) {
    state.orientation.permission = "unavailable";
    return { ok: false, message: "这个浏览器没有姿态传感器，桌面可用 WASD 调试。" };
  }

  const DeviceOrientation = window.DeviceOrientationEvent;
  if (typeof DeviceOrientation.requestPermission === "function") {
    try {
      setStatus("如果系统弹窗出现，请允许“运动与方向访问”。");
      const permission = await DeviceOrientation.requestPermission();
      state.orientation.permission = permission;
      if (permission !== "granted") {
        return { ok: false, message: "没有获得姿态权限，已切换键盘模式。" };
      }
    } catch (error) {
      console.warn("Device orientation permission failed:", error);
      state.orientation.permission = "denied";
      return { ok: false, message: "姿态权限请求失败，请用 Safari/Chrome 打开。" };
    }
  } else {
    state.orientation.permission = "granted";
  }

  window.removeEventListener("deviceorientation", handleOrientation);
  window.addEventListener("deviceorientation", handleOrientation, { passive: true });
  return { ok: true, message: "姿态监听已启用，请竖屏握持后校准。" };
}

function handleOrientation(event) {
  if (!Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) {
    return;
  }

  state.orientation.latest = { beta: event.beta, gamma: event.gamma };
  if (state.orientation.pendingCalibration) {
    finishCalibration();
  }
}

function finishCalibration() {
  if (!state.orientation.latest) {
    state.orientation.baseline = { beta: 0, gamma: 0 };
  } else {
    state.orientation.baseline = { ...state.orientation.latest };
  }
  state.orientation.calibrated = true;
  state.orientation.pendingCalibration = false;
  updateDebug();
}

function enterStep(index) {
  state.stepIndex = clamp(index, 0, STORY_STEPS.length - 1);
  const step = currentStep();

  if (step.scene && step.scene !== state.sceneId) {
    switchScene(step.scene);
  }

  state.gameStatus = step.mode;
  state.nextPulseAt = performance.now() + 220;
  state.lastDistanceToTarget = getDistanceToTarget();
  state.offTargetSince = 0;
  state.idleSince = performance.now();
  state.assistMessageUntil = 0;
  state.touchPulseBoost = 1;
  setStory(step);
  stopAllLoops();

  if (step.cue) {
    playCue(step.cue, getStepTarget(step));
  }

  if (step.voice) {
    playCue(step.voice, null, { volumeBoost: 1 });
  }

  if (step.mode === "navigate") {
    const target = getStepTarget(step);
    if (target?.cue && shouldLoopCue(target.cue)) {
      startLoop(target.cue, target);
    }
  }

  if (step.mode === "micPrompt") {
    startMicPrompt();
  }

  if (step.mode === "ending") {
    playCue("success");
    window.setTimeout(() => showScreen("ending"), 900);
  }

  updateListener();
  updateDebug();
}

function setStory(step) {
  ui.speakerText.textContent = step.speaker || "内心";
  ui.storyText.textContent = step.text || "";
  ui.instructionText.textContent = step.instruction || "轻触继续";
}

function advanceStep() {
  const step = currentStep();
  if (step.mode === "navigate") {
    return;
  }

  if (step.mode === "micPrompt") {
    if (state.mic.fallbackReady) {
      stopMic();
      playCue("success", getStepTarget(step));
      enterStep(state.stepIndex + 1);
      return;
    }
    if (state.mic.status !== "listening") {
      startMicPrompt();
    }
    return;
  }

  enterStep(state.stepIndex + 1);
}

function switchScene(sceneId) {
  const nextScene = SCENES[sceneId];
  if (!nextScene) {
    return;
  }

  state.sceneId = sceneId;
  placePlayer(nextScene.start);
}

function placePlayer(point) {
  state.player.x = point.x;
  state.player.y = point.y;
  state.player.angle = point.angle || 0;
}

function getStepTarget(step = currentStep()) {
  if (!step?.target) {
    return null;
  }

  return currentScene().targets[step.target] || null;
}

function getDistanceToTarget() {
  const target = getStepTarget();
  if (!target) {
    return 0;
  }

  return Math.hypot(target.x - state.player.x, target.y - state.player.y);
}

function shouldLoopCue(cue) {
  return Boolean(GAME_CONFIG.audioCues[cue]?.loop);
}

let _updateDebugLastTime = 0;
function updateDebugThrottled() {
  const now = performance.now();
  if (now - _updateDebugLastTime >= 250) {
    _updateDebugLastTime = now;
    updateDebug();
  }
}

function updateGame(dt, now) {
  updateTutorial(now);

  if (!["navigate", "story", "tapAction", "micPrompt"].includes(state.gameStatus)) {
    return;
  }

  updateMovement(dt, now);
  updateListener();
  updateMic(now);

  const step = currentStep();
  const target = getStepTarget(step);
  if (step.mode === "navigate" && target) {
    updateNavigationAssist(target, now);
  }
  if (step.mode === "navigate" && target && now >= state.nextPulseAt) {
    playSpatialPulse(target);
    state.nextPulseAt = now + getPulseInterval(target) * 1000;
    state.touchPulseBoost = 1;
  }

  if (step.mode === "navigate" && target && getDistanceToTarget() <= GAME_CONFIG.control.triggerRadius) {
    playCue("success", target);
    enterStep(state.stepIndex + 1);
  }

  updateDebugThrottled();
}

function updateMovement(dt, now) {
  if (!["navigate", "micPrompt"].includes(state.gameStatus)) {
    return;
  }

  const turnDirection = getTurnDirection();
  if (turnDirection) {
    state.player.angle = normalizeAngle(
      state.player.angle + degreesToRadians(GAME_CONFIG.control.turnSpeed) * turnDirection * dt
    );
  }

  const axes = getCombinedAxes();
  let right = axes.right;
  let forward = axes.forward;
  if (!right && !forward) {
    return;
  }

  const length = Math.hypot(right, forward) || 1;
  right /= length;
  forward /= length;

  const forwardX = Math.sin(state.player.angle);
  const forwardY = -Math.cos(state.player.angle);
  const rightX = Math.cos(state.player.angle);
  const rightY = Math.sin(state.player.angle);
  const speed = GAME_CONFIG.control.moveSpeed * dt;
  const dx = (right * rightX + forward * forwardX) * speed;
  const dy = (right * rightY + forward * forwardY) * speed;
  const before = { x: state.player.x, y: state.player.y };
  movePlayerWithCollision(dx, dy, now);
  if (Math.hypot(state.player.x - before.x, state.player.y - before.y) > 0.01) {
    playFloorStep(now);
  }
}

function playFloorStep(now) {
  if (now - state.lastStepSoundAt < 560) {
    return;
  }
  const floorCue = getFloorCueAt(state.player.x, state.player.y);
  if (!floorCue) {
    return;
  }
  state.lastStepSoundAt = now;
  playCue(floorCue, state.player, { volumeBoost: 0.72 });
}

function getFloorCueAt(x, y) {
  const rug = currentScene().items.find((item) => item.id === "rug");
  if (!rug) {
    return null;
  }
  if (x >= rug.x && x <= rug.x + rug.w && y >= rug.y && y <= rug.y + rug.h) {
    return "rugStep";
  }
  return null;
}

function updateNavigationAssist(target, now) {
  const distance = getDistanceToTarget();
  const movedTowardTarget = distance < state.lastDistanceToTarget - 0.015;
  const movedAwayFromTarget = distance > state.lastDistanceToTarget + 0.02;

  if (movedAwayFromTarget) {
    if (!state.offTargetSince) {
      state.offTargetSince = now;
    }
    if (now - state.offTargetSince > 3000) {
      showAssistMessage("声音好像在另一个方向。", now, 1800);
      playCue(target.cue, target, { volumeBoost: 1.2 });
      state.offTargetSince = now + 1500;
    }
  } else if (movedTowardTarget) {
    state.offTargetSince = 0;
  }

  if (!state.lastMoveAt) {
    state.lastMoveAt = now;
  }
  if (now - state.lastMoveAt > 5000) {
    showAssistMessage("再听一次，方向会更清楚。", now, 1800);
    state.touchPulseBoost = 1.45;
    playCue(target.cue, target, { volumeBoost: 1.35 });
    state.nextPulseAt = now + 240;
    state.lastMoveAt = now;
  }

  state.lastDistanceToTarget = distance;
}

function showAssistMessage(message, now = performance.now(), duration = 1500) {
  ui.instructionText.textContent = message;
  state.assistMessageUntil = now + duration;
  window.setTimeout(() => {
    if (performance.now() >= state.assistMessageUntil) {
      setStory(currentStep());
    }
  }, duration + 20);
}

function getTurnDirection() {
  return clamp(state.touchTurnDirection + getKeyboardAxis("KeyE", "KeyQ"), -1, 1);
}

function getCombinedAxes() {
  const tilt = getTiltAxis();
  return {
    right: clamp(tilt.right + getKeyboardAxis("KeyD", "KeyA"), -1, 1),
    forward: clamp(tilt.forward + getKeyboardAxis("KeyW", "KeyS"), -1, 1),
  };
}

function getKeyboardAxis(positive, negative) {
  return (state.keys.has(positive) ? 1 : 0) - (state.keys.has(negative) ? 1 : 0);
}

function getTiltAxis() {
  const orientation = state.orientation;
  if (!orientation.calibrated || !orientation.latest || !orientation.baseline) {
    return { right: 0, forward: 0 };
  }

  const beta = orientation.latest.beta - orientation.baseline.beta;
  const gamma = orientation.latest.gamma - orientation.baseline.gamma;
  const threshold = GAME_CONFIG.control.tiltThreshold;
  let forwardRaw = beta;
  let rightRaw = gamma;

  if (GAME_CONFIG.control.invertForward) {
    forwardRaw *= -1;
  }
  if (GAME_CONFIG.control.invertRight) {
    rightRaw *= -1;
  }

  return {
    right: Math.abs(rightRaw) > threshold ? Math.sign(rightRaw) : 0,
    forward: Math.abs(forwardRaw) > threshold ? Math.sign(forwardRaw) : 0,
  };
}

function movePlayerWithCollision(dx, dy, now) {
  const scene = currentScene();
  const next = clampPlayer(state.player.x + dx, state.player.y + dy, scene);
  const fullHit = getCollisionAt(next.x, next.y);
  if (!fullHit) {
    state.player.x = next.x;
    state.player.y = next.y;
    state.lastMoveAt = now;
    return;
  }

  const nextX = clampPlayer(state.player.x + dx, state.player.y, scene);
  const xHit = getCollisionAt(nextX.x, nextX.y);
  if (!xHit) {
    state.player.x = nextX.x;
    state.player.y = nextX.y;
    state.lastMoveAt = now;
    triggerCollisionFeedback(fullHit, now);
    return;
  }

  const nextY = clampPlayer(state.player.x, state.player.y + dy, scene);
  const yHit = getCollisionAt(nextY.x, nextY.y);
  if (!yHit) {
    state.player.x = nextY.x;
    state.player.y = nextY.y;
    state.lastMoveAt = now;
    triggerCollisionFeedback(fullHit, now);
    return;
  }

  triggerCollisionFeedback(fullHit || xHit || yHit, now);
}

function clampPlayer(x, y, scene) {
  const radius = GAME_CONFIG.control.playerRadius;
  return {
    x: clamp(x, radius, scene.width - radius),
    y: clamp(y, radius, scene.height - radius),
  };
}

function getCollisionAt(x, y) {
  const radius = GAME_CONFIG.control.playerRadius;
  return currentScene().items.find((item) => {
    if (!item.solid) {
      return false;
    }
    if (item.type === "rect") {
      return circleRectCollision(x, y, radius, item);
    }
    if (item.type === "poly") {
      const bounds = getPolyBounds(item);
      return circleRectCollision(x, y, radius, bounds);
    }
    if (item.type === "circle") {
      return Math.hypot(item.x - x, item.y - y) <= radius + item.r;
    }
    return false;
  }) || null;
}

function circleRectCollision(cx, cy, radius, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  return Math.hypot(cx - nearestX, cy - nearestY) < radius;
}

function getPolyBounds(item) {
  const xs = item.points.map(([x]) => x);
  const ys = item.points.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    x,
    y,
    w: Math.max(...xs) - x,
    h: Math.max(...ys) - y,
  };
}

function triggerCollisionFeedback(item, now) {
  if (now - state.lastCollisionAt < GAME_CONFIG.control.collisionCooldownMs) {
    return;
  }
  state.lastCollisionAt = now;
  if (navigator.vibrate) {
    navigator.vibrate(GAME_CONFIG.control.collisionVibratePattern);
  }
  playCue(item?.hitCue || "genericHit", getItemAudioPoint(item));
  showAssistMessage("前面好像过不去。", now, 1200);
  screens.game.classList.remove("is-colliding");
  void screens.game.offsetWidth;
  screens.game.classList.add("is-colliding");
}

function getItemAudioPoint(item) {
  if (!item) {
    return pointFromPlayer(0, 0.8);
  }
  if (item.type === "rect") {
    return { x: item.x + item.w / 2, y: item.y + item.h / 2 };
  }
  if (item.type === "circle") {
    return { x: item.x, y: item.y };
  }
  if (item.type === "poly") {
    const center = item.points.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
    return { x: center.x / item.points.length, y: center.y / item.points.length };
  }
  return pointFromPlayer(0, 0.8);
}

function initPanner(target) {
  const audioContext = state.audio.context;
  const panner = audioContext.createPanner();
  panner.panningModel = "HRTF";
  panner.distanceModel = "inverse";
  panner.refDistance = 0.8;
  panner.maxDistance = Math.hypot(currentScene().width, currentScene().height);
  panner.rolloffFactor = 1.6;
  setPannerPosition(panner, target.x, target.y);
  return panner;
}

function setPannerPosition(panner, x, y) {
  if (panner.positionX) {
    panner.positionX.value = x;
    panner.positionY.value = 0;
    panner.positionZ.value = y;
  } else if (typeof panner.setPosition === "function") {
    panner.setPosition(x, 0, y);
  }
}

function updateListener() {
  const audioContext = state.audio.context;
  if (!audioContext) {
    return;
  }

  const listener = audioContext.listener;
  const now = audioContext.currentTime;
  const forwardX = Math.sin(state.player.angle);
  const forwardZ = -Math.cos(state.player.angle);

  if (listener.positionX) {
    listener.positionX.setValueAtTime(state.player.x, now);
    listener.positionY.setValueAtTime(0, now);
    listener.positionZ.setValueAtTime(state.player.y, now);
    listener.forwardX.setValueAtTime(forwardX, now);
    listener.forwardY.setValueAtTime(0, now);
    listener.forwardZ.setValueAtTime(forwardZ, now);
    listener.upX.setValueAtTime(0, now);
    listener.upY.setValueAtTime(1, now);
    listener.upZ.setValueAtTime(0, now);
  } else if (typeof listener.setPosition === "function") {
    listener.setPosition(state.player.x, 0, state.player.y);
    listener.setOrientation(forwardX, 0, forwardZ, 0, 1, 0);
  }
}

function createCueOutput(cueName, target = null, volumeOverride = null, options = {}) {
  const audioContext = state.audio.context;
  const cue = GAME_CONFIG.audioCues[cueName] || GAME_CONFIG.audioCues.success;
  const gain = audioContext.createGain();
  const boost = options.volumeBoost || 1;
  const duck = state.gameStatus === "navigate" && !target && cueName !== getStepTarget()?.cue ? 0.62 : 1;
  const volume = (volumeOverride ?? cue.volume ?? 0.6) * boost * duck;
  gain.gain.value = volume;

  if (cue.spatial) {
    const panner = initPanner(target || getDefaultCueTarget(cueName));
    panner.connect(state.audio.masterGain);
    gain.connect(panner);
    gain._pannerNode = panner;
  } else {
    gain.connect(state.audio.masterGain);
  }

  return gain;
}

function getDefaultCueTarget(cueName) {
  const scene = currentScene();
  const stepTarget = getStepTarget();
  if (stepTarget) {
    return stepTarget;
  }

  if (cueName === "rain" || cueName === "wind") {
    return scene.ambientPoint;
  }
  if (cueName === "heartbeat") {
    return pointFromPlayer(-Math.PI / 8, 1.4);
  }
  if (cueName === "rooster") {
    return { x: scene.width * 0.82, y: scene.height * 0.18 };
  }

  return scene.ambientPoint || pointFromPlayer(0, 1.6);
}

function pointFromPlayer(relativeAngle, distance) {
  const angle = state.player.angle + relativeAngle;
  const scene = currentScene();
  return {
    x: clamp(state.player.x + Math.sin(angle) * distance, 0.2, scene.width - 0.2),
    y: clamp(state.player.y - Math.cos(angle) * distance, 0.2, scene.height - 0.2),
  };
}

function playSpatialPulse(target) {
  if (!state.audio.ready || !target) {
    return;
  }

  const audioContext = state.audio.context;
  const now = audioContext.currentTime;
  const distance = Math.hypot(target.x - state.player.x, target.y - state.player.y);
  const sceneScale = Math.hypot(currentScene().width, currentScene().height);
  const closeness = clamp(1 - distance / sceneScale, 0, 1);
  const volume = (0.28 + closeness * 0.28) * state.touchPulseBoost;
  const output = createCueOutput("success", target, volume);

  playTone(output, now, "sine", 920, GAME_CONFIG.audio.pulseDuration, 0.34, 1240);
  playTone(output, now + 0.018, "triangle", 1850, 0.09, 0.16, 2440);
  playNoise(output, now, 0.08, 0.12, 3200);
}

function getPulseInterval(target) {
  const distance = Math.hypot(target.x - state.player.x, target.y - state.player.y);
  const sceneScale = Math.hypot(currentScene().width, currentScene().height);
  const closeness = clamp(1 - distance / sceneScale, 0, 1);
  return lerp(GAME_CONFIG.audio.maxPulseInterval, GAME_CONFIG.audio.minPulseInterval, closeness) / state.touchPulseBoost;
}

function playCue(cueName, target = null, options = {}) {
  if (!state.audio.ready) {
    return;
  }

  const cue = GAME_CONFIG.audioCues[cueName] || GAME_CONFIG.audioCues.success;
  if (cue.kind === "file" && cue.src) {
    playFileCue(cueName, cue, target, options).catch((error) => {
      console.warn(`Audio file cue failed: ${cueName}`, error);
      playSyntheticCue(cue.fallback || cueName, cueName, target, options);
    });
    return;
  }

  playSyntheticCue(cue.fallback || cueName, cueName, target, options);
}

async function playFileCue(cueName, cue, target = null, options = {}) {
  const audioContext = state.audio.context;
  const buffer = await loadAudioBuffer(cue.src);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = Boolean(options.loopSource);
  
  const output = createCueOutput(cueName, target, null, options);
  output._activeSources = (output._activeSources || 0) + 1;
  source.connect(output);
  source.start(audioContext.currentTime);
  
  source.onended = () => {
    source.disconnect();
    output._activeSources--;
    if (output._activeSources <= 0) {
      output.disconnect();
      if (output._pannerNode) {
        output._pannerNode.disconnect();
      }
    }
  };
  
  return source;
}

async function loadAudioBuffer(src) {
  if (GAME_CONFIG.audio.buffers.has(src)) {
    return GAME_CONFIG.audio.buffers.get(src);
  }

  const response = await fetch(src, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load ${src}: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = await state.audio.context.decodeAudioData(arrayBuffer);
  GAME_CONFIG.audio.buffers.set(src, buffer);
  return buffer;
}

function playSyntheticCue(kind, cueName, target = null, options = {}) {
  if (kind === "silent") {
    return;
  }

  const audioContext = state.audio.context;
  const now = audioContext.currentTime;
  const output = createCueOutput(cueName, target, null, options);

  if (kind === "rain") {
    playNoise(output, now, 1.4, 0.12, 900);
  } else if (kind === "heartbeat") {
    playTone(output, now, "sine", 78, 0.12, 0.38);
    playTone(output, now + 0.26, "sine", 64, 0.12, 0.28);
  } else if (kind === "waterBoil") {
    playTone(output, now, "triangle", 360, 0.42, 0.16, 520);
    playNoise(output, now, 0.46, 0.12, 1700);
  } else if (kind === "pour") {
    playNoise(output, now, 0.7, 0.18, 2400);
  } else if (kind === "drop") {
    playTone(output, now, "square", 220, 0.08, 0.32, 130);
    playTone(output, now + 0.12, "triangle", 410, 0.16, 0.26, 260);
  } else if (kind === "pickup") {
    playTone(output, now, "triangle", 520, 0.12, 0.24);
  } else if (kind === "wind") {
    playNoise(output, now, 1.1, 0.13, 620);
  } else if (kind === "chime") {
    playTone(output, now, "sine", 1046, 0.72, 0.28);
    playTone(output, now + 0.12, "sine", 1318, 0.74, 0.22);
    playTone(output, now + 0.24, "triangle", 1760, 0.46, 0.12);
  } else if (kind === "tape" || kind === "tapeMachine") {
    playNoise(output, now, 0.9, 0.08, 1200);
    playTone(output, now + 0.05, "sawtooth", 140, 0.55, 0.14);
  } else if (kind === "rooster") {
    playTone(output, now, "sawtooth", 660, 0.18, 0.24, 980);
    playTone(output, now + 0.22, "sawtooth", 720, 0.2, 0.22, 1040);
  } else if (kind === "grandma") {
    playTone(output, now, "triangle", 330, 0.34, 0.24);
    playTone(output, now + 0.18, "triangle", 392, 0.32, 0.2);
  } else {
    playTone(output, now, "triangle", 880, 0.26, 0.3, 1320);
    playTone(output, now + 0.08, "sine", 1320, 0.22, 0.16, 1760);
  }
}

function playTone(destination, start, type, freq, duration, volume, endFreq = null) {
  const audioContext = state.audio.context;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);
  if (endFreq) {
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  
  if (destination) {
    destination._activeSources = (destination._activeSources || 0) + 1;
  }
  
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
  
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
    if (destination) {
      destination._activeSources--;
      if (destination._activeSources <= 0) {
        destination.disconnect();
        if (destination._pannerNode) {
          destination._pannerNode.disconnect();
        }
      }
    }
  };
}

function playNoise(destination, start, duration, volume, filterFreq) {
  const audioContext = state.audio.context;
  const bufferSize = Math.max(1, Math.floor(audioContext.sampleRate * duration));
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.9;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  
  if (destination) {
    destination._activeSources = (destination._activeSources || 0) + 1;
  }
  
  source.start(start);
  source.stop(start + duration + 0.04);
  
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
    if (destination) {
      destination._activeSources--;
      if (destination._activeSources <= 0) {
        destination.disconnect();
        if (destination._pannerNode) {
          destination._pannerNode.disconnect();
        }
      }
    }
  };
}

function startLoop(cueName, target) {
  stopAllLoops();
  const intervalMs = cueName === "chime" ? 1800 : 1350;
  const interval = window.setInterval(() => {
    if (state.gameStatus === "navigate") {
      playCue(cueName, target);
    }
  }, intervalMs);
  state.audio.loops.set(cueName, interval);
}

function stopAllLoops() {
  state.audio.loops.forEach((interval) => window.clearInterval(interval));
  state.audio.loops.clear();
}

async function startMicPrompt() {
  if (state.mic.status === "listening") {
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    markMicFailure("麦克风不可用，再轻触试一次。");
    updateDebug();
    return;
  }

  try {
    state.mic.status = "requesting";
    updateDebug();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = state.audio.context;
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    state.mic.stream = stream;
    state.mic.source = source;
    state.mic.analyser = analyser;
    state.mic.data = new Uint8Array(analyser.fftSize);
    state.mic.status = "listening";
    state.mic.loudSince = 0;
    state.mic.promptStartedAt = performance.now();
    state.mic.fallbackReady = false;
    ui.instructionText.textContent = "对着麦克风回答：唉";
  } catch (error) {
    console.warn("Microphone failed:", error);
    markMicFailure("没有麦克风权限，再轻触试一次。");
  }
  updateDebug();
}

function updateMic(now) {
  if (state.gameStatus !== "micPrompt" || state.mic.status !== "listening") {
    return;
  }

  if (state.mic.promptStartedAt && now - state.mic.promptStartedAt > GAME_CONFIG.mic.timeoutMs) {
    stopMic();
    markMicFailure("再回应奶奶一声。");
    return;
  }

  state.mic.analyser.getByteTimeDomainData(state.mic.data);
  let sum = 0;
  for (let i = 0; i < state.mic.data.length; i += 1) {
    const normalized = (state.mic.data[i] - 128) / 128;
    sum += normalized * normalized;
  }
  const rms = Math.sqrt(sum / state.mic.data.length);

  if (rms > GAME_CONFIG.mic.threshold) {
    if (!state.mic.loudSince) {
      state.mic.loudSince = now;
    }
    if (now - state.mic.loudSince >= GAME_CONFIG.mic.holdMs) {
      stopMic();
      state.mic.failures = 0;
      state.mic.fallbackReady = false;
      enterStep(state.stepIndex + 1);
    }
  } else {
    state.mic.loudSince = 0;
  }
}

function markMicFailure(message) {
  state.mic.failures += 1;
  state.mic.status = "retry";
  if (state.mic.failures >= GAME_CONFIG.mic.maxFailures) {
    state.mic.fallbackReady = true;
    ui.instructionText.textContent = "环境太吵时，可以轻触屏幕回应奶奶。";
  } else {
    state.mic.fallbackReady = false;
    ui.instructionText.textContent = message;
  }
  updateDebug();
}

function stopMic() {
  if (state.mic.stream) {
    state.mic.stream.getTracks().forEach((track) => track.stop());
  }
  state.mic.status = "idle";
  state.mic.stream = null;
  state.mic.source = null;
  state.mic.analyser = null;
  state.mic.data = null;
  state.mic.loudSince = 0;
  state.mic.promptStartedAt = 0;
}

function resizeCanvas() {
  const rect = ui.canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  state.canvas = { width, height, dpr };
  ui.canvas.width = Math.floor(width * dpr);
  ui.canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getMapTransform() {
  const scene = currentScene();
  const padding = 18;
  const availableWidth = Math.max(1, state.canvas.width - padding * 2);
  const availableHeight = Math.max(1, state.canvas.height - padding * 2);
  const scale = Math.min(
    availableWidth / scene.width,
    availableHeight / scene.height
  );
  return {
    scale,
    offsetX: (state.canvas.width - scene.width * scale) / 2,
    offsetY: (state.canvas.height - scene.height * scale) / 2,
  };
}

function mapPoint(point, transform) {
  return {
    x: transform.offsetX + point.x * transform.scale,
    y: transform.offsetY + point.y * transform.scale,
  };
}

function render() {
  const scene = currentScene();
  const { width, height } = state.canvas;
  if (!width || !height) {
    return;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = scene.bg;
  ctx.fillRect(0, 0, width, height);

  const transform = getMapTransform();
  drawScene(scene, transform);
  drawTarget(transform);
  drawPlayer(transform);
  if (state.debugVisible) {
    drawCollisionBoxes(transform);
  }
  if (scene.id === "memory") {
    drawMemoryVignette(width, height);
  }
}

function drawScene(scene, transform) {
  ctx.save();
  ctx.strokeStyle = "rgba(20, 20, 20, 0.18)";
  ctx.lineWidth = 1;
  const origin = mapPoint({ x: 0, y: 0 }, transform);
  ctx.strokeRect(origin.x, origin.y, scene.width * transform.scale, scene.height * transform.scale);

  scene.items.forEach((item) => {
    if (item.type === "rect") {
      drawRectItem(item, transform);
    } else if (item.type === "poly") {
      drawPolyItem(item, transform);
    } else if (item.type === "door") {
      drawDoorItem(item, transform);
    } else if (item.type === "circle") {
      drawCircleItem(item, transform);
    }
  });
  ctx.restore();
}

function drawRectItem(item, transform) {
  const point = mapPoint(item, transform);
  ctx.save();
  ctx.fillStyle = item.color;
  ctx.fillRect(point.x, point.y, item.w * transform.scale, item.h * transform.scale);
  drawItemLabel(item.label, point.x + item.w * transform.scale / 2, point.y + item.h * transform.scale / 2, item.color);
  ctx.restore();
}

function drawPolyItem(item, transform) {
  ctx.save();
  ctx.fillStyle = item.color;
  ctx.beginPath();
  item.points.forEach(([x, y], index) => {
    const point = mapPoint({ x, y }, transform);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.fill();
  const center = item.points.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
  center.x /= item.points.length;
  center.y /= item.points.length;
  const point = mapPoint(center, transform);
  drawItemLabel(item.label, point.x, point.y, item.color);
  ctx.restore();
}

function drawCircleItem(item, transform) {
  const point = mapPoint(item, transform);
  ctx.save();
  ctx.fillStyle = item.color;
  ctx.shadowColor = "rgba(255, 209, 102, 0.58)";
  ctx.shadowBlur = 26;
  ctx.beginPath();
  ctx.arc(point.x, point.y, item.r * transform.scale, 0, Math.PI * 2);
  ctx.fill();
  drawItemLabel(item.label, point.x, point.y, item.color);
  ctx.restore();
}

function drawDoorItem(item, transform) {
  const point = mapPoint(item, transform);
  ctx.save();
  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(point.x, point.y, item.r * transform.scale, item.from, item.to);
  ctx.stroke();
  ctx.fillStyle = "#171717";
  ctx.font = `${Math.max(12, 0.24 * transform.scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const labelX = point.x + Math.cos((item.from + item.to) / 2) * item.r * transform.scale * 0.62;
  const labelY = point.y + Math.sin((item.from + item.to) / 2) * item.r * transform.scale * 0.62;
  ctx.fillText(item.label, labelX, labelY);
  ctx.restore();
}

function drawItemLabel(label, x, y, color) {
  ctx.save();
  ctx.fillStyle = getReadableTextColor(color);
  ctx.font = "800 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
  ctx.restore();
}

function drawTarget(transform) {
  const target = getStepTarget();
  if (!target || !["navigate", "micPrompt"].includes(state.gameStatus)) {
    return;
  }

  const point = mapPoint(target, transform);
  ctx.save();
  ctx.strokeStyle = state.gameStatus === "micPrompt" ? "#ffd166" : "#ff4d76";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 7]);
  ctx.beginPath();
  ctx.arc(point.x, point.y, GAME_CONFIG.control.triggerRadius * transform.scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = state.gameStatus === "micPrompt" ? "#ffd166" : "#ff4d76";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayer(transform) {
  const point = mapPoint(state.player, transform);
  const angle = state.player.angle;
  const size = Math.max(12, transform.scale * 0.2);
  const forward = { x: Math.sin(angle), y: -Math.cos(angle) };
  const right = { x: Math.cos(angle), y: Math.sin(angle) };

  const tip = { x: point.x + forward.x * size, y: point.y + forward.y * size };
  const left = {
    x: point.x - forward.x * size * 0.72 - right.x * size * 0.62,
    y: point.y - forward.y * size * 0.72 - right.y * size * 0.62,
  };
  const rightCorner = {
    x: point.x - forward.x * size * 0.72 + right.x * size * 0.62,
    y: point.y - forward.y * size * 0.72 + right.y * size * 0.62,
  };

  ctx.save();
  ctx.fillStyle = "#2fd8ff";
  ctx.shadowColor = "rgba(47, 216, 255, 0.66)";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(left.x, left.y);
  ctx.lineTo(rightCorner.x, rightCorner.y);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#071118";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x + forward.x * size * 1.8, point.y + forward.y * size * 1.8);
  ctx.stroke();
  ctx.restore();
}

function drawCollisionBoxes(transform) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 77, 94, 0.75)";
  ctx.lineWidth = 2;
  currentScene().items.forEach((item) => {
    if (!item.solid) {
      return;
    }
    if (item.type === "rect") {
      const point = mapPoint(item, transform);
      ctx.strokeRect(point.x, point.y, item.w * transform.scale, item.h * transform.scale);
    } else if (item.type === "poly") {
      ctx.beginPath();
      item.points.forEach(([x, y], index) => {
        const point = mapPoint({ x, y }, transform);
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.stroke();
    }
  });
  ctx.restore();
}

function drawMemoryVignette(width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(0,0,0,0.48)");
  gradient.addColorStop(0.5, "rgba(0,0,0,0.04)");
  gradient.addColorStop(1, "rgba(0,0,0,0.58)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function getReadableTextColor(color) {
  if (["#b15ba2", "#10a6dc", "#161923", "#202436"].includes(color)) {
    return "#f6f2ea";
  }
  return "#171717";
}

function gameLoop(now) {
  if (!state.rafRunning) return;

  if (!state.lastFrameAt) {
    state.lastFrameAt = now;
  }

  const dt = Math.min((now - state.lastFrameAt) / 1000, 0.05);
  state.lastFrameAt = now;
  updateGame(dt, now);
  render();
  window.requestAnimationFrame(gameLoop);
}

function updateDebug() {
  const step = currentStep();
  ui.debugScene.textContent = `场景 ${currentScene().name}`;
  ui.debugStep.textContent = `步骤 ${state.stepIndex + 1}/${STORY_STEPS.length}`;
  ui.debugDistance.textContent = getStepTarget(step) ? `距离 ${getDistanceToTarget().toFixed(1)}m` : "距离 --";
  ui.debugSensor.textContent = state.orientation.calibrated
    ? "姿态 已校准"
    : state.orientation.supported
      ? "姿态 待校准"
      : "姿态 键盘";
  ui.debugMic.textContent = `麦克风 ${state.mic.status}`;
  ui.debugMap.textContent = `地图 ${state.settings.showMinimap ? "可见" : "隐藏"}`;
}

function handlePointerDown(event) {
  if (event.target.closest("button") || event.target.closest("input") || event.target.closest(".story-panel")) {
    return;
  }
  if (!["navigate", "micPrompt", "tutorial"].includes(state.gameStatus)) {
    return;
  }

  state.turnPointerId = event.pointerId;
  state.touchTurnDirection = event.clientX < window.innerWidth / 2 ? -1 : 1;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}

function handlePointerMove(event) {
  if (event.pointerId !== state.turnPointerId) {
    return;
  }
  state.touchTurnDirection = event.clientX < window.innerWidth / 2 ? -1 : 1;
}

function handlePointerEnd(event) {
  if (event.pointerId !== state.turnPointerId) {
    return;
  }
  state.turnPointerId = null;
  state.touchTurnDirection = 0;
}

function toggleDebug() {
  state.debugVisible = !state.debugVisible;
  ui.debugPanel.classList.toggle("is-visible", state.debugVisible);
}

function handleVisibilityChange() {
  if (document.hidden) {
    state.rafRunning = false;
    stopAllLoops();
    stopMic();
    if (state.audio.context) {
      state.audio.context.suspend();
    }
  } else {
    if (!state.rafRunning) {
      state.rafRunning = true;
      state.lastFrameAt = performance.now();
      window.requestAnimationFrame(gameLoop);
    }
    if (state.audio.context && state.gameStatus !== "start") {
      state.audio.context.resume();
    }
  }
}

async function fetchSettings({ quiet = false } = {}) {
  try {
    const response = await fetch(GAME_CONFIG.api.settingsUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`settings ${response.status}`);
    }
    const data = await response.json();
    applySettings(data, "remote");
    if (!quiet) {
      setDeveloperStatus("已刷新远程状态。");
    }
    return data;
  } catch (error) {
    if (!quiet) {
      setDeveloperStatus("远程设置暂不可用，已使用本机缓存。");
    }
    loadCachedSettings();
    return state.settings;
  }
}

async function verifyDeveloperPassword(password) {
  const response = await fetch(GAME_CONFIG.api.authUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    throw new Error(`settings auth ${response.status}`);
  }
}

async function postSettings(nextSettings) {
  const body = {
    password: state.developer.password,
    showMinimap: Boolean(nextSettings.showMinimap),
  };
  const response = await fetch(GAME_CONFIG.api.settingsUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`settings post ${response.status}`);
  }
  const data = await response.json();
  applySettings(data, "remote");
  return data;
}

function applySettings(data, source) {
  state.settings = {
    showMinimap: data?.showMinimap !== false,
    updatedAt: data?.updatedAt || new Date().toISOString(),
    version: Number(data?.version || 1),
    source,
  };
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  ui.minimapToggle.checked = state.settings.showMinimap;
  ui.minimapPanel.classList.toggle("is-hidden", !state.settings.showMinimap);
  updateDebug();
}

function loadCachedSettings() {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "null");
    if (cached) {
      applySettings(cached, "cache");
      return;
    }
  } catch (error) {
    console.warn("Failed to read cached settings:", error);
  }
  applySettings({ showMinimap: true, version: 1 }, "default");
}

function startSettingsPolling() {
  loadCachedSettings();
  fetchSettings({ quiet: true });
  window.clearInterval(state.settingsPollId);
  state.settingsPollId = window.setInterval(() => {
    if (!document.hidden && !isDeveloperRoute()) {
      fetchSettings({ quiet: true });
    }
  }, GAME_CONFIG.api.pollMs);
}

async function handleDeveloperLogin(event) {
  event.preventDefault();
  const password = ui.developerPassword.value.trim();
  if (!password) {
    state.developer.authed = false;
    state.developer.password = "";
    ui.developerControls.classList.remove("is-visible");
    setDeveloperStatus("请输入开发者密码。");
    return;
  }

  setDeveloperStatus("正在验证密码...");
  try {
    await verifyDeveloperPassword(password);
    state.developer.authed = true;
    state.developer.password = password;
    ui.developerControls.classList.add("is-visible");
    setDeveloperStatus("已进入开发者后台。");
    fetchSettings();
  } catch (error) {
    console.warn("Developer authentication failed:", error);
    state.developer.authed = false;
    state.developer.password = "";
    ui.developerControls.classList.remove("is-visible");
    setDeveloperStatus("密码不对，或后台服务暂不可用。");
  }
}

async function handleDeveloperToggle() {
  if (!state.developer.authed) {
    setDeveloperStatus("请先输入开发者密码。");
    ui.minimapToggle.checked = state.settings.showMinimap;
    return;
  }

  const showMinimap = ui.minimapToggle.checked;
  setDeveloperStatus("正在同步...");
  try {
    await postSettings({ showMinimap });
    setDeveloperStatus(`已同步：玩家小地图${showMinimap ? "显示" : "隐藏"}。`);
  } catch (error) {
    console.warn("Remote settings update failed:", error);
    if (String(error.message || "").includes("401")) {
      state.developer.authed = false;
      state.developer.password = "";
      ui.developerControls.classList.remove("is-visible");
      ui.minimapToggle.checked = state.settings.showMinimap;
      setDeveloperStatus("登录已失效，请重新输入开发者密码。");
      return;
    }
    applySettings({ showMinimap, version: state.settings.version, updatedAt: new Date().toISOString() }, "local");
    setDeveloperStatus("远程同步失败，已临时保存到本机。");
  }
}

function setDeveloperStatus(message) {
  ui.developerStatus.textContent = message;
}

function isDeveloperRoute() {
  const path = window.location.pathname.replace(/\/$/, "");
  return path === "/developer" || window.location.search.includes("developer=1");
}

function initializeRoute() {
  if (isDeveloperRoute()) {
    showScreen("developer");
    fetchSettings({ quiet: true });
  } else {
    showScreen("start");
    startSettingsPolling();
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function normalizeAngle(angle) {
  const fullTurn = Math.PI * 2;
  return ((angle % fullTurn) + fullTurn) % fullTurn;
}

ui.startButton.addEventListener("click", startGame);
ui.playAgainButton.addEventListener("click", restartGame);
ui.calibrateButton.addEventListener("click", handleCalibrateClick);
ui.skipTutorialButton.addEventListener("click", skipTutorial);
ui.invertForwardButton.addEventListener("click", () => toggleInvert("forward"));
ui.invertRightButton.addEventListener("click", () => toggleInvert("right"));
ui.storyPanel.addEventListener("click", advanceStep);
ui.debugHotspot.addEventListener("pointerdown", () => {
  state.debugPressTimer = window.setTimeout(toggleDebug, 1000);
});
ui.debugHotspot.addEventListener("pointerup", () => window.clearTimeout(state.debugPressTimer));
ui.debugHotspot.addEventListener("pointercancel", () => window.clearTimeout(state.debugPressTimer));
screens.game.addEventListener("pointerdown", handlePointerDown);
screens.game.addEventListener("pointermove", handlePointerMove);
screens.game.addEventListener("pointerup", handlePointerEnd);
screens.game.addEventListener("pointercancel", handlePointerEnd);
screens.setup.addEventListener("pointerdown", handlePointerDown);
screens.setup.addEventListener("pointermove", handlePointerMove);
screens.setup.addEventListener("pointerup", handlePointerEnd);
screens.setup.addEventListener("pointercancel", handlePointerEnd);
ui.developerLogin.addEventListener("submit", handleDeveloperLogin);
ui.minimapToggle.addEventListener("change", handleDeveloperToggle);
ui.refreshSettingsButton.addEventListener("click", () => fetchSettings());
window.addEventListener("resize", resizeCanvas);
document.addEventListener("visibilitychange", handleVisibilityChange);

window.addEventListener("keydown", (event) => {
  if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE"].includes(event.code)) {
    event.preventDefault();
    state.keys.add(event.code);
  }
});

window.addEventListener("keyup", (event) => {
  state.keys.delete(event.code);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

loadCachedSettings();
updateInvertButtons();
initializeRoute();
resizeCanvas();
window.requestAnimationFrame(gameLoop);

/**
 * cooldice.js
 * Virtual CoolDice: drag the marble from its dish onto START, swipe right to left (hand at the
 * camera, mouse/finger across the machine, or a button), the marble runs the track and spirals
 * down the funnel, the dice screen rolls, and that many candies roll down the ramps into the bowl.
 *
 * Realism: the route follows the groove between the rails with a speed at every point (slow off
 * START, faster downhill and towards the funnel's tip, coasting to a stop at the end). The marble
 * spins as it rolls, shrinks a little at the back of the machine, and passes behind the funnel's
 * front wall and the rail clamps, which sit on a foreground layer (fg.webp) above it.
 *
 * Hand tracking: MediaPipe Hand Landmarker, loaded from jsDelivr / Google only after the visitor
 * turns the camera on. Video stays in the tab; nothing is recorded or uploaded.
 *
 * Positions are measured on a 1100px-wide render of scene.webp and stored as fractions of the
 * stage, so they stay on the artwork at any size. Add ?debug to draw the paths, ?speed=4 to fast-forward.
 */

const VIEW_W = 1100;
const VIEW_H = 723;

const DISH = [540, 214];   // where the marble waits, in its dish above the machine
const START = [678, 281];  // inside the START gate
const SNAP_RADIUS = 46;    // view px from START that counts as "on START"
const MARBLE_RADIUS = 7.4; // view px, for the spin

// Route points are [x, y, speed in view px per second]
const TRACK_IN = [
  [678, 281, 40], [640, 281, 150], [600, 281, 210], [582, 285, 230], [568, 297, 250], [550, 309, 270],
  // top rail, gently downhill
  [500, 310, 285], [460, 310, 295], [400, 311, 300], [340, 312, 305], [280, 314, 312], [240, 315, 320],
  // sweeping down to the far left
  [200, 320, 335], [170, 328, 345], [140, 341, 355], [110, 356, 360], [80, 370, 355], [55, 384, 335],
  [40, 395, 300], [36, 402, 270], [44, 409, 255],
  // back right through the S-bend and behind the funnel (a slight climb, so it slows)
  [62, 410, 260], [100, 405, 268], [130, 396, 268], [150, 386, 258], [175, 378, 250], [210, 375, 245],
  [245, 372, 242], [280, 369, 240], [320, 364, 240], [360, 361, 242], [400, 360, 246], [430, 361, 252],
  // round the right-hand post and over the funnel rim
  [448, 364, 265], [456, 372, 290], [450, 385, 320], [438, 393, 340]
];

// The funnel: circles inside the rim and speeds up as the circles tighten towards the tip
const FUNNEL = (() => {
  const pts = [];
  const turns = 2.6;
  const steps = 170;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;      // starts on the right, swings round the near side first
    const r = 1 - 0.86 * t;
    const cx = 326 + 4 * t;
    const cy = 396 + 84 * t;
    pts.push([cx + 104 * r * Math.cos(a), cy + 26 * r * Math.sin(a), 340 + 230 * t]);
  }
  return pts;
})();

const TRACK_OUT = [
  // out of the tip onto the lower track's back rail
  [331, 489, 430], [329, 497, 370],
  [300, 497, 345], [260, 498, 335], [228, 500, 325], [190, 502, 315], [150, 505, 305], [120, 511, 292],
  // round the left end and back along the front rail, coasting to a stop before the last post
  [102, 523, 275], [104, 538, 265], [125, 547, 262], [170, 550, 262], [220, 551, 255], [270, 550, 242],
  [320, 547, 220], [370, 540, 180], [410, 532, 130], [432, 527, 80], [446, 525, 40], [452, 524, 0]
];

// Candy: out of the jar spout, rolls along each ramp of the zigzag (hopping across to the next
// one), and over the bowl rim
const CANDY_PATH = [
  [935, 322], [928, 352], [905, 390], [946, 413], [985, 410], [1012, 424], [954, 454],
  [915, 450], [885, 450], [944, 487], [952, 500]
];
const BOWL = { x0: 932, x1: 1028, y0: 528, y1: 552 };
const CANDY_COLOURS = ['#ff4d4d', '#ff9f1c', '#ffd60a', '#38c172', '#3b82f6', '#a855f7'];
const CANDY_SPEED = 420;
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];

const HAND_LIB = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const SWIPE_DISTANCE = 0.28; // share of the camera frame the hand must travel leftwards
const SWIPE_WINDOW_MS = 650;

const params = new URLSearchParams(location.search);
const speedUp = Math.max(1, Number(params.get('speed')) || 1);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const stage = document.getElementById('cdStage');
const ball = document.getElementById('cdBall');
const ballSpin = ball.querySelector('.cd-ball-spin');
const dish = document.getElementById('cdDish');
const startRing = document.getElementById('cdStartRing');
const die = document.getElementById('cdDie');
const candyLayer = document.getElementById('cdCandies');
const statusEl = document.getElementById('cdStatus');
const cueStep = document.getElementById('cdCueStep');
const cueText = document.getElementById('cdCueText');
const cueSub = document.getElementById('cdCueSub');
const cueAgain = document.getElementById('cdCueAgain');
const camBtn = document.getElementById('cdCamBtn');
const camView = document.getElementById('cdCamView');
const camLabel = document.getElementById('cdCamLabel');
const video = document.getElementById('cdVideo');
const handDot = document.getElementById('cdHandDot');
const swipeBtn = document.getElementById('cdSwipeBtn');
const againBtn = document.getElementById('cdAgainBtn');
const steps = [...document.querySelectorAll('.cd-steps li')];
const dieCube = document.getElementById('cdDieCube');
const screenEl = document.getElementById('cdScreen');
const screenTitle = document.getElementById('cdScreenTitle');
const screenSub = document.getElementById('cdScreenSub');

// Dice: opposite faces add up to 7. Pip spots are % of a face; FACE_TURN is the cube rotation
// [x, y] (deg) that brings each number to the front.
const DIE_SIDES = { front: 1, back: 6, top: 2, bottom: 5, right: 3, left: 4 };
const PIP_SPOTS = {
  1: [[50, 50]],
  2: [[27, 27], [73, 73]],
  3: [[27, 27], [50, 50], [73, 73]],
  4: [[27, 27], [73, 27], [27, 73], [73, 73]],
  5: [[27, 27], [73, 27], [50, 50], [27, 73], [73, 73]],
  6: [[27, 25], [73, 25], [27, 50], [73, 50], [27, 75], [73, 75]]
};
const FACE_TURN = { 1: [0, 0], 6: [0, 180], 3: [0, -90], 4: [0, 90], 2: [-90, 0], 5: [90, 0] };
let dieTurn = { x: 0, y: 0 };

Object.entries(DIE_SIDES).forEach(([side, n]) => {
  const face = document.createElement('div');
  face.className = 'cd-die-face';
  face.dataset.side = side;
  PIP_SPOTS[n].forEach(([x, y]) => {
    const pip = document.createElement('span');
    pip.className = 'cd-die-pip';
    pip.style.left = `${x}%`;
    pip.style.top = `${y}%`;
    face.appendChild(pip);
  });
  dieCube.appendChild(face);
});

let state = 'idle'; // idle → armed → running → done
let camOn = false;

/* ---------- helpers ---------- */

const place = (el, [x, y]) => {
  el.style.left = `${(x / VIEW_W) * 100}%`;
  el.style.top = `${(y / VIEW_H) * 100}%`;
};

const setStatus = (text) => { statusEl.textContent = text; };

// The banner on the machine: step number, what to do, and a smaller line under it
const cue = (step, text, sub = '') => {
  cueStep.textContent = step;
  cueText.textContent = text;
  cueSub.textContent = sub;
  cueSub.hidden = !sub;
};

const setState = (next) => {
  state = next;
  ['idle', 'armed', 'running', 'done'].forEach(s => stage.classList.toggle(`is-${s}`, next === s));
  const current = { idle: 0, armed: 1, running: 2, done: 3 }[next];
  steps.forEach((li, i) => {
    li.classList.toggle('is-done', i < current);
    li.classList.toggle('is-current', i === current);
  });
  swipeBtn.disabled = next !== 'armed';
  againBtn.hidden = next !== 'done';
  cueAgain.hidden = next !== 'done';
};

// Catmull-Rom through [x, y, speed] points; speed is interpolated linearly in between
const smooth = (pts, per = 6) => {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    for (let s = 0; s < per; s++) {
      const t = s / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const xy = [0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t +
        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3));
      out.push(p1.length > 2 ? [...xy, p1[2] + (p2[2] - p1[2]) * t] : xy);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

// Distance and arrival time at every point; constant speed when points carry none
const timeline = (pts, fixedSpeed) => {
  const dist = [0];
  const time = [0];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const v = fixedSpeed || Math.max(25, (pts[i][2] + pts[i - 1][2]) / 2);
    dist.push(dist[i - 1] + d);
    time.push(time[i - 1] + d / v);
  }
  return { pts, dist, time, duration: time[time.length - 1] };
};

const sampleAt = ({ pts, dist, time }, t) => {
  let i = 1;
  while (i < time.length - 1 && time[i] < t) i++;
  const span = time[i] - time[i - 1] || 1;
  const k = Math.min(1, Math.max(0, (t - time[i - 1]) / span));
  return {
    x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k,
    y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k,
    d: dist[i - 1] + (dist[i] - dist[i - 1]) * k
  };
};

// Play a timeline on an element; the clock drives it, so slow frames just skip ahead
const play = (el, route, onFrame) => new Promise(resolve => {
  const t0 = performance.now();
  const total = (route.duration * 1000) / speedUp;
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / total);
    const s = sampleAt(route, p * route.duration);
    place(el, [s.x, s.y]);
    if (onFrame) onFrame(s);
    if (p < 1) requestAnimationFrame(frame);
    else resolve();
  };
  requestAnimationFrame(frame);
});

const wait = (ms) => new Promise(r => setTimeout(r, ms / speedUp));

// Further back on the machine (higher on screen) reads as further away: a touch smaller
const depthScale = (y) => 0.86 + 0.24 * Math.min(1, Math.max(0, (y - 290) / 270));

const MARBLE_ROUTE = timeline(smooth(TRACK_IN).concat(FUNNEL, smooth(TRACK_OUT)));

/* ---------- marble: drag from the dish onto START ---------- */

const stagePoint = (e) => {
  const r = stage.getBoundingClientRect();
  return [
    Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * VIEW_W,
    Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) * VIEW_H
  ];
};
const nearStart = ([x, y]) => Math.hypot(x - START[0], y - START[1]) < SNAP_RADIUS;

const setBallLook = (scale, angle = 0) => {
  ball.style.setProperty('--s', scale.toFixed(3));
  ballSpin.style.transform = `rotate(${angle.toFixed(1)}deg)`;
};

const snapTo = (pt) => {
  ball.classList.add('is-snapping');
  place(ball, pt);
  setBallLook(depthScale(pt[1]));
  setTimeout(() => ball.classList.remove('is-snapping'), 320);
};

const armedCue = () => cue('2', 'Swipe your hand from right to left',
  camOn ? 'In front of the camera, like a quick wave.' : 'Turn on the camera, or swipe across the machine.');

const placeOnStart = () => {
  if (state !== 'idle' && state !== 'armed') return;
  snapTo(START);
  setState('armed');
  armedCue();
  screen('Swipe to start', 'Right to left');
  setStatus(camOn
    ? 'The marble is on START. Now swipe your hand from right to left.'
    : 'The marble is on START. Turn on the camera and swipe your hand right to left, or swipe across the machine.');
};

let drag = null;
let clickFromPointer = false;

ball.addEventListener('pointerdown', (e) => {
  if (state !== 'idle' && state !== 'armed') return;
  e.preventDefault();
  ball.setPointerCapture(e.pointerId);
  drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false };
  ball.classList.add('is-held');
});

ball.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
  drag.moved = true;
  const pt = stagePoint(e);
  place(ball, pt);
  stage.classList.toggle('is-near-start', nearStart(pt));
});

const endDrag = (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const moved = drag.moved;
  drag = null;
  clickFromPointer = true;
  ball.classList.remove('is-held');
  stage.classList.remove('is-near-start');
  if (!moved || nearStart(stagePoint(e))) {
    placeOnStart();
  } else {
    snapTo(DISH);
    setState('idle');
    screen('Ready', 'Place the marble on START');
    cue('1', 'Drag the marble onto START', 'Almost! Drop it right inside the START gate.');
    setStatus('Almost! Drop the marble right inside the START gate.');
  }
};
ball.addEventListener('pointerup', endDrag);
ball.addEventListener('pointercancel', endDrag);

// Keyboard (Enter / Space) presses the button without pointer events
ball.addEventListener('click', () => {
  if (clickFromPointer) {
    clickFromPointer = false;
    return;
  }
  placeOnStart();
});

/* ---------- swipe: mouse / finger across the machine, or the button ---------- */

let swipe = null;
stage.addEventListener('pointerdown', (e) => {
  if (e.target === ball || e.target.closest('button')) return;
  swipe = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
});
stage.addEventListener('pointerup', (e) => {
  if (!swipe || e.pointerId !== swipe.id) return;
  const dx = e.clientX - swipe.x;
  const dy = e.clientY - swipe.y;
  const quick = performance.now() - swipe.t < 900;
  swipe = null;
  if (quick && dx < -60 && Math.abs(dx) > Math.abs(dy) * 1.2) trySwipe();
});
swipeBtn.addEventListener('click', () => trySwipe());

function trySwipe() {
  if (state === 'armed') run();
  else if (state === 'idle') setStatus('First drag the marble onto the START gate.');
}

/* ---------- the run: marble → dice → candy ---------- */

async function run() {
  setState('running');
  cue('3', 'Here it goes…', 'Watch it through the funnel.');
  setStatus('Swipe detected! Off it goes…');
  screen('Marble run in progress', 'The dice rolls when it reaches the end', true);
  await play(ball, MARBLE_ROUTE, (s) => setBallLook(depthScale(s.y), (s.d / MARBLE_RADIUS) * (180 / Math.PI) * -1));

  // The marble is home: the dice appears and tumbles
  cue('3', 'Rolling the dice…');
  setStatus('The marble reached the end. Rolling the dice…');
  screenEl.dataset.mode = 'die';
  await wait(350);
  const n = 1 + Math.floor(Math.random() * 6);
  await rollDie(n);

  // Settle square-on: one flat face showing the number
  die.classList.add('is-flat');
  const candyWord = n === 1 ? 'candy' : 'candies';
  cue('3', `You rolled a ${n}!`);
  setStatus(`You rolled a ${n}!`);
  await wait(1400);

  // Then the screen announces the candy, and it drops
  screen('Dispensing candies', `0 of ${n}`, true);
  cue('3', `You rolled a ${n}!`, `Here come ${NUMBER_WORDS[n]} ${candyWord}…`);
  setStatus(`Dispensing ${NUMBER_WORDS[n]} ${candyWord}…`);
  await wait(700);
  for (let i = 0; i < n; i++) {
    dropCandy(i);
    screenSub.textContent = `${i + 1} of ${n}`;
    await wait(reducedMotion.matches ? 150 : 520);
  }
  await wait(1100);
  setState('done');
  screen(`Enjoy your ${n} ${candyWord}!`, 'Play again any time');
  cue('✓', `${n} ${candyWord} for you!`, 'Fancy another go?');
  setStatus(`You rolled a ${n}: ${NUMBER_WORDS[n]} ${candyWord} in the bowl. Play again?`);
}

// Tumble forward a few full turns, ending with face n towards the viewer
async function rollDie(n) {
  const [tx, ty] = FACE_TURN[n];
  const forward = (from, target, minTurns) => {
    let v = target;
    while (v < from + 360 * minTurns) v += 360;
    return v;
  };
  if (reducedMotion.matches) {
    dieTurn = { x: tx, y: ty };
  } else {
    dieTurn = { x: forward(dieTurn.x, tx, 2 + Math.round(Math.random())), y: forward(dieTurn.y, ty, 2 + Math.round(Math.random())) };
    dieCube.classList.add('is-rolling');
  }
  dieCube.style.transform = `rotateX(${dieTurn.x}deg) rotateY(${dieTurn.y}deg)`;
  if (!reducedMotion.matches) await wait(1500);
  dieCube.classList.remove('is-rolling');
  die.dataset.face = String(n);
  die.classList.remove('is-landed');
  void die.offsetWidth;
  die.classList.add('is-landed');
}

function idleDie() {
  dieTurn = { x: 0, y: 0 };
  dieCube.classList.remove('is-rolling');
  dieCube.style.transform = '';
  die.dataset.face = '0';
  die.classList.remove('is-landed', 'is-flat');
}

// The machine screen in message mode: a title, a smaller line, and optional ticking dots
function screen(title, sub = '', busy = false) {
  screenEl.dataset.mode = 'msg';
  screenEl.classList.toggle('is-busy', busy);
  screenTitle.textContent = title;
  screenSub.textContent = sub;
}

function dropCandy(i) {
  const candy = document.createElement('span');
  candy.className = 'cd-candy';
  candy.style.setProperty('--c', CANDY_COLOURS[(i + Math.floor(Math.random() * 6)) % CANDY_COLOURS.length]);
  candyLayer.appendChild(candy);
  const rest = [
    BOWL.x0 + Math.random() * (BOWL.x1 - BOWL.x0),
    BOWL.y0 + Math.random() * (BOWL.y1 - BOWL.y0)
  ];
  place(candy, CANDY_PATH[0]);
  play(candy, timeline(smooth(CANDY_PATH.concat([rest]), 4), CANDY_SPEED));
}

function reset() {
  candyLayer.textContent = '';
  idleDie();
  snapTo(DISH);
  setBallLook(depthScale(DISH[1]));
  setState('idle');
  screen('Ready', 'Place the marble on START');
  cue('1', 'Drag the marble onto START', 'Pick it up from the dish.');
  setStatus('Drag the blue marble from its dish onto the START gate.');
}
againBtn.addEventListener('click', reset);
cueAgain.addEventListener('click', reset);

/* ---------- camera + hand tracking ---------- */

let stream = null;
let tracker = null;
let loopId = 0;
let lastVideoTime = -1;
let history = [];

camBtn.addEventListener('click', () => (camOn ? stopCamera() : startCamera()));

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus('This browser cannot use a camera here. Swipe across the machine or use the button instead.');
    return;
  }
  camBtn.disabled = true;
  camBtn.textContent = 'Asking for camera…';
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
  } catch (err) {
    camBtn.disabled = false;
    camBtn.textContent = 'Turn on camera';
    setStatus('No camera access, no problem: swipe right to left across the machine, or use the button.');
    return;
  }
  video.srcObject = stream;
  await video.play().catch(() => {});
  camOn = true;
  camView.hidden = false;
  camBtn.disabled = false;
  camBtn.textContent = 'Turn off camera';
  camLabel.textContent = 'Loading hand tracking…';
  if (state === 'armed') {
    armedCue();
    setStatus('The marble is on START. Now swipe your hand from right to left.');
  }
  await loadTracker();
}

function stopCamera() {
  camOn = false;
  cancelAnimationFrame(loopId);
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null;
  video.srcObject = null;
  camView.hidden = true;
  handDot.hidden = true;
  history = [];
  camBtn.textContent = 'Turn on camera';
  if (state === 'armed') armedCue();
}

async function loadTracker() {
  if (!tracker) {
    try {
      const vision = await import(`${HAND_LIB}/vision_bundle.mjs`);
      const files = await vision.FilesetResolver.forVisionTasks(`${HAND_LIB}/wasm`);
      const make = (delegate) => vision.HandLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate },
        runningMode: 'VIDEO',
        numHands: 1
      });
      tracker = await make('GPU').catch(() => make('CPU'));
    } catch (err) {
      camLabel.textContent = 'Hand tracking could not load';
      setStatus('Hand tracking could not load on this connection. Swipe across the machine or use the button instead.');
      return;
    }
  }
  if (camOn) loop();
}

function loop() {
  if (!camOn) return;
  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const result = tracker.detectForVideo(video, performance.now());
    onHands(result);
  }
  loopId = requestAnimationFrame(loop);
}

function onHands(result) {
  const hand = result && result.landmarks && result.landmarks[0];
  if (!hand) {
    handDot.hidden = true;
    history = [];
    camLabel.textContent = state === 'armed' ? 'Show your open hand to the camera' : 'Hand tracking ready';
    return;
  }
  // Palm centre (middle-finger knuckle), mirrored so it matches the preview
  const x = 1 - hand[9].x;
  const y = hand[9].y;
  handDot.hidden = false;
  handDot.style.left = `${x * 100}%`;
  handDot.style.top = `${y * 100}%`;
  camLabel.textContent = state === 'armed' ? 'Hand found: swipe right to left!' : 'Hand found';

  const now = performance.now();
  history.push({ t: now, x });
  history = history.filter(h => now - h.t < SWIPE_WINDOW_MS);
  if (state !== 'armed') return;

  // Swipe = the hand has moved far enough left from its rightmost point in the last moment
  let peak = history[0];
  history.forEach(h => { if (h.x > peak.x) peak = h; });
  if (peak !== history[history.length - 1] && peak.x - x > SWIPE_DISTANCE) {
    history = [];
    trySwipe();
  }
}

/* ---------- debug overlay (?debug) ---------- */

if (params.has('debug')) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'cd-debug');
  svg.setAttribute('viewBox', `0 0 ${VIEW_W} ${VIEW_H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const line = (pts, colour) => {
    const p = document.createElementNS(svgNS, 'polyline');
    p.setAttribute('points', pts.map(q => `${q[0]},${q[1]}`).join(' '));
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', colour);
    p.setAttribute('stroke-width', '1.5');
    svg.appendChild(p);
  };
  line(MARBLE_ROUTE.pts, '#ff2d55');
  line(smooth(CANDY_PATH), '#00b894');
  stage.appendChild(svg);
}

/* ---------- embedded in another page (?embed): report height so the frame fits ---------- */

if (params.has('embed') && window.parent !== window) {
  let lastHeight = 0;
  const report = () => {
    // The content itself (scrollHeight never drops below the frame's current height, so it could only grow)
    const height = Math.ceil(document.querySelector('.cd-main').getBoundingClientRect().bottom + window.scrollY);
    if (height === lastHeight) return;
    lastHeight = height;
    window.parent.postMessage({ type: 'cooldice:height', height }, location.origin);
  };
  new ResizeObserver(report).observe(document.querySelector('.cd-main'));
  window.addEventListener('load', report);
}

/* ---------- start ---------- */

place(dish, DISH);
place(startRing, START);
reset();

import { createWalkingCutout } from './WalkingCutout.js?v=41';

/**
 * Default travel stamp configuration from placement.json
 * Coordinates based on a 1000 x 1200 right-page paper canvas.
 */
export const DEFAULT_TRAVEL_STAMPS = [
  {
    id: 'ooty',
    name: 'Ooty',
    src: 'assets/ooty.png',
    alt: 'Ooty travel stamp with toy train and Nilgiri tea hills',
    cx: 780,
    cy: 260,
    width: 330,
    rotation: -7
  },
  {
    id: 'chikkamagaluru',
    name: 'Chikkamagaluru',
    src: 'assets/chikkamagaluru.png',
    alt: 'Chikkamagaluru travel stamp with coffee plantation and rolling hills',
    cx: 830,
    cy: 550,
    width: 330,
    rotation: 5
  },
  {
    id: 'coorg',
    name: 'Coorg',
    src: 'assets/coorg.png',
    alt: 'Coorg travel stamp with waterfalls and coffee berries',
    cx: 790,
    cy: 880,
    width: 330,
    rotation: -6
  },
  {
    id: 'kodaikanal',
    name: 'Kodaikanal',
    src: 'assets/kodaikanal.png',
    alt: 'Kodaikanal travel stamp with misty lake, boat, and pine trees',
    cx: 460,
    cy: 990,
    width: 330,
    rotation: 7
  }
];

export const DEFAULT_HOBBY_POSITIONS = {
  badminton: { cx: 100, cy: 210, rotation: -3 },
  flute: { cx: 100, cy: 410, rotation: 2 },
  reading: { cx: 100, cy: 620, rotation: -2 },
  cruiser: { cx: 100, cy: 830, rotation: 3 }
};

export const DEFAULT_MOBILE_TRAVEL_STAMPS = [
  {
    id: 'ooty',
    name: 'Ooty',
    src: 'assets/ooty.png',
    alt: 'Ooty travel stamp with toy train and Nilgiri tea hills',
    cx: 810,
    cy: 230,
    width: 260,
    rotation: -6
  },
  {
    id: 'chikkamagaluru',
    name: 'Chikkamagaluru',
    src: 'assets/chikkamagaluru.png',
    alt: 'Chikkamagaluru travel stamp with coffee plantation and rolling hills',
    cx: 810,
    cy: 480,
    width: 260,
    rotation: 5
  },
  {
    id: 'coorg',
    name: 'Coorg',
    src: 'assets/coorg.png',
    alt: 'Coorg travel stamp with waterfalls and coffee berries',
    cx: 730,
    cy: 740,
    width: 260,
    rotation: -5
  },
  {
    id: 'kodaikanal',
    name: 'Kodaikanal',
    src: 'assets/kodaikanal.png',
    alt: 'Kodaikanal travel stamp with misty lake, boat, and pine trees',
    cx: 460,
    cy: 960,
    width: 260,
    rotation: 6
  }
];

export const DEFAULT_MOBILE_HOBBY_POSITIONS = {
  badminton: { cx: 95, cy: 220, rotation: -3 },
  flute: { cx: 95, cy: 400, rotation: 2 },
  reading: { cx: 95, cy: 590, rotation: -2 },
  cruiser: { cx: 100, cy: 780, rotation: 3 }
};

const STAMP_OFFSETS = {
  ooty: { exit: { ox: 30, oy: 105 } },
  chikkamagaluru: { enter: { ox: -4, oy: -100 }, exit: { ox: 20, oy: 100 } },
  coorg: { enter: { ox: 12, oy: -105 }, exit: { ox: -160, oy: 5 } },
  kodaikanal: { enter: { ox: 85, oy: -105 } }
};

const STAMPS_STORAGE_KEY = 'rushabh_travel_stamps_kit_v2';
const HOBBIES_STORAGE_KEY = 'rushabh_hobbies_stickers_v2';
const MOBILE_STAMPS_STORAGE_KEY = 'rushabh_mobile_stamps_v2';
const MOBILE_HOBBIES_STORAGE_KEY = 'rushabh_mobile_hobbies_v2';

function getRotatedPoint(cx, cy, ox, oy, deg = 0) {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: cx + ox * cos - oy * sin,
    y: cy + ox * sin + oy * cos
  };
}

function computeConnectorPaths(positions) {
  const ooty = positions.ooty;
  const chik = positions.chikkamagaluru;
  const coorg = positions.coorg;
  const kodai = positions.kodaikanal;

  // Path 1: Ooty -> Chikkamagaluru
  const p1_exit = getRotatedPoint(ooty.cx, ooty.cy, STAMP_OFFSETS.ooty.exit.ox, STAMP_OFFSETS.ooty.exit.oy, ooty.rotation);
  const p1_enter = getRotatedPoint(chik.cx, chik.cy, STAMP_OFFSETS.chikkamagaluru.enter.ox, STAMP_OFFSETS.chikkamagaluru.enter.oy, chik.rotation);
  const dy1 = p1_enter.y - p1_exit.y;
  const maxX1 = Math.max(p1_exit.x, p1_enter.x);
  const cp1_1 = { x: maxX1 + 75, y: p1_exit.y + dy1 * 0.32 };
  const cp1_2 = { x: maxX1 + 50, y: p1_exit.y + dy1 * 0.68 };
  const d1 = `M${p1_exit.x.toFixed(1)} ${p1_exit.y.toFixed(1)} C${cp1_1.x.toFixed(1)} ${cp1_1.y.toFixed(1)} ${cp1_2.x.toFixed(1)} ${cp1_2.y.toFixed(1)} ${p1_enter.x.toFixed(1)} ${p1_enter.y.toFixed(1)}`;

  // Path 2: Chikkamagaluru -> Coorg
  const p2_exit = getRotatedPoint(chik.cx, chik.cy, STAMP_OFFSETS.chikkamagaluru.exit.ox, STAMP_OFFSETS.chikkamagaluru.exit.oy, chik.rotation);
  const p2_enter = getRotatedPoint(coorg.cx, coorg.cy, STAMP_OFFSETS.coorg.enter.ox, STAMP_OFFSETS.coorg.enter.oy, coorg.rotation);
  const dy2 = p2_enter.y - p2_exit.y;
  const cp2_1 = { x: Math.max(p2_exit.x, p2_enter.x) + 110, y: p2_exit.y + dy2 * 0.52 };
  const cp2_2 = { x: Math.min(p2_exit.x, p2_enter.x) - 65, y: p2_exit.y + dy2 * 0.45 };
  const d2 = `M${p2_exit.x.toFixed(1)} ${p2_exit.y.toFixed(1)} C${cp2_1.x.toFixed(1)} ${cp2_1.y.toFixed(1)} ${cp2_2.x.toFixed(1)} ${cp2_2.y.toFixed(1)} ${p2_enter.x.toFixed(1)} ${p2_enter.y.toFixed(1)}`;

  // Path 3: Coorg -> Kodaikanal
  const p3_exit = getRotatedPoint(coorg.cx, coorg.cy, STAMP_OFFSETS.coorg.exit.ox, STAMP_OFFSETS.coorg.exit.oy, coorg.rotation);
  const p3_enter = getRotatedPoint(kodai.cx, kodai.cy, STAMP_OFFSETS.kodaikanal.enter.ox, STAMP_OFFSETS.kodaikanal.enter.oy, kodai.rotation);
  const dx3 = p3_enter.x - p3_exit.x;
  const minY3 = Math.min(p3_exit.y, p3_enter.y);
  const cp3_1 = { x: p3_exit.x + dx3 * 0.4, y: minY3 - 45 };
  const cp3_2 = { x: p3_exit.x + dx3 * 0.65, y: minY3 - 25 };
  const d3 = `M${p3_exit.x.toFixed(1)} ${p3_exit.y.toFixed(1)} C${cp3_1.x.toFixed(1)} ${cp3_1.y.toFixed(1)} ${cp3_2.x.toFixed(1)} ${cp3_2.y.toFixed(1)} ${p3_enter.x.toFixed(1)} ${p3_enter.y.toFixed(1)}`;

  return [d1, d2, d3];
}

/**
 * RightPage Component
 * Inside spread right page:
 * - Bold clean sans-serif heading "A little more me ."
 * - Slim column near spine with 4 draggable hobby stickers (Badminton, Flute, Reading, Cruiser rides) + labels (~35-45% larger)
 * - Central walking portrait cutout (~45% larger) with yellow starburst
 * - Clean caption beneath portrait: "Main chala pahaadon mein…"
 * - 4 interactive draggable travel stamps: Ooty, Chikkamagaluru, Coorg, Kodaikanal
 * - 3 gentle curved dashed SVG connectors following stamp bounds live
 * - Accessible reset travel stamps & hobbies functionality
 * - Page number "02" and lime next chapter arrow button
 */
export function createRightPage({ rightData, onSelectChapter, onPrevPage }) {
  const page = document.createElement('section');
  page.className = 'page page-right';
  page.id = 'rightPage';
  page.setAttribute('aria-label', 'Personal activities, travel stamps, and next chapter');

  // Usable content canvas representing 1000 x 1200 paper space
  const content = document.createElement('div');
  content.className = 'right-page-content right-page-canvas';
  content.id = 'rightPageContent';

  // 1. Heading in clean bold sans-serif
  const headingBlock = document.createElement('div');
  headingBlock.className = 'right-heading-block';

  const heading = document.createElement('h2');
  heading.className = 'right-sans-title';
  heading.textContent = rightData?.heading || 'A little more me .';
  headingBlock.appendChild(heading);
  content.appendChild(headingBlock);

  // 2. Slim column near spine with 4 draggable hobby stickers + labels (35-45% larger visible artwork)
  const hobbiesContainer = document.createElement('div');
  hobbiesContainer.className = 'hobbies-spine-column';
  hobbiesContainer.setAttribute('aria-label', 'Personal hobbies. Draggable stickers.');

  const hobbiesList = rightData?.hobbies || [
    { id: 'badminton', label: 'Badminton', src: 'assets/sketchbook/sticker-badminton.png', alt: 'Orange blob playing badminton' },
    { id: 'flute', label: 'Flute', src: 'assets/sketchbook/sticker-flute.png', alt: 'Lime blob playing flute' },
    { id: 'reading', label: 'Reading', src: 'assets/sketchbook/sticker-reading.png', alt: 'Orange blob reading open book' },
    { id: 'cruiser', label: 'Cruiser rides', src: 'assets/sketchbook/sticker-cruiser.png', alt: 'Purple blob riding cruiser motorcycle' }
  ];

  const isMobileInitial = typeof window !== 'undefined' && (window.innerWidth < 768 || !!document.querySelector('.book-stage.is-single-page'));
  const activeHobbyStorageKey = isMobileInitial ? MOBILE_HOBBIES_STORAGE_KEY : HOBBIES_STORAGE_KEY;
  const activeDefaultHobbies = isMobileInitial ? DEFAULT_MOBILE_HOBBY_POSITIONS : DEFAULT_HOBBY_POSITIONS;

  const hobbyPositions = {};
  try {
    const saved = localStorage.getItem(activeHobbyStorageKey);
    const parsed = saved ? JSON.parse(saved) : null;
    hobbiesList.forEach(h => {
      const def = activeDefaultHobbies[h.id] || DEFAULT_HOBBY_POSITIONS[h.id];
      const p = parsed && parsed[h.id];
      hobbyPositions[h.id] = {
        cx: p && typeof p.cx === 'number' ? p.cx : def.cx,
        cy: p && typeof p.cy === 'number' ? p.cy : def.cy,
        rotation: def.rotation
      };
    });
  } catch (e) {
    hobbiesList.forEach(h => {
      const def = activeDefaultHobbies[h.id] || DEFAULT_HOBBY_POSITIONS[h.id];
      hobbyPositions[h.id] = { cx: def.cx, cy: def.cy, rotation: def.rotation };
    });
  }

  const hobbyElements = {};

  hobbiesList.forEach(hobby => {
    const item = document.createElement('div');
    item.className = `hobby-draggable-item hobby-item-${hobby.id}`;
    item.dataset.hobbyId = hobby.id;
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `${hobby.label} hobby sticker. Draggable.`);

    const pos = hobbyPositions[hobby.id];
    item.style.left = `${(pos.cx / 1000) * 100}%`;
    item.style.top = `${(pos.cy / 1200) * 100}%`;
    item.style.transform = `translate(-50%, -50%) rotate(${pos.rotation}deg)`;

    const img = document.createElement('img');
    img.className = 'hobby-sticker-img';
    img.src = hobby.src;
    img.alt = hobby.alt;
    img.loading = 'eager';
    img.decoding = 'async';
    img.draggable = false;

    const label = document.createElement('span');
    label.className = 'hobby-sticker-label';
    label.textContent = hobby.label;

    item.appendChild(img);
    item.appendChild(label);
    hobbiesContainer.appendChild(item);
    hobbyElements[hobby.id] = item;

    // Keyboard navigation for hobby stickers
    item.addEventListener('keydown', (e) => {
      let dx = 0;
      let dy = 0;
      const step = e.shiftKey ? 30 : 10;
      switch (e.key) {
        case 'ArrowLeft': dx = -step; break;
        case 'ArrowRight': dx = step; break;
        case 'ArrowUp': dy = -step; break;
        case 'ArrowDown': dy = step; break;
        default: return;
      }
      e.preventDefault();
      const current = hobbyPositions[hobby.id];
      current.cx = Math.max(50, Math.min(950, current.cx + dx));
      current.cy = Math.max(80, Math.min(1150, current.cy + dy));
      item.style.left = `${(current.cx / 1000) * 100}%`;
      item.style.top = `${(current.cy / 1200) * 100}%`;
      saveHobbiesState();
    });
  });

  content.appendChild(hobbiesContainer);

  // Hobby dragging handler
  let activeHobbyDrag = null;

  function onHobbyPointerDown(e) {
    if (e.button !== 0) return;
    const targetHobby = e.target.closest('.hobby-draggable-item');
    if (!targetHobby) return;

    e.preventDefault();
    e.stopPropagation();
    if (window.getSelection) {
      try { window.getSelection().removeAllRanges(); } catch (err) {}
    }

    const hid = targetHobby.dataset.hobbyId;
    const pos = hobbyPositions[hid];
    if (!pos) return;

    const rect = content.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    activeHobbyDrag = {
      hid,
      element: targetHobby,
      pointerId: e.pointerId,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      initCx: pos.cx,
      initCy: pos.cy,
      rotation: pos.rotation,
      rectWidth: rect.width,
      rectHeight: rect.height,
      hasMoved: false
    };

    targetHobby.setPointerCapture(e.pointerId);
    targetHobby.classList.add('is-dragging');
    targetHobby.style.transform = `translate(-50%, -50%) rotate(${pos.rotation}deg) scale(1.08)`;
  }

  function onHobbyPointerMove(e) {
    if (!activeHobbyDrag || e.pointerId !== activeHobbyDrag.pointerId) return;
    const dxPx = e.clientX - activeHobbyDrag.startPointerX;
    const dyPx = e.clientY - activeHobbyDrag.startPointerY;

    if (!activeHobbyDrag.hasMoved && Math.hypot(dxPx, dyPx) < 4) return;
    activeHobbyDrag.hasMoved = true;

    const dxUnits = dxPx * (1000 / activeHobbyDrag.rectWidth);
    const dyUnits = dyPx * (1200 / activeHobbyDrag.rectHeight);

    let newCx = activeHobbyDrag.initCx + dxUnits;
    let newCy = activeHobbyDrag.initCy + dyUnits;

    newCx = Math.max(50, Math.min(950, newCx));
    newCy = Math.max(80, Math.min(1150, newCy));

    const pos = hobbyPositions[activeHobbyDrag.hid];
    pos.cx = newCx;
    pos.cy = newCy;

    activeHobbyDrag.element.style.left = `${(newCx / 1000) * 100}%`;
    activeHobbyDrag.element.style.top = `${(newCy / 1200) * 100}%`;
  }

  function onHobbyPointerUp(e) {
    if (!activeHobbyDrag || e.pointerId !== activeHobbyDrag.pointerId) return;
    const { element, pointerId, rotation } = activeHobbyDrag;
    try {
      element.releasePointerCapture(pointerId);
    } catch (err) {}

    element.classList.remove('is-dragging');
    element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    activeHobbyDrag = null;
    saveHobbiesState();
  }

  function saveHobbiesState() {
    try {
      const isMob = typeof window !== 'undefined' && (window.innerWidth < 768 || !!document.querySelector('.book-stage.is-single-page'));
      localStorage.setItem(isMob ? MOBILE_HOBBIES_STORAGE_KEY : HOBBIES_STORAGE_KEY, JSON.stringify(hobbyPositions));
    } catch (e) {}
  }

  hobbiesContainer.addEventListener('pointerdown', onHobbyPointerDown);
  window.addEventListener('pointermove', onHobbyPointerMove);
  window.addEventListener('pointerup', onHobbyPointerUp);
  window.addEventListener('pointercancel', onHobbyPointerUp);

  // 3. Central Walking Cutout & Caption (Enlarged by ~45%)
  const walkingWrapper = document.createElement('div');
  walkingWrapper.className = 'walking-portrait-wrapper';
  walkingWrapper.id = 'walkingPortraitWrapper';

  const walking = createWalkingCutout({ alt: rightData?.walkingCutout?.alt });
  walkingWrapper.appendChild(walking.element);

  const caption = document.createElement('p');
  caption.className = 'portrait-travel-caption';
  caption.textContent = rightData?.portraitCaption || 'Main chala pahaadon mein…';
  walkingWrapper.appendChild(caption);

  content.appendChild(walkingWrapper);

  // 4. Dashed Travel Connectors SVG (3 gentle curves)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'travel-trail-svg');
  svg.setAttribute('viewBox', '0 0 1000 1200');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('stroke', '#23396A');
  g.setAttribute('stroke-opacity', '0.55');
  g.setAttribute('stroke-width', '1.5');
  g.setAttribute('stroke-dasharray', '4 6');
  g.setAttribute('stroke-linecap', 'round');

  const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path1.setAttribute('vector-effect', 'non-scaling-stroke');
  path1.id = 'connectorOotyToChik';

  const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path2.setAttribute('vector-effect', 'non-scaling-stroke');
  path2.id = 'connectorChikToCoorg';

  const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path3.setAttribute('vector-effect', 'non-scaling-stroke');
  path3.id = 'connectorCoorgToKodai';

  g.appendChild(path1);
  g.appendChild(path2);
  g.appendChild(path3);
  svg.appendChild(g);
  content.appendChild(svg);

  // 5. Travel Stamps setup & state
  const isMobileStamps = typeof window !== 'undefined' && (window.innerWidth < 768 || !!document.querySelector('.book-stage.is-single-page'));
  const activeStampStorageKey = isMobileStamps ? MOBILE_STAMPS_STORAGE_KEY : STAMPS_STORAGE_KEY;
  const stampConfig = isMobileStamps ? DEFAULT_MOBILE_TRAVEL_STAMPS : (rightData?.stamps || DEFAULT_TRAVEL_STAMPS);
  const stampPositions = {};

  try {
    const savedRaw = localStorage.getItem(activeStampStorageKey);
    const saved = savedRaw ? JSON.parse(savedRaw) : null;
    stampConfig.forEach(s => {
      const sp = saved && saved[s.id];
      stampPositions[s.id] = {
        cx: sp && typeof sp.cx === 'number' ? sp.cx : s.cx,
        cy: sp && typeof sp.cy === 'number' ? sp.cy : s.cy,
        rotation: s.rotation,
        width: s.width
      };
    });
  } catch (e) {
    stampConfig.forEach(s => {
      stampPositions[s.id] = { cx: s.cx, cy: s.cy, rotation: s.rotation, width: s.width };
    });
  }

  function updateSvgConnectors() {
    const [d1, d2, d3] = computeConnectorPaths(stampPositions);
    path1.setAttribute('d', d1);
    path2.setAttribute('d', d2);
    path3.setAttribute('d', d3);
  }

  updateSvgConnectors();

  const stampsCollection = document.createElement('div');
  stampsCollection.className = 'travel-stamps-collection';
  content.appendChild(stampsCollection);

  const stampElements = {};

  stampConfig.forEach(s => {
    const wrap = document.createElement('div');
    wrap.className = 'travel-stamp-item';
    wrap.dataset.stampId = s.id;
    wrap.id = `travelStamp_${s.id}`;
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', `${s.name} travel stamp, draggable. Use arrow keys to move.`);

    const pos = stampPositions[s.id];
    wrap.style.left = `${(pos.cx / 1000) * 100}%`;
    wrap.style.top = `${(pos.cy / 1200) * 100}%`;
    wrap.style.transform = `translate(-50%, -50%) rotate(${pos.rotation}deg)`;

    const img = document.createElement('img');
    img.className = 'travel-stamp-img';
    img.src = s.src;
    img.alt = s.alt;
    img.loading = 'eager';
    img.decoding = 'async';
    img.draggable = false;

    wrap.appendChild(img);
    stampsCollection.appendChild(wrap);
    stampElements[s.id] = wrap;

    wrap.addEventListener('keydown', (e) => {
      let dx = 0;
      let dy = 0;
      const step = e.shiftKey ? 30 : 10;
      switch (e.key) {
        case 'ArrowLeft': dx = -step; break;
        case 'ArrowRight': dx = step; break;
        case 'ArrowUp': dy = -step; break;
        case 'ArrowDown': dy = step; break;
        default: return;
      }
      e.preventDefault();
      const current = stampPositions[s.id];
      current.cx = Math.max(165, Math.min(985, current.cx + dx));
      current.cy = Math.max(115, Math.min(1180, current.cy + dy));
      wrap.style.left = `${(current.cx / 1000) * 100}%`;
      wrap.style.top = `${(current.cy / 1200) * 100}%`;
      updateSvgConnectors();
      saveStampsState();
    });
  });

  // Pointer drag handling for stamps
  let activeDrag = null;

  function onStampPointerDown(e) {
    if (e.button !== 0) return;
    const targetStamp = e.target.closest('.travel-stamp-item');
    if (!targetStamp) return;

    e.preventDefault();
    e.stopPropagation();
    if (window.getSelection) {
      try { window.getSelection().removeAllRanges(); } catch (err) {}
    }

    const stampId = targetStamp.dataset.stampId;
    const pos = stampPositions[stampId];
    if (!pos) return;

    const rect = content.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    activeDrag = {
      stampId,
      element: targetStamp,
      pointerId: e.pointerId,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      initCx: pos.cx,
      initCy: pos.cy,
      rotation: pos.rotation,
      rectWidth: rect.width,
      rectHeight: rect.height,
      hasMoved: false
    };

    targetStamp.setPointerCapture(e.pointerId);
    targetStamp.classList.add('is-dragging');
    targetStamp.style.transform = `translate(-50%, -50%) rotate(${pos.rotation}deg) scale(1.05)`;
  }

  function onStampPointerMove(e) {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    const dxPx = e.clientX - activeDrag.startPointerX;
    const dyPx = e.clientY - activeDrag.startPointerY;

    if (!activeDrag.hasMoved && Math.hypot(dxPx, dyPx) < 4) return;
    activeDrag.hasMoved = true;

    const dxUnits = dxPx * (1000 / activeDrag.rectWidth);
    const dyUnits = dyPx * (1200 / activeDrag.rectHeight);

    let newCx = activeDrag.initCx + dxUnits;
    let newCy = activeDrag.initCy + dyUnits;

    newCx = Math.max(165, Math.min(985, newCx));
    newCy = Math.max(115, Math.min(1180, newCy));

    const pos = stampPositions[activeDrag.stampId];
    pos.cx = newCx;
    pos.cy = newCy;

    activeDrag.element.style.left = `${(newCx / 1000) * 100}%`;
    activeDrag.element.style.top = `${(newCy / 1200) * 100}%`;
    updateSvgConnectors();
  }

  function onStampPointerUp(e) {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    const { element, pointerId, rotation } = activeDrag;
    try {
      element.releasePointerCapture(pointerId);
    } catch (err) {}

    element.classList.remove('is-dragging');
    element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    activeDrag = null;
    saveStampsState();
  }

  function saveStampsState() {
    try {
      const isMob = typeof window !== 'undefined' && (window.innerWidth < 768 || !!document.querySelector('.book-stage.is-single-page'));
      localStorage.setItem(isMob ? MOBILE_STAMPS_STORAGE_KEY : STAMPS_STORAGE_KEY, JSON.stringify(stampPositions));
    } catch (e) {}
  }

  content.addEventListener('pointerdown', onStampPointerDown);
  window.addEventListener('pointermove', onStampPointerMove);
  window.addEventListener('pointerup', onStampPointerUp);
  window.addEventListener('pointercancel', onStampPointerUp);

  // Reset method for both stamps and hobbies
  function resetStamps() {
    const isMobileNow = typeof window !== 'undefined' && (window.innerWidth < 768 || !!document.querySelector('.book-stage.is-single-page'));
    const targetStamps = isMobileNow ? DEFAULT_MOBILE_TRAVEL_STAMPS : DEFAULT_TRAVEL_STAMPS;
    const targetHobbies = isMobileNow ? DEFAULT_MOBILE_HOBBY_POSITIONS : DEFAULT_HOBBY_POSITIONS;

    // 1. Reset travel stamps
    targetStamps.forEach(s => {
      const pos = stampPositions[s.id];
      if (pos) {
        pos.cx = s.cx;
        pos.cy = s.cy;
        pos.rotation = s.rotation;
      }

      const el = stampElements[s.id];
      if (el) {
        el.style.transition = 'left 0.45s cubic-bezier(0.16, 1, 0.3, 1), top 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s ease';
        el.style.left = `${(s.cx / 1000) * 100}%`;
        el.style.top = `${(s.cy / 1200) * 100}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${s.rotation}deg)`;
        setTimeout(() => { el.style.transition = ''; }, 480);
      }
    });

    // 2. Reset hobbies
    hobbiesList.forEach(h => {
      const def = targetHobbies[h.id] || DEFAULT_HOBBY_POSITIONS[h.id];
      const pos = hobbyPositions[h.id];
      if (pos) {
        pos.cx = def.cx;
        pos.cy = def.cy;
      }

      const el = hobbyElements[h.id];
      if (el) {
        el.style.transition = 'left 0.45s cubic-bezier(0.16, 1, 0.3, 1), top 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s ease';
        el.style.left = `${(def.cx / 1000) * 100}%`;
        el.style.top = `${(def.cy / 1200) * 100}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${def.rotation}deg)`;
        setTimeout(() => { el.style.transition = ''; }, 480);
      }
    });

    try {
      localStorage.removeItem(STAMPS_STORAGE_KEY);
      localStorage.removeItem(HOBBIES_STORAGE_KEY);
      localStorage.removeItem(MOBILE_STAMPS_STORAGE_KEY);
      localStorage.removeItem(MOBILE_HOBBIES_STORAGE_KEY);
    } catch (e) {}

    let startTime = null;
    function animateConnectors(time) {
      if (!startTime) startTime = time;
      updateSvgConnectors();
      if (time - startTime < 480) {
        requestAnimationFrame(animateConnectors);
      } else {
        updateSvgConnectors();
      }
    }
    requestAnimationFrame(animateConnectors);
  }

  // Previous page button for single-page mode
  const singlePrevBtn = document.createElement('button');
  singlePrevBtn.type = 'button';
  singlePrevBtn.className = 'single-page-prev-btn';
  singlePrevBtn.id = 'singlePagePrevBtn';
  singlePrevBtn.setAttribute('aria-label', 'Return to Page 1: Introduction');

  const prevSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  prevSvg.setAttribute('viewBox', '0 0 16 16');
  prevSvg.setAttribute('fill', 'none');
  prevSvg.setAttribute('stroke', 'currentColor');
  prevSvg.setAttribute('stroke-width', '2');
  prevSvg.setAttribute('stroke-linecap', 'round');
  prevSvg.setAttribute('stroke-linejoin', 'round');
  prevSvg.setAttribute('aria-hidden', 'true');

  const prevPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  prevPath.setAttribute('d', 'M10 12l-4-4 4-4');
  prevSvg.appendChild(prevPath);

  const prevLabel = document.createElement('span');
  prevLabel.textContent = 'Intro';

  singlePrevBtn.appendChild(prevSvg);
  singlePrevBtn.appendChild(prevLabel);
  singlePrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof onPrevPage === 'function') {
      onPrevPage();
    }
  });
  content.appendChild(singlePrevBtn);

  page.appendChild(content);

  // 6. Page number "02"
  const pageNum = document.createElement('span');
  pageNum.className = 'page-number page-number-right';
  pageNum.textContent = rightData?.pageNumber || '02';
  pageNum.setAttribute('aria-hidden', 'true');
  page.appendChild(pageNum);

  // 7. Lime next chapter arrow button
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'next-chapter-btn';
  nextBtn.id = 'nextChapterBtn';
  nextBtn.setAttribute('aria-label', 'Next chapter: Works');
  nextBtn.dataset.chapter = 'Works';

  const nextSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  nextSvg.setAttribute('class', 'next-arrow-svg');
  nextSvg.setAttribute('viewBox', '0 0 24 24');
  nextSvg.setAttribute('fill', 'none');
  nextSvg.setAttribute('aria-hidden', 'true');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '11');
  circle.setAttribute('fill', '#bdff00');

  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrow.setAttribute('d', 'M10 8L15 12L10 16');
  arrow.setAttribute('stroke', '#080807');
  arrow.setAttribute('stroke-width', '2.2');
  arrow.setAttribute('stroke-linecap', 'round');
  arrow.setAttribute('stroke-linejoin', 'round');

  nextSvg.appendChild(circle);
  nextSvg.appendChild(arrow);
  nextBtn.appendChild(nextSvg);

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof onSelectChapter === 'function') {
      onSelectChapter('Works', nextBtn);
    }
  });

  page.appendChild(nextBtn);

  // 8. Cast shadow layer during cover rotation
  const castShadow = document.createElement('div');
  castShadow.className = 'cover-cast-shadow';
  castShadow.id = 'coverCastShadow';
  castShadow.setAttribute('aria-hidden', 'true');
  page.appendChild(castShadow);

  return {
    element: page,
    walkingCutout: walking,
    nextButton: nextBtn,
    resetStamps,
    updateSvgConnectors
  };
}

/* Munshiji · live phones in the case-study screens.
 *
 * Same idea as the Sajag case study: the documentation shows each flow as annotated pictures of the phone. This script finds
 * those pictures and lays a live phone over each phone screen, at the exact spot, so the screen you see is the real Munshiji
 * prototype playing the step that screen stands for: a touch point moves, taps, types or drags, and a short caption says what it does.
 *
 * Nothing in the pictures is changed. Without JavaScript, or for anyone who prefers reduced motion, the pictures stay as they were.
 * The app is /projects/munshiji/demo/ (the same prototype as the live demo, with a small driver that is only active with ?docs=1).
 *
 * Each phone: { rect:[x,y,w,h] of the phone SCREEN in the picture's own pixels, ops:[...] }
 *   ops: boot{to} · ready (everything before it runs instantly, behind a loading cover) · wait{ms}
 *        tap · press · type · drag · release · say · spot · tip · clear · scroll · waitFor   (see demo/docs-agent.js)
 */
(() => {
  const APP = '/projects/munshiji/demo/index.html?docs=1';
  const IMG_W = 2276;     // width of the section pictures
  const APP_W = 390;      // css width the prototype is laid out at
  /* where each phone's caption sits: a free patch of white next to it, found by looking at the picture (picture pixels) */
  const CAPS = {"gyro":{"dir":"above","x":1010,"y":3396,"w":520,"h":130},"home":{"dir":"below","x":863,"y":2294,"w":653,"h":130},"gullak-start":{"dir":"above","x":504,"y":3350,"w":560,"h":130},"gullak-drop":{"dir":"above","x":1314,"y":3348,"w":560,"h":130},"amount":{"dir":"above","x":514,"y":4625,"w":560,"h":130},"celebrate":{"dir":"below","x":1238,"y":5862,"w":560,"h":130},"learn-path":{"dir":"below","x":384,"y":1177,"w":560,"h":130},"learn-sort":{"dir":"below","x":1144,"y":1322,"w":560,"h":130},"goals-start":{"dir":"below","x":545,"y":1093,"w":560,"h":130},"goals-create":{"dir":"below","x":1483,"y":1341,"w":560,"h":130},"radio-listen":{"dir":"below","x":530,"y":1166,"w":560,"h":130},"radio-news":{"dir":"below","x":1491,"y":1388,"w":560,"h":130},"portfolio":{"dir":"below","x":550,"y":2105,"w":616,"h":130},"investment":{"dir":"below","x":1440,"y":2323,"w":616,"h":130},"room-left":{"dir":"above","x":407,"y":4201,"w":560,"h":130},"room-center":{"dir":"below","x":900,"y":5159,"w":560,"h":130},"room-right":{"dir":"below","x":1385,"y":5115,"w":560,"h":130},"room-ask":{"dir":"below","x":1159,"y":6495,"w":599,"h":130}};
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ what each phone shows */
  const G = { to: 'gullak' };
  // path that drags the coin into the Gullak (app pixels)
  const COIN = [[195, 188], [195, 300], [195, 470]];
  const JOURNEYS = [
    { img: '16_personality_companion', h: 7100, phones: [
      { id: 'home', label: 'Home', rect: [959, 1243, 452, 1003], ops: [
        { op: 'boot', to: 'home' }, { op: 'ready' }, { op: 'wait', ms: 700 },
        { op: 'spot', text: 'Your Gullak', pad: 6 }, { op: 'tip', text: 'Balance and streak keep progress visible.', y: 70 }, { op: 'wait', ms: 2400 }, { op: 'clear' },
        { op: 'spot', text: 'Add savings', pad: 6 }, { op: 'tip', text: 'Start a saving ritual: tap to begin a deposit.', y: 70 }, { op: 'wait', ms: 2400 }, { op: 'clear' },
        { op: 'spot', text: 'The magic of compounding', pad: 6 }, { op: 'tip', text: 'Continue your lesson: see your progress and tap to listen.', y: 70 }, { op: 'wait', ms: 2400 }, { op: 'clear' },
        { op: 'spot', text: 'Enter room', pad: 6 }, { op: 'tip', text: 'Visit Munshiji: enter his room and explore by swipe or tilt.', y: 70 }, { op: 'wait', ms: 2400 }, { op: 'clear' },
      ] },
      { id: 'gullak-start', label: 'Drag the coin', rect: [611, 3506, 346, 714], ops: [
        { op: 'boot', to: 'gullak' }, { op: 'ready' }, { op: 'wait', ms: 700 },
        { op: 'tip', text: 'Drag the coin into your Gullak.', y: 80 }, { op: 'wait', ms: 1800 },
        { op: 'drag', path: COIN, ms: 1500 }, { op: 'clear' }, { op: 'wait', ms: 1800 },
      ] },
      { id: 'gullak-drop', label: 'Coin enters the slot', rect: [1421, 3504, 346, 714], ops: [
        { op: 'boot', to: 'gullak' }, { op: 'ready' }, { op: 'wait', ms: 900 },
        { op: 'tip', text: 'The coin snaps into the slot, the elephant shakes and smiles.', y: 80 }, { op: 'wait', ms: 1600 },
        { op: 'drag', path: COIN, ms: 1100, hold: 500 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
      ] },
      { id: 'amount', label: 'Choose your amount', rect: [592, 4781, 404, 834], ops: [
        { op: 'boot', to: 'gullak' }, { op: 'drag', path: COIN, fast: 1 }, { op: 'wait', ms: 2200 }, { op: 'ready' }, { op: 'wait', ms: 500 },
        { op: 'spot', text: '₹10', exact: true, pad: 4 }, { op: 'tip', text: 'An amount that suits you: choose a preset or enter your own.', y: 70 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: '₹10', exact: true }, { op: 'wait', ms: 500 },
        { op: 'spot', text: 'Your current savings', pad: 6 }, { op: 'tip', text: 'Your balance, in view, before adding more.', y: 70 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: 'Continue' }, { op: 'wait', ms: 1500 },
      ] },
      { id: 'celebrate', label: 'Celebrate your savings', rect: [1316, 4942, 404, 834], ops: [
        { op: 'boot', to: 'gullak' }, { op: 'drag', path: COIN, fast: 1 }, { op: 'wait', ms: 2200 }, { op: 'tap', text: '₹10', exact: true, fast: 1 }, { op: 'wait', ms: 300 },
        { op: 'tap', text: 'Continue', fast: 1 }, { op: 'wait', ms: 1000 }, { op: 'tap', text: 'Pay ₹10', fast: 1 }, { op: 'wait', ms: 4200 }, { op: 'ready' },
        { op: 'tip', text: 'A moment of celebration: each small saving is acknowledged.', y: 70 }, { op: 'wait', ms: 2500 }, { op: 'clear' },
        { op: 'spot', text: 'GULLAK BALANCE', pad: 10 }, { op: 'tip', text: 'An updated balance.', y: 70 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'spot', text: 'Done', pad: 6 }, { op: 'tip', text: 'Choose what comes next: done, or continue learning.', y: 70 }, { op: 'wait', ms: 2400 }, { op: 'clear' },
      ] },
    ] },
    { img: '17_feature_learn', h: 2620, phones: [
      { id: 'learn-path', label: 'Your money journey', rect: [462, 237, 404, 834], ops: [
        { op: 'boot', to: 'learn' }, { op: 'ready' }, { op: 'wait', ms: 600 },
        { op: 'spot', text: 'Your path', pad: 6 }, { op: 'tip', text: 'One small lesson at a time; progress grows as you learn.', y: 70 }, { op: 'wait', ms: 2400 }, { op: 'clear' },
        { op: 'spot', text: 'Emergency fund', pad: 8 }, { op: 'tip', text: 'Tap your next lesson.', y: 70 }, { op: 'wait', ms: 2000 }, { op: 'clear' },
        { op: 'scroll', top: 160 }, { op: 'wait', ms: 700 }, { op: 'scroll', top: 0 }, { op: 'wait', ms: 500 },
        { op: 'tap', text: 'Start emergency fund lesson' }, { op: 'wait', ms: 1800 },
      ] },
      { id: 'learn-sort', label: 'Learn by acting in situations', rect: [1222, 422, 404, 834], ops: [
        { op: 'boot', to: 'learn' }, { op: 'tap', text: 'Start emergency fund lesson', fast: 1 }, { op: 'wait', ms: 700 }, { op: 'tap', text: 'Jump to step 2', fast: 1 }, { op: 'wait', ms: 800 }, { op: 'ready' },
        { op: 'tip', text: 'Sort each expense into the right place: tap a category or drag the card.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'tap', text: 'Plan and save' }, { op: 'wait', ms: 600 },
        { op: 'tip', text: 'Not quite? You get the reason, then try again.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'tap', text: 'Emergency fund', nth: 0 }, { op: 'wait', ms: 1500 },
      ] },
    ] },
    { img: '18_feature_goals', h: 2640, phones: [
      { id: 'goals-start', label: 'Make room for what matters', rect: [623, 193, 404, 834], ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Goals', exact: true, fast: 1 }, { op: 'wait', ms: 900 }, { op: 'ready' }, { op: 'wait', ms: 500 },
        { op: 'spot', text: 'Create a goal', pad: 6 }, { op: 'tip', text: 'Start with what matters: a goal, an amount and a pace that works for you.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'spot', text: 'Set up emergency fund', pad: 6 }, { op: 'tip', text: 'Prepare for the unexpected: a dedicated route to build your emergency fund.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'tap', text: 'Create a goal' }, { op: 'wait', ms: 1400 },
      ] },
      { id: 'goals-create', label: 'Create a goal', rect: [1561, 481, 404, 834], ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Goals', exact: true, fast: 1 }, { op: 'wait', ms: 700 }, { op: 'tap', text: 'Create a goal', fast: 1 }, { op: 'wait', ms: 900 }, { op: 'ready' },
        { op: 'tip', text: 'Select the reason for the goal.', y: 70 }, { op: 'wait', ms: 1800 }, { op: 'clear' },
        { op: 'tap', text: 'Education' }, { op: 'wait', ms: 700 },
        { op: 'tap', text: 'Something else' }, { op: 'wait', ms: 700 },
        { op: 'spot', text: 'Continue', pad: 6 }, { op: 'tip', text: 'Then set the amount and pace; you can change it later.', y: 70 }, { op: 'wait', ms: 2400 }, { op: 'clear' },
      ] },
    ] },
    { img: '19_feature_radio', h: 1640, phones: [
      { id: 'radio-listen', label: 'Listen', rect: [608, 306, 404, 834], ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Radio', exact: true, fast: 1 }, { op: 'wait', ms: 900 }, { op: 'ready' }, { op: 'wait', ms: 500 },
        { op: 'spot', text: 'Play episode', pad: 6 }, { op: 'tip', text: 'Start with one story. A featured episode makes everyday economics approachable.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'tap', text: 'Play episode' }, { op: 'wait', ms: 900 },
        { op: 'tip', text: 'Audio continues in a mini-player as you move through the app.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
      ] },
      { id: 'radio-news', label: 'News', rect: [1569, 528, 404, 834], ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Radio', exact: true, fast: 1 }, { op: 'wait', ms: 700 }, { op: 'tap', text: 'News', exact: true, fast: 1 }, { op: 'wait', ms: 800 }, { op: 'ready' },
        { op: 'tip', text: 'Prefer reading? Go through the articles that explain the whole story in short.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'tap', text: 'India' }, { op: 'wait', ms: 1200 },
      ] },
    ] },
    { img: '20_feature_portfolio_gyroscope', h: 7908, phones: [
      { id: 'portfolio', label: 'Your portfolio', rect: [630, 1103, 456, 976], ops: [
        { op: 'boot', to: 'portfolio' }, { op: 'ready' }, { op: 'wait', ms: 600 },
        { op: 'spot', text: 'Current value', pad: 8 }, { op: 'tip', text: 'Your growth, at a glance: value, amount invested and total gain.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'spot', text: 'Your allocation', pad: 8 }, { op: 'tip', text: 'See how your money is spread across mutual funds, deposits and gold.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'tap', text: 'Index fund' }, { op: 'wait', ms: 1600 },
      ] },
      { id: 'investment', label: 'Investment details', rect: [1520, 1321, 456, 976], ops: [
        { op: 'boot', to: 'portfolio' }, { op: 'tap', text: 'Index fund', fast: 1 }, { op: 'wait', ms: 900 }, { op: 'ready' }, { op: 'wait', ms: 500 },
        { op: 'spot', text: 'Units held', pad: 10 }, { op: 'tip', text: 'Explore the details: how much you own and what it is worth.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'scroll', top: 260 }, { op: 'wait', ms: 600 },
        { op: 'spot', text: 'Invest more', pad: 6 }, { op: 'tip', text: 'Withdraw or invest: add funds to the asset.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
      ] },
      { id: 'gyro', label: 'Tilt to explore', rect: [1040, 3540, 440, 520], gyro: { src: '/assets/projects/munshiji/gyro_hand.png?v=1', box: { cx: 148, cy: 227, w: 190, h: 395, rot: -4 } }, ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Enter room', fast: 1 }, { op: 'wait', ms: 1800 }, { op: 'ready' }, { op: 'wait', ms: 600 },
        { op: 'tip', text: 'Turn the phone to the left: the room slides to show its left side.' },
        { op: 'tiltpan', deg: 24, path: [[110, 420], [330, 420]], ms: 2000 }, { op: 'wait', ms: 900 }, { op: 'clear' },
        { op: 'tip', text: 'Bring it back to the middle and the room settles again.' },
        { op: 'tiltpan', deg: 0, path: [[330, 420], [110, 420]], ms: 1700 }, { op: 'wait', ms: 700 }, { op: 'clear' },
        { op: 'tip', text: 'Turn it to the right: the room slides the other way.' },
        { op: 'tiltpan', deg: -24, path: [[330, 420], [110, 420]], ms: 2000 }, { op: 'wait', ms: 900 }, { op: 'clear' },
        { op: 'tiltpan', deg: 0, path: [[110, 420], [330, 420]], ms: 1700 }, { op: 'wait', ms: 500 },
      ] },
      { id: 'room-left', label: 'Look left', rect: [518, 4357, 338, 721], ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Enter room', fast: 1 }, { op: 'wait', ms: 1600 }, { op: 'drag', path: [[110, 400], [330, 400]], ms: 900, fast: 1 }, { op: 'wait', ms: 800 }, { op: 'ready' },
        { op: 'tip', text: 'Tilt the phone left, or swipe, to see the other side of the room.', y: 70 }, { op: 'wait', ms: 3000 }, { op: 'clear' },
      ] },
      { id: 'room-center', label: 'The room', rect: [989, 4315, 382, 818], ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Enter room', fast: 1 }, { op: 'wait', ms: 1800 }, { op: 'ready' },
        { op: 'tip', text: 'Munshiji’s room: every object opens a feature.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'spot', text: 'Learn', exact: true, pad: 8 }, { op: 'tip', text: 'Discover familiar objects: tap one to preview its feature.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
      ] },
      { id: 'room-right', label: 'Look right', rect: [1494, 4357, 342, 732], ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Enter room', fast: 1 }, { op: 'wait', ms: 1600 }, { op: 'drag', path: [[330, 400], [110, 400]], ms: 900, fast: 1 }, { op: 'wait', ms: 800 }, { op: 'ready' },
        { op: 'tip', text: 'Gently tilt left or right to pan across the room.', y: 70 }, { op: 'wait', ms: 3000 }, { op: 'clear' },
      ] },
      { id: 'room-ask', label: 'Ask Munshiji', rect: [1236, 5519, 444, 950], ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Enter room', fast: 1 }, { op: 'wait', ms: 1800 }, { op: 'ready' }, { op: 'wait', ms: 500 },
        { op: 'spot', text: 'Ask', exact: true, pad: 6 }, { op: 'tip', text: 'Tap and speak, or type about any topic: Munshiji is here to help.', y: 70 }, { op: 'wait', ms: 2400 }, { op: 'clear' },
        { op: 'tap', text: 'Ask', exact: true }, { op: 'wait', ms: 700 },
        { op: 'say', text: 'What is the difference between needs and wants?' }, { op: 'wait', ms: 500 },
        { op: 'tap', text: 'Send', opt: 1 }, { op: 'wait', ms: 3800 },
        { op: 'tip', text: 'Get your doubts clarified: help in voice and text, based on answers.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
      ] },
    ] },
  ];

  /* ------------------------------------------------------------------ one live phone */
  const PHONES = [];
  addEventListener('message', (e) => {
    const m = e.data; if (!m || m.sj !== 1) return;
    const p = PHONES.find((x) => (x.next && x.next.contentWindow === e.source) || (x.frame && x.frame.contentWindow === e.source));
    if (p) p.onMessage(m, e.source);
  });

  /* on small screens the captions have no room beside the pictures: they use one slim bar at the bottom of the screen instead */
  const NARROW = matchMedia('(max-width: 760px)');
  let bar = null;
  function barEl() {
    if (!bar) { bar = document.createElement('div'); bar.className = 'mj-bar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<p></p>'; document.body.appendChild(bar); }
    return bar;
  }

  class LivePhone {
    constructor(layer, def, imgH) {
      this.def = def; this.ratio = 0; this.token = 0; this.live = false; this.tryMode = false; this.msgId = 0; this.pending = new Map(); this.readyRes = null;
      this.frame = null; this.next = null; PHONES.push(this);
      const [x, y, w, h] = def.rect;
      const gy = this.gy = def.gyro || null;
      this.hc = gy ? Math.round(APP_W * gy.box.h / gy.box.w) : Math.round(APP_W * h / w); // the app's height, in css pixels, for this screen
      const el = this.el = document.createElement('div'); el.className = 'mj-phone mj-idle'; el.dataset.id = def.id;
      Object.assign(el.style, { left: (x / IMG_W * 100) + '%', top: (y / imgH * 100) + '%', width: (w / IMG_W * 100) + '%', height: (h / imgH * 100) + '%' });
      const scr = '<div class="mj-screen"><div class="mj-scale" style="height:' + this.hc + 'px"><div class="mj-load"><div class="mj-spin"></div></div></div></div>';
      el.innerHTML = (gy ? '<div class="mj-gbg"></div><div class="mj-gstage"><div class="mj-gscreen" style="left:' + ((gy.box.cx - gy.box.w / 2) / w * 100) + '%;top:' + ((gy.box.cy - gy.box.h / 2) / h * 100) + '%;width:' + (gy.box.w / w * 100) + '%;height:' + (gy.box.h / h * 100) + '%;transform:rotate(' + gy.box.rot + 'deg)">' + scr + '</div><img class="mj-ghand" alt="" src="' + gy.src + '"></div>' : scr) +
        '<div class="mj-ctl" role="group" aria-label="' + def.label + ': playback">' +
        '<button class="mj-rep" aria-label="Replay"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg><span>Replay</span></button>' +
        '<button class="mj-try" aria-pressed="false" aria-label="Take over and try it"><svg viewBox="0 0 24 24"><path d="M9 11V5a2 2 0 0 1 4 0v5l5 1a2 2 0 0 1 1.6 2.4L18.5 19a3 3 0 0 1-3 2H11a3 3 0 0 1-2.4-1.2L5 15.5a1.8 1.8 0 0 1 2.8-2.2L9 14.5"/></svg><span>Try it</span></button>' +
        '</div>';
      layer.appendChild(el);
      // the caption: a small card in the free white space beside the phone, so it never covers the screen
      const c = CAPS[def.id];
      if (c) {
        const cap = this.cap = document.createElement('div'); cap.className = 'mj-cap mj-cap-' + c.dir; cap.setAttribute('aria-hidden', 'true');
        cap.innerHTML = '<i></i><p></p>';
        Object.assign(cap.style, { left: (c.x / IMG_W * 100) + '%', width: (c.w / IMG_W * 100) + '%' });
        if (c.dir === 'above') cap.style.bottom = ((imgH - (c.y + c.h)) / imgH * 100) + '%'; else cap.style.top = (c.y / imgH * 100) + '%';
        layer.appendChild(cap); this.capText = cap.querySelector('p');
      }
      if (gy) el.classList.add('mj-gyro');
      this.stage = el.querySelector('.mj-gstage');
      this.screen = el.querySelector('.mj-screen');
      this.scaleEl = el.querySelector('.mj-scale'); this.load = el.querySelector('.mj-load');
      new ResizeObserver(() => this.fit()).observe(this.screen); this.fit();
      el.addEventListener('click', (e) => { if (e.target.closest('.mj-ctl')) return; el.classList.add('mj-show'); clearTimeout(this.showT); this.showT = setTimeout(() => el.classList.remove('mj-show'), 3200); });
      el.querySelector('.mj-rep').addEventListener('click', () => { this.setTry(false); SCHED.playNow(this); });
      el.querySelector('.mj-try').addEventListener('click', () => { const on = !this.tryMode; if (on) SCHED.takeOver(this); else { this.setTry(false); this.stop(); } });
      if (REDUCED) { el.remove(); if (this.cap) this.cap.remove(); return; } // reduced motion: leave the pictures exactly as they were
      new IntersectionObserver(([en]) => { this.ratio = en.intersectionRatio; }, { threshold: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1] }).observe(this.screen);
      new IntersectionObserver(([en]) => { if (!en.isIntersecting && (this.live || this.frame)) this.stop(); }, { rootMargin: '90% 0px 90% 0px' }).observe(this.screen);
    }
    fit() { const k = this.screen.clientWidth / APP_W; if (k > 0) this.scaleEl.style.transform = 'scale(' + k + ')'; }
    makeFrame() {
      const f = document.createElement('iframe'); f.className = 'mj-frame'; f.title = 'Munshiji prototype: ' + this.def.label; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
      f.style.height = this.hc + 'px'; f.style.visibility = 'hidden'; this.scaleEl.insertBefore(f, this.load); return f;
    }
    onMessage(m, src) {
      if (m.touch) return;
      if (m.ready) { if (this.next && this.next.contentWindow === src) this.readyRes && this.readyRes(); return; }
      const f = this.pending.get(m.id); if (f) { this.pending.delete(m.id); f(m); }
    }
    /* captions are drawn by the page (next to the phone), everything else is done inside the prototype */
    showCap(text) {
      if (NARROW.matches) { const b = barEl(); b.querySelector('p').textContent = text; b.classList.add('on'); return; }
      if (!this.cap) return; this.capText.textContent = text; this.cap.classList.add('on');
    }
    /* turn the hand and the phone about the vertical axis */
    tilt(deg, ms) {
      const st = this.stage; if (!st) return Promise.resolve({ ok: true });
      st.style.transition = 'transform ' + ms + 'ms cubic-bezier(.45,.05,.3,1)';
      st.style.transform = 'perspective(760px) rotateY(' + deg + 'deg) rotateZ(' + (-deg * 0.12) + 'deg) translateX(' + (deg * 0.5) + 'px)';
      return new Promise((res) => setTimeout(() => res({ ok: true }), ms));
    }
    hideCap() { if (this.cap) this.cap.classList.remove('on'); if (bar) bar.classList.remove('on'); }
    send(op, fast, frame) {
      if (op.op === 'tip') { this.showCap(op.text); return Promise.resolve({ ok: true }); }
      if (op.op === 'tilt') return this.tilt(op.deg, op.ms || 1400);
      if (op.op === 'tiltpan') { // turn the hand and pan the room at the same time
        const drag = this.send({ op: 'drag', path: op.path, ms: op.ms }, fast, frame);
        return Promise.all([this.tilt(op.deg, op.ms || 1400), drag]).then((r) => r[1]);
      }
      if (op.op === 'clear') this.hideCap();
      const target = frame || this.next || this.frame;
      return new Promise((res) => {
        const id = ++this.msgId; const t = setTimeout(() => { this.pending.delete(id); res({ ok: false, err: 'timeout' }); }, 20000);
        this.pending.set(id, (m) => { clearTimeout(t); res(m); });
        try { target.contentWindow.postMessage(Object.assign({ sj: 1, id, fast: !!fast }, op), '*'); } catch (e) { clearTimeout(t); res({ ok: false, err: 'no frame' }); }
      });
    }
    gated() { return this.tryMode || this.ratio < 0.3 || document.hidden; }
    async gate(my) { while (this.gated() && my === this.token) await sleep(150); return my === this.token; }
    /* play the script once, from a clean start; resolves when it has finished and the screen has rested on its last state */
    async runOnce() {
      const my = ++this.token; this.live = true;
      if (this.next) { this.next.remove(); this.next = null; }
      const f = this.next = this.makeFrame();
      const ready = new Promise((r) => { this.readyRes = r; });
      f.src = APP + '&v=' + Date.now();
      await Promise.race([ready, sleep(20000)]); if (my !== this.token) return;
      let shown = false;
      const reveal = async () => {
        if (shown) return; shown = true; await sleep(250); if (my !== this.token) return;
        f.style.visibility = 'visible'; if (this.frame) this.frame.remove(); this.frame = f; this.next = null; this.load.classList.add('off'); this.el.classList.remove('mj-idle');
      };
      const ops = this.def.ops;
      const firstReady = ops.findIndex((o) => o.op === 'ready');
      for (let i = 0; i < ops.length; i++) {
        const o = ops[i]; const fastPhase = firstReady >= 0 && i < firstReady;
        if (o.op === 'ready') { await reveal(); continue; }
        if (!fastPhase && !(await this.gate(my))) return;
        if (my !== this.token) return;
        if (o.op === 'wait') { await sleep(fastPhase ? Math.min(o.ms, 300) : o.ms); continue; }
        const rest = Object.assign({}, o); const fl = rest.fast; delete rest.fast;
        const r = await this.send(rest, fastPhase || !!fl, f);
        if (!r.ok) console.warn('[munshiji-live]', this.def.id, o.op, o.text || o.sel || '', r.err);
      }
      if (firstReady < 0) await reveal();
      await this.send({ op: 'clear' }, false, f).catch(() => {});
      // rest on the end state for a moment
      const t0 = Date.now(); while (Date.now() - t0 < 2600) { if (my !== this.token) return; await sleep(150); }
      if (my === this.token) this.stop();   // hand the stage back to the drawing, so the reader's eye moves to the next phone
    }
    setTry(on) {
      this.tryMode = on; this.el.classList.toggle('mj-try', on); this.el.querySelector('.mj-try').setAttribute('aria-pressed', String(on));
      if (this.frame) { this.frame.tabIndex = on ? 0 : -1; if (on) this.frame.removeAttribute('aria-hidden'); else this.frame.setAttribute('aria-hidden', 'true'); }
      if (on) {
        if (this.stage) { this.stage.style.transition = 'transform .5s ease'; this.stage.style.transform = ''; }
        this.token++; if (this.next) { this.next.remove(); this.next = null; }
        this.hideCap();
        if (this.frame) { this.send({ op: 'clear' }, true, this.frame); this.send({ op: 'hideTouch' }, true, this.frame); this.send({ op: 'unmute' }, true, this.frame); }
      }
    }
    /* stop whatever this phone is doing and show the original picture again */
    stop() {
      if (this.stage) { this.stage.style.transition = 'none'; this.stage.style.transform = ''; }
      this.token++; this.live = false; this.tryMode = false; this.el.classList.remove('mj-try'); this.hideCap();
      [this.frame, this.next].forEach((f) => f && f.remove()); this.frame = this.next = null; this.load.classList.remove('off'); this.el.classList.add('mj-idle');
    }
  }

  /* ------------------------------------------------------------------ one phone at a time
   * Phones play in reading order, one after another, so the eye has a single thing to follow. Only phones that are on screen take part;
   * when everything on screen has played, the round starts again. "Try it" pauses the round until the reader gives the phone back. */
  const SCHED = {
    last: -1, current: null, forced: null, taken: null, started: false,
    start() { if (this.started || REDUCED) return; this.started = true; this.loop(); },
    pickNext() {
      const vis = PHONES.filter((p) => p.ratio >= 0.5 && p.el.isConnected);
      if (!vis.length) return null;
      const order = (p) => PHONES.indexOf(p);
      const after = vis.filter((p) => order(p) > this.last).sort((a, b) => order(a) - order(b));
      return after[0] || vis.sort((a, b) => order(a) - order(b))[0];
    },
    playNow(p) { this.forced = p; if (this.current && this.current !== p) this.current.stop(); },
    takeOver(p) { if (this.taken && this.taken !== p) { this.taken.setTry(false); this.taken.stop(); } this.taken = p; if (this.current && this.current !== p) this.current.stop(); p.setTry(true); },
    async loop() {
      for (;;) {
        await sleep(250);
        if (document.hidden) continue;
        if (this.taken) { if (this.taken.tryMode) continue; this.taken = null; }
        const p = this.forced || this.pickNext(); this.forced = null;
        if (!p) continue;
        this.current = p; this.last = PHONES.indexOf(p);
        try { await p.runOnce(); } catch (e) { console.warn('[munshiji-live]', e); }
        this.current = null;
        if (!this.taken) p.stop();
      }
    },
  };

  /* ------------------------------------------------------------------ find the pictures and lay the phones over them */
  function init() {
    JOURNEYS.forEach((j) => {
      const img = document.querySelector('.cs-canvas-block img[src*="' + j.img + '"]'); if (!img) return;
      const block = img.closest('.cs-canvas-block'); block.classList.add('mj-has-live');
      const layer = document.createElement('div'); layer.className = 'mj-layer'; block.appendChild(layer);
      j.phones.forEach((p) => new LivePhone(layer, p, j.h));
    });
    SCHED.start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

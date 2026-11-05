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
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ what each phone shows */
  const G = { to: 'gullak' };
  // path that drags the coin into the Gullak (app pixels)
  const COIN = [[195, 188], [195, 300], [195, 470]];
  const JOURNEYS = [
    { img: '16_personality_companion', h: 7100, phones: [
      { id: 'home', label: 'Home', rect: [947, 1242, 484, 1006], ops: [
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

  class LivePhone {
    constructor(layer, def, imgH) {
      this.def = def; this.ratio = 0; this.token = 0; this.live = false; this.tryMode = false; this.msgId = 0; this.pending = new Map(); this.readyRes = null;
      this.frame = null; this.next = null; PHONES.push(this);
      const [x, y, w, h] = def.rect;
      this.hc = Math.round(APP_W * h / w); // the app's height, in css pixels, for this screen
      const el = this.el = document.createElement('div'); el.className = 'mj-phone mj-idle'; el.dataset.id = def.id;
      Object.assign(el.style, { left: (x / IMG_W * 100) + '%', top: (y / imgH * 100) + '%', width: (w / IMG_W * 100) + '%', height: (h / imgH * 100) + '%' });
      el.innerHTML = `
        <div class="mj-screen"><div class="mj-scale" style="height:${this.hc}px">
          <div class="mj-load"><div class="mj-spin"></div></div>
        </div></div>
        <div class="mj-ctl" role="group" aria-label="${def.label}: playback">
          <button class="mj-rep" aria-label="Replay"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg><span>Replay</span></button>
          <button class="mj-try" aria-pressed="false" aria-label="Take over and try it"><svg viewBox="0 0 24 24"><path d="M9 11V5a2 2 0 0 1 4 0v5l5 1a2 2 0 0 1 1.6 2.4L18.5 19a3 3 0 0 1-3 2H11a3 3 0 0 1-2.4-1.2L5 15.5a1.8 1.8 0 0 1 2.8-2.2L9 14.5"/></svg><span>Try it</span></button>
        </div>`;
      layer.appendChild(el);
      this.screen = el.querySelector('.mj-screen');
      this.scaleEl = el.querySelector('.mj-scale'); this.load = el.querySelector('.mj-load');
      new ResizeObserver(() => this.fit()).observe(this.screen); this.fit();
      el.addEventListener('click', (e) => { if (e.target.closest('.mj-ctl')) return; el.classList.add('mj-show'); clearTimeout(this.showT); this.showT = setTimeout(() => el.classList.remove('mj-show'), 3200); });
      el.querySelector('.mj-rep').addEventListener('click', () => { this.setTry(false); this.start(); });
      el.querySelector('.mj-try').addEventListener('click', () => { const on = !this.tryMode; this.setTry(on); if (!on) this.start(); });
      if (REDUCED) { el.remove(); return; } // reduced motion: leave the pictures exactly as they were
      new IntersectionObserver(([en]) => { this.ratio = en.intersectionRatio; if (this.ratio >= 0.5 && !this.live && !this.tryMode) this.start(); }, { threshold: [0, 0.2, 0.5, 0.8] }).observe(this.screen);
      new IntersectionObserver(([en]) => { if (!en.isIntersecting && this.live) this.destroy(); }, { rootMargin: '90% 0px 90% 0px' }).observe(this.screen);
    }
    fit() { const k = this.screen.clientWidth / APP_W; if (k > 0) this.scaleEl.style.transform = `scale(${k})`; }
    makeFrame() {
      const f = document.createElement('iframe'); f.className = 'mj-frame'; f.title = 'Munshiji prototype: ' + this.def.label; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
      f.style.height = this.hc + 'px'; f.style.visibility = 'hidden'; this.scaleEl.insertBefore(f, this.load); return f;
    }
    onMessage(m, src) {
      if (m.touch) return;
      if (m.ready) { if (this.next && this.next.contentWindow === src) this.readyRes && this.readyRes(); return; }
      const f = this.pending.get(m.id); if (f) { this.pending.delete(m.id); f(m); }
    }
    send(op, fast, frame) {
      const target = frame || this.next || this.frame;
      return new Promise((res) => {
        const id = ++this.msgId; const t = setTimeout(() => { this.pending.delete(id); res({ ok: false, err: 'timeout' }); }, 20000);
        this.pending.set(id, (m) => { clearTimeout(t); res(m); });
        try { target.contentWindow.postMessage({ sj: 1, id, fast: !!fast, ...op }, '*'); } catch (e) { clearTimeout(t); res({ ok: false, err: 'no frame' }); }
      });
    }
    gated() { return this.tryMode || this.ratio < 0.3 || document.hidden; }
    async gate(my) { while (this.gated() && my === this.token) await sleep(150); return my === this.token; }
    async start() {
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
        const { fast: fl, ...rest } = o; const r = await this.send(rest, fastPhase || !!fl, f);
        if (!r.ok) console.warn('[munshiji-live]', this.def.id, o.op, o.text || o.sel || '', r.err);
      }
      if (firstReady < 0) await reveal();
      await this.send({ op: 'clear' }, false, f).catch(() => {});
      // rest on the end state for a moment, then run it again (the next run loads quietly behind this one)
      const t0 = Date.now(); while (Date.now() - t0 < 3800) { if (my !== this.token) return; await sleep(150); }
      if (my === this.token && !this.tryMode && this.ratio >= 0.3) this.start();
      else if (my === this.token) this.live = false; // scrolled away: wait until it is in view again
    }
    setTry(on) {
      this.tryMode = on; this.el.classList.toggle('mj-try', on); this.el.querySelector('.mj-try').setAttribute('aria-pressed', String(on));
      if (this.frame) { this.frame.tabIndex = on ? 0 : -1; if (on) this.frame.removeAttribute('aria-hidden'); else this.frame.setAttribute('aria-hidden', 'true'); }
      if (on) {
        this.token++; if (this.next) { this.next.remove(); this.next = null; }
        if (this.frame) { this.send({ op: 'clear' }, true, this.frame); this.send({ op: 'hideTouch' }, true, this.frame); this.send({ op: 'unmute' }, true, this.frame); }
      }
    }
    destroy() {
      this.token++; this.live = false; this.tryMode = false; this.el.classList.remove('mj-try');
      [this.frame, this.next].forEach((f) => f && f.remove()); this.frame = this.next = null; this.load.classList.remove('off'); this.el.classList.add('mj-idle');
    }
  }

  /* ------------------------------------------------------------------ find the pictures and lay the phones over them */
  function init() {
    JOURNEYS.forEach((j) => {
      const img = document.querySelector(`.cs-canvas-block img[src*="${j.img}"]`); if (!img) return;
      const block = img.closest('.cs-canvas-block'); block.classList.add('mj-has-live');
      const layer = document.createElement('div'); layer.className = 'mj-layer'; block.appendChild(layer);
      j.phones.forEach((p) => new LivePhone(layer, p, j.h));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

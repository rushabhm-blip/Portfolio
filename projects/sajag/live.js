/* Sajag · live phones in the journey diagrams.
 *
 * The documentation shows each journey as a static picture. This script finds those pictures and lays a live phone
 * over each phone frame in them, at the exact spot, so the screen you see is the real Sajag prototype playing the
 * step that screen stands for: a touch point moves, taps, types or drags, and a short caption says what it does.
 *
 * Nothing in the pictures is changed. Without JavaScript, or for anyone who prefers reduced motion, the pictures stay as they were.
 * The app itself is /projects/sajag/live/ (a copy of the prototype with a small driver, active only with ?docs=1).
 *
 * Each phone: { rect:[x,y,w,h] of the phone frame in the picture's own pixels, ops:[...] }
 *   ops: boot{to} · ready (everything before it runs instantly, behind a loading cover) · wait{ms}
 *        tap · press · type · drag · release · say · spot · tip · clear · waitFor · mock   (see live/docs-agent.js)
 */
(() => {
  const APP = '/projects/sajag/live/index.html?docs=1';
  const IMG_W = 2396;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IN_X = 0.0509, IN_Y = 0.0233; // where the screen starts inside the bezel (share of the phone frame)

  /* ------------------------------------------------------------------ what each phone shows */
  const JOURNEYS = [
    { img: '19_journey_voice', h: 2412, phones: [
      { id: 'voice', label: 'Voice assistant', rect: [1464, 636, 574, 1116], ops: [
        { op: 'boot', to: 'home' }, { op: 'ready' }, { op: 'wait', ms: 600 },
        { op: 'spot', text: 'Voice', exact: true, pad: 6 },
        { op: 'tip', text: 'Ask for a place or parking without finding the menu first.', y: 70 },
        { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: 'Voice', exact: true }, { op: 'wait', ms: 1100 },
        { op: 'spot', text: 'Plan a trip', pad: 8 },
        { op: 'tip', text: 'Example commands show what you can ask.', y: 70 },
        { op: 'wait', ms: 2400 }, { op: 'clear' },
        { op: 'say', text: 'Peenya to Samitha Square' },
        { op: 'tip', text: 'It hears the request and starts the same route search as the menu.', y: 70 },
        { op: 'wait', ms: 4800 }, { op: 'clear' },
      ] },
    ] },
    { img: '19_journey_voice', h: 2412, phones: [
      { id: 'voice-home', label: 'Home with the voice tile', flat: 1, rect: [450, 591, 590, 1117], ops: [
        { op: 'boot', to: 'home' }, { op: 'ready' }, { op: 'wait', ms: 700 },
        { op: 'spot', text: 'Voice', exact: true, pad: 6 },
        { op: 'tip', text: 'A big, visible voice tile on the home screen: ask first, browse later.', y: 90 },
        { op: 'wait', ms: 2800 }, { op: 'clear' },
        { op: 'spot', text: 'Ask Voice', pad: 6 }, { op: 'wait', ms: 1800 }, { op: 'clear' },
      ] },
    ] },
    { img: '20_journey_transit', h: 6026, phones: [
      { id: 'transit-home', label: 'Transit home', rect: [1171, 1921, 553, 1101], ops: [
        { op: 'boot', to: 'home' }, { op: 'ready' }, { op: 'wait', ms: 500 },
        { op: 'spot', text: 'City Pass', pad: 4 }, { op: 'tip', text: 'One pass for all your needs.', of: { text: 'City Pass' }, pos: 'below' },
        { op: 'wait', ms: 1600 }, { op: 'clear' },
        { op: 'tap', text: 'City Pass' }, { op: 'wait', ms: 1800 }, { op: 'tap', text: 'City Pass' }, { op: 'wait', ms: 600 },
        { op: 'tip', text: 'Explore keeps routes and nearby amenities in one place.', y: 70 },
        { op: 'spot', text: 'Explore', exact: true, pad: 4 }, { op: 'wait', ms: 1800 }, { op: 'clear' },
        { op: 'tap', text: 'Explore', exact: true }, { op: 'wait', ms: 1500 },
      ] },
      { id: 'transit-explore', label: 'Plan a route', rect: [558, 3402, 565, 1175], ops: [
        { op: 'boot', to: 'explore' }, { op: 'ready' }, { op: 'wait', ms: 600 },
        { op: 'spot', text: 'Use GPS', pad: 6 }, { op: 'tip', text: 'Set both ends of the trip before comparing routes.', y: 70 },
        { op: 'wait', ms: 1900 }, { op: 'clear' },
        { op: 'tap', text: 'Majestic' }, { op: 'wait', ms: 500 },
        { op: 'tap', text: 'Find Route' }, { op: 'wait', ms: 2800 },
        { op: 'tip', text: 'Route cards put time, fare and steps side by side.', y: 70 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
      ] },
      { id: 'transit-map', label: 'Route on the map', rect: [1566, 3656, 574, 1108], ops: [
        { op: 'boot', to: 'explore' }, { op: 'tap', text: 'Majestic', fast: 1 }, { op: 'tap', text: 'Find Route', fast: 1 }, { op: 'wait', ms: 2500 }, { op: 'ready' },
        { op: 'tip', text: 'Expand a route to check each connection before paying.', y: 70 }, { op: 'wait', ms: 1600 },
        { op: 'tap', text: 'On map' }, { op: 'wait', ms: 2400 }, { op: 'clear' },
        { op: 'tip', text: 'The whole trip on one map: board, change, alight.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
      ] },
    ] },
    { img: '21_journey_safety', h: 7054, cover: { src: '/projects/sajag/safety-hands-cover.png?v=3', rect: [150, 3290, 2246, 840] }, phones: [
      { id: 'safety-sos', label: 'Emergency help', rect: [495, 1988, 566, 1116], ops: [
        { op: 'boot', to: 'safety' }, { op: 'ready' }, { op: 'wait', ms: 700 },
        { op: 'spot', text: 'Emergency', pad: 5 }, { op: 'tip', text: 'Emergency help is one tap away, always.', y: 80 },
        { op: 'wait', ms: 1900 }, { op: 'clear' },
        { op: 'tap', text: 'Emergency' }, { op: 'wait', ms: 2800 },
      ] },
      { id: 'safety-mark', label: 'Start marking', hand: 1, rect: [259, 3333, 360, 711], ops: [
        { op: 'boot', to: 'safety' }, { op: 'ready' }, { op: 'wait', ms: 700 },
        { op: 'tap', text: 'Mark unsafe area' }, { op: 'wait', ms: 600 },
        { op: 'tip', text: 'Touch and hold the map where the concern is.', y: 130 }, { op: 'wait', ms: 2400 },
      ] },
      { id: 'safety-yellow', label: 'Hold: low severity', hand: 1, rect: [1010, 3336, 365, 710], ops: [
        { op: 'boot', to: 'safety' }, { op: 'tap', text: 'Mark unsafe area', fast: 1 }, { op: 'wait', ms: 400 }, { op: 'ready' },
        { op: 'tip', text: 'Hold briefly, then drag to size the area. Yellow: minor.', y: 130 },
        { op: 'drag', path: [[172, 400], [226, 400]], hold: 700, ms: 900, noRelease: 1 }, { op: 'wait', ms: 1500 },
        { op: 'release' }, { op: 'hideTouch' }, { op: 'wait', ms: 1200 }, { op: 'clear' },
      ] },
      { id: 'safety-orange', label: 'Hold longer: higher severity', hand: 1, rect: [1738, 3336, 365, 710], ops: [
        { op: 'boot', to: 'safety' }, { op: 'tap', text: 'Mark unsafe area', fast: 1 }, { op: 'wait', ms: 400 }, { op: 'ready' },
        { op: 'tip', text: 'Hold longer and the severity rises: yellow, orange, red.', y: 130 },
        { op: 'drag', path: [[172, 400], [244, 424]], hold: 2200, ms: 1000, noRelease: 1 }, { op: 'wait', ms: 1500 },
        { op: 'release' }, { op: 'hideTouch' }, { op: 'wait', ms: 1600 }, { op: 'clear' },
      ] },
      { id: 'safety-saved', label: 'Location saved', rect: [1488, 4784, 574, 1116], ops: [
        { op: 'boot', to: 'home' }, { op: 'ready' }, { op: 'wait', ms: 800 },
        { op: 'tip', text: 'Press the power button twice, pause, twice again: the place is saved silently.', y: 70 }, { op: 'wait', ms: 2200 },
        { op: 'mock', fn: 'snapshot' }, { op: 'wait', ms: 1000 }, { op: 'clear' },
        { op: 'tip', text: 'Report it now, or later, once you are safe.', y: 70 }, { op: 'wait', ms: 2000 },
        { op: 'spot', text: 'Report incident', pad: 6 }, { op: 'wait', ms: 1400 }, { op: 'clear' },
      ] },
    ] },
    { img: '22_journey_parking', h: 5730, phones: [
      { id: 'parking-find', label: 'Find parking', rect: [432, 2124, 574, 1152], ops: [
        { op: 'boot', to: 'parking' }, { op: 'ready' }, { op: 'wait', ms: 600 },
        { op: 'spot', text: 'Search area', pad: 6 }, { op: 'tip', text: 'Search near the destination, not only your current position.', y: 150 },
        { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'scroll', top: 260 }, { op: 'wait', ms: 400 },
        { op: 'spot', text: 'Extend by 1 hour', pad: 5 }, { op: 'tip', text: 'The active session stays in view, with time left and a one-tap extension.', y: 70 },
        { op: 'wait', ms: 2400 }, { op: 'clear' },
        { op: 'tap', text: 'Extend by 1 hour' }, { op: 'wait', ms: 1500 },
      ] },
      { id: 'parking-reserve', label: 'Reserve parking', flat: 1, rect: [1001, 3747, 502, 968], ops: [
        { op: 'boot', to: 'parking' }, { op: 'tap', text: 'Book slot', nth: 0, fast: 1 }, { op: 'wait', ms: 800 }, { op: 'ready' },
        { op: 'tip', text: 'Select the date and time.', y: 150 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: '4h', exact: true }, { op: 'wait', ms: 900 },
        { op: 'tip', text: 'Select the duration of parking; the total updates at once.', y: 150 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: 'Proceed to Payment' }, { op: 'wait', ms: 1600 },
      ] },
      { id: 'parking-pass', label: 'Parking pass', flat: 1, rect: [1693, 4066, 511, 958], ops: [
        { op: 'boot', to: 'parking' }, { op: 'tap', text: 'Book slot', nth: 0, fast: 1 }, { op: 'wait', ms: 800 }, { op: 'tap', text: 'Proceed to Payment', fast: 1 }, { op: 'wait', ms: 800 }, { op: 'tap', text: 'Pay', fast: 1 }, { op: 'wait', ms: 3500 }, { op: 'ready' },
        { op: 'tip', text: "Booking confirmed: slot number, code and entry QR in one place.", y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'spot', text: 'Navigate to Slot', pad: 5 }, { op: 'tip', text: 'Use the pass to connect booking with entry.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
      ] },
      { id: 'parking-map', label: 'Book a slot', rect: [1620, 2422, 574, 1086], ops: [
        { op: 'boot', to: 'parking' }, { op: 'tap', text: 'Map', exact: true, fast: 1 }, { op: 'wait', ms: 1800 }, { op: 'ready' },
        { op: 'tip', text: 'See where each option sits before choosing.', y: 70 }, { op: 'wait', ms: 1800 }, { op: 'clear' },
        { op: 'tap', text: 'Book slot', nth: 0 }, { op: 'wait', ms: 1500 },
        { op: 'tip', text: 'Pick date, start time and how long you will stay.', y: 70 }, { op: 'wait', ms: 1000 },
        { op: 'tap', text: '4h', exact: true }, { op: 'wait', ms: 1300 }, { op: 'clear' },
        { op: 'tap', text: 'Proceed to Payment' }, { op: 'wait', ms: 1800 },
        { op: 'tap', text: 'Pay' }, { op: 'wait', ms: 3800 },
      ] },
    ] },
    { img: '23_journey_civic', h: 5684, phones: [
      { id: 'civic-home', label: 'City Makers', rect: [1636, 1220, 566, 1106], ops: [
        { op: 'boot', to: 'report' }, { op: 'ready' }, { op: 'wait', ms: 600 },
        { op: 'spot', text: 'My reports', pad: 10 }, { op: 'tip', text: 'Report history and resolved counts stay visible.', y: 80 },
        { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'spot', text: 'Pothole', pad: 10 }, { op: 'tip', text: 'Categories help describe the issue consistently.', of: { text: 'Pothole' }, pos: 'above' },
        { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: 'Pothole' }, { op: 'wait', ms: 1500 },
      ] },
      { id: 'civic-form', label: 'Report an issue', rect: [1636, 2562, 566, 1106], ops: [
        { op: 'boot', to: 'report' }, { op: 'tap', text: 'Pothole', fast: 1 }, { op: 'wait', ms: 800 }, { op: 'ready' },
        { op: 'spot', text: 'Pothole', pad: 6 }, { op: 'tip', text: 'Select the reporting category.', y: 70 }, { op: 'wait', ms: 1800 }, { op: 'clear' },
        { op: 'tip', text: 'Add images of the condition, then mark the location.', y: 70 },
        { op: 'scroll', top: 240 }, { op: 'wait', ms: 600 },
        { op: 'type', sel: 'input[placeholder^="Brief title"]', value: 'Large pothole near crossing' }, { op: 'wait', ms: 700 }, { op: 'clear' },
        { op: 'tap', text: 'Submit Report' }, { op: 'wait', ms: 2200 },
      ] },
      { id: 'civic-issue', label: 'Follow the response', rect: [328, 2560, 566, 1106], ops: [
        { op: 'boot', to: 'report' }, { op: 'tap', text: 'Pothole', fast: 1 }, { op: 'wait', ms: 700 }, { op: 'tap', text: 'Submit Report', fast: 1 }, { op: 'wait', ms: 1500 }, { op: 'ready' },
        { op: 'tip', text: 'The issue page shows where it is and who has acknowledged it.', y: 70 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'scroll', top: 300 }, { op: 'wait', ms: 500 },
        { op: 'tip', text: 'Acknowledgement and progress, in one timeline.', y: 70 }, { op: 'wait', ms: 2000 }, { op: 'clear' },
        { op: 'tap', text: 'Upvote' }, { op: 'wait', ms: 1600 },
      ] },
      { id: 'civic-feed', label: 'Community feed', rect: [974, 3824, 566, 1100], ops: [
        { op: 'boot', to: 'report' }, { op: 'tap', text: 'Community feed', fast: 1 }, { op: 'wait', ms: 900 }, { op: 'ready' },
        { op: 'tip', text: 'Find the issue before creating another report.', y: 70 }, { op: 'wait', ms: 2000 }, { op: 'clear' },
        { op: 'tap', text: 'Roads', exact: true }, { op: 'wait', ms: 1400 },
        { op: 'tip', text: 'Categories make the local feed easier to scan.', y: 70 }, { op: 'wait', ms: 2400 }, { op: 'clear' },
      ] },
    ] },
    { img: '24_journey_language', h: 3190, phones: [
      { id: 'language', label: 'Learn Kannada', rect: [432, 1118, 566, 1106], ops: [
        { op: 'boot', to: 'home' }, { op: 'ready' }, { op: 'wait', ms: 600 },
        { op: 'spot', text: 'Learn a word', pad: 6 }, { op: 'tip', text: 'A small, friendly way in to a new language.', y: 150 },
        { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: 'Learn a word' }, { op: 'wait', ms: 1600 },
        { op: 'tip', text: 'Lessons start from a situation: getting around, the shop, directions.', y: 70 }, { op: 'wait', ms: 2800 }, { op: 'clear' },
        { op: 'tap', text: 'Start learning' }, { op: 'wait', ms: 1800 },
      ] },
      { id: 'language-lessons', label: 'Namma Kannada lessons', flat: 1, rect: [1190, 1491, 510, 941], ops: [
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Learn a word', fast: 1 }, { op: 'wait', ms: 600 }, { op: 'ready' },
        { op: 'spot', text: 'Start learning', pad: 6 }, { op: 'tip', text: 'Open a focused lesson from the carousel.', y: 70 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'spot', text: 'Getting around', pad: 4 }, { op: 'tip', text: 'Choose a situation that matches the conversation.', y: 70 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: 'Getting around' }, { op: 'wait', ms: 2200 },
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
      const flat = this.flat = !!def.flat; // flat = a screen shown without a phone frame
      const sw = flat ? w : w * (1 - 2 * IN_X), sh = flat ? h : h * (1 - 2 * IN_Y); this.hc = Math.round(376 * sh / sw); this.top = flat ? 0 : 40;
      const el = this.el = document.createElement('div'); el.className = 'sj-phone sj-idle' + (flat ? ' sj-flat' : ''); el.dataset.id = def.id;
      Object.assign(el.style, { left: (x / IMG_W * 100) + '%', top: (y / imgH * 100) + '%', width: (w / IMG_W * 100) + '%', height: (h / imgH * 100) + '%' });
      el.innerHTML = `
        <div class="sj-screen"><div class="sj-scale" style="height:${this.hc}px">
          ${flat ? '' : '<div class="sj-status"><span>10:49</span><i class="sj-isl"></i><span class="sj-r"><b>5G</b><i class="sj-bat"></i><b>67%</b></span></div>'}
          <div class="sj-load"><div class="sj-spin"></div></div>
        </div></div>
        <div class="sj-ctl" role="group" aria-label="${def.label}: playback">
          <button class="sj-rep" aria-label="Replay"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg><span>Replay</span></button>
          <button class="sj-try" aria-pressed="false" aria-label="Take over and try it"><svg viewBox="0 0 24 24"><path d="M9 11V5a2 2 0 0 1 4 0v5l5 1a2 2 0 0 1 1.6 2.4L18.5 19a3 3 0 0 1-3 2H11a3 3 0 0 1-2.4-1.2L5 15.5a1.8 1.8 0 0 1 2.8-2.2L9 14.5"/></svg><span>Try it</span></button>
        </div>`;
      if (def.hand) { const h = this.handEl = document.createElement('img'); h.className = 'sj-hand'; h.alt = ''; h.src = '/projects/sajag/live/hand.png?v=2'; el.appendChild(h); }
      layer.appendChild(el);
      this.screen = el.querySelector('.sj-screen');
      this.scaleEl = el.querySelector('.sj-scale'); this.load = el.querySelector('.sj-load');
      new ResizeObserver(() => { this.fit(); if (this.lastTouch) this.placeHand(this.lastTouch); }).observe(this.screen); this.fit();
      el.addEventListener('click', (e) => { if (e.target.closest('.sj-ctl')) return; el.classList.add('sj-show'); clearTimeout(this.showT); this.showT = setTimeout(() => el.classList.remove('sj-show'), 3200); });
      el.querySelector('.sj-rep').addEventListener('click', () => { this.setTry(false); this.start(); });
      el.querySelector('.sj-try').addEventListener('click', () => { const on = !this.tryMode; this.setTry(on); if (!on) this.start(); });
            if (REDUCED) { el.remove(); return; } // reduced motion: leave the pictures exactly as they were
      new IntersectionObserver(([en]) => { this.ratio = en.intersectionRatio; if (this.ratio >= 0.5 && !this.live && !this.tryMode) this.start(); }, { threshold: [0, 0.2, 0.5, 0.8] }).observe(this.screen);
      new IntersectionObserver(([en]) => { if (!en.isIntersecting && this.live) this.destroy(); }, { rootMargin: '90% 0px 90% 0px' }).observe(this.screen);
    }
    fit() { const k = this.screen.clientWidth / 376; if (k > 0) this.scaleEl.style.transform = `scale(${k})`; }
    makeFrame() {
      const f = document.createElement('iframe'); f.className = 'sj-frame'; f.title = 'Sajag prototype: ' + this.def.label; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
      f.style.height = (this.hc - this.top) + 'px'; f.style.visibility = 'hidden'; this.scaleEl.insertBefore(f, this.load); return f;
    }
    /* the drawn hand lives outside the app, so it can reach out over the bezel; the app only reports where the fingertip is */
    placeHand(t) {
      const h = this.handEl; if (!h) return; this.lastTouch = t;
      const S = 1.15, TIPX = 50.5, TIPY = 50.5, W = 446; // size relative to the app screen, fingertip position and width of hand.png
      const k = this.screen.clientWidth / 376, sc = this.screen;
      const x = sc.offsetLeft + t.x * k, y = sc.offsetTop + (this.top + t.y) * k;
      h.style.width = (W * S * k) + 'px'; h.style.left = (x - TIPX * S * k) + 'px'; h.style.top = (y - TIPY * S * k) + 'px';
      h.classList.toggle('sj-down', !!t.down); h.classList.toggle('sj-on', !!t.on && !this.tryMode);
    }
    onMessage(m, src) {
      if (m.touch) { if (this.frame && this.frame.contentWindow === src) this.placeHand(m.touch); return; }
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
      f.src = APP + (this.def.hand ? '&hand=1' : '') + '&v=' + Date.now();
      await Promise.race([ready, sleep(20000)]); if (my !== this.token) return;
      let shown = false;
      const reveal = async () => {
        if (shown) return; shown = true; await sleep(250); if (my !== this.token) return;
        if (this.handEl) this.handEl.classList.remove('sj-on'); this.lastTouch = null;
        f.style.visibility = 'visible'; if (this.frame) this.frame.remove(); this.frame = f; this.next = null; this.load.classList.add('off'); this.el.classList.remove('sj-idle');
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
        if (!r.ok) console.warn('[sajag-live]', this.def.id, o.op, o.text || o.sel || '', r.err);
      }
      if (firstReady < 0) await reveal();
      await this.send({ op: 'clear' }, false, f).catch(() => {});
      // rest on the end state for a moment, then run it again (the next run loads quietly behind this one)
      const t0 = Date.now(); while (Date.now() - t0 < 3800) { if (my !== this.token) return; await sleep(150); }
      if (my === this.token && !this.tryMode && this.ratio >= 0.3) this.start();
      else if (my === this.token) this.live = false; // scrolled away: wait until it is in view again
    }
    setTry(on) {
      this.tryMode = on; this.el.classList.toggle('sj-try', on); this.el.querySelector('.sj-try').setAttribute('aria-pressed', String(on));
      if (this.frame) { this.frame.tabIndex = on ? 0 : -1; if (on) this.frame.removeAttribute('aria-hidden'); else this.frame.setAttribute('aria-hidden', 'true'); }
      if (on) {
        this.token++; if (this.next) { this.next.remove(); this.next = null; }
        if (this.frame) { this.send({ op: 'clear' }, true, this.frame); this.send({ op: 'hideTouch' }, true, this.frame); }
      }
    }
    destroy() {
      this.token++; this.live = false; this.tryMode = false; this.el.classList.remove('sj-try'); if (this.handEl) this.handEl.classList.remove('sj-on');
      [this.frame, this.next].forEach((f) => f && f.remove()); this.frame = this.next = null; this.load.classList.remove('off'); this.el.classList.add('sj-idle');
    }
  }

  /* ------------------------------------------------------------------ find the pictures and lay the phones over them */
  /* the colour behind the picture, so the cover blends in */
  function pageColor(el) {
    for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && c !== 'transparent' && c.split(' ').join('') !== 'rgba(0,0,0,0)') return c; }
    return '#fff';
  }
  function init() {
    JOURNEYS.forEach((j) => {
      const img = document.querySelector(`.cs-canvas-block img[src*="${j.img}"]`); if (!img) return;
      const block = img.closest('.cs-canvas-block'); block.classList.add('sj-has-live');
      const layer = document.createElement('div'); layer.className = 'sj-layer'; block.appendChild(layer);
      if (j.cover && !REDUCED) { // hide the hands that were drawn in the picture; the live phones bring their own
        const [cx, cy, cw, ch] = j.cover.rect; const cv = document.createElement('div'); cv.className = 'sj-cover';
        Object.assign(cv.style, { left: (cx / IMG_W * 100) + '%', top: (cy / j.h * 100) + '%', width: (cw / IMG_W * 100) + '%', height: (ch / j.h * 100) + '%', backgroundColor: pageColor(block), webkitMaskImage: 'url(' + j.cover.src + ')', maskImage: 'url(' + j.cover.src + ')' });
        layer.appendChild(cv);
      }
      j.phones.forEach((p) => new LivePhone(layer, p, j.h));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

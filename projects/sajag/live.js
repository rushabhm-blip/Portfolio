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
  /* where each phone's caption sits: a free patch of white next to it, found by looking at the picture (picture pixels) */
  const CAPS = {"voice":{"dir":"below","x":1378,"y":1778,"w":746,"h":140},"voice-home":{"dir":"below","x":362,"y":1734,"w":767,"h":140},"transit-home":{"dir":"left","x":685,"y":2317,"w":460,"h":170},"transit-explore":{"dir":"left","x":72,"y":3905,"w":460,"h":170},"transit-map":{"dir":"below","x":1480,"y":4790,"w":746,"h":140},"safety-sos":{"dir":"below","x":410,"y":3130,"w":736,"h":140},"safety-mark":{"dir":"below","x":119,"y":4070,"w":640,"h":140},"safety-yellow":{"dir":"below","x":873,"y":4172,"w":640,"h":140},"safety-orange":{"dir":"below","x":1601,"y":4172,"w":640,"h":140},"safety-saved":{"dir":"below","x":1402,"y":5926,"w":746,"h":140},"parking-find":{"dir":"above","x":346,"y":1838,"w":746,"h":140},"parking-reserve":{"dir":"above","x":926,"y":3541,"w":653,"h":140},"parking-pass":{"dir":"below","x":1617,"y":5050,"w":664,"h":140},"parking-map":{"dir":"below","x":1534,"y":3534,"w":746,"h":140},"civic-home":{"dir":"above","x":1551,"y":1034,"w":736,"h":140},"civic-form":{"dir":"below","x":1551,"y":3694,"w":736,"h":140},"civic-issue":{"dir":"above","x":243,"y":2374,"w":736,"h":140},"civic-feed":{"dir":"below","x":889,"y":4950,"w":736,"h":140},"language":{"dir":"below","x":347,"y":2250,"w":736,"h":140},"language-lessons":{"dir":"below","x":1114,"y":2458,"w":663,"h":140}};
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
        { op: 'boot', to: 'explore' }, { op: 'tap', text: 'Majestic', fast: 1 }, { op: 'tap', text: 'Find Route', fast: 1 }, { op: 'waitFor', text: 'On map', ms: 12000 }, { op: 'ready' },
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
        { op: 'boot', to: 'safety' }, { op: 'tap', text: 'Mark unsafe area', fast: 1 }, { op: 'wait', ms: 400, keep: 1 }, { op: 'ready' },
        { op: 'tip', text: 'Hold briefly, then drag to size the area. Yellow: minor.', y: 130 },
        { op: 'drag', path: [[172, 400], [226, 400]], hold: 700, ms: 900, noRelease: 1 }, { op: 'wait', ms: 1500 },
        { op: 'release' }, { op: 'hideTouch' }, { op: 'wait', ms: 1200 }, { op: 'clear' },
      ] },
      { id: 'safety-orange', label: 'Hold longer: higher severity', hand: 1, rect: [1738, 3336, 365, 710], ops: [
        { op: 'boot', to: 'safety' }, { op: 'tap', text: 'Mark unsafe area', fast: 1 }, { op: 'wait', ms: 400, keep: 1 }, { op: 'ready' },
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
        { op: 'boot', to: 'parking' }, { op: 'tap', text: 'Book slot', nth: 0, fast: 1 }, { op: 'waitFor', text: '4h', exact: true }, { op: 'ready' },
        { op: 'tip', text: 'Select the date and time.', y: 150 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: '4h', exact: true }, { op: 'wait', ms: 900 },
        { op: 'tip', text: 'Select the duration of parking; the total updates at once.', y: 150 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'tap', text: 'Proceed to Payment' }, { op: 'wait', ms: 1600 },
      ] },
      { id: 'parking-pass', label: 'Parking pass', flat: 1, rect: [1693, 4066, 511, 958], ops: [
        { op: 'boot', to: 'parking' }, { op: 'timers', k: 10 }, { op: 'tap', text: 'Book slot', nth: 0, fast: 1 }, { op: 'waitFor', text: 'Proceed to Payment' }, { op: 'tap', text: 'Proceed to Payment', fast: 1 }, { op: 'waitFor', text: 'Pay ₹' }, { op: 'tap', text: 'Pay ₹', fast: 1 }, { op: 'waitFor', text: 'Navigate to Slot', ms: 12000 }, { op: 'timers', k: 1 }, { op: 'ready' },
        { op: 'tip', text: "Booking confirmed: slot number, code and entry QR in one place.", y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
        { op: 'spot', text: 'Navigate to Slot', pad: 5 }, { op: 'tip', text: 'Use the pass to connect booking with entry.', y: 70 }, { op: 'wait', ms: 2600 }, { op: 'clear' },
      ] },
      { id: 'parking-map', label: 'Book a slot', rect: [1620, 2422, 574, 1086], ops: [
        { op: 'boot', to: 'parking' }, { op: 'tap', text: 'Map', exact: true, fast: 1 }, { op: 'waitFor', text: 'Book slot' }, { op: 'ready' },
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
        { op: 'boot', to: 'report' }, { op: 'tap', text: 'Pothole', fast: 1 }, { op: 'waitFor', text: 'Submit Report' }, { op: 'ready' },
        { op: 'spot', text: 'Pothole', pad: 6 }, { op: 'tip', text: 'Select the reporting category.', y: 70 }, { op: 'wait', ms: 1800 }, { op: 'clear' },
        { op: 'tip', text: 'Add images of the condition, then mark the location.', y: 70 },
        { op: 'scroll', top: 240 }, { op: 'wait', ms: 600 },
        { op: 'type', sel: 'input[placeholder^="Brief title"]', value: 'Large pothole near crossing' }, { op: 'wait', ms: 700 }, { op: 'clear' },
        { op: 'tap', text: 'Submit Report' }, { op: 'wait', ms: 2200 },
      ] },
      { id: 'civic-issue', label: 'Follow the response', rect: [328, 2560, 566, 1106], ops: [
        { op: 'boot', to: 'report' }, { op: 'tap', text: 'Pothole', fast: 1 }, { op: 'wait', ms: 700 }, { op: 'tap', text: 'Submit Report', fast: 1 }, { op: 'waitFor', text: 'Upvote' }, { op: 'ready' },
        { op: 'tip', text: 'The issue page shows where it is and who has acknowledged it.', y: 70 }, { op: 'wait', ms: 2200 }, { op: 'clear' },
        { op: 'scroll', top: 300 }, { op: 'wait', ms: 500 },
        { op: 'tip', text: 'Acknowledgement and progress, in one timeline.', y: 70 }, { op: 'wait', ms: 2000 }, { op: 'clear' },
        { op: 'tap', text: 'Upvote' }, { op: 'wait', ms: 1600 },
      ] },
      { id: 'civic-feed', label: 'Community feed', rect: [974, 3824, 566, 1100], ops: [
        { op: 'boot', to: 'report' }, { op: 'tap', text: 'Community feed', fast: 1 }, { op: 'waitFor', text: 'Roads', exact: true }, { op: 'ready' },
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
        { op: 'boot', to: 'home' }, { op: 'tap', text: 'Learn a word', fast: 1 }, { op: 'waitFor', text: 'Start learning' }, { op: 'ready' },
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

  /* on small screens the captions have no room beside the pictures: they use one slim bar at the bottom of the screen instead */
  const NARROW = matchMedia('(max-width: 760px)');
  let bar = null;
  function barEl() {
    if (!bar) { bar = document.createElement('div'); bar.className = 'sj-bar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<p></p>'; document.body.appendChild(bar); }
    return bar;
  }

  class LivePhone {
    constructor(layer, def, imgH) {
      this.def = def; this.ratio = 0; this.token = 0; this.gen = 0; this.prep = null; this.prepDone = false; this.live = false; this.tryMode = false; this.msgId = 0; this.pending = new Map(); this.readyRes = null;
      this.frame = null; this.next = null; PHONES.push(this);
      const [x, y, w, h] = def.rect;
      const flat = this.flat = !!def.flat; // flat = a screen shown without a phone frame
      const sw = flat ? w : w * (1 - 2 * IN_X), sh = flat ? h : h * (1 - 2 * IN_Y); this.hc = Math.round(376 * sh / sw); this.top = flat ? 0 : 40;
      const el = this.el = document.createElement('div'); el.className = 'sj-phone sj-idle' + (flat ? ' sj-flat' : ''); el.dataset.id = def.id;
      Object.assign(el.style, { left: (x / IMG_W * 100) + '%', top: (y / imgH * 100) + '%', width: (w / IMG_W * 100) + '%', height: (h / imgH * 100) + '%' });
      el.innerHTML = '<div class="sj-screen"><div class="sj-scale" style="height:' + this.hc + 'px">' +
        (flat ? '' : '<div class="sj-status"><span>10:49</span><i class="sj-isl"></i><span class="sj-r"><b>5G</b><i class="sj-bat"></i><b>67%</b></span></div>') +
        '<div class="sj-load"><div class="sj-spin"></div></div></div></div>' +
        '<div class="sj-ctl" role="group" aria-label="' + def.label + ': playback">' +
        '<button class="sj-rep" aria-label="Replay"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg><span>Replay</span></button>' +
        '<button class="sj-try" aria-pressed="false" aria-label="Take over and try it"><svg viewBox="0 0 24 24"><path d="M9 11V5a2 2 0 0 1 4 0v5l5 1a2 2 0 0 1 1.6 2.4L18.5 19a3 3 0 0 1-3 2H11a3 3 0 0 1-2.4-1.2L5 15.5a1.8 1.8 0 0 1 2.8-2.2L9 14.5"/></svg><span>Try it</span></button>' +
        '</div>';
      if (def.hand) { const hd = this.handEl = document.createElement('img'); hd.className = 'sj-hand'; hd.alt = ''; hd.src = '/projects/sajag/live/hand.png?v=2'; el.appendChild(hd); }
      layer.appendChild(el);
      // the caption: a small card in the free white space beside the phone, so it never covers the screen
      const c = CAPS[def.id];
      if (c) {
        const cap = this.cap = document.createElement('div'); cap.className = 'sj-cap sj-cap-' + c.dir; cap.setAttribute('aria-hidden', 'true');
        cap.innerHTML = '<i></i><p></p>';
        Object.assign(cap.style, { left: (c.x / IMG_W * 100) + '%', width: (c.w / IMG_W * 100) + '%' });
        if (c.dir === 'above') cap.style.bottom = ((imgH - (c.y + c.h)) / imgH * 100) + '%'; else cap.style.top = (c.y / imgH * 100) + '%';
        layer.appendChild(cap); this.capText = cap.querySelector('p');
      }
      this.screen = el.querySelector('.sj-screen');
      this.scaleEl = el.querySelector('.sj-scale'); this.load = el.querySelector('.sj-load');
      new ResizeObserver(() => { this.fit(); if (this.lastTouch) this.placeHand(this.lastTouch); }).observe(this.screen); this.fit();
      el.addEventListener('click', (e) => { if (e.target.closest('.sj-ctl')) return; el.classList.add('sj-show'); clearTimeout(this.showT); this.showT = setTimeout(() => el.classList.remove('sj-show'), 3200); });
      // hover (mouse): the flow starts on this phone straight away, whatever the round was showing; a tap does the same on touch screens
      let hoverT = null;
      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return; clearTimeout(hoverT);
        hoverT = setTimeout(() => { if (!this.tryMode && SCHED.current !== this && !SCHED.taken) SCHED.playNow(this); }, 0);
      });
      el.addEventListener('pointerleave', () => clearTimeout(hoverT));
      el.addEventListener('click', (e) => { if (e.target.closest('.sj-ctl')) return; if (el.classList.contains('sj-idle') && !this.tryMode && SCHED.current !== this) SCHED.playNow(this); });
      el.querySelector('.sj-rep').addEventListener('click', () => { this.setTry(false); SCHED.playNow(this); });
      el.querySelector('.sj-try').addEventListener('click', () => { const on = !this.tryMode; if (on) SCHED.takeOver(this); else { this.setTry(false); this.stop(); } });
      if (REDUCED) { el.remove(); if (this.cap) this.cap.remove(); return; } // reduced motion: leave the pictures exactly as they were
      new IntersectionObserver(([en]) => { this.ratio = en.intersectionRatio; }, { threshold: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1] }).observe(this.screen);
      new IntersectionObserver(([en]) => { if (!en.isIntersecting && (this.live || this.frame)) this.stop(); }, { rootMargin: '90% 0px 90% 0px' }).observe(this.screen);
    }
    fit() { const k = this.screen.clientWidth / 376; if (k > 0) this.scaleEl.style.transform = 'scale(' + k + ')'; }
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
    /* captions are drawn by the page (next to the phone), everything else is done inside the prototype */
    showCap(text) {
      if (NARROW.matches) { const b = barEl(); b.querySelector('p').textContent = text; b.classList.add('on'); return; }
      if (!this.cap) return; this.capText.textContent = text; this.cap.classList.add('on');
    }
    hideCap() { if (this.cap) this.cap.classList.remove('on'); if (bar) bar.classList.remove('on'); }
    send(op, fast, frame) {
      if (op.op === 'tip') { this.showCap(op.text); return Promise.resolve({ ok: true }); }
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
    /* a pause that ends early if this run has been stopped */
    async nap(ms, my) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (my !== this.token) return; await sleep(Math.min(40, ms)); } }
    /* load the prototype in a hidden frame and do everything up to the "ready" mark, so the flow can start the moment it is wanted */
    prepare() {
      if (this.prep) return this.prep;
      const gen = this.gen;
      this.prep = (async () => {
        if (this.next) { this.next.remove(); this.next = null; }
        const f = this.next = this.makeFrame();
        const ready = new Promise((r) => { this.readyRes = r; });
        f.src = APP + (this.def.hand ? '&hand=1' : '') + '&v=' + Date.now();
        await Promise.race([ready, sleep(20000)]);
        const dead = () => { if (gen !== this.gen) { f.remove(); if (this.next === f) this.next = null; return true; } return false; };
        if (dead()) return null;
        const ops = this.def.ops; const ri = ops.findIndex((o) => o.op === 'ready');
        const pre = ri < 0 ? [] : ops.slice(0, ri);
        for (const o of pre) {
          if (dead()) return null;
          if (o.op === 'wait') { await sleep(o.keep ? o.ms : Math.min(o.ms, 90)); continue; }
          const rest = Object.assign({}, o); delete rest.fast;
          const r = await this.send(rest, true, f);
          if (!r.ok) console.warn('[sajag-live]', this.def.id, o.op, o.text || o.sel || '', r.err);
        }
        if (dead()) return null;
        this.prepDone = true;
        return { f, ri };
      })();
      return this.prep;
    }
    /* play the script once; resolves when it has finished and the screen has rested on its last state */
    async runOnce() {
      const my = ++this.token; this.live = true;
      const prep = await this.prepare(); this.prep = null;
      if (my !== this.token || !prep) return;
      const f = prep.f;
      if (this.handEl) this.handEl.classList.remove('sj-on'); this.lastTouch = null;
      f.style.visibility = 'visible'; this.el.classList.remove('sj-loading'); if (this.frame) this.frame.remove(); this.frame = f; this.next = null; this.load.classList.add('off'); this.el.classList.remove('sj-idle');
      const ops = this.def.ops; const quick = !!this.quick; this.quick = false; let first = true;
      for (let i = prep.ri + 1; i < ops.length; i++) {
        const o = ops[i];
        if (!(await this.gate(my))) return;
        if (my !== this.token) return;
        if (o.op === 'wait') { if (quick && first) { first = false; continue; } await this.nap(quick ? o.ms * 0.6 : o.ms, my); continue; }
        first = false;
        const rest = Object.assign({}, o); const fl = rest.fast; delete rest.fast;
        const r = await this.send(rest, !!fl, f);
        if (!r.ok && my === this.token) console.warn('[sajag-live]', this.def.id, o.op, o.text || o.sel || '', r.err);
      }
      await this.send({ op: 'clear' }, false, f).catch(() => {});
      // rest on the end state for a moment
      await this.nap(2600, my);
      if (my === this.token) this.stop();   // hand the stage back to the drawing, so the reader's eye moves to the next phone
    }
    setTry(on) {
      this.tryMode = on; this.el.classList.toggle('sj-try', on); this.el.querySelector('.sj-try').setAttribute('aria-pressed', String(on));
      if (this.frame) { this.frame.tabIndex = on ? 0 : -1; if (on) this.frame.removeAttribute('aria-hidden'); else this.frame.setAttribute('aria-hidden', 'true'); }
      if (on) {
        this.token++; if (this.next) { this.next.remove(); this.next = null; }
        this.hideCap();
        if (this.frame) { this.send({ op: 'clear' }, true, this.frame); this.send({ op: 'hideTouch' }, true, this.frame); this.send({ op: 'unmute' }, true, this.frame); }
      }
    }
    /* stop whatever this phone is doing and show the original picture again */
    stop() {
      this.token++; this.gen++; this.prep = null; this.prepDone = false; this.live = false; this.tryMode = false;
      this.el.classList.remove('sj-try', 'sj-loading'); if (this.handEl) this.handEl.classList.remove('sj-on'); this.hideCap();
      [this.frame, this.next].forEach((f) => f && f.remove()); this.frame = this.next = null; this.load.classList.remove('off'); this.el.classList.add('sj-idle');
    }
  }

  /* ------------------------------------------------------------------ one phone at a time
   * Phones play in reading order, one after another, so the eye has a single thing to follow. Only phones that are on screen take part;
   * when everything on screen has played, the round starts again. Hovering a phone plays it at once. "Try it" pauses the round. */
  const SCHED = {
    last: -1, current: null, forced: null, taken: null, started: false, wakeRes: null,
    start() { if (this.started || REDUCED) return; this.started = true; this.loop(); },
    pickNext() {
      const vis = PHONES.filter((p) => p.ratio >= 0.5 && p.el.isConnected);
      if (!vis.length) return null;
      const order = (p) => PHONES.indexOf(p);
      const after = vis.filter((p) => order(p) > this.last).sort((a, b) => order(a) - order(b));
      return after[0] || vis.sort((a, b) => order(a) - order(b))[0];
    },
    playNow(p) { if (p.el.classList.contains('sj-idle')) p.el.classList.add('sj-loading'); p.quick = true; this.forced = p; if (this.wakeRes) this.wakeRes(); },
    takeOver(p) { if (this.taken && this.taken !== p) { this.taken.setTry(false); this.taken.stop(); } this.taken = p; if (this.current && this.current !== p) this.current.stop(); p.setTry(true); },
    /* phones on screen get their prototype loaded and set up in the background, so a hover can start the flow on the spot */
    warmUp() {
      const order = (p) => PHONES.indexOf(p);
      const vis = PHONES.filter((p) => p.ratio >= 0.2 && p.el.isConnected).sort((a, b) => order(a) - order(b));
      PHONES.forEach((p) => { if (p.prep && !p.live && p.ratio < 0.1) { p.gen++; p.prep = null; p.prepDone = false; [p.next].forEach((f) => f && f.remove()); p.next = null; } });
      let n = PHONES.filter((p) => p.prep && !p.live).length;
      for (const p of vis) { if (n >= 5) break; if (!p.live && !p.prep && !p.tryMode) { p.prepare(); n++; } }
    },
    run(p) {
      this.current = p; this.last = PHONES.indexOf(p);
      p.runOnce().catch((e) => console.warn('[sajag-live]', e)).then(() => {
        if (this.current === p) { this.current = null; if (!this.taken) p.stop(); if (this.wakeRes) this.wakeRes(); }
      });
    },
    async loop() {
      for (;;) {
        await Promise.race([sleep(250), new Promise((r) => { this.wakeRes = r; })]); this.wakeRes = null;
        if (document.hidden) continue;
        this.warmUp();
        if (this.taken) { if (this.taken.tryMode) continue; this.taken = null; }
        if (this.forced) { const p = this.forced; this.forced = null; if (this.current && this.current !== p) this.current.stop(); if (this.current !== p) this.run(p); continue; }
        if (this.current) continue;
        const p = this.pickNext(); if (p) this.run(p);
      }
    },
  };

  /* ------------------------------------------------------------------ find the pictures and lay the phones over them */
  /* the colour behind the picture, so the cover blends in */
  function pageColor(el) {
    for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && c !== 'transparent' && c.split(' ').join('') !== 'rgba(0,0,0,0)') return c; }
    return '#fff';
  }
  function init() {
    JOURNEYS.forEach((j) => {
      const img = document.querySelector('.cs-canvas-block img[src*="' + j.img + '"]'); if (!img) return;
      const block = img.closest('.cs-canvas-block'); block.classList.add('sj-has-live');
      const layer = document.createElement('div'); layer.className = 'sj-layer'; block.appendChild(layer);
      if (j.cover && !REDUCED) { // hide the hands that were drawn in the picture; the live phones bring their own
        const [cx, cy, cw, ch] = j.cover.rect; const cv = document.createElement('div'); cv.className = 'sj-cover';
        Object.assign(cv.style, { left: (cx / IMG_W * 100) + '%', top: (cy / j.h * 100) + '%', width: (cw / IMG_W * 100) + '%', height: (ch / j.h * 100) + '%', backgroundColor: pageColor(block), webkitMaskImage: 'url(' + j.cover.src + ')', maskImage: 'url(' + j.cover.src + ')' });
        layer.appendChild(cv);
      }
      j.phones.forEach((p) => new LivePhone(layer, p, j.h));
    });
    SCHED.start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

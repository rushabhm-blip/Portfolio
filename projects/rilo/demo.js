/* RiloDemo: one user flow, played by the real Rilo app inside a phone frame.
 *   new RiloDemo(rootElement, flowDefinition, { eyebrow, autoplay })
 * It builds its own markup, loads the app lazily when it scrolls into view, pauses when it scrolls away and
 * unloads the app when it is far off screen, so a long page with four demos stays light.
 * Page options (URL): ?speed=2 (faster)  ?autoplay=0 (wait for Play)  ?debug=1 (log every step in the console)
 */
(() => {
  const Q = new URLSearchParams(location.search);
  const SPEED = Math.max(0.5, Math.min(6, +Q.get('speed') || 1));
  const AUTOPLAY = Q.get('autoplay') !== '0';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const TEMPLATE = (flow, o) => `
    <div class="d-grid">
      <div class="d-left">
        <div class="eyebrow">${esc(o.eyebrow || 'Prototype')}</div>
        <h2 class="d-title">${esc(o.title || 'See it work.')}</h2>
        <p class="d-sub">${esc(o.sub || 'The same flow, playing in the real app. Pause it, step through it, or take over.')}</p>
        <ol class="steps"></ol>
        <article class="now">
          <div class="eyebrow snum"></div>
          <h3 class="stitle"></h3>
          <div class="blk"><h4>What happens</h4><p class="swhat"></p></div>
          <div class="blk"><h4>Why it is designed this way</h4><p class="swhy"></p></div>
        </article>
        <div class="done" hidden><b>That is the end of this flow.</b><div class="row"><button class="btn again">Replay</button></div></div>
      </div>
      <div class="d-right">
        <div class="phone"><div class="bezel">
          <iframe title="Rilo app prototype: ${esc(flow.title)}" allow="geolocation"></iframe>
          <div class="loading"><div class="spin"></div><span>Loading the app…</span></div>
          <div class="tryhint">You are in control. Tap around the real app.</div>
        </div></div>
        <div class="controls" role="group" aria-label="Playback">
          <button class="ic prev" aria-label="Previous step"><svg viewBox="0 0 24 24"><path d="M6 5v14M19 5l-9 7 9 7z"/></svg></button>
          <button class="ic big play" aria-label="Pause"><svg class="playicon" viewBox="0 0 24 24"></svg></button>
          <button class="ic next" aria-label="Next step"><svg viewBox="0 0 24 24"><path d="M18 5v14M5 5l9 7-9 7z"/></svg></button>
          <button class="ic restart" aria-label="Restart flow"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg></button>
          <span class="sep"></span>
          <button class="try" aria-pressed="false">Try it yourself</button>
        </div>
      </div>
    </div>`;

  window.RiloDemo = function RiloDemo(root, flow, opts = {}) {
    root.innerHTML = TEMPLATE(flow, opts);
    const $ = (s) => root.querySelector(s);
    const frame = $('iframe'), loading = $('.loading'), steps = flow.steps;

    let si = 0, token = 0, userPaused = !(opts.autoplay ?? AUTOPLAY), ratio = 0, tryMode = false, finished = false, live = false;
    const cur = { sent: 0, step: -1 }; // how many ops of the current step have been sent
    let msgId = 0; const pending = new Map(); let readyRes = null;

    // ------------------------------------------------ talking to the app in the frame
    addEventListener('message', (e) => {
      if (e.source !== frame.contentWindow) return;
      const m = e.data; if (!m || m.rd !== 1) return;
      if (m.ready) readyRes?.(); else if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    });
    const send = (op, fast) => new Promise((res, rej) => {
      const id = ++msgId;
      const t = setTimeout(() => { pending.delete(id); rej(new Error('timeout ' + op.op)); }, 30000);
      pending.set(id, (m) => { clearTimeout(t); m.ok ? res() : rej(new Error(m.err)); });
      frame.contentWindow.postMessage({ rd: 1, id, fast: !!fast, speed: SPEED, ...op }, '*');
    });
    async function loadScene(scene) {
      loading.classList.remove('off');
      const ready = new Promise((r) => (readyRes = r));
      frame.src = `app/index.html?scene=${scene}&v=${Date.now()}`;
      await Promise.race([ready, sleep(25000)]);
      await sleep(500);
      loading.classList.add('off');
    }

    // ------------------------------------------------ drawing
    function drawSteps() {
      $('.steps').innerHTML = steps.map((s, i) => `<li data-i="${i}"><button aria-label="Step ${i + 1}: ${esc(s.title)}" title="${esc(s.title)}"><i></i></button></li>`).join('');
    }
    function drawStep(i, animate = true) {
      const s = steps[i]; si = i; cur.step = i; cur.sent = 0;
      $('.snum').textContent = `Step ${i + 1} of ${steps.length}`;
      $('.stitle').textContent = s.title; $('.swhat').textContent = s.what; $('.swhy').textContent = s.why;
      [...$('.steps').children].forEach((li, k) => { li.className = k < i ? 'passed' : k === i ? 'on' : ''; });
      if (animate) { const n = $('.now'); n.classList.remove('swap'); void n.offsetWidth; n.classList.add('swap'); }
    }
    const isOff = () => (document.hidden && Q.get('debug') !== '1') || ratio < 0.08; // scrolled away or tab hidden: hold still
    const gated = () => userPaused || isOff() || tryMode;
    function drawPlay() {
      const playing = !gated() && !finished;
      $('.playicon').innerHTML = playing ? '<path d="M7 5h3v14H7zM14 5h3v14h-3z" stroke="none"/>' : '<path d="M7 4.5v15l12-7.5z" stroke="none"/>';
      $('.play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }
    function fitPhone() {
      const col = $('.d-right').clientWidth || 420, avail = Math.max(420, innerHeight - 150);
      $('.phone').style.setProperty('--s', Math.max(0.5, Math.min(1, avail / 840, (col - 8) / 404)).toFixed(3));
    }
    addEventListener('resize', fitPhone);

    // ------------------------------------------------ running the flow
    const gate = async (my) => { while (gated() && my === token) await sleep(120); return my === token; };
    async function runOps(step, my, fast) {
      while (cur.sent < step.ops.length) {
        if (!fast && !(await gate(my))) return false;
        if (my !== token) return false;
        const op = step.ops[cur.sent++];
        try { if (op.op === 'scene') await loadScene(op.scene); else await send(op, fast); }
        catch (e) { console.warn('step op failed', flow.id, op, e.message); (window.__fails = window.__fails || []).push(`${flow.id}#${cur.step + 1} ${op.op} ${op.sel || op.scene || ''}: ${e.message.slice(0, 60)}`); }
      }
      return my === token;
    }
    async function play(from, my) {
      for (let k = from; k < steps.length; k++) {
        drawStep(k);
        if (!(await runOps(steps[k], my, false))) return;
        const hold = (steps[k].hold ?? 1800) / SPEED, t0 = Date.now();
        while (Date.now() - t0 < hold) { if (my !== token) return; if (gated()) { if (!(await gate(my))) return; break; } await sleep(100); }
        if (my !== token) return;
      }
      finished = true; drawPlay(); await send({ op: 'clear' }).catch(() => {});
      $('.done').hidden = false;
    }
    /** (Re)start at step `to`: reload the app, then replay earlier steps instantly. */
    async function start(to = 0) {
      const my = ++token; finished = false; tryMode = false; live = true;
      root.classList.remove('try-on'); $('.try').setAttribute('aria-pressed', 'false'); $('.done').hidden = true;
      drawSteps(); drawStep(Math.min(to, 0), false); drawPlay();
      await loadScene(flow.scene); if (my !== token) return;
      for (let k = 0; k < to; k++) { drawStep(k, false); if (!(await runOps(steps[k], my, true))) return; }
      await play(to, my);
    }
    /** Jump forward without reloading: finish the rest of this step quickly, then continue. */
    async function forwardTo(target) {
      const my = ++token; finished = false; $('.done').hidden = true;
      for (let k = cur.step; k < target; k++) { if (k !== cur.step) drawStep(k, false); if (k !== cur.step) cur.sent = 0; if (!(await runOps(steps[k], my, true))) return; }
      await send({ op: 'clear' }, true).catch(() => {});
      await play(target, my);
    }
    const go = (target) => { target = Math.max(0, target); if (target >= steps.length) return; if (!finished && target > cur.step) forwardTo(target); else start(target); };
    /** Unload the app when the demo is far off screen. */
    function destroy() {
      token++; live = false; finished = false; tryMode = false; root.classList.remove('try-on');
      frame.src = 'about:blank'; loading.classList.remove('off'); drawSteps(); drawStep(0, false); drawPlay(); $('.done').hidden = true;
    }

    // ------------------------------------------------ controls
    $('.steps').addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) go(+li.dataset.i); });
    $('.play').addEventListener('click', () => { if (!live) { userPaused = false; return start(0); } if (finished) { userPaused = false; return start(0); } if (tryMode) return setTry(false); userPaused = !userPaused; drawPlay(); });
    $('.prev').addEventListener('click', () => go(si > 0 ? si - 1 : 0));
    $('.next').addEventListener('click', () => { if (si + 1 < steps.length) go(si + 1); });
    $('.restart').addEventListener('click', () => { userPaused = false; start(0); });
    $('.again').addEventListener('click', () => { userPaused = false; start(0); });
    $('.try').addEventListener('click', () => setTry(!tryMode));
    function setTry(on) {
      tryMode = on; root.classList.toggle('try-on', on); $('.try').setAttribute('aria-pressed', String(on));
      send({ op: 'clear' }, true).catch(() => {});
      if (!on) { userPaused = false; start(Math.min(si, steps.length - 1)); } // pick the walkthrough up again from a clean state
      drawPlay();
    }

    // ------------------------------------------------ lazy start, auto pause, unload
    drawSteps(); drawStep(0, false); drawPlay(); fitPhone();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        ratio = e.intersectionRatio;
        if (ratio >= 0.3 && !live) start(0);
        drawPlay();
      }, { threshold: [0, 0.08, 0.3, 0.6] }).observe(root);
      new IntersectionObserver(([e]) => { if (!e.isIntersecting && live) destroy(); }, { rootMargin: '120% 0px 120% 0px' }).observe(root);
    } else start(0);
    document.addEventListener('visibilitychange', drawPlay);
    new ResizeObserver(fitPhone).observe($('.d-right'));
    return { start, destroy };
  };
})();

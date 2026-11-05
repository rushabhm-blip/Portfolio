/* Munshiji docs agent (adapted from the Sajag one).
 * Loaded by demo/index.html, but inert unless the page is opened with ?docs=1 (so the plain prototype is unchanged).
 * The case-study page embeds this app in an iframe and sends it small commands ("tap this", "type that", "show a tip"),
 * the same idea as the Rilo documentation. The agent draws a touch point, a highlight and a caption inside the app,
 * then performs the real interaction on the real UI.
 *
 * Messages in:  { sj:1, id, op, ...args, fast }     Messages out: { sj:1, id, ok, err } and { sj:1, ready:true }
 * ops: boot{to} · tap{sel,text,nth,dx,dy} · type{sel,value} · say{text} · drag{from,to,steps,ms,hold}
 *      press{sel,text,ms} · scroll{sel,top} · spot{sel,text,pad} · tip{text,sel,pos|y} · waitFor{sel,text,gone,ms}
 *      mock{fn,args} · clear · ping
 */
(() => {
  const Q = new URLSearchParams(location.search);
  if (!Q.has('docs')) return;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  /* ---------- quiet stand-ins for the microphone and the speaker, so a docs page never asks for permissions ---------- */
  class FakeRecognition {
    constructor() { this.onstart = this.onresult = this.onerror = this.onend = null; this.running = false; }
    start() { if (this.running) return; this.running = true; setTimeout(() => this.onstart && this.onstart(), 30); window.__sjRec = this; }
    stop() { this.running = false; setTimeout(() => this.onend && this.onend(), 30); }
    abort() { this.running = false; }
  }
  window.SpeechRecognition = window.webkitSpeechRecognition = FakeRecognition;
  try {
    const syn = window.speechSynthesis;
    if (syn) { syn.speak = (u) => { setTimeout(() => u && u.onend && u.onend({}), 900); }; syn.cancel = () => {}; }
  } catch (e) {}

  try { navigator.vibrate = () => false; } catch (e) {} // no buzzing from a documentation page

  /* every run starts from a clean app: progress is kept in memory only, so runs never leak into each other
     (or into the visitor's own copy of the demo, which shares this origin) */
  try {
    const mem = {};
    const fake = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; }, clear: () => { for (const k in mem) delete mem[k]; }, key: (i) => Object.keys(mem)[i] || null, get length() { return Object.keys(mem).length; } };
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => fake });
  } catch (e) {}

  /* a documentation page must never start talking: audio plays muted until the visitor takes over ('unmute') */
  let QUIET = true;
  const _play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { if (QUIET) this.muted = true; return _play.apply(this, arguments); };

  /* ---------- overlay: touch point, highlight ring, caption ---------- */
  const css = document.createElement('style');
  css.textContent = `
  #sj-layer{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:'Google Sans','Inter',system-ui,sans-serif}
  #sj-touch{position:absolute;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;
    background:radial-gradient(circle,rgba(124,77,255,.55) 0 38%,rgba(124,77,255,.22) 40% 100%);border:2px solid rgba(255,255,255,.95);
    box-shadow:0 4px 14px rgba(11,21,40,.35);opacity:0;transform:translate(-100px,-100px) scale(1);transition:transform .55s cubic-bezier(.22,.8,.2,1),opacity .25s}
  #sj-touch.on{opacity:1}#sj-touch.down{transition-duration:.12s;transform-origin:center}
  .sj-rip{position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:3px solid #7C4DFF;opacity:.9;animation:sjrip .6s ease-out forwards}
  @keyframes sjrip{to{transform:scale(2.6);opacity:0}}
  #sj-spot{position:absolute;border-radius:14px;border:2.5px solid #7C4DFF;box-shadow:0 0 0 4px rgba(124,77,255,.22);opacity:0;transition:all .35s cubic-bezier(.22,.8,.2,1)}
  #sj-spot.on{opacity:1;animation:sjpulse 1.6s ease-in-out infinite}
  @keyframes sjpulse{50%{box-shadow:0 0 0 9px rgba(124,77,255,.10)}}
  #sj-touch.hand{background:none;border:0;box-shadow:none}
    #sj-tip{position:absolute;left:12px;right:12px;max-width:340px;margin:0 auto;background:#1d1830;color:#fff;font-size:12.5px;line-height:1.35;font-weight:600;
    padding:9px 12px;border-radius:12px;box-shadow:0 8px 24px rgba(11,21,40,.35);opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s}
  #sj-tip.on{opacity:1;transform:none}
  #sj-tip:before{content:"";position:absolute;left:var(--ax,50%);width:10px;height:10px;background:#1d1830;transform:translateX(-50%) rotate(45deg)}
  #sj-tip.below:before{top:-4px}#sj-tip.above:before{bottom:-4px}
  `;
  document.head.appendChild(css);
  const layer = document.createElement('div'); layer.id = 'sj-layer';
  layer.innerHTML = '<div id="sj-spot"></div><div id="sj-touch"></div><div id="sj-tip"></div>';
  document.body.appendChild(layer);
  const touch = layer.querySelector('#sj-touch'), spotEl = layer.querySelector('#sj-spot'), tipEl = layer.querySelector('#sj-tip');
  if (Q.has('hand')) {
    // the hand is drawn by the page around the phone, so it can reach out over the frame: here we only say where the finger is
    touch.classList.add('hand');
    const report = () => {
      const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)(?:\s*scale\(([\d.]+)\))?/.exec(touch.style.transform || '');
      parent.postMessage({ sj: 1, touch: { x: m ? +m[1] : -100, y: m ? +m[2] : -100, on: touch.classList.contains('on'), down: touch.classList.contains('down') || !!(m && m[3] && +m[3] < 0.9) } }, '*');
    };
    new MutationObserver(report).observe(touch, { attributes: true, attributeFilter: ['style', 'class'] });
  }
  let tx = -100, ty = -100;

  const visible = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const labelOf = (e) => norm(e.innerText || e.value || e.getAttribute('aria-label') || e.placeholder || e.title || '');
  const CLICKABLE = 'button,[role=button],a,input,textarea,select,label,[onclick],[tabindex]';
  function find(o) {
    let list;
    if (o.sel) list = [...document.querySelectorAll(o.sel)];
    else list = [...document.querySelectorAll(CLICKABLE)];
    if (o.text) {
      const t = norm(o.text).toLowerCase();
      let m = list.filter((e) => labelOf(e).toLowerCase().includes(t));
      if (!m.length && !o.sel) { // fall back to any element whose own text matches
        m = [...document.querySelectorAll('body *')].filter((e) => !e.children.length && norm(e.textContent).toLowerCase().includes(t));
      }
      list = m;
    }
    list = list.filter(visible).filter((e) => !layer.contains(e));
    if (o.exact) list = list.filter((e) => labelOf(e).toLowerCase() === norm(o.text).toLowerCase());
    // prefer the innermost match so we do not click a whole page container
    list.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height);
    return list[o.nth || 0] || null;
  }
  async function waitEl(o, ms = 9000) {
    const t0 = Date.now();
    for (;;) {
      const e = find(o); if (e) return e;
      if (Date.now() - t0 > ms) throw new Error('not found: ' + (o.sel || '') + ' ' + (o.text || ''));
      await sleep(80);
    }
  }
  const center = (e, o = {}) => { const r = e.getBoundingClientRect(); return [r.left + (o.dx != null ? o.dx : r.width / 2), r.top + (o.dy != null ? o.dy : r.height / 2)]; };

  async function moveTouch(x, y, fast) {
    touch.classList.add('on');
    if (fast) { touch.style.transition = 'none'; touch.style.transform = `translate(${x}px,${y}px)`; void touch.offsetWidth; touch.style.transition = ''; tx = x; ty = y; return; }
    touch.style.transform = `translate(${x}px,${y}px) scale(1)`; tx = x; ty = y; await sleep(560);
  }
  function ripple(x, y) { const r = document.createElement('div'); r.className = 'sj-rip'; r.style.left = x + 'px'; r.style.top = y + 'px'; layer.appendChild(r); setTimeout(() => r.remove(), 700); }
  function fire(target, x, y, types) {
    const base = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0, pointerId: 1, pointerType: 'touch', isPrimary: true };
    for (const t of types) {
      let ev;
      if (t.startsWith('pointer')) ev = new PointerEvent(t, { ...base, buttons: t === 'pointerup' ? 0 : 1 });
      else ev = new MouseEvent(t, { ...base, buttons: t === 'mouseup' || t === 'click' ? 0 : 1 });
      target.dispatchEvent(ev);
    }
  }
  const pick = (el, x, y) => { const t = document.elementFromPoint(x, y); return t && (el.contains(t) || t.contains(el)) ? t : el; };

  let held = null;
  const OPS = {
    async ping() {},
    async unmute() { QUIET = false; document.querySelectorAll('audio,video').forEach((m) => { m.muted = false; }); },
    async mute() { QUIET = true; document.querySelectorAll('audio,video').forEach((m) => { m.muted = true; }); },
    async release(o, fast) {
      if (!held) return; const { te, xe, ye } = held; held = null; touch.classList.remove('down');
      fire(te, xe, ye, ['pointerup', 'mouseup']);
      if (!fast) { touch.style.transform = `translate(${xe}px,${ye}px) scale(1)`; await sleep(350); }
    },
    async boot(o, fast) {
      // the app opens on Home (or on the screen named in the URL: ?tab= / ?screen=); wait for it, then go where the script asks
      await waitEl({ text: 'Your Gullak' }, 20000);
      await sleep(250);
      const to = o.to || 'home';
      if (to !== 'home') {
        const label = to[0].toUpperCase() + to.slice(1);
        let nav = null;
        for (let i = 0; i < 80 && !nav; i++) {
          const all = [...document.querySelectorAll('button')].filter((b) => visible(b) && labelOf(b).toLowerCase() === label.toLowerCase());
          nav = all[all.length - 1] || null; if (!nav) await sleep(100);
        }
        if (!nav) throw new Error('no nav ' + label);
        nav.click(); await sleep(500);
      }
      await sleep(fast ? 200 : 500);
    },
    async tap(o, fast) {
      let el;
      try { el = await waitEl(o, o.opt ? 1500 : 9000); } catch (e) { if (o.opt) return; throw e; } // opt: the tap is optional (the app may already have moved on)
      try { el.scrollIntoView({ block: 'nearest' }); } catch (e) {}
      await sleep(fast ? 0 : 60);
      const [x, y] = center(el, o);
      if (!fast) { await moveTouch(x, y); touch.classList.add('down'); touch.style.transform = `translate(${x}px,${y}px) scale(.82)`; ripple(x, y); await sleep(140); }
      const t = pick(el, x, y);
      fire(t, x, y, ['pointerdown', 'mousedown', 'pointerup', 'mouseup']);
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') t.focus();
      fire(t, x, y, ['click']);
      if (!fast) { touch.style.transform = `translate(${x}px,${y}px) scale(1)`; touch.classList.remove('down'); await sleep(o.after != null ? o.after : 450); }
    },
    async press(o, fast) { // long press
      const el = await waitEl(o); const [x, y] = center(el, o); const t = pick(el, x, y);
      if (!fast) { await moveTouch(x, y); ripple(x, y); touch.style.transform = `translate(${x}px,${y}px) scale(.8)`; }
      fire(t, x, y, ['pointerdown', 'mousedown']); await sleep(fast ? 50 : o.ms || 900);
      fire(t, x, y, ['pointerup', 'mouseup', 'click']);
      if (!fast) { touch.style.transform = `translate(${x}px,${y}px) scale(1)`; await sleep(300); }
    },
    async drag(o, fast) {
      const el = await waitEl(o.sel ? { sel: o.sel } : { sel: 'body' });
      const pts = o.path; const steps = o.steps || 14;
      const [x0, y0] = pts[0]; const t = document.elementFromPoint(x0, y0) || el;
      if (!fast) { await moveTouch(x0, y0); touch.style.transform = `translate(${x0}px,${y0}px) scale(.82)`; ripple(x0, y0); }
      touch.classList.add('down'); fire(t, x0, y0, ['pointerdown', 'mousedown']);
      if (o.hold) await sleep(fast ? Math.min(o.hold, 350) : o.hold);
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
        for (let s = 1; s <= steps; s++) {
          const x = ax + (bx - ax) * s / steps, y = ay + (by - ay) * s / steps;
          const tt = document.elementFromPoint(x, y) || t;
          fire(tt, x, y, ['pointermove', 'mousemove']);
          if (!fast) { touch.style.transform = `translate(${x}px,${y}px) scale(.82)`; await sleep((o.ms || 700) / (steps * (pts.length - 1))); } else await sleep(22);
        }
      }
      const [xe, ye] = pts[pts.length - 1]; const te = document.elementFromPoint(xe, ye) || t;
      if (o.noRelease) { held = { te, xe, ye }; return; }
      touch.classList.remove('down'); fire(te, xe, ye, ['pointerup', 'mouseup']);
      if (!fast) { touch.style.transform = `translate(${xe}px,${ye}px) scale(1)`; await sleep(350); }
    },
    async type(o, fast) {
      const el = await waitEl(o);
      if (!fast) { const [x, y] = center(el); await moveTouch(x, y); ripple(x, y); await sleep(200); }
      el.focus();
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const set = Object.getOwnPropertyDescriptor(proto, 'value').set;
      let cur = '';
      for (const ch of o.value) { cur += ch; set.call(el, cur); el.dispatchEvent(new Event('input', { bubbles: true })); if (!fast) await sleep(55); }
      el.dispatchEvent(new Event('change', { bubbles: true }));
      if (!fast) await sleep(250);
    },
    async say(o, fast) { // pretend the microphone heard something
      const rec = window.__sjRec; if (!rec) throw new Error('no recogniser');
      const words = o.text.split(' '); const mk = (txt, fin) => ({ resultIndex: 0, results: [Object.assign([{ transcript: txt }], { isFinal: fin })] });
      let acc = '';
      for (const w of words) { acc += (acc ? ' ' : '') + w; rec.onresult && rec.onresult(mk(acc, false)); if (!fast) await sleep(170); }
      rec.onresult && rec.onresult(mk(o.text, true));
      rec.running = false; rec.onend && rec.onend();
    },
    async scroll(o) {
      let best = null, area = 0;
      for (const e of document.querySelectorAll('body *')) {
        if (layer.contains(e) || e.scrollHeight <= e.clientHeight + 20) continue;
        const oy = getComputedStyle(e).overflowY; if (oy !== 'auto' && oy !== 'scroll') continue;
        const r = e.getBoundingClientRect(); const ar = r.width * r.height; if (ar > area) { area = ar; best = e; }
      }
      if (best) best.scrollTo({ top: o.top, behavior: 'smooth' });
      await sleep(600);
    },
    async spot(o) {
      const el = await waitEl(o); const r = el.getBoundingClientRect(); const p = o.pad != null ? o.pad : 5;
      Object.assign(spotEl.style, { left: r.left - p + 'px', top: r.top - p + 'px', width: r.width + p * 2 + 'px', height: r.height + p * 2 + 'px' });
      spotEl.classList.add('on');
    },
    async tip(o) {
      tipEl.textContent = o.text; let top;
      if (o.of || o.at) {
        const el = o.of ? await waitEl(o.of) : null; const r = el ? el.getBoundingClientRect() : { top: o.at, bottom: o.at, left: 0, width: innerWidth };
        const below = (o.pos || 'below') === 'below';
        tipEl.className = below ? 'below' : 'above'; tipEl.style.visibility = 'hidden'; tipEl.classList.add('on');
        const h = tipEl.offsetHeight; top = below ? r.bottom + 12 : r.top - h - 12;
        top = Math.max(8, Math.min(innerHeight - h - 8, top));
        const cx = r.left + r.width / 2; const tr = tipEl.getBoundingClientRect();
        tipEl.style.setProperty('--ax', Math.max(18, Math.min(tr.width - 18, cx - tr.left)) + 'px'); tipEl.style.visibility = '';
      } else { tipEl.className = ''; top = o.y != null ? o.y : 64; tipEl.style.setProperty('--ax', '-20px'); }
      tipEl.style.top = top + 'px'; void tipEl.offsetWidth; tipEl.classList.add('on');
    },
    async clear() { spotEl.classList.remove('on'); tipEl.classList.remove('on'); },
    async hideTouch() { touch.classList.remove('on'); },
    async waitFor(o) {
      const t0 = Date.now(); const ms = o.ms || 9000;
      for (;;) {
        const e = find(o);
        if (o.gone ? !e : e) return;
        if (Date.now() - t0 > ms) throw new Error('waitFor timeout ' + (o.sel || '') + ' ' + (o.text || ''));
        await sleep(80);
      }
    },
    async mock(o) { const fn = MOCKS[o.fn]; if (!fn) throw new Error('no mock ' + o.fn); await fn(...(o.args || [])); },
  };

  /* helpers the scripts can call for things that normally need hardware (the power-button rhythm, GPS) */
  const MOCKS = {};
  window.__sjMocks = MOCKS;

  addEventListener('message', async (e) => {
    const m = e.data; if (!m || m.sj !== 1 || !m.op) return;
    const reply = (x) => e.source && e.source.postMessage({ sj: 1, id: m.id, ...x }, '*');
    try { const fn = OPS[m.op]; if (!fn) throw new Error('unknown op ' + m.op); await fn(m, !!m.fast); reply({ ok: true }); }
    catch (err) { reply({ ok: false, err: String(err.message || err) }); }
  });

  const announce = () => parent.postMessage({ sj: 1, ready: true }, '*');
  const iv = setInterval(() => { if (document.querySelector('button')) { clearInterval(iv); announce(); } }, 100);
})();

/* test helpers for the author: open the app with ?docs=1&dev=1 and use  S({op:'tap',text:'Explore'})  /  L()  in the console */
if (new URLSearchParams(location.search).has('dev')) {
  let n = 0;
  window.S = (op, fast) => new Promise((res) => { const id = ++n; const h = (e) => { if (e.data && e.data.sj === 1 && e.data.id === id && 'ok' in e.data) { removeEventListener('message', h); res(e.data); } }; addEventListener('message', h); postMessage({ sj: 1, id, fast, ...op }, '*'); });
  window.sl = (ms) => new Promise((r) => setTimeout(r, ms));
  window.LB = () => [...document.querySelectorAll('button,[role=button],input,textarea,select')].filter((e) => e.offsetParent !== null || getComputedStyle(e).position === 'fixed').map((e) => (e.innerText || e.placeholder || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 26)).filter((x) => x).join(' | ');
  window.TX = () => document.body.innerText.replace(/\n+/g, ' / ').slice(0, 500);
}

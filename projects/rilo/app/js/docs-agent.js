/* Rilo docs mode: the "hand" inside the phone.
 * The flow player (parent page) sends steps by postMessage; this draws the finger, tap ripples, spotlight and callouts
 * on top of the real app and performs the taps/typing on the real interface. Nothing here is faked: the app reacts as it would for a rider.
 */
(() => {
  if (window.top === window) return; // only when shown inside the player
  const css = `
  #rd{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
  #rd .lock{position:absolute;inset:0;pointer-events:auto;background:transparent;display:none;cursor:default}
  #rd.locked .lock{display:block}
  #rd .spot{position:absolute;border-radius:18px;box-shadow:0 0 0 100vmax rgba(5,5,5,.66);border:2px solid #DFFF00;opacity:0;transition:all .45s cubic-bezier(.2,.8,.2,1)}
  #rd .spot.on{opacity:1;animation:rdPulse 1.8s ease-in-out infinite}
  @keyframes rdPulse{0%,100%{border-color:#DFFF00}50%{border-color:#DFFF0066}}
  #rd .cur{position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:radial-gradient(circle,#fff 0 22%,#ffffffcc 23% 38%,#ffffff55 39%);box-shadow:0 6px 18px #000a;opacity:0;transform:translate(-100px,-100px) scale(1);transition:transform .6s cubic-bezier(.3,.7,.2,1),opacity .25s}
  #rd .cur.on{opacity:1}
  #rd .cur.down{filter:brightness(.8)}
  #rd .cur i{position:absolute;inset:0;border-radius:50%;border:2px solid #DFFF00;opacity:0;transform:scale(.6)}
  #rd .cur.down i{opacity:1;transform:scale(1.2);transition:transform .7s linear}
  #rd .rip{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:3px solid #DFFF00;animation:rdRip .7s ease-out forwards}
  @keyframes rdRip{from{transform:scale(.4);opacity:.95}to{transform:scale(4.2);opacity:0}}
  #rd .tip{position:absolute;max-width:236px;background:#DFFF00;color:#0a0a0a;font-weight:700;font-size:13px;line-height:1.32;padding:9px 12px;border-radius:12px;box-shadow:0 10px 26px #000a;opacity:0;transform:translateY(6px) scale(.96);transition:opacity .3s,transform .3s}
  #rd .tip.on{opacity:1;transform:none}
  #rd .tip:after{content:"";position:absolute;left:var(--ax,50%);width:10px;height:10px;background:#DFFF00;transform:translateX(-50%) rotate(45deg)}
  #rd .tip.up:after{bottom:-4px}#rd .tip.dn:after{top:-4px}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const root = document.createElement('div'); root.id = 'rd';
  root.innerHTML = '<div class="lock"></div><div class="spot"></div><div class="tip"></div><div class="cur"><i></i></div>';
  const add = () => document.body.appendChild(root);
  document.body ? add() : addEventListener('DOMContentLoaded', add);
  const spotEl = root.querySelector('.spot'), tipEl = root.querySelector('.tip'), cur = root.querySelector('.cur'), lock = root.querySelector('.lock');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let fast = false, speed = 1; const T = (ms) => (fast ? 0 : ms / speed);

  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden]'); };
  const find = (o) => {
    const list = [...document.querySelectorAll(o.sel)].filter((e) => !root.contains(e) && vis(e));
    let withText = o.text ? list.filter((e) => (e.innerText || e.textContent || '').toLowerCase().includes(o.text.toLowerCase())) : list;
    if (o.val) withText = withText.filter((e) => String(e.value || '').toLowerCase().includes(o.val.toLowerCase()));
    return o.last ? withText[withText.length - 1] : withText[o.nth || 0];
  };
  async function waitFor(o, timeout = 9000) {
    const t0 = Date.now();
    for (;;) { const e = find(o); if (e) return e; if (Date.now() - t0 > timeout) throw new Error('not found: ' + JSON.stringify(o)); await sleep(100); }
  }
  const center = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; };
  async function bringIntoView(el) {
    const r = el.getBoundingClientRect(), h = innerHeight;
    if (r.top < 60 || r.bottom > h - 90) { el.scrollIntoView({ block: 'center', behavior: fast ? 'instant' : 'smooth' }); await sleep(T(450)); }
  }
  async function moveTo(x, y) { cur.classList.add('on'); cur.style.transform = `translate(${x}px,${y}px)`; await sleep(T(620)); }
  function ripple(x, y) { const r = document.createElement('div'); r.className = 'rip'; r.style.left = x + 'px'; r.style.top = y + 'px'; root.appendChild(r); setTimeout(() => r.remove(), 760); }
  const mouse = (type, x, y) => new MouseEvent(type, { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y });
  const ptr = (type, x, y) => new PointerEvent(type, { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, pointerId: 1, pointerType: 'touch', isPrimary: true });

  const ops = {
    async tap(o) {
      const el = await waitFor(o); await bringIntoView(el);
      const { x, y } = center(el);
      await moveTo(x, y);
      if (!fast) ripple(x, y);
      cur.classList.add('down'); await sleep(T(140)); cur.classList.remove('down');
      const t = find(o) || el; // the app redraws lists every second: tap the live element, not the one found earlier
      t.dispatchEvent(ptr('pointerdown', x, y)); t.dispatchEvent(ptr('pointerup', x, y));
      t.dispatchEvent(mouse('mousedown', x, y)); t.dispatchEvent(mouse('mouseup', x, y)); t.dispatchEvent(mouse('click', x, y));
      await sleep(T(250));
    },
    async hold(o) {
      const el = await waitFor(o); await bringIntoView(el);
      const { x, y } = center(el); await moveTo(x, y);
      const t = find(o) || el;
      cur.classList.add('down'); t.dispatchEvent(ptr('pointerdown', x, y));
      await sleep(Math.max(o.ms || 900, 800)); // the app's hold threshold is real time: never shortened by speed
      t.dispatchEvent(ptr('pointerup', x, y)); cur.classList.remove('down'); await sleep(T(250));
    },
    async type(o) {
      const el = await waitFor(o); await bringIntoView(el);
      const { x, y } = center(el); await moveTo(x, y); if (!fast) ripple(x, y);
      el.focus({ preventScroll: true });
      el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true }));
      for (const ch of o.value) { el.value += ch; el.dispatchEvent(new Event('input', { bubbles: true })); await sleep(T(o.speed || 70)); }
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(T(200));
    },
    async spot(o) {
      if (!o.sel) { spotEl.classList.remove('on'); return; }
      const el = await waitFor(o); await bringIntoView(el);
      const r = el.getBoundingClientRect(), pad = o.pad ?? 6;
      Object.assign(spotEl.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px', borderRadius: (o.round ? '50%' : '16px') });
      spotEl.classList.add('on'); await sleep(T(300));
    },
    async tip(o) {
      tipEl.classList.remove('on');
      if (!o.text) return;
      const el = o.sel ? await waitFor({ sel: o.sel }) : null; if (el) await bringIntoView(el); // o.text here is the callout wording, not an element filter
      await sleep(T(120));
      tipEl.textContent = o.text;
      const r = el ? el.getBoundingClientRect() : { left: 20, right: innerWidth - 20, top: innerHeight / 2, bottom: innerHeight / 2, width: innerWidth - 40 };
      const w = Math.min(236, innerWidth - 24);
      let left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
      const below = o.pos ? o.pos === 'below' : r.top < 180;
      tipEl.style.width = 'max-content'; tipEl.style.maxWidth = w + 'px'; tipEl.style.left = left + 'px';
      tipEl.classList.toggle('dn', below); tipEl.classList.toggle('up', !below);
      tipEl.style.setProperty('--ax', Math.max(18, Math.min(w - 18, r.left + r.width / 2 - left)) + 'px');
      tipEl.style.top = '0px'; tipEl.style.bottom = 'auto';
      const th = tipEl.offsetHeight;
      tipEl.style.top = (below ? r.bottom + 14 : Math.max(8, r.top - th - 14)) + 'px';
      tipEl.classList.add('on'); await sleep(T(200));
    },
    async clear() { spotEl.classList.remove('on'); tipEl.classList.remove('on'); cur.classList.remove('on'); },
    async hash(o) { location.hash = o.to; await sleep(T(400)); },
    async wait(o) { await sleep(T(o.ms)); },
    async waitFor(o) { await waitFor(o, o.timeout || 15000); },
    async lock(o) { root.classList.toggle('locked', !!o.on); },
    async mock(o) { await window.RiloMock.ready; window.RiloMock[o.fn](...(o.args || [])); },
    async scroll(o) { const el = await waitFor(o); el.scrollIntoView({ block: o.block || 'center', behavior: fast ? 'instant' : 'smooth' }); await sleep(T(500)); },
    async wipe() { try { localStorage.clear(); } catch {} },
  };

  try { window.__rdDebug = /debug=1/.test(parent.location.search); } catch {}
  let queue = Promise.resolve(); // steps run strictly one after another, even if the player skips ahead
  addEventListener('message', (e) => {
    const m = e.data; if (!m || m.rd !== 1) return;
    queue = queue.then(async () => {
      fast = !!m.fast; speed = m.speed || 1;
      const t0 = Date.now();
      try { await ops[m.op](m); if (window.__rdDebug) console.log('[rd] ok', m.op, m.sel || '', Date.now() - t0 + 'ms'); parent.postMessage({ rd: 1, id: m.id, ok: true }, '*'); }
      catch (err) { if (window.__rdDebug) console.log('[rd] FAIL', m.op, m.sel || '', Date.now() - t0 + 'ms', err.message); parent.postMessage({ rd: 1, id: m.id, ok: false, err: String(err.message || err) }, '*'); }
    });
  });
  // tell the player the page is up
  (window.RiloMock?.ready || Promise.resolve()).then(() => setTimeout(() => parent.postMessage({ rd: 1, ready: true }, '*'), 400));
})();

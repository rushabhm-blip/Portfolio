// Ride screens: waiting room, live map, ride summary, and the click actions that belong to them.
import { ic, esc, initials, avatarHTML, hav, progress, pointAt, fmtKm, fmtDur, mapsLink } from './lib.js';
import { keepAwake } from './live.js';
import { navIcon, lower, bearing } from './nav.js';
import { DB, save, $, $$, toast, say, go, modal, closeModals, mkMap, mkMarker, drawRoute, fit, fmtWhen, whenReady, fadeOut } from './core.js';
import {
  LV, SIG, NEED, riderView, rideSend, rideHelpers, leaveRide, navTick, etaInfo, setGuidance, roleLabel, canPlan, isHost, nextStop,
  sendSignal, sendAssist, openAssistMenu, openNearby, shareRide, copyCode,
} from './ride.js';
import { stopInfo, reopenStop, kindOf, gauge, pctCls } from './group.js';

const { relPhrase, announce, showAlert, riderRow, barsHTML, enter, loadFail, shareUrl } = rideHelpers;
const SPIN = '<span class="spin"></span>';
const tagOf = (r) => (r.isMe ? `You${r.role === 'leader' ? ' · Leader' : r.role === 'tail' ? ' · Tail' : ''}` : r.role === 'leader' ? 'Leader' : r.role === 'tail' ? 'Tail' : '');
const pinHTML = (r) => `<div class="pin ${r.isMe ? 'me' : ''} ${r.link === 'lost' ? 'off' : ''}" style="--c:${r.color}">${avatarHTML(r)}${r.bat != null && r.bat <= 20 && !r.chg ? '<i class="b"></i>' : ''}</div>${tagOf(r) ? `<span class="ptag">${esc(tagOf(r))}</span>` : ''}`;
/** Slide a map marker to its new position instead of jumping (matches the 0.9 s camera glide). */
function glide(mk, to, ms = 900) {
  const from = mk._ll || to;
  mk._ll = to; cancelAnimationFrame(mk._raf);
  if (from[0] === to[0] && from[1] === to[1]) return;
  if (Math.abs(from[0] - to[0]) + Math.abs(from[1] - to[1]) > 0.05) return mk.setLngLat(to); // big jump: don't animate across the map
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    mk.setLngLat([from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e]);
    if (k < 1) mk._raf = requestAnimationFrame(step);
  };
  mk._raf = requestAnimationFrame(step);
}
// the radial menu: [action, angle, icon, label]; SOS sits at the top, Fuel to the left. (Wait for me is still available by voice and in Add a stop.)
const FAN = [['fuel', 180, 'fuel', 'Fuel'], ['break', 150, 'coffee', 'Break'], ['hazard', 120, 'alert', 'Hazard'], ['sos', 90, '', 'SOS']];
const fanItem = ([k, deg, icn, label], i) => {
  const r = 118, t = (deg * Math.PI) / 180, dx = Math.round(r * Math.cos(t)), dy = -Math.round(r * Math.sin(t));
  const attrs = k === 'hazard' ? 'data-act="hazard"' : k === 'sos' ? 'data-act="assist" data-need="sos"' : `data-act="signal" data-kind="${k}"`;
  return `<div class="fw item" style="--dx:${dx}px;--dy:${dy}px;--i:${i}"><button class="fbtn ${k === 'sos' ? 'sos' : ''}" ${attrs} aria-label="${label}" title="${label}">${k === 'sos' ? 'SOS' : ic(icn, 24)}</button></div>`;
};
/** Long press on the hand button = tell the whole group to stop where you are. A ring fills while you hold. */
function holdToStop() {
  const b = $('#stopbtn'); if (!b) return;
  const HOLD = 650; let t;
  const cancel = () => { clearTimeout(t); b.classList.remove('holding'); };
  b.addEventListener('pointerdown', () => {
    b._held = false; b.classList.add('holding');
    t = setTimeout(() => {
      b._held = true; b.classList.remove('holding'); $('#fabs')?.classList.remove('picking');
      if (!LV.pos) return say('Waiting for your location', { err: true });
      sendSignal('stop');
    }, HOLD);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, cancel));
  b.addEventListener('contextmenu', (e) => e.preventDefault());
}
/** The small card that opens when you tap someone's pin: only what matters while riding. */
function pinCard(x) {
  const lost = x.link === 'lost', weak = x.link === 'weak';
  const g = x.gap;
  const where = x.isMe ? `${(x.km || 0).toFixed(1)} km ridden`
    : !x.pos ? 'No location yet'
    : g == null ? `${fmtKm(LV.pos ? hav([LV.pos.lat, LV.pos.lng], [x.pos.lat, x.pos.lng]) : 0)} away`
    : Math.abs(g) < 50 ? 'With you'
    : `${fmtKm(Math.abs(g))} ${g > 0 ? 'ahead' : 'behind'}`;
  const conn = lost ? `No signal${x.ageNow > 60000 ? ' · ' + Math.round(x.ageNow / 60000) + ' min ago' : ''}` : weak ? 'Weak signal' : 'Live';
  return `<div class="rp"><div class="rp-top"><b>${x.isMe ? 'You' : esc(x.name)}</b><span>${esc(roleLabel(x))}</span></div>
    <div class="rp-dist">${where}</div>
    <div class="rp-row"><span class="pctw">${gauge(x.bat, x.chg)}<b class="pct ${pctCls(x.bat)}">${x.bat == null ? '—' : x.bat + '%'}</b></span>${x.spd > 1 ? `<span class="rp-chip">${Math.round(x.spd)} km/h</span>` : '<span class="rp-chip">Stopped</span>'}<span class="rp-chip ${lost ? 'bad' : weak ? 'warn' : 'ok'}">${conn}</span></div></div>`;
}
const rowPin = (x) => `<div class="pin sm ${x.link === 'lost' ? 'off' : ''}" style="--c:${x.color}">${avatarHTML(x)}</div>`;

// ---------- LOBBY (waiting room) ----------
export async function lobbyScreen(code) {
  if (!(await enter(code))) return loadFail;
  if (LV.pending && !LV.ride) { // the organiser has to approve this join request
    return {
      html: `<div class="screen nonav"><button class="back" data-act="leave">${ic('back')} Home</button>
        <div style="display:grid;place-items:center;text-align:center;min-height:60%;gap:12px"><div class="bigspin"></div><h2>Request sent</h2>
        <p class="muted">Waiting for ${esc(LV.hostName || 'the organiser')} to approve you. This screen updates on its own.</p></div></div>`,
      mount() { LV.ui = { all: () => go('#/lobby/' + code), riders: () => {}, conn: () => {} }; },
      unmount() { LV.ui = null; },
    };
  }
  if (LV.ride.status === 'live') return { redirect: '#/live/' + code };
  if (LV.ride.status === 'ended') return { redirect: '#/summary/' + code };
  let map, dead = false, routeH;
  const qr = () => {
    try { const q = qrcode(0, 'M'); q.addData(shareUrl()); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch { return ''; }
  };
  const r0 = LV.ride;
  const html = `<div class="screen">
    <button class="back" data-act="nav" data-to="#/home">${ic('back')} Home</button>
    <h2 id="lname">${esc(r0.name)}</h2>
    <p class="muted" id="lsub" style="margin:4px 0 14px"></p>
    <div class="card" id="lplan"></div>
    <div class="card" style="margin-top:10px"><div class="codecard"><div class="sp"><div class="muted" style="font-size:12px;font-weight:600">RIDE CODE</div><div class="code">${esc(code)}</div>
      <div class="row" style="margin-top:10px"><button class="btn sm primary" data-act="share">${ic('share', 16)} Invite</button><button class="btn sm" data-act="copy">${ic('copy', 16)} Copy</button></div></div>
      ${qr() ? `<div class="qr">${qr()}</div>` : ''}</div>${r0.approval ? `<p class="note" style="text-align:left;margin-top:10px">${ic('check', 14)} You approve each join request.</p>` : ''}</div>
    <div class="map box" id="lmap" style="margin-top:12px"></div>
    <div id="lreq"></div>
    <div class="sec"><h3>Riders · <span id="lcount"></span></h3></div><p class="muted" id="lwho" style="margin:-6px 0 8px;font-size:13px"></p><div id="lriders"></div>
    <div id="lroles"></div>
    <div class="card" id="lprog" style="margin-top:12px"></div>
    <div id="lact" style="margin-top:14px;display:grid;gap:10px"></div></div>`;
  const render = () => {
    const r = LV.ride; if (!r || !$('#lname')) return;
    const v = riderView(), real = v.filter((x) => !x.pending), pend = v.filter((x) => x.pending), me = real.find((x) => x.isMe), host = isHost();
    $('#lname').textContent = r.name;
    $('#lsub').innerHTML = `${esc(fmtWhen(r.when))} · ${fmtKm(r.dist)} · ${fmtDur(r.dur)}`;
    $('#lplan').innerHTML = `<div class="row"><span class="tiny">RIDE PLAN</span><span class="sp"></span>${canPlan() ? `<a class="link" data-act="openplan">Edit plan</a>` : `<a class="link" data-act="openplan">View plan</a>`}</div>
      <div class="row" style="margin-top:8px">${ic('pin', 18)}<div><b>${esc(r.start.name)}</b><div class="muted" style="font-size:12px">Meeting point</div></div></div>
      ${r.stops.length ? `<div class="row" style="margin-top:8px">${ic('route', 18)}<div class="muted" style="font-size:13px">${r.stops.length} stop${r.stops.length > 1 ? 's' : ''}: ${esc(r.stops.map((s) => s.name.split(',')[0]).join(' → '))}</div></div>` : ''}
      <div class="row" style="margin-top:8px">${ic('flag', 18)}<div><b>${esc(r.dest.name)}</b><div class="muted" style="font-size:12px">Final destination</div></div></div>`;
    $('#lcount').textContent = real.length;
    $('#lwho').textContent = host ? "You're organising this ride." : `Organised by ${LV.riders.find((x) => x.id === r.hostId)?.name || 'the organiser'}.`;
    $('#lriders').innerHTML = real.map((x) => `<div class="rider">${rowPin(x)}<div class="sp"><div class="n">${x.isMe ? 'You' : esc(x.name)}</div><div class="s">${esc(roleLabel(x))}${x.bike ? ' · ' + esc(x.bike) : ''}</div></div>${x.ready ? `<span class="rcv">${ic('check', 16)} Ready</span>` : `<span class="muted">${ic('clock', 16)} Not ready</span>`}${barsHTML(x.link)}</div>`).join('');
    $('#lreq').innerHTML = host && pend.length ? `<div class="sec"><h3>Join requests</h3></div>${pend.map((x) => `<div class="rcard"><div class="row">${rowPin(x)}<div class="sp"><b>${esc(x.name)}</b><div class="muted" style="font-size:12px">${esc(x.bike || 'Wants to join')}</div></div></div><div class="row" style="margin-top:10px"><button class="btn sm primary" data-act="approve" data-id="${x.id}">Approve</button><button class="btn sm" data-act="decline" data-id="${x.id}">Decline</button></div></div>`).join('')}` : '';
    $('#lroles').innerHTML = host ? `<button class="btn" style="margin-top:10px" data-act="roles">Manage roles ${ic('chev', 16)}</button>` : '';
    const ready = real.filter((x) => x.ready).length, wait = real.filter((x) => !x.ready).map((x) => x.name);
    $('#lprog').innerHTML = `<b style="font-size:17px">${ready === real.length && real.length > 1 ? 'Everyone is ready' : `${ready} of ${real.length} riders ready`}</b><div class="progress"><i style="width:${real.length ? (ready / real.length) * 100 : 0}%"></i></div><span class="muted" style="font-size:13px">${wait.length ? `Waiting for ${esc(wait.join(', '))}.` : 'Everyone will head to the first stop.'}</span>`;
    $('#lact').innerHTML = (host ? `<button class="btn primary" data-act="startride">Start ride ${ic('chev', 16)}</button>` : '') + `<button class="btn ${host ? '' : 'primary'}" data-act="ready">${me?.ready ? 'Not ready' : "I'm ready"}</button>`;
  };
  const drawMap = () => { routeH?.remove(); routeH = drawRoute(map, LV.pts, { start: LV.ride.start, dest: LV.ride.dest, stops: LV.ride.stops }); fit(map, LV.pts, 24); };
  return {
    nav: 'ride', fab: false,
    html,
    async mount() {
      LV.ui = { all: render, riders: render, conn: () => {}, plan: () => { render(); if (map) drawMap(); } };
      render();
      map = await mkMap('lmap');
      if (!map || dead) { map?.remove(); return; }
      drawMap();
    },
    unmount() { dead = true; map?.remove(); LV.ui = null; },
  };
}

// ---------- LIVE ----------
export async function liveScreen(code) {
  if (!(await enter(code))) return loadFail;
  if (LV.pending && !LV.ride) return { redirect: '#/lobby/' + code };
  if (LV.ride.status === 'lobby') return { redirect: '#/lobby/' + code };
  if (LV.ride.status === 'ended') return { redirect: '#/summary/' + code };
  const host = isHost();
  const st = { follow: true, firstFix: false, markers: {}, sigs: {}, sigKey: '' };
  let map, tick, dead = false, routeH;
  const html = `<div class="live hasnav"><div class="map" id="map"></div>
    <div class="hud"><div class="hudrow"><button class="icon-btn" data-act="nav" data-to="#/home" aria-label="Back to Home">${ic('back')}</button><div class="pill"><b id="hudname">${esc(LV.ride.name)}</b><span id="hudsub">Connecting…</span></div>
      <button class="hudriders" data-act="riders" aria-label="Riders">${ic('users', 22)}<b id="rcount">0</b><i class="gdot" id="rwarn" hidden></i></button>
      <button class="icon-btn" data-act="mute" id="mutebtn" aria-label="Voice replies">${ic(DB.prefs.speak ? 'volume' : 'volumex')}</button></div>
      <div class="navcard" id="navcard" hidden><div class="navicon" id="nicon"></div><div class="navtxt"><b id="ndist"></b><span id="ntext"></span><em id="nthen"></em></div><button class="navx" data-act="guideoff" aria-label="Turn off directions">${ic('x', 18)}</button></div></div>
    <div class="mapctl"><button class="icon-btn" data-act="recenter" aria-label="Recenter">${ic('target')}</button><button class="icon-btn" data-act="everyone" aria-label="Show everyone">${ic('users')}</button><button class="icon-btn" data-act="camera" aria-label="Heading-up or north-up">${ic('nav')}</button><button class="icon-btn" data-act="guide" aria-label="Directions on or off">${ic('route')}</button></div>
    <div class="banner" id="banner"></div>
    <div class="sheet min" id="sheet"><button data-act="sheet" style="display:block;width:100%;padding:0 0 4px;flex:none" aria-label="Expand or collapse"><div class="grab" style="margin:0 auto 6px"></div></button>
      <div class="nextcard" id="nextcard"></div>
      <div class="fabs" id="fabs">
        ${FAN.map(fanItem).join('')}
        <div class="fw center"><button class="fbtn stop" id="stopbtn" data-act="stoppick" aria-label="Need a stop. Hold to ask everyone to stop at your location" title="Tap for options. Hold to ask everyone to stop here"><span class="ia">${ic('hand', 26)}</span><span class="ib">${ic('x', 24)}</span><svg class="holdring" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" pathLength="100"/></svg></button></div>
      </div>
      <div class="scroll">
        <div class="stats"><div class="stat"><b id="s-spd">0</b><span>km/h</span></div><div class="stat"><b id="s-km">0.0</b><span>km ridden</span></div><div class="stat"><b id="s-eta">—</b><span>ETA</span></div><div class="stat"><b id="s-left">—</b><span>to go</span></div></div>
        <div id="assists"></div>
      </div></div></div>`;

  const markerSig = (x) => `${x.link}|${x.bat != null && x.bat <= 20 && !x.chg}|${x.color}|${tagOf(x)}|${x.avatar}`;
  const headUpOn = () => st.headUp && LV.nav?.steps.length > 0;
  const heading = () => {
    const p = LV.pos;
    if (p?.hdg != null && !isNaN(p.hdg) && (p.spd || 0) > 1.5) return p.hdg;
    const rt = LV.nav?.pr ? LV.nav.rt : LV.route, pr = LV.nav?.pr || (p && progress(LV.route, [p.lat, p.lng]));
    return pr ? bearing(pointAt(rt, pr.m), pointAt(rt, pr.m + 40)) : st.bearing || 0;
  };
  /** Camera: heading-up 3D chase view while directions are available, flat north-up otherwise. */
  st.cam = (instant) => {
    const p = LV.pos;
    if (!p || !map) return;
    const o = { center: [p.lng, p.lat] };
    if (headUpOn()) {
      const v = (p.spd || 0) * 3.6;
      st.bearing = heading();
      Object.assign(o, { bearing: st.bearing, pitch: 55, zoom: v > 80 ? 15 : v > 50 ? 15.8 : v > 25 ? 16.5 : 17, padding: { top: ($('.hud')?.offsetHeight || 60) + 30, bottom: ($('#sheet')?.offsetHeight || 260) + 76, left: 0, right: 0 } });
    } else Object.assign(o, { bearing: 0, pitch: 0, padding: { top: 0, bottom: 0, left: 0, right: 0 } });
    if (instant || !st.firstFix) { if (!st.firstFix && !headUpOn()) o.zoom = 15; st.firstFix = true; map.jumpTo(o); } else map.easeTo({ ...o, duration: 900 });
  };
  const renderNav = (t) => {
    const c = $('#navcard'); if (!c) return;
    const show = !!(LV.nav?.on && t);
    c.hidden = !show;
    if (show) {
      $('#ndist').textContent = t.s.t === 'arrive' && t.d < 30 ? 'Now' : fmtKm(t.d);
      $('#ntext').textContent = t.s.text;
      $('#nicon').innerHTML = navIcon(t.s, 48);
      $('#nthen').textContent = t.then ? 'Then ' + lower(t.then.text) : '';
    }
    $('.live')?.style.setProperty('--hudh', $('.hud').offsetHeight + 'px');
  };
  /** The "NEXT STOP" card from the design: where the group is heading, time and distance, or the arrival tracker. */
  const updNext = () => {
    const c = $('#nextcard'); if (!c) return;
    const ns = nextStop(), info = stopInfo();
    if (!ns) { c.innerHTML = ''; return; }
    const me = LV.pos && LV.route ? progress(LV.route, [LV.pos.lat, LV.pos.lng]) : null;
    const dist = me ? Math.max(0, ns.m - me.m) : null, mins = dist != null ? Math.max(1, Math.round(dist / (LV.route.total / Math.max(1, LV.ride.dur)) / 60)) : null;
    const tag = ns.kind === 'dest' ? 'FINAL DESTINATION' : ns.type ? `NEXT STOP · ${kindOf(ns).label.toUpperCase()}` : 'NEXT STOP';
    c.innerHTML = info?.iArrived
      ? `<div class="row"><div class="sp tap" data-act="openplan"><span class="tiny lime">AT THE STOP</span><b class="nsname">${esc(ns.name)}</b><span class="muted" style="font-size:13px">${info.arrived} of ${info.total} riders arrived</span></div><button class="btn sm primary" data-act="reopenstop">Open ${ic('chev', 14)}</button></div>`
      : `<div class="row"><div class="sp tap" data-act="openplan"><span class="tiny lime">${tag}</span><b class="nsname">${esc(ns.name)}</b><span class="muted" style="font-size:13px">${dist != null ? `${mins} min · ${fmtKm(dist)} away` : 'Waiting for your location'}</span></div><button class="icon-btn addstop" data-act="addstop" aria-label="Add a stop">${ic('plus', 20)}</button><a class="icon-btn" target="_blank" rel="noopener" href="${mapsLink(ns.lat, ns.lng)}" aria-label="Navigate in Google Maps">${ic('nav', 20)}</a></div>`;
  };
  const updRiders = (fromMe) => {
    const v = riderView(), me = v.find((x) => x.isMe), real = v.filter((x) => !x.pending);
    const seen = new Set();
    for (const x of real) {
      if (!x.pos) continue; seen.add(x.id);
      const sig = markerSig(x), ll = [x.pos.lat, x.pos.lng];
      let mk = st.markers[x.id];
      if (!mk) {
        mk = st.markers[x.id] = mkMarker(map, ll, pinHTML(x), { z: x.isMe ? 10 : 1 }); mk._sig = sig; mk._ll = [ll[1], ll[0]];
        const pop = new maplibregl.Popup({ closeButton: false, closeOnClick: true, offset: [0, -28], className: 'rpop', maxWidth: '260px' });
        pop.on('open', () => { // one card at a time, always showing the latest numbers
          for (const k in st.markers) if (k !== x.id) st.markers[k].getPopup()?.remove();
          const rx = riderView().find((r) => r.id === x.id); if (rx) pop.setHTML(pinCard(rx));
        });
        mk.setPopup(pop);
      }
      else { glide(mk, [ll[1], ll[0]]); if (mk._sig !== sig) { mk.setHtml(pinHTML(x)); mk._sig = sig; } }
    }
    for (const id in st.markers) if (!seen.has(id)) { st.markers[id].remove(); delete st.markers[id]; }
    for (const id in st.markers) { const pp = st.markers[id].getPopup?.(); if (pp?.isOpen()) { const rx = real.find((r) => r.id === id); if (rx) pp.setHTML(pinCard(rx)); } }
    if (fromMe === true) { renderNav(navTick()); if (st.follow) st.cam(false); }
    $('#rcount').textContent = real.length;
    $('#rwarn').hidden = !real.some((x) => (x.bat != null && x.bat <= 20 && !x.chg) || x.link === 'lost');
    const spd = me?.spd || 0, done = me?.prog?.m ?? 0, left = Math.max(0, LV.route.total - done);
    const ridden = me?.km ?? 0; // distance you've actually ridden since the ride started (measured by the server from your GPS)
    $('#s-spd').textContent = Math.round(spd);
    $('#s-km').textContent = ridden.toFixed(1);
    const eta = etaInfo();
    $('#s-eta').textContent = eta ? eta.short : '—';
    $('#s-left').textContent = fmtKm(eta ? eta.left : left);
    updNext();
    const online = real.filter((x) => x.link !== 'lost').length;
    $('#hudname').textContent = LV.ride.name;
    $('#hudsub').innerHTML = `<i class="gdot live"></i> Ride active · ${ridden.toFixed(1)} km${LV.conn === 'offline' ? ' · reconnecting…' : ''}${LV.pos ? '' : ' · finding your location…'}`;
    // regroup warning
    const act = real.filter((x) => x.link !== 'lost' && x.prog);
    if (act.length > 1 && Date.now() - LV.lastRegroup > 300000) {
      const sorted = act.sort((a, b) => b.prog.m - a.prog.m), lead = sorted[0], last = sorted[sorted.length - 1];
      if (lead.prog.m - last.prog.m > 4000) {
        LV.lastRegroup = Date.now();
        showAlert({ c: '#FFB020', i: 'users', title: 'Group is spread out', sub: `${last.name} is ${fmtKm(lead.prog.m - last.prog.m)} behind the leader`, btns: [{ label: 'Break', act: 'signal', attrs: 'data-kind="break"' }] });
        announce(`Group is spread out. ${last.name} is ${fmtKm(lead.prog.m - last.prog.m)} behind.`);
      }
    }
    if (!LV.lowAsked && LV.bat != null && LV.bat <= 20 && !LV.chg) {
      LV.lowAsked = true;
      showAlert({ c: '#FF4D4D', i: 'battery', title: `Your phone is at ${LV.bat}%`, sub: 'Ask a rider for charging support?', ms: 20000, btns: [{ label: 'Ask', act: 'assist', attrs: 'data-need="charge"' }] });
    }
  };
  const updSigs = () => {
    const now = Date.now(), live = LV.signals.filter((s) => s.pos && now - s.ts < (s.kind === 'hazard' ? 30 : 10) * 60000);
    const key = live.map((s) => s.id).join() + '|' + LV.assists.map((a) => a.id).join();
    if (key === st.sigKey) return; st.sigKey = key;
    Object.values(st.sigs).forEach((m) => m.remove()); st.sigs = {};
    const add = (id, pos, m, label) => { st.sigs[id] = mkMarker(map, [pos.lat, pos.lng], `<div class="sigpin" style="--c:${m.c}">${ic(m.i, 18)}</div>`, { w: 32, h: 32, title: label }); };
    live.forEach((s) => add('s' + s.id, s.pos, SIG[s.kind], `${s.name}: ${SIG[s.kind].label}${s.note ? ' · ' + s.note : ''}`));
    LV.assists.forEach((a) => a.pos && add('a' + a.id, a.pos, NEED[a.need], `${a.name}: ${NEED[a.need].label}`));
  };
  const updAssists = () => {
    const h = $('#assists'); if (!h) return;
    h.innerHTML = LV.assists.length ? `<div class="sec" style="margin:4px 0 8px"><h3>Needs help</h3></div>` + LV.assists.map((a) => {
      const m = NEED[a.need], mine = a.by === LV.me, helping = a.helpers.some((x) => x.id === LV.me);
      return `<div class="card assist" style="--c:${m.c}"><div class="row">${ic(m.i, 24)}<div class="sp"><b>${esc(mine ? 'You' : a.name)}: ${m.label}</b><div class="muted" style="font-size:12px">${esc(a.note || '')}${a.note ? ' · ' : ''}${mine ? 'Waiting for a rider' : esc(relPhrase(a.pos))}</div></div></div>
        ${a.helpers.length ? `<div class="muted" style="font-size:12px;margin-top:8px">${a.helpers.map((x) => esc(x.name)).join(', ')} on the way</div>` : ''}
        <div class="row" style="margin-top:10px">${mine ? `<button class="btn sm primary" data-act="resolve" data-id="${a.id}">Sorted, thanks</button>` : helping ? `<span class="chip green">You're on the way</span>` : `<button class="btn sm primary" data-act="offer" data-id="${a.id}">I can help</button>`}${!mine && a.pos ? `<a class="btn sm" target="_blank" rel="noopener" href="${mapsLink(a.pos.lat, a.pos.lng)}">${ic('nav', 16)} Navigate</a>` : ''}${host && !mine ? `<button class="btn sm ghost" data-act="resolve" data-id="${a.id}">Close</button>` : ''}</div></div>`;
    }).join('') : '';
  };
  const drawPlan = () => { routeH?.remove(); routeH = drawRoute(map, LV.pts, { start: LV.ride.start, dest: LV.ride.dest, stops: LV.ride.stops }); };
  return {
    nav: 'ride', fab: false, solid: true,
    html,
    async mount() {
      map = await mkMap('map', { center: [LV.ride.start.lat, LV.ride.start.lng], zoom: 12 });
      if (!map || dead) { map?.remove(); map = null; return; }
      LV.map = map; st.map = map; LV.live = st;
      drawPlan(); fit(map, LV.pts, 50);
      map.on('dragstart', () => { st.follow = false; });
      st.headUp = !!LV.nav?.steps.length;
      holdToStop();
      if (!DB.prefs.tipHold) { DB.prefs.tipHold = true; save(); setTimeout(() => !dead && toast('Tip: hold the hand button to ask everyone to stop at your location', false, 6500), 2500); }
      const mineLine = (pts) => whenReady(map, () => {
        const data = { type: 'Feature', geometry: { type: 'LineString', coordinates: pts.map(([a, b]) => [b, a]) } };
        if (map.getSource('mine')) return map.getSource('mine').setData(data);
        map.addSource('mine', { type: 'geojson', data });
        map.addLayer({ id: 'mine', type: 'line', source: 'mine', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 4, 'line-opacity': 0.85, 'line-dasharray': [1.2, 1.6] } }, map.getStyle().layers.find((l) => l.type === 'symbol')?.id);
      });
      LV.ui = {
        all: () => { updRiders(); updSigs(); updAssists(); renderNav(navTick()); }, riders: updRiders, me: () => updRiders(true), sig: updSigs, assist: updAssists, conn: updRiders,
        nav: () => renderNav(navTick()), mineLine, plan: () => { drawPlan(); st.sigKey = ''; updSigs(); renderNav(navTick()); updNext(); },
      };
      LV.ui.all();
      tick = setInterval(() => { updRiders(); updSigs(); }, 3000);
      keepAwake(true);
    },
    unmount() { dead = true; clearInterval(tick); map?.remove(); LV.map = null; LV.live = null; LV.ui = null; keepAwake(false); },
  };
}
export const mapActions = {
  recenter() { const s = LV.live; if (!s || !LV.pos) return say('Waiting for your location', { err: true }); s.follow = true; s.cam(true); },
  overview() { const s = LV.live; if (!s) return; s.follow = false; s.map.jumpTo({ bearing: 0, pitch: 0, padding: { top: 0, bottom: 0, left: 0, right: 0 } }); fit(s.map, LV.pts, 50); },
  /** Zoom out so every rider with a location is on screen. */
  everyone() {
    const s = LV.live; if (!s) return;
    const pts = riderView().filter((x) => !x.pending && x.pos).map((x) => [x.pos.lat, x.pos.lng]);
    if (!pts.length) return toast('No rider locations yet', true);
    s.follow = false; s.map.jumpTo({ bearing: 0, pitch: 0, padding: { top: 0, bottom: 0, left: 0, right: 0 } });
    if (pts.length === 1) s.map.jumpTo({ center: [pts[0][1], pts[0][0]], zoom: 14 });
    else fit(s.map, pts, 70);
    toast(`Showing all ${pts.length} riders`);
  },
  camera() {
    const s = LV.live; if (!s) return;
    if (!LV.nav?.steps.length) return toast('Heading-up view needs turn-by-turn directions', true);
    s.headUp = !s.headUp; s.follow = true; s.cam(true); toast(s.headUp ? 'Heading-up view' : 'North-up view');
  },
  focus(lat, lng) { const s = LV.live; if (!s) return; s.follow = false; s.map.easeTo({ center: [lng, lat], zoom: 16, duration: 600 }); },
  sheet() { $('#sheet')?.classList.toggle('min'); },
};

// ---------- SUMMARY ----------
export async function summaryScreen(code) {
  if (!(await enter(code))) return loadFail;
  if (LV.pending && !LV.ride) return { redirect: '#/lobby/' + code };
  const r = LV.ride, all = LV.riders.filter((x) => !x.pending), me = all.find((x) => x.id === LV.me) || {};
  const km = Math.round((me.km || 0) * 10) / 10, dur = (r.endedAt || Date.now()) - (r.startedAt || Date.now());
  const arrived = new Set(LV.arrivals?.dest || []);
  const completed = (r.done || []).length;
  DB.active = null; save();
  LV.summary = { code, name: r.name, from: r.start.name, to: r.dest.name, ts: r.endedAt || Date.now(), km, riders: all.length, stops: completed, arrived: arrived.size };
  let map, dead = false;
  const journey = [
    { n: r.start.name, s: 'Meeting point', ok: true },
    ...r.stops.map((s) => ({ n: s.name, s: s.type === 'fuel' ? 'Fuel stop' : 'Stop', ok: (r.done || []).includes(s.id) })),
    { n: r.dest.name, s: 'Final destination', ok: arrived.size > 0 },
  ];
  return {
    html: `<div class="screen nonav"><div class="row"><span class="chip lime">RIDE COMPLETE</span></div>
      <h1 style="margin-top:10px">A good ride, together.</h1><p class="muted" style="margin:4px 0 14px">${esc(r.name)} · ${new Date(r.endedAt || Date.now()).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      <div class="card" style="display:flex;gap:12px;align-items:center">${ic('check', 22)}<div><b>Live sharing stopped</b><div class="muted" style="font-size:13px">Location and battery sharing are off.</div></div></div>
      <div class="map box" id="smap" style="margin-top:12px"></div>
      <div class="grid2" style="margin-top:12px"><div class="stat"><b>${arrived.size || '—'} / ${all.length}</b><span>Riders arrived</span></div><div class="stat"><b>${completed}</b><span>Stops completed</span></div></div>
      <div class="summary-big" style="margin-top:20px">${km}<span style="font-size:22px;color:var(--mut);letter-spacing:0"> km</span></div><p class="muted" style="margin:2px 0 14px">you rode · ${fmtDur(dur / 1000)} · top ${Math.round(me.maxSpd || 0)} km/h</p>
      <div class="sec" style="margin-top:6px"><h3>Your journey</h3></div>
      ${journey.map((j) => `<div class="rider"><span class="tick ${j.ok ? 'on' : ''}">${j.ok ? ic('check', 14) : ''}</span><div class="sp"><div class="n">${esc(j.n.split(',')[0])}</div><div class="s">${j.s}</div></div></div>`).join('')}
      <div class="sec"><h3>Riders</h3></div>${all.map((x) => `<div class="rider">${rowPin(x)}<div class="sp"><div class="n">${x.isMe ? 'You' : esc(x.name)}</div><div class="s">${esc(roleLabel(x))} · ${x.km} km</div></div></div>`).join('')}
      <div style="display:grid;gap:10px;margin-top:22px"><button class="btn primary" data-act="saveride">Save to my rides ${ic('chev', 16)}</button><p class="note" style="margin:-4px 0 0">This choice applies to your ride history.</p>
        ${km > 0 ? `<button class="btn" data-act="addodo" data-code="${code}" data-km="${km}">Add ${km} km to ${esc(DB.bike.name)} odometer</button>` : ''}<button class="btn" data-act="finishnosave">Finish without saving ${ic('chev', 16)}</button></div></div>`,
    async mount() {
      map = await mkMap('smap');
      if (!map || dead) { map?.remove(); return; }
      drawRoute(map, LV.pts, { start: r.start, dest: r.dest, stops: r.stops }); fit(map, LV.pts, 24);
    },
    unmount() { dead = true; map?.remove(); },
  };
}

// ---------- click actions ----------
export const rideActs = {
  leave() { leaveRide(); go('#/home'); },
  share: shareRide, copy: copyCode,
  ready() { const me = LV.riders.find((x) => x.id === LV.me); rideSend({ t: 'ready', v: !me?.ready }); },
  startride() {
    const waiting = LV.riders.filter((x) => !x.pending && !x.ready).length;
    const go_ = () => rideSend({ t: 'start' });
    if (!waiting) return go_();
    const m = modal(`<h2>${waiting} rider${waiting > 1 ? 's' : ''} not ready</h2><p class="muted" style="margin:6px 0 16px">Start anyway? They can still join the live ride.</p><div class="grid2"><button class="btn" data-x="no">Wait</button><button class="btn primary" data-x="yes">Start now</button></div>`, { center: true });
    m.el.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (!b) return; m.close(); if (b.dataset.x === 'yes') go_(); });
  },
  endride() {
    const m = modal(`<h2>End the ride?</h2><p class="muted" style="margin:6px 0 16px">This ends it for every rider.</p><div class="grid2"><button class="btn" data-x="no">Keep riding</button><button class="btn danger" data-x="yes">End ride</button></div>`, { center: true });
    m.el.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (!b) return; m.close(); if (b.dataset.x === 'yes') rideSend({ t: 'end' }); });
  },
  signal(el) { sendSignal(el.dataset.kind); $('#fabs')?.classList.remove('picking'); },
  /** "Need a stop": fan the options out around the button. Closes on a second tap, a tap elsewhere, a pick, or after 7 seconds. */
  stoppick() {
    const f = $('#fabs'); if (!f) return;
    const hb = $('#stopbtn'); if (hb?._held) { hb._held = false; return; } // this tap was the end of a long press: don't also open the menu
    const close = () => { f.classList.remove('picking'); clearTimeout(f._t); document.removeEventListener('click', f._off, true); };
    if (f.classList.contains('picking')) return close();
    f.classList.add('picking');
    f._t = setTimeout(close, 7000);
    f._off = (e) => { if (!e.target.closest('#fabs .center')) close(); };
    setTimeout(() => document.addEventListener('click', f._off, true), 0);
  },
  assist(el) { closeModals(); sendAssist(el.dataset.need); },
  support: openAssistMenu,
  nearby() { openNearby('fuel'); },
  nearbyk(el) { openNearby(el.dataset.k); },
  offer(el) { rideSend({ t: 'offer', id: el.dataset.id }); fadeOut(el.closest('.alert')); say("Thanks, they've been told you're coming", { talk: false }); },
  resolve(el) { rideSend({ t: 'resolve', id: el.dataset.id }); },
  focus(el) { mapActions.focus(+el.dataset.lat, +el.dataset.lng); fadeOut(el.closest('.alert')); },
  recenter: () => mapActions.recenter(), overview: () => mapActions.overview(), everyone: () => mapActions.everyone(), sheet: () => mapActions.sheet(), camera: () => mapActions.camera(),
  reopenstop: reopenStop,
  guide() { setGuidance(!LV.nav?.on); },
  guideoff() { setGuidance(false); },
  x(el) { fadeOut(el.closest('.alert')); },
  mute() { DB.prefs.speak = !DB.prefs.speak; save(); const b = $('#mutebtn'); if (b) b.innerHTML = ic(DB.prefs.speak ? 'volume' : 'volumex'); toast(DB.prefs.speak ? 'Voice replies on' : 'Voice replies off'); },
  saveride() {
    const s = LV.summary; if (!s) return;
    if (!DB.rides.some((x) => x.code === s.code)) { DB.rides.unshift({ ...s, added: false }); DB.rides = DB.rides.slice(0, 30); save(); }
    toast('Saved to my rides'); leaveRide(); go('#/home');
  },
  finishnosave() { leaveRide(); go('#/home'); },
  addodo(el) {
    DB.bike.odo += +el.dataset.km; const rec = DB.rides.find((x) => x.code === el.dataset.code); if (rec) rec.added = true; save();
    toast(`Odometer is now ${Math.round(DB.bike.odo)} km`); el.remove();
  },
};

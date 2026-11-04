// Rilo — router, onboarding, home, ride planning, garage, profile, and the voice command layer.
import { ic, esc, logo, initials, face, avatarHTML, avatarFor, avatarPicker, AVATARS, fmtKm, fmtDur, geocode, reverse, route, debounce } from './lib.js';
import { Voice, voiceSupported, parse, speak } from './voice.js';
import { getPosition } from './live.js';
import { DB, save, hooks, $, $$, money, localISO, fmtWhen, go, toast, say, modal, closeModals, mkMap, mkMarker, drawRoute, fit, miniRoute } from './core.js';
import { LV, riderView, joinRide, leaveRide, sendSignal, sendAssist, cancelPending, openNearby, statusReport, navNext, etaReport, rerouteNow, setGuidance, rideSend, canPlan } from './ride.js';
import { lobbyScreen, liveScreen, summaryScreen, rideActs, mapActions } from './screens.js';
import { groupActs, openRiders, openFuelFinder, openPlan } from './group.js';

const app = $('#app');
const W = { avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] }; // suggested avatar on the sign-up screen
if (DB.user && !AVATARS.includes(DB.user.avatar)) { DB.user.avatar = avatarFor(DB.user.id); save(); } // riders who signed up before avatars existed
const SPIN = '<span class="spin"></span>'; // inline loading spinner, see .spin in app.css
let view = null, token = 0;

// =============== router ===============
const NAV = [['home', 'Home', 'home', '#/home'], ['ride', 'Ride', 'route', null], ['garage', 'Garage', 'gauge', '#/garage'], ['profile', 'Profile', 'user', '#/profile']];
// Bottom bar: Home, Ride, [mic in the middle], Garage, Profile. The mic is available on every screen that has the bar.
const navHTML = (on, _fab, solid = false) => {
  const items = NAV.map(([k, l, i, h]) => `<button class="${on === k ? 'on' : ''}" data-act="nav" data-to="${h || (DB.active ? '#/lobby/' + DB.active.code : '#/create')}">${ic(i, 24)}${l}</button>`);
  items.splice(2, 0, `<button class="navmic" data-act="mic" aria-label="Talk to Rilo">${ic('mic', 28)}</button>`);
  return `<nav class="nav ${solid ? 'solid' : ''}">${items.join('')}</nav>`;
};

async function render() {
  const my = ++token;
  view?.unmount?.(); view = null; closeModals();
  const [, name = '', arg = ''] = location.hash.split('/');
  if (!DB.user && name !== 'welcome') { DB.pending = location.hash; save(); return go('#/welcome'); }
  if (DB.user && (name === '' || name === 'welcome')) return go('#/home');
  if (name !== 'lobby' && name !== 'live' && LV.ride && name !== 'summary' && name !== 'join') { /* keep connection alive while browsing */ }
  const S = { welcome, home, create, join, garage, profile, rides, lobby: lobbyScreen, live: liveScreen, summary: summaryScreen }[name];
  if (!S) return go('#/home');
  const loading = ['lobby', 'live', 'summary'].includes(name);
  if (loading) app.innerHTML = `<div class="screen nonav" style="display:grid;place-items:center"><p class="muted">${SPIN} Connecting to ride…</p></div>`;
  let scr;
  try { scr = await S(arg); } catch (e) { console.error(e); toast('Something went wrong', true); return go('#/home'); }
  if (my !== token) return; // navigated away meanwhile
  if (scr.redirect) return go(scr.redirect);
  app.innerHTML = scr.html + (scr.nav ? navHTML(scr.nav, scr.fab !== false, !!scr.solid) : '');
  view = scr; scr.mount?.();
}
hooks.render = render;
window.addEventListener('hashchange', render);

// =============== welcome ===============
function welcome() {
  return {
    html: `<div class="screen nonav welcome" style="display:flex;flex-direction:column;min-height:100%">
      <div class="top">${logo(60)}</div>
      <div class="hero-map"><svg viewBox="0 0 390 260" preserveAspectRatio="xMidYMid slice"><g stroke="#232323" stroke-width="1.6" fill="none"><path d="M-10 60 C80 30 150 110 240 70 S350 40 400 80"/><path d="M-10 190 C90 150 160 215 250 180 S350 200 400 160"/><path d="M70 -10 C100 70 70 130 110 270"/><path d="M290 -10 C270 70 320 130 300 270"/><path d="M-10 120 C100 100 200 150 400 120"/></g>
        <path d="M30 220 C90 210 110 160 160 150 S230 120 270 90 S330 60 350 30" stroke="#DFFF00" stroke-width="7" fill="none" stroke-linecap="round"/>
        <g><circle cx="105" cy="190" r="15" fill="#DFFF00"/><circle cx="170" cy="148" r="15" fill="#DFFF00"/><circle cx="262" cy="96" r="15" fill="#DFFF00"/></g>
        <g fill="#0a0a0a"><circle cx="105" cy="190" r="8"/><circle cx="170" cy="148" r="8"/><circle cx="262" cy="96" r="8"/></g>
        <path d="M350 14c-8 0-14 6-14 14 0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14z" fill="#DFFF00"/><circle cx="350" cy="28" r="5" fill="#0a0a0a"/></svg></div>
      <h1>Every ride.<br>Together.</h1>
      <p class="muted" style="margin:8px 0 22px">Plan the route. Keep your crew in sync. Signal fuel, breaks and hazards with your voice.</p>
      <div class="field"><label>Your name</label><input class="inp" id="wname" placeholder="e.g. Rushabh" autocomplete="given-name" maxlength="24"></div>
      <div class="field"><label>Your bike</label><input class="inp" id="wbike" placeholder="e.g. Royal Enfield Himalayan" maxlength="30"></div>
      <div class="field"><label>Pick your avatar</label>${avatarPicker(W.avatar)}</div>
      <button class="btn primary" data-act="start">Get started</button></div>`,
  };
}

// =============== home ===============
function home() {
  const a = DB.active;
  const rides = DB.rides.slice(0, 5);
  return {
    nav: 'home',
    html: `<div class="screen"><div class="top">${logo(48)}<button class="avatar" data-act="nav" data-to="#/profile">${face(DB.user.avatar) || esc(initials(DB.user.name))}</button></div>
      <p class="muted">Hey ${esc(DB.user.name)},</p><h1 style="margin:2px 0 4px">Where to next?</h1><p class="muted" style="margin-bottom:18px">Your crew. One shared plan.</p>
      <div class="row2"><button class="btn primary" style="min-height:84px;flex-direction:column;gap:4px" data-act="nav" data-to="#/create">${ic('plus', 24)}Create ride</button><button class="btn dark" style="min-height:84px;flex-direction:column;gap:4px" data-act="nav" data-to="#/join">${ic('users', 24)}Join ride</button></div>
      <div id="active">${a ? activeCard(a) : ''}</div>
      <div class="sec"><h3>Quick actions</h3></div>
      <div class="quick"><button data-act="nearbyHome">${ic('fuel', 26)}Find fuel</button><button data-act="fuelAdd">${ic('plus', 26)}Log fuel</button><button data-act="nav" data-to="#/garage">${ic('gauge', 26)}My bike</button></div>
      <div class="sec"><h3>Recent rides</h3><a class="link" data-act="nav" data-to="#/rides">View all</a></div>
      ${rides.length ? rides.map((r) => `<div class="list-item"><div class="sp"><div class="t">${esc(r.name)}</div><div class="s">${esc(r.from)} → ${esc(r.to)} · ${new Date(r.ts).toLocaleDateString([], { day: 'numeric', month: 'short' })}</div></div><div style="text-align:right"><b>${r.km}</b><div class="s muted" style="font-size:11px">km</div></div></div>`).join('') : `<p class="muted">No rides yet. Create one or join with a code.</p>`}
      </div>`,
    async mount() {
      HM = { gone: false, markers: {} };
      if (!DB.active) return;
      try {
        const r = await fetch('/api/rides/' + DB.active.code);
        if (r.status === 404) { DB.active = null; save(); $('#active').innerHTML = ''; return; }
        const j = await r.json();
        if (j.ride.status === 'ended') { DB.active = null; save(); $('#active').innerHTML = ''; return; }
        if (HM.gone) return;
        $('#active').innerHTML = activeCard(DB.active, j.ride, j.riders, j.ride.hostId === DB.user.id);
        drawHomeMap(j);
      } catch {}
    },
    unmount() { if (HM) { HM.gone = true; clearInterval(HM.timer); HM.map?.remove(); } HM = null; },
  };
}
let HM = null;
/** Real map of the ongoing ride on the Home card: route, stops, and live rider dots while you're connected. */
async function drawHomeMap(j) {
  const el = $('#hmap'), my = HM;
  if (!el || !my) return;
  const map = await mkMap(el, { interactive: false });
  if (!map || my.gone) { map?.remove(); return; }
  my.map = map;
  drawRoute(map, j.pts, { start: j.ride.start, dest: j.ride.dest, stops: j.ride.stops });
  fit(map, j.pts, 26);
  map.once('idle', () => el.classList.add('ready'));
  const upd = () => {
    if (my.gone || !LV.ride || LV.code !== DB.active?.code) return; // positions are only shown if you're in the ride
    const seen = new Set();
    for (const x of riderView().filter((r) => !r.pending && r.pos)) {
      seen.add(x.id);
      const ll = [x.pos.lat, x.pos.lng];
      if (my.markers[x.id]) my.markers[x.id].setLngLat([ll[1], ll[0]]);
      else my.markers[x.id] = mkMarker(map, ll, `<div class="pin xs ${x.isMe ? 'me' : ''}" style="--c:${x.color}">${avatarHTML(x)}</div>`, { w: 28, h: 28, title: x.name });
    }
    for (const id in my.markers) if (!seen.has(id)) { my.markers[id].remove(); delete my.markers[id]; }
  };
  upd(); my.timer = setInterval(upd, 2000);
}
function activeCard(a, r, n, host) {
  const live = r?.status === 'live';
  return `<div class="sec"><h3>Your ride</h3></div><div class="card ride-card"><div class="mini hm"><div class="hm-fallback">${miniRoute(a.code.charCodeAt(0))}</div><div id="hmap" class="hmap"></div></div><div class="body">
    ${live ? '<span class="chip lime">● LIVE NOW</span>' : `<span class="chip">${r ? 'WAITING ROOM' : 'ACTIVE'}</span>`}
    <h2>${esc(a.name)}</h2><p class="muted">${r ? `${esc(r.start.name)} → ${esc(r.dest.name)} · ${n} rider${n === 1 ? '' : 's'}` : 'Code ' + a.code}</p>
    <button class="btn primary" style="margin-top:12px" data-act="nav" data-to="#/${live ? 'live' : 'lobby'}/${a.code}">${live ? 'Rejoin live ride' : 'Open waiting room'}</button>
    <div class="row2" style="margin-top:10px"><button class="btn" data-act="homeleave">Leave ride</button>${host ? '<button class="btn danger" data-act="homeend">End ride</button>' : '<span></span>'}</div></div></div>`;
}

// =============== create ride ===============
const D = {}; const PR = {};
function create() {
  Object.assign(D, { dep: 'now', approval: true, name: '', start: null, dest: null, stops: [], route: null, tk: 0, map: null, layer: null, gone: false });
  const when = localISO(new Date(Date.now() + 3600e3 - ((Date.now() + 3600e3) % 900000)));
  return {
    nav: 'ride', fab: false,
    html: `<div class="screen"><button class="back" data-act="nav" data-to="#/home">${ic('back')} Home</button>
      <h2 style="margin-bottom:16px">Plan a ride</h2>
      <div class="field"><label>Ride name</label><input class="inp" id="cname" placeholder="Sunday to Lonavala" maxlength="50"></div>
      <div class="field"><label>Start</label><div class="row"><input class="inp" data-place="start" placeholder="Search start point" autocomplete="off"><button class="icon-btn" style="flex:none;width:50px;height:50px" data-act="useloc" aria-label="Use my location">${ic('target')}</button></div><div class="fnote" id="locnote" hidden></div><div class="results"></div></div>
      <div class="field"><label>Destination</label><input class="inp" data-place="dest" placeholder="Where are you headed?" autocomplete="off"><div class="results"></div></div>
      <div class="field"><label>Stops <span style="font-weight:400">(fuel, chai, viewpoints)</span></label><div id="stops"></div><input class="inp" data-place="stop" placeholder="Add a stop" autocomplete="off"><div class="results"></div></div>
      <div class="field"><label>Departure</label><div class="seg"><button class="on" id="depnow" data-act="depnow">Now</button><button id="depsched" data-act="depsched">Schedule</button></div><input class="inp" type="datetime-local" id="cwhen" value="${when}" hidden style="margin-top:8px"></div>
      <div class="list-item" data-act="apprtoggle" style="cursor:pointer"><div class="sp"><div class="t">Approve join requests</div><div class="s">Only riders you approve can join</div></div><div class="toggle on" id="apprt"></div></div>
      <div id="psum" class="muted" style="margin:4px 0 10px;font-weight:600"></div>
      <div class="map box" id="pmap" style="margin-bottom:16px"></div>
      <button class="btn primary" id="cgo" data-act="createride" disabled>Create ride</button></div>`,
    async mount() {
      const map = await mkMap('pmap');
      if (!map) return;
      if (D.gone) { map.remove(); return; }
      D.map = map;
      if (D.route) { D.layer = drawRoute(map, D.route.pts, { start: D.start, dest: D.dest, stops: D.stops }); fit(map, D.route.pts, 30); }
      getPosition().then((p) => { PR.me = p; if (!D.start && D.map) D.map.jumpTo({ center: [p.lng, p.lat], zoom: 10 }); }).catch(() => {});
    },
    unmount() { D.gone = true; D.map?.remove(); D.map = null; },
  };
}
const doSearch = debounce(async (el) => {
  const q = el.value.trim(), box = el.closest('.field').querySelector('.results'), k = el.dataset.place;
  if (q.length < 3) { box.innerHTML = ''; return; }
  box.innerHTML = `<div class="resnote">${SPIN} Searching…</div>`;
  try {
    const list = (PR[k] = await geocode(q, PR.me || D.start));
    box.innerHTML = list.length ? list.map((p, i) => `<button data-act="pick" data-kind="${k}" data-i="${i}">${esc(p.name)}<small>${esc(p.sub)}</small></button>`).join('') : '<button disabled>No places found</button>';
  } catch { box.innerHTML = '<button disabled>Search unavailable. Check your connection.</button>'; }
}, 450);
document.addEventListener('input', (e) => { if (e.target.matches?.('[data-place]')) doSearch(e.target); });

async function updateRoute() {
  const my = ++D.tk, btn = $('#cgo'), sum = $('#psum');
  if (!D.start || !D.dest) return;
  btn.disabled = true; sum.innerHTML = `${SPIN} Finding the best route…`;
  try {
    const r = await route([D.start, ...D.stops, D.dest]);
    if (my !== D.tk) return;
    D.route = r; D.layer?.remove();
    if (D.map) { D.layer = drawRoute(D.map, r.pts, { start: D.start, dest: D.dest, stops: D.stops }); fit(D.map, r.pts, 30); }
    sum.textContent = `${fmtKm(r.dist)} · about ${fmtDur(r.dur)} riding`;
    btn.disabled = false;
  } catch (e) { if (my === D.tk) { sum.textContent = e.message || 'Could not build a route'; sum.style.color = 'var(--red)'; setTimeout(() => (sum.style.color = ''), 3000); } }
}
const renderStops = () => { $('#stops').innerHTML = D.stops.map((s, i) => `<div class="list-item" style="padding:10px 14px"><span class="stoppin">${i + 1}</span><div class="sp t" style="font-size:14px">${esc(s.name)}</div><button data-act="rmstop" data-i="${i}" aria-label="Remove">${ic('x', 18)}</button></div>`).join(''); };

// =============== join ===============
function join(arg) {
  const pre = arg && /^[A-Za-z0-9]{6}$/.test(arg) ? arg.toUpperCase() : '';
  if (pre && DB.share?.[pre] !== undefined) return { redirect: '#/lobby/' + pre }; // you already chose how to join this ride
  return {
    nav: 'ride', fab: false,
    html: `<div class="screen"><button class="back" data-act="nav" data-to="#/home">${ic('back')} Home</button>
      <h1>Join a ride</h1><p class="muted" style="margin:6px 0 22px">Enter the 6-character code from your ride leader, or open their invite link.</p>
      <div class="field"><input class="inp" id="jcode" maxlength="6" value="${pre}" placeholder="ABC123" autocapitalize="characters" autocomplete="off" style="text-align:center;font-size:30px;font-weight:800;letter-spacing:8px;min-height:72px"></div>
      <button class="btn primary" data-act="joincode">Join ride</button></div>`,
    mount() { if (pre) acts.joincode(); else $('#jcode')?.focus(); }, // an invite link goes straight to the "share or view" choice
  };
}
/** Joining is a choice: share your location with the group, or just watch the map. Leaving the group always ends sharing. */
function askShare(code) {
  const m = modal(`<h2>Share your location?</h2><p class="muted" style="margin:6px 0 16px">Choose who sees you on this ride. You can leave at any time, and that stops sharing.</p>
    <button class="btn primary" data-sh="1">${ic('pin', 18)} Share with this group</button>
    <button class="btn" style="margin-top:10px" data-sh="0">${ic('layers', 18)} Just view the map</button>
    <p class="note">Your battery level is shared only while location sharing is on.</p>`);
  m.el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sh]'); if (!b) return;
    DB.share = { ...DB.share, [code]: b.dataset.sh === '1' }; save(); m.close(); go('#/lobby/' + code);
  });
}

// =============== garage ===============
function fuelStats() {
  const L = [...DB.fuel].sort((a, b) => a.odo - b.odo), mil = {};
  let lastFull = null, litres = 0, kmSum = 0, lSum = 0;
  for (const f of L) {
    litres += f.litres;
    if (f.full) {
      if (lastFull != null && f.odo > lastFull && litres > 0) { mil[f.id] = (f.odo - lastFull) / litres; kmSum += f.odo - lastFull; lSum += litres; }
      lastFull = f.odo; litres = 0;
    }
  }
  const ids = Object.keys(mil), last = L.filter((f) => mil[f.id]).pop();
  const span = L.length > 1 ? L[L.length - 1].odo - L[0].odo : 0;
  const spend = L.slice(1).reduce((s, f) => s + f.cost, 0);
  const now = new Date(), months = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ k: d.getFullYear() * 12 + d.getMonth(), l: d.toLocaleString([], { month: 'short' }), v: 0 }); }
  for (const f of DB.fuel) { const d = new Date(f.date), m = months.find((x) => x.k === d.getFullYear() * 12 + d.getMonth()); if (m) m.v += f.cost; }
  return { mil, avg: lSum ? kmSum / lSum : null, last: last ? mil[last.id] : null, perKm: span > 0 ? spend / span : null, months, count: ids.length };
}
function garage() {
  const b = DB.bike, s = fuelStats(), next = b.lastService + b.serviceEvery, left = next - b.odo;
  const max = Math.max(1, ...s.months.map((m) => m.v));
  const fuel = [...DB.fuel].sort((a, b) => b.date - a.date);
  return {
    nav: 'garage',
    html: `<div class="screen"><div class="top"><h2>Garage</h2><button class="icon-btn" data-act="editbike" aria-label="Edit bike">${ic('wrench')}</button></div>
      <div class="bikecard"><div class="muted" style="font-weight:600">${esc(b.name)}</div><div class="odo">${Math.round(b.odo).toLocaleString('en-IN')}<small>km</small></div>
        <div class="row" style="margin-top:12px"><button class="btn primary sm" data-act="fuelAdd">${ic('plus', 16)} Log fuel</button><button class="btn sm" data-act="odoset">Update odometer</button></div></div>
      <div class="grid3" style="margin-top:12px"><div class="stat"><b>${s.avg ? s.avg.toFixed(1) : '—'}</b><span>avg km/l</span></div><div class="stat"><b>${s.last ? s.last.toFixed(1) : '—'}</b><span>last km/l</span></div><div class="stat"><b>${s.perKm ? '₹' + s.perKm.toFixed(1) : '—'}</b><span>per km</span></div></div>
      <div class="sec"><h3>Fuel spend</h3><span class="muted" style="font-size:12px">last 6 months</span></div>
      <div class="card"><div class="chart">${s.months.map((m, i) => `<div class="${i === 5 ? 'cur' : ''}"><span style="color:#fff">${m.v ? money(m.v) : ''}</span><i style="height:${Math.max(4, (m.v / max) * 60)}px"></i>${m.l}</div>`).join('')}</div></div>
      <div class="sec"><h3>Service</h3><button class="link" data-act="serviced">Mark serviced</button></div>
      <div class="card"><div class="row"><div class="sp"><b>${left > 0 ? `${Math.round(left).toLocaleString('en-IN')} km to next service` : `Service overdue by ${Math.round(-left)} km`}</b><div class="muted" style="font-size:12px">Due at ${next.toLocaleString('en-IN')} km</div></div>${left <= 300 ? `<span class="chip ${left <= 0 ? 'red' : 'amber'}">${left <= 0 ? 'OVERDUE' : 'SOON'}</span>` : ''}</div>
        <div class="progress"><i style="width:${Math.max(0, Math.min(100, ((b.odo - b.lastService) / b.serviceEvery) * 100))}%;${left <= 0 ? 'background:var(--red)' : ''}"></i></div></div>
      <div class="sec"><h3>Fuel log</h3></div>
      ${fuel.length ? fuel.map((f) => `<div class="list-item"><div class="avatar" style="background:#1c1f10;color:var(--lime)">${ic('fuel', 20)}</div><div class="sp"><div class="t">${f.litres} L · ${money(f.cost)}</div><div class="s">${new Date(f.date).toLocaleDateString([], { day: 'numeric', month: 'short' })} · ${Math.round(f.odo).toLocaleString('en-IN')} km${f.full ? '' : ' · partial'}${s.mil[f.id] ? ` · <span style="color:var(--lime)">${s.mil[f.id].toFixed(1)} km/l</span>` : ''}</div></div><button data-act="delfuel" data-id="${f.id}" aria-label="Delete">${ic('trash', 18)}</button></div>`).join('') : `<p class="muted">No fuel entries yet. Tap "Log fuel", or just say "log fuel 8 litres 800 rupees".</p>`}</div>`,
  };
}
export function addFuel({ litres, cost, odo, full = true }) {
  const e = { id: Math.random().toString(36).slice(2, 9), date: Date.now(), litres: +litres, cost: +cost, odo: +odo || DB.bike.odo, full };
  DB.fuel.push(e); DB.bike.odo = Math.max(DB.bike.odo, e.odo); save();
  const m = fuelStats().mil[e.id];
  return { e, m };
}
function fuelModal(pre = {}) {
  const m = modal(`<h2>Log fuel</h2><div class="grid2" style="margin-top:14px"><div class="field"><label>Litres</label><input class="inp" id="fl" type="number" inputmode="decimal" step="0.01" value="${pre.litres ?? ''}" placeholder="8.5"></div>
    <div class="field"><label>Total (₹)</label><input class="inp" id="fc" type="number" inputmode="decimal" value="${pre.cost ?? ''}" placeholder="850"></div></div>
    <div class="field"><label>Odometer (km)</label><input class="inp" id="fo" type="number" inputmode="numeric" value="${Math.round(pre.odo ?? DB.bike.odo)}"></div>
    <label class="row" style="margin-bottom:16px"><input type="checkbox" class="check" id="ff" checked><span>Filled the tank up <span class="muted">(needed for mileage)</span></span></label>
    <button class="btn primary" id="fsave">Save</button>`);
  m.q('#fsave').onclick = () => {
    const l = +m.q('#fl').value, c = +m.q('#fc').value, o = +m.q('#fo').value;
    if (!(l > 0) || !(c >= 0) || !(o >= 0)) return toast('Enter litres, amount and odometer', true);
    const { m: mil } = addFuel({ litres: l, cost: c, odo: o, full: m.q('#ff').checked }); m.close();
    toast(mil ? `Saved · ${mil.toFixed(1)} km/l` : 'Fuel entry saved'); if (location.hash === '#/garage') render();
  };
}
function bikeModal() {
  const b = DB.bike;
  const m = modal(`<h2>Your bike</h2><div class="field" style="margin-top:14px"><label>Name</label><input class="inp" id="bn" value="${esc(b.name)}" maxlength="30"></div>
    <div class="grid2"><div class="field"><label>Odometer (km)</label><input class="inp" id="bo" type="number" inputmode="numeric" value="${Math.round(b.odo)}"></div><div class="field"><label>Service every (km)</label><input class="inp" id="bs" type="number" inputmode="numeric" value="${b.serviceEvery}"></div></div>
    <button class="btn primary" id="bsave">Save</button>`);
  m.q('#bsave').onclick = () => { DB.bike.name = m.q('#bn').value.trim() || 'My bike'; DB.bike.odo = Math.max(0, +m.q('#bo').value || 0); DB.bike.serviceEvery = Math.max(100, +m.q('#bs').value || 3000); save(); m.close(); render(); };
}

// =============== profile ===============
function profile() {
  const P = DB.prefs, row = (k, t, s) => `<div class="list-item" data-act="pref" data-k="${k}" style="cursor:pointer"><div class="sp"><div class="t">${t}</div><div class="s">${s}</div></div><div class="toggle ${P[k] ? 'on' : ''}"></div></div>`;
  return {
    nav: 'profile',
    html: `<div class="screen"><h2 style="margin-bottom:16px">Profile</h2>
      <div class="field"><label>Name</label><input class="inp" id="pname" value="${esc(DB.user.name)}" maxlength="24"></div>
      <div class="field"><label>Bike</label><input class="inp" id="pbike" value="${esc(DB.bike.name)}" maxlength="30"></div>
      <div class="field"><label>Your avatar</label>${avatarPicker(DB.user.avatar)}</div>
      <button class="btn sm primary" data-act="saveprofile" style="margin-bottom:8px">Save</button>
      <div class="sec"><h3>Voice</h3></div>
      ${row('guide', 'Spoken directions', 'Turn-by-turn prompts like "In 300 metres, turn left"')}
      ${row('speak', 'Spoken replies', 'Rilo reads out alerts and confirmations')}
      ${row('hands', 'Hands-free · "Hey Rilo"', voiceSupported ? 'Always listening while the app is open. Start commands with "Rilo".' : 'Needs Chrome, Edge or Safari')}
      <div class="sec"><h3>Testing</h3></div>
      ${row('demo', 'Demo mode', 'Simulate GPS and 3 riders along the route. Use to try the app at home.')}
      <div class="sec"><h3>Data</h3></div>
      <button class="btn" data-act="wipe" style="color:var(--red)">Erase all data on this device</button>
      <p class="muted" style="font-size:12px;margin-top:16px;text-align:center">Rilo · maps © OpenStreetMap contributors, © CARTO</p></div>`,
  };
}

// =============== my rides ===============
function rides() {
  const list = DB.rides;
  return {
    nav: 'home',
    html: `<div class="screen"><button class="back" data-act="nav" data-to="#/home">${ic('back')} Home</button><h2 style="margin-bottom:6px">My rides</h2><p class="muted" style="margin-bottom:14px">Location is shared only during a ride.</p>
      ${list.length ? list.map((r) => `<div class="list-item"><div class="sp"><div class="t">${esc(r.name)}</div><div class="s">${esc(r.from)} → ${esc(r.to)} · ${new Date(r.ts).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</div><div class="s">${r.riders} riders${r.stops != null ? ` · ${r.stops} stops` : ''}</div></div><div style="text-align:right"><b>${r.km}</b><div class="s muted" style="font-size:11px">km</div></div></div>`).join('') : '<p class="muted">No saved rides yet. After a ride, tap "Save to my rides".</p>'}</div>`,
  };
}

// =============== voice ===============
const VS = { m: null, hold: 0 };
const voice = new Voice({
  onState(s) {
    $$('[data-act=mic]').forEach((b) => b.classList.toggle('listening', s === 'listening' && !DB.prefs.hands));
    const w = $('#vwave'); if (w) w.style.visibility = s === 'listening' ? 'visible' : 'hidden';
    const t = $('#vtitle'); if (t) t.textContent = s === 'listening' ? 'Listening…' : 'Tap the mic to talk again';
    if (s === 'idle' && DB.prefs.hands && !VS.m && voiceSupported) setTimeout(() => !voice.wantOn && voice.startHandsFree(), 400);
  },
  onInterim(t) { const h = $('#heard'); if (h) h.textContent = t; },
  onFinal(t) { const h = $('#heard'); if (h) h.textContent = t; runCommand(t); if (VS.m) { clearTimeout(VS.hold); VS.hold = setTimeout(() => VS.m?.close(), 1600); } },
  onError(msg) { say(msg, { err: true, talk: false }); },
});
const EXAMPLES = ['Fuel stop', 'Need a break', 'Hazard ahead', 'Find petrol pump', "What's the next turn?", "What's my ETA?", "Who's behind me?", 'Reroute', 'Low battery, need charging', 'Log fuel 8 litres 800 rupees'];
function openVoice() {
  if (VS.m) { VS.m.close(); return; }
  VS.m = modal(`<div style="text-align:center"><h2 id="vtitle">Listening…</h2><div class="voice-wave" id="vwave"><i></i><i></i><i></i><i></i><i></i></div><div class="heard" id="heard">Say a command</div></div>
    <p class="muted" style="font-size:12px;margin:8px 0">Try saying:</p><div class="chips">${EXAMPLES.map((x) => `<button data-ex="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <div class="row" style="margin-top:16px"><input class="inp" id="vtext" placeholder="Or type a command" autocomplete="off"><button class="icon-btn" style="width:50px;height:50px;flex:none" data-vsend aria-label="Run">${ic('chev')}</button></div>
    <button class="btn" style="margin-top:12px" data-vmic>${ic('mic', 20)} Talk again</button>`, { onClose() { clearTimeout(VS.hold); VS.m = null; voice.stop(); } });
  VS.m.el.addEventListener('click', (e) => {
    const x = e.target.closest('[data-ex]'); if (x) { $('#heard').textContent = x.dataset.ex; return runCommand(x.dataset.ex); }
    if (e.target.closest('[data-vsend]')) { const v = $('#vtext').value.trim(); if (v) { $('#heard').textContent = v; $('#vtext').value = ''; runCommand(v); } }
    if (e.target.closest('[data-vmic]')) voice.listenOnce();
  });
  VS.m.q('#vtext').addEventListener('keydown', (e) => { if (e.key === 'Enter') VS.m.el.querySelector('[data-vsend]').click(); });
  if (voiceSupported) voice.listenOnce(); else { $('#vtitle').textContent = 'Type a command'; $('#vwave').style.display = 'none'; toast('Voice needs Chrome, Edge or Safari', true); }
}
hooks.openVoice = openVoice;

const needRide = () => { if (!LV.ride) { say('Join a ride first', { err: true }); return false; } return true; };
function runCommand(text) {
  const c = parse(text);
  switch (c.intent) {
    case 'none': return;
    case 'cancel': if (!cancelPending()) { VS.m?.close(); } return;
    case 'signal': return sendSignal(c.kind, c.note || '');
    case 'assist': return sendAssist(c.need, c.note || '');
    case 'nearby': VS.m?.close(); return openNearby(c.kind);
    case 'status': return needRide() && say(statusReport());
    case 'navnext': return needRide() && navNext();
    case 'eta': return needRide() && etaReport();
    case 'reroute': return needRide() && rerouteNow(true);
    case 'guide': return needRide() && setGuidance(c.on);
    case 'recenter': return needRide() && mapActions.recenter();
    case 'overview': return needRide() && mapActions.overview();
    case 'startRide': return needRide() && (LV.ride.status === 'lobby' ? rideActs.startride() : canPlan() ? rideSend({ t: 'continue' }) : say('Only the leader can continue the ride', { err: true }));
    case 'riders': return needRide() && openRiders();
    case 'everyone': return needRide() && mapActions.everyone();
    case 'fuelstop': return needRide() && openFuelFinder('fuel');
    case 'breakstop': return needRide() && openFuelFinder('food');
    case 'waitstop': return needRide() && groupActs.waitstop();
    case 'addstop': return needRide() && groupActs.addstop();
    case 'plan': return needRide() && openPlan();
    case 'ack': { if (!needRide()) return; const s = [...LV.signals].reverse().find((x) => x.by !== LV.me && !(x.acks || []).some((a) => a.id === LV.me)); return s ? (rideSend({ t: 'ack', id: s.id }), say('Acknowledged')) : say('Nothing to acknowledge', { err: true }); }
    case 'endRide': return needRide() && rideActs.endride();
    case 'ready': return needRide() && (LV.ride.status === 'live' ? groupActs.stopmy() : rideActs.ready());
    case 'mute': DB.prefs.speak = !c.on; save(); return toast(c.on ? 'Voice replies off' : 'Voice replies on');
    case 'goto': VS.m?.close(); return go(c.to);
    case 'setOdo': DB.bike.odo = c.odo; save(); return say(`Odometer set to ${c.odo} kilometres`);
    case 'logFuel': {
      if (!c.litres || c.cost == null) { VS.m?.close(); fuelModal({ litres: c.litres, cost: c.cost, odo: c.odo }); return say('Say litres and amount, like 8 litres 800 rupees'); }
      const { m } = addFuel({ litres: c.litres, cost: c.cost, odo: c.odo, full: true });
      say(`Logged ${c.litres} litres for ${c.cost} rupees${m ? `. Mileage ${m.toFixed(1)} kilometres per litre` : ''}`);
      if (location.hash === '#/garage') render(); return;
    }
    default: say("Didn't catch that. Try 'fuel stop', 'hazard ahead' or 'who's behind me'.", { err: true });
  }
}

// =============== global actions ===============
const acts = {
  ...rideActs,
  ...groupActs,
  homeleave() {
    const a = DB.active; if (!a) return;
    const mm = modal(`<h2>Leave this ride?</h2><p class="muted" style="margin:6px 0 16px">You stop sharing your location with the group. You can rejoin with code ${esc(a.code)} while the ride is still running.</p><div class="grid2"><button class="btn" data-x="no">Stay</button><button class="btn danger" data-x="yes">Leave ride</button></div>`, { center: true });
    mm.el.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (!b) return; mm.close(); if (b.dataset.x === 'yes') { leaveRide(); DB.active = null; save(); toast('You left the ride'); render(); } });
  },
  homeend() {
    const a = DB.active; if (!a) return;
    const mm = modal(`<h2>End the ride for everyone?</h2><p class="muted" style="margin:6px 0 16px">Live sharing stops for every rider and the ride is over.</p><div class="grid2"><button class="btn" data-x="no">Keep it going</button><button class="btn danger" data-x="yes">End ride</button></div>`, { center: true });
    mm.el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-x]'); if (!b) return; mm.close();
      if (b.dataset.x !== 'yes') return;
      try {
        await joinRide(a.code); // reconnect first if the page was reloaded
        rideSend({ t: 'end' });
        await new Promise((r) => setTimeout(r, 800));
        leaveRide(); DB.active = null; save(); toast('Ride ended for everyone'); render();
      } catch (err) { toast(err.message || 'Could not end the ride', true); }
    });
  },
  pickavatar(el) {
    const a = el.dataset.a;
    if ($('#wname')) W.avatar = a; // still signing up: remember it for "Get started"
    else if (DB.user) { DB.user.avatar = a; save(); $$('.toast').forEach((t) => t.remove()); toast('Avatar saved. It shows on the map from your next ride.'); }
    $$('.avpick button').forEach((b) => b.classList.toggle('on', b.dataset.a === a));
  },
  depnow() { D.dep = 'now'; $('#depnow').classList.add('on'); $('#depsched').classList.remove('on'); $('#cwhen').hidden = true; },
  depsched() { D.dep = 'sched'; $('#depsched').classList.add('on'); $('#depnow').classList.remove('on'); $('#cwhen').hidden = false; },
  apprtoggle() { D.approval = !D.approval; $('#apprt').classList.toggle('on', D.approval); },
  nav: (el) => go(el.dataset.to),
  mic: openVoice,
  start() {
    const name = $('#wname').value.trim(); if (!name) return toast('Tell us your name', true);
    DB.user = { id: crypto.randomUUID().slice(0, 8), name, avatar: W.avatar };
    DB.bike.name = $('#wbike').value.trim() || 'My bike'; save();
    const p = DB.pending; DB.pending = null; save(); go(p && !p.includes('welcome') ? p : '#/home');
  },
  nearbyHome: () => openNearby('fuel'),
  fuelAdd: () => fuelModal(),
  odoset: bikeModal, editbike: bikeModal,
  serviced() { DB.bike.lastService = DB.bike.odo; save(); toast('Service logged'); render(); },
  delfuel(el) { DB.fuel = DB.fuel.filter((f) => f.id !== el.dataset.id); save(); render(); },
  pref(el) {
    const k = el.dataset.k; DB.prefs[k] = !DB.prefs[k]; save();
    if (k === 'hands') { if (DB.prefs.hands) { if (!voiceSupported) { DB.prefs.hands = false; save(); toast('Voice needs Chrome, Edge or Safari', true); } else voice.startHandsFree(); } else voice.stop(); }
    if (k === 'demo') { leaveRide(); toast(DB.prefs.demo ? 'Demo mode on. Join a ride to see it.' : 'Demo mode off'); }
    render();
  },
  saveprofile() { DB.user.name = $('#pname').value.trim() || DB.user.name; DB.bike.name = $('#pbike').value.trim() || 'My bike'; save(); toast('Saved'); },
  wipe() {
    const m = modal(`<h2>Erase everything?</h2><p class="muted" style="margin:6px 0 16px">Your profile, bike records and ride history on this device.</p><div class="grid2"><button class="btn" data-x="no">Cancel</button><button class="btn danger" data-x="yes">Erase</button></div>`, { center: true });
    m.el.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (!b) return; m.close(); if (b.dataset.x === 'yes') { leaveRide(); localStorage.removeItem('rilo.v1'); location.hash = ''; location.reload(); } });
  },
  // create ride
  async useloc(el) {
    if (el.disabled) return;
    const inp = $('[data-place=start]'), note = $('#locnote'), icon = el.innerHTML;
    el.disabled = true; el.innerHTML = SPIN;
    inp.value = ''; inp.placeholder = 'Finding your location…';
    note.hidden = false; note.innerHTML = `${SPIN} Finding your location. If your browser asks, tap Allow.`;
    try {
      const p = await getPosition(); D.start = { name: 'My location', lat: p.lat, lng: p.lng }; PR.me = p;
      inp.value = 'My location';
      note.innerHTML = `${SPIN} Got it. Looking up the place name…`;
      updateRoute();
      const name = await reverse(p.lat, p.lng);
      if (D.start?.name === 'My location') { D.start.name = name; inp.value = name; }
    } catch (e) { inp.placeholder = 'Search start point'; toast(e.message, true, 4500); }
    el.disabled = false; el.innerHTML = icon; note.hidden = true; inp.placeholder = 'Search start point';
  },
  pick(el) {
    const k = el.dataset.kind, p = PR[k][+el.dataset.i], inp = $(`[data-place=${k}]`);
    el.closest('.results').innerHTML = '';
    if (k === 'start') { D.start = p; inp.value = p.name; } else if (k === 'dest') { D.dest = p; inp.value = p.name; } else { D.stops.push(p); inp.value = ''; renderStops(); }
    updateRoute();
  },
  rmstop(el) { D.stops.splice(+el.dataset.i, 1); renderStops(); updateRoute(); },
  async createride(el) {
    const label = el.innerHTML;
    el.disabled = true; el.innerHTML = `${SPIN} Creating ride…`;
    try {
      const body = { name: $('#cname').value.trim() || `${D.dest.name} ride`, when: D.dep === 'now' ? localISO(new Date()) : $('#cwhen').value, approval: D.approval, route: D.route, start: D.start, dest: D.dest, stops: D.stops, host: { id: DB.user.id, name: DB.user.name, bike: DB.bike.name } };
      const r = await fetch('/api/rides', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Failed');
      go('#/lobby/' + j.code);
    } catch (e) { el.disabled = false; el.innerHTML = label; toast(e.message || 'Could not create ride', true); }
  },
  async joincode(el) {
    const code = $('#jcode').value.trim().toUpperCase();
    if (code.length !== 6) return toast('Codes are 6 characters', true);
    const btn = el?.dataset?.act === 'joincode' ? el : $('[data-act=joincode]'), label = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = `${SPIN} Checking code…`;
    const r = await fetch('/api/rides/' + code).catch(() => null);
    btn.disabled = false; btn.innerHTML = label;
    if (!r || !r.ok) return toast(r ? 'No ride with that code' : 'Cannot reach the server', true);
    askShare(code);
  },
};
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (el && acts[el.dataset.act]) acts[el.dataset.act](el, e);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'jcode') acts.joincode(); });
// hands-free needs a user gesture before the mic can start
document.addEventListener('click', () => { if (DB.prefs.hands && voiceSupported && !voice.wantOn && !VS.m) voice.startHandsFree(); }, { once: true });

// hide the bottom bar while the on-screen keyboard is open
if (window.visualViewport) {
  const vv = window.visualViewport; let tall = Math.max(innerHeight, vv.height);
  const check = () => { if (vv.height > tall) tall = vv.height; document.body.classList.toggle('kb', vv.height < tall - 140); };
  vv.addEventListener('resize', check);
  window.addEventListener('orientationchange', () => { tall = 0; setTimeout(() => { tall = vv.height; check(); }, 400); });
}
if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations?.().then((rs) => rs.forEach((r) => r.unregister()));
render();

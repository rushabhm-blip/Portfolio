// Ride engine: lobby, live map, quick signals, assistance, nearby search, summary.
import { ic, esc, initials, avatarHTML, hav, buildRoute, progress, pointAt, fmtKm, fmtDur, mapsLink, nearby, nearbyLabel, route as fetchRoute } from './lib.js';
import { Live, startGps, watchBattery, keepAwake, makeDemo } from './live.js';
import { speak } from './voice.js';
import { prepare, navIcon, sayDist, lower, bearing } from './nav.js';
import { DB, save, hooks, $, $$, toast, say, go, modal, closeModals, mkMap, mkMarker, drawRoute, fit, fmtWhen, whenReady, fadeOut } from './core.js';

export const SIG = {
  wait: { label: 'Wait for me', c: '#38BDF8', i: 'hand' },
  stop: { label: 'Stop here', c: '#DFFF00', i: 'hand' },
  fuel: { label: 'Fuel stop', c: '#FFB020', i: 'fuel' },
  break: { label: 'Break', c: '#4ADE80', i: 'coffee' },
  hazard: { label: 'Hazard', c: '#FF7A1A', i: 'alert' },
};
export const NEED = {
  sos: { label: 'SOS', sub: 'Accident or emergency', c: '#FF4D4D', i: 'sos' },
  charge: { label: 'Charging support', sub: 'Phone or bike battery', c: '#DFFF00', i: 'bolt' },
  fuel: { label: 'Spare fuel', sub: 'Ran dry or on reserve', c: '#FFB020', i: 'fuel' },
  tools: { label: 'Tools / mechanic', sub: 'Puncture, chain, breakdown', c: '#38BDF8', i: 'wrench' },
  medical: { label: 'Medical help', sub: 'First aid or injury', c: '#FF4D4D', i: 'med' },
};

// ---------- state ----------
export const LV = {};
const live = new Live();
let waiters = [];
const flush = (err) => waiters.splice(0).forEach((w) => (err ? w.rej(err) : w.res()));
const ui = (k) => LV.ui?.[k]?.();
const announce = (t) => speak(t, DB.prefs.speak);
const vibrate = (p) => { try { navigator.vibrate?.(p); } catch {} };

function resetLV() {
  LV.stopGps?.(); clearInterval(LV.demoTimer);
  Object.assign(LV, {
    code: null, ride: null, pts: null, route: null, me: null, riders: [], bots: [], signals: [], assists: [],
    conn: 'offline', pos: null, bat: null, chg: false, stopGps: null, demo: null, demoTimer: null, snap: Date.now(),
    lastLoc: 0, lastSig: {}, ui: null, stopsM: [], announced: {}, lowAsked: false, lastRegroup: 0, helperSeen: {}, gpsWarned: false,
    nav: null, rawSteps: [], arrivals: {}, receipts: null, pending: null, hostName: '',
  });
}
resetLV();

export function leaveRide() {
  keepAwake(false);
  live.close();
  resetLV();
  flush(new Error('left'));
}
export function joinRide(code) {
  code = code.toUpperCase();
  if (LV.code === code && (LV.ride || LV.pending)) return Promise.resolve();
  leaveRide();
  LV.code = code;
  return new Promise((res, rej) => {
    waiters.push({ res, rej });
    live.connect(code, { id: DB.user.id, name: DB.user.name, bike: DB.bike.name, avatar: DB.user.avatar, share: DB.share?.[code] !== false });
    setTimeout(() => { if (!LV.ride && waiters.length) flush(new Error('Could not reach the server')); }, 10000);
  });
}

/** Apply a route (from joining or from a plan change): geometry, stop positions and turn-by-turn. */
function applyRoute(pts, steps, ride) {
  LV.ride = ride; LV.pts = pts; LV.route = buildRoute(pts); LV.rawSteps = steps || [];
  LV.stopsM = ride.stops.map((s) => progress(LV.route, [s.lat, s.lng])?.m ?? 0);
  LV.nav = null; setupNav(LV.route, LV.rawSteps, ride.stops);
}
live.on('joined', (m) => {
  Object.assign(LV, { me: m.me, riders: m.riders, signals: m.signals, assists: m.assists, arrivals: m.arrivals || {}, receipts: m.receipts, pending: null, snap: Date.now() });
  if (!LV.nav || LV.ride?.planV !== m.ride.planV) applyRoute(m.pts, m.steps, m.ride); else LV.ride = m.ride;
  DB.active = { code: m.ride.code, name: m.ride.name }; save();
  if (m.ride.status !== 'ended') ensureTracking();
  live.send({ t: 'planack', v: m.ride.planV });
  flush(); ui('all'); hooks.group?.onRiders?.();
});
live.on('pending', (m) => { LV.pending = true; LV.hostName = m.host; flush(); ui('all'); });
live.on('declined', () => { toast('The organiser declined your request', true, 5000); leaveRide(); go('#/home'); });
live.on('error', (m) => { const e = new Error(m.msg); if (/not found/i.test(m.msg)) { DB.active = null; save(); } leaveRide(); flush(e); });
live.on('riders', (m) => { LV.riders = m.riders; LV.arrivals = m.arrivals || LV.arrivals; if (m.done && LV.ride) LV.ride.done = m.done; LV.snap = Date.now(); ui('riders'); hooks.group?.onRiders?.(); });
live.on('status', (s) => { LV.conn = s; ui('conn'); });
live.on('signal', (m) => onSignal(m.sig));
live.on('sigack', (m) => { const s = LV.signals.find((x) => x.id === m.id); if (s) { s.acks = m.acks; hooks.group?.onAck?.(s); } });
live.on('assist', (m) => onAssist(m.a));
live.on('receipts', (m) => { LV.receipts = m; hooks.group?.onReceipts?.(); });
live.on('plan', (m) => { // the organiser or leader changed the stops
  applyRoute(m.pts, m.steps, m.ride);
  live.send({ t: 'planack', v: m.v });
  ui('plan'); hooks.group?.onPlan?.(m);
});
live.on('meta', (m) => {
  const prev = LV.ride;
  LV.ride = m.ride;
  if (m.riders) LV.riders = m.riders;
  if (m.arrivals) LV.arrivals = m.arrivals;
  const h = location.hash;
  if (m.ride.status === 'live' && h.startsWith('#/lobby')) go('#/live/' + m.ride.code);
  if (m.ride.status === 'ended') {
    LV.stopGps?.(); LV.stopGps = null; clearInterval(LV.demoTimer); LV.demoTimer = null; // live sharing stops when the ride ends
    if (h.startsWith('#/live') || h.startsWith('#/lobby')) { say('The ride has ended'); go('#/summary/' + m.ride.code); }
  }
  ui('all'); hooks.group?.onMeta?.(prev, m);
});

// ---------- tracking ----------
function ensureTracking() {
  if (LV.stopGps || LV.demoTimer) return;
  watchBattery((b) => { LV.bat = b.bat; LV.chg = b.chg; sendLoc(true); });
  if (DB.prefs.demo) {
    LV.demo = makeDemo(LV.route);
    LV.demoTimer = setInterval(() => {
      const s = LV.demo.tick(LV.ride?.status === 'live' ? 1 : 0.2);
      LV.bots = s.bots; onPos(s.me); ui('riders');
    }, 1000);
    return;
  }
  LV.stopGps = startGps(onPos, (err) => {
    if (LV.gpsWarned) return; LV.gpsWarned = true;
    toast(err === 'denied' ? 'Location is blocked. Allow it so your group can see you.' : 'Location unavailable right now.', true, 5000);
  });
}
function onPos(p) {
  LV.pos = p;
  if (p.bat != null) { LV.bat = p.bat; LV.chg = p.chg; }
  sendLoc();
  if (LV.ui?.me) ui('me'); else navTick(); // keep spoken directions going even when you're on another screen
}
function sendLoc(force) {
  const now = Date.now();
  if (!LV.pos || (!force && now - LV.lastLoc < 2000)) return;
  if (DB.share?.[LV.code] === false) return; // joined to view the map only: your location is never sent
  LV.lastLoc = now;
  live.send({ t: 'loc', lat: LV.pos.lat, lng: LV.pos.lng, spd: LV.pos.spd, bat: LV.bat, chg: LV.chg });
}

// ---------- turn-by-turn navigation ----------
// Uses the route steps stored with the ride. Spoken prompts: far (speed-based), 250 m, and at the turn.
function setupNav(rt, raw, stops) {
  const steps = prepare(raw, stops, LV.ride.dest);
  LV.nav = {
    on: true, steps, rt, m: steps.map((s) => progress(rt, s.loc)?.m ?? 0),
    idx: Math.max(0, steps.findIndex((s) => s.t !== 'depart')), said: {}, off: 0, busy: false, last: 0, mine: false, pr: null,
  };
}
const guide = (t) => speak(t, DB.prefs.guide);

/** Call on every position update. Returns what to show: the next maneuver, distance to it, and the one after. */
export function navTick() {
  const n = LV.nav;
  if (!n || !n.steps.length || !LV.pos) return null;
  const pr = progress(n.rt, [LV.pos.lat, LV.pos.lng]);
  if (!pr) return null;
  n.pr = pr;
  if (pr.off > 70) { if (++n.off >= 3 && n.on) rerouteNow(false); } else n.off = 0;
  let passed = null;
  while (n.idx < n.steps.length - 1 && n.m[n.idx] <= pr.m + 12) {
    passed = n.steps[n.idx];
    if (passed.t === 'arrive' && passed.stopId) LV.announced['s:' + passed.stopId] = 1;
    n.idx++;
  }
  const s = n.steps[n.idx], d = Math.max(0, n.m[n.idx] - pr.m), v = (LV.pos.spd || 0) * 3.6;
  if (passed && n.on && passed.t !== 'arrive' && d > 3000) guide(`Continue on ${passed.n || passed.r || 'this road'} for ${sayDist(d)}`);
  if (n.on) {
    const sd = n.said[n.idx] || (n.said[n.idx] = {});
    const far = Math.max(500, Math.min(2000, v * 18));
    if (d <= 60 && !sd.near) { sd.far = sd.mid = sd.near = 1; guide(s.text); }
    else if (d <= 250 && d > 80 && !sd.mid) { sd.far = sd.mid = 1; guide(`In ${sayDist(d)}, ${lower(s.text)}`); }
    else if (d <= far && d > 300 && !sd.far) { sd.far = 1; guide(`In ${sayDist(d)}, ${lower(s.text)}`); }
  }
  const nx = n.steps[n.idx + 1];
  return { s, d, then: nx && n.m[n.idx + 1] - n.m[n.idx] < 500 ? nx : null };
}
/** New route from where you are, through the stops you haven't reached, to the destination. Only for you; the group's route is unchanged. */
export async function rerouteNow(manual = true) {
  const n = LV.nav, r = LV.ride;
  if (!n || !n.steps.length || !LV.pos || !r) return say('No directions available for this ride', { err: true });
  if (n.busy || (!manual && Date.now() - n.last < 25000)) return;
  n.busy = true; n.last = Date.now(); n.off = 0;
  toast('Rerouting…'); guide('Rerouting');
  try {
    const left = r.stops.filter((s) => !LV.announced['s:' + s.id] && !(r.done || []).includes(s.id));
    const rr = await fetchRoute([{ lat: LV.pos.lat, lng: LV.pos.lng }, ...left, r.dest]);
    const steps = prepare(rr.steps, left, r.dest), rt = buildRoute(rr.pts);
    Object.assign(n, { steps, rt, m: steps.map((s) => progress(rt, s.loc)?.m ?? 0), idx: Math.max(0, steps.findIndex((s) => s.t !== 'depart')), said: {}, mine: true });
    LV.ui?.mineLine?.(rr.pts);
    toast('New route found'); guide('New route found');
  } catch { say('Could not find a new route. Check your connection.', { err: true }); }
  n.busy = false;
}
export function setGuidance(on) {
  if (!LV.nav?.steps.length) return say('No turn-by-turn directions for this ride', { err: true });
  LV.nav.on = on; ui('nav');
  say(on ? 'Directions on' : 'Directions off');
}
export function navNext() {
  const t = navTick();
  if (!t) return say('No directions available right now', { err: true });
  say(`In ${sayDist(t.d)}, ${lower(t.s.text)}`);
}
export function etaInfo() {
  if (!LV.route || !LV.ride) return null;
  const n = LV.nav, rt = n?.pr ? n.rt : LV.route;
  let m = n?.pr?.m;
  if (m == null && LV.pos) m = progress(LV.route, [LV.pos.lat, LV.pos.lng])?.m;
  const left = Math.max(0, rt.total - (m || 0)), sec = left / (LV.route.total / Math.max(1, LV.ride.dur));
  const at = new Date(Date.now() + sec * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return { left, sec, clock: at, short: at.replace(/s/g, '').toLowerCase() };
}
export function etaReport() {
  const i = etaInfo();
  if (!i) return say('No route information yet', { err: true });
  say(`You'll arrive around ${i.clock}. ${sayDist(i.left)} to go.`);
}

// ---------- derived rider view ----------
export function riderView() {
  const dt = Date.now() - LV.snap;
  const list = [...LV.riders.map((r) => ({ ...r })), ...LV.bots.map((b) => ({ ...b }))];
  for (const r of list) {
    r.isMe = r.id === LV.me;
    if (r.isMe) {
      if (LV.pos) r.pos = { lat: LV.pos.lat, lng: LV.pos.lng };
      if (LV.bat != null) r.bat = LV.bat;
      if (LV.pos?.spd != null) r.spd = LV.pos.spd * 3.6;
    }
    const age = (r.age || 0) + (r.bot ? 0 : dt);
    r.ageNow = age;
    r.link = r.isMe ? (LV.conn === 'online' ? 'good' : 'lost') : !r.online ? 'lost' : age < 15000 ? 'good' : age < 45000 ? 'weak' : 'lost';
    r.prog = r.pos && LV.route ? progress(LV.route, [r.pos.lat, r.pos.lng]) : null;
  }
  const me = list.find((r) => r.isMe);
  for (const r of list) r.gap = me?.prog && r.prog ? r.prog.m - me.prog.m : null;
  return list;
}
function relPhrase(pos) {
  if (!pos) return 'location unknown';
  const my = LV.pos && LV.route ? progress(LV.route, [LV.pos.lat, LV.pos.lng]) : null;
  const th = LV.route ? progress(LV.route, [pos.lat, pos.lng]) : null;
  if (my && th && th.off < 800) { const d = th.m - my.m; return `${fmtKm(Math.abs(d))} ${d >= 0 ? 'ahead' : 'behind'}`; }
  return LV.pos ? `${fmtKm(hav([LV.pos.lat, LV.pos.lng], [pos.lat, pos.lng]))} away` : '';
}
export function statusReport() {
  const v = riderView().filter((r) => r.prog);
  if (!v.length) return 'No rider locations yet.';
  const active = v.filter((r) => r.link !== 'lost').sort((a, b) => b.prog.m - a.prog.m);
  const me = v.find((r) => r.isMe);
  const parts = [`${active.length} of ${LV.riders.length + LV.bots.length} riders online.`];
  if (me) {
    const idx = active.findIndex((r) => r.isMe);
    if (idx >= 0) parts.push(idx === 0 ? "You're leading." : `You're number ${idx + 1}.`);
    const last = active[active.length - 1];
    if (last && !last.isMe) parts.push(`${last.name} is last, ${fmtKm(Math.abs(last.gap))} behind you.`);
  }
  const low = v.filter((r) => r.bat != null && r.bat <= 20 && !r.chg);
  if (low.length) parts.push(`Low battery: ${low.map((r) => `${r.name} ${r.bat} percent`).join(', ')}.`);
  const lost = v.filter((r) => r.link === 'lost' && !r.isMe);
  if (lost.length) parts.push(`No signal from ${lost.map((r) => r.name).join(', ')}.`);
  return parts.join(' ');
}

// ---------- signals & assists ----------
const inRide = () => {
  if (!LV.ride || LV.ride.status === 'ended') { say('Join a ride first', { err: true }); return false; }
  return true;
};
export function sendSignal(kind, note = '', at) {
  if (!inRide()) return;
  const now = Date.now();
  if (LV.lastSig[kind] && now - LV.lastSig[kind] < 4000) return;
  LV.lastSig[kind] = now;
  const p = at || LV.pos;
  const ok = live.send({ t: 'signal', kind, note, lat: p?.lat, lng: p?.lng });
  vibrate(60);
  say(ok ? (kind === 'stop' ? 'Everyone asked to stop at your location' : `${SIG[kind].label} signal sent to the group`) : `Offline. ${SIG[kind].label} will send when you reconnect`, { err: !ok });
  if (ok && !at) hooks.group?.afterSignal?.(kind);
}
export function sendAssist(need, note = '') {
  if (!inRide()) return;
  const fire = () => { live.send({ t: 'assist', need, note }); vibrate(100); say(`${NEED[need].label} request sent to the group`); };
  if (need === 'sos') sosCountdown(fire); else fire();
}
export function cancelPending() {
  if (LV.sosCancel) { LV.sosCancel(); LV.sosCancel = null; say('Cancelled'); return true; }
  return false;
}
function sosCountdown(fire) {
  let n = 5;
  const m = modal(`<div class="big-count" id="cd">${n}</div><h2 style="margin:10px 0 4px">Sending SOS</h2><p class="muted" style="margin-bottom:18px">Your location goes to every rider. Say "cancel" or tap below to stop.</p><button class="btn" data-act="cancelsos">Cancel</button>`, { center: true });
  announce('Sending S O S in five seconds. Say cancel to stop.');
  const t = setInterval(() => {
    n--; const el = m.q('#cd'); if (el) el.textContent = n;
    vibrate(40);
    if (n <= 0) { clearInterval(t); m.close(); LV.sosCancel = null; fire(); }
  }, 1000);
  LV.sosCancel = () => { clearInterval(t); m.close(); };
  m.el.addEventListener('click', (e) => { if (e.target.closest('[data-act=cancelsos]')) cancelPending(); });
}

function showAlert({ c, i, title, sub, ms = 10000, btns = [] }) {
  const host = $('#banner');
  if (!host) { toast(`${title}${sub ? ' · ' + sub : ''}`, false, 5000); return; }
  const el = document.createElement('div');
  el.className = 'alert'; el.style.setProperty('--c', c);
  el.innerHTML = `${ic(i, 24)}<div class="sp"><b>${esc(title)}</b><span>${esc(sub || '')}</span></div>${btns.map((b) => `<button class="btn sm primary" data-act="${b.act}" ${b.attrs || ''}>${b.label}</button>`).join('')}<button class="icon-btn sm" data-act="x" aria-label="Dismiss">${ic('x', 16)}</button>`;
  host.appendChild(el);
  setTimeout(() => fadeOut(el), ms);
}
function onSignal(sig) {
  LV.signals.push(sig);
  if (sig.by !== LV.me) {
    const m = SIG[sig.kind];
    const rel = relPhrase(sig.pos);
    if (!hooks.group?.onSignal?.(sig, rel)) { // fuel requests get their own "Find fuel stop" card (group.js)
      showAlert({ c: m.c, i: m.i, title: sig.kind === 'stop' ? `${sig.name} asks everyone to stop here` : `${sig.name}: ${m.label}${sig.note ? ' · ' + sig.note : ''}`, sub: rel, btns: [...(sig.pos ? [{ label: 'Show', act: 'focus', attrs: `data-lat="${sig.pos.lat}" data-lng="${sig.pos.lng}"` }] : []), { label: 'Got it', act: 'ack', attrs: `data-id="${sig.id}"` }] });
    }
    announce(sig.kind === 'stop' ? `${sig.name} asks everyone to stop. ${rel}.` : `${sig.name}: ${sig.kind === 'wait' ? 'please wait' : m.label}${sig.note ? ', ' + sig.note : ''}. ${rel}.`);
    vibrate([140, 70, 140]);
  }
  ui('sig');
}
function onAssist(a) {
  const i = LV.assists.findIndex((x) => x.id === a.id);
  const isNew = i < 0;
  if (a.status === 'resolved') { if (!isNew) LV.assists.splice(i, 1); ui('sig'); ui('assist'); return; }
  if (isNew) LV.assists.push(a); else LV.assists[i] = a;
  const m = NEED[a.need];
  if (isNew && a.by !== LV.me) {
    const rel = relPhrase(a.pos);
    showAlert({ c: m.c, i: m.i, title: `${a.name} needs: ${m.label}${a.note ? ' · ' + a.note : ''}`, sub: rel, ms: 25000, btns: [{ label: 'I can help', act: 'offer', attrs: `data-id="${a.id}"` }] });
    announce(`${a.name} needs ${m.label}. ${rel}.`);
    vibrate([300, 100, 300, 100, 300]);
  }
  const seen = LV.helperSeen[a.id] || 0;
  if (a.by === LV.me && a.helpers.length > seen) {
    const h = a.helpers[a.helpers.length - 1];
    say(`${h.name} is coming to help`);
  }
  LV.helperSeen[a.id] = a.helpers.length;
  ui('sig'); ui('assist');
}

export function openAssistMenu() {
  if (!inRide()) return;
  const m = modal(`<h2>Ask the group</h2><p class="muted" style="margin:4px 0 14px">Everyone in the ride gets an alert with your location.</p>
    <div class="grid2">${Object.entries(NEED).filter(([k]) => k !== 'sos').map(([k, n]) => `<button class="opt" data-pick="${k}">${ic(n.i, 24)}${n.label}<small>${n.sub}</small></button>`).join('')}
    <button class="opt" data-pick="sos" style="border-color:var(--red)"><span style="color:var(--red)">${ic('sos', 24)}</span>SOS<small>Emergency · 5 sec to cancel</small></button></div>
    <div class="field" style="margin:14px 0 0"><input class="inp" id="anote" placeholder="Add a note (optional)" maxlength="80"></div>`);
  m.el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick]'); if (!b) return;
    const note = m.q('#anote').value.trim();
    m.close(); sendAssist(b.dataset.pick, note);
  });
}

let NB = [];
export async function openNearby(kind = 'fuel') {
  const m = modal(`<h2>Nearby</h2><div class="chips" style="margin:12px 0">${['fuel', 'food', 'repair', 'hospital'].map((k) => `<button data-nk="${k}" class="${k === kind ? 'chip lime' : ''}">${nearbyLabel(k)}</button>`).join('')}</div><div id="nres" class="muted"><span class="spin"></span> Searching nearby…</div>`);
  const run = async (k) => {
    $$('[data-nk]', m.el).forEach((b) => (b.className = b.dataset.nk === k ? 'chip lime' : ''));
    const box = m.q('#nres'); box.innerHTML = '<p class="muted"><span class="spin"></span> Searching nearby…</p>';
    try {
      let p = LV.pos || (LV.map && { lat: LV.map.getCenter().lat, lng: LV.map.getCenter().lng });
      if (!p) { const { getPosition } = await import('./live.js'); p = await getPosition(); }
      NB = await nearby(k, p.lat, p.lng);
      box.innerHTML = NB.length ? NB.map((x, i) => `<div class="list-item" style="cursor:default"><div class="sp"><div class="t">${esc(x.name)}</div><div class="s">${fmtKm(x.d)} away</div></div>
        ${k === 'fuel' || k === 'food' ? `<button class="btn sm" data-sug="${i}" data-k="${k}">Suggest</button>` : ''}<a class="btn sm primary" target="_blank" rel="noopener" href="${mapsLink(x.lat, x.lng)}">Go</a></div>`).join('')
        : `<p class="muted">Nothing found within 6 km.</p>`;
      if (k === 'fuel' && NB[0]) announce(`Nearest fuel pump is ${NB[0].name}, ${fmtKm(NB[0].d)} away.`);
    } catch (e) { box.innerHTML = `<p style="color:var(--red)">${esc(e.message || 'Search failed')}</p>`; }
  };
  m.el.addEventListener('click', (e) => {
    const k = e.target.closest('[data-nk]'); if (k) return run(k.dataset.nk);
    const s = e.target.closest('[data-sug]');
    if (s) { const x = NB[+s.dataset.sug]; m.close(); sendSignal(s.dataset.k === 'fuel' ? 'fuel' : 'break', x.name, { lat: x.lat, lng: x.lng }); }
  });
  run(kind);
}

// ---------- shared UI bits ----------
const batHTML = (r) => (r.bat == null ? `<span class="bat muted">${ic('battery', 18)}—</span>` : `<span class="bat ${r.bat <= 20 && !r.chg ? 'low' : ''}">${ic(r.chg ? 'bolt' : 'battery', 18)}${r.bat}%</span>`);
const barsHTML = (l) => { const n = l === 'good' ? 3 : l === 'weak' ? 2 : 1; return `<span class="bars ${l === 'good' ? '' : l === 'weak' ? 'warn' : 'bad'}" title="${l === 'good' ? 'Connected' : l === 'weak' ? 'Weak signal' : 'No signal'}">${[6, 10, 14].map((h, i) => `<i style="height:${h}px" class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`; };
const pinHTML = (r) => `<div class="pin ${r.isMe ? 'me' : ''} ${r.link === 'lost' ? 'off' : ''}" style="--c:${r.color}">${avatarHTML(r)}${r.bat != null && r.bat <= 20 && !r.chg ? '<i class="b"></i>' : ''}</div>`;
function subline(r) {
  if (r.isMe) return `You${r.spd > 1 ? ' · ' + Math.round(r.spd) + ' km/h' : ''}`;
  if (r.link === 'lost') return r.ageNow > 60000 ? `Lost signal · ${Math.round(r.ageNow / 60000)} min ago` : 'Offline';
  if (!r.pos) return 'Waiting for location';
  const g = r.gap;
  const where = g == null ? '' : Math.abs(g) < 50 ? 'With you' : `${fmtKm(Math.abs(g))} ${g > 0 ? 'ahead' : 'behind'}`;
  return `${where}${r.spd > 1 ? ' · ' + Math.round(r.spd) + ' km/h' : ''}`;
}
const riderRow = (r) => `<div class="rider"><div class="pin ${r.link === 'lost' ? 'off' : ''}" style="--c:${r.color}">${avatarHTML(r)}</div>
  <div class="sp"><div class="n">${esc(r.name)} ${r.id === LV.ride?.hostId ? '<span class="chip lime" style="padding:2px 7px;font-size:10px">HOST</span>' : ''}</div><div class="s">${esc(subline(r))}</div></div>${batHTML(r)}${barsHTML(r.link)}</div>`;

const shareUrl = () => `${location.origin}/#/join/${LV.code}`;
export async function shareRide() {
  const url = shareUrl(), text = `Join "${LV.ride.name}" on Rilo. Code ${LV.code}`;
  try { if (navigator.share) { await navigator.share({ title: 'Rilo ride', text, url }); return; } } catch { return; }
  try { await navigator.clipboard.writeText(`${text}\n${url}`); toast('Invite link copied'); } catch { toast(url); }
}
export async function copyCode() { try { await navigator.clipboard.writeText(LV.code); toast('Code copied'); } catch { toast(LV.code); } }

async function enter(code) {
  try { await joinRide(code); } catch (e) {
    if (e.message !== 'left') toast(e.message || 'Could not join this ride', true, 4500);
    return false;
  }
  return true;
}
const loadFail = { redirect: '#/home' };


// ---------- shared with screens.js / group.js ----------
export const rideSend = (o) => live.send(o);
export const rideConn = () => live;
export const rideHelpers = { showAlert, relPhrase, inRide, announce, vibrate, batHTML, barsHTML, pinHTML, subline, riderRow, enter, loadFail, ui, shareUrl, applyRoute };
/** "Organiser · Leader", "Rider", "Tail rider" ... */
export function roleLabel(r) {
  const base = r.role === 'leader' ? 'Leader' : r.role === 'tail' ? 'Tail rider' : 'Rider';
  const label = r.id === LV.ride?.hostId ? (r.role === 'rider' ? 'Organiser' : `Organiser · ${base}`) : base;
  return r.share === false ? `${label} · Viewing only` : label;
}
export const canPlan = () => !!LV.ride && (LV.ride.hostId === LV.me || LV.riders.find((x) => x.id === LV.me)?.role === 'leader');
export const isHost = () => !!LV.ride && LV.ride.hostId === LV.me;
/** Next stop the group is heading to: the first stop not yet completed, else the destination. */
export function nextStop() {
  const r = LV.ride; if (!r) return null;
  const i = r.stops.findIndex((s) => !(r.done || []).includes(s.id));
  return i >= 0 ? { ...r.stops[i], idx: i, kind: 'stop', m: LV.stopsM[i] } : { id: 'dest', ...r.dest, kind: 'dest', m: LV.route?.total ?? 0 };
}

// Group riding features from the Rilo design: riders sheet & roles, join approval, hazard details,
// fuel-stop flow (find -> preview -> add to plan -> delivery), at-stop readiness, destination reached.
import { ic, esc, initials, avatarHTML, hav, progress, pointAt, fmtKm, fmtDur, mapsLink, nearby, geocode, reverse, route as fetchRoute, debounce } from './lib.js';
import { DB, hooks, $, $$, toast, say, go, modal, mkMap, mkMarker, drawRoute, fit, fadeOut } from './core.js';
import { LV, riderView, rideSend, rideHelpers, roleLabel, canPlan, isHost, nextStop, sendSignal } from './ride.js';

const { showAlert, relPhrase, announce, vibrate, pinHTML } = rideHelpers;
const ARRIVE_M = 150;
const SPIN = '<span class="spin"></span>';

const members = () => riderView().filter((x) => !x.pending);
const ago = (ms) => (ms < 3000 ? 'Updated now' : ms < 60000 ? `Updated ${Math.round(ms / 1000)} sec ago` : `Updated ${Math.round(ms / 60000)} min ago`);
const pctCls = (b) => (b == null ? '' : b <= 15 ? 'red' : b <= 30 ? 'amber' : '');
/** Horizontal battery that fills with the charge level; bolt while charging; amber/red when low. */
const gauge = (b, chg) => {
  const col = { red: '#FF4D4D', amber: '#FFB020', '': '#DFFF00' }[pctCls(b)], w = b == null ? 0 : (Math.max(0, Math.min(100, b)) / 100) * 27;
  return `<svg class="bgauge" width="42" height="22" viewBox="0 0 42 22" aria-hidden="true"><rect x="1.5" y="3" width="34" height="16" rx="4.5" fill="none" stroke="${col}" stroke-width="2"/><rect x="37" y="8" width="3" height="6" rx="1.5" fill="${col}"/>${w ? `<rect x="4.5" y="6" width="${w}" height="10" rx="2.5" fill="${col}"/>` : ''}${chg ? '<path d="M20.5 4.5l-5.5 8h4l-1 5 6-8.5h-4z" fill="#0A0A0A"/>' : ''}</svg>`;
};
const ringPin = (x) => `<div class="pin sm ring ${x.link === 'lost' ? 'off' : ''}">${avatarHTML(x)}</div>`;
const rowPin = (x) => `<div class="pin sm ${x.link === 'lost' ? 'off' : ''}" style="--c:${x.color}">${avatarHTML(x)}</div>`;
// What kind of stop is it? (fuel / break are found by searching nearby; wait = "regroup at my location")
const KINDS = {
  fuel: { label: 'Fuel stop', type: 'fuel', icon: 'fuel', nearby: 'fuel', plural: 'Fuel stations', search: 'Search fuel stations' },
  food: { label: 'Break stop', type: 'break', icon: 'coffee', nearby: 'food', plural: 'Places to eat and rest', search: 'Search cafes and food' },
};
export const kindOf = (s) => (s.type === 'fuel' ? KINDS.fuel : s.type === 'break' ? KINDS.food : s.type === 'wait' ? { label: 'Wait point', icon: 'hand' } : { label: 'Stop', icon: 'pin' });
/** Index in the stop list where a new stop should go: before the next stop while riding, otherwise at the end. */
const insertAt = () => { const ns = nextStop(); return LV.ride.status === 'live' && ns?.kind === 'stop' ? ns.idx : LV.ride.stops.length; };

/** Who has arrived at a stop: server arrivals + you (local GPS) + simulated demo riders. */
const botArr = {}; // simulated riders stay "arrived" once they've been at a stop
function arrivedSet(stopId) {
  const set = new Set(LV.arrivals?.[stopId] || []);
  const p = stopId === 'dest' ? LV.ride?.dest : LV.ride?.stops.find((s) => s.id === stopId);
  if (p) {
    const keep = (botArr[LV.code + stopId] = botArr[LV.code + stopId] || new Set());
    for (const b of LV.bots) if (b.pos && hav([b.pos.lat, b.pos.lng], [p.lat, p.lng]) < ARRIVE_M) keep.add(b.id);
    keep.forEach((id) => set.add(id));
    if (LV.pos && hav([LV.pos.lat, LV.pos.lng], [p.lat, p.lng]) < ARRIVE_M) set.add(LV.me);
  }
  return set;
}
/** After the given stop, what comes next? */
function after(stopId) {
  const r = LV.ride, i = r.stops.findIndex((s) => s.id === stopId);
  return i >= 0 && i < r.stops.length - 1 ? { ...r.stops[i + 1], kind: 'stop' } : { id: 'dest', ...r.dest, kind: 'dest' };
}
/** For the live screen: are we at the next stop, and how many have arrived? */
export function stopInfo() {
  const ns = nextStop(); if (!ns || LV.ride.status !== 'live') return null;
  const total = members().length, a = arrivedSet(ns.id);
  return { stop: ns, arrived: a.size, total, iArrived: a.has(LV.me) };
}

// ============ Riders sheet ============
let RS = null, rsTimer = null;
export function openRiders() {
  if (RS || !LV.ride) return;
  RS = modal('<div id="rs"></div>', { onClose() { RS = null; clearInterval(rsTimer); } });
  rsTimer = setInterval(renderRiders, 1000);
  renderRiders();
}
function renderRiders() {
  if (!RS) return;
  const v = riderView(), real = v.filter((x) => !x.pending), pend = v.filter((x) => x.pending), host = isHost();
  const on = real.filter((x) => x.link !== 'lost').length, all = on === real.length;
  const sorted = [...real].sort((a, b) => (b.prog?.m ?? -1) - (a.prog?.m ?? -1));
  $('#rs', RS.el).innerHTML = `
    <div class="row"><h2 class="sp">Riders · ${real.length}</h2><button class="icon-btn" data-act="closeRS" aria-label="Close">${ic('x')}</button></div>
    <p class="muted" style="margin:2px 0 10px">${esc(LV.ride.name)}</p>
    <div class="connline ${all ? '' : 'warn'}">${ic('signal2', 20)} <b>${all ? `All ${real.length} connected` : `${on} of ${real.length} connected`}</b><i class="vdiv"></i><span class="muted">${LV.ride.status === 'live' ? 'Live ride' : 'Waiting room'}</span></div>
    ${host && pend.length ? `<div class="sec" style="margin:14px 0 8px"><h3>Join requests</h3></div>${pend.map((x) => `<div class="rcard"><div class="row">${rowPin(x)}<div class="sp"><b>${esc(x.name)}</b><div class="muted" style="font-size:12px">${esc(x.bike || 'wants to join')}</div></div></div><div class="row" style="margin-top:10px"><button class="btn sm primary" data-act="approve" data-id="${x.id}">Approve</button><button class="btn sm" data-act="decline" data-id="${x.id}">Decline</button></div></div>`).join('')}` : ''}
    <div style="margin-top:12px">${sorted.map((x) => {
      const sharing = x.link === 'good' ? 'Location sharing on' : x.link === 'weak' ? 'Weak signal' : 'No signal';
      const gap = x.isMe || x.gap == null ? '' : Math.abs(x.gap) < 50 ? ' · with you' : ` · ${fmtKm(Math.abs(x.gap))} ${x.gap > 0 ? 'ahead' : 'behind'}`;
      return `<div class="rcard"><div class="row">${ringPin(x)}<div class="sp"><b class="rn">${x.isMe ? 'You' : esc(x.name)}</b><div class="muted" style="font-size:13px">${esc(roleLabel(x))}${gap}</div></div><span class="pctw" title="Phone battery${x.chg ? ' (charging)' : ''}">${gauge(x.bat, x.chg)}<b class="pct ${pctCls(x.bat)}">${x.bat == null ? '—' : x.bat + '%'}</b></span></div>
        <div class="rline"><span class="${x.link === 'lost' ? 'bad' : ''}">${ic('pin', 15)} ${sharing}</span><span class="muted">${x.isMe ? 'Updated now' : ago(x.ageNow)}</span></div>
        <button class="rview" data-act="viewrider" data-id="${x.id}">View on map ${ic('chev', 16)}</button></div>`;
    }).join('')}</div>
    ${host ? `<button class="btn" style="margin-top:6px" data-act="roles">Manage roles ${ic('chev', 16)}</button>` : ''}
    <p class="note" style="display:flex;align-items:center;justify-content:center;gap:8px">${gauge(50, false).replace('class="bgauge"', 'class="bgauge dim"')} Battery levels are shared with rider consent.</p>
    <button class="btn" data-act="closeRS">Back to map ${ic('chev', 16)}</button>`;
}

// ============ Manage roles ============
let RO = null;
export function openRoles() {
  if (!isHost()) return say('Only the organiser can change roles', { err: true });
  if (RO) return;
  RO = modal('<div id="ro"></div>', { onClose() { RO = null; } });
  renderRoles();
}
function renderRoles() {
  if (!RO) return;
  const list = members();
  $('#ro', RO.el).innerHTML = `<div class="row"><h2 class="sp">Manage roles</h2><button class="icon-btn" data-act="closeRO" aria-label="Close">${ic('x')}</button></div>
    <p class="muted" style="margin:4px 0 12px">The Leader rides in front. The Tail rider rides last and keeps an eye on everyone. A Leader can also change the route.</p>
    ${list.map((x) => `<div class="rcard"><div class="row">${rowPin(x)}<div class="sp"><b>${x.isMe ? 'You' : esc(x.name)}</b>${x.id === LV.ride.hostId ? '<div class="muted" style="font-size:12px">Organiser</div>' : ''}</div></div>
      <div class="seg3">${[['leader', 'Leader'], ['rider', 'Rider'], ['tail', 'Tail']].map(([k, l]) => `<button class="${x.role === k ? 'on' : ''}" data-act="setrole" data-id="${x.id}" data-role="${k}">${l}</button>`).join('')}</div></div>`).join('')}
    <button class="btn primary" data-act="closeRO">Done</button>`;
}

// ============ Hazard details ============
const HAZ = ['Pothole', 'Accident', 'Police check', 'Animals', 'Oil or gravel', 'Traffic jam', 'Road work', 'Other'];
export function openHazard() {
  const m = modal(`<h2>Report a hazard</h2><p class="muted" style="margin:4px 0 12px">${ic('pin', 15)} Shared with your current location${LV.pos ? '' : ' (waiting for GPS)'}.</p>
    <div class="chips">${HAZ.map((h) => `<button data-hz="${h}">${h}</button>`).join('')}</div><button class="btn" style="margin-top:16px" data-hz="">Send without details</button>`);
  m.el.addEventListener('click', (e) => { const b = e.target.closest('[data-hz]'); if (!b) return; m.close(); sendSignal('hazard', b.dataset.hz); });
}

// ============ Fuel stop flow ============
let FF = null; // finder modal state
const detourMin = (offM) => Math.max(1, Math.round((2 * offM) / (28 / 3.6) / 60));

function onSignal(sig, rel) {
  const suggestion = (sig.kind === 'fuel' || sig.kind === 'break') && sig.note && sig.pos;
  if (suggestion) { // someone suggested a specific place
    const k = sig.kind === 'fuel' ? 'fuel' : 'food';
    showAlert({ c: '#FFB020', i: KINDS[k].icon, title: `${sig.name} suggests: ${sig.note}`, sub: rel, ms: 40000, btns: canPlan() ? [{ label: 'Preview', act: 'fuelsuggest', attrs: `data-kind="${k}" data-lat="${sig.pos.lat}" data-lng="${sig.pos.lng}" data-name="${esc(sig.note)}"` }] : [{ label: 'Got it', act: 'ack', attrs: `data-id="${sig.id}"` }] });
    return true;
  }
  if (sig.kind !== 'fuel') return false;
  const who = LV.riders.find((x) => x.id === sig.by);
  showAlert({ c: '#FFB020', i: 'fuel', title: `${sig.name} needs a fuel stop`, sub: `${who ? roleLabel(who) + ' · ' : ''}${rel}`, ms: 45000, btns: [...(canPlan() ? [{ label: 'Find fuel stop', act: 'fuelfind' }] : []), { label: 'Acknowledge', act: 'ack', attrs: `data-id="${sig.id}"` }] });
  return true;
}
/** After you tap Fuel or Break as organiser/leader: offer to put it in the shared plan. */
function afterSignal(kind) {
  if (!canPlan() || LV.ride?.status !== 'live') return;
  if (kind === 'fuel') showAlert({ c: '#FFB020', i: 'fuel', title: 'Add a fuel stop to the plan?', sub: 'Everyone gets the new route', ms: 20000, btns: [{ label: 'Find fuel stop', act: 'fuelfind' }] });
  if (kind === 'break') showAlert({ c: '#4ADE80', i: 'coffee', title: 'Add a break stop to the plan?', sub: 'Everyone gets the new route', ms: 20000, btns: [{ label: 'Find a place', act: 'breakfind' }] });
}

export function openFuelFinder(kind = 'fuel') {
  if (!LV.ride || LV.ride.status === 'ended') return say('Join a ride first', { err: true });
  if (FF) return;
  const K = KINDS[kind] || KINDS.fuel, ns = nextStop();
  const m = modal(`<div class="row"><h2 class="sp">Find ${K.label.toLowerCase()}</h2><button class="icon-btn" data-act="closeFF" aria-label="Close">${ic('x')}</button></div>
    <p class="muted" style="margin:2px 0 10px">Along your route to ${esc(ns?.name || 'the destination')}</p>
    <input class="inp" id="ffq" placeholder="${K.search}" autocomplete="off">
    <div class="chips" style="margin:10px 0"><button class="chip lime" data-act="fuelmode" data-mode="route">Along route</button><button data-act="fuelmode" data-mode="near">Nearby</button></div>
    <div class="map box" id="ffmap" style="height:170px"></div>
    <div class="sec" style="margin:14px 0 8px"><h3>${K.plural}</h3><span class="muted" id="ffcount"></span></div><div id="fflist"><p class="muted">${SPIN} Looking for places…</p></div>
    <p class="note">Detours are estimated riding time.</p>
    <button class="btn primary" id="ffgo" data-act="fuelprev" disabled>Preview stop ${ic('chev', 16)}</button><p class="note">Nothing changes until you confirm.</p>`,
  { onClose() { FF?.map?.remove(); FF = null; } });
  FF = { m, kind: kind in KINDS ? kind : 'fuel', mode: 'route', list: [], sel: 0, map: null, q: '', gone: false };
  $('#ffq', m.el).addEventListener('input', debounce((e) => { FF.q = e.target.value.toLowerCase(); renderStations(); }, 200));
  mkMap('ffmap').then((map) => {
    if (!FF || !map) return map?.remove();
    FF.map = map;
    if (LV.pts) drawRoute(map, LV.pts, {});
    renderStations();
  });
  loadStations('route');
}
async function loadStations(mode) {
  if (!FF) return;
  FF.mode = mode; FF.list = []; FF.sel = 0;
  $('#fflist', FF.m.el).innerHTML = `<p class="muted">${SPIN} Looking for places…</p>`;
  try {
    const me = LV.pos || (LV.live?.map && { lat: LV.live.map.getCenter().lat, lng: LV.live.map.getCenter().lng }) || { lat: LV.ride.start.lat, lng: LV.ride.start.lng };
    const myM = progress(LV.route, [me.lat, me.lng])?.m ?? 0, ns = nextStop(), endM = Math.min(Math.max(ns?.m ?? LV.route.total, myM + 3000), myM + 30000);
    let raw;
    if (mode === 'route') {
      const mid = pointAt(LV.route, (myM + endM) / 2);
      raw = await nearby(KINDS[FF.kind].nearby, mid[0], mid[1], Math.min(15000, Math.max(5000, (endM - myM) / 2 + 3000)));
    } else raw = await nearby(KINDS[FF.kind].nearby, me.lat, me.lng, 6000);
    let list = raw.map((s) => { const p = progress(LV.route, [s.lat, s.lng]); return { ...s, off: p?.off ?? 9999, m: p?.m ?? 0 }; });
    if (mode === 'route') list = list.filter((s) => s.off <= 3500 && s.m >= myM - 200 && s.m <= endM + 1500).sort((a, b) => a.m - b.m);
    else list = list.sort((a, b) => hav([me.lat, me.lng], [a.lat, a.lng]) - hav([me.lat, me.lng], [b.lat, b.lng]));
    FF.list = list.slice(0, 6).map((s) => ({ ...s, away: mode === 'route' ? Math.max(0, s.m - myM) + s.off : hav([me.lat, me.lng], [s.lat, s.lng]), detour: detourMin(s.off) }));
  } catch (e) { if (FF) $('#fflist', FF.m.el).innerHTML = `<p style="color:var(--red)">${esc(e.message || 'Search failed')}</p>`; return; }
  renderStations();
}
function renderStations() {
  if (!FF) return;
  const list = FF.list.filter((s) => !FF.q || s.name.toLowerCase().includes(FF.q));
  FF.shown = list;
  if (FF.sel >= list.length) FF.sel = 0;
  $('#ffcount', FF.m.el).textContent = list.length ? `${list.length} option${list.length > 1 ? 's' : ''}` : '';
  $('#fflist', FF.m.el).innerHTML = list.length ? list.map((s, i) => `<button class="fst ${i === FF.sel ? 'on' : ''}" data-act="fuelpick" data-i="${i}"><span class="num">${i + 1}</span><div class="sp"><b>${esc(s.name)}</b><div class="muted" style="font-size:12px">${s.off < 150 ? 'On your route' : fmtKm(s.off) + ' off route'}</div><div class="row" style="margin-top:6px"><span style="font-size:12px;font-weight:700">${fmtKm(s.away)} away</span><span class="chip ${i === FF.sel ? 'lime' : ''}">+${s.detour} min detour</span></div></div></button>`).join('')
    : `<p class="muted">${FF.list.length ? 'Nothing matches that search.' : 'Nothing found along the route. Try Nearby.'}</p>`;
  $('#ffgo', FF.m.el).disabled = !list.length;
  // numbered pins on the little map
  if (FF.map) {
    FF.pins?.forEach((p) => p.remove());
    FF.pins = list.map((s, i) => mkMarker(FF.map, [s.lat, s.lng], `<div class="fpin ${i === FF.sel ? 'on' : ''}"><span>${i + 1}</span></div>`, { w: 28, h: 34, anchor: 'bottom', title: s.name }));
    if (LV.pos) FF.pins.push(mkMarker(FF.map, [LV.pos.lat, LV.pos.lng], '<div class="startpin"></div>', { w: 16, h: 16 }));
    const pts = [...list.map((s) => [s.lat, s.lng]), ...(LV.pos ? [[LV.pos.lat, LV.pos.lng]] : [])];
    if (pts.length) fit(FF.map, pts, 36);
  }
}

let PV = null;
export async function previewFuel(st) {
  if (PV) return;
  const kind = st.kind || FF?.kind || 'fuel', K = KINDS[kind] || KINDS.fuel;
  const r = LV.ride, idx = insertAt();
  const m = modal(`<div class="row"><h2 class="sp">Preview ${K.label.toLowerCase()}</h2><span class="chip">Draft</span></div>
    <div class="map box" id="pvmap" style="height:150px;margin:12px 0"></div>
    <h1 style="font-size:24px">${esc(st.name)}</h1><p class="muted" id="pvsub">${SPIN} Calculating the detour…</p><div id="pvbody"></div>`,
  { onClose() { PV?.map?.remove(); PV = null; } });
  PV = { m, map: null, kind };
  mkMap('pvmap').then((map) => { if (!PV || !map) return map?.remove(); PV.map = map; if (LV.pts) drawRoute(map, LV.pts, { color: '#8a8a8a', dash: true }); PV.mapReady?.(); });
  const newStop = { name: st.name, lat: st.lat, lng: st.lng, type: K.type };
  const stops = [...r.stops]; stops.splice(idx, 0, newStop);
  try {
    const rr = await fetchRoute([r.start, ...stops, r.dest]);
    if (!PV) return;
    const extra = Math.max(1, Math.round((rr.dur - r.dur) / 60));
    const me = LV.pos, far = me ? (st.away != null ? st.away : hav([me.lat, me.lng], [st.lat, st.lng])) : 0;
    $('#pvsub').textContent = st.sub || 'On your planned route';
    const after = stops.slice(idx + 1);
    $('#pvbody').innerHTML = `<div class="grid2" style="margin:6px 0 14px"><div class="stat"><b>${fmtKm(far)}</b><span>From you</span></div><div class="stat"><b style="color:var(--lime)">+${extra} min</b><span>Estimated detour</span></div></div>
      <h3 style="margin-bottom:8px">Updated stop order</h3>
      <div class="ostop on"><span class="oi">${ic(K.icon, 18)}</span><div><b>${esc(st.name)}</b><div><span class="chip lime" style="margin-top:4px">${LV.ride.status === 'live' ? 'New next stop' : 'New stop'}</span></div></div></div>
      ${after.map((s) => `<div class="ostop"><span class="oi">${ic(kindOf(s).icon, 18)}</span><div><b>${esc(s.name)}</b></div></div>`).join('')}
      <div class="ostop"><span class="oi">${ic('pin', 18)}</span><div><b>${esc(r.dest.name)}</b><div class="muted" style="font-size:12px">Final destination</div></div></div>
      <p class="note">${ic('users', 14)} This update will be shared with all ${members().length} riders.</p>
      ${canPlan() ? `<button class="btn primary" data-act="fuelconfirm">Add as next stop ${ic('chev', 16)}</button><p class="note">Your later stops and destination stay in the plan.</p>`
        : `<p class="note">Only the organiser or the leader can change the plan.</p><button class="btn primary" data-act="fuelsuggestsend">Suggest this stop to the group</button>`}
      <button class="link" style="display:block;margin:10px auto 0" data-act="fuelback">Choose another station</button>`;
    PV.plan = { stops, rr, st };
    // draw the proposed route in white dashes over the current one
    const draw = () => { if (!PV?.map) return; drawRoute(PV.map, rr.pts, { dest: r.dest }); fit(PV.map, rr.pts, 24); };
    PV.map ? draw() : (PV.mapReady = draw);
  } catch (e) { if (PV) $('#pvsub').innerHTML = `<span style="color:var(--red)">${esc(e.message || 'Could not calculate the route')}</span>`; }
}
function confirmFuel() {
  if (!PV?.plan) return;
  const { stops, rr, st } = PV.plan;
  LV.myPlan = true;
  rideSend({ t: 'plan', stops, route: { pts: rr.pts, dist: rr.dist, dur: rr.dur, steps: rr.steps }, note: `${(KINDS[PV.kind] || KINDS.fuel).label} added: ${st.name}` });
  PV.m.close(); FF?.m.close();
  toast('Sending the new plan to the group…');
}

// ============ Plan updated / delivery ============
let DEL = null;
function openDelivery(note) {
  DEL?.close();
  DEL = modal('<div id="dl"></div>', { onClose() { DEL = null; } });
  DEL.note = note; renderDelivery();
}
function renderDelivery() {
  if (!DEL) return;
  const list = members(), got = new Set(LV.receipts?.got || []);
  const ok = (x) => x.bot || got.has(x.id), done = list.filter(ok).length, ns = nextStop();
  const order = [...LV.ride.stops.filter((s) => !(LV.ride.done || []).includes(s.id)).map((s) => s.name), LV.ride.dest.name].map((n) => n.split(/[ ,]/)[0]).join(' → ');
  const waiting = list.filter((x) => !ok(x));
  $('#dl', DEL.el).innerHTML = `<div class="row"><h2 class="sp">Plan updated</h2><button class="icon-btn" data-act="closeDL" aria-label="Close">${ic('x')}</button></div>
    <div style="text-align:center;margin:10px 0"><div class="bigcheck">${ic('check', 30)}</div><h1 style="font-size:26px;margin-top:8px">${esc((DEL.note || 'Plan updated').split(':')[0])}.</h1><p class="muted">Your group has a new next stop.</p></div>
    <div class="card"><span class="chip lime">NEXT STOP</span><h2 style="margin:8px 0 2px">${esc(ns?.name || '')}</h2><p class="muted" style="font-size:12px">${esc(order)}</p></div>
    <div class="sec" style="margin:16px 0 6px"><h3>Update delivery</h3><span class="muted">${list.length} riders</span></div>
    ${list.map((x) => `<div class="rider">${rowPin(x)}<div class="sp"><div class="n">${x.isMe ? 'You' : esc(x.name)}</div><div class="s">${esc(roleLabel(x))}${x.link === 'lost' ? ' · Offline' : ''}</div></div>${ok(x) ? `<span class="rcv">${ic('check', 16)} Received</span>` : `<span class="muted">${ic('clock', 16)} Pending</span>`}</div>`).join('')}
    <p class="note">${done} of ${list.length} devices received the update.</p>
    ${waiting.length ? `<div class="card" style="padding:10px 14px;font-size:13px">${esc(waiting.map((x) => x.name).join(', '))} will receive the latest plan when reconnected.</div>` : ''}
    <p class="note">Received confirms delivery, not rider acknowledgement.</p>
    <div class="sec" style="margin:14px 0 4px"><h3>Update your navigation</h3></div><p class="muted" style="margin-bottom:10px">Turn-by-turn in Rilo already follows the new plan. Open Google Maps too if you prefer.</p>
    <a class="btn primary" target="_blank" rel="noopener" href="${ns ? mapsLink(ns.lat, ns.lng) : '#'}">Update navigation ${ic('chev', 16)}</a>
    <button class="btn" style="margin-top:10px" data-act="closeDL">Back to ride ${ic('chev', 16)}</button>`;
}

// ============ Ride plan (itinerary) + add stop ============
let PL = null;
export function openPlan() {
  if (!LV.ride) return;
  if (PL) PL.close();
  PL = modal('<div id="pl"></div>', { onClose() { PL = null; } });
  renderPlan();
}
function renderPlan() {
  if (!PL) return;
  const r = LV.ride, done = r.done || [], ns = nextStop(), live = r.status === 'live';
  const row = (n, tag, name, sub, cls = '') => `<div class="ostop ${cls}"><span class="oi">${n}</span><div class="sp"><span class="tiny ${cls ? 'lime' : ''}">${tag}</span><b>${esc(name)}</b>${sub ? `<div class="muted" style="font-size:12px">${esc(sub)}</div>` : ''}</div></div>`;
  $('#pl', PL.el).innerHTML = `<div class="row"><h2 class="sp">Ride plan</h2><button class="icon-btn" data-act="closePL" aria-label="Close">${ic('x')}</button></div>
    <p class="muted" style="margin:4px 0 12px">${esc(r.name)} · ${fmtKm(r.dist)} · ${fmtDur(r.dur)}</p>
    <div class="sec" style="margin:0 0 8px"><h3>Your itinerary</h3><span class="muted">${r.stops.length + 2} places</span></div>
    ${row(done.length || live ? ic('check', 16) : '1', 'MEETING POINT', r.start.name, '')}
    ${r.stops.map((s, i) => row(done.includes(s.id) ? ic('check', 16) : i + 2, done.includes(s.id) ? 'DONE' : ns?.id === s.id ? 'NEXT STOP' : kindOf(s).label.toUpperCase(), s.name, '', ns?.id === s.id ? 'on' : '')).join('')}
    ${row(r.stops.length + 2, 'FINAL DESTINATION', r.dest.name, '', ns?.id === 'dest' ? 'on' : '')}
    <p class="note">${ic('users', 14)} Everyone receives the same stop order.</p>
    ${canPlan() && r.status !== 'ended' ? `<button class="btn" data-act="addstop">Add stop ${ic('plus', 16)}</button>` : ''}
    ${LV.live ? `<button class="btn" style="margin-top:10px" data-act="planmap">${ic('layers', 16)} Show whole route on map</button>` : ''}
    <button class="btn primary" style="margin-top:10px" data-act="closePL">Back ${ic('chev', 16)}</button>`;
}
let AS = null;
export function openAddStop() {
  if (!LV.ride || LV.ride.status === 'ended') return say('Join a ride first', { err: true });
  if (AS) return;
  const plan = canPlan(), live = LV.ride.status === 'live';
  AS = modal(`<div class="row"><h2 class="sp">Add a stop</h2><button class="icon-btn" data-act="closeAS" aria-label="Close">${ic('x')}</button></div>
    <p class="muted" style="margin:4px 0 12px">${plan ? (live ? 'It becomes the next stop and everyone gets the new route.' : 'It is added before the final destination and shared with everyone.') : 'Only the organiser or the leader can change the plan, so this sends them a suggestion.'}</p>
    <div class="grid3" style="margin-bottom:12px">
      <button class="opt" data-act="addkind" data-k="fuel">${ic('fuel', 24)}Fuel<small>Pumps nearby</small></button>
      <button class="opt" data-act="addkind" data-k="food">${ic('coffee', 24)}Break<small>Food, chai, rest</small></button>
      <button class="opt" data-act="waitstop">${ic('hand', 24)}Wait here<small>Regroup point</small></button></div>
    <input class="inp" id="asq" placeholder="Or search any place" autocomplete="off"><div id="asr" style="margin-top:10px"></div>`, { onClose() { AS = null; } });
  const run = debounce(async (e) => {
    const q = e.target.value.trim(), box = $('#asr', AS?.el); if (!box) return;
    if (q.length < 3) { box.innerHTML = ''; return; }
    box.innerHTML = `<p class="muted">${SPIN} Searching…</p>`;
    try {
      const near = LV.pos || LV.ride.start, list = await geocode(q, near);
      AS.list = list;
      box.innerHTML = list.length ? list.map((p, i) => `<button class="list-item" data-act="addpick" data-i="${i}"><div class="sp"><div class="t">${esc(p.name)}</div><div class="s">${esc(p.sub.slice(0, 70))}</div></div>${plan ? ic('plus', 18) : '<span class="chip">Suggest</span>'}</button>`).join('') : '<p class="muted">No places found.</p>';
    } catch { box.innerHTML = '<p style="color:var(--red)">Search unavailable. Check your connection.</p>'; }
  }, 450);
  $('#asq', AS.el).addEventListener('input', run);
}
/** Insert a stop into the shared plan (organiser/leader) and tell everyone. */
async function planStop(stop, note) {
  const r = LV.ride, stops = [...r.stops];
  stops.splice(insertAt(), 0, stop);
  const rr = await fetchRoute([r.start, ...stops, r.dest]);
  LV.myPlan = true;
  rideSend({ t: 'plan', stops, route: { pts: rr.pts, dist: rr.dist, dur: rr.dur, steps: rr.steps }, note });
}
async function addStopPick(p) {
  const box = $('#asr', AS?.el);
  if (!canPlan()) { AS?.close(); return sendSignal('break', p.name, { lat: p.lat, lng: p.lng }); }
  if (box) box.innerHTML = `<p class="muted">${SPIN} Adding ${esc(p.name)} and rebuilding the route…</p>`;
  try { await planStop({ name: p.name, lat: p.lat, lng: p.lng, type: '' }, `Stop added: ${p.name}`); AS?.close(); PL?.close(); }
  catch (e) { if (box) box.innerHTML = `<p style="color:var(--red)">${esc(e.message || 'Could not add that stop')}</p>`; }
}
/** "Wait here": a regroup point at your current location. */
export async function addWaitPoint() {
  if (!LV.ride || LV.ride.status === 'ended') return say('Join a ride first', { err: true });
  if (!LV.pos) return say('Waiting for your location', { err: true });
  if (!canPlan()) { AS?.close(); return sendSignal('wait'); } // riders can ask the group to wait; only the leader changes the plan
  toast('Adding a wait point here…');
  try {
    const where = await reverse(LV.pos.lat, LV.pos.lng).catch(() => '');
    await planStop({ name: where && where !== 'My location' ? `Wait point · ${where}` : 'Wait point', lat: LV.pos.lat, lng: LV.pos.lng, type: 'wait' }, 'Wait point added');
    AS?.close();
  } catch (e) { say(e.message || 'Could not add a wait point', { err: true }); }
}

// ============ At the stop: arrival tracker + readiness ============
let STOP = null;
const shown = {}; // stop ids whose sheet we already opened (so closing it doesn't reopen it)
function checkStop() {
  if (!LV.ride || LV.ride.status !== 'live') return;
  const ns = nextStop(); if (!ns) return;
  if (arrivedSet(ns.id).has(LV.me) && !shown[ns.id]) {
    shown[ns.id] = 1;
    if (ns.kind === 'dest') openDest(); else openStop(ns);
  }
  if (STOP) renderStop();
  if (DST) renderDest();
}
function openStop(ns) {
  if (STOP) return;
  STOP = { id: ns.id, view: 'arrived' };
  STOP.m = modal('<div id="stp"></div>', { onClose() { STOP = null; } });
  announce(`You've arrived at ${ns.name}.`);
  renderStop();
}
export function reopenStop() { const i = stopInfo(); if (!i) return; if (i.stop.kind === 'dest') openDest(); else openStop(i.stop); }
function renderStop() {
  if (!STOP) return;
  const ns = nextStop();
  if (!ns || ns.id !== STOP.id || ns.kind === 'dest') { STOP.m.close(); return; }
  const list = members(), arr = arrivedSet(ns.id), n = list.length, nxt = after(ns.id), el = $('#stp', STOP.m.el);
  const behind = list.filter((x) => !arr.has(x.id) && x.pos).map((x) => ({ x, d: hav([x.pos.lat, x.pos.lng], [ns.lat, ns.lng]) })).sort((a, b) => b.d - a.d)[0];
  const eta = behind ? Math.max(1, Math.round(behind.d / Math.max(8, (behind.x.spd || 0) / 3.6 || 8) / 60)) : 0;
  const ready = (x) => (x.bot ? arr.has(x.id) : x.sr), allArr = arr.size >= n, allReady = list.every((x) => arr.has(x.id) && ready(x));
  const kind = ns.type ? kindOf(ns).label.toUpperCase() : 'STOP';
  if (STOP.view === 'arrived') {
    el.innerHTML = `<div class="row"><h2 class="sp">At the stop</h2><button class="icon-btn" data-act="stopclose" aria-label="Close">${ic('x')}</button></div>
      <h1 style="font-size:26px;margin-top:8px">${esc(ns.name)}</h1><p class="muted">${ns.type ? kindOf(ns).label : `Stop ${ns.idx + 1} of ${LV.ride.stops.length}`}</p>
      <div class="card" style="margin-top:12px"><b style="font-size:18px">${arr.size} of ${n} riders arrived</b><div class="progress"><i style="width:${(arr.size / n) * 100}%"></i></div><span class="muted" style="font-size:13px">${behind ? `${esc(behind.x.name)} is about ${eta} min away.` : allArr ? 'Everyone is here.' : 'Waiting for riders to share their location.'}</span></div>
      <div style="margin-top:10px">${list.map((x) => `<div class="rider">${rowPin(x)}<div class="sp"><div class="n">${x.isMe ? 'You' : esc(x.name)}</div><div class="s">${esc(roleLabel(x))}</div></div>${arr.has(x.id) ? `<span class="rcv">${ic('check', 16)} Arrived</span>` : `<span class="muted">${ic('clock', 16)} ${x.link === 'lost' ? 'Offline' : 'On the way'}</span>`}</div>`).join('')}</div>
      <div class="card" style="display:flex;gap:12px;align-items:center;margin-top:10px"><span class="oi">${ic(nxt.kind === 'dest' ? 'pin' : 'coffee', 20)}</span><div><span class="tiny">THEN</span><b style="display:block">${esc(nxt.name)}</b></div></div>
      <button class="btn primary" style="margin-top:14px" data-act="stopcheck">Check readiness ${ic('chev', 16)}</button><p class="note">Confirm everyone is ready before continuing.</p>
      <button class="btn" data-act="stopclose">Back to map ${ic('chev', 16)}</button>`;
  } else {
    const me = list.find((x) => x.isMe);
    el.innerHTML = `<div class="row"><button class="icon-btn" data-act="stopback" aria-label="Back">${ic('back')}</button><h2 class="sp">Ready to continue</h2></div>
      <span class="tiny" style="display:block;margin-top:10px">STEP ${ns.idx + 1} · ${kind}</span><h1 style="font-size:26px">${esc(ns.name)}</h1>
      <div class="chip ${allArr ? 'lime' : 'amber'}" style="margin:8px 0 12px">${ic('check', 14)} ${allArr ? `All ${n} riders have arrived` : `${arr.size} of ${n} arrived`}</div>
      <div class="card" style="display:flex;gap:12px;align-items:center"><span class="oi">${ic(nxt.kind === 'dest' ? 'pin' : 'coffee', 20)}</span><div><span class="tiny">NEXT STOP</span><b style="display:block">${esc(nxt.name)}</b></div></div>
      ${nxt.kind === 'stop' ? `<p class="muted" style="margin:8px 0">After ${esc(nxt.name)}: ${esc(LV.ride.dest.name)}</p>` : ''}
      <div class="sec" style="margin:14px 0 6px"><h3>Readiness check</h3><span class="muted">${n} riders</span></div>
      ${list.map((x) => `<div class="rider">${rowPin(x)}<div class="sp"><div class="n">${x.isMe ? 'You' : esc(x.name)}</div><div class="s">${esc(roleLabel(x))}${x.isMe ? ' · <a class="link" data-act="stopmy">Change my status</a>' : ''}</div></div>${arr.has(x.id) && ready(x) ? `<span class="rcv">${ic('check', 16)} Ready</span>` : `<span class="muted">${ic('clock', 16)} ${arr.has(x.id) ? 'Not ready' : 'On the way'}</span>`}</div>`).join('')}
      ${me && !(arr.has(me.id) && ready(me)) ? `<button class="btn primary" style="margin-top:12px" data-act="stopmy">I'm ready</button>` : ''}
      ${canPlan() ? `<button class="btn ${allReady ? 'primary' : ''}" style="margin-top:10px" data-act="stopcont">${allReady ? 'Continue ride' : 'Continue anyway'} ${ic('chev', 16)}</button><p class="note">${allReady ? 'Everyone is ready for the next leg.' : 'Not everyone is ready yet.'}</p>` : `<p class="note">Waiting for the leader to continue the ride.</p>`}
      <button class="btn" style="margin-top:6px" data-act="stopclose">Stay at this stop ${ic('chev', 16)}</button>`;
  }
}

// ============ Destination reached ============
let DST = null;
function openDest() {
  if (DST) return;
  DST = modal('<div id="dst"></div>', { onClose() { DST = null; } });
  announce(`You've reached ${LV.ride.dest.name}.`); vibrate([200, 100, 200]);
  renderDest();
}
function renderDest() {
  if (!DST) return;
  const list = members(), arr = arrivedSet('dest'), n = list.length, all = arr.size >= n, r = LV.ride;
  const chain = [r.start.name, ...r.stops.map((s) => s.name), r.dest.name].map((x) => x.split(/[,]/)[0]).join(' → ');
  $('#dst', DST.el).innerHTML = `<div class="row"><h2 class="sp">Destination reached</h2><button class="icon-btn" data-act="destkeep" aria-label="Close">${ic('x')}</button></div>
    <h1 style="margin-top:12px">${all ? 'You made it together.' : `You reached ${esc(r.dest.name.split(',')[0])}.`}</h1><p class="muted">${esc(r.dest.name)}</p>
    <div class="chip ${all ? 'lime' : 'amber'}" style="margin:10px 0">${ic('check', 14)} ${all ? `All ${n} riders have arrived` : `${arr.size} of ${n} riders arrived`}</div>
    <div class="sec" style="margin:10px 0 6px"><h3>Your group</h3></div>
    ${list.map((x) => `<div class="rider">${rowPin(x)}<div class="sp"><div class="n">${x.isMe ? 'You' : esc(x.name)}</div><div class="s">${esc(roleLabel(x))}</div></div>${arr.has(x.id) ? `<span class="rcv">${ic('check', 16)} Arrived</span>` : `<span class="muted">${ic('clock', 16)} On the way</span>`}</div>`).join('')}
    <div class="card" style="margin-top:12px"><b style="color:var(--lime);letter-spacing:.5px">ROUTE COMPLETED</b><p class="muted" style="font-size:13px;margin-top:4px">${esc(chain)}</p><p class="muted" style="font-size:12px;margin-top:6px">${ic('pin', 13)} Location sharing is still on until the ride ends.</p></div>
    ${isHost() ? `<button class="btn primary" style="margin-top:12px" data-act="destend">End group ride ${ic('chev', 16)}</button>` : ''}
    <button class="btn" style="margin-top:10px" data-act="destkeep">Keep ride open ${ic('chev', 16)}</button>`;
}

// ============ Join requests (organiser) ============
const knownPending = new Set();
function checkRequests() {
  if (!LV.ride || !isHost()) return;
  for (const x of LV.riders) if (x.pending && !knownPending.has(x.id)) {
    knownPending.add(x.id);
    showAlert({ c: '#DFFF00', i: 'users', title: `${x.name} wants to join`, sub: x.bike || 'Join request', ms: 60000, btns: [{ label: 'Approve', act: 'approve', attrs: `data-id="${x.id}"` }, { label: 'Decline', act: 'decline', attrs: `data-id="${x.id}"` }] });
    announce(`${x.name} wants to join the ride.`); vibrate([100, 60, 100]);
  }
}

// ============ Events from ride.js ============
hooks.group = {
  onSignal, afterSignal,
  onRiders() { renderRiders(); renderRoles(); renderDelivery(); checkStop(); checkRequests(); },
  onReceipts() { renderDelivery(); },
  onAck(s) { if (s.by === LV.me && s.acks.length) toast(`${s.acks[s.acks.length - 1].name} acknowledged`); },
  onPlan(m) {
    renderPlan();
    if (LV.myPlan) { LV.myPlan = false; openDelivery(m.note || 'Plan updated'); }
    else {
      const ns = nextStop();
      showAlert({ c: '#DFFF00', i: 'route', title: `${m.by} updated the plan`, sub: `${m.note || 'New route'} · ${ns?.name || 'destination'} is next`, ms: 20000 });
      announce(`${m.by} updated the plan. ${ns?.name || 'The destination'} is next.`); vibrate([120, 60, 120]);
    }
  },
  onMeta(prev, m) {
    if (m.left && prev) {
      const gone = prev.stops.find((s) => s.id === m.left), ns = nextStop();
      STOP?.m.close();
      showAlert({ c: '#DFFF00', i: 'flag', title: `Ride resumed · ${ns?.name || 'destination'} is next`, sub: gone ? `${gone.type ? kindOf(gone).label : gone.name} completed` : '', ms: 15000 });
      announce(`Ride resumed. ${ns?.name || 'The destination'} is next.`);
    }
    renderPlan();
  },
};

// ============ click actions ============
const closer = (get, set) => () => { get()?.close(); };
export const groupActs = {
  riders: openRiders, closeRS: () => RS?.close(), roles: openRoles, closeRO: () => RO?.close(),
  viewrider(el) {
    const x = riderView().find((r) => r.id === el.dataset.id); RS?.close();
    const s = LV.live; if (!x?.pos || !s) return toast('No location for that rider yet', true);
    s.follow = false; s.map.easeTo({ center: [x.pos.lng, x.pos.lat], zoom: 16, duration: 700 });
  },
  setrole(el) { rideSend({ t: 'role', id: el.dataset.id, role: el.dataset.role }); },
  approve(el) { rideSend({ t: 'approve', id: el.dataset.id }); fadeOut(el.closest('.alert')); },
  decline(el) { rideSend({ t: 'decline', id: el.dataset.id }); fadeOut(el.closest('.alert')); },
  hazard: openHazard,
  ack(el) { rideSend({ t: 'ack', id: el.dataset.id }); fadeOut(el.closest('.alert')); toast('Acknowledged'); },
  fuelfind(el) { fadeOut(el?.closest?.('.alert')); openFuelFinder('fuel'); },
  closeFF: () => FF?.m.close(),
  fuelmode(el) { if (!FF) return; $$('[data-act=fuelmode]', FF.m.el).forEach((b) => (b.className = b === el ? 'chip lime' : '')); loadStations(el.dataset.mode); },
  fuelpick(el) { if (!FF) return; FF.sel = +el.dataset.i; renderStations(); },
  fuelprev() { const s = FF?.shown?.[FF.sel]; if (s) previewFuel({ ...s, sub: s.off < 150 ? 'On your route' : `${fmtKm(s.off)} off your route` }); },
  fuelconfirm: confirmFuel,
  fuelback() { PV?.m.close(); },
  fuelsuggest(el) { fadeOut(el.closest('.alert')); const kind = el.dataset.kind || 'fuel'; if (!FF) openFuelFinder(kind); previewFuel({ kind, name: el.dataset.name, lat: +el.dataset.lat, lng: +el.dataset.lng, sub: 'Suggested by a rider' }); },
  breakfind(el) { fadeOut(el?.closest?.('.alert')); openFuelFinder('food'); },
  addkind(el) { AS?.close(); openFuelFinder(el.dataset.k); },
  waitstop: addWaitPoint,
  fuelsuggestsend() { const st = PV?.plan?.st, k = PV?.kind; PV?.m.close(); FF?.m.close(); if (st) sendSignal(k === 'food' ? 'break' : 'fuel', st.name, { lat: st.lat, lng: st.lng }); },
  closeDL: () => DEL?.close(),
  planmap() { const s = LV.live; PL?.close(); if (!s) return; s.follow = false; s.map.jumpTo({ bearing: 0, pitch: 0, padding: { top: 0, bottom: 0, left: 0, right: 0 } }); fit(s.map, LV.pts, 50); },
  openplan: openPlan, closePL: () => PL?.close(), addstop: openAddStop, closeAS: () => AS?.close(),
  addpick(el) { const p = AS?.list?.[+el.dataset.i]; if (p) addStopPick(p); },
  stopcheck() { if (STOP) { STOP.view = 'ready'; renderStop(); } },
  stopback() { if (STOP) { STOP.view = 'arrived'; renderStop(); } },
  stopclose: () => STOP?.m.close(),
  stopmy() { const me = riderView().find((x) => x.isMe); const v = !(me?.sr); rideSend({ t: 'stopready', v }); const r = LV.riders.find((x) => x.id === LV.me); if (r) r.sr = v; renderStop(); },
  stopcont() { rideSend({ t: 'continue' }); },
  destkeep: () => DST?.close(),
  destend() { DST?.close(); rideSend({ t: 'end' }); },
};
// demo riders count as "ready" once they have arrived, so the flow can be tried alone
export { renderRiders, gauge, pctCls };

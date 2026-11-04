/* Rilo docs mode: the whole backend, in the browser.
 * Loaded before the app. It replaces the network the app talks to so the prototype works forever, with nothing to host:
 *   - WebSocket('/ws') and fetch('/api/rides')  -> the same room logic as server.js, running in this page
 *   - Nominatim / OSRM / Overpass                -> saved answers for one real route (Pune -> Lonavala)
 *   - navigator.geolocation / getBattery         -> a scripted rider
 *   - "bots": scripted riders that connect through the very same fake socket as the app does
 * Everything is driven from the flow player through window.RiloMock (see agent.js).
 */
(() => {
  const P = new URLSearchParams(location.search);
  const KEY = 'rilo.v1';
  const origFetch = window.fetch.bind(window);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const lat = () => 25 + Math.random() * 45; // fake network latency (ms)
  let D = null; // saved data (places, master route, nearby places)

  // ------------------------------------------------------------------ geometry
  const rad = Math.PI / 180;
  const hav = (a, b) => {
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(s));
  };
  let M = null; // master route helpers
  function prepMaster() {
    const co = D.master.geometry.coordinates; // [lng, lat]
    const cum = [0];
    for (let i = 1; i < co.length; i++) cum.push(cum[i - 1] + hav({ lat: co[i - 1][1], lng: co[i - 1][0] }, { lat: co[i][1], lng: co[i][0] }));
    M = { co, cum, total: cum[cum.length - 1] };
    M.snap = (lt, ln) => { let b = 0, bd = 1e12; for (let i = 0; i < co.length; i++) { const d = hav({ lat: lt, lng: ln }, { lat: co[i][1], lng: co[i][0] }); if (d < bd) { bd = d; b = i; } } return { i: b, d: bd }; };
    M.at = (m) => { m = Math.max(0, Math.min(M.total, m)); let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= m) lo = mid; else hi = mid; } const t = (m - cum[lo]) / ((cum[hi] - cum[lo]) || 1); return { lat: co[lo][1] + (co[hi][1] - co[lo][1]) * t, lng: co[lo][0] + (co[hi][0] - co[lo][0]) * t, i: lo }; };
    // each saved turn-by-turn step, with its position on the route
    M.steps = D.master.steps.map((s) => ({ ...s, idx: M.snap(s.maneuver.location[1], s.maneuver.location[0]).i }));
  }
  /** OSRM-shaped route through waypoints [[lng,lat],...]: a slice of the saved road if they lie along it, else a straight line. */
  function mockRoute(wps) {
    const snaps = wps.map(([ln, lt]) => M.snap(lt, ln));
    const ok = snaps.every((s, k) => s.d < 9000 && (k === 0 || s.i >= snaps[k - 1].i));
    const legs = [], coords = [];
    let dist = 0;
    for (let k = 0; k < wps.length - 1; k++) {
      let steps, g, d;
      if (ok) {
        const a = snaps[k].i, b = Math.max(snaps[k + 1].i, a + 1);
        g = M.co.slice(a, b + 1); d = M.cum[b] - M.cum[a];
        const inner = M.steps.filter((s) => s.idx > a && s.idx < b && s.maneuver.type !== 'depart' && s.maneuver.type !== 'arrive');
        const first = M.steps.filter((s) => s.idx <= a).pop();
        const pts = [{ type: 'depart', modifier: '', location: M.co[a], name: first?.name || '', ref: first?.ref || '', at: a }, ...inner.map((s) => ({ ...s.maneuver, name: s.name, ref: s.ref, at: s.idx })), { type: 'arrive', modifier: '', location: M.co[b], name: '', ref: '', at: b }];
        steps = pts.map((p, n) => ({ distance: n < pts.length - 1 ? M.cum[pts[n + 1].at] - M.cum[p.at] : 0, name: p.name, ref: p.ref, maneuver: { type: p.type, modifier: p.modifier || '', location: p.location, exit: p.exit || 0 } }));
      } else {
        g = [wps[k], wps[k + 1]]; d = hav({ lat: wps[k][1], lng: wps[k][0] }, { lat: wps[k + 1][1], lng: wps[k + 1][0] }) * 1.25;
        steps = [{ distance: d, name: '', ref: '', maneuver: { type: 'depart', modifier: '', location: wps[k] } }, { distance: 0, name: '', ref: '', maneuver: { type: 'arrive', modifier: '', location: wps[k + 1] } }];
      }
      coords.push(...(k ? g.slice(1) : g)); dist += d; legs.push({ steps });
    }
    const dur = dist / (D.master.distance / D.master.duration);
    return { code: 'Ok', routes: [{ geometry: { type: 'LineString', coordinates: coords }, distance: dist, duration: dur, legs }] };
  }
  /** The route in the shape the app stores with a ride: {pts:[lat,lng], dist, dur, steps}. */
  const clientRoute = (wps) => {
    const rt = mockRoute(wps).routes[0];
    return { pts: rt.geometry.coordinates.map(([x, y]) => [y, x]), dist: rt.distance, dur: rt.duration, steps: rt.legs.flatMap((l) => l.steps).map((s) => ({ t: s.maneuver.type, m: s.maneuver.modifier || '', n: (s.name || '').slice(0, 60), r: (s.ref || '').slice(0, 14), d: Math.round(s.distance), loc: [s.maneuver.location[1], s.maneuver.location[0]], x: s.maneuver.exit || 0 })) };
  };

  // ------------------------------------------------------------------ the room server (port of server.js)
  const COLORS = ['#DFFF00', '#4ADE80', '#38BDF8', '#F472B6', '#FFB020', '#A78BFA', '#FB7185', '#2DD4BF'];
  const CH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const ARRIVE_M = 150;
  const rides = new Map();
  const newCode = () => { let c; do { c = Array.from({ length: 6 }, () => CH[Math.floor(Math.random() * CH.length)]).join(''); } while (rides.has(c)); return c; };
  const sid = () => Math.random().toString(36).slice(2, 8);
  const str = (v, n = 60) => String(v ?? '').slice(0, n);
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const place = (p) => (p && num(p.lat) !== null && num(p.lng) !== null ? { name: str(p.name, 80), lat: p.lat, lng: p.lng } : null);
  const cleanPts = (a) => (Array.isArray(a) ? a : []).filter((p) => Array.isArray(p) && num(p[0]) !== null && num(p[1]) !== null).slice(0, 3000);
  const cleanStops = (a, keep = []) => (Array.isArray(a) ? a : []).map((s) => { const p = place(s); return p && { id: keep.includes(s.id) ? s.id : sid(), ...p, type: str(s.type, 12) }; }).filter(Boolean).slice(0, 12);
  const cleanSteps = (a) => (Array.isArray(a) ? a : []).slice(0, 1200).filter((s) => s && Array.isArray(s.loc) && num(s.loc[0]) !== null && num(s.loc[1]) !== null)
    .map((s) => ({ t: str(s.t, 24), m: str(s.m, 16), n: str(s.n, 60), r: str(s.r, 14), d: num(s.d) || 0, loc: [s.loc[0], s.loc[1]], x: Number.isInteger(s.x) ? s.x : 0 }));
  const nextStopId = (r) => r.stops.find((s) => !r.done.includes(s.id))?.id || 'dest';
  const pub = (r) => ({ code: r.code, name: r.name, when: r.when, status: r.status, hostId: r.hostId, approval: r.approval, startedAt: r.startedAt, endedAt: r.endedAt, start: r.start, dest: r.dest, stops: r.stops, done: r.done, planV: r.planV, dist: r.route.dist, dur: r.route.dur });
  const riderList = (r) => { const now = Date.now(); return [...r.riders.values()].map((x) => ({ id: x.id, name: x.name, avatar: x.avatar || '', bike: x.bike, color: x.color, ready: x.ready, online: x.online, role: x.role, pending: !!x.pending, sr: !!x.sr, share: x.share !== false, age: now - x.lastSeen, pos: x.pos, bat: x.bat, chg: x.chg, spd: x.spd, km: Math.round(x.km * 10) / 10, maxSpd: Math.round(x.maxSpd) })); };
  const snapMsg = (r) => ({ t: 'riders', riders: riderList(r), arrivals: r.arrivals, done: r.done });
  const receipts = (r) => ({ t: 'receipts', v: r.planV, got: [...r.got] });
  const send = (ws, o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
  const bcast = (r, o) => { for (const x of r.riders.values()) if (!x.pending) send(x.ws, o); };
  const joinedMsg = (r, id) => ({ t: 'joined', me: id, ride: pub(r), pts: r.route.pts, steps: r.route.steps, riders: riderList(r), arrivals: r.arrivals, receipts: receipts(r), signals: r.signals.filter((s) => Date.now() - s.ts < 30 * 60e3).slice(-30), assists: r.assists.filter((a) => a.status === 'open') });

  function createRide(b, forceCode) {
    const pts = cleanPts(b.route?.pts), start = place(b.start), dest = place(b.dest);
    if (pts.length < 2 || !start || !dest) return null;
    const code = forceCode || newCode();
    const r = { code, name: str(b.name, 50) || 'Group ride', when: str(b.when, 40), status: b.status || 'lobby', hostId: str(b.host?.id, 40), approval: b.approval !== false, startedAt: b.status === 'live' ? Date.now() : null, endedAt: null, start, dest, stops: cleanStops(b.stops), done: [], planV: 1, got: new Set(), route: { pts, dist: num(b.route.dist) || 0, dur: num(b.route.dur) || 0, steps: cleanSteps(b.route.steps) }, arrivals: {}, riders: new Map(), signals: [], assists: [], dirty: false, touched: Date.now() };
    rides.set(code, r);
    return code;
  }

  function onMessage(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === 'ping') return send(ws, { t: 'pong' });
    if (m.t === 'join') {
      const r = rides.get(str(m.code, 6).toUpperCase());
      if (!r) return send(ws, { t: 'error', msg: 'Ride not found' });
      const id = str(m.user?.id, 40);
      if (!id) return send(ws, { t: 'error', msg: 'Missing user' });
      ws._ride = r; ws._rid = id; r.touched = Date.now();
      let x = r.riders.get(id);
      if (!x) {
        const isHost = id === r.hostId;
        x = { id, color: COLORS[r.riders.size % COLORS.length], ready: isHost, km: 0, maxSpd: 0, pos: null, bat: null, chg: false, spd: 0, role: isHost ? 'leader' : 'rider', pending: r.approval && !isHost, sr: false };
        r.riders.set(id, x);
      }
      if (x.ws && x.ws !== ws) { try { x.ws.close(); } catch {} }
      Object.assign(x, { name: str(m.user.name, 24) || 'Rider', bike: str(m.user.bike, 30), avatar: /^[mw][1-5]$/.test(m.user.avatar) ? m.user.avatar : (x.avatar || ''), share: m.user.share !== false, ws, online: true, lastSeen: Date.now() });
      if (x.pending) { send(ws, { t: 'pending', host: r.riders.get(r.hostId)?.name || 'the organiser' }); bcast(r, snapMsg(r)); return; }
      send(ws, joinedMsg(r, id)); bcast(r, snapMsg(r));
      return;
    }
    const ride = ws._ride, rid = ws._rid;
    if (!ride) return;
    const x = ride.riders.get(rid);
    if (!x || x.pending) return;
    ride.touched = Date.now(); x.lastSeen = Date.now(); x.online = true;
    const isHost = rid === ride.hostId, canPlan = isHost || x.role === 'leader';
    switch (m.t) {
      case 'loc': {
        const la = num(m.lat), ln = num(m.lng);
        if (la === null || ln === null) return;
        if (x.pos && ride.status === 'live') { const d = hav(x.pos, { lat: la, lng: ln }); if (d < 2000) x.km += d / 1000; }
        x.pos = { lat: la, lng: ln, ts: Date.now() };
        if (ride.status === 'live') for (const t of [...ride.stops.filter((s) => !ride.done.includes(s.id)), { id: 'dest', ...ride.dest }]) if (hav(x.pos, t) < ARRIVE_M) { const a = (ride.arrivals[t.id] = ride.arrivals[t.id] || []); if (!a.includes(rid)) a.push(rid); }
        if (num(m.spd) !== null) { x.spd = Math.max(0, m.spd * 3.6); x.maxSpd = Math.max(x.maxSpd, x.spd); }
        if (num(m.bat) !== null) x.bat = m.bat;
        x.chg = !!m.chg; ride.dirty = true; break;
      }
      case 'ready': x.ready = !!m.v; bcast(ride, snapMsg(ride)); break;
      case 'stopready': x.sr = !!m.v; bcast(ride, snapMsg(ride)); break;
      case 'start': if (isHost && ride.status === 'lobby') { ride.status = 'live'; ride.startedAt = Date.now(); bcast(ride, { t: 'meta', ride: pub(ride) }); } break;
      case 'end': if (isHost && ride.status !== 'ended') { ride.status = 'ended'; ride.endedAt = Date.now(); bcast(ride, { t: 'meta', ride: pub(ride), riders: riderList(ride), signals: ride.signals.length, arrivals: ride.arrivals }); } break;
      case 'continue': { if (!canPlan || ride.status !== 'live') return; const cur = nextStopId(ride); if (cur === 'dest') return; ride.done.push(cur); for (const y of ride.riders.values()) y.sr = false; bcast(ride, { t: 'meta', ride: pub(ride), left: cur, next: nextStopId(ride) }); bcast(ride, snapMsg(ride)); break; }
      case 'role': { if (!isHost || !['leader', 'rider', 'tail'].includes(m.role)) return; const y = ride.riders.get(str(m.id, 40)); if (!y || y.pending) return; if (m.role !== 'rider') for (const z of ride.riders.values()) if (z.role === m.role) z.role = 'rider'; y.role = m.role; bcast(ride, snapMsg(ride)); break; }
      case 'approve': case 'decline': {
        if (!isHost) return;
        const y = ride.riders.get(str(m.id, 40));
        if (!y || !y.pending) return;
        if (m.t === 'approve') { y.pending = false; send(y.ws, joinedMsg(ride, y.id)); } else { send(y.ws, { t: 'declined' }); ride.riders.delete(y.id); try { y.ws?.close(); } catch {} }
        bcast(ride, snapMsg(ride)); break;
      }
      case 'plan': {
        if (!canPlan || ride.status === 'ended') return;
        const pts = cleanPts(m.route?.pts); if (pts.length < 2) return;
        ride.stops = cleanStops(m.stops, ride.stops.map((s) => s.id));
        ride.done = ride.done.filter((id) => ride.stops.some((s) => s.id === id));
        ride.route = { pts, dist: num(m.route.dist) || ride.route.dist, dur: num(m.route.dur) || ride.route.dur, steps: cleanSteps(m.route.steps) };
        ride.planV++; ride.got = new Set([rid]);
        bcast(ride, { t: 'plan', ride: pub(ride), pts, steps: ride.route.steps, v: ride.planV, by: x.name, note: str(m.note, 80) });
        bcast(ride, receipts(ride)); break;
      }
      case 'planack': if (m.v === ride.planV && !ride.got.has(rid)) { ride.got.add(rid); bcast(ride, receipts(ride)); } break;
      case 'signal': {
        if (!['fuel', 'break', 'hazard', 'wait', 'stop'].includes(m.kind)) return;
        const s = { id: sid(), kind: m.kind, note: str(m.note, 80), by: rid, name: x.name, pos: num(m.lat) !== null ? { lat: m.lat, lng: m.lng } : x.pos, ts: Date.now(), acks: [] };
        ride.signals.push(s); bcast(ride, { t: 'signal', sig: s }); break;
      }
      case 'ack': { const s = ride.signals.find((q) => q.id === m.id); if (s && s.by !== rid && !s.acks.some((a) => a.id === rid)) { s.acks.push({ id: rid, name: x.name }); bcast(ride, { t: 'sigack', id: s.id, acks: s.acks }); } break; }
      case 'assist': {
        if (!['sos', 'charge', 'fuel', 'tools', 'medical'].includes(m.need)) return;
        const a = { id: sid(), need: m.need, note: str(m.note, 100), by: rid, name: x.name, pos: x.pos, ts: Date.now(), status: 'open', helpers: [] };
        ride.assists.push(a); bcast(ride, { t: 'assist', a }); break;
      }
      case 'offer': { const a = ride.assists.find((q) => q.id === m.id); if (a && a.status === 'open' && a.by !== rid && !a.helpers.some((h) => h.id === rid)) { a.helpers.push({ id: rid, name: x.name }); bcast(ride, { t: 'assist', a }); } break; }
      case 'resolve': { const a = ride.assists.find((q) => q.id === m.id); if (a && (a.by === rid || isHost)) { a.status = 'resolved'; bcast(ride, { t: 'assist', a }); } break; }
    }
  }
  function onClose(ws) {
    const ride = ws._ride; if (!ride) return;
    const x = ride.riders.get(ws._rid);
    if (x && x.ws === ws) { x.online = false; x.ws = null; bcast(ride, snapMsg(ride)); }
  }
  setInterval(() => { for (const r of rides.values()) if (r.dirty) { r.dirty = false; bcast(r, snapMsg(r)); } }, 1000);

  // ------------------------------------------------------------------ fake WebSocket
  let readyRes; const ready = new Promise((r) => (readyRes = r));
  class FakeWS {
    constructor(url) {
      this.url = url; this.readyState = 0;
      this.srv = { readyState: 1, send: (d) => { if (this.readyState === 1) setTimeout(() => this.readyState === 1 && this.onmessage?.({ data: d }), lat()); }, close: () => this._close() };
      ready.then(() => setTimeout(() => { if (this.readyState !== 0) return; this.readyState = 1; this.onopen?.({}); }, 40));
    }
    send(d) { if (this.readyState === 1) setTimeout(() => this.readyState === 1 && onMessage(this.srv, d), lat()); }
    close() { this._close(); }
    _close() { if (this.readyState >= 2) return; this.readyState = 3; this.srv.readyState = 3; setTimeout(() => { onClose(this.srv); this.onclose?.({}); }, 0); }
  }
  FakeWS.CONNECTING = 0; FakeWS.OPEN = 1; FakeWS.CLOSING = 2; FakeWS.CLOSED = 3;
  window.WebSocket = FakeWS;

  // ------------------------------------------------------------------ fetch: REST + saved map services
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
  const placeList = () => Object.values(D.places);
  const nearestName = (lt, ln) => { let b = null, bd = 1e12; for (const p of placeList()) { const d = hav({ lat: lt, lng: ln }, p); if (d < bd) { bd = d; b = p; } } return bd < 6000 ? b.name : 'My location'; };
  const KINDS = [['fuel', /fuel/i], ['food', /restaurant|cafe|fast_food|food/i], ['hospital', /hospital|clinic/i], ['repair', /motorcycle|repair/i]];
  const kindOf = (s) => (KINDS.find(([, re]) => re.test(s)) || ['fuel'])[0];
  const nominatim = (u) => ({ name: u.name, display_name: u.sub || u.name, lat: String(u.lat), lon: String(u.lng) });

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url || String(input);
    const method = (init?.method || input?.method || 'GET').toUpperCase();
    if (!/^https?:/.test(url) || url.startsWith(location.origin)) {
      const path = new URL(url, location.href).pathname.replace(/^.*?(\/api\/)/, '/api/');
      if (/^\/api\/rides/.test(path)) {
        await ready; await sleep(lat());
        if (method === 'POST' && path === '/api/rides') { const code = createRide(JSON.parse(init.body)); return code ? json({ code }) : json({ error: 'route, start and dest required' }, 400); }
        const mm = path.match(/^\/api\/rides\/([A-Za-z0-9]{6})$/);
        if (method === 'GET' && mm) {
          const r = rides.get(mm[1].toUpperCase()); if (!r) return json({ error: 'not found' }, 404);
          const k = Math.max(1, Math.ceil(r.route.pts.length / 160));
          return json({ ride: pub(r), riders: [...r.riders.values()].filter((x) => !x.pending).length, pts: r.route.pts.filter((_, i) => i % k === 0 || i === r.route.pts.length - 1) });
        }
      }
      return origFetch(input, init);
    }
    const u = new URL(url);
    if (u.hostname === 'nominatim.openstreetmap.org') {
      await ready; await sleep(180 + lat());
      if (u.pathname.startsWith('/reverse')) { const n = nearestName(+u.searchParams.get('lat'), +u.searchParams.get('lon')); return json({ name: n, display_name: n }); }
      const q = (u.searchParams.get('q') || '').toLowerCase();
      if (u.searchParams.get('bounded')) { const k = kindOf(q); const [x0, y1, x1, y0] = u.searchParams.get('viewbox').split(',').map(Number); return json(D.nearby[k].filter((p) => p.lng >= x0 && p.lng <= x1 && p.lat >= y0 && p.lat <= y1).map(nominatim)); }
      const words = q.split(/[\s,]+/).filter((w) => w.length > 2);
      const hits = placeList().filter((p) => words.some((w) => p.name.toLowerCase().includes(w) || p.sub.toLowerCase().includes(w)));
      return json((hits.length ? hits : placeList()).map(nominatim));
    }
    if (u.hostname === 'router.project-osrm.org') {
      await ready; await sleep(250 + lat());
      const coords = u.pathname.split('/').pop().split(';').map((s) => s.split(',').map(Number));
      return json(mockRoute(coords));
    }
    if (/overpass/.test(u.hostname)) {
      await ready; await sleep(220 + lat());
      const q = decodeURIComponent(String(init?.body || '').replace(/^data=/, ''));
      const k = kindOf(q), at = q.match(/around:(\d+),([-\d.]+),([-\d.]+)/);
      let list = D.nearby[k];
      if (at) { const c = { lat: +at[2], lng: +at[3] }; const near = list.filter((p) => hav(c, p) < +at[1] * 1.4); if (near.length) list = near; }
      return json({ elements: list.map((p, i) => ({ id: i, lat: p.lat, lon: p.lng, tags: { name: p.name } })) });
    }
    return origFetch(input, init); // map style + tiles (OpenFreeMap), fonts, libraries
  };

  // ------------------------------------------------------------------ the rider on the phone: GPS + battery
  const me = { lat: 18.5326, lng: 73.8513, spd: 0, hdg: null, bat: 78, chg: false, moving: false, m: 0, v: 0 };
  const pos = () => ({ coords: { latitude: me.lat, longitude: me.lng, speed: me.spd, heading: me.hdg, accuracy: 6 }, timestamp: Date.now() });
  const watchers = new Map(); let wid = 0;
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
    getCurrentPosition: (ok) => { ready.then(() => setTimeout(() => ok(pos()), 900)); }, // long enough to see the "Finding your location" feedback
    watchPosition: (ok) => { const id = ++wid; watchers.set(id, setInterval(() => ok(pos()), 1000)); setTimeout(() => ok(pos()), 300); return id; },
    clearWatch: (id) => { clearInterval(watchers.get(id)); watchers.delete(id); },
  } });
  navigator.getBattery = () => Promise.resolve({ get level() { return me.bat / 100; }, get charging() { return me.chg; }, addEventListener() {}, removeEventListener() {} });
  try { window.speechSynthesis.speak = () => {}; window.speechSynthesis.cancel = () => {}; } catch {}

  setInterval(() => { // move the rider along the saved road
    if (!me.moving || !M) return;
    me.m = Math.min(M.total, me.m + me.v);
    const a = M.at(me.m), b = M.at(me.m + 25);
    me.lat = a.lat; me.lng = a.lng; me.spd = me.v; me.hdg = (Math.atan2(Math.sin((b.lng - a.lng) * rad) * Math.cos(b.lat * rad), Math.cos(a.lat * rad) * Math.sin(b.lat * rad) - Math.sin(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos((b.lng - a.lng) * rad)) / rad + 360) % 360;
  }, 1000);

  // ------------------------------------------------------------------ bots: scripted riders that use the same socket
  const bots = new Map();
  class Bot {
    constructor(code, u) {
      Object.assign(this, { code, u, m: u.m || 0, v: u.v ?? 0, bat: u.bat ?? 80, drain: u.drain ?? 0.01, moving: !!u.moving, ackDelay: 900 + Math.random() * 2500, auto: u.auto !== false });
      this.id = u.id; bots.set(this.id, this); this.connect();
    }
    connect() {
      const ws = (this.ws = new FakeWS('/ws'));
      ws.onopen = () => ws.send(JSON.stringify({ t: 'join', code: this.code, user: { id: this.id, name: this.u.name, bike: this.u.bike, avatar: this.u.avatar, share: this.u.share } }));
      ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.t === 'joined') { this.joined = true; this.sendLoc(); if (this.u.ready) this.say({ t: 'ready', v: true }); }
        if (m.t === 'plan' && this.auto) setTimeout(() => this.say({ t: 'planack', v: m.v }), this.ackDelay);
        if (m.t === 'signal' && this.auto && m.sig.by !== this.id) setTimeout(() => this.say({ t: 'ack', id: m.sig.id }), this.ackDelay + 800);
      };
    }
    say(o) { this.ws.send(JSON.stringify(o)); }
    sendLoc() {
      const r = rides.get(this.code); if (!r || !this.joined || this.ws.readyState !== 1) return;
      const p = this.at(r); this.say({ t: 'loc', lat: p.lat, lng: p.lng, spd: this.moving ? this.v : 0, bat: Math.round(this.bat), chg: false });
    }
    at(r) { // position along this ride's route
      const pts = r.route.pts; if (!this._cum || this._pts !== pts) { this._pts = pts; this._cum = [0]; for (let i = 1; i < pts.length; i++) this._cum.push(this._cum[i - 1] + hav({ lat: pts[i - 1][0], lng: pts[i - 1][1] }, { lat: pts[i][0], lng: pts[i][1] })); }
      const m = Math.max(0, Math.min(this._cum[this._cum.length - 1], this.m)); let lo = 0, hi = pts.length - 1; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (this._cum[mid] <= m) lo = mid; else hi = mid; }
      const t = (m - this._cum[lo]) / ((this._cum[hi] - this._cum[lo]) || 1);
      return { lat: pts[lo][0] + (pts[hi][0] - pts[lo][0]) * t, lng: pts[lo][1] + (pts[hi][1] - pts[lo][1]) * t };
    }
    drop() { this.joined = false; this.ws.close(); }          // lose signal
    back() { this.connect(); }                                  // regain signal
  }
  setInterval(() => { for (const b of bots.values()) { if (b.moving) b.m += b.v; b.bat = Math.max(1, b.bat - b.drain); b.sendLoc(); } }, 1000);

  // ------------------------------------------------------------------ scenes (where each walkthrough starts) and the control surface
  const ME = { id: 'rushabh1', name: 'Rushabh', avatar: 'm1', bike: 'Royal Enfield Himalayan' };
  const CREW = [
    { id: 'aarav', name: 'Aarav K', avatar: 'm2', bike: 'KTM Duke 390', v: 21, bat: 83, drain: 0.01 },
    { id: 'vikram', name: 'Vikram P', avatar: 'm3', bike: 'Himalayan 450', v: 19, bat: 24, drain: 0.02 },
    { id: 'riya', name: 'Riya S', avatar: 'w1', bike: 'Interceptor 650', v: 20, bat: 66, drain: 0.01 },
  ];
  const seedUser = (extra = {}) => { try { localStorage.setItem(KEY, JSON.stringify({ user: { id: ME.id, name: ME.name, avatar: ME.avatar }, bike: { name: ME.bike, odo: 12480, tank: 11, serviceEvery: 3000, lastService: 10200 }, fuel: [], rides: [], active: null, prefs: { speak: false, guide: true, hands: false, demo: false }, ...extra })); } catch {} };
  const placesRoute = (...keys) => clientRoute(keys.map((k) => [D.places[k].lng, D.places[k].lat]));
  function liveRide({ host, stops = [], status = 'live', approval = false, name = 'Sunday to Lonavala', code = 'RILO42' }) {
    const keys = ['pune', ...stops, 'lonavala'];
    createRide({ name, status, approval, when: new Date().toISOString().slice(0, 16), start: { name: D.places.pune.name, lat: D.places.pune.lat, lng: D.places.pune.lng }, dest: { name: 'Lonavala', lat: D.places.lonavala.lat, lng: D.places.lonavala.lng }, stops: stops.map((k) => ({ name: D.places[k].name, lat: D.places[k].lat, lng: D.places[k].lng })), route: placesRoute(...keys), host: { id: host } }, code);
    return code;
  }
  /** Put the phone mid-ride: the crew is on the road, you are somewhere among them. */
  function ridingScene({ host, myM = 14000, ahead = 1300, near = 350, behind = -900, role = 'rider' }) {
    seedUser();
    const code = liveRide({ host: host === 'me' ? ME.id : CREW[0].id });
    me.m = myM; const a = M.at(myM); me.lat = a.lat; me.lng = a.lng; me.v = 19; me.spd = 19; me.moving = true;
    const offs = [ahead, near, behind];
    CREW.forEach((c, i) => new Bot(code, { ...c, m: myM + offs[i], moving: true, ready: true }));
    me.role = role;
    location.hash = '#/live/' + code;
    return code;
  }
  const SCENES = {
    fresh() { try { localStorage.removeItem(KEY); } catch {} location.hash = ''; },
    home() { seedUser(); location.hash = '#/home'; },
    join() { seedUser(); const code = liveRide({ host: CREW[0].id, status: 'lobby', approval: false, code: 'RILO42' }); new Bot(code, { ...CREW[0], ready: true, moving: false }); new Bot(code, { ...CREW[1], ready: true, moving: false }); location.hash = '#/home'; },
    rider() { ridingScene({ host: 'bot' }); },
    leader() { const code = ridingScene({ host: 'me', role: 'leader' }); },
    connection() { ridingScene({ host: 'bot', ahead: 700, near: -300, behind: -600 }); },
  };

  window.RiloMock = {
    me, bots, rides, ready,
    /** riders ask to join the ride the app just created (they wait for the organiser to approve) */
    crewJoin(code, who = [0, 1, 2], ready = false) { who.forEach((i, n) => setTimeout(() => new Bot(code, { ...CREW[i], m: 0, moving: false, ready, auto: true }), n * 700)); },
    crewReady(code) { bots.forEach((b) => b.say({ t: 'ready', v: true })); },
    /** the ride the app just created */
    latest() { return [...rides.keys()].pop(); },
    joinLatest(who, ready) { this.crewJoin(this.latest(), who, ready); },
    setReady(botId, v = true) { bots.get(botId)?.say({ t: 'ready', v }); },
    /** hold everyone still (for a clean tap on a moving pin) or let them go again */
    freeze(on = true) { me.moving = !on; if (on) me.spd = 0; bots.forEach((b) => { b.moving = !on; }); },
    offerHelp(botId) { const b = bots.get(botId), r = rides.get(b.code), a = [...r.assists].reverse().find((q) => q.status === 'open'); if (a) b.say({ t: 'offer', id: a.id }); },
    crewRide(speedMs = 19, spread = [700, 0, -400]) { const my = me.m; [...bots.values()].forEach((b, i) => { b.m = my + (spread[i] ?? 0); b.v = speedMs + (i - 1); b.moving = true; }); },
    meRide(m = 0, v = 19) { me.m = m; me.v = v; me.moving = true; },
    meStop() { me.moving = false; me.spd = 0; },
    signal(botId, kind, note = '') { bots.get(botId)?.say({ t: 'signal', kind, note }); },
    assist(botId, need) { bots.get(botId)?.say({ t: 'assist', need }); },
    drop(botId) { bots.get(botId)?.drop(); },
    back(botId) { bots.get(botId)?.back(); },
    /** a leader bot publishes a new stop: routes through it and tells everyone */
    publishStop(botId, key, type = 'fuel', name) {
      const b = bots.get(botId), r = rides.get(b.code), pl = D.places[key];
      const stops = [...r.stops, { name: name || pl.name, lat: pl.lat, lng: pl.lng, type }];
      const wps = [[r.start.lng, r.start.lat], ...stops.map((s) => [s.lng, s.lat]), [r.dest.lng, r.dest.lat]];
      b.say({ t: 'plan', stops, route: clientRoute(wps), note: `${type === 'fuel' ? 'Fuel stop' : 'Break stop'} added: ${name || pl.name}` });
    },
    setRole(botId, role) { const b = bots.get(botId), r = rides.get(b.code); r.riders.get(botId).role = role; bcast(r, snapMsg(r)); },
    ping() { return true; },
  };

  // ------------------------------------------------------------------ boot
  origFetch('docs-data.json').then((r) => r.json()).then((d) => {
    D = d; prepMaster();
    const scene = P.get('scene');
    if (scene && SCENES[scene]) SCENES[scene]();
    readyRes();
    window.RiloMock.data = D;
  });
  // The app reads storage and the hash as soon as it loads, so do the cheap, synchronous part right now.
  const s0 = P.get('scene');
  if (s0 === 'fresh') { try { localStorage.removeItem(KEY); } catch {} location.hash = ''; }
  else if (s0) { seedUser(); location.hash = s0 === 'home' || s0 === 'join' ? '#/home' : '#/live/RILO42'; }
})();

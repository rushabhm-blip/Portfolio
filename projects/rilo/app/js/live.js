// Live ride plumbing: WebSocket client, GPS + battery tracking, wake lock, and a demo simulator.
import { pointAt } from './lib.js';

export class Live {
  constructor() { this.h = {}; this.ws = null; this.q = []; this.closed = true; this.retry = 0; }
  on(t, f) { this.h[t] = f; return this; }
  emit(t, d) { this.h[t]?.(d); }
  connect(code, user) {
    this.code = code; this.user = user; this.closed = false;
    if (this.ws && this.ws.readyState <= 1) return;
    this._open();
  }
  _open() {
    const ws = (this.ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`));
    ws.onopen = () => { if (this.ws !== ws) return; this.retry = 0; ws.send(JSON.stringify({ t: 'join', code: this.code, user: this.user })); this.emit('status', 'online'); };
    ws.onmessage = (e) => {
      if (this.ws !== ws) return; // stale socket from a previous ride
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'joined') { const q = this.q.splice(0); q.forEach((o) => this.send(o)); }
      this.emit(m.t, m);
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.emit('status', 'offline');
      if (!this.closed) setTimeout(() => !this.closed && this._open(), Math.min(8000, 1000 * ++this.retry));
    };
    this.hb = this.hb || setInterval(() => this.ws?.readyState === 1 && this.ws.send('{"t":"ping"}'), 20000);
  }
  /** Signals and assist requests are queued when offline and sent once reconnected. */
  send(o) {
    if (this.ws && this.ws.readyState === 1) { this.ws.send(JSON.stringify(o)); return true; }
    if (['signal', 'assist', 'offer', 'resolve'].includes(o.t)) this.q.push(o);
    return false;
  }
  close() { this.closed = true; this.q = []; this.ws?.close(); clearInterval(this.hb); this.hb = null; }
}

export function startGps(onPos, onErr) {
  if (!navigator.geolocation) { onErr?.('unsupported'); return () => {}; }
  const id = navigator.geolocation.watchPosition(
    (p) => onPos({ lat: p.coords.latitude, lng: p.coords.longitude, spd: p.coords.speed, hdg: p.coords.heading, acc: p.coords.accuracy }),
    (e) => onErr?.(e.code === 1 ? 'denied' : 'unavailable'),
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
  return () => navigator.geolocation.clearWatch(id);
}
export function getPosition() {
  return new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('Location not supported'));
    navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }), () => rej(new Error('Location unavailable. Allow location access or type the start place.')), { enableHighAccuracy: true, timeout: 10000 });
  });
}
export async function watchBattery(cb) {
  try {
    const b = await navigator.getBattery();
    const f = () => cb({ bat: Math.round(b.level * 100), chg: b.charging });
    b.addEventListener('levelchange', f); b.addEventListener('chargingchange', f); f();
  } catch { /* not supported (e.g. iOS) */ }
}
let wl = null;
export async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) wl = await navigator.wakeLock.request('screen');
    else if (wl) { await wl.release(); wl = null; }
  } catch {}
}

/** Demo mode: you ride along the planned route, with a few simulated riders for testing. */
export function makeDemo(rt) {
  const me = { m: 0, v: +new URLSearchParams(location.search).get('speed') || 22 }; // m/s; ?speed=80 to test fast
  const bots = [
    { id: 'bot1', name: 'Aarav K', avatar: 'm2', color: '#4ADE80', role: 'rider', m: 700, v: 21, bat: 82, drain: 0.01 },
    { id: 'bot2', name: 'Vikram P', avatar: 'm3', color: '#38BDF8', role: 'rider', m: 0, v: 18, bat: 31, drain: 0.12 },
    { id: 'bot3', name: 'Riya S', avatar: 'w1', color: '#F472B6', role: 'tail', m: 350, v: 20, bat: 64, drain: 0.02 },
  ];
  return {
    tick(dt) {
      me.m = Math.min(rt.total, me.m + me.v * dt);
      bots.forEach((b) => { b.m = Math.min(rt.total, b.m + b.v * dt); b.bat = Math.max(1, b.bat - b.drain * dt); });
      const [lat, lng] = pointAt(rt, me.m);
      return {
        me: { lat, lng, spd: me.v, bat: 77, chg: false },
        bots: bots.map((b) => { const [la, ln] = pointAt(rt, b.m); return { id: b.id, name: b.name, color: b.color, role: b.role, avatar: b.avatar, sr: true, bike: 'Demo', online: true, age: 500, ready: true, pos: { lat: la, lng: ln }, bat: Math.round(b.bat), chg: false, spd: b.v * 3.6, km: b.m / 1000, bot: true }; }),
      };
    },
  };
}

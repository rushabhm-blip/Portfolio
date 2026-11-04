// Shared helpers: icons, geo math, free map APIs (OSRM routing, Nominatim search, Overpass nearby).

const I = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  plus: 'M12 5v14M5 12h14',
  users: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  fuel: 'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M14 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V9l-3-3M6 8h6',
  coffee: 'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M7 2v3M11 2v3M15 2v3',
  alert: 'M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  sos: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v6M12 16.5h.01',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v4',
  battery: 'M3 8h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM21 11v2',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  pin: 'M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  nav: 'M3 11l19-9-9 19-2-8z',
  share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13',
  copy: 'M9 9h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  back: 'M15 18l-6-6 6-6',
  flag: 'M4 22V4M4 4h12l-2 4 2 4H4',
  wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z',
  gauge: 'M12 14l4-4M3.3 17a10 10 0 1 1 17.4 0',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  target: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3',
  layers: 'M12 2l10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5',
  volume: 'M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14',
  volumex: 'M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6',
  chev: 'M9 6l6 6-6 6',
  med: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6',
  route: 'M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 17h6a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h4',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  hand: 'M18 11V6a2 2 0 0 0-4 0v1M14 7V4a2 2 0 0 0-4 0v6M10 10V6a2 2 0 0 0-4 0v8c0 4 3 7 7 7h1a6 6 0 0 0 6-6v-3a2 2 0 0 0-4 0',
  signal2: 'M4.9 19.1a10 10 0 0 1 0-14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M19.1 4.9a10 10 0 0 1 0 14.2M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  life: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.9 4.9l4.3 4.3M14.8 14.8l4.3 4.3M14.8 9.2l4.3-4.3M4.9 19.1l4.3-4.3',
  keyboard: 'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10',
};
export const ic = (n, s = 20) =>
  `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${I[n] || ''}"/></svg>`;

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const initials = (n) => String(n || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
/** Rilo wordmark: "ril" + bike (fork, handlebar, wheel) as the "o". Dark-background version: white ink, lime dot. */
export const logo = (h = 30, ink = '#fff', dot = '#DFFF00') => `<svg height="${h}" viewBox="166 250 380 240" fill="none" role="img" aria-label="Rilo"><g stroke="${ink}" stroke-linecap="round" stroke-linejoin="round"><path d="M193 462V408Q193 358 250 358" stroke-width="30"/><path d="M298 366V462" stroke-width="30"/><path d="M352 462C352 392 366 322 388 284Q396 270 414 269L452 267" stroke-width="28"/><path d="M396 288L459 404" stroke-width="14"/><circle cx="461" cy="410" r="59" stroke-width="22"/></g><circle cx="299" cy="308" r="19" fill="${dot}"/></svg>`;

// ---- geo ----
const rad = (x) => (x * Math.PI) / 180;
export function hav(a, b) {
  const R = 6371000, dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
export function buildRoute(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + hav(pts[i - 1], pts[i]));
  return { pts, cum, total: cum[cum.length - 1] || 0 };
}
/** Project point p=[lat,lng] onto route; returns metres travelled along route + off-route distance. */
export function progress(rt, p) {
  if (!rt || rt.pts.length < 2) return null;
  const kx = Math.cos(rad(p[0])) * 111320, ky = 110540;
  let best = Infinity, bm = 0;
  for (let i = 0; i < rt.pts.length - 1; i++) {
    const a = rt.pts[i], b = rt.pts[i + 1];
    const ax = (a[1] - p[1]) * kx, ay = (a[0] - p[0]) * ky, bx = (b[1] - p[1]) * kx, by = (b[0] - p[0]) * ky;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 ? -(ax * dx + ay * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx, cy = ay + t * dy, d = cx * cx + cy * cy;
    if (d < best) { best = d; bm = rt.cum[i] + t * (rt.cum[i + 1] - rt.cum[i]); }
  }
  return { m: bm, off: Math.sqrt(best) };
}
export function pointAt(rt, m) {
  m = Math.max(0, Math.min(rt.total, m));
  let lo = 0, hi = rt.cum.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; rt.cum[mid] <= m ? (lo = mid) : (hi = mid); }
  const seg = rt.cum[hi] - rt.cum[lo] || 1, t = (m - rt.cum[lo]) / seg;
  const a = rt.pts[lo], b = rt.pts[hi];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
export const fmtKm = (m) => (m < 950 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`);
export const fmtDur = (s) => { const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h ? `${h}h ${m}m` : `${m} min`; };
export const mapsLink = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=two-wheeler`;

// ---- map APIs (free, keyless) ----
export async function geocode(q, near) {
  const u = new URL('https://nominatim.openstreetmap.org/search');
  u.search = new URLSearchParams({ format: 'jsonv2', q, limit: '6', addressdetails: '0', ...(near ? { viewbox: `${near.lng - 3},${near.lat + 3},${near.lng + 3},${near.lat - 3}` } : {}) });
  const r = await fetch(u);
  if (!r.ok) throw new Error('Search failed');
  return (await r.json()).map((x) => ({ name: x.name || x.display_name.split(',')[0], sub: x.display_name, lat: +x.lat, lng: +x.lon }));
}
export async function reverse(lat, lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14`);
    const j = await r.json();
    return j.name || j.display_name?.split(',')[0] || 'My location';
  } catch { return 'My location'; }
}
/** Douglas-Peucker: drops points that lie within tolM metres of a straight line, so corners survive. */
function simplify(pts, tolM) {
  const n = pts.length;
  if (n < 3) return pts;
  const kx = Math.cos(rad(pts[0][0])) * 111320, ky = 110540, keep = new Uint8Array(n);
  keep[0] = keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const ax = pts[a][1] * kx, ay = pts[a][0] * ky, dx = pts[b][1] * kx - ax, dy = pts[b][0] * ky - ay, l2 = dx * dx + dy * dy;
    let max = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const px = pts[i][1] * kx - ax, py = pts[i][0] * ky - ay;
      const t = l2 ? Math.max(0, Math.min(1, (px * dx + py * dy) / l2)) : 0;
      const ex = px - t * dx, ey = py - t * dy, d = ex * ex + ey * ey;
      if (d > max) { max = d; idx = i; }
    }
    if (idx > 0 && max > tolM * tolM) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
/** Road route through the given [{lat,lng}] points, with turn-by-turn steps. Free OSRM demo server. */
export async function route(points) {
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`);
  const j = await r.json();
  if (j.code !== 'Ok' || !j.routes?.length) throw new Error('No route found between these places');
  const rt = j.routes[0];
  let pts = rt.geometry.coordinates.map(([x, y]) => [y, x]);
  for (let tol = 4; pts.length > 2500; tol *= 1.6) pts = simplify(pts, tol);
  const steps = [];
  for (const leg of rt.legs) for (const s of leg.steps) {
    const m = s.maneuver;
    steps.push({ t: m.type, m: m.modifier || '', n: (s.name || '').slice(0, 60), r: (s.ref || '').slice(0, 14), d: Math.round(s.distance), loc: [m.location[1], m.location[0]], x: m.exit || 0 });
  }
  return { pts, dist: rt.distance, dur: rt.duration, steps };
}
const NEARBY = {
  fuel: { label: 'Fuel pumps', q: 'node["amenity"="fuel"]' },
  food: { label: 'Food & chai', q: 'node["amenity"~"^(restaurant|cafe|fast_food)$"]' },
  repair: { label: 'Bike repair', q: 'node["shop"~"^(motorcycle|motorcycle_repair|car_repair)$"]' },
  hospital: { label: 'Hospitals', q: 'node["amenity"~"^(hospital|clinic)$"]' },
};
export const nearbyLabel = (k) => NEARBY[k]?.label || k;
export async function nearby(kind, lat, lng, radius = 6000) {
  const q = `[out:json][timeout:12];(${NEARBY[kind].q}(around:${radius},${lat},${lng}););out 25;`;
  // Public Overpass servers are often slow or busy: ask several at once, use whoever answers first.
  const hosts = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 14000);
  const fromOverpass = hosts.map(async (h) => {
    const r = await fetch(h, { method: 'POST', body: 'data=' + encodeURIComponent(q), signal: ctl.signal });
    if (!r.ok) throw new Error('bad status');
    const j = await r.json();
    return j.elements.map((e) => ({ name: e.tags?.name || e.tags?.brand || nearbyLabel(kind).replace(/s$/, ''), lat: e.lat, lng: e.lon }));
  });
  // Nominatim is usually quicker when Overpass is overloaded.
  const term = { fuel: 'fuel station', food: 'restaurant', repair: 'motorcycle repair', hospital: 'hospital' }[kind];
  const dLat = radius / 111000, dLng = radius / (111000 * Math.cos((lat * Math.PI) / 180));
  const fromNominatim = (async () => {
    const u = new URL('https://nominatim.openstreetmap.org/search');
    u.search = new URLSearchParams({ format: 'jsonv2', q: term, limit: '15', bounded: '1', viewbox: `${lng - dLng},${lat + dLat},${lng + dLng},${lat - dLat}` });
    const r = await fetch(u, { signal: ctl.signal });
    if (!r.ok) throw new Error('bad status');
    const list = (await r.json()).map((x) => ({ name: x.name || nearbyLabel(kind).replace(/s$/, ''), lat: +x.lat, lng: +x.lon }));
    if (!list.length) throw new Error('empty');
    return list;
  })();
  let found;
  try { found = await Promise.any([...fromOverpass, fromNominatim]); ctl.abort(); }
  catch { throw new Error('Nearby search is slow right now. Try again in a moment.'); }
  finally { clearTimeout(timer); }
  return found.map((e) => ({ ...e, d: hav([lat, lng], [e.lat, e.lng]) })).sort((a, b) => a.d - b.d).slice(0, 6);
}

export const debounce = (f, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };


// ---- rider portraits: 8 illustrated avatars in public/avatars (m = man, w = woman) ----
export const AVATARS = ['m1', 'm2', 'm3', 'm4', 'w1', 'w2', 'w3', 'm5'];
export const avatarFor = (id) => AVATARS[[...String(id || '')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % AVATARS.length];
/** The portrait for an avatar id, as an <img>. Empty if the id is unknown. */
export const face = (av) => (AVATARS.includes(av) ? `<img class="face" src="avatars/${av}.webp" alt="" draggable="false" decoding="async">` : '');
/** Avatar content for a rider: their face if they chose one, otherwise initials. */
export const avatarHTML = (x) => face(x?.avatar) || esc(initials(x?.name));
/** 4 x 2 grid of faces to choose from; data-act="pickavatar" is handled in main.js. */
export const avatarPicker = (sel) => `<div class="avpick">${AVATARS.map((a) => `<button type="button" class="${a === sel ? 'on' : ''}" data-act="pickavatar" data-a="${a}" aria-label="Avatar ${a}">${face(a)}</button>`).join('')}</div>`;

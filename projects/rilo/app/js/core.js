// App-wide state (persisted locally), UI helpers, and map helpers.
import { speak } from './voice.js';

const KEY = 'rilo.v1';
const DEF = {
  user: null,
  bike: { name: 'My bike', odo: 0, tank: 12, serviceEvery: 3000, lastService: 0 },
  fuel: [], rides: [], active: null, pending: null, share: {}, // share[code] === false: you joined that ride to view the map only
  prefs: { speak: true, guide: true, hands: false, demo: false },
};
let stored = {};
try { stored = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}
export const DB = { ...DEF, ...stored, prefs: { ...DEF.prefs, ...stored.prefs }, bike: { ...DEF.bike, ...stored.bike } };
if (/[?&]demo=1/.test(location.search)) DB.prefs.demo = true;
export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch {} };

export const hooks = {}; // filled by main.js to avoid circular imports (render, openVoice, ...)
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const money = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
export const localISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
export const fmtWhen = (w) => {
  const d = new Date(w);
  return isNaN(d) ? 'Anytime' : d.toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

/** Remove an element after a short exit animation (class 'out' by default). */
export function fadeOut(el, cls = 'out', ms = 220) {
  if (!el || el._leaving) return;
  el._leaving = true; el.classList.add(cls);
  setTimeout(() => el.remove(), ms);
}
export function go(h) { if (location.hash === h) hooks.render?.(); else location.hash = h; }

export function toast(msg, err = false, ms = 3200) {
  const el = document.createElement('div');
  el.className = 'toast' + (err ? ' err' : '');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => fadeOut(el), ms);
}
/** Show a message and (optionally) speak it back to the rider. */
export function say(msg, { err = false, talk = true } = {}) {
  toast(msg, err);
  if (talk) speak(msg, DB.prefs.speak);
}

const modals = new Set();
export function modal(html, { center = false, onClose } = {}) {
  const el = document.createElement('div');
  el.className = 'modal' + (center ? ' center' : '');
  el.innerHTML = `<div class="box">${html}</div>`;
  const close = () => { if (!modals.has(close)) return; modals.delete(close); fadeOut(el, 'closing', 210); onClose?.(); };
  el.addEventListener('click', (e) => { if (e.target === el) close(); });
  $('#overlay').appendChild(el);
  modals.add(close);
  return { el, close, q: (s) => $(s, el) };
}
export const closeModals = () => [...modals].forEach((close) => close());

// ---- maps ----
// MapLibre GL + free OpenFreeMap vector tiles, themed in mapstyle.js. No API key or billing.
// All coordinates in this app are [lat, lng]; MapLibre wants [lng, lat], converted here.
import { loadTheme } from './mapstyle.js';

/** Create a map (async: waits for the themed style). Resolves to null if it can't load. */
export async function mkMap(el, { center = [20.5, 78.9], zoom = 4, interactive = true } = {}) {
  let style;
  try { style = await loadTheme(); } catch { toast('Map could not load. Check your connection.', true, 5000); return null; }
  const node = typeof el === 'string' ? document.getElementById(el) : el;
  if (!node) return null; // screen was left while the style was loading
  const map = new maplibregl.Map({ container: node, style, center: [center[1], center[0]], zoom, attributionControl: false, interactive, dragRotate: false, pitchWithRotate: false, fadeDuration: 0 });
  if (interactive) map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
  setTimeout(() => node.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show'), 50);
  return map;
}
export const whenReady = (map, fn) => (map.isStyleLoaded() ? fn() : map.once('load', fn));

/** HTML marker. Position is [lat, lng]. Returns the MapLibre marker plus setHtml(). */
export function mkMarker(map, [lat, lng], html, { w = 40, h = 40, anchor = 'center', offset, title = '', z } = {}) {
  const el = document.createElement('div');
  el.style.cssText = `width:${w}px;height:${h}px`;
  el.innerHTML = html;
  if (title) el.title = title;
  if (z) el.style.zIndex = z;
  const m = new maplibregl.Marker({ element: el, anchor, offset }).setLngLat([lng, lat]).addTo(map);
  m.setHtml = (s) => { el.innerHTML = s; };
  return m;
}

let routeN = 0;
export function drawRoute(map, pts, { start, dest, stops = [], color = '#DFFF00', dash = false } = {}) {
  const id = 'route' + ++routeN, markers = [];
  const h = { dead: false, remove() { h.dead = true; markers.forEach((m) => m.remove()); if (map.getLayer(id + 'l')) { map.removeLayer(id + 'l'); map.removeLayer(id + 'c'); map.removeSource(id); } } };
  whenReady(map, () => {
    if (h.dead) return;
    map.addSource(id, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: pts.map(([a, b]) => [b, a]) } } });
    const before = map.getStyle().layers.find((l) => l.type === 'symbol')?.id; // keep road names above the route
    const w = (a, b, c) => ['interpolate', ['linear'], ['zoom'], 8, a, 14, b, 18, c];
    map.addLayer({ id: id + 'c', type: 'line', source: id, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#000', 'line-opacity': dash ? 0 : 0.6, 'line-width': w(6, 11, 18) } }, before);
    map.addLayer({ id: id + 'l', type: 'line', source: id, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': w(3, 6, 10), ...(dash ? { 'line-dasharray': [1.5, 1.5] } : {}) } }, before);
  });
  if (start) markers.push(mkMarker(map, [start.lat, start.lng], '<div class="startpin"></div>', { w: 16, h: 16, title: start.name }));
  stops.forEach((s, i) => markers.push(mkMarker(map, [s.lat, s.lng], `<div class="stoppin">${i + 1}</div>`, { w: 22, h: 22, title: s.name })));
  if (dest) markers.push(mkMarker(map, [dest.lat, dest.lng], '<div class="flagpin"><i></i></div>', { w: 26, h: 26, anchor: 'bottom-left', offset: [-4, 0], title: dest.name }));
  return h;
}
export function fit(map, pts, pad = 40) {
  if (!pts?.length) return;
  let a = 90, b = 180, c = -90, d = -180;
  for (const [la, ln] of pts) { a = Math.min(a, la); c = Math.max(c, la); b = Math.min(b, ln); d = Math.max(d, ln); }
  map.fitBounds([[b, a], [d, c]], { padding: pad, animate: false, maxZoom: 16 });
}

/** Decorative route thumbnail for cards. */
export function miniRoute(seed = 1) {
  const a = (seed * 37) % 30;
  return `<svg viewBox="0 0 300 110" preserveAspectRatio="xMidYMid slice"><g stroke="#232323" stroke-width="1.5" fill="none"><path d="M-10 ${30 + a} C60 10 120 70 190 40 S280 20 320 50"/><path d="M0 90 C70 70 120 100 200 80 S270 90 310 70"/><path d="M60 -5 C80 40 70 70 100 120"/><path d="M200 -5 C190 30 230 60 220 120"/></g><path d="M12 92 C60 ${86 - a} 90 60 140 ${58 + a / 2} S230 ${24 + a} 288 18" stroke="#DFFF00" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="12" cy="92" r="6" fill="#0a0a0a" stroke="#DFFF00" stroke-width="3"/><circle cx="288" cy="18" r="6" fill="#DFFF00"/></svg>`;
}

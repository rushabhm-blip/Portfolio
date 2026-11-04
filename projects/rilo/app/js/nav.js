// Turn-by-turn helpers: turn wording, arrow icons, spoken distances.
import { ic } from './lib.js';

// Router step types worth showing. Anything else ("new name", "continue", "exit roundabout"...) is noise on a bike.
const KEEP = new Set(['depart', 'turn', 'end of road', 'fork', 'merge', 'on ramp', 'off ramp', 'roundabout', 'rotary', 'roundabout turn', 'arrive']);
const ROT = { left: -90, right: 90, 'slight left': -45, 'slight right': 45, 'sharp left': -135, 'sharp right': 135, straight: 0, uturn: 180 };
const dir = (m) => (m.includes('left') ? 'left' : m.includes('right') ? 'right' : '');

function words(o) {
  const road = o.n || o.r, onto = road ? ` onto ${road}` : '', m = o.m;
  switch (o.t) {
    case 'depart': return road ? `Head out on ${road}` : 'Start riding';
    case 'arrive': return o.final ? `Arrive at ${o.place}` : `Stop reached: ${o.place}`;
    case 'turn': case 'end of road':
      if (m === 'uturn') return `Make a U-turn${onto}`;
      if (m === 'straight' || !m) return `Continue straight${onto}`;
      if (m.startsWith('slight')) return `Bear ${dir(m)}${onto}`;
      if (m.startsWith('sharp')) return `Take a sharp ${dir(m)}${onto}`;
      return `Turn ${m}${onto}`;
    case 'fork': return `Keep ${dir(m) || 'straight'} at the fork${onto}`;
    case 'merge': return `Merge${dir(m) ? ' ' + dir(m) : ''}${onto}`;
    case 'on ramp': return `Take the ramp${dir(m) ? ' on the ' + dir(m) : ''}${onto}`;
    case 'off ramp': return `Take the exit${dir(m) ? ' on the ' + dir(m) : ''}${road ? ` toward ${road}` : ''}`;
    default: return o.x ? `At the roundabout take exit ${o.x}${onto}` : `Enter the roundabout${onto}`;
  }
}

/** Filter the router's raw steps and add readable text. Stop names come from the planned stops. */
export function prepare(raw, stops, dest) {
  const out = []; let arrives = 0;
  for (const s of raw || []) {
    if (!KEEP.has(s.t)) continue;
    if (s.t === 'turn' && s.m === 'straight') continue; // "continue straight" is noise on a bike
    const o = { ...s };
    if (s.t === 'arrive') {
      o.final = arrives >= stops.length;
      o.place = o.final ? dest.name : stops[arrives].name;
      o.stopId = o.final ? null : stops[arrives].id;
      arrives++;
    }
    o.text = words(o);
    out.push(o);
  }
  return out;
}

export function navIcon(s, size = 48) {
  if (s.t === 'arrive') return ic('flag', size);
  if (s.t === 'roundabout' || s.t === 'rotary' || s.t === 'roundabout turn') {
    const r = ROT[s.m] ?? 0;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="4.5"/><path d="M12 22.5v-4"/><g transform="rotate(${r} 12 7)"><path d="M12 1.5v8M8.5 5l3.5-3.5L15.5 5"/></g></svg>`;
  }
  if (s.m === 'uturn') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21V10a4 4 0 0 1 8 0v4"/><path d="M12 11l4 4 4-4"/></svg>`;
  const rot = ROT[s.m] ?? 0;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" style="transform:rotate(${rot}deg)"><path d="M12 2.5l8 10h-5.2V21.5H9.2V12.5H4z"/></svg>`;
}

export function sayDist(d) {
  if (d >= 950) { const k = Math.round(d / 100) / 10; return `${k} kilometre${k === 1 ? '' : 's'}`; }
  const r = d >= 200 ? Math.round(d / 50) * 50 : Math.max(10, Math.round(d / 10) * 10);
  return `${r} metres`;
}
export const lower = (t) => t.charAt(0).toLowerCase() + t.slice(1);

export function bearing(a, b) {
  const r = Math.PI / 180, dl = (b[1] - a[1]) * r;
  const y = Math.sin(dl) * Math.cos(b[0] * r);
  const x = Math.cos(a[0] * r) * Math.sin(b[0] * r) - Math.sin(a[0] * r) * Math.cos(b[0] * r) * Math.cos(dl);
  return (Math.atan2(y, x) / r + 360) % 360;
}

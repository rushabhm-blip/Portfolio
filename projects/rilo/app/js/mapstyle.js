// Rilo map theme: takes OpenFreeMap's free "positron" vector style and recolors it
// to the app's near-black / lime look. Change the palette below to restyle the whole map.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

const C = {
  bg: '#0A0A0A', land: '#0F0F0F', park: '#10150F', wood: '#0E130E', water: '#0A1118', building: '#171717', buildingLine: '#1F1F1F',
  roadMinor: '#272727', roadMajor: '#3A3A3A', motorway: '#4A4A44', path: '#1E1E1E', casing: '#060606', rail: '#2A2A2A', boundary: '#333333',
  label: '#8C8C8C', labelBig: '#C4C4C4', labelWater: '#4E5E6E', halo: '#0A0A0A',
};

function recolor(style) {
  for (const l of style.layers) {
    l.paint = l.paint || {};
    const id = l.id;
    if (l.type === 'background') l.paint['background-color'] = C.bg;
    else if (l.type === 'fill') {
      let c = C.land;
      if (/water/.test(id)) c = C.water;
      else if (/park/.test(id)) c = C.park;
      else if (/wood|grass/.test(id)) c = C.wood;
      else if (/building/.test(id)) { c = C.building; l.paint['fill-outline-color'] = C.buildingLine; }
      l.paint['fill-color'] = c;
      delete l.paint['fill-pattern'];
    } else if (l.type === 'line') {
      let c = C.roadMinor;
      if (/casing/.test(id)) c = C.casing;
      else if (/waterway/.test(id)) c = C.water;
      else if (/railway/.test(id)) c = C.rail;
      else if (/boundary/.test(id)) c = C.boundary;
      else if (/motorway/.test(id)) c = C.motorway;
      else if (/major/.test(id)) c = C.roadMajor;
      else if (/path|pier/.test(id)) c = C.path;
      else if (/aeroway/.test(id)) c = C.path;
      l.paint['line-color'] = c;
    } else if (l.type === 'symbol') {
      if (/shield/.test(id)) { l.layout = { ...l.layout, visibility: 'none' }; continue; }
      l.paint['text-color'] = /water/.test(id) ? C.labelWater : /city|state|country/.test(id) ? C.labelBig : C.label;
      l.paint['text-halo-color'] = C.halo;
      l.paint['text-halo-width'] = 1.6;
    }
  }
  return style;
}

let cache;
/** Fetch + theme the style once; every map in the app shares it. */
export function loadTheme() {
  cache = cache || fetch(STYLE_URL).then((r) => { if (!r.ok) throw new Error('map style unavailable'); return r.json(); }).then(recolor).catch((e) => { cache = null; throw e; });
  return cache;
}

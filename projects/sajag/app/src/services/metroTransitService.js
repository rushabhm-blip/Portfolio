import bengaluruData from '../data/bengaluru_metro.json';
import delhiData from '../data/delhi_metro.json';

const NETWORKS = {
  bengaluru: bengaluruData,
  delhi: delhiData
};

// Haversine distance in km
export function calculateDistanceKm(c1, c2) {
  if (!c1 || !c2) return 0;
  const [lat1, lon1] = c1;
  const [lat2, lon2] = c2;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Detect whether coordinates belong to Bengaluru, Delhi, or elsewhere
export function detectCity(coords) {
  if (!coords) return 'bengaluru';
  const [lat, lon] = coords;
  // Bengaluru bounds
  if (lat >= 12.75 && lat <= 13.35 && lon >= 77.30 && lon <= 77.85) {
    return 'bengaluru';
  }
  // Delhi NCR bounds
  if (lat >= 28.20 && lat <= 28.95 && lon >= 76.80 && lon <= 77.65) {
    return 'delhi';
  }
  return 'bengaluru'; // default fallback
}

// Get the full network data for a city
export function getMetroNetwork(city = 'bengaluru') {
  return NETWORKS[city] || NETWORKS.bengaluru;
}

// Find closest operational metro station to any coordinate
export function findNearestStation(coords, city = 'bengaluru') {
  if (!coords) return null;
  const network = getMetroNetwork(city);
  let best = null;
  let minD = Infinity;

  for (const stn of network.stations) {
    const d = calculateDistanceKm(coords, stn.coords);
    if (d < minD) {
      minD = d;
      best = stn;
    }
  }

  return {
    station: best,
    distanceKm: minD
  };
}

// Universal Station Line Identification
function getStationLineList(stn, network) {
  if (!stn) return [];
  const linesFound = [];

  network.lines.forEach(line => {
    let matches = false;

    // Check stn.line against line.id or line.name
    if (stn.line && stn.line !== 'interchange') {
      if (
        line.id === stn.line || 
        line.name?.toLowerCase().includes(stn.line.toLowerCase()) ||
        stn.line.toLowerCase().includes(line.id.toLowerCase())
      ) {
        matches = true;
      }
    }

    // Check stn.lines array
    if (Array.isArray(stn.lines)) {
      if (stn.lines.some(lName => 
        line.name?.toLowerCase().includes(lName.toLowerCase()) ||
        lName.toLowerCase().includes(line.id.toLowerCase()) ||
        line.id.toLowerCase().includes(lName.toLowerCase().replace(' line', ''))
      )) {
        matches = true;
      }
    }

    // Check spatial proximity to line track/segments (< 500 meters)
    if (!matches) {
      const segs = line.segments || (line.track ? [line.track] : []);
      for (const seg of segs) {
        for (const pt of seg) {
          if (Math.hypot(pt[0] - stn.coords[0], pt[1] - stn.coords[1]) < 0.004) {
            matches = true;
            break;
          }
        }
        if (matches) break;
      }
    }

    if (matches) linesFound.push(line);
  });

  return linesFound.length > 0 ? linesFound : [network.lines[0]];
}

// Project station onto a line track
function projectStationOnLineTrack(lineObj, stnCoords, preferredTrackIdx = null) {
  const segs = lineObj.segments || (lineObj.track ? [lineObj.track] : []);
  let bestSeg = segs[0] || [];
  let bestIdx = 0;
  let minDistance = Infinity;

  if (preferredTrackIdx !== null && segs.length === 1 && preferredTrackIdx < segs[0].length) {
    const pt = segs[0][preferredTrackIdx];
    if (Math.hypot(pt[0] - stnCoords[0], pt[1] - stnCoords[1]) < 0.005) {
      return { seg: segs[0], idx: preferredTrackIdx, dist: 0 };
    }
  }

  for (const seg of segs) {
    for (let i = 0; i < seg.length; i++) {
      const d = Math.hypot(seg[i][0] - stnCoords[0], seg[i][1] - stnCoords[1]);
      if (d < minDistance) {
        minDistance = d;
        bestSeg = seg;
        bestIdx = i;
      }
    }
  }

  return { seg: bestSeg, idx: bestIdx, dist: minDistance };
}

// Slices track points along a line between two coordinates
function sliceTrackBetweenPoints(lineObj, coordA, coordB, idxA = null, idxB = null) {
  const projA = projectStationOnLineTrack(lineObj, coordA, idxA);
  const projB = projectStationOnLineTrack(lineObj, coordB, idxB);

  if (projA.seg === projB.seg && projA.seg.length > 0) {
    const iA = projA.idx;
    const iB = projB.idx;
    if (iA === iB) {
      const nextIdx = Math.min(projA.seg.length - 1, iA + 1);
      return [projA.seg[iA], projA.seg[nextIdx]];
    }
    return iA <= iB ? projA.seg.slice(iA, iB + 1) : projA.seg.slice(iB, iA + 1).reverse();
  }

  // Multi-branch line (connect through junction)
  const junction = (lineObj.segments?.[1] && lineObj.segments?.[1][0]) || projA.seg[projA.seg.length - 1];
  const leg1 = sliceTrackBetweenPoints(lineObj, coordA, junction);
  const leg2 = sliceTrackBetweenPoints(lineObj, junction, coordB);
  return [...leg1, ...leg2.slice(1)];
}

// Extract continuous track geometry segments between two stations along real railway tracks
function getMetroSegments(stnA, stnB, network) {
  if (!stnA || !stnB) return [];

  const linesA = getStationLineList(stnA, network);
  const linesB = getStationLineList(stnB, network);

  // 1. Direct Same-Line Commute:
  const sharedLines = linesA.filter(la => linesB.some(lb => lb.id === la.id));
  if (sharedLines.length > 0) {
    const lineObj = sharedLines[0];
    const coords = sliceTrackBetweenPoints(
      lineObj, 
      stnA.coords, 
      stnB.coords,
      stnA.line === lineObj.id ? stnA.trackIdx : null,
      stnB.line === lineObj.id ? stnB.trackIdx : null
    );

    const displayName = lineObj.name?.split('(')[0]?.trim() || 'Metro Rail';
    return [
      {
        mode: 'metro',
        color: lineObj.color || '#16A34A',
        lineName: displayName,
        coords
      }
    ];
  }

  // 2. Transfer / Interchange Commute across two lines:
  const lineA = linesA[0] || network.lines[0];
  const lineB = linesB[0] || network.lines[1] || network.lines[0];

  let interchange = (network.interchanges || []).find(ic => {
    const icLines = getStationLineList(ic, network);
    return icLines.some(l => l.id === lineA.id) && icLines.some(l => l.id === lineB.id);
  });

  if (!interchange) {
    interchange = (network.interchanges && network.interchanges[0]) || {
      name: network.cityName?.includes('Bengaluru') ? 'Nadaprabhu Kempegowda Majestic' : 'Rajiv Chowk',
      coords: network.cityName?.includes('Bengaluru') ? [12.9757, 77.5729] : [28.63282, 77.21826]
    };
  }

  const leg1Coords = sliceTrackBetweenPoints(lineA, stnA.coords, interchange.coords);
  const leg2Coords = sliceTrackBetweenPoints(lineB, interchange.coords, stnB.coords);

  const nameA = lineA.name?.split('(')[0]?.trim() || 'Line 1';
  const nameB = lineB.name?.split('(')[0]?.trim() || 'Line 2';

  return [
    {
      mode: 'metro',
      color: lineA.color,
      lineName: nameA,
      coords: leg1Coords
    },
    {
      mode: 'metro',
      color: lineB.color,
      lineName: nameB,
      coords: leg2Coords
    }
  ];
}

// Comprehensive multi-modal route planner with ground truth metro network
export function planSmartTransitRoute(originCoords, destCoords, originName = 'Origin', destName = 'Destination') {
  if (!originCoords || !destCoords) return [];

  const totalDist = calculateDistanceKm(originCoords, destCoords);
  const city = detectCity(originCoords) || detectCity(destCoords) || 'bengaluru';
  const network = getMetroNetwork(city);

  // =========================================================================
  // 1. INTERCITY / LONG-DISTANCE ROUTE (> 65 KM)
  // FIX: Never fabricate a 500km urban metro line across intercity highways!
  // =========================================================================
  if (totalDist > 65) {
    const expressTrainTime = Math.round(totalDist * 0.9 + 30);
    const busHighwayTime = Math.round(totalDist * 1.5 + 40);

    const trainFare = Math.round(180 + totalDist * 1.4);
    const busFare = Math.round(150 + totalDist * 1.8);
    const cabFare = Math.round(totalDist * 14);

    return [
      {
        id: 'intercity-rail',
        title: 'Intercity Superfast Rail + Metro',
        isIntercity: true,
        badge: 'Recommended',
        badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        eco: true,
        duration: `${Math.floor(expressTrainTime / 60)}h ${expressTrainTime % 60}m`,
        distance: `${totalDist} km`,
        fareNum: trainFare,
        fare: `₹${trainFare}`,
        notice: `Distance is ${totalDist} km. Rapid urban metro operates only inside metropolitan city networks. Superfast rail connects between cities.`,
        modes: [
          { type: 'metro', label: 'Local City Metro', color: 'text-purple-600' },
          { type: 'train', label: 'Intercity Express Train', color: 'text-indigo-600' },
          { type: 'bus', label: 'Destination Feeder', color: 'text-emerald-600' }
        ],
        occupancy: { level: 'Reserved', bars: 2, max: 3, color: 'bg-emerald-500' },
        mapSegments: [
          { mode: 'intercity', color: '#4338CA', coords: [originCoords, destCoords] }
        ],
        waypoints: [
          { name: `Origin Station (${originName.split(',')[0]})`, coord: originCoords, type: 'metro', color: '#4338CA', details: 'Board local connector' },
          { name: `Destination Junction (${destName.split(',')[0]})`, coord: destCoords, type: 'bus', color: '#059669', details: 'Arrival point' }
        ],
        breakdown: {
          segments: [
            { label: 'First Mile', distance: '4 km', percent: 3, color: '#64748B', textColor: '#475569' },
            { label: 'Express Rail', distance: `${totalDist - 8} km`, percent: 94, color: '#4338CA', textColor: '#312E81' },
            { label: 'Last Mile', distance: '4 km', percent: 3, color: '#059669', textColor: '#047857' }
          ]
        },
        steps: [
          { instruction: `Take local metro or feeder cab to Central Railway Terminal`, time: '25 min' },
          { instruction: `Board Intercity Superfast / Vande Bharat Express Rail towards destination region (${totalDist} km)`, time: `${Math.floor(expressTrainTime / 60)}h ${expressTrainTime % 60 - 25}m` },
          { instruction: `Arrive at Destination Terminal and connect to local urban feeder / metro to ${destName}`, time: '15 min' }
        ]
      },
      {
        id: 'intercity-bus',
        title: 'Intercity Highway AC Bus',
        isIntercity: true,
        badge: 'Direct Highway',
        badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
        eco: true,
        duration: `${Math.floor(busHighwayTime / 60)}h ${busHighwayTime % 60}m`,
        distance: `${Math.round(totalDist * 1.08)} km`,
        fareNum: busFare,
        fare: `₹${busFare}`,
        notice: `State transport multi-axle AC coach via National Highway corridor.`,
        modes: [
          { type: 'bus', label: 'Intercity Volvo Multi-Axle', color: 'text-blue-600' }
        ],
        occupancy: { level: 'Moderate', bars: 2, max: 3, color: 'bg-amber-500' },
        mapSegments: [
          { mode: 'intercity', color: '#0284C7', coords: [originCoords, destCoords] }
        ],
        waypoints: [
          { name: 'Intercity Bus Terminal (ISBT)', coord: originCoords, type: 'bus', color: '#0284C7', details: 'Direct Highway Bay' },
          { name: destName, coord: destCoords, type: 'bus', color: '#059669', details: 'Destination Terminal' }
        ],
        breakdown: {
          segments: [
            { label: 'Highway Bus', distance: `${totalDist} km`, percent: 100, color: '#0284C7', textColor: '#0369A1' }
          ]
        },
        steps: [
          { instruction: `Board Intercity Multi-Axle AC Sleeper / Express Bus at main terminal`, time: '10 min' },
          { instruction: `Travel via National Highway Corridor (${Math.round(totalDist * 1.08)} km)`, time: `${Math.floor(busHighwayTime / 60)}h ${busHighwayTime % 60 - 10}m` },
          { instruction: `Alight at ${destName} central drop point`, time: '5 min' }
        ]
      }
    ];
  }

  // =========================================================================
  // 2. INTRACITY METRO-SERVED ROUTE (GROUND TRUTH REAL METRO LINES & STATIONS)
  // =========================================================================
  const nearOrigin = findNearestStation(originCoords, city);
  const nearDest = findNearestStation(destCoords, city);

  const origStn = nearOrigin?.station;
  const destStn = nearDest?.station;
  const dToOriginStn = nearOrigin?.distanceKm || 0;
  const dToDestStn = nearDest?.distanceKm || 0;

  // Universal line identification for origin and destination
  const origLines = getStationLineList(origStn, network);
  const destLines = getStationLineList(destStn, network);
  const sharedLines = origLines.filter(la => destLines.some(lb => lb.id === la.id));
  const sameLine = sharedLines.length > 0;
  const primaryLine = sameLine ? sharedLines[0] : (origLines[0] || network.lines[0]);
  const destLineObj = sameLine ? sharedLines[0] : (destLines[0] || network.lines[1] || network.lines[0]);

  // Real Interchange Station if transfer is needed
  let interchangeStn = (network.interchanges || []).find(ic => {
    const icLines = getStationLineList(ic, network);
    return icLines.some(l => l.id === primaryLine.id) && icLines.some(l => l.id === destLineObj.id);
  });
  if (!interchangeStn) {
    interchangeStn = (network.interchanges && network.interchanges[0]) || {
      name: city === 'bengaluru' ? 'Nadaprabhu Kempegowda Majestic' : 'Rajiv Chowk',
      coords: city === 'bengaluru' ? [12.975697, 77.572967] : [28.6328, 77.2197]
    };
  }

  const metroRideKm = Math.max(1.5, Math.round(
    calculateDistanceKm(origStn.coords, destStn.coords) * 10
  ) / 10);

  // Time calculations
  const firstMileTime = dToOriginStn < 0.8 ? Math.max(3, Math.round(dToOriginStn * 13)) : Math.max(5, Math.round(dToOriginStn * 3.5 + 4));
  const metroRideTime = Math.max(10, Math.round(metroRideKm * 2.1 + (sameLine ? 3 : 8)));
  const lastMileTime = dToDestStn < 0.8 ? Math.max(3, Math.round(dToDestStn * 13)) : Math.max(5, Math.round(dToDestStn * 3.2 + 3));
  const totalMetroTripTime = firstMileTime + metroRideTime + lastMileTime;

  // Fares
  const metroFare = Math.min(60, Math.max(15, Math.round(10 + metroRideKm * 2.2)));
  const firstMileFare = dToOriginStn < 0.8 ? 0 : Math.round(25 + dToOriginStn * 8);
  const lastMileFare = dToDestStn < 0.8 ? 0 : Math.round(15 + dToDestStn * 4);
  const totalComboFare = metroFare + (firstMileFare > 0 ? 15 : 0) + (lastMileFare > 0 ? 15 : 0);

  // Exact continuous track extraction between stations
  const metroSegments = getMetroSegments(origStn, destStn, network);

  const primaryLineName = primaryLine.name?.split('(')[0]?.trim() || 'Metro Rail';
  const destLineName = destLineObj.name?.split('(')[0]?.trim() || 'Metro Rail';

  // Waypoints for the route
  const waypoints = [
    {
      name: `Board at ${origStn.name}`,
      coord: origStn.coords,
      type: 'metro',
      color: primaryLine.color,
      details: `${primaryLineName} • ${dToOriginStn < 0.8 ? 'Walk ' + Math.round(dToOriginStn * 1000) + 'm' : Math.round(dToOriginStn * 10) / 10 + ' km via auto'}`
    }
  ];

  if (!sameLine) {
    waypoints.push({
      name: `Interchange at ${interchangeStn.name}`,
      coord: interchangeStn.coords,
      type: 'transfer',
      color: '#7C3AED',
      details: `Switch from ${primaryLineName} to ${destLineName}`
    });
  }

  waypoints.push({
    name: `Alight at ${destStn.name}`,
    coord: destStn.coords,
    type: 'metro',
    color: destLineObj.color,
    details: `${destLineName} • Exit station • Connect Feeder Bus / Auto to destination`
  });

  // Step by step breakdown instructions
  const steps = [];
  if (dToOriginStn < 0.8) {
    steps.push({
      instruction: `Walk ${Math.round(dToOriginStn * 1000)}m to ${origStn.name} Metro Station (Gate 1)`,
      time: `${firstMileTime} min`
    });
  } else {
    steps.push({
      instruction: `Take Auto / Feeder (${dToOriginStn.toFixed(1)} km) to ${origStn.name} Metro Station`,
      time: `${firstMileTime} min`
    });
  }

  if (sameLine) {
    steps.push({
      instruction: `Board ${primaryLineName} at ${origStn.name}. Direct express commute to ${destStn.name}`,
      time: `${metroRideTime} min`
    });
  } else {
    const halfTime = Math.round(metroRideTime * 0.48);
    steps.push({
      instruction: `Board ${primaryLineName} at ${origStn.name} towards ${interchangeStn.name}`,
      time: `${halfTime} min`
    });
    steps.push({
      instruction: `Interchange at ${interchangeStn.name}: Switch platform to ${destLineName}`,
      time: '4 min'
    });
    steps.push({
      instruction: `Ride ${destLineName} and alight at ${destStn.name}`,
      time: `${metroRideTime - halfTime} min`
    });
  }

  if (dToDestStn < 0.8) {
    steps.push({
      instruction: `Exit ${destStn.name} and walk ${Math.round(dToDestStn * 1000)}m to ${destName}`,
      time: `${lastMileTime} min`
    });
  } else {
    steps.push({
      instruction: `Exit ${destStn.name} Gate 2 ➔ Board Feeder Bus / Auto (${dToDestStn.toFixed(1)} km) direct to ${destName}`,
      time: `${lastMileTime} min`
    });
  }

  const directBusTime = Math.max(22, Math.round(totalDist * 3.4 + 10));
  const directBusFare = Math.max(12, Math.round(10 + totalDist * 1.2));

  const metroAutoTime = Math.max(16, Math.round(firstMileTime + metroRideTime + Math.round(dToDestStn * 2.2 + 2)));
  const metroAutoFare = Math.max(40, Math.round(metroFare + 35 + dToDestStn * 12));

  const metroModes = sameLine ? [
    { type: 'metro', label: primaryLineName, color: primaryLine.color },
    { type: 'bus', label: 'Feeder Bus / Walk', color: 'text-emerald-600' }
  ] : [
    { type: 'metro', label: primaryLineName, color: primaryLine.color },
    { type: 'metro', label: destLineName, color: destLineObj.color },
    { type: 'bus', label: 'Feeder Bus / Walk', color: 'text-emerald-600' }
  ];

  const breakdownSegments = sameLine ? [
    {
      label: dToOriginStn < 0.8 ? 'Walk' : 'Auto',
      distance: `${dToOriginStn.toFixed(1)} km`,
      percent: Math.max(5, Math.round((dToOriginStn / totalDist) * 100)),
      color: '#64748B',
      textColor: '#475569'
    },
    {
      label: primaryLineName,
      distance: `${metroRideKm} km`,
      percent: Math.max(50, Math.min(85, Math.round((metroRideKm / totalDist) * 100))),
      color: primaryLine.color,
      textColor: primaryLine.color
    },
    {
      label: dToDestStn < 0.8 ? 'Walk' : 'Feeder Bus',
      distance: `${dToDestStn.toFixed(1)} km`,
      percent: Math.max(5, Math.round((dToDestStn / totalDist) * 100)),
      color: '#059669',
      textColor: '#047857'
    }
  ] : [
    {
      label: dToOriginStn < 0.8 ? 'Walk' : 'Auto',
      distance: `${dToOriginStn.toFixed(1)} km`,
      percent: Math.max(5, Math.round((dToOriginStn / totalDist) * 100)),
      color: '#64748B',
      textColor: '#475569'
    },
    {
      label: primaryLineName,
      distance: `${(metroRideKm * 0.45).toFixed(1)} km`,
      percent: Math.round((metroRideKm * 0.45 / totalDist) * 100),
      color: primaryLine.color,
      textColor: primaryLine.color
    },
    {
      label: destLineName,
      distance: `${(metroRideKm * 0.55).toFixed(1)} km`,
      percent: Math.round((metroRideKm * 0.55 / totalDist) * 100),
      color: destLineObj.color,
      textColor: destLineObj.color
    },
    {
      label: dToDestStn < 0.8 ? 'Walk' : 'Feeder Bus',
      distance: `${dToDestStn.toFixed(1)} km`,
      percent: Math.max(5, Math.round((dToDestStn / totalDist) * 100)),
      color: '#059669',
      textColor: '#047857'
    }
  ];

  return [
    {
      id: 'metro-bus',
      title: sameLine ? 'Direct Metro + Feeder' : 'Metro Interchange + Feeder',
      badge: 'Fastest & Eco',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      eco: true,
      duration: `${totalMetroTripTime} min`,
      distance: `${totalDist} km`,
      fareNum: totalComboFare,
      fare: `₹${totalComboFare}`,
      modes: metroModes,
      occupancy: { level: 'Moderate', bars: 2, max: 3, color: 'bg-amber-500' },
      mapSegments: [
        { mode: 'walk', color: '#64748B', coords: [originCoords, origStn.coords] },
        ...metroSegments,
        { mode: 'bus', color: '#059669', coords: [destStn.coords, destCoords] }
      ],
      waypoints,
      breakdown: {
        segments: breakdownSegments
      },
      steps
    },
    {
      id: 'direct-bus',
      title: 'Direct Arterial City Bus',
      badge: 'Zero Transfer',
      badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
      eco: true,
      duration: `${directBusTime} min`,
      distance: `${Number((totalDist * 1.1).toFixed(1))} km`,
      fareNum: directBusFare,
      fare: `₹${directBusFare}`,
      modes: [
        { type: 'bus', label: 'BMTC / DTC City Bus', color: 'text-emerald-600' }
      ],
      occupancy: { level: 'High', bars: 3, max: 3, color: 'bg-rose-500' },
      mapSegments: [
        { mode: 'bus', color: '#059669', coords: [originCoords, destCoords] }
      ],
      waypoints: [
        { name: `${originName.split(',')[0]} Bus Bay`, coord: originCoords, type: 'bus', color: '#059669', details: 'Board Direct Route' },
        { name: `${destName.split(',')[0]} Bus Stand`, coord: destCoords, type: 'bus', color: '#059669', details: 'Direct Arrival' }
      ],
      breakdown: {
        segments: [
          { label: 'City Bus', distance: `${totalDist} km`, percent: 100, color: '#059669', textColor: '#047857' }
        ]
      },
      steps: [
        { instruction: `Walk 120m to nearest main arterial bus shelter`, time: '2 min' },
        { instruction: `Board Direct City Bus via ring corridor towards ${destName.split(',')[0]}`, time: `${directBusTime - 4} min` },
        { instruction: `Alight directly at ${destName.split(',')[0]} stop`, time: '2 min' }
      ]
    },
    {
      id: 'metro-auto',
      title: 'Metro + Smart Auto',
      badge: 'Doorstep Drop',
      badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200',
      eco: false,
      duration: `${metroAutoTime} min`,
      distance: `${totalDist} km`,
      fareNum: metroAutoFare,
      fare: `₹${metroAutoFare}`,
      modes: sameLine ? [
        { type: 'metro', label: origStn.lineName, color: origStn.line === 'green' ? 'text-emerald-600' : 'text-purple-600' },
        { type: 'auto', label: 'Prepaid Smart Auto', color: 'text-amber-500' }
      ] : [
        { type: 'metro', label: origStn.lineName, color: origStn.line === 'green' ? 'text-emerald-600' : 'text-purple-600' },
        { type: 'metro', label: destStn.lineName, color: destStn.line === 'green' ? 'text-emerald-600' : 'text-purple-600' },
        { type: 'auto', label: 'Prepaid Smart Auto', color: 'text-amber-500' }
      ],
      occupancy: { level: 'Low', bars: 1, max: 3, color: 'bg-emerald-500' },
      mapSegments: [
        { mode: 'walk', color: '#64748B', coords: [originCoords, origStn.coords] },
        ...metroSegments,
        { mode: 'auto', color: '#D97706', coords: [destStn.coords, destCoords] }
      ],
      waypoints: [
        { name: `${origStn.name} Metro`, coord: origStn.coords, type: 'metro', color: origStn.color || (origStn.line === 'green' ? '#16A34A' : '#9333EA'), details: 'Fast metro ride' },
        ...(sameLine ? [] : [{ name: `Interchange at ${interchangeStn.name}`, coord: interchangeStn.coords, type: 'transfer', color: '#7C3AED', details: `Switch to ${destStn.lineName}` }]),
        { name: `Prepaid Auto at ${destStn.name}`, coord: destStn.coords, type: 'transfer', color: '#D97706', details: 'Last mile doorstep drop' }
      ],
      breakdown: {
        segments: breakdownSegments
      },
      steps: [
        { instruction: `Board ${origStn.lineName} at ${origStn.name}`, time: '3 min' },
        ...(sameLine ? [{ instruction: `Direct metro ride to ${destStn.name}`, time: `${metroRideTime} min` }] : [
          { instruction: `Ride ${origStn.lineName} to ${interchangeStn.name}`, time: `${Math.round(metroRideTime * 0.48)} min` },
          { instruction: `Switch to ${destStn.lineName} and ride to ${destStn.name}`, time: `${Math.round(metroRideTime * 0.52)} min` }
        ]),
        { instruction: `Exit Gate 1 to Prepaid Smart Auto stand ➔ Doorstep drop to ${destName}`, time: `${Math.round(dToDestStn * 2.2 + 2)} min` }
      ]
    }
  ];
}

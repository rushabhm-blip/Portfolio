import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  Maximize2, 
  Minimize2, 
  LocateFixed,
  TrainFront,
  Navigation,
  Layers,
  Info,
  Check
} from 'lucide-react';
import bengaluruMetro from '../../../data/bengaluru_metro.json';
import delhiMetro from '../../../data/delhi_metro.json';

const CITY_DATA = {
  bengaluru: bengaluruMetro,
  delhi: delhiMetro
};

export default function TransitRouteMap({
  origin = "",
  destination = "",
  originCoords = null,
  destinationCoords = null,
  isLiveGPS = false,
  selectedRoute = null,
  allRoutes = [],
  onSelectRoute = () => {},
  onSelectStationAsOrigin = () => {},
  onSelectStationAsDest = () => {},
  activeCity = "bengaluru",
  onCityChange = () => {},
  isFullscreen = false,
  onToggleFullscreen = () => {},
  isRouteFocusView = false,
  className = "w-full h-72"
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const networkLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markerLayerRef = useRef(null);

  const [showNetworkOverlay, setShowNetworkOverlay] = useState(true);
  const [roadGeometries, setRoadGeometries] = useState({});

  // Active city selection: activeCity takes priority, fallback to coord detection
  const currentCity = useMemo(() => {
    if (activeCity) return activeCity;
    if (originCoords) {
      const [lat, lon] = originCoords;
      if (lat >= 28.2 && lat <= 28.95 && lon >= 76.8 && lon <= 77.65) return 'delhi';
      if (lat >= 12.75 && lat <= 13.35 && lon >= 77.3 && lon <= 77.85) return 'bengaluru';
    }
    if (destinationCoords) {
      const [lat, lon] = destinationCoords;
      if (lat >= 28.2 && lat <= 28.95 && lon >= 76.8 && lon <= 77.65) return 'delhi';
      if (lat >= 12.75 && lat <= 13.35 && lon >= 77.3 && lon <= 77.85) return 'bengaluru';
    }
    return 'bengaluru';
  }, [activeCity, originCoords, destinationCoords]);

  const network = CITY_DATA[currentCity] || CITY_DATA.bengaluru;

  /* 1. Fetch Real Road Geometries via OSRM for First-Mile & Last-Mile Road Segments */
  useEffect(() => {
    if (!selectedRoute?.mapSegments) return;

    let isMounted = true;
    const fetchRoads = async () => {
      for (const seg of selectedRoute.mapSegments) {
        // Skip metro tracks (metro uses authentic railway lines!)
        if (seg.mode === 'metro') continue;
        if (!seg.coords || seg.coords.length !== 2) continue;

        const [p1, p2] = seg.coords;
        if (!p1 || !p2) continue;

        const key = `${p1[0].toFixed(4)},${p1[1].toFixed(4)}->${p2[0].toFixed(4)},${p2[1].toFixed(4)}`;
        if (roadGeometries[key]) continue;

        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${p2[1]},${p2[0]};${p1[1]},${p1[0]}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.routes && data.routes[0]?.geometry?.coordinates) {
              const roadPts = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]).reverse();
              if (isMounted) {
                setRoadGeometries(prev => ({ ...prev, [key]: roadPts }));
              }
            }
          }
        } catch {
          // Keep straight line fallback on network issue
        }
      }
    };

    fetchRoads();
    return () => { isMounted = false; };
  }, [selectedRoute]);

  /* 2. Initialize Clean Google Maps Tile Layer */
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const defaultCenter = network.center || [12.9716, 77.5946];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Real Google Maps Streets Tiles
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    const netLayer = L.layerGroup().addTo(map);
    const rLayer = L.layerGroup().addTo(map);
    const mLayer = L.layerGroup().addTo(map);

    networkLayerRef.current = netLayer;
    routeLayerRef.current = rLayer;
    markerLayerRef.current = mLayer;
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size and fit route when entering/exiting fullscreen
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
        if (originCoords && destinationCoords) {
          mapInstanceRef.current?.fitBounds(L.latLngBounds([originCoords, destinationCoords]), { padding: [40, 40] });
        }
      }, 150);
    }
  }, [isFullscreen]);

  /* 3. Render Metro Network Lines and Stations */
  useEffect(() => {
    if (!mapInstanceRef.current || !networkLayerRef.current) return;
    const netLayer = networkLayerRef.current;
    netLayer.clearLayers();

    if (!showNetworkOverlay) return;

    const hasActiveRoute = originCoords && destinationCoords;

    // A. Render continuous metro line tracks
    network.lines.forEach(line => {
      (line.segments || []).forEach(segmentCoords => {
        if (!segmentCoords || segmentCoords.length < 2) return;

        // Glow track
        netLayer.addLayer(L.polyline(segmentCoords, {
          color: '#FFFFFF',
          weight: hasActiveRoute ? 4 : 7,
          opacity: hasActiveRoute ? 0.3 : 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }));

        // Colored Metro Line Track
        const poly = L.polyline(segmentCoords, {
          color: line.color,
          weight: hasActiveRoute ? 2.5 : 5,
          opacity: hasActiveRoute ? 0.35 : 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        });

        poly.bindTooltip(`<b>${line.name}</b>`, {
          sticky: true,
          direction: 'top',
          className: 'metro-line-tooltip'
        });

        netLayer.addLayer(poly);
      });
    });

    // B. Render Metro Stations ONLY when NO route is actively selected (keeps route view clean & uncluttered)
    if (!hasActiveRoute) {
      network.stations.forEach(stn => {
        const isInterchange = stn.isInterchange;
        const size = isInterchange ? 14 : 10;
        const ringColor = isInterchange ? '#7C3AED' : stn.color;

        const stationIcon = L.divIcon({
          className: 'real-station-pin',
          html: `
            <div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:#FFFFFF;border:2.5px solid ${ringColor};box-shadow:0 1.5px 5px rgba(0,0,0,0.35);cursor:pointer;opacity:0.95;transition:transform 0.15s ease;"
                 title="${stn.name} (${stn.lineName})">
              ${isInterchange ? '<div style="position:absolute;inset:1.5px;border-radius:50%;background:#7C3AED;"></div>' : ''}
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });

        const marker = L.marker(stn.coords, { icon: stationIcon, zIndexOffset: isInterchange ? 200 : 50 });

        const popupHtml = document.createElement('div');
        popupHtml.className = 'p-1 text-left font-sans';
        popupHtml.innerHTML = `
          <div style="font-weight:800;font-size:12px;color:#0F172A;line-height:1.2;">${stn.name}</div>
          <div style="display:inline-flex;align-items:center;gap:4px;margin-top:3px;background:${stn.color}15;color:${stn.color};border:1px solid ${stn.color}40;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700;">
            <span>🚇</span>
            <span>${stn.lineName}</span>
          </div>
          <div style="margin-top:8px;display:flex;gap:4px;">
            <button id="set-orig-${stn.id}" style="background:#2563EB;color:#FFF;border:none;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer;flex:1;">
              Start Here
            </button>
            <button id="set-dest-${stn.id}" style="background:#059669;color:#FFF;border:none;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer;flex:1;">
              Go Here
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -6], minWidth: 160 });

        marker.on('popupopen', () => {
          const btnOrig = document.getElementById(`set-orig-${stn.id}`);
          const btnDest = document.getElementById(`set-dest-${stn.id}`);
          if (btnOrig) {
            btnOrig.onclick = () => {
              onSelectStationAsOrigin(stn);
              marker.closePopup();
            };
          }
          if (btnDest) {
            btnDest.onclick = () => {
              onSelectStationAsDest(stn);
              marker.closePopup();
            };
          }
        });

        netLayer.addLayer(marker);
      });

      mapInstanceRef.current.setView(network.center, 12);
    }
  }, [network, showNetworkOverlay, originCoords, destinationCoords]);

  /* 4. Render Active Selected Transit Route Segments & Waypoints */
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current || !markerLayerRef.current) return;
    const rLayer = routeLayerRef.current;
    const mLayer = markerLayerRef.current;
    rLayer.clearLayers();
    mLayer.clearLayers();

    const map = mapInstanceRef.current;

    // Single Origin only
    if (originCoords && !destinationCoords) {
      const isGPS = isLiveGPS || origin.toLowerCase().includes('gps');
      const startIcon = L.divIcon({
        className: 'custom-map-pin',
        html: isGPS ? `
          <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(37,99,235,0.35);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid #FFFFFF;box-shadow:0 3px 8px rgba(0,0,0,0.35);z-index:2;"></div>
          </div>
        ` : `
          <div style="width:22px;height:22px;border-radius:50%;background:#10B981;border:3px solid #FFFFFF;box-shadow:0 3px 8px rgba(0,0,0,0.3);"></div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      L.marker(originCoords, { icon: startIcon }).addTo(mLayer);
      map.setView(originCoords, 14);
      return;
    }

    if (!originCoords || !destinationCoords) return;

    const [lat1, lon1] = originCoords;
    const [lat2, lon2] = destinationCoords;
    const allRoutePoints = [[lat1, lon1], [lat2, lon2]];

    const drawPoly = (coords, color, weight = 6, dashArray = null) => {
      if (!coords || coords.length < 2) return;
      allRoutePoints.push(...coords);

      // White outline glow
      rLayer.addLayer(L.polyline(coords, {
        color: '#FFFFFF',
        weight: weight + 3,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }));

      // Colored solid polyline
      rLayer.addLayer(L.polyline(coords, {
        color: color,
        weight: weight,
        opacity: 1.0,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round'
      }));
    };

    // Draw route segments
    if (selectedRoute && selectedRoute.mapSegments) {
      selectedRoute.mapSegments.forEach(seg => {
        let coords = seg.coords;

        // If road/walk/bus segment, check if real road geometry has been fetched
        if (seg.mode !== 'metro' && coords && coords.length === 2) {
          const [p1, p2] = coords;
          const key = `${p1[0].toFixed(4)},${p1[1].toFixed(4)}->${p2[0].toFixed(4)},${p2[1].toFixed(4)}`;
          if (roadGeometries[key] && roadGeometries[key].length > 2) {
            coords = roadGeometries[key];
          }
        }

        const isWalk = seg.mode === 'walk';
        const isIntercity = seg.mode === 'intercity';
        const weight = isIntercity ? 7 : (isWalk ? 5 : 7);
        const dash = isWalk ? '5, 8' : null;
        drawPoly(coords, seg.color, weight, dash);
      });
    }

    // Waypoint markers along the route
    if (selectedRoute?.waypoints) {
      selectedRoute.waypoints.forEach(wp => {
        if (!wp.coord) return;
        const isMetro = wp.type === 'metro';
        const isTransfer = wp.type === 'transfer';
        const badgeColor = isTransfer ? '#7C3AED' : (wp.color || '#2563EB');
        const isPurple = badgeColor === '#9333EA' || badgeColor.toLowerCase().includes('purple');
        const iconSymbol = isTransfer ? '🔄' : (isMetro ? (isPurple ? '🟣' : '🟢') : '🚌');


        const wpIcon = L.divIcon({
          className: 'wp-node',
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:16px;height:16px;border-radius:50%;background:#FFFFFF;border:2.5px solid ${badgeColor};box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>
              <div style="background:#FFFFFF;color:#0F172A;font-weight:700;font-size:9px;line-height:1.3;padding:3px 6px;border-radius:6px;border:none;box-shadow:0 2px 6px rgba(0,0,0,0.18);margin-top:2px;max-width:80px;text-align:center;word-break:break-word;">
                ${wp.name}
              </div>
            </div>
          `,
          iconSize: [88, 50],
          iconAnchor: [44, 9]
        });

        const m = L.marker(wp.coord, { icon: wpIcon, zIndexOffset: 800 });
        if (wp.details) {
          m.bindPopup(`<b>${wp.name}</b><br/><span style="font-size:11px;color:#475569;">${wp.details}</span>`);
        }
        mLayer.addLayer(m);
      });
    }

    // Start (Origin) Pin
    const isGPS = isLiveGPS || origin.toLowerCase().includes('gps');
    const originLabel = origin ? origin.split('(')[0].split(',')[0].trim() : (activeCity === 'bengaluru' ? 'Majestic' : 'Rajiv Chowk');
    const destLabel = destination ? destination.split('(')[0].split(',')[0].trim() : 'Destination';

    const startIcon = L.divIcon({
      className: 'custom-map-pin',
      html: isGPS ? `
        <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(37,99,235,0.35);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid #FFFFFF;box-shadow:0 3px 8px rgba(0,0,0,0.35);z-index:2;"></div>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:18px;height:18px;border-radius:50%;background:#10B981;border:3px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
          <div style="background:#FFFFFF;color:#0F172A;font-weight:700;font-size:10px;line-height:1;padding:3.5px 7px;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.18);margin-top:3px;white-space:nowrap;border:1px solid #E2E8F0;">
            ${originLabel}
          </div>
        </div>
      `,
      iconSize: [80, 44],
      iconAnchor: [40, 9]
    });
    L.marker([lat1, lon1], { icon: startIcon, zIndexOffset: 1000 }).addTo(mLayer);

    // Destination Pin (Google Red Pin + Label Capsule)
    const endIcon = L.divIcon({
      className: 'custom-dest-pin',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <svg width="24" height="30" viewBox="0 0 24 32" fill="none" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#EA4335"/>
            <circle cx="12" cy="11" r="5" fill="#FFFFFF"/>
          </svg>
          <div style="background:#FFFFFF;color:#0F172A;font-weight:700;font-size:10px;line-height:1;padding:3.5px 7px;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.18);margin-top:2px;white-space:nowrap;border:1px solid #E2E8F0;">
            ${destLabel}
          </div>
        </div>
      `,
      iconSize: [80, 52],
      iconAnchor: [40, 26]
    });
    L.marker([lat2, lon2], { icon: endIcon, zIndexOffset: 1000 }).addTo(mLayer);

    // Fit bounds smoothly to all route points (with proper padding)
    if (allRoutePoints.length > 0) {
      const bounds = L.latLngBounds(allRoutePoints);
      if (isRouteFocusView) {
        map.fitBounds(bounds, { paddingTopLeft: [24, 24], paddingBottomRight: [24, 24], maxZoom: 15 });
      } else {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
      }
    }
  }, [originCoords, destinationCoords, selectedRoute, origin, isLiveGPS, roadGeometries, isRouteFocusView]);

  const handleFitNetwork = () => {
    if (!mapInstanceRef.current) return;
    if (originCoords && destinationCoords) {
      mapInstanceRef.current.fitBounds(L.latLngBounds([originCoords, destinationCoords]), { padding: [40, 40] });
    } else {
      mapInstanceRef.current.setView(network.center, 12);
    }
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-gray-100 shadow-2xs bg-white ${className}`}>
      
      {/* 1. CLEAN GOOGLE MAP CANVAS */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP LEFT: METRO NETWORK ACTIVE BADGE & CITY TOGGLE — fullscreen only & not route focus view */}
      {isFullscreen && !isRouteFocusView && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 flex-wrap">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-gray-200/90 flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
              <TrainFront className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-gray-900 tracking-tight leading-tight">
              {network.cityName}
            </span>
          </div>

          {/* City Switcher Pill (Bengaluru ⇋ Delhi NCR) */}
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-gray-200/90 flex items-center gap-1">
            <button
              onClick={() => onCityChange('bengaluru')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                currentCity === 'bengaluru'
                  ? 'bg-[#9333EA] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bengaluru
            </button>
            <button
              onClick={() => onCityChange('delhi')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                currentCity === 'delhi'
                  ? 'bg-[#155DFC] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Delhi NCR
            </button>
          </div>
        </div>
      )}

      {/* TOP RIGHT MINIMAL CONTROLS */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleFitNetwork}
          title="Center on Network / Route"
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md text-gray-700 hover:text-blue-600 shadow-sm border border-gray-200 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
        >
          <LocateFixed className="w-4 h-4 stroke-[2.2]" />
        </button>

        {isFullscreen && !isRouteFocusView && (
          <button
            onClick={() => setShowNetworkOverlay(!showNetworkOverlay)}
            title={showNetworkOverlay ? "Hide Metro Network" : "Show Metro Network"}
            className={`w-8 h-8 rounded-xl backdrop-blur-md shadow-sm border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
              showNetworkOverlay 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : 'bg-white/95 text-gray-400 border-gray-200'
            }`}
          >
            <Layers className="w-4 h-4 stroke-[2.2]" />
          </button>
        )}

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Expand Map"}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md text-gray-700 hover:text-blue-600 shadow-sm border border-gray-200 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 stroke-[2.2]" /> : <Maximize2 className="w-4 h-4 stroke-[2.2]" />}
        </button>
      </div>

      {/* BOTTOM LEGEND — fullscreen only & not route focus view */}
      {isFullscreen && !isRouteFocusView && (
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-sm border border-gray-200/90 flex items-center justify-between text-[10px] font-semibold text-gray-700 pointer-events-auto">
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-gray-400 text-[9px] uppercase tracking-wider font-bold shrink-0">LINES:</span>
              {network.lines.map(line => {
                const displayName = line.name 
                  ? line.name.split('(')[0].trim() 
                  : (line.id.charAt(0).toUpperCase() + line.id.slice(1).replace('-', ' '));
                return (
                  <div key={line.id} className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-1 rounded-xs" style={{ backgroundColor: line.color }}></span>
                    <span style={{ color: line.color }} className="font-bold text-[10px]">{displayName}</span>
                  </div>
                );
              })}
            </div>
            <span className="text-gray-400 text-[9px] font-medium shrink-0 ml-2">Tap any station to route</span>
          </div>
        </div>
      )}

    </div>
  );
}

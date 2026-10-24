import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  Zap, 
  Crosshair, 
  Scan,
  Maximize2,
  Minimize2,
  Navigation
} from 'lucide-react';

export default function ParkingMap({ 
  spots = [], 
  selectedSpot = null, 
  onSelectSpot = () => {}, 
  onBookSpot = () => {},
  isFullscreen = false,
  onToggleFullscreen = () => {},
  onBack = () => {},
  centerCoords = null,
  className = "w-full h-full"
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersRef = useRef({});
  const initialFitDoneRef = useRef(false);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize({ pan: false });
      return;
    }

    const defaultLat = centerCoords?.lat || (spots.length > 0 ? spots[0].lat : 28.6325);
    const defaultLng = centerCoords?.lng || (spots.length > 0 ? spots[0].lng : 77.2185);

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Google Maps Streets Tiles (No API key required, reliable & global)
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // User location blue halo pin
    const userLat = centerCoords?.lat ? centerCoords.lat - 0.001 : 28.6315;
    const userLng = centerCoords?.lng ? centerCoords.lng - 0.002 : 28.6165;
    const userIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(21,93,252,0.18);"></div>
          <div style="width:12px;height:12px;border-radius:50%;background:#155DFC;border:2.5px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon, interactive: false }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate map size on fullscreen toggle
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timers = [30, 100, 250].map((delay) =>
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ pan: false });
          }
        }, delay)
      );
      return () => timers.forEach((t) => clearTimeout(t));
    }
  }, [isFullscreen]);

  // Update Markers dynamically when spots or selectedSpot changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    markersRef.current = {};

    if (spots.length === 0) return;

    spots.forEach((spot) => {
      const isSelected = selectedSpot && selectedSpot.id === spot.id;
      const showBadge = isSelected || spot.showPriceBadge;

      let iconHtml = '';
      if (isSelected) {
        // Active spot: Solid royal blue teardrop pin with white P + white price pill below
        iconHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <svg width="34" height="42" viewBox="0 0 34 42" fill="none" style="filter:drop-shadow(0 4px 6px rgba(21,93,252,0.35));">
              <path d="M17 1C8.16 1 1 8.16 1 17C1 26.5 17 41 17 41C17 41 33 26.5 33 17C33 8.16 25.84 1 17 1Z" fill="#155DFC"/>
              <text x="17" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#FFFFFF">P</text>
            </svg>
            <div style="background:white;color:#0F172A;font-weight:700;font-size:11px;padding:2px 8px;border-radius:9999px;box-shadow:0 2px 8px rgba(0,0,0,0.15);margin-top:2px;border:1px solid #E2E8F0;white-space:nowrap;font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
              ₹${spot.pricePerHour}/hr
            </div>
          </div>
        `;
      } else if (showBadge) {
        // Unselected spot with price badge (e.g. ₹35/hr)
        iconHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <svg width="34" height="42" viewBox="0 0 34 42" fill="none" style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.15));">
              <path d="M17 1C8.16 1 1 8.16 1 17C1 26.5 17 41 17 41C17 41 33 26.5 33 17C33 8.16 25.84 1 17 1Z" fill="#FFFFFF" stroke="#155DFC" stroke-width="2.5"/>
              <text x="17" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#155DFC">P</text>
            </svg>
            <div style="background:white;color:#0F172A;font-weight:700;font-size:11px;padding:2px 8px;border-radius:9999px;box-shadow:0 2px 8px rgba(0,0,0,0.15);margin-top:2px;border:1px solid #E2E8F0;white-space:nowrap;font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
              ₹${spot.pricePerHour}/hr
            </div>
          </div>
        `;
      } else {
        // Standard unselected teardrop pin with blue border and blue P
        iconHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <svg width="34" height="42" viewBox="0 0 34 42" fill="none" style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.15));">
              <path d="M17 1C8.16 1 1 8.16 1 17C1 26.5 17 41 17 41C17 41 33 26.5 33 17C33 8.16 25.84 1 17 1Z" fill="#FFFFFF" stroke="#155DFC" stroke-width="2.5"/>
              <text x="17" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#155DFC">P</text>
            </svg>
          </div>
        `;
      }

      const pinIcon = L.divIcon({
        className: 'custom-teardrop-pin',
        html: iconHtml,
        iconSize: showBadge ? [54, 66] : [34, 42],
        iconAnchor: showBadge ? [27, 41] : [17, 41]
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: pinIcon }).addTo(markersLayerRef.current);
      marker.on('click', () => {
        onSelectSpot(spot);
      });

      markersRef.current[spot.id] = marker;
    });

    if (!initialFitDoneRef.current && spots.length > 0) {
      initialFitDoneRef.current = true;
    }
  }, [spots, selectedSpot]);

  const handleRecenter = (e) => {
    if (e) e.stopPropagation();
    if (!mapInstanceRef.current) return;
    const defaultLat = centerCoords?.lat || (spots.length > 0 ? spots[0].lat : 28.6325);
    const defaultLng = centerCoords?.lng || (spots.length > 0 ? spots[0].lng : 77.2185);
    mapInstanceRef.current.flyTo([defaultLat, defaultLng], 15, { duration: 0.6 });
  };

  const handleFitAll = (e) => {
    if (e) e.stopPropagation();
    if (!mapInstanceRef.current || spots.length === 0) return;
    const markerList = Object.values(markersRef.current);
    if (markerList.length > 0) {
      const group = L.featureGroup(markerList);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.3), { duration: 0.6 });
    }
  };

  return (
    <div className={`relative overflow-hidden w-full h-full font-sans bg-[#F8FAFC] ${className}`}>
      {/* Map DOM Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full" 
      />

      {/* =========================================================================
          FULLSCREEN MODE OVERLAYS (Matches Target Image 2)
          ========================================================================= */}
      {isFullscreen ? (
        <>
          {/* Floating Top Controls: [ ← ] Parking nearby  &  • 4 nearby */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2.5 pointer-events-none">
            {/* Top Header Pill */}
            <div className="bg-white/95 backdrop-blur-md rounded-full shadow-md border border-gray-100 px-4 py-2 flex items-center gap-3 pointer-events-auto">
              <button 
                type="button"
                onClick={onBack || onToggleFullscreen}
                className="p-1 -ml-1 text-gray-800 hover:text-black cursor-pointer active:scale-95 transition-all"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h1 className="text-base font-bold text-gray-900 tracking-tight pr-1">
                Parking nearby
              </h1>
            </div>

            {/* 4 nearby Pill */}
            <div className="bg-white/95 backdrop-blur-md rounded-full shadow-xs border border-gray-100 px-3.5 py-1.5 flex items-center gap-2 self-start pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-800">
                {spots.length} nearby
              </span>
            </div>
          </div>

          {/* Floating Action Controls (FABs) on Bottom Right */}
          <div 
            className={`absolute right-3.5 z-[400] flex flex-col gap-2 transition-all duration-300 ${
              selectedSpot ? 'bottom-[195px]' : 'bottom-4'
            }`}
          >
            {/* Recenter Button */}
            <button
              type="button"
              onClick={handleRecenter}
              className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              title="Recenter Map"
            >
              <Crosshair className="w-4 h-4 text-gray-800 stroke-[2.2]" />
            </button>

            {/* View All / Fit Button */}
            <button
              type="button"
              onClick={handleFitAll}
              className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              title="View All Spots"
            >
              <Scan className="w-4 h-4 text-gray-800 stroke-[2.2]" />
            </button>
          </div>

          {/* Docked Bottom Sheet (Compact to reveal more map) */}
          {selectedSpot && (
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-[0_-6px_24px_rgba(0,0,0,0.08)] border-t border-gray-100/60 px-4 pt-2 pb-3.5 flex flex-col gap-2 z-[450] animate-in slide-in-from-bottom-3 duration-150">
              {/* Top Drag Handle */}
              <div className="w-9 h-1 bg-gray-300 rounded-full mx-auto mb-0.5" />

              {/* Title & Close */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 pr-2">
                  <h2 className="text-base font-bold text-gray-900 leading-tight tracking-tight truncate">
                    {selectedSpot.name}
                  </h2>
                  <p className="text-xs text-gray-500 font-normal mt-0.5 truncate">
                    {selectedSpot.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectSpot(null)}
                  className="p-1 -mr-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer transition-colors shrink-0"
                  title="Close details"
                >
                  <X className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>

              {/* Walking Distance Row */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                <svg 
                  className="w-3.5 h-3.5 text-gray-700 shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="13" cy="4" r="2" />
                  <path d="m9 20 3-6-3-2V8l4-2 3 4-2 4 4 6" />
                  <path d="M6 12l3 2" />
                </svg>
                <span>
                  {selectedSpot.distanceLabel || `${selectedSpot.distance} km`} · {selectedSpot.walkingTime}
                </span>
              </div>

              {/* Faint Divider */}
              <div className="border-t border-gray-100 my-0.5" />

              {/* Availability & Rate Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-sm font-extrabold text-emerald-600">
                    {selectedSpot.availableSpots}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    / {selectedSpot.totalSpots} free
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="text-xl font-black text-gray-900 tracking-tight">
                    ₹{selectedSpot.pricePerHour}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 ml-1">
                    /hr
                  </span>
                </div>
              </div>

              {/* Amenities Row */}
              <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-600">
                {selectedSpot.evCharging && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-gray-800 fill-gray-800" />
                    <span>EV charging</span>
                  </div>
                )}
                
                {selectedSpot.evCharging && selectedSpot.covered && (
                  <div className="w-px h-3 bg-gray-200" />
                )}

                {selectedSpot.covered && (
                  <div className="flex items-center gap-1">
                    <svg 
                      className="w-3.5 h-3.5 text-gray-800" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M3 10l9-6 9 6" />
                      <path d="M4 10v9" />
                      <path d="M20 10v9" />
                    </svg>
                    <span>Covered</span>
                  </div>
                )}
              </div>

              {/* Full-Width Book Slot CTA Button */}
              <button
                type="button"
                onClick={() => onBookSpot(selectedSpot)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#155DFC] hover:bg-blue-600 active:scale-[0.99] transition-all text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer mt-0.5"
              >
                <span>Book slot</span>
                <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            </div>
          )}
        </>
      ) : (
        /* =========================================================================
            INLINE DASHBOARD MODE CONTROLS
            ========================================================================= */
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-[400] pointer-events-none">
          {/* Left: • 4 nearby */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-200/90 shadow-xs text-gray-900 pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-tight text-gray-800">
              {spots.length} nearby
            </span>
          </div>

          {/* Right: Recenter + Expand to Fullscreen */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={handleRecenter}
              className="text-xs font-semibold text-gray-800 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/90 shadow-xs hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Recenter Map"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span>Recenter</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleFullscreen(true)}
              className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-xs hover:bg-gray-50 active:scale-95 text-gray-800 flex items-center justify-center transition-all cursor-pointer"
              title="Expand to Fullscreen Map"
            >
              <Maximize2 className="w-4 h-4 text-gray-800" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

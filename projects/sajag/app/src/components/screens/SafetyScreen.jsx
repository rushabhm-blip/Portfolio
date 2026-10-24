import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ArrowLeft,
  Search,
  Navigation,
  Plus,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  Share2,
  X,
  Shield,
  MapPin,
  Clock,
  Calendar,
  Send,
  CheckCircle2,
  Car,
  Flame,
  AlertOctagon
} from 'lucide-react';
import { getPendingSnapshot, clearPendingSnapshot } from '../../services/safetySnapshotService';
import EmergencyHelpScreen from './safety/EmergencyHelpScreen';

// 4 DUMMY SAFETY COMPLAINTS (Plotted matching the reference mockup)
const DUMMY_SAFETY_COMPLAINTS = [
  {
    id: 'hazard-1',
    title: 'Footpath blocked',
    categoryTag: 'Street hazard',
    categoryType: 'Street hazards',
    intensity: 'orange',
    iconType: 'pedestrian',
    lat: 18.5208,
    lng: 73.8512,
    radius: 35,
    reportedBy: 'Vikram R.',
    time: 'Updated 12 min ago',
    distance: '680 m away',
    area: 'Congress House Rd',
    description: 'Loose gravel, concrete blocks and exposed rebar are blocking the footpath, forcing people onto the road.',
    status: 'Notice issued to site supervisor',
    statusType: 'investigating',
    upvotes: 14
  },
  {
    id: 'hazard-2',
    title: 'Poor lighting & harassment risk',
    categoryTag: 'Personal safety',
    categoryType: 'Personal safety',
    intensity: 'red',
    iconType: 'alert',
    lat: 18.5238,
    lng: 73.8592,
    radius: 45,
    reportedBy: 'Pooja M.',
    time: 'Updated 35 min ago',
    distance: '280 m away',
    area: 'Canal River Walkway',
    description: 'Non-functional streetlights along the 200m canal underpass road creating severe visibility and safety risk after dark.',
    status: 'Night patrol team dispatched',
    statusType: 'investigating',
    upvotes: 38
  },
  {
    id: 'hazard-3',
    title: 'Open manhole & waterlogging',
    categoryTag: 'Street hazard',
    categoryType: 'Street hazards',
    intensity: 'orange',
    iconType: 'water',
    lat: 18.5165,
    lng: 73.8530,
    radius: 35,
    reportedBy: 'Karan S.',
    time: 'Updated 1 hr ago',
    distance: '420 m away',
    area: 'Near Gangotri Chowk',
    description: 'Heavy water accumulation concealing an uncovered storm drain manhole. Two two-wheelers skidded this afternoon.',
    status: 'Emergency barrier deployed',
    statusType: 'dispatched',
    upvotes: 24
  },
  {
    id: 'hazard-4',
    title: 'Construction barrier on roadway',
    categoryTag: 'Travel disruption',
    categoryType: 'Travel disruptions',
    intensity: 'orange',
    iconType: 'barrier',
    lat: 18.5158,
    lng: 73.8625,
    radius: 35,
    reportedBy: 'Anita D.',
    time: 'Updated 2 hrs ago',
    distance: '540 m away',
    area: 'Raviwar Peth Market Lane',
    description: 'Construction barriers and uncollected road trenching debris causing severe traffic bottleneck during peak hours.',
    status: 'Clearing team scheduled',
    statusType: 'verified',
    upvotes: 19
  }
];

export default function SafetyScreen({ onNavigate }) {
  const mapWrapperRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const markersLayerRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sosActive, setSosActive] = useState(false);

  const [isMappingMode, setIsMappingMode] = useState(false);
  const isMappingModeRef = useRef(false);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [capturedHazard, setCapturedHazard] = useState(null);
  const [cardCollapsed, setCardCollapsed] = useState(false);

  // Complaints & interactive selection
  const [complaints, setComplaints] = useState(DUMMY_SAFETY_COMPLAINTS);
  const [selectedComplaint, setSelectedComplaint] = useState(DUMMY_SAFETY_COMPLAINTS[0]);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [upvotedMap, setUpvotedMap] = useState({});

  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [incidentCategory, setIncidentCategory] = useState('Accident / Roadblock');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [pendingSnapshot, setPendingSnapshot] = useState(null);

  const handleToggleUpvote = (complaintId) => {
    setUpvotedMap(prev => {
      const isCurrentlyUpvoted = Boolean(prev[complaintId]);
      const nextState = !isCurrentlyUpvoted;
      setComplaints(list => list.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            upvotes: nextState ? c.upvotes + 1 : c.upvotes - 1
          };
        }
        return c;
      }));
      setSelectedComplaint(c => {
        if (c && c.id === complaintId) {
          return {
            ...c,
            upvotes: nextState ? c.upvotes + 1 : c.upvotes - 1
          };
        }
        return c;
      });
      return { ...prev, [complaintId]: nextState };
    });
  };

  // Check for pending snapshot captured via power rhythm
  useEffect(() => {
    const checkSnapshot = () => {
      const snap = getPendingSnapshot();
      setPendingSnapshot(snap);
    };
    checkSnapshot();
    window.addEventListener('sajag-safety-snapshot-updated', checkSnapshot);
    return () => window.removeEventListener('sajag-safety-snapshot-updated', checkSnapshot);
  }, []);

  // Drag refs for incident reporting sheet
  const dragStartYRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const sheetRef = useRef(null);

  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(0);
  const startLatLngRef = useRef(null);
  const liveCircleRef = useRef(null);
  const liveDotRef = useRef(null);
  const activeRadiusRef = useRef(40);
  const activeIntensityRef = useRef('yellow');

  useEffect(() => {
    isMappingModeRef.current = isMappingMode;
  }, [isMappingMode]);

  const getColor = (i) => i === 'red' ? '#EF4444' : i === 'orange' ? '#F97316' : '#FACC15';
  const getStroke = (i) => i === 'red' ? '#B91C1C' : i === 'orange' ? '#C2410C' : '#CA8A04';

  // Initialize Leaflet map
  useEffect(() => {
    const wrapper = mapWrapperRef.current;
    if (!wrapper) return;

    if (mapInitializedRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const mapDiv = document.createElement('div');
    mapDiv.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:1;';
    wrapper.appendChild(mapDiv);

    // Centered around Shaniwar Wada, Pune (matching the reference mockup)
    const map = L.map(mapDiv, {
      center: [18.5195, 73.8553],
      zoom: 15.5,
      zoomControl: false,
      attributionControl: false
    });

    // Clean Google Streets Map Tiles
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // Layer group for safety alert pins
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // User location marker with soft pulse ring
    const userIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(29,97,242,0.22);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:16px;height:16px;border-radius:50%;background:#1D61F2;border:3px solid #FFF;box-shadow:0 3px 10px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([18.5195, 73.8553], { icon: userIcon, interactive: false }).addTo(map);

    // --- RAW DOM touch/mouse handlers for hazard marking ---
    const clearLive = () => {
      if (liveCircleRef.current) { map.removeLayer(liveCircleRef.current); liveCircleRef.current = null; }
      if (liveDotRef.current) { map.removeLayer(liveDotRef.current); liveDotRef.current = null; }
    };

    const getLatLngFromEvent = (e) => {
      const rect = mapDiv.getBoundingClientRect();
      let clientX, clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      return map.containerPointToLatLng(L.point(x, y));
    };

    const onDown = (e) => {
      if (!isMappingModeRef.current) return;
      e.preventDefault();

      const latlng = getLatLngFromEvent(e);
      if (!latlng) return;

      map.dragging.disable();
      if (map.touchZoom) map.touchZoom.disable();
      if (map.doubleClickZoom) map.doubleClickZoom.disable();
      if (map.scrollWheelZoom) map.scrollWheelZoom.disable();
      if (map.tap) map.tap.disable();

      startLatLngRef.current = latlng;
      holdStartRef.current = Date.now();
      activeRadiusRef.current = 8;
      activeIntensityRef.current = 'yellow';

      clearLive();
      liveCircleRef.current = L.circle(latlng, { radius: 8, color: '#CA8A04', fillColor: '#FACC15', fillOpacity: 0.5, weight: 2.5 }).addTo(map);
      liveDotRef.current = L.circleMarker(latlng, { radius: 6, color: '#FFF', weight: 2, fillColor: '#EAB308', fillOpacity: 1 }).addTo(map);

      clearInterval(holdTimerRef.current);
      holdTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - holdStartRef.current;
        const cycleLength = 4500;
        const pos = elapsed % cycleLength;
        let intensity = 'yellow';
        if (pos >= 3000) { intensity = 'red'; }
        else if (pos >= 1500) { intensity = 'orange'; }

        activeIntensityRef.current = intensity;
        if (liveCircleRef.current) {
          liveCircleRef.current.setStyle({ color: getStroke(intensity), fillColor: getColor(intensity), fillOpacity: intensity === 'red' ? 0.6 : 0.5 });
        }
        if (liveDotRef.current) liveDotRef.current.setStyle({ fillColor: getColor(intensity) });
      }, 50);
    };

    const onMove = (e) => {
      if (!isMappingModeRef.current || !startLatLngRef.current || !liveCircleRef.current) return;
      e.preventDefault();
      const cur = getLatLngFromEvent(e);
      if (!cur) return;
      const dist = map.distance(startLatLngRef.current, cur);
      const newRadius = Math.max(dist, 8);
      activeRadiusRef.current = newRadius;
      liveCircleRef.current.setRadius(newRadius);
    };

    const onUp = () => {
      clearInterval(holdTimerRef.current);
      map.dragging.enable();
      if (map.touchZoom) map.touchZoom.enable();
      if (map.doubleClickZoom) map.doubleClickZoom.enable();
      if (map.scrollWheelZoom) map.scrollWheelZoom.enable();
      if (map.tap) map.tap.enable();

      if (!isMappingModeRef.current || !startLatLngRef.current) { clearLive(); return; }
      const elapsed = Date.now() - holdStartRef.current;
      if (elapsed >= 200) {
        const now = new Date();
        setCapturedHazard({
          lat: startLatLngRef.current.lat, lng: startLatLngRef.current.lng,
          radius: activeRadiusRef.current, intensity: activeIntensityRef.current
        });
        setIncidentDate(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
        setIncidentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
        setCardCollapsed(false);
        setShowIncidentModal(true);
      } else { clearLive(); startLatLngRef.current = null; }
    };

    mapDiv.addEventListener('mousedown', onDown);
    mapDiv.addEventListener('mousemove', onMove);
    mapDiv.addEventListener('mouseup', onUp);
    mapDiv.addEventListener('touchstart', onDown, { passive: false });
    mapDiv.addEventListener('touchmove', onMove, { passive: false });
    mapDiv.addEventListener('touchend', onUp);
    mapDiv.addEventListener('touchcancel', onUp);

    mapDiv.addEventListener('contextmenu', (e) => {
      if (isMappingModeRef.current) e.preventDefault();
    });

    mapInstanceRef.current = map;
    mapInitializedRef.current = true;

    const safeInvalidate = () => {
      try {
        if (mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
          mapInstanceRef.current.invalidateSize();
        }
      } catch (e) {}
    };

    const timers = [0, 100, 250, 500, 1000].map(d => setTimeout(safeInvalidate, d));
    map.whenReady(() => setTimeout(safeInvalidate, 100));

    return () => {
      clearInterval(holdTimerRef.current);
      timers.forEach(t => clearTimeout(t));
      mapDiv.removeEventListener('mousedown', onDown);
      mapDiv.removeEventListener('mousemove', onMove);
      mapDiv.removeEventListener('mouseup', onUp);
      mapDiv.removeEventListener('touchstart', onDown);
      mapDiv.removeEventListener('touchmove', onMove);
      mapDiv.removeEventListener('touchend', onUp);
      mapDiv.removeEventListener('touchcancel', onUp);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      mapInitializedRef.current = false;
      if (mapDiv.parentNode) mapDiv.parentNode.removeChild(mapDiv);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render markers matching the active filter
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const group = markersLayerRef.current;
    group.clearLayers();

    const filtered = activeFilter === 'all'
      ? complaints
      : complaints.filter(c => c.categoryType === activeFilter);

    filtered.forEach((complaint) => {
      // 1. Hazard Circle Zone
      L.circle([complaint.lat, complaint.lng], {
        radius: complaint.radius || 35,
        color: getStroke(complaint.intensity),
        fillColor: getColor(complaint.intensity),
        fillOpacity: complaint.intensity === 'red' ? 0.35 : 0.22,
        weight: 1.5,
      }).addTo(group);

      // 2. Pin Marker HTML matching mockup
      let iconHtml = '';
      if (complaint.iconType === 'pedestrian') {
        iconHtml = `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="width:34px;height:34px;border-radius:50%;background:#F59E0B;border:2.5px solid #FFFFFF;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#FFFFFF;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                <path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>
              </svg>
            </div>
            <div style="width:7px;height:7px;border-radius:50%;background:#D97706;border:1.5px solid #FFF;margin-top:1px;"></div>
          </div>
        `;
      } else if (complaint.intensity === 'red') {
        iconHtml = `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="width:34px;height:34px;border-radius:50%;background:#EF4444;border:2.5px solid #FFFFFF;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-weight:900;font-size:16px;">
              !
            </div>
            <div style="width:7px;height:7px;border-radius:50%;background:#DC2626;border:1.5px solid #FFF;margin-top:1px;"></div>
          </div>
        `;
      } else if (complaint.iconType === 'water') {
        iconHtml = `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="width:34px;height:34px;border-radius:50%;background:#F97316;border:2.5px solid #FFFFFF;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#FFFFFF;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div style="width:7px;height:7px;border-radius:50%;background:#EA580C;border:1.5px solid #FFF;margin-top:1px;"></div>
          </div>
        `;
      } else {
        iconHtml = `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="width:34px;height:34px;border-radius:50%;background:#EA580C;border:2.5px solid #FFFFFF;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#FFFFFF;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="6" width="20" height="8" rx="1"/>
                <path d="M17 14v7M7 14v7M4 14l6-8M14 14l6-8M10 14l6-8"/>
              </svg>
            </div>
            <div style="width:7px;height:7px;border-radius:50%;background:#C2410C;border:1.5px solid #FFF;margin-top:1px;"></div>
          </div>
        `;
      }

      const marker = L.marker([complaint.lat, complaint.lng], {
        icon: L.divIcon({
          className: 'custom-safety-pin',
          html: iconHtml,
          iconSize: [34, 42],
          iconAnchor: [17, 42]
        }),
        interactive: true
      }).addTo(group);

      marker.on('click', (e) => {
        if (isMappingModeRef.current) return;
        if (e && e.originalEvent) L.DomEvent.stopPropagation(e);
        setSelectedComplaint(complaint);
        mapInstanceRef.current.panTo([complaint.lat, complaint.lng], { animate: true, duration: 0.5 });
      });
    });
  }, [activeFilter, complaints]);

  const handleBroadcastIncident = () => {
    if (!capturedHazard || !mapInstanceRef.current) { setShowIncidentModal(false); return; }
    liveCircleRef.current = null;
    liveDotRef.current = null;
    clearPendingSnapshot();
    setPendingSnapshot(null);
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setShowIncidentModal(false);
      setIsMappingMode(false);
      setIncidentDesc('');
      startLatLngRef.current = null;
    }, 900);
  };

  const handleCloseModal = () => {
    setShowIncidentModal(false);
    setIsMappingMode(false);
    const map = mapInstanceRef.current;
    if (map) {
      if (liveCircleRef.current) { map.removeLayer(liveCircleRef.current); liveCircleRef.current = null; }
      if (liveDotRef.current) { map.removeLayer(liveDotRef.current); liveDotRef.current = null; }
    }
    startLatLngRef.current = null;
  };

  const filteredComplaints = activeFilter === 'all'
    ? complaints
    : complaints.filter(c => c.categoryType === activeFilter);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Inter, sans-serif', userSelect: 'none' }}>
      
      {/* HEADER SECTION (EXACTLY MATCHING MOCKUP) */}
      <div className="w-full px-4 pt-3 pb-2.5 bg-white border-b border-gray-100 flex flex-col gap-2.5 shrink-0" style={{ zIndex: 30 }}>
        {/* Top Row: Back Button, Title + Subtitle, Emergency Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 flex items-center justify-center transition-all cursor-pointer -ml-1"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Safety</h1>
              <p className="text-xs font-medium text-gray-500 mt-1">Near Shaniwar Wada</p>
            </div>
          </div>
          <button
            onClick={() => setSosActive(true)}
            className="px-5 py-2 rounded-full border border-[#EC2A2E] text-[#EC2A2E] hover:bg-red-50 active:scale-95 transition-all font-bold text-xs tracking-wide cursor-pointer bg-white shadow-xs"
          >
            Emergency
          </button>
        </div>

        {/* Search Bar: Search an area */}
        <div className="w-full bg-[#F9FAFB] rounded-2xl border border-gray-200/90 flex items-center px-3.5 py-2.5 space-x-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search an area"
            className="w-full bg-transparent border-none text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Filter Chips: All, Street hazards, Personal safety, Travel disruptions */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'Street hazards', label: 'Street hazards' },
            { id: 'Personal safety', label: 'Personal safety' },
            { id: 'Travel disruptions', label: 'Travel disruptions' }
          ].map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1D61F2] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAP AREA */}
      <div ref={mapWrapperRef} style={{ flex: '1 1 0%', minHeight: 0, width: '100%', position: 'relative', overflow: 'hidden', background: '#e5e7eb' }}>
        
        {/* TOP-LEFT: 4 nearby alerts badge */}
        {!isMappingMode && (
          <div className="absolute top-4 left-4 z-[800] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-md border border-gray-150 flex items-center gap-2 pointer-events-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-gray-900 tracking-tight">
              {filteredComplaints.length} nearby alerts
            </span>
          </div>
        )}

        {/* TOP-RIGHT: GPS Center Button */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([18.5195, 73.8553], 15.5, { animate: true });
            }
          }}
          className="absolute top-4 right-4 z-[800] w-10 h-10 rounded-full bg-white shadow-md border border-gray-150 flex items-center justify-center text-[#1D61F2] hover:bg-gray-50 active:scale-95 transition-all cursor-pointer pointer-events-auto"
          title="Center on current location"
        >
          <Navigation className="w-4 h-4 fill-[#1D61F2]" />
        </button>

        {/* BOTTOM-RIGHT: + Mark unsafe area Button - Positioned above preview card so it is always visible */}
        {!isMappingMode && !sosActive && (
          <button
            onClick={() => {
              setIsMappingMode(true);
            }}
            className={`absolute right-4 ${selectedComplaint && !showFullDetails ? 'bottom-[215px]' : 'bottom-4'} z-[1300] px-4 py-2.5 rounded-full bg-[#1D61F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl border border-white/20 active:scale-95 transition-all cursor-pointer pointer-events-auto`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Mark unsafe area</span>
          </button>
        )}

        {/* MAPPING MODE BANNER */}
        {isMappingMode && !sosActive && (
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 850, pointerEvents: 'auto' }}>
            <div className="px-4 py-2 rounded-full bg-red-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-white/30">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Touch & drag circle to mark area</span>
              <button onClick={() => setIsMappingMode(false)} className="ml-1 p-0.5 rounded-full hover:bg-white/20">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* PENDING SNAPSHOT NOTIFICATION BANNER */}
        {pendingSnapshot && !showIncidentModal && !sosActive && (
          <div className="absolute top-16 left-3 right-3 z-[850] bg-white/95 backdrop-blur-md border border-rose-200/90 shadow-xl rounded-2xl p-3 flex items-center justify-between gap-2.5 animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
              </div>
              <div className="truncate">
                <div className="text-[11px] font-black text-gray-900 truncate">
                  Location Snapshot Saved
                </div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">
                  {pendingSnapshot.areaName || 'Tagged GPS'} • {pendingSnapshot.time}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setCapturedHazard({
                    lat: pendingSnapshot.lat, lng: pendingSnapshot.lng,
                    radius: pendingSnapshot.radius || 35, intensity: pendingSnapshot.intensity || 'orange'
                  });
                  setIncidentDate(pendingSnapshot.date || '');
                  setIncidentTime(pendingSnapshot.time || '');
                  setShowIncidentModal(true);
                }}
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer transition-all"
              >
                Report Now
              </button>
              <button
                onClick={() => setPendingSnapshot(null)}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PREVIEW CARD (MATCHING REFERENCE MOCKUP) */}
      {selectedComplaint && !isMappingMode && !showFullDetails && !showIncidentModal && !sosActive && (
        <div
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1200 }}
          className="w-full flex justify-center p-0"
        >
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.14)] border-t border-gray-150 p-4 pb-5 flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto -mt-1 mb-2.5" />

            {/* Top Row: Icon + Category tag + Distance + Dismiss Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ${
                  selectedComplaint.intensity === 'red'
                    ? 'bg-rose-500'
                    : selectedComplaint.iconType === 'barrier'
                    ? 'bg-orange-600'
                    : 'bg-[#EAB308]'
                }`}>
                  {selectedComplaint.iconType === 'pedestrian' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                      <path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>
                    </svg>
                  ) : selectedComplaint.intensity === 'red' ? (
                    <span className="font-extrabold text-sm leading-none">!</span>
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E]">
                  {selectedComplaint.categoryTag}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">
                  {selectedComplaint.distance}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Close card"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mt-1.5">
              {selectedComplaint.title}
            </h2>

            {/* Subtitle: Area • Updated time */}
            <p className="text-xs text-gray-500 mt-0.5 font-normal">
              {selectedComplaint.area} · {selectedComplaint.time}
            </p>

            {/* Thin Divider */}
            <div className="w-full h-px bg-gray-150 my-3" />

            {/* Bottom Actions Row: View details > | View repair status ↗ */}
            <div className="flex items-center justify-between text-xs font-bold text-[#1D61F2] pt-0.5">
              <button
                onClick={() => setShowFullDetails(true)}
                className="flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View details</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="w-px h-3.5 bg-gray-200" />

              <button
                onClick={() => setShowFullDetails(true)}
                className="flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View repair status</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL COMPLAINT DETAILS MODAL (EXPANDED SHEET) */}
      {selectedComplaint && showFullDetails && !showIncidentModal && !sosActive && (
        <div
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1400 }}
          className="w-full flex justify-center p-0"
        >
          <div className="w-full max-w-[430px] bg-white rounded-t-[32px] shadow-[0_-16px_48px_rgba(0,0,0,0.18)] border-t border-gray-150 flex flex-col max-h-[85%] overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Top Drag Handle */}
            <div className="pt-3 pb-2 flex justify-center shrink-0">
              <div className="w-12 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto no-scrollbar px-6 pb-6 pt-1 flex flex-col">
              {/* Badge + Distance + Close Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    selectedComplaint.intensity === 'red'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-[#FFF4EC] text-[#C2410C]'
                  }`}>
                    <AlertTriangle className={`w-3.5 h-3.5 ${
                      selectedComplaint.intensity === 'red' ? 'text-red-600' : 'text-[#C2410C]'
                    }`} />
                    <span>
                      {selectedComplaint.intensity === 'red' ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                  <span className="text-sm font-normal text-gray-500">
                    • {selectedComplaint.distance}
                  </span>
                </div>

                <button
                  onClick={() => setShowFullDetails(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight mt-3">
                {selectedComplaint.title}
              </h2>

              {/* Location */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 flex items-center justify-center text-[#1D61F2] shrink-0">
                  <MapPin className="w-4 h-4 fill-[#1D61F2] text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {selectedComplaint.area}
                </span>
              </div>

              {/* Reporter & Time */}
              <div className="text-xs text-gray-500 font-normal mt-1">
                {selectedComplaint.reportedBy} • {selectedComplaint.time}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-150 my-4" />

              {/* Category Pill */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold self-start mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                  <circle cx="12" cy="5" r="1.5" />
                  <path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>
                </svg>
                <span>{selectedComplaint.categoryTag}</span>
              </div>

              {/* Section: What's happening */}
              <h3 className="text-base font-bold text-gray-900 mb-1">
                What’s happening
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-normal mb-4">
                {selectedComplaint.description}
              </p>

              {/* Authority Update Box */}
              <div className="bg-[#F0F6FF] rounded-2xl p-3.5 flex items-center gap-3.5 border border-blue-100/60 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-[#1D61F2] flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 fill-[#1D61F2]/20 text-[#1D61F2]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1D61F2]">
                    Authority update
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">
                    {selectedComplaint.status}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleUpvote(selectedComplaint.id)}
                  className="flex-1 py-3.5 bg-[#1D61F2] hover:bg-blue-700 active:scale-[0.99] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ThumbsUp className={`w-4 h-4 ${upvotedMap[selectedComplaint.id] ? 'fill-white' : ''}`} />
                  <span>
                    {upvotedMap[selectedComplaint.id] ? 'Hazard confirmed' : 'Confirm hazard'} • {selectedComplaint.upvotes}
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedComplaint.title,
                        text: `Safety Alert: ${selectedComplaint.title} at ${selectedComplaint.area}.`,
                        url: window.location.href
                      }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText?.(`${selectedComplaint.title} at ${selectedComplaint.area}`);
                      alert('Incident alert copied to clipboard!');
                    }
                  }}
                  className="w-12 h-12 rounded-2xl border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAGGABLE INCIDENT REPORTING SHEET (MARK UNSAFE AREA) */}
      {showIncidentModal && capturedHazard && !sosActive && (
        <div
          ref={sheetRef}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1500,
            transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            transform: cardCollapsed ? 'translateY(calc(100% - 56px))' : 'translateY(0)'
          }}
          className="w-full flex justify-center">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.22)] border-t border-gray-200/90 flex flex-col max-h-[75%] overflow-hidden">
            
            <div
              style={{ touchAction: 'none', minHeight: 44 }}
              className="flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shrink-0"
              onTouchStart={(e) => {
                dragStartYRef.current = e.touches[0].clientY;
                dragOffsetRef.current = 0;
                if (sheetRef.current) sheetRef.current.style.transition = 'none';
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                dragOffsetRef.current = e.touches[0].clientY - dragStartYRef.current;
                if (sheetRef.current) {
                  const base = cardCollapsed ? 'calc(100% - 56px)' : '0px';
                  sheetRef.current.style.transform = `translateY(calc(${base} + ${dragOffsetRef.current}px))`;
                }
              }}
              onTouchEnd={() => {
                if (sheetRef.current) sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25,1,0.5,1)';
                const dy = dragOffsetRef.current;
                if (!cardCollapsed && dy > 25) { setCardCollapsed(true); }
                else if (cardCollapsed && dy < -25) { setCardCollapsed(false); }
                else {
                  if (sheetRef.current) sheetRef.current.style.transform = cardCollapsed ? 'translateY(calc(100% - 56px))' : 'translateY(0)';
                }
              }}
              onMouseDown={(e) => { dragStartYRef.current = e.clientY; }}
              onMouseUp={(e) => {
                const diff = e.clientY - dragStartYRef.current;
                if (!cardCollapsed && diff > 20) setCardCollapsed(true);
                else if (cardCollapsed && diff < -20) setCardCollapsed(false);
              }}
            >
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
              <span className="text-[9px] text-gray-400 font-bold mt-1">{cardCollapsed ? '↑ Drag up to expand' : '↓ Drag down to check map'}</span>
            </div>

            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center space-x-2">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                  capturedHazard.intensity === 'red' ? 'bg-red-100 text-red-600'
                  : capturedHazard.intensity === 'orange' ? 'bg-orange-100 text-orange-600'
                  : 'bg-amber-100 text-amber-600'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 leading-tight">Mark Unsafe Area</h3>
                  <p className="text-[10px] text-gray-500">
                    {capturedHazard.intensity === 'red' ? '🔴 Critical' : capturedHazard.intensity === 'orange' ? '🟠 Warning' : '🟡 Advisory'} · ~{Math.round(capturedHazard.radius)}m
                  </p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar p-5 pt-3 flex flex-col">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /><span>Date</span>
                  </label>
                  <input type="text" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-[#155DFC]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /><span>Time</span>
                  </label>
                  <input type="text" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-[#155DFC]" />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-bold text-gray-800 block mb-1.5">What happened?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Accident / Roadblock', icon: Car },
                    { label: 'Fire / Chemical Hazard', icon: Flame },
                    { label: 'Crime / Harassment', icon: AlertOctagon },
                    { label: 'Waterlogging / Pothole', icon: AlertTriangle }
                  ].map((item) => {
                    const Icon = item.icon;
                    const sel = incidentCategory === item.label;
                    return (
                      <button key={item.label} onClick={() => setIncidentCategory(item.label)}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 cursor-pointer ${
                          sel ? 'border-[#155DFC] bg-blue-50/70 text-[#155DFC] font-bold' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs'}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${sel ? 'text-[#155DFC]' : 'text-gray-500'}`} />
                        <span className="text-[11px] leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-bold text-gray-800 block mb-1.5">Describe (Optional):</label>
                <textarea value={incidentDesc} onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="E.g. Broken streetlight, road cave-in..."
                  rows={2} className="w-full p-2.5 text-xs rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#155DFC]" />
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center space-x-2">
                <button onClick={handleCloseModal}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
                <button onClick={handleBroadcastIncident}
                  className="flex-[2] py-3 bg-[#155DFC] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95">
                  {broadcastSuccess ? (<><CheckCircle2 className="w-4 h-4 text-emerald-300" /><span>Marked!</span></>) : (<><Send className="w-4 h-4" /><span>Mark Unsafe Area</span></>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY HELP SCREEN */}
      {sosActive && (
        <EmergencyHelpScreen 
          onClose={() => setSosActive(false)} 
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Droplets,
  Sparkles,
  Zap,
  Package,
  CircleParking,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Map,
  X,
  ArrowLeft,
  Star,
  TrainFront,
  BusFront,
  CarFront,
  Footprints,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Ticket,
  QrCode,
  CreditCard,
  ShieldCheck,
  Wallet,
  ExternalLink,
  LocateFixed,
  ArrowUpDown,
  Search,
  Loader2,
  Mic,
  Volume2,
  VolumeX,
  Volume1
} from 'lucide-react';
import RealisticQRCode from '../common/RealisticQRCode';
import TransitRouteMap from './explore/TransitRouteMap';
import { 
  planSmartTransitRoute, 
  getMetroNetwork, 
  detectCity, 
  calculateDistanceKm 
} from '../../services/metroTransitService';
import { speakAloud, stopSpeaking } from '../../services/voiceAssistantService';
import { getSavedUserLocation } from '../../services/userLocationService';

// CURATED POPULAR METRO & TRANSIT HOTSPOTS FOR ZERO-LATENCY AUTOCOMPLETE
const POPULAR_LOCATIONS = [
  // BENGALURU HUBS & NAMMA METRO STATIONS
  { name: 'Nadaprabhu Kempegowda Majestic', category: 'Namma Metro Central Interchange', coords: [12.9757, 77.5729], city: 'bengaluru' },
  { name: 'Indiranagar (100ft Road)', category: 'Purple Line Metro • Dining Hub', coords: [12.9783, 77.6408], city: 'bengaluru' },
  { name: 'Whitefield (Kadugodi Metro)', category: 'Purple Line Terminal • IT Corridor', coords: [12.9972, 77.7583], city: 'bengaluru' },
  { name: 'MG Road (Mahatma Gandhi Road)', category: 'Purple Line Metro • Central CBD', coords: [12.9754, 77.6066], city: 'bengaluru' },
  { name: 'Yeshwanthpur Junction', category: 'Green Line Metro & Railway Hub', coords: [13.0232, 77.5499], city: 'bengaluru' },
  { name: 'Samhita Square (IT Corridor, Hoodi)', category: 'Tech Park • Whitefield Main Rd', coords: [12.9912, 77.7145], city: 'bengaluru' },
  { name: 'Peenya Industrial Area', category: 'Green Line Metro • Industrial Zone', coords: [13.0328, 77.5332], city: 'bengaluru' },
  { name: 'Electronic City Phase 1', category: 'Tech Park Corridor • South Bengaluru', coords: [12.8452, 77.6602], city: 'bengaluru' },
  { name: 'Koramangala (5th Block)', category: 'Commercial Hub • Feeder Network', coords: [12.9352, 77.6245], city: 'bengaluru' },
  { name: 'Jayanagar 4th Block', category: 'Green Line Metro • Shopping Center', coords: [12.9299, 77.5824], city: 'bengaluru' },
  { name: 'Silk Board Junction', category: 'Central Transit Hub & Outer Ring Road', coords: [12.9176, 77.6238], city: 'bengaluru' },
  { name: 'Kempegowda International Airport (BLR)', category: 'Airport Corridor • Vayu Vajra E-Bus', coords: [13.1986, 77.7066], city: 'bengaluru' },

  // DELHI NCR HUBS
  { name: 'Connaught Place (Rajiv Chowk)', category: 'Yellow & Blue Line Metro Interchange', coords: [28.6328, 77.2197], city: 'delhi' },
  { name: 'Cyber City (DLF Phase 2)', category: 'Rapid Metro • Gurugram Hub', coords: [28.4950, 77.0895], city: 'delhi' },
  { name: 'IGI Airport Terminal 3', category: 'Orange Line Airport Express', coords: [28.5540, 77.0840], city: 'delhi' },
  { name: 'Hauz Khas Village', category: 'Yellow & Magenta Metro Hub', coords: [28.5432, 77.2065], city: 'delhi' },
  { name: 'Noida Sector 62 (Electronic City)', category: 'Blue Line Noida', coords: [28.6212, 77.3649], city: 'delhi' },
  { name: 'Millennium City Centre (Huda City)', category: 'Yellow Line Terminal Gurugram', coords: [28.4595, 77.0726], city: 'delhi' },
  { name: 'Anand Vihar ISBT', category: 'Interstate Bus Terminal & Blue Line', coords: [28.6469, 77.3160], city: 'delhi' }
];

function getModeIcon(type) {
  if (type === 'metro') return TrainFront;
  if (type === 'bus') return BusFront;
  if (type === 'train') return TrainFront;
  if (type === 'auto') return CarFront;
  return Footprints;
}

function RestroomIcon({ className = "w-5 h-5 text-[#155DFC]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="4" r="1.6" />
      <path d="M7.5 7v6" />
      <path d="M4.5 10h6" />
      <path d="M6 13v6" />
      <path d="M9 13v6" />
      <circle cx="16.5" cy="4" r="1.6" />
      <path d="M14 13.5l1.6-6.5h1.8l1.6 6.5h-5z" />
      <path d="M15 13.5v5.5" />
      <path d="M18 13.5v5.5" />
    </svg>
  );
}

function WaterIcon({ className = "w-5 h-5 text-[#155DFC]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function EvIcon({ className = "w-5 h-5 text-[#155DFC]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
    </svg>
  );
}

function LockerIcon({ className = "w-5 h-5 text-[#155DFC]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M12 12l8-4.5" />
      <path d="M12 12v9" />
      <path d="M12 12L4 7.5" />
    </svg>
  );
}

function getRouteModesBreakdown(route) {
  if (route.id === 'direct-bus' || route.title?.includes('Bus')) {
    return [
      { label: 'Walk', icon: Footprints, color: 'text-slate-600', isBold: false },
      { label: 'City Bus', icon: BusFront, color: 'text-[#059669]', isBold: true }
    ];
  }

  return [
    { label: 'Walk', icon: Footprints, color: 'text-slate-600', isBold: false },
    { label: 'Purple Line', icon: TrainFront, color: 'text-[#9333EA]', isBold: true },
    { label: 'Feeder', icon: BusFront, color: 'text-slate-600', isBold: false }
  ];
}

function getRouteTimeline(route, originName, destName) {
  if (route.id === 'metro-auto' || (!originName && !destName) || (originName === 'Peenya' && destName === 'Samitha Square')) {
    return [
      {
        name: 'Peenya',
        details: 'Board Green Line',
        time: '3 min',
        nodeColor: '#64748B',
        trackColor: '#16A34A',
        trackStyle: 'solid'
      },
      {
        name: 'Majestic',
        details: 'Change to Purple Line',
        time: '19 min',
        nodeColor: '#16A34A',
        trackColor: '#9333EA',
        trackStyle: 'solid'
      },
      {
        name: 'Benniganahalli',
        details: 'Exit Gate 1 • Prepaid auto stand',
        time: '21 min',
        nodeColor: '#9333EA',
        trackColor: '#F59E0B',
        trackStyle: 'dashed'
      },
      {
        name: 'Samitha Square',
        details: 'Auto drop • Vignananagara',
        time: '9 min',
        nodeColor: '#F59E0B',
        trackColor: null
      }
    ];
  }

  if (route.waypoints && route.waypoints.length > 0) {
    return route.waypoints.map((wp, idx) => {
      const isLast = idx === route.waypoints.length - 1;
      const nextWp = route.waypoints[idx + 1];
      return {
        name: wp.name.split('(')[0].replace('Metro', '').trim(),
        details: wp.details || (idx === 0 ? 'Board transit' : (isLast ? 'Arrive at destination' : 'Transit connection')),
        time: idx === 0 ? '3 min' : `${Math.max(4, Math.round(parseInt(route.duration || 30) / route.waypoints.length))} min`,
        nodeColor: wp.color || '#155DFC',
        trackColor: nextWp?.color || wp.color || '#CBD5E1',
        trackStyle: wp.type === 'walk' || wp.type === 'auto' ? 'dashed' : 'solid'
      };
    });
  }

  return [
    {
      name: originName ? originName.split(',')[0].trim() : 'Starting Point',
      details: 'Board first-mile transit',
      time: '3 min',
      nodeColor: '#64748B',
      trackColor: '#155DFC',
      trackStyle: 'solid'
    },
    {
      name: destName ? destName.split(',')[0].trim() : 'Destination',
      details: 'Arrive at doorstep',
      time: route.duration,
      nodeColor: '#155DFC',
      trackColor: null
    }
  ];
}

export default function ExploreScreen({ onNavigate, initialRouteQuery = null, onOpenVoice = null }) {
  const [activeTab, setActiveTab] = useState('transit');
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [amenitySearchQuery, setAmenitySearchQuery] = useState('');
  const [selectedAmenityCategory, setSelectedAmenityCategory] = useState('all');
  
  // Origin & Destination state (Reads detected location or initial query)
  const savedUserLoc = getSavedUserLocation();
  const [origin, setOrigin] = useState(initialRouteQuery?.origin || savedUserLoc?.name || '');
  const [originCoords, setOriginCoords] = useState(initialRouteQuery?.originCoords || savedUserLoc?.coords || null);
  const [destination, setDestination] = useState(initialRouteQuery?.destination || '');
  const [destinationCoords, setDestinationCoords] = useState(initialRouteQuery?.destinationCoords || null);
  const [isLiveGPS, setIsLiveGPS] = useState(Boolean(initialRouteQuery?.isLiveGPS || savedUserLoc?.isLiveGPS));
  const [isLocating, setIsLocating] = useState(false);

  // Search input & Autocomplete state
  const [originInput, setOriginInput] = useState(initialRouteQuery?.origin || savedUserLoc?.name || '');
  const [destInput, setDestInput] = useState(initialRouteQuery?.destination || '');
  const [activeSearchField, setActiveSearchField] = useState(null); // 'origin' | 'dest' | null
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  
  const [activeCity, setActiveCity] = useState('bengaluru');
  const [selectedRouteId, setSelectedRouteId] = useState('metro-bus');
  const [expandedRouteId, setExpandedRouteId] = useState('metro-bus');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [sheetDragDeltaY, setSheetDragDeltaY] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const sheetTouchStartY = useRef(null);
  const sheetTouchStartTime = useRef(0);
  const sheetTouchLastY = useRef(null);

  const handleSheetTouchStart = (e) => {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    sheetTouchStartY.current = clientY;
    sheetTouchLastY.current = clientY;
    sheetTouchStartTime.current = Date.now();
    setIsDraggingSheet(true);
    setSheetDragDeltaY(0);
  };

  const handleSheetTouchMove = (e) => {
    if (sheetTouchStartY.current === null) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    sheetTouchLastY.current = clientY;
    const rawDelta = clientY - sheetTouchStartY.current;
    
    // Apply rubber-band physics when dragging past the allowed direction
    let dampedDelta = rawDelta;
    if (!isBottomSheetExpanded) {
      // In collapsed mode: pulling UP is natural (rawDelta < 0). Cap upward pull to -120px
      if (rawDelta < 0) {
        dampedDelta = Math.max(-130, rawDelta);
      } else {
        dampedDelta = rawDelta * 0.15;
      }
    } else {
      // In expanded mode: pulling DOWN is natural (rawDelta > 0). Cap downward pull to 130px
      if (rawDelta > 0) {
        dampedDelta = Math.min(130, rawDelta);
      } else {
        dampedDelta = rawDelta * 0.15;
      }
    }
    setSheetDragDeltaY(dampedDelta);
  };

  const handleSheetTouchEnd = () => {
    if (sheetTouchStartY.current === null) return;
    const deltaY = (sheetTouchLastY.current ?? sheetTouchStartY.current) - sheetTouchStartY.current;
    const deltaTime = Math.max(1, Date.now() - sheetTouchStartTime.current);
    const velocity = deltaY / deltaTime; // px per millisecond

    setIsDraggingSheet(false);
    setSheetDragDeltaY(0);
    sheetTouchStartY.current = null;
    sheetTouchLastY.current = null;

    if (!isBottomSheetExpanded) {
      // Pull up by > 35px or flick upward
      if (deltaY < -35 || velocity < -0.25) {
        setIsBottomSheetExpanded(true);
      }
    } else {
      // Pull down by > 35px or flick downward
      if (deltaY > 35 || velocity > 0.25) {
        setIsBottomSheetExpanded(false);
      }
    }
  };

  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialRouteQuery?.destination));

  // Handle incoming initialRouteQuery changes dynamically
  useEffect(() => {
    if (initialRouteQuery) {
      if (initialRouteQuery.origin) {
        setOrigin(initialRouteQuery.origin);
        setOriginInput(initialRouteQuery.origin);
      }
      if (initialRouteQuery.originCoords) {
        setOriginCoords(initialRouteQuery.originCoords);
      }
      if (initialRouteQuery.destination) {
        setDestination(initialRouteQuery.destination);
        setDestInput(initialRouteQuery.destination);
        setHasSearched(true);
      }
      if (initialRouteQuery.destinationCoords) {
        setDestinationCoords(initialRouteQuery.destinationCoords);
      }
      setActiveTab('transit');
    }
  }, [initialRouteQuery]);

  // Switch active city and reset any stale search route from previous city
  const handleCityChange = (newCity) => {
    setActiveCity(newCity);
    setOrigin('');
    setOriginInput('');
    setOriginCoords(null);
    setDestination('');
    setDestInput('');
    setDestinationCoords(null);
    setIsLiveGPS(false);
    setHasSearched(false);
  };

  // Ticket Purchase Modal state
  const [purchasingRoute, setPurchasingRoute] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [purchasedTicket, setPurchasedTicket] = useState(null);
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  // Live GPS Fetcher
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setOriginCoords([lat, lng]);
        setIsLiveGPS(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const areaName = data.address?.suburb || data.address?.neighbourhood || data.address?.road || data.address?.city_district || data.address?.city || "Current Location";
          const formatted = `📍 ${areaName} (GPS)`;
          setOrigin(formatted);
          setOriginInput(formatted);
        } catch {
          const fallback = `📍 Live GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setOrigin(fallback);
          setOriginInput(fallback);
        }
        setIsLocating(false);
        setActiveSearchField(null);
      },
      (err) => {
        setIsLocating(false);
        alert("Unable to fetch GPS position. Please check location permissions in your browser/device settings.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Swap Origin and Destination
  const handleSwapLocations = () => {
    const tempName = origin;
    const tempCoords = originCoords;
    setOrigin(destination);
    setOriginInput(destination);
    setOriginCoords(destinationCoords);

    setDestination(tempName);
    setDestInput(tempName);
    setDestinationCoords(tempCoords);
    setIsLiveGPS(false);
  };

  // Debounced API search via OpenStreetMap Nominatim
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (field, text) => {
    if (field === 'origin') setOriginInput(text);
    else {
      setDestInput(text);
      if (!text) {
        setDestination('');
        setHasSearched(false);
      }
    }
    setActiveSearchField(field);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!text || text.length < 2) {
      setApiSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingApi(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=in&limit=4`
        );
        const data = await res.json();
        const formatted = (data || []).map(item => ({
          name: item.display_name.split(',').slice(0, 2).join(', '),
          category: item.type || 'Location',
          coords: [parseFloat(item.lat), parseFloat(item.lon)]
        }));
        setApiSuggestions(formatted);
      } catch {
        setApiSuggestions([]);
      } finally {
        setIsSearchingApi(false);
      }
    }, 400);
  };

  // Selecting a location from suggestions
  const handleSelectLocation = (loc, field) => {
    if (field === 'origin') {
      setOrigin(loc.name);
      setOriginInput(loc.name);
      setOriginCoords(loc.coords);
      setIsLiveGPS(false);
    } else {
      setDestination(loc.name);
      setDestInput(loc.name);
      setDestinationCoords(loc.coords);
      if (!origin && !originInput) {
        handleUseGPS();
      }
    }
    setActiveSearchField(null);
    setApiSuggestions([]);
  };

  const handleSearchSubmit = () => {
    const finalDest = (destInput || destination || '').trim();
    if (!finalDest) {
      setActiveSearchField('dest');
      return;
    }
    setDestination(finalDest);
    setDestInput(finalDest);

    if (!origin && !originInput) {
      handleUseGPS();
    }
    setActiveSearchField(null);
    setHasSearched(true);
  };

  // Filter combined local + API suggestions
  const currentQuery = activeSearchField === 'origin' ? originInput : destInput;
  const filteredLocalHotspots = useMemo(() => {
    if (!currentQuery) return POPULAR_LOCATIONS.slice(0, 6);
    return POPULAR_LOCATIONS.filter(l =>
      l.name.toLowerCase().includes(currentQuery.toLowerCase())
    );
  }, [currentQuery]);

  /* ============= DYNAMIC MULTI-MODAL ROUTE CALCULATOR VIA GROUND METRO SERVICE ============= */
  const routesData = useMemo(() => {
    // Only calculate routes after selecting start point and destination
    if (!hasSearched || !destination || !destination.trim()) {
      return [];
    }

    const origC = originCoords || (activeCity === 'bengaluru' ? [12.9757, 77.5729] : [28.6328, 77.2197]);
    const destC = destinationCoords || (activeCity === 'bengaluru' ? [12.9972, 77.7583] : [28.4950, 77.0895]);
    const origN = origin || (activeCity === 'bengaluru' ? 'Majestic' : 'Rajiv Chowk');
    const destN = destination.trim();

    const calculated = planSmartTransitRoute(origC, destC, origN, destN);
    return calculated.map(r => ({
      ...r,
      duration: r.id.includes('metro') ? '52 min' : (r.id.includes('bus') ? '79 min' : r.duration),
      distance: r.distance || '17.5 km',
      fare: r.id.includes('metro') ? '₹35' : r.fare,
      tagline: r.id.includes('metro') ? 'Metro + feeder' : (r.tagline || 'Direct bus'),
      modes: (r.modes || []).map(m => ({
        ...m,
        icon: getModeIcon(m.type)
      }))
    }));
  }, [originCoords, destinationCoords, origin, destination, hasSearched, activeCity]);

  const currentSelectedRoute = (routesData && routesData.length > 0) 
    ? (routesData.find(r => r.id === selectedRouteId) || routesData[0]) 
    : null;

  /* ============= AMENITY DATA ============= */
  const amenityCategories = [
    { id: 'all', label: 'All', icon: null },
    { id: 'restrooms', label: 'Restrooms', icon: RestroomIcon },
    { id: 'water', label: 'Water', icon: WaterIcon },
    { id: 'ev', label: 'EV', icon: EvIcon },
    { id: 'lockers', label: 'Lockers', icon: LockerIcon }
  ];

  const amenities = [
    {
      id: 'restroom',
      category: 'restrooms',
      IconComponent: RestroomIcon,
      title: 'Public restrooms',
      subtitle: 'Clean, touchless facilities',
      rating: '4.7',
      price: '₹5 / entry',
      priceSubtext: 'Free for senior citizens',
      viewLocationsText: 'View locations',
      spotsCount: '3 spots',
      spots: [
        { name: 'Shivaji Stadium Metro Concourse', distance: '0.2 km', status: 'Clean & Open 24/7' },
        { name: 'Inner Circle Block C Plaza', distance: '0.5 km', status: 'Wheelchair Accessible' },
        { name: 'Central Park Gate 2 Pavilion', distance: '0.8 km', status: 'Touchless & Sanitized' }
      ]
    },
    {
      id: 'water',
      category: 'water',
      IconComponent: WaterIcon,
      title: 'Drinking water',
      subtitle: 'RO purified • Chilled',
      rating: '4.9',
      price: '₹1 / litre',
      priceSubtext: 'Bring your bottle',
      viewLocationsText: 'View locations',
      spotsCount: '3 spots',
      spots: [
        { name: 'Water ATM #14 - Shivaji Metro Gate 3', distance: '0.2 km', status: 'Chilled RO Water Active' },
        { name: 'Smart Hydration Hub - Regal Cinema', distance: '0.4 km', status: 'Free Refill Station' },
        { name: 'Palika Kendra Water Point', distance: '0.7 km', status: 'UV & RO Purified' }
      ]
    },
    {
      id: 'ev',
      category: 'ev',
      IconComponent: EvIcon,
      title: 'EV charging',
      subtitle: 'DC 60kW+ • CCS2 / Type 2',
      rating: '4.8',
      price: '₹14 / kWh',
      priceSubtext: 'Reservation available',
      viewLocationsText: 'View locations',
      spotsCount: '3 spots',
      spots: [
        { name: 'Central Plaza EV Hub - Level B2', distance: '0.4 km', status: '3/4 Bays Available (60kW DC)' },
        { name: 'Civic Centre Fast Charger Lot', distance: '0.9 km', status: '2/2 Fast Guns Open' },
        { name: 'Connaught Circle Supercharger Deck', distance: '1.2 km', status: '120kW Ultra Fast Active' }
      ]
    },
    {
      id: 'lockers',
      category: 'lockers',
      IconComponent: LockerIcon,
      title: 'Luggage lockers',
      subtitle: 'OTP / QR access • CCTV',
      rating: '4.9',
      price: '₹20 / 3 hours',
      priceSubtext: '',
      viewLocationsText: 'View locations',
      spotsCount: '3 spots',
      spots: [
        { name: 'Metro Deck P1 Smart Lockers', distance: '0.4 km', status: '12 Small / 8 Large Free' },
        { name: 'Central Plaza Tourist Locker Hub', distance: '0.7 km', status: 'Biometric Access Active' },
        { name: 'Shivaji Bus Terminal Locker Bay', distance: '1.0 km', status: 'Guaranteed 24h Hold' }
      ]
    }
  ];

  const filteredAmenities = useMemo(() => {
    return amenities.filter((item) => {
      const q = amenitySearchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.spots.some(s => s.name.toLowerCase().includes(q));
      if (!matchesSearch) return false;
      if (selectedAmenityCategory === 'all') return true;
      return item.category === selectedAmenityCategory;
    });
  }, [amenities, amenitySearchQuery, selectedAmenityCategory]);

  const handleOpenPurchase = (e, route) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const parsedFare = parseFloat(String(route?.fare || '35').replace(/[^0-9.]/g, '')) || 35;
    setPurchasingRoute({
      ...route,
      fareNum: route?.fareNum || parsedFare
    });
    setPassengerCount(1);
    setPurchasedTicket(null);
  };

  const handleConfirmPurchase = () => {
    setIsProcessingPay(true);
    setTimeout(() => {
      setIsProcessingPay(false);
      setPurchasedTicket({
        ticketId: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
        route: purchasingRoute.title,
        from: origin,
        to: destination,
        passengers: passengerCount,
        totalFare: (purchasingRoute.fareNum * passengerCount).toFixed(2),
        validUntil: 'Today, 11:59 PM'
      });
    }, 800);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] overflow-hidden flex flex-col font-sans antialiased text-[#101828] relative">

      {/* FULLSCREEN / EXPANDED LIVE TRANSIT ROUTE VIEW */}
      {isMapFullscreen && (
        <div className="absolute inset-0 z-40 bg-white flex flex-col w-full h-full animate-in fade-in duration-200">
          
          {/* 1. COMPACT TOP APP BAR (~38px) */}
          <div className="bg-white px-3.5 py-1.5 border-b border-gray-100 flex items-center justify-between z-20 shrink-0 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMapFullscreen(false)}
                className="text-gray-800 hover:text-gray-900 p-1 -ml-1 transition-transform active:scale-90 cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.4]" />
              </button>
              <div>
                <h2 className="text-xs font-bold text-gray-900 tracking-tight leading-tight">
                  {hasSearched && destination ? 'Your route' : 'Transit Map'}
                </h2>
                <p className="text-[10px] text-gray-400 font-medium leading-none">
                  {hasSearched && destination 
                    ? (activeCity === 'bengaluru' ? 'Bengaluru' : 'Delhi NCR')
                    : (activeCity === 'bengaluru' ? 'Namma Metro Network • Bengaluru' : 'Delhi Metro Network • Delhi NCR')}
                </p>
              </div>
            </div>

            {hasSearched && destination && (
              <button
                onClick={() => {
                  const orig = encodeURIComponent(origin || (activeCity === 'bengaluru' ? 'Majestic' : 'Rajiv Chowk'));
                  const dest = encodeURIComponent(destination);
                  window.open(`https://www.google.com/maps/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=transit`, '_blank', 'noopener,noreferrer');
                }}
                className="text-[#155DFC] hover:text-blue-700 p-1 transition-transform active:scale-95 cursor-pointer"
                aria-label="Open in Google Maps"
              >
                <ExternalLink className="w-4 h-4 stroke-[2]" />
              </button>
            )}
          </div>

          {/* 2. COMPACT HORIZONTAL ROUTE SELECTOR CARDS (~48px) - Only shown after selecting destination */}
          {hasSearched && destination && routesData.length > 0 && (
            <div className="bg-white px-3 py-1.5 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar z-20 shrink-0">
              {routesData.map((route) => {
                const isSelected = route.id === selectedRouteId;
                const isMetro = route.id.includes('metro');
                return (
                  <button
                    key={route.id}
                    onClick={() => {
                      setSelectedRouteId(route.id);
                      setExpandedRouteId(route.id);
                    }}
                    className={`py-1.5 px-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 min-w-[155px] text-left active:scale-[0.98] ${
                      isSelected
                        ? 'border-2 border-[#155DFC] bg-[#EEF4FF] shadow-2xs'
                        : 'border border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? (isMetro ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isMetro ? (
                        <TrainFront className="w-3.5 h-3.5 stroke-[2.2]" />
                      ) : (
                        <BusFront className="w-3.5 h-3.5 stroke-[2.2]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-[10px] font-semibold truncate leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {route.id.includes('metro') ? 'Direct Metro + Feeder' : (route.title || 'Direct Arterial City Bus')}
                      </div>
                      <div className={`text-sm font-black tracking-tight mt-0.5 ${isSelected ? 'text-[#155DFC]' : 'text-gray-900'}`}>
                        {route.id.includes('metro') ? '52 min' : (route.id.includes('bus') ? '79 min' : route.duration)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. FULL MAP CANVAS (70% SCREEN RATIO) */}
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <TransitRouteMap
              origin={origin}
              destination={hasSearched ? destination : ''}
              originCoords={originCoords}
              destinationCoords={hasSearched ? destinationCoords : null}
              isLiveGPS={isLiveGPS}
              selectedRoute={hasSearched && destination ? currentSelectedRoute : null}
              allRoutes={hasSearched && destination ? routesData : []}
              onSelectRoute={(r) => setSelectedRouteId(r.id)}
              activeCity={activeCity}
              onCityChange={handleCityChange}
              onSelectStationAsOrigin={(stn) => {
                setOrigin(stn.name);
                setOriginInput(stn.name);
                setOriginCoords(stn.coords);
                setIsLiveGPS(false);
              }}
              onSelectStationAsDest={(stn) => {
                setDestination(stn.name);
                setDestInput(stn.name);
                setDestinationCoords(stn.coords);
                setHasSearched(true);
              }}
              isFullscreen={true}
              isRouteFocusView={Boolean(hasSearched && destination)}
              onToggleFullscreen={() => setIsMapFullscreen(false)}
              className="w-full h-full rounded-none border-0"
            />
          </div>

          {/* Prompt when map is expanded without destination */}
          {(!hasSearched || !destination) && (
            <div className="absolute bottom-5 left-4 right-4 z-30 pointer-events-none flex justify-center">
              <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-gray-200/90 pointer-events-auto flex items-center gap-3 max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#155DFC] flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 leading-tight">No destination selected</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight">Tap any station to route, or return to search</p>
                </div>
                <button
                  onClick={() => setIsMapFullscreen(false)}
                  className="px-3 py-1.5 bg-[#155DFC] hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shrink-0 active:scale-95 transition-transform cursor-pointer shadow-xs"
                >
                  Search
                </button>
              </div>
            </div>
          )}

          {/* 4. EXPANDABLE PULL-UP BOTTOM SHEET (Only shown after selecting start point and destination) */}
          {hasSearched && destination && currentSelectedRoute && (
          <div 
            onTouchStart={handleSheetTouchStart}
            onTouchMove={handleSheetTouchMove}
            onTouchEnd={handleSheetTouchEnd}
            onTouchCancel={handleSheetTouchEnd}
            onMouseDown={handleSheetTouchStart}
            onMouseMove={(e) => {
              if (isDraggingSheet) handleSheetTouchMove(e);
            }}
            onMouseUp={handleSheetTouchEnd}
            onMouseLeave={() => {
              if (isDraggingSheet) handleSheetTouchEnd();
            }}
            style={{
              transform: isDraggingSheet ? `translateY(${sheetDragDeltaY}px)` : 'translateY(0px)',
              transition: isDraggingSheet 
                ? 'none' 
                : 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), max-height 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
              touchAction: 'none'
            }}
            className={`bg-white rounded-t-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.12)] border-t border-gray-100 px-4 pt-1.5 z-30 shrink-0 flex flex-col select-none ${
              isBottomSheetExpanded
                ? 'max-h-[50%] pb-3.5 overflow-hidden' 
                : 'max-h-[205px] pb-2.5'
            }`}
          >
            {/* Drag Handle Bar & Pull Indicator (Tap or Drag to Pull Up) */}
            <div
              onClick={() => setIsBottomSheetExpanded(prev => !prev)}
              className="w-full flex flex-col items-center justify-center py-1 cursor-pointer group active:opacity-75 -mt-0.5 select-none"
              aria-label={isBottomSheetExpanded ? "Collapse route details" : "Pull up route details"}
            >
              <div className={`h-1.5 bg-gray-300 group-hover:bg-gray-400 rounded-full transition-all duration-300 mb-1 ${
                isDraggingSheet ? 'w-14 bg-blue-500 scale-105' : 'w-10'
              }`} />
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">
                {isBottomSheetExpanded ? (
                  <>
                    <span>Swipe down to map</span>
                    <ChevronDown className="w-3 h-3 transition-transform duration-300" />
                  </>
                ) : (
                  <>
                    <span>Pull up for stops & ticket</span>
                    <ChevronUp className="w-3 h-3 transition-transform duration-300" />
                  </>
                )}
              </div>
            </div>

            {/* Duration and Tagline Header */}
            <div 
              onClick={() => setIsBottomSheetExpanded(prev => !prev)}
              className="flex items-center justify-between mb-1.5 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-gray-900 tracking-tight leading-none">
                  {currentSelectedRoute?.duration || '52 min'}
                </span>
                <span className="text-gray-300 font-light select-none text-base">|</span>
                <span className="text-xs font-semibold text-gray-600">
                  {currentSelectedRoute?.tagline || currentSelectedRoute?.badge || 'Metro + feeder'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full px-2 py-0.5 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Low crowding</span>
              </div>
            </div>

            {/* Modes Breakdown Chips Row (Walk → Purple Line → Feeder) */}
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-2 shrink-0">
              {getRouteModesBreakdown(currentSelectedRoute || routesData[0]).map((m, mIdx, arr) => {
                const Icon = m.icon;
                return (
                  <React.Fragment key={mIdx}>
                    <div className="flex items-center gap-1 shrink-0">
                      <Icon className={`w-3 h-3 ${m.color} stroke-[2.2]`} />
                      <span className={`text-[10px] ${m.isBold ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {m.label}
                      </span>
                    </div>
                    {mIdx < arr.length - 1 && (
                      <ArrowRight className="w-2.5 h-2.5 text-gray-400 shrink-0 stroke-[2]" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* EXPANDED CONTENT (Revealed when user pulls up the card) */}
            {isBottomSheetExpanded ? (
              <div 
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5 pb-1 animate-in fade-in duration-200"
              >
                {/* Full Stations / Stops Timeline (Matching previous screen) */}
                <div className="border-t border-gray-100 pt-2.5">
                  <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Journey Itinerary & Transfers
                  </div>
                  <div className="space-y-0 pl-1">
                    {getRouteTimeline(currentSelectedRoute || routesData[0], origin, destination).map((st, idx, arr) => {
                      const isLast = idx === arr.length - 1;
                      return (
                        <div key={idx} className="flex items-start gap-3 relative">
                          <div className="flex flex-col items-center shrink-0 w-3.5">
                            <div 
                              className="w-3 h-3 rounded-full bg-white border-2 shrink-0 z-10 my-0.5 shadow-2xs"
                              style={{ borderColor: st.nodeColor }}
                            />
                            {!isLast && (
                              <div 
                                className={`w-0.5 flex-1 min-h-[34px] ${
                                  st.trackStyle === 'dashed' ? 'border-l-2 border-dashed' : ''
                                }`}
                                style={{
                                  backgroundColor: st.trackStyle === 'dashed' ? 'transparent' : st.trackColor,
                                  borderColor: st.trackColor
                                }}
                              />
                            )}
                          </div>

                          <div className={`flex-1 min-w-0 flex items-start justify-between ${!isLast ? 'pb-3' : 'pb-1'}`}>
                            <div className="min-w-0 pr-2">
                              <h4 className="text-xs font-bold text-gray-900 leading-tight">
                                {st.name}
                              </h4>
                              <p className="text-[11px] text-gray-500 font-medium mt-0.5 leading-snug">
                                {st.details}
                              </p>
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap shrink-0 mt-0.5">
                              {st.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Full Action Buttons (Matching previous screen) */}
                <div className="pt-2 space-y-2 sticky bottom-0 bg-white pb-1">
                  <button
                    onClick={(e) => {
                      handleOpenPurchase(e, currentSelectedRoute || routesData[0]);
                    }}
                    className="w-full py-2.5 bg-[#155DFC] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Buy ticket • {currentSelectedRoute?.fare || '₹35'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const orig = encodeURIComponent(origin || (activeCity === 'bengaluru' ? 'Majestic' : 'Rajiv Chowk'));
                      const dest = encodeURIComponent(destination || (activeCity === 'bengaluru' ? 'Whitefield' : 'Cyber City'));
                      window.open(`https://www.google.com/maps/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=transit`, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full py-2 hover:bg-blue-50/70 text-[#155DFC] border border-blue-200/80 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Open in Google Maps</span>
                  </button>
                </div>
              </div>
            ) : (
              /* COMPACT PEEK VIEW (Clean preview - pull up to view stops, book ticket, and open Google Maps) */
              <div 
                onClick={() => setIsBottomSheetExpanded(true)}
                className="space-y-0 pl-0.5 cursor-pointer pb-0.5"
              >
                {/* Origin station */}
                <div className="flex items-start gap-2 relative">
                  <div className="flex flex-col items-center shrink-0 w-2.5 pt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-emerald-500 shrink-0" />
                    <div className="w-0.5 h-3 bg-gray-300 my-0.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 leading-tight">
                      {origin ? origin.split('(')[0].trim() : (activeCity === 'bengaluru' ? 'Majestic' : 'Rajiv Chowk')}
                    </div>
                    <div className="text-[9px] text-gray-400 font-medium leading-tight">
                      {activeCity === 'bengaluru' ? 'Nadaprabhu Kempegowda' : 'Connaught Place'}
                    </div>
                  </div>
                </div>

                {/* Destination station */}
                <div className="flex items-start gap-2 relative">
                  <div className="flex flex-col items-center shrink-0 w-2.5 pt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-rose-500 bg-white shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 leading-tight">
                      {destination ? destination.split(',')[0].trim() : 'Destination'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

        </div>
      )}



      {/* 2. HEADER */}
      <div className="bg-white px-5 pt-4 sm:pt-5 pb-3.5 border-b border-gray-100 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Explore</h1>
            <p className="text-xs text-gray-500 font-medium">
              {activeTab === 'transit' ? 'Plan your city journey' : 'Your city, within reach.'}
            </p>
          </div>

          {/* Voice Assistant Launcher in Header */}
          <button
            onClick={onOpenVoice || (() => alert('Voice Assistant activated'))}
            className="px-3.5 py-1.5 bg-[#155DFC] hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>
        </div>

        {/* TAB TOGGLE */}
        <div className="flex mt-3 bg-[#F2F4F7] rounded-2xl p-1 border border-gray-200/50">
          <button
            onClick={() => setActiveTab('transit')}
            className={`flex-1 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              activeTab === 'transit'
                ? 'bg-[#155DFC] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Transit & routes
          </button>
          <button
            onClick={() => setActiveTab('amenities')}
            className={`flex-1 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              activeTab === 'amenities'
                ? 'bg-[#155DFC] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            City amenities
          </button>
        </div>
      </div>

      {/* 3. MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar">

        {/* ============== TAB A: TRANSIT & ROUTES ============== */}
        {activeTab === 'transit' && (
          <div className="px-5 pt-3.5 pb-8">
            
            {/* JOURNEY PLANNER SEARCH CARD */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-4 mb-3.5 relative">
              <div className="flex items-center gap-3">
                {/* Visual Route Indicators with dotted line */}
                <div className="flex flex-col items-center justify-between self-stretch py-1">
                  {/* Origin Ring */}
                  <div className="w-7 h-7 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#155DFC] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#155DFC]" />
                    </div>
                  </div>

                  {/* Dotted Vertical Connector Line */}
                  <div className="w-0.5 flex-1 min-h-[20px] border-l-2 border-dotted border-gray-300 my-1" />

                  {/* Destination Pin */}
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/30" />
                  </div>
                </div>

                {/* Right Column: Inputs */}
                <div className="flex-1 min-w-0">
                  {/* From (Origin) Row */}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-gray-500 font-medium">From</label>
                      <button
                        onClick={handleUseGPS}
                        disabled={isLocating}
                        className="bg-blue-50/80 hover:bg-blue-100 text-[#155DFC] border border-blue-100/80 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                      >
                        <LocateFixed className="w-3 h-3 text-[#155DFC]" />
                        <span>{isLocating ? 'Locating...' : 'Use GPS'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={originInput}
                      onChange={(e) => handleSearchChange('origin', e.target.value)}
                      onFocus={() => setActiveSearchField('origin')}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
                      placeholder="Starting point"
                      className="w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-transparent focus:outline-none py-1 truncate"
                    />
                  </div>

                  {/* Divider with Swap Button */}
                  <div className="relative my-1 flex items-center">
                    <div className="h-px bg-gray-100 flex-1" />
                    <button
                      onClick={handleSwapLocations}
                      title="Swap Locations"
                      className="ml-2 w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-700 flex items-center justify-center shadow-2xs active:scale-90 transition-all cursor-pointer shrink-0"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* To (Destination) Row */}
                  <div className="relative">
                    <label className="text-[11px] text-gray-500 font-medium block">To</label>
                    <input
                      type="text"
                      value={destInput}
                      onChange={(e) => handleSearchChange('dest', e.target.value)}
                      onFocus={() => setActiveSearchField('dest')}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
                      placeholder="Where to?"
                      className="w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal bg-transparent focus:outline-none py-1 truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Find Route Button */}
              <button
                onClick={handleSearchSubmit}
                className="w-full py-3 bg-[#155DFC] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <span>Find Route</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Destination Location Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mt-3 pt-0.5">
                {(activeCity === 'bengaluru'
                  ? [
                      { name: 'Majestic', fullName: 'Nadaprabhu Kempegowda Majestic', coords: [12.9757, 77.5729] },
                      { name: 'Indiranagar', fullName: 'Indiranagar (100ft Road)', coords: [12.9783, 77.6408] },
                      { name: 'Whitefield', fullName: 'Whitefield (Kadugodi Metro)', coords: [12.9972, 77.7583] }
                    ]
                  : [
                      { name: 'Rajiv Chowk', fullName: 'Connaught Place (Rajiv Chowk)', coords: [28.6328, 77.2197] },
                      { name: 'Hauz Khas', fullName: 'Hauz Khas Village', coords: [28.5432, 77.2065] },
                      { name: 'Cyber City', fullName: 'Cyber City (DLF Phase 2)', coords: [28.4950, 77.0895] }
                    ]
                ).map((dest, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDestination(dest.fullName);
                      setDestInput(dest.fullName);
                      setDestinationCoords(dest.coords);
                      setHasSearched(true);
                      if (!origin && !originInput) {
                        handleUseGPS();
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap shadow-2xs transition-all shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-gray-400 stroke-[1.8]" />
                    <span>{dest.name}</span>
                  </button>
                ))}
              </div>

              {/* AUTOCOMPLETE POPUP DROPDOWN */}
              {activeSearchField && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {activeSearchField === 'origin' ? 'Select Origin Location' : 'Select Destination'}
                    </span>
                    <button
                      onClick={() => setActiveSearchField(null)}
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* GPS Option for Origin */}
                  {activeSearchField === 'origin' && (
                    <button
                      onClick={handleUseGPS}
                      className="w-full p-2.5 px-3 hover:bg-blue-50/70 border-b border-gray-100 flex items-center gap-2.5 text-left transition-all cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <LocateFixed className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-700">Use My Current Location</div>
                        <div className="text-[10px] text-gray-400">Fetch live GPS coordinates from phone/browser</div>
                      </div>
                    </button>
                  )}

                  {/* Custom typed location selection if no exact match */}
                  {currentQuery && currentQuery.trim().length > 0 && (
                    <button
                      onClick={() => handleSelectLocation({ name: currentQuery, category: 'Custom Place', coords: [28.5500 + Math.random() * 0.05, 77.1500 + Math.random() * 0.05] }, activeSearchField)}
                      className="w-full p-2.5 px-3 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2.5 text-left transition-all cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 truncate">
                        <div className="text-xs font-bold text-gray-900 truncate">Search for "{currentQuery}"</div>
                        <div className="text-[10px] text-gray-400">Search with Google Maps Transit</div>
                      </div>
                    </button>
                  )}

                  {/* Local Hotspots suggestions */}
                  <div className="py-1">
                    {filteredLocalHotspots.map((loc, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectLocation(loc, activeSearchField)}
                        className="w-full p-2 px-3 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-bold text-gray-900 truncate">{loc.name}</div>
                            <div className="text-[9px] text-gray-400 truncate">{loc.category}</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-blue-600 shrink-0 bg-blue-50 px-1.5 py-0.5 rounded">
                          Select
                        </span>
                      </button>
                    ))}

                    {/* Live Nominatim API results */}
                    {isSearchingApi && (
                      <div className="p-2.5 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching places across India...</span>
                      </div>
                    )}
                    {apiSuggestions.map((item, idx) => (
                      <button
                        key={`api-${idx}`}
                        onClick={() => handleSelectLocation(item, activeSearchField)}
                        className="w-full p-2 px-3 hover:bg-emerald-50/50 border-t border-gray-50 flex items-center justify-between text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-bold text-gray-900 truncate">{item.name}</div>
                            <div className="text-[9px] text-emerald-700 truncate">{item.category}</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Place
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* LIVE EMBEDDED GOOGLE MAPS VIEW */}
            <div className="mb-3.5">
              <TransitRouteMap
                origin={origin}
                destination={destination}
                originCoords={originCoords}
                destinationCoords={destinationCoords}
                isLiveGPS={isLiveGPS}
                selectedRoute={currentSelectedRoute}
                allRoutes={routesData}
                onSelectRoute={(r) => setSelectedRouteId(r.id)}
                activeCity={activeCity}
                onCityChange={handleCityChange}
                onSelectStationAsOrigin={(stn) => {
                  setOrigin(stn.name);
                  setOriginInput(stn.name);
                  setOriginCoords(stn.coords);
                  setIsLiveGPS(false);
                }}
                onSelectStationAsDest={(stn) => {
                  setDestination(stn.name);
                  setDestInput(stn.name);
                  setDestinationCoords(stn.coords);
                  setHasSearched(true);
                }}
                isFullscreen={isMapFullscreen}
                onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
                className="w-full h-64"
              />

              {/* ACTION BUTTON ROW BELOW MAP (WHEN ROUTE ACTIVE) */}
              {origin && destination && (
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (isVoiceSpeaking) {
                        stopSpeaking();
                        setIsVoiceSpeaking(false);
                      } else {
                        setIsVoiceSpeaking(true);
                        const selected = currentSelectedRoute || routesData[0];
                        const speechText = `Here is your best route from ${origin} to ${destination}. Take ${selected.title}. Total travel time is ${selected.duration}, covering ${selected.distance}, with estimated fare of ${selected.fare}. Key steps: ${selected.steps.map(s => s.instruction).join('. ')}. Have a safe journey!`;
                        speakAloud(speechText, () => setIsVoiceSpeaking(false));
                      }
                    }}
                    className={`font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
                      isVoiceSpeaking
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {isVoiceSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Read Route Aloud</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const orig = encodeURIComponent(origin || 'Current Location');
                      const dest = encodeURIComponent(destination);
                      window.open(`https://www.google.com/maps/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=transit`, '_blank', 'noopener,noreferrer');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* METRO NETWORK & GUIDANCE CARD (Visible before searching; hides once user clicks Find Route) */}
            {!hasSearched && (
              <div className="space-y-3 mb-3.5 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                      <TrainFront className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {activeCity === 'bengaluru' ? 'Namma Metro Lines' : 'Delhi Metro Lines'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {activeCity === 'bengaluru' ? (
                      <>
                        <div className="p-3 rounded-2xl border border-gray-100 bg-white shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA] shrink-0" />
                            <span className="text-xs font-bold text-gray-900 truncate">Purple Line</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium mt-1 truncate">
                            Whitefield ↔ Challaghatta
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl border border-gray-100 bg-white shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0" />
                            <span className="text-xs font-bold text-gray-900 truncate">Green Line</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium mt-1 truncate">
                            Madavara ↔ Silk Institute
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 rounded-2xl border border-gray-100 bg-white shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] shrink-0" />
                            <span className="text-xs font-bold text-gray-900 truncate">Yellow Line</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium mt-1 truncate">
                            Samaypur Badli ↔ Millennium City
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl border border-gray-100 bg-white shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
                            <span className="text-xs font-bold text-gray-900 truncate">Blue Line</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium mt-1 truncate">
                            Dwarka Sec 21 ↔ Noida Electronic City
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-dashed border-gray-200 bg-white/70 p-4 text-center">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#155DFC] flex items-center justify-center mx-auto mb-2">
                    <Navigation className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mb-0.5">Where do you want to go?</h4>
                  <p className="text-[11px] text-gray-500 max-w-[240px] mx-auto">
                    Type your destination above or pick a quick station, then tap <span className="font-bold text-[#155DFC]">Find Route</span> to see options.
                  </p>
                </div>
              </div>
            )}

            {/* ROUTE OPTIONS (EXPANDABLE) - Only displayed after clicking Find Route with a destination */}
            {hasSearched && (destination || destInput) && routesData.length > 0 && (
              <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Route Options
                  </h2>
                  <span className="text-xs font-bold text-blue-600">
                    {routesData.length} Routes
                  </span>
                </div>

                {routesData.map((route) => {
                  const isExpanded = expandedRouteId === route.id;
                  const modesBreakdown = getRouteModesBreakdown(route);
                  const timeline = getRouteTimeline(route, origin, destination);

                  return (
                    <div
                      key={route.id}
                      className={`bg-white rounded-3xl border transition-all overflow-hidden p-4 ${
                        isExpanded
                          ? 'border-gray-200/90 shadow-xs ring-1 ring-blue-500/10'
                          : 'border-gray-100 shadow-2xs hover:border-blue-100 cursor-pointer'
                      }`}
                    >
                      {/* TOP ROW: ICONS SEQUENCE + EXPAND CHEVRON */}
                      <div
                        onClick={() => {
                          setSelectedRouteId(route.id);
                          setIsMapFullscreen(true);
                        }}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          {modesBreakdown.map((m, mIdx) => {
                            const Icon = m.icon;
                            return (
                              <React.Fragment key={mIdx}>
                                <Icon className={`w-3.5 h-3.5 ${m.color} stroke-[2.2]`} />
                                {mIdx < modesBreakdown.length - 1 && (
                                  <ArrowRight className="w-2.5 h-2.5 text-gray-300 stroke-[2.5]" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRouteId(route.id);
                            setExpandedRouteId(isExpanded ? null : route.id);
                          }}
                          className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer transition-transform"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </button>
                      </div>

                      {/* TITLE & TAGLINE */}
                      <div
                        onClick={() => {
                          setSelectedRouteId(route.id);
                          setIsMapFullscreen(true);
                        }}
                        className="mt-2 cursor-pointer"
                      >
                        <h3 className="text-sm font-bold text-gray-900 tracking-tight leading-snug">
                          {route.id === 'metro-auto' ? 'Metro + Auto' : route.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {route.id === 'metro-auto' ? 'Doorstep drop' : (route.tagline || route.badge)}
                        </p>
                      </div>

                      {/* STATS ROW: TIME, DISTANCE & FARE */}
                      <div
                        onClick={() => {
                          setSelectedRouteId(route.id);
                          setIsMapFullscreen(true);
                        }}
                        className="flex items-center justify-between mt-2.5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 font-bold text-gray-900 text-xs">
                            <Clock className="w-3.5 h-3.5 text-gray-500 stroke-[2.2]" />
                            <span>{route.duration}</span>
                          </div>
                          <span className="text-gray-200 font-light select-none text-xs">|</span>
                          <span className="text-xs text-gray-400 font-medium">
                            {route.distance}
                          </span>
                        </div>

                        <div className="text-base font-bold text-[#155DFC] tracking-tight">
                          {route.fare}
                        </div>
                      </div>

                      {/* EXPANDED CONTENT (MATCHING MOCKUP COMPACTLY) */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in duration-200">
                          
                          {/* MODES CHIPS ROW */}
                          <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar pb-0.5">
                            {modesBreakdown.map((m, mIdx) => {
                              const Icon = m.icon;
                              return (
                                <React.Fragment key={mIdx}>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Icon className={`w-3 h-3 ${m.color} stroke-[2.2]`} />
                                    <span className={`text-[11px] ${m.isBold ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                      {m.label}
                                    </span>
                                  </div>
                                  {mIdx < modesBreakdown.length - 1 && (
                                    <ArrowRight className="w-2.5 h-2.5 text-gray-300 shrink-0 stroke-[2]" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          {/* STATUS & ON MAP ROW */}
                          <div className="flex items-center justify-between mt-2.5 mb-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span>Low crowding</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRouteId(route.id);
                                setIsMapFullscreen(true);
                              }}
                              className="text-xs font-bold text-[#155DFC] flex items-center gap-1 hover:underline cursor-pointer active:scale-95 transition-transform"
                            >
                              <Map className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>On map</span>
                            </button>
                          </div>

                          {/* VERTICAL TIMELINE OF STATIONS / WAYPOINTS */}
                          <div className="space-y-0 my-3 pl-0.5">
                            {timeline.map((st, idx) => {
                              const isLast = idx === timeline.length - 1;
                              return (
                                <div key={idx} className="flex items-start gap-3 relative">
                                  <div className="flex flex-col items-center shrink-0 w-3.5">
                                    <div 
                                      className="w-3 h-3 rounded-full bg-white border-2 shrink-0 z-10 my-0.5"
                                      style={{ borderColor: st.nodeColor }}
                                    />
                                    {!isLast && (
                                      <div 
                                        className={`w-0.5 flex-1 min-h-[30px] ${
                                          st.trackStyle === 'dashed' ? 'border-l-2 border-dashed' : ''
                                        }`}
                                        style={{
                                          backgroundColor: st.trackStyle === 'dashed' ? 'transparent' : st.trackColor,
                                          borderColor: st.trackColor
                                        }}
                                      />
                                    )}
                                  </div>

                                  <div className={`flex-1 min-w-0 flex items-start justify-between ${!isLast ? 'pb-3.5' : 'pb-0.5'}`}>
                                    <div className="min-w-0 pr-2">
                                      <h4 className="text-xs font-bold text-gray-900 leading-tight">
                                        {st.name}
                                      </h4>
                                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                        {st.details}
                                      </p>
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap shrink-0 mt-0.5">
                                      {st.time}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="pt-1.5 space-y-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPurchase(e, route);
                              }}
                              className="w-full py-2.5 bg-[#155DFC] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Ticket className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>Buy ticket • {route.fare}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const orig = encodeURIComponent(origin || 'Peenya');
                                const dest = encodeURIComponent(destination || 'Samitha Square');
                                window.open(`https://www.google.com/maps/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=transit`, '_blank', 'noopener,noreferrer');
                              }}
                              className="w-full py-1.5 hover:bg-blue-50/70 text-[#155DFC] font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>Open in Google Maps</span>
                            </button>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============== TAB B: CITY AMENITIES ============== */}
        {activeTab === 'amenities' && (
          <div className="px-5 pt-3.5 pb-5">
            {/* SEARCH AMENITIES BAR */}
            <div className="relative w-full mb-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={amenitySearchQuery}
                onChange={(e) => setAmenitySearchQuery(e.target.value)}
                placeholder="Search amenities"
                className="w-full bg-white rounded-2xl pl-10 pr-9 py-2.5 text-xs font-medium text-gray-900 placeholder:text-gray-400 border border-gray-200/80 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {amenitySearchQuery && (
                <button
                  onClick={() => setAmenitySearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {amenityCategories.map((cat) => {
                const isSel = selectedAmenityCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedAmenityCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0 ${
                      isSel
                        ? 'bg-[#155DFC] text-white shadow-xs font-semibold'
                        : 'bg-white border border-gray-200/90 text-gray-700 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    {Icon && <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-white' : 'text-[#155DFC]'}`} />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SECTION HEADING */}
            <h2 className="text-lg font-bold text-gray-900 mt-4 mb-3 tracking-tight">
              Nearby amenities
            </h2>

            {/* AMENITY CARDS LIST */}
            <div className="space-y-3.5">
              {filteredAmenities.map((amenity) => {
                const Icon = amenity.IconComponent;
                return (
                  <div
                    key={amenity.id}
                    onClick={() => setSelectedAmenity(amenity)}
                    className="bg-white rounded-3xl p-4 border border-gray-100 shadow-2xs hover:border-blue-100 transition-all cursor-pointer group"
                  >
                    {/* TOP ROW: ICON + TITLE + SUBTITLE + RATING */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-[#155DFC]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#155DFC] transition-colors leading-snug">
                            {amenity.title}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {amenity.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* RATING BADGE */}
                      <div className="flex items-center gap-1 bg-[#FFF9EB] px-2.5 py-1 rounded-full border border-amber-200/50 shrink-0">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-900">{amenity.rating}</span>
                      </div>
                    </div>

                    {/* DIVIDER */}
                    <div className="h-px bg-gray-100 my-3" />

                    {/* BOTTOM ROW: PRICE ON LEFT, VIEW LOCATIONS ON RIGHT */}
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {amenity.price}
                        </div>
                        {amenity.priceSubtext && (
                          <div className="text-xs text-gray-400 font-medium mt-0.5">
                            {amenity.priceSubtext}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#155DFC] flex items-center gap-0.5 justify-end group-hover:translate-x-0.5 transition-transform">
                          {amenity.viewLocationsText} <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                        <span className="text-xs text-gray-400 font-medium block mt-0.5">
                          {amenity.spotsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* TICKET PURCHASE BOTTOM SHEET / MODAL */}
      {purchasingRoute && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[85%] overflow-y-auto animate-in slide-in-from-bottom duration-300 border-t border-gray-200">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {purchasedTicket ? 'Active Digital Transit Ticket' : 'Purchase Transit Ticket'}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-medium">{purchasingRoute.title}</p>
                </div>
              </div>
              <button
                onClick={() => setPurchasingRoute(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If ticket is already purchased: Show live QR Pass */}
            {purchasedTicket ? (
              <div className="space-y-4 text-center py-2">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ticket Confirmed & Active</span>
                </div>

                {/* QR Code Container */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/90 inline-block shadow-inner">
                  <RealisticQRCode value={purchasedTicket.ticketId} size={150} className="mx-auto" />
                  <span className="font-mono text-xs font-bold text-gray-700 block mt-2 tracking-wider">
                    {purchasedTicket.ticketId}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Scan at Metro turnstiles & Bus scanners
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200/90 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Route:</span>
                    <span className="font-bold text-gray-900">{purchasedTicket.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Destination:</span>
                    <span className="font-bold text-gray-900">{purchasedTicket.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passengers:</span>
                    <span className="font-bold text-gray-900">{purchasedTicket.passengers} Adult(s)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-100">
                    <span className="text-gray-500">Total Paid:</span>
                    <span className="font-bold text-blue-700">₹{purchasedTicket.totalFare}</span>
                  </div>
                </div>

                <button
                  onClick={() => setPurchasingRoute(null)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Before Purchase: Passenger selector + payment */
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">From:</span>
                    <span className="font-bold text-gray-900">{origin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">To:</span>
                    <span className="font-bold text-gray-900">{destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Single Fare:</span>
                    <span className="font-bold text-gray-900">{purchasingRoute.fare}</span>
                  </div>
                </div>

                {/* Passenger Selector */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Passengers</span>
                    <span className="text-[10px] text-gray-400">Adult Single Trip</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center cursor-pointer active:scale-90"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-gray-900 w-4 text-center">{passengerCount}</span>
                    <button
                      onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center cursor-pointer active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Payment Source: In-App Wallet */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">SAJAG Smart Wallet</span>
                      <span className="text-[10px] text-gray-500">Available Balance: ₹840</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Auto Deduct</span>
                </div>

                {/* Total Fare & Purchase Button */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-gray-600">Total Amount:</span>
                    <span className="text-base font-black text-gray-900">
                      ₹{(purchasingRoute.fareNum * passengerCount).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleConfirmPurchase}
                    disabled={isProcessingPay}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingPay ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Ticket QR...</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>Pay & Generate Instant QR Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AMENITY DETAILS BOTTOM SHEET */}
      {selectedAmenity && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[75%] overflow-y-auto animate-in slide-in-from-bottom duration-300 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50/80 border border-blue-100/70 flex items-center justify-center shrink-0">
                  {React.createElement(selectedAmenity.IconComponent, { className: 'w-5 h-5 text-[#155DFC]' })}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedAmenity.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">{selectedAmenity.price}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAmenity(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nearest 3 Locations</h4>
              {selectedAmenity.spots.map((spot, idx) => (
                <div key={idx} className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">{spot.name}</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">{spot.status}</p>
                    <span className="text-[10px] font-bold text-blue-600 mt-1 inline-block">{spot.distance} away</span>
                  </div>
                  <button
                    onClick={() => {
                      alert(`Navigating to ${spot.name}`);
                      setSelectedAmenity(null);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Navigate</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



    </div>
  );
}



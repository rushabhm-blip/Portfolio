import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Wallet, 
  Award, 
  Leaf, 
  Navigation, 
  CircleParking, 
  QrCode, 
  Clock, 
  AlertTriangle, 
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  TrainFront,
  BusFront,
  ArrowRight,
  CheckCircle2,
  Ticket,
  MapPin,
  Mic,
  Loader2,
  LocateFixed,
  Search,
  Check,
  Crosshair
} from 'lucide-react';
import WaveHandIcon from '../icons/WaveHandIcon';
import TransitTicketCard from '../common/TransitTicketCard';
import RealisticQRCode from '../common/RealisticQRCode';
import SkeuomorphicCityPass from '../common/SkeuomorphicCityPass';
import { 
  getSavedUserLocation, 
  saveUserLocation, 
  requestLiveGPSLocation, 
  POPULAR_LOCATIONS 
} from '../../services/userLocationService';

export default function HomeScreen({ onNavigate, onOpenVoice }) {
  const [showQRExpanded, setShowQRExpanded] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [showTicketQRModal, setShowTicketQRModal] = useState(false);
  const [balance] = useState(840);

  // Dynamic User Location state
  const [currentLocation, setCurrentLocation] = useState(getSavedUserLocation);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchLocationQuery, setSearchLocationQuery] = useState('');
  const [locationError, setLocationError] = useState(null);

  // Hero Banner Carousel state (Slide 0: City Landmark, Slide 1: Learn Kannada Game)
  const [activeSlide, setActiveSlide] = useState(0);
  const bannerTouchStartX = useRef(null);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setActiveSlide(prev => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(bannerTimer);
  }, []);

  const handleBannerTouchStart = (e) => {
    bannerTouchStartX.current = e.touches[0].clientX;
  };

  const handleBannerTouchEnd = (e) => {
    if (bannerTouchStartX.current === null) return;
    const diffX = bannerTouchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 40) {
      setActiveSlide(1);
    } else if (diffX < -40) {
      setActiveSlide(0);
    }
    bannerTouchStartX.current = null;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for location changes across screens & auto-detect GPS on first load
  useEffect(() => {
    const handleLocationChange = (e) => {
      if (e.detail) {
        setCurrentLocation(e.detail);
      }
    };
    window.addEventListener('sajag-user-location-changed', handleLocationChange);

    // If geolocation is available and user hasn't chosen a custom hub, gently detect live location
    if (navigator.geolocation && !currentLocation.isCustomHub) {
      setIsLocating(true);
      requestLiveGPSLocation()
        .then((loc) => {
          setCurrentLocation(loc);
          setIsLocating(false);
        })
        .catch((err) => {
          // Gracefully fallback to saved/default location
          console.log('Auto GPS not granted or timed out:', err.message);
          setIsLocating(false);
        });
    }

    return () => {
      window.removeEventListener('sajag-user-location-changed', handleLocationChange);
    };
  }, []);

  const handleDetectGPS = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const loc = await requestLiveGPSLocation();
      setCurrentLocation(loc);
      setShowLocationModal(false);
    } catch (err) {
      setLocationError('Unable to detect GPS. Please check location permissions in your browser or device.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectHub = (hub) => {
    const locObj = {
      name: hub.name,
      locality: hub.locality || hub.name.split(',')[0],
      city: hub.city || 'Bengaluru',
      coords: hub.coords,
      isLiveGPS: false,
      isCustomHub: true
    };
    saveUserLocation(locObj);
    setCurrentLocation(locObj);
    setShowLocationModal(false);
  };

  const filteredLocations = POPULAR_LOCATIONS.filter(l => 
    !searchLocationQuery || 
    l.name.toLowerCase().includes(searchLocationQuery.toLowerCase()) ||
    l.locality.toLowerCase().includes(searchLocationQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-[#F8FAFC] overflow-hidden flex flex-col font-sans antialiased text-[#101828] relative animate-in fade-in slide-in-from-bottom-2 duration-350 ease-out">



        {/* 2. SCROLLABLE MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 sm:pt-3.5 pb-8 no-scrollbar">
          
          {/* HERO BANNER CAROUSEL (Slide 0: City Landmark, Slide 1: Learn Kannada Game) */}
          <div className="bg-white">
            <div 
              onTouchStart={handleBannerTouchStart}
              onTouchEnd={handleBannerTouchEnd}
              className="relative w-full aspect-[1024/525] overflow-hidden select-none"
            >
              {/* SLIDES CONTAINER */}
              <div 
                className="flex w-[200%] h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeSlide * 50}%)` }}
              >
                {/* SLIDE 0: Namma Bengaluru city view */}
                <div className="w-1/2 h-full relative shrink-0">
                  <img 
                    src="./bangalore-city.jpg?v=2" 
                    alt="Namma Bengaluru" 
                    className="w-full h-full object-cover block select-none"
                  />
                </div>

                {/* SLIDE 1: Learn Kannada Banner */}
                <div className="w-1/2 h-full relative shrink-0">
                  <img 
                    src="./kannada-banner-clean.png?v=2" 
                    alt="New to Bengaluru? Learn a word" 
                    className="w-full h-full object-cover block select-none"
                  />

                  {/* Interactive "Learn a word ->" CTA Hotspot (transparent over the illustrated button to eliminate double-button overlap) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigate) onNavigate('nammakannada');
                    }}
                    className="absolute left-[3%] top-[65%] w-[26%] h-[16%] rounded-full opacity-0 hover:opacity-10 bg-white active:scale-95 cursor-pointer z-30 transition-all"
                    aria-label="Learn a word"
                    title="Learn a word"
                  />
                </div>
              </div>

              {/* DYNAMIC LIVE LOCATION PILL (Persists across both slides, clean over background) */}
              <div className="absolute top-[6%] right-[3.5%] z-30 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="bg-white/95 hover:bg-white active:scale-95 border border-[#CBDDF8] rounded-full px-2.5 py-1 sm:py-1.5 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer select-none max-w-[215px] min-w-[155px] justify-between group backdrop-blur-xs"
                  title="Click to view or change your location"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[#155DFC] shrink-0">
                      {isLocating ? (
                        <Loader2 className="w-3 h-3 text-[#155DFC] animate-spin" />
                      ) : (
                        <MapPin className="w-3 h-3 text-[#155DFC] fill-[#155DFC]/20" />
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#101828] truncate leading-tight text-left">
                      {isLocating ? 'Locating...' : currentLocation.name}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#475569] group-hover:text-blue-600 shrink-0 ml-0.5 transition-colors" />
                </button>
              </div>
            </div>

            {/* CAROUSEL PAGINATION INDICATOR DOTS */}
            <div className="flex items-center justify-center gap-1.5 py-2">
              <button
                type="button"
                onClick={() => setActiveSlide(0)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeSlide === 0 ? 'w-5 bg-[#155DFC]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label="Slide 1: City View"
              />
              <button
                type="button"
                onClick={() => setActiveSlide(1)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeSlide === 1 ? 'w-5 bg-[#155DFC]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label="Slide 2: Learn Kannada"
              />
            </div>
          </div>

            {/* UNIFIED WALLET, GREEN POINTS & CO2 SAVED CARD (NO SHADOW, PLACED AFTER IMAGE) */}
            <div className="px-4 mt-3">
              <div className="bg-white rounded-2xl border border-gray-200 px-3.5 py-3 shadow-none">
                <div className="grid grid-cols-3 divide-x divide-gray-200/80">
                  {/* 1. Wallet */}
                  <div className="pr-2 flex flex-col justify-between">
                    <div className="flex items-center space-x-1 text-[#1868FA]">
                      <Wallet className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
                      <span className="text-[11px] font-semibold text-[#475569] whitespace-nowrap">Wallet</span>
                    </div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-lg sm:text-xl font-semibold text-[#0B1528] tracking-tight">₹{balance}</span>
                      <span className="text-xs font-normal text-gray-400">.00</span>
                    </div>
                  </div>

                  {/* 2. Green points */}
                  <div className="px-2 flex flex-col justify-between">
                    <div className="flex items-center space-x-1 text-[#16A34A]">
                      <Leaf className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
                      <span className="text-[11px] font-semibold text-[#475569] whitespace-nowrap">Green points</span>
                    </div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-lg sm:text-xl font-semibold text-[#0B1528] tracking-tight">1,250</span>
                      <span className="text-xs font-normal text-[#64748B] ml-0.5">pts</span>
                    </div>
                  </div>

                  {/* 3. CO2 saved */}
                  <div className="pl-2 flex flex-col justify-between">
                    <div className="flex items-center space-x-1 text-[#16A34A]">
                      <Leaf className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
                      <span className="text-[11px] font-semibold text-[#475569] whitespace-nowrap">CO₂ saved</span>
                    </div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-lg sm:text-xl font-semibold text-[#0B1528] tracking-tight">42.8</span>
                      <span className="text-xs font-normal text-[#64748B] ml-0.5">kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. EXPANDABLE SKEUOMORPHIC CITY PASS */}
          <div className="px-5 mt-3.5">
            <div className="w-full bg-white text-gray-900 rounded-3xl shadow-sm border border-gray-200/90 overflow-hidden transition-all">
              
              {/* Header / Collapsed Bar Toggle */}
              <button
                onClick={() => setShowQRExpanded(!showQRExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50/80 active:scale-[0.99] transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shadow-2xs shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-gray-900 tracking-tight">City Pass</h3>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Active
                      </span>
                    </div>

                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showQRExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Expandable Skeuomorphic Pass Body */}
              {showQRExpanded && (
                <div className="p-3 pt-0 pb-4 bg-[#F8FAFC]/50 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <SkeuomorphicCityPass 
                    cardId="SC-1020-3040" 
                    balance={balance} 
                  />
                </div>
              )}

            </div>
          </div>

          {/* 4. QUICK ACTIONS (Swipeable carousel: 3 visible, swipe left to reveal Voice at most right) */}
          <div className="px-5 mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </h2>
              {onOpenVoice && (
                <button
                  onClick={onOpenVoice}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                  <span>Ask Voice</span>
                </button>
              )}
            </div>

            {/* Horizontal Swipe Container (Snaps smoothly to show 3 items at once, with voice on the right) */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1.5 snap-x snap-mandatory -mx-1 px-1">
              
              {/* 1. Transit */}
              <button 
                onClick={() => onNavigate && onNavigate('explore')}
                className="flex-none w-[calc((100%-20px)/3)] snap-start flex flex-col items-center p-3 rounded-2xl bg-white hover:bg-gray-50/80 active:scale-95 transition-all border border-gray-200/80 shadow-2xs cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#155DFC] text-white flex items-center justify-center shadow-md shadow-[#155DFC]/25 group-hover:scale-105 transition-transform">
                  <Navigation className="w-5 h-5 fill-white" />
                </div>
                <span className="mt-2 text-[11px] font-bold text-gray-900 text-center leading-tight">Transit</span>
              </button>

              {/* 2. Parking */}
              <button 
                onClick={() => onNavigate && onNavigate('parking')}
                className="flex-none w-[calc((100%-20px)/3)] snap-start flex flex-col items-center p-3 rounded-2xl bg-white hover:bg-gray-50/80 active:scale-95 transition-all border border-gray-200/80 shadow-2xs cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#9333EA] text-white flex items-center justify-center shadow-md shadow-[#9333EA]/25 group-hover:scale-105 transition-transform">
                  <CircleParking className="w-5 h-5" />
                </div>
                <span className="mt-2 text-[11px] font-bold text-gray-900 text-center leading-tight">Parking</span>
              </button>

              {/* 3. Safety */}
              <button 
                onClick={() => onNavigate && onNavigate('safety')}
                className="flex-none w-[calc((100%-20px)/3)] snap-start flex flex-col items-center p-3 rounded-2xl bg-white hover:bg-gray-50/80 active:scale-95 transition-all border border-gray-200/80 shadow-2xs cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#E11D48] text-white flex items-center justify-center shadow-md shadow-[#E11D48]/25 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="mt-2 text-[11px] font-bold text-gray-900 text-center leading-tight">Safety</span>
              </button>

              {/* 4. Voice Navigator (At Most Right - Revealed when swiping left) */}
              <button 
                onClick={onOpenVoice}
                className="flex-none w-[calc((100%-20px)/3)] snap-start flex flex-col items-center p-3 rounded-2xl bg-white hover:bg-gray-50/80 active:scale-95 transition-all border border-gray-200/80 shadow-2xs cursor-pointer group relative"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                  <Mic className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex items-center gap-0.5 mt-2">
                  <span className="text-[11px] font-bold text-gray-900 text-center leading-tight">Voice</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                </div>
              </button>

            </div>

            {/* Subtle swipe indicator dots */}
            <div className="flex items-center justify-center gap-1 mt-1.5">
              <span className="w-3.5 h-1 rounded-full bg-blue-600" />
              <span className="w-1.5 h-1 rounded-full bg-gray-300" />
            </div>
          </div>

          {/* 5. ACTIVE NOW / REALISTIC TRANSIT TICKET (Click to show QR) */}
          <div className="px-5 mt-5">
            <div className="flex items-center space-x-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Active Transit Ticket
              </h2>
            </div>

            {/* AUTHENTIC PHYSICAL TICKET CARD (Expandable stops + QR stub) */}
            <TransitTicketCard onShowQR={() => setShowTicketQRModal(true)} />
          </div>

          {/* 6. TRAFFIC ADVISORY */}
          <div className="px-5 mt-4 mb-3">
            <div className="bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl p-3.5 flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Traffic Advisory • Ring Road
                  </span>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
                    Caution
                  </span>
                </div>
                <p className="text-xs text-amber-800 font-medium mt-1 leading-snug">
                  Moderate delay near flyover due to lane maintenance. Metro transit recommended.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ACTIVE TICKET FULL QR MODAL (OPENS ON TAPPING TICKET) */}
        {showTicketQRModal && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col justify-end z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-gray-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Active Transit QR Pass</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Valid for turnstile & bus scanner</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTicketQRModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QR Code Display */}
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-emerald-800 text-xs font-bold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ready to Scan</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/90 inline-block shadow-inner">
                  <RealisticQRCode value="SAJAG-TRIP-94821" size={150} className="mx-auto" />
                  <span className="font-mono text-xs font-bold text-gray-700 block mt-2 tracking-wider">
                    SAJAG-TRIP-94821
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Shivaji Stadium → Cyber City • 1 Adult
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200/90 text-left space-y-1.5 text-xs mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Metro Leg:</span>
                    <span className="font-bold text-gray-900">Yellow Line (Plat. 2)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bus Leg:</span>
                    <span className="font-bold text-gray-900">AC Feeder Bus #502 (Bay 4)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valid Until:</span>
                    <span className="font-bold text-emerald-700">Today, 11:59 PM</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowTicketQRModal(false)}
                  className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Close Pass
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOCATION SELECTOR MODAL / BOTTOM SHEET */}
        {showLocationModal && (
          <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
            <div className="w-full max-w-[430px] mx-auto bg-white rounded-t-[32px] p-5 pt-3 shadow-2xl max-h-[85%] flex flex-col border-t border-gray-100 animate-in slide-in-from-bottom duration-300">
              
              {/* Drag Handle Bar */}
              <div className="w-12 h-1 bg-gray-300/80 rounded-full mx-auto mb-3 shrink-0" />

              {/* Title Header with Close Button */}
              <div className="flex items-start justify-between mb-3 shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-[#101828] tracking-tight">Your location</h2>
                  <p className="text-sm text-gray-500 font-normal mt-0.5">Choose where to explore</p>
                </div>
                <button 
                  onClick={() => setShowLocationModal(false)}
                  className="p-1 -mr-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 stroke-[1.8]" />
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="relative mb-3 shrink-0">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchLocationQuery}
                  onChange={(e) => setSearchLocationQuery(e.target.value)}
                  placeholder="Search area or station"
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* "Use current location" Row */}
              <div className="shrink-0">
                <button
                  onClick={handleDetectGPS}
                  disabled={isLocating}
                  className="w-full py-2 flex items-center justify-between transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#155DFC] text-white flex items-center justify-center shrink-0">
                      {isLocating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Crosshair className="w-5 h-5 stroke-[2.2]" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-950 leading-tight">
                        Use current location
                      </div>
                      <div className="text-xs text-gray-500 font-normal mt-0.5">
                        {isLocating ? 'Detecting via GPS...' : 'Find me using GPS'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#155DFC] shrink-0" />
                </button>

                {locationError && (
                  <p className="text-xs text-rose-600 font-medium mt-1 mb-2 px-1">
                    {locationError}
                  </p>
                )}

                {/* Subtle Divider */}
                <div className="h-px bg-gray-100 my-3" />
              </div>

              {/* POPULAR LOCATIONS Section */}
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-1 shrink-0">
                POPULAR LOCATIONS
              </div>

              {/* Locations List */}
              <div className="overflow-y-auto no-scrollbar space-y-1 flex-1 max-h-[250px] pb-2">
                {filteredLocations.map((hub) => {
                  const isSelected = currentLocation.name.toLowerCase().includes(hub.locality.toLowerCase());
                  return (
                    <button
                      key={hub.name}
                      onClick={() => handleSelectHub(hub)}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#F0F7FF]' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <MapPin className={`w-5 h-5 shrink-0 ${isSelected ? 'text-[#155DFC]' : 'text-gray-400'}`} />
                        <div className="min-w-0">
                          <div className="text-sm sm:text-base font-bold text-gray-950 leading-tight">
                            {hub.locality || hub.name.split(',')[0]}
                          </div>
                          <div className="text-xs text-gray-500 font-normal mt-0.5">
                            {hub.city || 'Bengaluru'} • {hub.line || 'Metro'}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#155DFC] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        )}

    </div>
  );
}

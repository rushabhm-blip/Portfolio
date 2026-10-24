import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Car,
  ChevronDown,
  ArrowLeft,
  PlusCircle,
  Footprints,
  Send,
  Map,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';
import ParkingMap from './parking/ParkingMap';
import ReserveParkingScreen from './parking/ReserveParkingScreen';
import ParkingPaymentScreen from './parking/ParkingPaymentScreen';
import ParkingConfirmationScreen from './parking/ParkingConfirmationScreen';
import { geocodeLocation, fetchRealParkingSpots } from '../../services/parkingService';

export default function ParkingScreen({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  
  // Multi-step progressive flow: 'finder' | 'reserve' | 'payment' | 'confirmation'
  const [currentStep, setCurrentStep] = useState('finder');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeBookingData, setActiveBookingData] = useState(null);

  // Active parking timer state
  const [secondsRemaining, setSecondsRemaining] = useState(4881); // 01:21:21
  const [activeSlot, setActiveSlot] = useState({
    title: 'Central Plaza • Level B2',
    slot: 'Slot B-14 • 1.2 km away',
    fee: 60
  });
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExtend = () => {
    setSecondsRemaining((prev) => prev + 3600);
    setActiveSlot((prev) => ({ ...prev, fee: prev.fee + 40 }));
    showToast('✓ Parking extended by +1 Hour (₹40 added)');
  };

  const initialDefaultSpots = [
    {
      id: 1,
      name: 'Metro Station Deck P1',
      location: 'Gate 3, Shivaji Stadium Metro',
      distance: 0.4,
      distanceLabel: '0.4 km',
      walkingTime: '5 min walk',
      availableSpots: 38,
      totalSpots: 120,
      pricePerHour: 30,
      status: 'available',
      statusText: 'Available',
      evCharging: true,
      covered: true,
      lat: 28.6328,
      lng: 77.2185,
      showPriceBadge: true
    },
    {
      id: 2,
      name: 'Connaught South Deck P2',
      location: 'Outer Circle, Barakhamba',
      distance: 0.8,
      distanceLabel: '0.8 km',
      walkingTime: '9 min walk',
      availableSpots: 18,
      totalSpots: 80,
      pricePerHour: 35,
      status: 'available',
      statusText: 'Available',
      evCharging: true,
      covered: false,
      lat: 28.6292,
      lng: 77.2228,
      showPriceBadge: true
    },
    {
      id: 3,
      name: 'Poddar Multi-Level Parking',
      location: 'Shaheed Bhagat Singh Marg',
      distance: 1.1,
      distanceLabel: '1.1 km',
      walkingTime: '13 min walk',
      availableSpots: 45,
      totalSpots: 150,
      pricePerHour: 40,
      status: 'available',
      statusText: 'Available',
      evCharging: false,
      covered: true,
      lat: 28.6335,
      lng: 77.2125,
      showPriceBadge: false
    },
    {
      id: 4,
      name: 'Yamuna Gate Smart Deck',
      location: 'Minto Road / Ring Road',
      distance: 1.6,
      distanceLabel: '1.6 km',
      walkingTime: '18 min walk',
      availableSpots: 14,
      totalSpots: 90,
      pricePerHour: 50,
      status: 'filling',
      statusText: 'Filling Fast',
      evCharging: true,
      covered: true,
      lat: 28.6385,
      lng: 77.2235,
      showPriceBadge: false
    }
  ];

  const [spotsList, setSpotsList] = useState(initialDefaultSpots);
  const [centerCoords, setCenterCoords] = useState({ lat: 28.6325, lng: 77.2185 });
  const [searchLocationLabel, setSearchLocationLabel] = useState('Connaught Place, New Delhi');
  const [isSearching, setIsSearching] = useState(false);

  // Default selected spot
  useEffect(() => {
    if (!selectedSpot && spotsList.length > 0) {
      setSelectedSpot(spotsList[0]);
    }
  }, [spotsList, selectedSpot]);

  // Search real parking locations via Geocoding + Overpass
  const handleLocationSearch = async (queryText) => {
    const q = (queryText || searchQuery).trim();
    if (!q) return;
    setIsSearching(true);
    showToast(`Searching parking around "${q}"...`);
    try {
      const geo = await geocodeLocation(q);
      if (geo) {
        setCenterCoords({ lat: geo.lat, lng: geo.lng });
        setSearchLocationLabel(geo.name || q);
        const realSpots = await fetchRealParkingSpots(geo.lat, geo.lng, geo.name || q);
        if (realSpots && realSpots.length > 0) {
          setSpotsList(realSpots);
          setSelectedSpot(realSpots[0]);
          showToast(`✓ Found ${realSpots.length} parking locations in ${geo.name || q}`);
        } else {
          showToast(`No parking spots found for "${q}"`);
        }
      } else {
        showToast(`Could not locate "${q}". Try another location name.`);
      }
    } catch (err) {
      console.error('Error fetching parking locations:', err);
      showToast('Error searching parking locations. Please retry.');
    } finally {
      setIsSearching(false);
    }
  };

  const filteredSpots = spotsList.filter((spot) => {
    if (selectedFilter === 'distance') return spot.distance <= 1.0;
    if (selectedFilter === 'price') return spot.pricePerHour <= 40;
    return true;
  });

  // Step 1 Trigger: User clicks "Book Slot"
  const handleStartBooking = (spot) => {
    setSelectedSpot(spot);
    setCurrentStep('reserve');
  };

  // Step 2 Trigger: User configured reservation and clicked "Proceed to Payment"
  const handleProceedToPayment = (bookingDetails) => {
    setActiveBookingData(bookingDetails);
    setCurrentStep('payment');
  };

  // Step 3 Trigger: User paid successfully
  const handlePaymentSuccess = (confirmedBooking) => {
    setActiveBookingData(confirmedBooking);
    setCurrentStep('confirmation');
  };

  // Finish booking and return to main screen
  const handleFinishBooking = () => {
    if (activeBookingData) {
      setActiveSlot({
        title: `${activeBookingData.spot?.name} • ${activeBookingData.slotNumber || 'P1-24'}`,
        slot: `${activeBookingData.slotNumber || 'P1-24'} • 0.4 km away`,
        fee: activeBookingData.totalAmount
      });
      setSecondsRemaining((activeBookingData.duration || 2) * 3600);
      showToast(`✓ Slot reserved! Active pass updated.`);
    }
    setCurrentStep('finder');
    setIsMapFullscreen(false);
  };

  /* ========================================================================
     SCREEN ROUTER (STEP 1: Reserve, STEP 2: Payment, STEP 3: Confirmation)
     ======================================================================== */
  if (currentStep === 'reserve') {
    return (
      <ReserveParkingScreen
        spot={selectedSpot || spotsList[0]}
        onBack={() => setCurrentStep('finder')}
        onProceed={handleProceedToPayment}
      />
    );
  }

  if (currentStep === 'payment') {
    return (
      <ParkingPaymentScreen
        bookingData={activeBookingData}
        onBack={() => setCurrentStep('reserve')}
        onPaySuccess={handlePaymentSuccess}
      />
    );
  }

  if (currentStep === 'confirmation') {
    return (
      <ParkingConfirmationScreen
        bookingData={activeBookingData}
        onDone={handleFinishBooking}
        onNavigateToSpot={handleFinishBooking}
      />
    );
  }

  /* ========================================================================
     MAIN PARKING FINDER SCREEN (Dashboard + Fullscreen Map Modal)
     ======================================================================== */
  return (
    <div className="w-full h-full bg-[#FFFFFF] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">

      {/* FULLSCREEN MAP OVERLAY (Matches Target Image 2 with "Parking nearby") */}
      {isMapFullscreen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col w-full h-full animate-in fade-in duration-200">
          <ParkingMap
            spots={filteredSpots}
            selectedSpot={selectedSpot || filteredSpots[0]}
            centerCoords={centerCoords}
            onSelectSpot={(spot) => setSelectedSpot(spot)}
            onBookSpot={(spot) => handleStartBooking(spot)}
            isFullscreen={true}
            onToggleFullscreen={() => setIsMapFullscreen(false)}
            onBack={() => setIsMapFullscreen(false)}
            className="w-full h-full"
          />
        </div>
      )}

      {/* SCROLLABLE MAIN CONTENT (Original Dashboard Page) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 sm:px-5 pt-3 pb-8">

        {/* 1. TOP HEADER ROW */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 pb-3">
          <button 
            type="button"
            onClick={() => onNavigate && onNavigate('home')}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-gray-200/60"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight font-sans">
            Find parking
          </h1>

          <button 
            type="button"
            onClick={() => setSelectedFilter(selectedFilter === 'all' ? 'price' : 'all')}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-800 border border-gray-200/60 transition-all cursor-pointer active:scale-95"
            title="Filter Options"
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* 2. SEARCH BAR WITH BLUE SEARCH BUTTON */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleLocationSearch(searchQuery);
          }}
          className="mt-2 w-full bg-white rounded-2xl border border-gray-200/90 shadow-2xs pl-3.5 pr-2 py-2 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400"
        >
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search area or landmark"
            className="flex-1 bg-transparent text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none font-sans"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-5 py-2.5 bg-[#0052FF] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs shrink-0 font-sans active:scale-95"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* 3. FILTER PILLS ROW */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar py-0.5">
          {/* Within 2 km */}
          <button
            type="button"
            onClick={() => setSelectedFilter(selectedFilter === 'distance' ? 'all' : 'distance')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedFilter === 'distance'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-gray-700" />
            <span>Within 1 km</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Under ₹40/hr */}
          <button
            type="button"
            onClick={() => setSelectedFilter(selectedFilter === 'price' ? 'all' : 'price')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedFilter === 'price'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="font-bold text-xs text-gray-800">₹</span>
            <span>Under ₹40/hr</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* View Map Pill (Opens Fullscreen Map matching target Image 2) */}
          <button
            type="button"
            onClick={() => setIsMapFullscreen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-blue-400 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 ml-auto"
          >
            <Map className="w-3.5 h-3.5 text-blue-700" />
            <span>Map</span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-700" />
          </button>
        </div>

        {/* 4. CURRENT LOCATION BAR */}
        <div className="mt-3 bg-white rounded-2xl border border-gray-200/90 shadow-2xs px-3.5 py-2.5 flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-blue-600 fill-blue-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate font-sans">
            {searchLocationLabel}
          </span>
          {isSearching && (
            <span className="ml-auto text-xs text-blue-600 font-semibold flex items-center gap-1 shrink-0 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Locating...
            </span>
          )}
        </div>

        {/* 5. INLINE MAP CONTAINER */}
        <div 
          onClick={() => setIsMapFullscreen(true)}
          className="mt-3.5 w-full h-64 rounded-3xl overflow-hidden shadow-2xs border border-gray-200/80 relative cursor-pointer group"
          title="Click to expand map"
        >
          <ParkingMap
            spots={filteredSpots}
            selectedSpot={selectedSpot || filteredSpots[0]}
            centerCoords={centerCoords}
            onSelectSpot={(spot) => setSelectedSpot(spot)}
            onBookSpot={(spot) => handleStartBooking(spot)}
            isFullscreen={false}
            onToggleFullscreen={() => setIsMapFullscreen(true)}
            className="w-full h-full pointer-events-auto"
          />
        </div>

        {/* 6. ACTIVE PARKING CARD */}
        <div className="mt-4 bg-white rounded-3xl border border-gray-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-emerald-100/70 border border-emerald-200/70 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">Active parking</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200/40">
              <Car className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight font-sans">
              {activeSlot.title}
            </h3>
            <p className="text-xs text-gray-500 font-normal mt-0.5 font-sans">
              {activeSlot.slot}
            </p>
          </div>

          <div className="mt-3 p-3.5 rounded-2xl bg-white border border-gray-100 flex items-center divide-x divide-gray-100">
            <div className="flex-1 pr-3">
              <span className="text-xs text-gray-500 font-medium block">Time remaining</span>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xl sm:text-2xl font-bold text-gray-900 font-mono tracking-tight">
                  {formatTimer(secondsRemaining)}
                </span>
              </div>
            </div>

            <div className="flex-1 pl-4">
              <span className="text-xs text-gray-500 font-medium block">Current fee</span>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  ₹{activeSlot.fee}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExtend}
            className="w-full mt-3.5 py-3 rounded-2xl bg-[#EBF2FF] hover:bg-blue-100 text-[#0052FF] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer font-sans"
          >
            <PlusCircle className="w-4 h-4 text-[#0052FF]" />
            <span>Extend by 1 hour</span>
          </button>
        </div>

        {/* 7. NEARBY PARKING SECTION */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight font-sans">
              Nearby parking
            </h2>
            <span className="text-xs sm:text-sm font-bold text-blue-600 font-sans">
              {filteredSpots.length} available
            </span>
          </div>

          <div className="space-y-3">
            {filteredSpots.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;

              return (
                <div
                  key={spot.id}
                  onClick={() => {
                    setSelectedSpot(spot);
                    setIsMapFullscreen(true);
                  }}
                  className={`p-4 bg-white rounded-3xl border transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs' 
                      : 'border-gray-200/90 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug font-sans">
                        {spot.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 font-sans">{spot.location}</p>
                      
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {spot.distanceLabel}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Footprints className="w-3.5 h-3.5 text-gray-400" />
                          {spot.walkingTime}
                        </span>
                      </div>
                    </div>

                    <div className="px-2.5 py-0.5 rounded-full border border-emerald-200/80 bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 shrink-0 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{spot.statusText}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-3" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 font-medium block uppercase tracking-wide">Available</span>
                        <div className="text-xs text-gray-500 font-sans">
                          <span className="text-base font-bold text-gray-900">{spot.availableSpots}</span>
                          {' '}/ {spot.totalSpots}
                        </div>
                      </div>

                      <div className="h-7 w-px bg-gray-200" />

                      <div>
                        <span className="text-[10px] text-gray-400 font-medium block uppercase tracking-wide">Rate</span>
                        <div className="text-xs text-gray-500 font-sans">
                          <span className="text-base font-bold text-blue-600">₹{spot.pricePerHour}</span>
                          <span>/hr</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartBooking(spot);
                      }}
                      className="px-5 py-2.5 bg-[#0052FF] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                    >
                      <Send className="w-3.5 h-3.5 rotate-45" />
                      <span>Book slot</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[500] bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

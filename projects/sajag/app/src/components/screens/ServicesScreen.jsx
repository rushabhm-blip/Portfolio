import React, { useState } from 'react';
import {
  Home,
  Plane,
  ShieldAlert,
  CircleParking,
  User,
  Search,
  SlidersHorizontal,
  MapPin,
  Navigation,
  Droplets,
  Zap,
  Package,
  Layers,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  X,
  Clock,
  Car,
  CheckCircle2,
  PhoneCall,
  DollarSign
} from 'lucide-react';
import ServicesIcon from '../icons/ServicesIcon';

export default function ServicesScreen({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Services');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Interactive Facility Details Modal state
  const [selectedFacility, setSelectedFacility] = useState(null);

  const tabs = [
    { id: 'Home', label: 'Home', icon: Home, target: 'home' },
    { id: 'Travel', label: 'Travel', icon: Plane, target: 'travel' },
    { id: 'Safety', label: 'SAFETY', icon: ShieldAlert, target: 'safety' },
    { id: 'Services', label: 'Services', icon: ServicesIcon, target: 'services' },
    { id: 'Profile', label: 'Profile', icon: User, target: 'profile' }
  ];

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'mobility', label: 'Parking & EV' },
    { id: 'facilities', label: 'Restroom & Water' },
    { id: 'civic', label: 'City Makers' }
  ];

  /* 
     The 6 Services Quick Actions:
     1) Parking
     2) Restroom
     3) Drinking Water
     4) City Makers
     5) EV Charge
     6) Lockers
  */
  const quickActions = [
    {
      id: 'parking',
      label: 'Parking',
      icon: CircleParking,
      cardBg: 'bg-[#FAF5FF] hover:bg-[#F3E8FF] border-[#F3E8FF]/80',
      iconBg: 'bg-[#9333EA] shadow-[#9333EA]/20',
      iconFill: false,
      onClick: () => onNavigate && onNavigate('parking')
    },
    {
      id: 'restroom',
      label: 'Restroom',
      icon: Sparkles,
      cardBg: 'bg-[#EFF6FF] hover:bg-[#DBEAFE] border-[#DBEAFE]/80',
      iconBg: 'bg-[#155DFC] shadow-[#155DFC]/20',
      iconFill: false,
      onClick: () => setSelectedFacility({
        type: 'restroom',
        title: 'Public Restrooms & Sanitization Hubs',
        tagline: 'Clean, sanitized & touchless facilities',
        price: '₹5 / Entry (Free for Senior Citizens)',
        rating: '4.7 ★ (Verified by Swachh City)',
        spots: [
          { name: 'Shivaji Stadium Metro Concourse', distance: '0.2 km away', status: 'Clean & Open 24/7' },
          { name: 'Inner Circle Block C Plaza', distance: '0.5 km away', status: 'Wheelchair Accessible' },
          { name: 'Central Park Gate 2 Pavilion', distance: '0.8 km away', status: 'Touchless & Sanitized' }
        ]
      })
    },
    {
      id: 'water',
      label: 'Drinking Water',
      icon: Droplets,
      cardBg: 'bg-[#F0F9FF] hover:bg-[#E0F2FE] border-[#E0F2FE]/80',
      iconBg: 'bg-[#0284C7] shadow-[#0284C7]/20',
      iconFill: true,
      onClick: () => setSelectedFacility({
        type: 'water',
        title: 'Potable Drinking Water ATMs',
        tagline: 'RO purified, chilled drinking water stations',
        price: '₹1 / 1 Liter (Bring your bottle)',
        rating: '4.9 ★ (TDS < 80 Tested Hourly)',
        spots: [
          { name: 'Water ATM #14 - Shivaji Metro Gate 3', distance: '0.2 km away', status: 'Chilled RO Water Active' },
          { name: 'Smart Hydration Hub - Regal Cinema', distance: '0.4 km away', status: 'Free Refill Station' },
          { name: 'Palika Kendra Water Point', distance: '0.7 km away', status: 'UV & RO Purified' }
        ]
      })
    },
    {
      id: 'citymakers',
      label: 'City Makers',
      icon: Award,
      cardBg: 'bg-[#ECFDF5] hover:bg-[#D1FAE5] border-[#D1FAE5]/80',
      iconBg: 'bg-[#059669] shadow-[#059669]/20',
      iconFill: false,
      onClick: () => onNavigate && onNavigate('citymakers')
    },
    {
      id: 'ev',
      label: 'EV Charge',
      icon: Zap,
      cardBg: 'bg-[#F0FDFA] hover:bg-[#CCFBF1] border-[#CCFBF1]/80',
      iconBg: 'bg-[#0D9488] shadow-[#0D9488]/20',
      iconFill: true,
      onClick: () => setSelectedFacility({
        type: 'ev',
        title: 'Fast EV Charging Hubs (DC 60kW+)',
        tagline: 'CCS2 & Type 2 Fast Charger Bays',
        price: '₹14 / kWh (Slot reservation available)',
        rating: '4.8 ★ (18 Active Bays)',
        spots: [
          { name: 'Central Plaza EV Hub - Level B2', distance: '0.4 km away', status: '3/4 Bays Available (60kW DC)' },
          { name: 'Civic Centre Fast Charger Lot', distance: '0.9 km away', status: '2/2 Fast Guns Open' },
          { name: 'Connaught Circle Supercharger Deck', distance: '1.2 km away', status: '120kW Ultra Fast Active' }
        ]
      })
    },
    {
      id: 'lockers',
      label: 'Lockers',
      icon: Package,
      cardBg: 'bg-[#FFFBEB] hover:bg-[#FEF3C7] border-[#FEF3C7]/80',
      iconBg: 'bg-[#D97706] shadow-[#D97706]/20',
      iconFill: false,
      onClick: () => setSelectedFacility({
        type: 'lockers',
        title: 'Smart Luggage & Parcel Lockers',
        tagline: 'Secure OTP/QR-enabled contactless storage',
        price: '₹20 / 3 Hours (CCTV Guarded)',
        rating: '4.9 ★ (24/7 Security)',
        spots: [
          { name: 'Metro Deck P1 Smart Lockers', distance: '0.4 km away', status: '12 Small / 8 Large Free' },
          { name: 'Central Plaza Tourist Locker Hub', distance: '0.7 km away', status: 'Biometric Access Active' },
          { name: 'Shivaji Bus Terminal Locker Bay', distance: '1.0 km away', status: 'Guaranteed 24h Hold' }
        ]
      })
    }
  ];

  const services = [
    {
      id: 'parking',
      title: 'Smart Parking Finder & Slots',
      category: 'mobility',
      tagline: '104 live slots nearby • Real Map',
      description: 'Find & reserve vacant slots in real-time with instant QR gate pass.',
      badge: 'Live GPS Map',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: CircleParking,
      iconColor: 'bg-purple-100 text-purple-700',
      action: () => onNavigate && onNavigate('parking'),
      featured: true
    },
    {
      id: 'restrooms',
      title: 'Public Restrooms & Sanitization',
      category: 'facilities',
      tagline: 'Touchless, hygienic public washrooms (₹5)',
      description: 'Locate verified clean restrooms with baby care and accessibility features.',
      badge: 'Hygiene Rating 4.8',
      badgeColor: 'bg-blue-50 text-[#155DFC] border-blue-200',
      icon: Sparkles,
      iconColor: 'bg-blue-100 text-[#155DFC]',
      action: () => quickActions[1].onClick(),
      featured: false
    },
    {
      id: 'water',
      title: 'Potable Drinking Water ATMs',
      category: 'facilities',
      tagline: 'RO purified cold water at ₹1/L',
      description: 'Refill bottles with lab-certified chilled drinking water stations.',
      badge: 'Purified RO',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Droplets,
      iconColor: 'bg-sky-100 text-sky-700',
      action: () => quickActions[2].onClick(),
      featured: false
    },
    {
      id: 'citymakers',
      title: 'City Makers & Hazard Reporting',
      category: 'civic',
      tagline: 'Report civic issues & earn +10 points',
      description: 'Report waterlogging, broken lights, and potholes directly on the interactive safety map.',
      badge: '+10 Citizen Pts',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Award,
      iconColor: 'bg-emerald-100 text-emerald-700',
      action: () => onNavigate && onNavigate('citymakers'),
      featured: false
    },
    {
      id: 'ev',
      title: 'EV Fast Charging Network',
      category: 'mobility',
      tagline: '18 Fast DC Chargers available',
      description: 'Locate 60kW+ chargers, check wait times, and reserve a charging bay.',
      badge: 'Fast DC 60kW',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: Zap,
      iconColor: 'bg-teal-100 text-teal-700',
      action: () => quickActions[4].onClick(),
      featured: false
    },
    {
      id: 'lockers',
      title: 'Smart Luggage & Parcel Lockers',
      category: 'facilities',
      tagline: '24/7 Contactless QR Lockers (₹20)',
      description: 'Safely store luggage and transit packages with digital OTP access.',
      badge: 'CCTV Guarded',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Package,
      iconColor: 'bg-amber-100 text-amber-700',
      action: () => quickActions[5].onClick(),
      featured: false
    }
  ];

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      


      {/* 2. SCROLLABLE MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-6">
        
        {/* TOP BLUE HEADER */}
        <div className="relative bg-gradient-to-b from-[#155DFC] via-[#1D4ED8] to-[#1E40AF] px-5 pt-4 pb-6 shadow-md text-white">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Services
              </h1>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                City Utilities & Smart Facilities
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ServicesIcon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (Parking, Restroom, Water, EV)..."
              className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-medium text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pt-1">
            {categories.map((c) => {
              const isSel = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                    isSel
                      ? 'bg-white text-[#155DFC] ring-2 ring-white/60'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. QUICK ACTIONS GRID SECTION (6 DEDICATED FACILITIES) */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-[#101828] tracking-tight">
              Quick Actions
            </h2>
            <span className="text-[11px] font-bold text-[#155DFC]">
              6 Facilities
            </span>
          </div>

          {/* 3 Columns x 2 Rows Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button 
                  key={action.id}
                  onClick={action.onClick}
                  className={`flex flex-col items-center p-3 rounded-2xl ${action.cardBg} active:scale-95 transition-all border shadow-xs cursor-pointer group`}
                >
                  <div className={`w-11 h-11 rounded-xl ${action.iconBg} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 text-white ${action.iconFill ? 'fill-white' : ''}`} />
                  </div>
                  <span className="mt-2 text-xs font-bold text-[#364153] leading-tight text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. FEATURED PARKING SPOTLIGHT CARD */}
        <div className="px-5 mt-5">
          <div 
            onClick={() => onNavigate && onNavigate('parking')}
            className="relative rounded-3xl p-5 bg-gradient-to-br from-[#7E22CE] via-[#9333EA] to-[#6B21A8] text-white shadow-xl overflow-hidden border border-purple-400/30 cursor-pointer active:scale-98 transition-all group"
          >
            {/* Background glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Spot Reservation
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                <CircleParking className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="mt-3 relative z-10">
              <h2 className="text-lg font-black text-white tracking-tight">
                Smart Parking Finder & Booking
              </h2>
              <p className="text-xs text-purple-100 font-medium mt-1 leading-snug">
                Real Leaflet Map, live vacant spots, and 3-step guaranteed slot reservation.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between relative z-10 text-xs">
              <span className="font-extrabold text-purple-100">
                ● 104 Slots Available in City
              </span>
              <span className="bg-white text-[#9333EA] font-black px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1 group-hover:bg-purple-50 transition-colors">
                <span>Open Parking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* 5. ALL CITY SERVICES LIST */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-[#101828] uppercase tracking-wider">
              Available City Services
            </h3>
            <span className="text-[11px] font-bold text-[#155DFC]">
              {filteredServices.length} Options
            </span>
          </div>

          <div className="space-y-3">
            {filteredServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={service.action}
                  className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-98"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${service.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-900 leading-snug">
                          {service.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                          {service.tagline}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                    <span className="text-[#155DFC] font-bold text-[11px] flex items-center gap-0.5 hover:underline">
                      <span>Access Facility</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FACILITY DETAILS DRAWER / MODAL */}
      {selectedFacility && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-5 w-full max-w-[430px] max-h-[80vh] overflow-y-auto shadow-2xl relative border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">{selectedFacility.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedFacility.tagline}</p>
              </div>
              <button 
                onClick={() => setSelectedFacility(null)}
                className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
              <span className="font-bold text-[#155DFC]">{selectedFacility.price}</span>
              <span className="font-bold text-gray-700">{selectedFacility.rating}</span>
            </div>

            <div className="mt-4 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Nearest Verified Locations
              </span>
              {selectedFacility.spots?.map((spot, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900">{spot.name}</h4>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{spot.distance}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">{spot.status}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedFacility(null);
                      if (onNavigate) onNavigate('travel');
                    }}
                    className="px-3 py-1.5 bg-[#155DFC] hover:bg-blue-700 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Navigate</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedFacility(null)}
              className="w-full mt-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import {
  Home,
  Plane,
  ShieldAlert,
  CircleParking,
  User,
  MapPin,
  Navigation,
  Clock,
  TrendingUp
} from 'lucide-react';
import ServicesIcon from '../icons/ServicesIcon';

export default function TravelScreen({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Travel');

  const tabs = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Travel', label: 'Travel', icon: Navigation },
    { id: 'Safety', label: 'SAFETY', icon: ShieldAlert },
    { id: 'Services', label: 'Services', icon: ServicesIcon },
    { id: 'Profile', label: 'Profile', icon: User }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'Home' && onNavigate) onNavigate('home');
    if (tabId === 'Safety' && onNavigate) onNavigate('safety');
    if (tabId === 'Services' && onNavigate) onNavigate('services');
    if (tabId === 'Travel' && onNavigate) onNavigate('travel');
    if (tabId === 'Profile' && onNavigate) onNavigate('profile');
  };

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative">



      {/* SCROLLABLE MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* TOP GRADIENT HERO */}
        <div className="relative w-full" style={{
          background: 'linear-gradient(180deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)',
          paddingBottom: '50px'
        }}>
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-[28px] font-black text-white leading-tight tracking-tight">
              Plan Your Journey
            </h1>
          </div>

          <div className="mx-6 mb-3 rounded-2xl border border-white/30 bg-white/20 px-4 py-4 flex items-center gap-3">
            <div className="shrink-0">
              <MapPin className="w-5 h-5 text-[#8EC5FF]" strokeWidth={1.67} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#DBEAFE] tracking-wide">From :</div>
              <div className="text-[13px] text-[#DBEAFE] font-medium mt-0.5">Current Location</div>
            </div>
          </div>

          <div className="mx-6 rounded-2xl border border-white/30 bg-white/20 px-4 py-4 flex items-center gap-3">
            <div className="shrink-0">
              <Navigation className="w-5 h-5 text-[#8EC5FF]" strokeWidth={1.67} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#DBEAFE] tracking-wide">To :</div>
              <div className="text-[13px] text-[#DBEAFE] font-medium mt-0.5">Destination</div>
            </div>
          </div>
        </div>

        {/* WHITE CONTENT AREA */}
        <div className="bg-white rounded-t-[30px] -mt-[30px] relative z-10 px-6 pt-6 pb-6">
          <div className="mb-1">
            <h2 className="text-[17px] font-extrabold text-[#101828] tracking-tight">Preferred Options</h2>
          </div>
          <p className="text-[12px] text-[#4A5565] mb-4 leading-relaxed">
            Best routes based on your preferences
          </p>

          {/* ROUTE CARD 1 */}
          <div className="rounded-2xl border border-[#E5E7EB] mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F7FF 100%)' }}>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="text-[#2563EB]">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2563EB" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="2" width="12" height="11" rx="1.5" />
                      <line x1="1" y1="6" x2="13" y2="6" />
                      <line x1="5" y1="1" x2="5" y2="3" />
                      <line x1="9" y1="1" x2="9" y2="3" />
                      <circle cx="4" cy="9" r="0.5" fill="#2563EB" />
                      <circle cx="10" cy="9" r="0.5" fill="#2563EB" />
                    </svg>
                  </div>
                  <div className="text-[#2563EB]">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#2563EB" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 2V5M10 2V5M2 5H14" />
                      <path d="M12 8H13.5C13.5 8 13.8 7 13.95 6.4C14 6.2 14.05 5.9 14.05 5.7C14.05 5.5 14 5.3 13.95 5.1L13.3 3.1C13.15 2.6 12.6 2 12 2H4.5C4.2 2 3.9 2.1 3.7 2.3C3.5 2.5 3.4 2.8 3.4 3.1V8H5" />
                      <circle cx="6" cy="8.5" r="1" />
                      <line x1="7" y1="8.5" x2="9.5" y2="8.5" />
                      <circle cx="10.5" cy="8.5" r="1" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#DCFCE7] rounded-full px-2.5 py-1">
                  <TrendingUp className="w-3 h-3 text-[#008236]" strokeWidth={2} />
                  <span className="text-[10px] font-bold text-[#008236]">Eco</span>
                </div>
              </div>
              <h3 className="text-[15px] font-extrabold text-[#101828] mt-2.5">Metro + Bus</h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-[#4A5565]">
                <Clock className="w-3.5 h-3.5 text-[#4A5565]" strokeWidth={1.33} />
                <span className="text-[11px]">32 min</span>
                <span className="text-[11px] text-[#4A5565] mx-1">•</span>
                <span className="text-[#2563EB] text-[13px] font-bold">₹24.5</span>
              </div>
              <div className="border-t border-[#E5E7EB] mt-3 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#4A5565]">Occupancy</span>
                    <div className="flex items-center gap-1">
                      <span className="w-[18px] h-[6px] rounded-full bg-[#F59E0B]"></span>
                      <span className="w-[18px] h-[6px] rounded-full bg-[#F59E0B]"></span>
                      <span className="w-[18px] h-[6px] rounded-full bg-[#E5E7EB]"></span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#4A5565]">Moderate</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROUTE CARD 2 */}
          <div className="rounded-2xl border border-[#E5E7EB] mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F7FF 100%)' }}>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="text-[#2563EB]">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#2563EB" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 2V5M10 2V5M2 5H14" />
                      <path d="M12 8H13.5C13.5 8 13.8 7 13.95 6.4C14 6.2 14.05 5.9 14.05 5.7C14.05 5.5 14 5.3 13.95 5.1L13.3 3.1C13.15 2.6 12.6 2 12 2H4.5C4.2 2 3.9 2.1 3.7 2.3C3.5 2.5 3.4 2.8 3.4 3.1V8H5" />
                      <circle cx="6" cy="8.5" r="1" />
                      <line x1="7" y1="8.5" x2="9.5" y2="8.5" />
                      <circle cx="10.5" cy="8.5" r="1" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#DCFCE7] rounded-full px-2.5 py-1">
                  <TrendingUp className="w-3 h-3 text-[#008236]" strokeWidth={2} />
                  <span className="text-[10px] font-bold text-[#008236]">Eco</span>
                </div>
              </div>
              <h3 className="text-[15px] font-extrabold text-[#101828] mt-2.5">Direct Bus</h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-[#4A5565]">
                <Clock className="w-3.5 h-3.5 text-[#4A5565]" strokeWidth={1.33} />
                <span className="text-[11px]">52 min</span>
                <span className="text-[11px] text-[#4A5565] mx-1">•</span>
                <span className="text-[#2563EB] text-[13px] font-bold">₹25</span>
              </div>
              <div className="border-t border-[#E5E7EB] mt-3 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#4A5565]">Occupancy</span>
                    <div className="flex items-center gap-1">
                      <span className="w-[18px] h-[6px] rounded-full bg-[#EF4444]"></span>
                      <span className="w-[18px] h-[6px] rounded-full bg-[#EF4444]"></span>
                      <span className="w-[18px] h-[6px] rounded-full bg-[#EF4444]"></span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#4A5565]">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROUTE CARD 3 */}
          <div className="rounded-2xl border border-[#E5E7EB] mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F7FF 100%)' }}>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="text-[#2563EB]">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2563EB" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="2" width="12" height="11" rx="1.5" />
                      <line x1="1" y1="6" x2="13" y2="6" />
                      <line x1="5" y1="1" x2="5" y2="3" />
                      <line x1="9" y1="1" x2="9" y2="3" />
                      <circle cx="4" cy="9" r="0.5" fill="#2563EB" />
                      <circle cx="10" cy="9" r="0.5" fill="#2563EB" />
                    </svg>
                  </div>
                  <div className="text-[#2563EB]">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="#2563EB" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 11V9.7C3 8.5 3.6 7.9 3.6 6.5C3.6 5 4.4 3.2 6 3.2C7 3.2 7.3 4.2 7.3 5.1C7.3 6.8 6.2 8.2 6.2 9.8V11C6.2 11.3 6.1 11.6 5.9 11.8C5.7 12 5.4 12.1 5.1 12.1C4.8 12.1 4.5 12 4.3 11.8C4.1 11.6 4 11.3 4 11Z" />
                      <path d="M10 13V11.7C10 10.5 10.6 9.9 10.6 8.5C10.6 7 9.8 5.2 8.2 5.2C7.2 5.2 6.8 6.2 6.8 7.1C6.8 8.8 7.9 10.2 7.9 11.8V13C7.9 13.3 8 13.6 8.2 13.8C8.4 14 8.7 14.1 9 14.1C9.3 14.1 9.6 14 9.8 13.8C10 13.6 10.1 13.3 10.1 13Z" />
                      <line x1="7.9" y1="11" x2="10.1" y2="11" />
                      <line x1="4" y1="9" x2="6.2" y2="9" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#DCFCE7] rounded-full px-2.5 py-1">
                  <TrendingUp className="w-3 h-3 text-[#008236]" strokeWidth={2} />
                  <span className="text-[10px] font-bold text-[#008236]">Eco</span>
                </div>
              </div>
              <h3 className="text-[15px] font-extrabold text-[#101828] mt-2.5">Metro + Auto</h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-[#4A5565]">
                <Clock className="w-3.5 h-3.5 text-[#4A5565]" strokeWidth={1.33} />
                <span className="text-[11px]">44 min</span>
                <span className="text-[11px] text-[#4A5565] mx-1">•</span>
                <span className="text-[#2563EB] text-[13px] font-bold">₹49.5</span>
              </div>
              <div className="border-t border-[#E5E7EB] mt-3 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#4A5565]">Occupancy</span>
                    <div className="flex items-center gap-1">
                      <span className="w-[18px] h-[6px] rounded-full bg-[#E5E7EB]"></span>
                      <span className="w-[18px] h-[6px] rounded-full bg-[#E5E7EB]"></span>
                      <span className="w-[18px] h-[6px] rounded-full bg-[#E5E7EB]"></span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#4A5565]">—</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

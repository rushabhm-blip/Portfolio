import React from 'react';
import { 
  TrainFront, 
  BusFront, 
  User, 
  Droplet, 
  CircleParking, 
  Wallet,
  Wifi
} from 'lucide-react';
import RealisticQRCode from './RealisticQRCode';

export default function SkeuomorphicCityPass({
  cardId = "SC-1020-3040",
  balance = "840",
  onWalletClick = () => {}
}) {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none transition-all duration-300">
      
      {/* SKEUOMORPHIC TICKET CONTAINER */}
      <div 
        className="relative bg-[#FAF8F5] rounded-3xl overflow-hidden border border-[#E7E2D9] transition-all"
        style={{
          boxShadow: '0 25px 45px -12px rgba(15, 23, 42, 0.18), 0 8px 16px -6px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
        }}
      >
        
        {/* FAINT ARCHITECTURAL WATERMARK IN BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] overflow-hidden">
          <svg className="w-full h-full object-cover" viewBox="0 0 400 500" fill="none" stroke="currentColor">
            {/* Left Historic Monuments Sketch */}
            <path d="M40 320 L40 180 L60 140 L70 140 L70 90 L80 90 L80 180 M50 180 L70 180 M60 220 L60 260 M40 280 L80 280" strokeWidth="1.5" stroke="#1E293B" />
            <path d="M80 320 L80 160 L100 130 L110 130 L110 70 L120 70 L120 160 M90 160 L110 160" strokeWidth="1.5" stroke="#1E293B" />
            {/* Right Modern High-rise Towers Sketch */}
            <path d="M300 320 L300 120 L330 90 L350 90 L350 320 M310 140 L340 140 M310 180 L340 180 M310 220 L340 220" strokeWidth="1.5" stroke="#1E293B" />
            <path d="M340 320 L340 140 L365 110 L380 110 L380 320" strokeWidth="1.5" stroke="#1E293B" />
          </svg>
        </div>

        {/* LEFT TICKET PUNCH NOTCH */}
        <div 
          className="absolute left-[-14px] top-[54%] w-7 h-7 rounded-full bg-[#F8FAFC] border-r border-[#E7E2D9] z-20"
          style={{ boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.06)' }}
        />
        
        {/* RIGHT TICKET PUNCH NOTCH */}
        <div 
          className="absolute right-[-14px] top-[54%] w-7 h-7 rounded-full bg-[#F8FAFC] border-l border-[#E7E2D9] z-20"
          style={{ boxShadow: 'inset 2px 0 3px rgba(0,0,0,0.06)' }}
        />

        {/* ================= 1. HEADER ================= */}
        <div className="pt-5 px-6 flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            {/* City Skyline Icon */}
            <div className="text-gray-800">
              <svg className="w-6 h-6 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 21h18M5 21V7l5-3v17M10 11l4-2v12M14 14l5-2v9" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10h1M7 14h1M7 18h1M12 14h1M12 18h1M16 17h1" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight leading-none">
                CITY PASS
              </h2>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                SMART ACCESS. SMARTER CITY.
              </p>
            </div>
          </div>

          {/* Contactless / NFC Waves Symbol */}
          <div className="text-gray-700 flex items-center justify-center pt-0.5">
            <svg className="w-6 h-6 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            </svg>
          </div>
        </div>

        {/* ================= 2. CENTER QR CODE SECTION ================= */}
        <div className="px-6 pt-4 pb-2 flex flex-col items-center relative z-10 text-center">
          {/* Subtle Inset Frame around QR */}
          <div 
            className="p-3 bg-white rounded-2xl border border-gray-200/90"
            style={{
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06), 0 3px 8px rgba(0,0,0,0.04)'
            }}
          >
            <RealisticQRCode value={`SAJAG-${cardId}`} size={160} className="mx-auto" />
          </div>

          {/* Scan Subtitles */}
          <h3 className="text-xs font-black text-gray-900 tracking-wider uppercase mt-3">
            SCAN FOR ACCESS
          </h3>
          <p className="text-[9px] font-bold text-gray-500 tracking-widest uppercase mt-0.5">
            VALID FOR ALL SMART SERVICES
          </p>
        </div>

        {/* ================= 3. SERVICE ICONS ROW ================= */}
        <div className="px-6 py-2.5 relative z-10">
          <div 
            className="bg-[#F3EFE9]/90 rounded-2xl py-2 px-3 border border-[#E3DDD2] flex items-center justify-between"
            style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
          >
            {/* Metro */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center shadow-2xs">
                <TrainFront className="w-4 h-4 text-blue-600 stroke-[2.2]" />
              </div>
              <span className="text-[8px] font-black text-gray-600 tracking-wider">METRO</span>
            </div>

            {/* Bus */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shadow-2xs">
                <BusFront className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
              </div>
              <span className="text-[8px] font-black text-gray-600 tracking-wider">BUS</span>
            </div>

            {/* Washroom */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200/80 flex items-center justify-center shadow-2xs">
                <User className="w-4 h-4 text-purple-600 stroke-[2.2]" />
              </div>
              <span className="text-[8px] font-black text-gray-600 tracking-wider">WASHROOM</span>
            </div>

            {/* Water */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-cyan-50 border border-cyan-200/80 flex items-center justify-center shadow-2xs">
                <Droplet className="w-4 h-4 text-cyan-600 stroke-[2.2]" />
              </div>
              <span className="text-[8px] font-black text-gray-600 tracking-wider">WATER</span>
            </div>

            {/* Parking */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center shadow-2xs">
                <CircleParking className="w-4 h-4 text-amber-600 stroke-[2.2]" />
              </div>
              <span className="text-[8px] font-black text-gray-600 tracking-wider">PARKING</span>
            </div>
          </div>
        </div>

        {/* ================= 4. CARD ID & STATUS ROW ================= */}
        <div className="px-6 pt-1.5 pb-4 flex items-center justify-between relative z-10">
          <div className="text-left">
            <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider block">
              CARD ID
            </span>
            <span className="text-xs font-mono font-black text-gray-900 tracking-tight">
              {cardId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Smart Wallet Button */}
            <button 
              onClick={onWalletClick}
              className="flex items-center gap-1.5 bg-[#EAE5DC] hover:bg-[#DFD9CE] active:scale-95 px-3 py-1.5 rounded-xl border border-[#D5CDBD] text-gray-800 transition-all cursor-pointer shadow-2xs"
            >
              <Wallet className="w-3.5 h-3.5 text-gray-700" />
              <span className="text-[10px] font-bold">Smart Wallet</span>
            </button>

            {/* Valid Badge */}
            <div 
              className="bg-[#056042] text-white px-3 py-1.5 rounded-xl font-black text-[10px] tracking-wider uppercase flex items-center shadow-sm"
              style={{
                boxShadow: '0 2px 5px rgba(5, 96, 66, 0.4)'
              }}
            >
              VALID
            </div>
          </div>
        </div>

        {/* ================= 5. LUXURY NAVY & GOLD CURVED WAVE FOOTER ================= */}
        <div className="relative w-full bg-[#0A192F] text-white pt-4 pb-3 px-6 overflow-hidden">
          
          {/* Gold Decorative Wave Line Accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#CA8A04] via-[#FACC15] to-[#CA8A04] shadow-xs" />

          {/* Deep Subtle Curved Wave Shadow Graphic */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
              <path d="M0,0 C150,40 250,-20 400,20 L400,60 L0,60 Z" fill="#1E3A8A" />
            </svg>
          </div>

          <div className="flex items-center justify-between relative z-10 text-[8px]">
            <div className="text-left">
              <span className="text-[#94A3B8] font-extrabold uppercase tracking-wider block">
                HELPLINE
              </span>
              <span className="text-[#F1F5F9] font-bold tracking-tight text-[9px]">
                1800-SAJAG-HUB
              </span>
            </div>

            <div className="text-right">
              <span className="text-[#94A3B8] font-extrabold uppercase tracking-wider block">
                WEBSITE
              </span>
              <span className="text-[#F1F5F9] font-bold tracking-tight text-[9px]">
                www.sajag.gov.in
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

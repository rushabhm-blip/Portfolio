import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  QrCode, 
  Edit3, 
  ChevronRight, 
  Check
} from 'lucide-react';

export default function ProfileRegisteredView({ 
  profile, 
  onEditProfile, 
  onResetProfile, 
  onNavigate 
}) {
  const [showQRModal, setShowQRModal] = useState(false);

  // Fallback defaults matching design if not specified
  const fullName = profile?.fullName || 'Sahaj Sharma';
  const email = profile?.email || 'sahaj.sharma@example.com';
  const phone = profile?.phone || '+91 98765 43210';
  const city = profile?.city ? profile.city.split(' ')[0] : 'New Delhi';
  const emergencyContact = profile?.emergencyContact || '+91 91234 56789';
  const citizenPoints = profile?.citizenPoints ? profile.citizenPoints.toLocaleString() : '1,245';
  const walletBalance = profile?.walletBalance || '840';
  const co2SavedKg = profile?.co2SavedKg || '42.8';
  const firstLetter = fullName.charAt(0).toUpperCase();

  return (
    <div className="w-full h-full bg-[#FFFFFF] overflow-hidden flex flex-col font-sans antialiased text-[#0B1528] relative select-none animate-in fade-in slide-in-from-bottom-2 duration-350 ease-out">
      
      {/* SCROLLABLE MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-7 sm:pt-8 pb-10 space-y-6">
        
        {/* 1. TOP HEADER ROW */}
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-[32px] font-black text-[#0B1528] tracking-tight">
            Profile
          </h1>
          <button
            type="button"
            onClick={onEditProfile}
            className="w-11 h-11 rounded-xl border border-[#BFDBFE] text-[#155DFC] flex items-center justify-center hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
            title="Edit Profile"
            aria-label="Edit Profile"
          >
            <Edit3 className="w-5 h-5 stroke-[1.9]" />
          </button>
        </div>

        {/* 2. USER IDENTITY HERO ROW */}
        <div className="flex items-center gap-4 pt-1">
          {/* Avatar Circle */}
          <div className="w-[78px] h-[78px] rounded-full bg-[#E0EDFF] text-[#155DFC] flex items-center justify-center font-bold text-[32px] shrink-0 overflow-hidden shadow-xs">
            {profile?.avatar ? (
              <img 
                src={profile.avatar} 
                alt={fullName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span>{firstLetter}</span>
            )}
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[21px] font-bold text-[#0B1528] tracking-tight truncate leading-tight">
                {fullName}
              </h2>
              <div className="w-[18px] h-[18px] rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            </div>

            <p className="text-[13px] text-[#64748B] truncate mt-0.5">
              {email}
            </p>

            {/* Badges Row */}
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#155DFC] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full text-[12px] font-medium">
                <MapPin className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>{city}</span>
              </span>
              <span className="inline-flex items-center bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] px-2.5 py-0.5 rounded-full text-[12px] font-medium">
                Gold Citizen
              </span>
            </div>
          </div>
        </div>

        {/* 3. THREE-COLUMN STATS CARD */}
        <div className="bg-[#F0F6FF] rounded-2xl p-4.5 border border-[#DBEAFE]/80">
          <div className="grid grid-cols-3 divide-x divide-[#DBEAFE] text-center">
            
            {/* Citizen Points */}
            <div className="px-1">
              <div className="text-[22px] font-black text-[#155DFC] tracking-tight">
                {citizenPoints}
              </div>
              <div className="text-[12px] text-[#64748B] font-normal mt-0.5">
                Citizen points
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="px-1">
              <div className="text-[22px] font-black text-[#155DFC] tracking-tight">
                ₹{walletBalance}
              </div>
              <div className="text-[12px] text-[#64748B] font-normal mt-0.5">
                Wallet balance
              </div>
            </div>

            {/* CO2 Saved */}
            <div className="px-1">
              <div className="text-[22px] font-black text-[#155DFC] tracking-tight">
                {co2SavedKg} kg
              </div>
              <div className="text-[12px] text-[#64748B] font-normal mt-0.5">
                CO<sub>2</sub> saved
              </div>
            </div>

          </div>
        </div>

        {/* 4. CITY PASS CARD */}
        <div 
          onClick={() => setShowQRModal(true)}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50/40 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#E0EDFF] text-[#155DFC] flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#0B1528] leading-tight">
                City Pass
              </h3>
              <p className="text-[13px] text-[#64748B] mt-0.5">
                Transit & parking access
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
        </div>

        {/* 5. ACCOUNT & SAFETY CARD */}
        <div>
          <h4 className="text-[12px] font-bold text-[#64748B] tracking-wider uppercase mb-3">
            ACCOUNT & SAFETY
          </h4>

          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            {/* Phone Row */}
            <div 
              onClick={onEditProfile}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-[#64748B] stroke-[1.8] shrink-0" />
                <div>
                  <div className="text-[15px] font-medium text-[#0B1528] leading-tight">
                    Phone
                  </div>
                  <div className="text-[13px] text-[#64748B] mt-0.5">
                    {phone}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
            </div>

            {/* Emergency Contact Row */}
            <div 
              onClick={onEditProfile}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <User className="w-5 h-5 text-[#64748B] stroke-[1.8] shrink-0" />
                <div>
                  <div className="text-[15px] font-medium text-[#0B1528] leading-tight">
                    Emergency contact
                  </div>
                  <div className="text-[13px] text-[#64748B] mt-0.5">
                    {emergencyContact}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
            </div>

            {/* Security Settings Row */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <ShieldCheck className="w-5 h-5 text-[#64748B] stroke-[1.8] shrink-0" />
                <div className="text-[15px] font-medium text-[#0B1528]">
                  Security settings
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
            </div>
          </div>
        </div>

      </div>

      {/* 7. CITY PASS QR MODAL (When tapping City Pass) */}
      {showQRModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] text-center shadow-2xl relative border border-gray-100">
            <h3 className="text-base font-black text-gray-900">{fullName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Citizen ID: <strong className="text-gray-900 font-mono">SAJAG-IND-892</strong></p>

            <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-200 flex justify-center">
              <QrCode className="w-36 h-36 text-[#155DFC]" />
            </div>

            <p className="text-[11px] text-[#64748B] mt-3">
              Scan at metro gates, BMTC buses, and smart parking lots
            </p>

            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              className="w-full mt-4 py-2.5 bg-[#155DFC] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

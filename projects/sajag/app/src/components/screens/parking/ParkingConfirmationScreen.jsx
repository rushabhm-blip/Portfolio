import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Navigation, 
  QrCode, 
  Share2, 
  Copy, 
  Check, 
  Sparkles,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import RealisticQRCode from '../../common/RealisticQRCode';

export default function ParkingConfirmationScreen({ 
  bookingData, 
  onDone,
  onNavigateToSpot 
}) {
  const [copied, setCopied] = useState(false);

  const {
    spot,
    date = '2026-08-26',
    time = '03:30 PM',
    duration = 2,
    vehicleType = 'car',
    totalAmount = 60,
    confirmationCode = 'PKG-4782',
    slotNumber = 'B-14',
    paidAt = '03:32 PM'
  } = bookingData || {};

  const handleCopy = () => {
    navigator.clipboard?.writeText(confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      


      {/* 2. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 py-5 space-y-4 text-center">
        
        {/* SUCCESS ICON & HEADINGS */}
        <div className="pt-2 animate-in zoom-in-90 duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50 mb-3">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            You're All Set!
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Your parking spot is successfully reserved & guaranteed
          </p>
        </div>

        {/* CONFIRMATION TICKET PASS */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-lg text-left relative overflow-hidden">
          {/* Top header strip */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-gray-200">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Confirmation Code</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-black text-[#155DFC] font-mono tracking-wider">{confirmationCode}</span>
                <button 
                  onClick={handleCopy}
                  className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 active:scale-90 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Assigned Slot</span>
              <span className="text-base font-black text-gray-900 font-mono bg-blue-50 text-[#155DFC] px-2.5 py-0.5 rounded-lg border border-blue-200 inline-block mt-0.5">
                {slotNumber}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="py-3.5 space-y-2.5 border-b border-dashed border-gray-200 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Parking Lot</span>
              <h3 className="font-bold text-gray-900 mt-0.5">{spot?.name || 'Downtown Parking Lot'}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                <span>{spot?.location || '789 Main Street, City Center'}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Date & Time</span>
                <span className="font-bold text-gray-800">{date} • {time}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Duration & Fee</span>
                <span className="font-bold text-[#155DFC]">{duration}h (₹{totalAmount} Paid)</span>
              </div>
            </div>
          </div>

          {/* QR Code section */}
          <div className="pt-4 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner flex flex-col items-center">
              {/* Dynamic QR Code representation */}
              <RealisticQRCode value={confirmationCode || 'SAJAG-PARK-8492'} size={120} />
              <span className="text-[10px] font-bold text-gray-600 mt-2">
                Entry Gate QR Pass
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 max-w-[240px]">
              Scan this QR code or show code <strong className="text-gray-700">{confirmationCode}</strong> at the gate for automatic barrier lift
            </p>
          </div>
        </div>

        {/* HELPFUL NOTE */}
        <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/80 text-left text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#155DFC] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#155DFC] block">Live Navigation Ready</span>
            <p className="text-[11px] text-blue-900/80 mt-0.5">
              Turn-by-turn guidance to Slot {slotNumber} is ready. Smart sensors will detect your vehicle on arrival.
            </p>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM ACTION BAR */}
      <div className="bg-white border-t border-gray-200/90 p-4 shadow-xl shrink-0 space-y-2">
        <button
          onClick={onNavigateToSpot}
          className="w-full py-3.5 bg-gradient-to-r from-[#155DFC] to-[#1E40AF] hover:from-blue-700 hover:to-blue-900 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          <span>Navigate to Slot ({slotNumber})</span>
        </button>

        <button
          onClick={onDone}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl active:scale-98 transition-all cursor-pointer"
        >
          Back to Parking Finder
        </button>
      </div>

    </div>
  );
}

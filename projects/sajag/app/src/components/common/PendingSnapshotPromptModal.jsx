import React from 'react';
import { ShieldCheck, MapPin, Calendar, ArrowRight, X } from 'lucide-react';

export default function PendingSnapshotPromptModal({ 
  snapshot, 
  onReportNow, 
  onDismiss,
  onDiscard 
}) {
  if (!snapshot) return null;

  // Format date and time cleanly like "4 Oct · 6:20 PM"
  const cleanDate = snapshot.date ? snapshot.date.replace(/\s\d{4}$/, '') : '4 Oct';
  const cleanTime = snapshot.time || '6:20 PM';
  const displayLocation = snapshot.areaName || 'Near Shivaji Road';

  return (
    <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-[2500] animate-in fade-in duration-200">
      <div className="w-full max-w-[340px] bg-white rounded-[28px] shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        
        {/* TOP ROW: SHIELD ICON & CLOSE BUTTON */}
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center text-[#E11D48] shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>

          <button 
            onClick={onDismiss}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer transition-all active:scale-90"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* HEADINGS */}
        <div className="mt-4">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Location saved
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Ready to report what happened?
          </p>
        </div>

        {/* LOCATION DETAILS CARD */}
        <div className="mt-5 bg-[#F8FAFC] border border-gray-100/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-gray-100 flex items-center justify-center shrink-0 text-[#E11D48]">
            <MapPin className="w-4.5 h-4.5 fill-[#E11D48]/10 text-[#E11D48]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-gray-900 truncate">
              {displayLocation}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{cleanDate} · {cleanTime}</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={onReportNow}
            className="w-full py-3.5 bg-[#E11D48] hover:bg-[#D01740] active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-sm shadow-[#E11D48]/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Report incident</span>
            <ArrowRight className="w-4 h-4 stroke-[2.4]" />
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-3 bg-[#F1F5F9] hover:bg-gray-200/80 active:scale-[0.98] text-gray-800 font-bold text-xs rounded-2xl transition-all cursor-pointer text-center"
          >
            Later
          </button>

          <div className="pt-1 text-center">
            <button
              onClick={onDiscard}
              className="text-gray-400 hover:text-gray-600 font-semibold text-xs py-1 transition-colors cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

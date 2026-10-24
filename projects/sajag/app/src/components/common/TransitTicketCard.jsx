import React, { useState } from 'react';
import { 
  TrainFront, 
  BusFront, 
  ArrowRight, 
  QrCode, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Navigation
} from 'lucide-react';

export default function TransitTicketCard({ onShowQR = () => {} }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const H = isExpanded ? 236 : 96;

  const pathD = `
    M 16,1 
    L 270,1 
    A 10,10 0 0,0 290,1 
    L 334,1 
    A 15,15 0 0,1 349,16 
    L 349,${H - 16} 
    A 15,15 0 0,1 334,${H - 1} 
    L 290,${H - 1} 
    A 10,10 0 0,0 270,${H - 1} 
    L 16,${H - 1} 
    A 15,15 0 0,1 1,${H - 16} 
    L 1,16 
    A 15,15 0 0,1 16,1 
    Z
  `;

  return (
    <div 
      className="relative w-full transition-all duration-300 filter drop-shadow-xs select-none"
      style={{ height: `${H}px` }}
    >
      {/* 1. PHYSICAL TICKET SILHOUETTE (SVG Background with genuine inward notch cutouts) */}
      <svg 
        className="w-full h-full text-white transition-all duration-300" 
        viewBox={`0 0 350 ${H}`} 
        preserveAspectRatio="none"
      >
        {/* Ticket Outer Boundary with true inward bite notches */}
        <path 
          d={pathD}
          fill="white" 
          stroke="#E2E8F0" 
          strokeWidth="1.5"
          className="hover:stroke-blue-400 transition-colors"
        />

        {/* Vertical Perforated Tear Line connecting top & bottom notches */}
        <line 
          x1="280" 
          y1="11" 
          x2="280" 
          y2={H - 11} 
          stroke="#CBD5E1" 
          strokeWidth="1.5" 
          strokeDasharray="3,3" 
        />
      </svg>

      {/* 2. OVERLAY TICKET CONTENT */}
      <div className="absolute inset-0 flex items-stretch">
        
        {/* MAIN TICKET SECTION (LEFT 80%) */}
        <div className="flex-1 p-3.5 pr-3 flex flex-col justify-between overflow-hidden">
          
          {/* Station to Station Route Header */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between pb-1.5 border-b border-gray-100 cursor-pointer group/hdr"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-900">Shivaji Stadium</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
              <span className="text-xs font-bold text-gray-900">Cyber City</span>
            </div>
            <div className="flex items-center gap-1">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400 group-hover/hdr:text-gray-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover/hdr:text-gray-700" />
              )}
            </div>
          </div>

          {/* COLLAPSED VIEW (High Level Overview) */}
          {!isExpanded && (
            <div 
              onClick={() => setIsExpanded(true)}
              className="space-y-1 text-[11px] cursor-pointer"
            >
              {/* Metro Leg */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <TrainFront className="w-4 h-4 text-blue-600 stroke-[2.2] shrink-0" />
                  <span className="font-semibold text-gray-800 shrink-0">Yellow Line</span>
                  <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">Platform 2</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 shrink-0">In 2 min</span>
              </div>

              {/* Bus Leg */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <BusFront className="w-4 h-4 text-emerald-600 stroke-[2.2] shrink-0" />
                  <span className="font-semibold text-gray-800 shrink-0">Bus #502</span>
                  <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">Bay 4</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 shrink-0">In 6 min</span>
              </div>
            </div>
          )}

          {/* EXPANDED VIEW (DETAILED STOPS & TRANSFER TIMINGS) */}
          {isExpanded && (
            <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
              
              {/* Timeline Container with perfectly centered tracks */}
              <div className="space-y-0 text-[10.5px]">
                
                {/* 1. Origin Stop (Shivaji Stadium) */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1 pr-2">
                    <div className="flex flex-col items-center shrink-0 w-3 pt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100 shrink-0" />
                      <div className="w-0.5 h-5 bg-blue-300/80 my-0.5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-tight">Shivaji Stadium Metro</div>
                      <div className="text-[9px] text-gray-500">Board Yellow Line • Platform 2</div>
                    </div>
                  </div>
                  <span className="font-bold text-blue-600 text-[10px] font-mono shrink-0 pt-0.5">03:08 PM</span>
                </div>

                {/* 2. Transfer Stop (Sikanderpur Interchange) */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1 pr-2">
                    <div className="flex flex-col items-center shrink-0 w-3 pt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100 shrink-0" />
                      <div className="w-0.5 h-5 bg-amber-300/80 my-0.5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-tight">Sikanderpur Interchange</div>
                      <div className="text-[9px] text-amber-700 font-medium">Metro arrival • Exit Gate 4 to Bay 4</div>
                    </div>
                  </div>
                  <span className="font-bold text-gray-700 text-[10px] font-mono shrink-0 pt-0.5">03:26 PM</span>
                </div>

                {/* 3. Connecting Bus Leg */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1 pr-2">
                    <div className="flex flex-col items-center shrink-0 w-3 pt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-100 shrink-0" />
                      <div className="w-0.5 h-5 bg-emerald-300/80 my-0.5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-tight">Board AC Bus #502</div>
                      <div className="text-[9px] text-gray-500">Feeder Bay 4 • 3 stops</div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700 text-[10px] font-mono shrink-0 pt-0.5">03:28 PM</span>
                </div>

                {/* 4. Destination Arrival */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1 pr-2">
                    <div className="flex flex-col items-center shrink-0 w-3 pt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-900 ring-2 ring-gray-200 shrink-0" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-tight">Cyber City Gate 1 (DLF)</div>
                      <div className="text-[9px] text-emerald-700 font-bold">Estimated Arrival • 28 min</div>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-700 text-[10px] font-mono shrink-0 pt-0.5">03:36 PM</span>
                </div>

              </div>

              {/* Bottom Row: Collapse Button on Left, Larger Bold Price on Right */}
              <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="text-gray-500 hover:text-gray-900 font-bold hover:underline cursor-pointer flex items-center gap-0.5 text-[10px]"
                >
                  <span>Show Less</span>
                  <ChevronUp className="w-3 h-3" />
                </button>

                <div className="flex items-baseline gap-1 pr-1">
                  <span className="text-[9.5px] text-gray-400 font-medium uppercase tracking-wider">Fare:</span>
                  <span className="text-sm font-black text-gray-900 font-mono tracking-tight">₹24.50</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT DETACHABLE TRIP STUB (20%) - Tapping triggers full QR modal */}
        <div 
          onClick={onShowQR}
          className="w-[70px] flex flex-col items-center justify-center p-2 text-center shrink-0 space-y-1.5 cursor-pointer hover:bg-blue-50/40 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <QrCode className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[8.5px] font-bold text-gray-800 block leading-tight">
              1 Adult
            </span>
            <span className="text-[7.5px] font-bold text-blue-600 uppercase tracking-tight block">
              Show QR
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

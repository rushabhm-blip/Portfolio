import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Car, 
  Bike,
  Truck,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Minus,
  Plus
} from 'lucide-react';

export default function ReserveParkingScreen({ 
  spot, 
  onBack, 
  onProceed 
}) {
  const [selectedDate, setSelectedDate] = useState('2026-08-26');
  const [selectedTime, setSelectedTime] = useState('03:30 PM');
  const [durationHours, setDurationHours] = useState(2);
  const [vehicleType, setVehicleType] = useState('car');

  const hourlyRate = spot?.pricePerHour || 30;
  const totalAmount = hourlyRate * durationHours;

  const quickDurations = [1, 2, 4, 8];

  const vehicleOptions = [
    { id: 'car', label: 'Car / Sedan', icon: Car },
    { id: 'suv', label: 'SUV / 4x4', icon: Truck },
    { id: 'bike', label: 'Two-Wheeler', icon: Bike }
  ];

  const handleNext = () => {
    onProceed({
      spot,
      date: selectedDate,
      time: selectedTime,
      duration: durationHours,
      vehicleType,
      totalAmount
    });
  };

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      


      {/* 2. HEADER */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 shadow-2xs flex items-center gap-3 shrink-0">
        <button 
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">
            Reserve Parking
          </h1>
          <p className="text-xs text-gray-500 font-medium">{spot?.name || 'Smart Lot'}</p>
        </div>
      </div>

      {/* 3. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 py-4 space-y-4">
        
        {/* PARKING LOT DETAILS CARD */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900 leading-tight">
                {spot?.name || 'Downtown Parking Lot'}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center text-amber-500 font-black text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                  <span>4.8</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-black text-[#155DFC]">₹{hourlyRate}/hr</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Available ({spot?.availableSpots || 38} spots)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{spot?.location || '789 Main Street, City Center'}</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 text-[11px]">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#155DFC] font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" /> 24/7 Open
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> CCTV Secure
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> EV Charging
            </span>
          </div>
        </div>

        {/* SECTION: WHEN DO YOU NEED PARKING */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
            When do you need parking?
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Date Picker Card */}
            <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Date</span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-[#155DFC]" />
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-black text-gray-900 focus:outline-none w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Time Picker Card */}
            <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Start Time</span>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-[#155DFC]" />
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="bg-transparent text-xs font-black text-gray-900 focus:outline-none w-full cursor-pointer"
                >
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: HOW LONG WILL YOU STAY */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
              How long will you stay?
            </h3>
            <span className="text-xs font-bold text-[#155DFC]">
              {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}
            </span>
          </div>

          {/* Stepper counter */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
            <button
              onClick={() => setDurationHours((prev) => Math.max(1, prev - 1))}
              className="w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer font-bold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-base font-black text-gray-900 font-mono">{durationHours}</span>
              <span className="text-xs text-gray-500 font-medium ml-1">hrs</span>
            </div>
            <button
              onClick={() => setDurationHours((prev) => Math.min(24, prev + 1))}
              className="w-10 h-10 rounded-lg bg-[#155DFC] text-white shadow-xs flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick select pills */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {quickDurations.map((h) => (
              <button
                key={h}
                onClick={() => setDurationHours(h)}
                className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  durationHours === h
                    ? 'bg-[#155DFC] text-white border-[#155DFC] shadow-sm scale-102'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* SECTION: VEHICLE TYPE */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Vehicle Type
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {vehicleOptions.map((v) => {
              const Icon = v.icon;
              const isSel = vehicleType === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setVehicleType(v.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSel
                      ? 'bg-blue-50/80 border-[#155DFC] text-[#155DFC] ring-2 ring-blue-500/20'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-extrabold">{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. BOTTOM ACTION & PRICING BAR */}
      <div className="bg-white border-t border-gray-200/90 p-4 shadow-xl shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Amount</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#155DFC]">₹{totalAmount}</span>
              <span className="text-xs text-gray-400 font-medium">for {durationHours} hrs</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ✓ Instant Hold
            </span>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3.5 bg-gradient-to-r from-[#155DFC] to-[#1E40AF] hover:from-blue-700 hover:to-blue-900 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <span>Proceed to Payment</span>
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Your spot will be held for 10 minutes after reservation
        </p>
      </div>

    </div>
  );
}

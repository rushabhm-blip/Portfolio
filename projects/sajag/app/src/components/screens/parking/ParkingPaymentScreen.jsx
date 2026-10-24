import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Car,
  Smartphone,
  QrCode,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function ParkingPaymentScreen({ 
  bookingData, 
  onBack, 
  onPaySuccess 
}) {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const { spot, date, time, duration, vehicleType, totalAmount } = bookingData || {
    spot: { name: 'Downtown Parking Lot', location: '789 Main Street, City Center', pricePerHour: 30 },
    date: '2026-08-26',
    time: '03:30 PM',
    duration: 2,
    vehicleType: 'car',
    totalAmount: 60
  };

  const paymentMethods = [
    {
      id: 'card',
      title: 'Credit / Debit Card',
      subtitle: 'Visa, Mastercard, RuPay',
      icon: CreditCard,
      badge: 'Popular'
    },
    {
      id: 'upi',
      title: 'UPI & Google Pay',
      subtitle: 'Instant Pay via UPI ID or App',
      icon: Smartphone,
      badge: 'Zero Fee'
    },
    {
      id: 'applepay',
      title: 'Apple Pay / Digital Wallet',
      subtitle: 'One-touch secure checkout',
      icon: Lock,
      badge: null
    }
  ];

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaySuccess({
        ...bookingData,
        confirmationCode: `PKG-${Math.floor(1000 + Math.random() * 9000)}`,
        slotNumber: `B-${Math.floor(1 + Math.random() * 40)}`,
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      


      {/* 2. HEADER */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 shadow-2xs flex items-center gap-3 shrink-0">
        <button 
          onClick={onBack}
          disabled={isProcessing}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">
            Payment
          </h1>
          <p className="text-xs text-gray-500 font-medium">₹{bookingData?.totalAmount || 60} • {bookingData?.duration || 2} Hours</p>
        </div>
      </div>

      {/* 3. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 py-4 space-y-4">
        
        {/* RESERVATION SUMMARY CARD */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reservation Summary</span>
              <h2 className="text-sm font-black text-gray-900 mt-0.5">{spot?.name}</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#155DFC] text-[10px] font-extrabold">
              {duration} {duration === 1 ? 'hr' : 'hrs'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block">Date & Time</span>
              <span className="font-bold text-gray-800">{date} at {time}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block">Vehicle</span>
              <span className="font-bold text-gray-800 capitalize">{vehicleType}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block">Rate</span>
              <span className="font-bold text-gray-800">₹{spot?.pricePerHour}/hr</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold block">Taxes & Fees</span>
              <span className="font-bold text-emerald-600">₹0.00 (Included)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-xs font-bold text-gray-600">Total Payable</span>
            <span className="text-xl font-black text-[#155DFC]">₹{totalAmount}</span>
          </div>
        </div>

        {/* PAYMENT METHODS SECTION */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Select Payment Method
          </h3>

          <div className="space-y-2.5">
            {paymentMethods.map((m) => {
              const Icon = m.icon;
              const isSel = selectedMethod === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSel
                      ? 'bg-blue-50/70 border-[#155DFC] ring-2 ring-blue-500/20'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSel ? 'bg-[#155DFC] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-gray-900">{m.title}</h4>
                        {m.badge && (
                          <span className="text-[9px] font-extrabold bg-blue-100 text-[#155DFC] px-1.5 py-0.2 rounded">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">{m.subtitle}</p>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSel ? 'border-[#155DFC] bg-[#155DFC]' : 'border-gray-300'
                  }`}>
                    {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card Mock Input Preview */}
          {selectedMethod === 'card' && (
            <div className="mt-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-gray-700 font-bold">•••• •••• •••• 4242</span>
                <span className="text-gray-400 font-medium">Exp 12/28</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>Visa Platinum • SAJAG AutoPay</span>
                <span className="text-emerald-600 font-bold">Verified</span>
              </div>
            </div>
          )}
        </div>

        {/* SECURITY PROMISE */}
        <div className="flex items-center gap-2 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-emerald-800 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">256-Bit SSL Encrypted & Protected by SAJAG Smart Transit Gateways</span>
        </div>

      </div>

      {/* 4. BOTTOM ACTION BAR */}
      <div className="bg-white border-t border-gray-200/90 p-4 shadow-xl shrink-0">
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full py-3.5 bg-gradient-to-r from-[#155DFC] to-[#1E40AF] hover:from-blue-700 hover:to-blue-900 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-75"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Pay ₹{totalAmount}</span>
            </div>
          )}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          By clicking pay, you agree to the SAJAG Smart City Terms & Cancellation Policy
        </p>
      </div>

    </div>
  );
}

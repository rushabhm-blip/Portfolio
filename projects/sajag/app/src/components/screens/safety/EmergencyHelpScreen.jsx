import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  Users, 
  X, 
  ShieldAlert, 
  MessageSquare, 
  ExternalLink, 
  Check, 
  MapPin 
} from 'lucide-react';

export default function EmergencyHelpScreen({ onClose, onNavigate }) {
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  // Retrieve saved emergency contact from localStorage if available
  const savedProfile = (() => {
    try {
      const data = localStorage.getItem('sajag_user_profile');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  })();

  const personalContactNumber = savedProfile?.emergencyContact || '+91 91234 56789';
  const personalContactName = savedProfile?.emergencyContactName || 'Family / Guardian';

  const contactsList = [
    {
      id: '112',
      name: 'National Emergency Helpline',
      subtitle: 'Police, Ambulance & Fire Service (24/7)',
      number: '112',
      type: 'official',
      badge: 'Immediate'
    },
    {
      id: '1091',
      name: 'Women Safety Helpline',
      subtitle: 'Toll-free 24/7 rapid response dispatch',
      number: '1091',
      type: 'official',
      badge: 'Women Safety'
    },
    {
      id: 'personal',
      name: personalContactName,
      subtitle: 'Personal emergency contact',
      number: personalContactNumber,
      type: 'personal',
      badge: 'Trusted'
    }
  ];

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  const handleSendEmergencySMS = () => {
    setSmsSent(true);
    // Open SMS app with pre-filled SOS location
    const message = encodeURIComponent(
      `[EMERGENCY SOS via SAJAG] I need immediate assistance. My current approximate GPS location: Pune, MH (18.5204° N, 73.8567° E). Please check on me immediately.`
    );
    window.location.href = `sms:${personalContactNumber}?body=${message}`;
    setTimeout(() => setSmsSent(false), 3000);
  };

  const handleReturn = () => {
    if (onClose) {
      onClose();
    } else if (onNavigate) {
      onNavigate('safety');
    }
  };

  return (
    <div className="absolute inset-0 z-[2000] w-full h-full max-w-[430px] mx-auto bg-[#FAFBFD] flex flex-col justify-between overflow-y-auto selection:bg-red-100 no-scrollbar">
      {/* TOP NAVIGATION BAR */}
      <div className="w-full max-w-[430px] px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
        <button
          onClick={handleReturn}
          className="flex items-center space-x-1 text-[#0F172A] hover:opacity-75 active:scale-95 transition-all cursor-pointer -ml-1 py-1 px-2 rounded-lg"
          title="Return to Safety"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2] text-[#0F172A]" />
          <span className="text-base font-semibold text-[#0F172A] tracking-normal">Safety</span>
        </button>

        <span className="text-sm font-extrabold tracking-wider text-[#0F172A] uppercase select-none">
          SAJAG
        </span>
      </div>

      {/* MAIN HERO CONTENT */}
      <div className="w-full px-6 py-4 flex-1 flex flex-col items-center justify-center">
        {/* Soft Red Circular Graphic Backdrop with Phone + Shield Icon */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#FEE4E2]/80 flex items-center justify-center mx-auto transition-transform hover:scale-105 duration-300">
          <svg
            className="w-20 h-20 text-[#DC2626]"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Phone Handset outline */}
            <path
              d="M17 31C19.2 35.8 23.2 39.8 28 42L32.2 37.8C32.7 37.3 33.5 37.1 34.2 37.4C36.6 38.2 39.2 38.6 42 38.6C43.7 38.6 45 39.9 45 41.6V48C45 49.7 43.7 51 42 51C24.3 51 10 36.7 10 19C10 17.3 11.3 16 13 16H19.4C21.1 16 22.4 17.3 22.4 19C22.4 21.8 22.8 24.4 23.6 26.8C23.9 27.5 23.7 28.3 23.2 28.8L17 31Z"
              stroke="#DC2626"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Shield with Medical Cross */}
            <g transform="translate(14, 0)">
              {/* Shield Outline */}
              <path
                d="M32 9C27.5 9 23 7 23 7V19.5C23 25.5 27 29.8 32 32C37 29.8 41 25.5 41 19.5V7C41 7 36.5 9 32 9Z"
                stroke="#DC2626"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#FEE4E2"
              />
              {/* Medical Plus Cross */}
              <path
                d="M32 15V23"
                stroke="#DC2626"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M28 19H36"
                stroke="#DC2626"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* Headings */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1528] tracking-tight text-center mt-7">
          Emergency help
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#1E293B] text-center mt-2.5">
          Call 112 for immediate assistance.
        </p>
        <p className="text-sm text-[#64748B] text-center mt-1">
          Opens your phone dialer.
        </p>

        {/* PRIMARY CALL 112 ACTION BUTTON */}
        <div className="w-full mt-8">
          <button
            onClick={() => handleCall('112')}
            className="w-full py-4 px-6 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 shadow-[0_6px_20px_rgba(220,38,38,0.28)] cursor-pointer"
          >
            <Phone className="w-6 h-6 fill-white text-white stroke-none" />
            <span className="text-xl font-bold text-white tracking-wide">
              Call 112
            </span>
          </button>
        </div>

        {/* EMERGENCY CONTACTS CARD */}
        <div className="w-full mt-3.5">
          <button
            onClick={() => setShowContactsModal(true)}
            className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-4 flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] group-hover:bg-[#E2E8F0] flex items-center justify-center shrink-0 transition-colors">
                <Users className="w-6 h-6 text-[#475569]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B1528] tracking-tight">
                  Emergency contacts
                </h3>
                <p className="text-sm text-[#64748B] font-normal mt-0.5">
                  {contactsList.length} saved contacts
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
          </button>
        </div>

        {/* CANCEL BUTTON */}
        <div className="w-full mt-6">
          <button
            onClick={handleReturn}
            className="w-full py-3.5 px-6 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer shadow-xs"
          >
            <span className="text-base font-bold text-[#0B1528]">
              Cancel
            </span>
          </button>
        </div>

        {/* SUBTLE FOOTER CAPTION */}
        <button
          onClick={handleReturn}
          className="text-xs text-[#64748B] hover:text-[#0B1528] text-center mt-2.5 transition-colors cursor-pointer"
        >
          Return to Safety
        </button>
      </div>

      {/* SAVED EMERGENCY CONTACTS MODAL */}
      {showContactsModal && (
        <div className="absolute inset-0 z-[1200] bg-black/50 backdrop-blur-xs flex items-end justify-center">
          <div 
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 shadow-2xl max-h-[85%] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B1528]">Saved Emergency Contacts</h3>
                  <p className="text-xs text-gray-500">Tap to call or broadcast live emergency alert</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contacts List */}
            <div className="py-3 space-y-2.5 overflow-y-auto flex-1">
              {contactsList.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 rounded-2xl border border-gray-200/90 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all flex items-center justify-between"
                >
                  <div className="pr-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-[#0B1528]">{contact.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        contact.type === 'official' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {contact.badge}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{contact.subtitle}</div>
                    <div className="text-xs font-mono font-bold text-gray-700 mt-1">{contact.number}</div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {contact.type === 'personal' && (
                      <button
                        onClick={handleSendEmergencySMS}
                        title="Send SOS SMS with GPS"
                        className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                      >
                        {smsSent ? <Check className="w-4 h-4 text-emerald-600" /> : <MessageSquare className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleCall(contact.number)}
                      title={`Call ${contact.number}`}
                      className="px-3 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 fill-white" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick GPS Location Info Footer */}
            <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Pune Smart City live coordinates attached</span>
              </div>
              <button
                onClick={() => setShowContactsModal(false)}
                className="font-bold text-[#0B1528] hover:underline"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

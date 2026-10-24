import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  User, 
  ChevronRight,
  Home,
  Plane,
  ShieldAlert,
  CircleParking
} from 'lucide-react';
import ServicesIcon from '../../icons/ServicesIcon';

export default function ProfileWelcomeScreen({ 
  onCreateProfile, 
  onSkip, 
  onNavigate 
}) {
  const tabs = [
    { id: 'Home', label: 'Home', icon: Home, target: 'home' },
    { id: 'Travel', label: 'Travel', icon: Plane, target: 'travel' },
    { id: 'Safety', label: 'SAFETY', icon: ShieldAlert, target: 'safety' },
    { id: 'Services', label: 'Services', icon: ServicesIcon, target: 'services' },
    { id: 'Profile', label: 'Profile', icon: User, target: 'profile' }
  ];

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      


      {/* 2. MAIN BODY CONTENT */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-4 overflow-y-auto no-scrollbar">
        
        {/* WHITE CENTRAL CARD */}
        <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-xl border border-gray-100/80 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          
          {/* Circular Gradient Avatar Badge */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#155DFC] via-[#1E40AF] to-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4 ring-8 ring-blue-50">
            <User className="w-10 h-10" />
          </div>

          {/* Titles */}
          <h1 className="text-xl font-black text-[#101828] tracking-tight">
            Welcome to SAJAG
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Create your profile to get started
          </p>

          {/* Feature 1: Safe & Anonymous */}
          <div className="w-full mt-6 p-4 rounded-2xl bg-[#EFF6FF] border border-blue-100 flex items-start text-left gap-3.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#155DFC] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 leading-tight">
                Safe & Anonymous
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Your reports can be anonymous. Personal data is encrypted.
              </p>
            </div>
          </div>

          {/* Feature 2: Earn Rewards */}
          <div className="w-full mt-3 p-4 rounded-2xl bg-[#F0FDF4] border border-emerald-100 flex items-start text-left gap-3.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 leading-tight">
                Earn Rewards
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Get points for contributing to city improvement initiatives.
              </p>
            </div>
          </div>

          {/* Primary CTA: Create Profile */}
          <button
            onClick={onCreateProfile}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#155DFC] to-[#1E40AF] hover:from-blue-700 hover:to-blue-900 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <span>Create Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Secondary CTA: Skip for now */}
          <button
            onClick={onSkip}
            className="w-full mt-2.5 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Skip for now
          </button>

        </div>

      </div>

    </div>
  );
}

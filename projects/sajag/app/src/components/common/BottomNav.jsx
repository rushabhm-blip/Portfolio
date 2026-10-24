import React from 'react';
import { Home, Compass, Flag, User } from 'lucide-react';

export default function BottomNav({ activeTab = 'Home', onNavigate }) {
  const tabs = [
    { id: 'Home', label: 'Home', icon: Home, target: 'home' },
    { id: 'Explore', label: 'Explore', icon: Compass, target: 'explore' },
    { id: 'Report', label: 'Report', icon: Flag, target: 'citymakers' },
    { id: 'Profile', label: 'Profile', icon: User, target: 'profile' }
  ];

  return (
    <div className="w-full bg-white border-t border-gray-100 px-4 pt-2.5 pb-[max(14px,env(safe-area-inset-bottom,14px))] sm:pb-4 flex items-center justify-around z-40 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate && onNavigate(tab.target)}
            className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all cursor-pointer select-none"
          >
            <div className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
              isActive ? 'bg-[#E0EDFF] text-[#155DFC]' : 'text-[#64748B] hover:text-[#0B1528]'
            }`}>
              <Icon className="w-5 h-5 stroke-[2]" />
            </div>
            <span className={`text-[11px] mt-0.5 font-medium transition-colors ${
              isActive ? 'text-[#155DFC] font-bold' : 'text-[#64748B]'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Flag, 
  CheckCircle2, 
  Star, 
  Camera, 
  AlertTriangle, 
  Trash2, 
  Droplets, 
  Wind, 
  Lightbulb, 
  Trees, 
  ChevronRight, 
  ChevronDown,
  Award,
  Users,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Bookmark
} from 'lucide-react';

export default function CityMakersDashboard({ 
  stats = { reports: 8, resolved: 5, points: 340 }, 
  onSelectCategory, 
  onReportClick, 
  onViewFeed, 
  onBack,
  onNavigate 
}) {
  const categories = [
    { 
      id: 'pothole', 
      label: 'Pothole', 
      subtitle: 'Road Crater',
      icon: AlertTriangle
    },
    { 
      id: 'garbage', 
      label: 'Garbage', 
      subtitle: 'Waste / Litter',
      icon: Trash2
    },
    { 
      id: 'drainage', 
      label: 'Drainage', 
      subtitle: 'Waterlogging',
      icon: Droplets
    },
    { 
      id: 'smell', 
      label: 'Foul Smell', 
      subtitle: 'Air / Odor',
      icon: Wind
    },
    { 
      id: 'light', 
      label: 'Street Light', 
      subtitle: 'Broken / Dark',
      icon: Lightbulb
    },
    { 
      id: 'tree', 
      label: 'Tree / Plant', 
      subtitle: 'Hazard / Fallen',
      icon: Trees
    }
  ];

  const [showAllCategories, setShowAllCategories] = useState(false);

  const topContributors = [
    { name: 'Vikram Singh', reports: 15, resolved: 12, points: 312, rank: '1' },
    { name: 'Priya Malhotra', reports: 12, resolved: 9, points: 245, rank: '2' }
  ];

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      
      {/* 2. SCROLLABLE MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-6">
        
        {/* TOP HEADER */}
        <div className="bg-white px-5 pt-3.5 sm:pt-4.5 pb-4 border-b border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  City Makers
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Small actions. Better streets.
                </p>
              </div>
            </div>

            {/* Gold Badge Icon Button */}
            <div className="w-9 h-9 rounded-full border border-amber-200 bg-amber-50/60 flex items-center justify-center text-amber-500 shadow-2xs">
              <Bookmark className="w-4 h-4 fill-amber-400/20 text-amber-500" />
            </div>
          </div>

          {/* 3 STATS IN A SINGLE CARD DIVIDED BY LINES */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs grid grid-cols-3 divide-x divide-gray-100 p-3 mt-4">
            <div className="text-center px-1">
              <Flag className="w-4 h-4 text-blue-600 mx-auto mb-1 stroke-[2.2]" />
              <span className="text-lg font-black text-gray-900 block leading-tight">{stats.reports}</span>
              <span className="text-[11px] text-gray-500 font-medium">My reports</span>
            </div>
            <div className="text-center px-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1 stroke-[2.2]" />
              <span className="text-lg font-black text-gray-900 block leading-tight">{stats.resolved}</span>
              <span className="text-[11px] text-gray-500 font-medium">Resolved</span>
            </div>
            <div className="text-center px-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto mb-1" />
              <span className="text-lg font-black text-gray-900 block leading-tight">{stats.points}</span>
              <span className="text-[11px] text-gray-500 font-medium">Points</span>
            </div>
          </div>
        </div>

        {/* 3. HERO BANNER: EXACT MAKE YOUR STREET BETTER BANNER */}
        <div className="px-5 mt-4">
          <div 
            onClick={onReportClick}
            className="w-full relative overflow-hidden rounded-[26px] border border-blue-100/90 shadow-2xs cursor-pointer active:scale-[0.99] transition-all group"
          >
            <img 
              src="./make-street-better-banner.png" 
              alt="Make your street better - Report an issue in your neighbourhood" 
              className="w-full h-auto block select-none pointer-events-none group-hover:brightness-[0.98] transition-all"
            />
            {/* Clickable tactile hotspot matching the 'Report an issue' button in the graphic */}
            <div 
              className="absolute left-[3.5%] bottom-[12%] w-[48%] h-[38%] rounded-2xl cursor-pointer hover:bg-blue-600/10 active:bg-blue-600/20 transition-colors"
              title="Report an issue"
            />
          </div>
        </div>

        {/* 4. QUICK REPORT SECTION */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Quick report
            </h2>
            <button 
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-xs font-bold text-[#155DFC] hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
            >
              <span>{showAllCategories ? 'Show less' : 'View all'}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {(showAllCategories ? categories : categories.slice(0, 3)).map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat)}
                  className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-2xs hover:border-blue-200 active:scale-95 flex flex-col items-center justify-center transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#155DFC] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-gray-900 leading-tight text-center">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. COMMUNITY FEED BANNER */}
        <div className="px-5 mt-4">
          <div 
            onClick={onViewFeed}
            className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between cursor-pointer hover:border-gray-200 active:scale-[0.99] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-50 text-[#155DFC] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#155DFC] transition-colors">
                  Community feed
                </h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  5 active neighbourhood reports
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* 6. TOP CONTRIBUTORS LIST */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Top contributors
            </h2>
            <span className="text-xs font-bold text-[#155DFC]">
              This month
            </span>
          </div>

          <div className="space-y-2">
            {topContributors.map((c) => (
              <div
                key={c.name}
                className="p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100/80 text-[#155DFC] font-black text-xs flex items-center justify-center shrink-0">
                    {c.rank}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{c.name}</h4>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {c.reports} reports · {c.resolved} resolved
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#FEF9C3]/70 border border-amber-200/60 px-2.5 py-1 rounded-full text-amber-900 font-black text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{c.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

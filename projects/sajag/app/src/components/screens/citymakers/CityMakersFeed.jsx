import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
  Camera, 
  Trash2, 
  Droplets, 
  X,
  ChevronDown
} from 'lucide-react';

function RoadIcon({ className = "w-5 h-5 text-[#155DFC]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21L9 3" />
      <path d="M19 21L15 3" />
      <path d="M12 5V8" />
      <path d="M12 11V14" />
      <path d="M12 17V20" />
    </svg>
  );
}

export default function CityMakersFeed({ 
  onSelectIssue, 
  onBack, 
  onNavigate 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('Latest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const [feedItems, setFeedItems] = useState([
    {
      id: 'ISS-1235',
      title: 'Overflowing garbage bins',
      category: 'Garbage',
      iconType: 'garbage',
      priority: 'Urgent',
      priorityType: 'urgent', // red dot
      status: 'Acknowledged',
      location: 'Green Park Extension, Block C',
      coordinates: '28.5589° N, 77.2065° E',
      description: 'Uncollected for 3 days; blocking the footpath.',
      reportedAt: '1 day ago',
      reportedBy: 'Priya Malhotra',
      reporterPoints: '245 pts',
      upvotes: 34,
      commentsCount: 8,
      photosCount: 2
    },
    {
      id: 'ISS-1234',
      title: 'Pothole on Main Road',
      category: 'Roads',
      iconType: 'road',
      priority: 'High priority',
      priorityType: 'high', // orange dot
      status: 'In progress',
      location: 'Hauz Khas Main Road, near Metro',
      coordinates: '28.5494° N, 77.2001° E',
      description: 'Deep pothole near crossing; skidding risk.',
      reportedAt: '3 days ago',
      reportedBy: 'Vikram Singh',
      reporterPoints: '312 pts',
      upvotes: 47,
      commentsCount: 12,
      photosCount: 3
    },
    {
      id: 'ISS-1236',
      title: 'Open drain on street',
      category: 'Drainage',
      iconType: 'drainage',
      priority: 'Urgent',
      priorityType: 'urgent', // red dot
      status: 'Reported',
      location: 'Lajpat Nagar Central Market Lane 2',
      coordinates: '28.5700° N, 77.2400° E',
      description: 'Sewage overflow onto the street.',
      reportedAt: '4 hours ago',
      reportedBy: 'Aarav Sharma',
      reporterPoints: '85 pts',
      upvotes: 19,
      commentsCount: 4,
      photosCount: 1
    }
  ]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'garbage', label: 'Garbage' },
    { id: 'roads', label: 'Roads' },
    { id: 'drainage', label: 'Drainage' }
  ];

  const filteredFeed = feedItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedFilter === 'all') return true;
    return item.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handleUpvote = (e, issueId) => {
    e.stopPropagation();
    setFeedItems((prev) =>
      prev.map((item) =>
        item.id === issueId ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
  };

  const renderCategoryIcon = (type) => {
    if (type === 'garbage') return <Trash2 className="w-5 h-5 text-[#155DFC]" />;
    if (type === 'road') return <RoadIcon className="w-5 h-5 text-[#155DFC]" />;
    return <Droplets className="w-5 h-5 text-[#155DFC]" />;
  };

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      
      {/* 2. TOP HEADER */}
      <div className="bg-white px-5 pt-3.5 sm:pt-4.5 pb-3 border-b border-gray-100 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
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
                Community feed
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Local issues. Shared action.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setSelectedFilter(selectedFilter === 'all' ? 'garbage' : 'all')}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer text-gray-700"
            title="Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search area or issue"
            className="w-full bg-[#F3F4F6]/70 rounded-2xl pl-10 pr-9 py-2.5 text-xs font-medium text-gray-900 placeholder:text-gray-400 border border-gray-200/50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-400/30 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* CATEGORY PILLS & SORT DROPDOWN ROW */}
        <div className="flex items-center justify-between mt-3 pt-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => {
              const isSel = selectedFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                    isSel
                      ? 'bg-[#155DFC] text-white shadow-xs font-bold'
                      : 'bg-white border border-gray-200/80 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* LATEST SORT DROPDOWN */}
          <div className="relative shrink-0 ml-2">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
            >
              <span>{sortBy}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg p-1 z-50 min-w-[110px] animate-in fade-in zoom-in-95 duration-100">
                {['Latest', 'Most Upvoted', 'Urgent'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortBy(opt);
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      sortBy === opt ? 'bg-blue-50 text-[#155DFC] font-bold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SCROLLABLE FEED LIST */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 py-4 space-y-3.5">
        {filteredFeed.map((issue) => {
          return (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className="p-4 bg-white rounded-3xl border border-gray-100 shadow-2xs hover:border-blue-100 transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99] group"
            >
              {/* TOP ROW: ICON + TITLE + LOCATION */}
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 border border-blue-100/60 flex items-center justify-center shrink-0">
                  {renderCategoryIcon(issue.iconType)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#155DFC] transition-colors truncate">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate">{issue.location}</span>
                  </p>
                </div>
              </div>

              {/* STATUS & PRIORITY ROW */}
              <div className="flex items-center gap-2.5 mt-2.5">
                <span className="px-3 py-0.5 rounded-full border border-blue-200 bg-blue-50/60 text-[#155DFC] text-[11px] font-bold">
                  {issue.status}
                </span>

                <span className="text-gray-300 font-light select-none">|</span>

                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <span className={`w-2 h-2 rounded-full ${
                    issue.priorityType === 'urgent' ? 'bg-red-600' : 'bg-amber-500'
                  }`} />
                  <span>{issue.priority}</span>
                </div>
              </div>

              {/* DESCRIPTION TEXT */}
              <p className="text-xs text-gray-600 leading-relaxed mt-2.5">
                {issue.description}
              </p>

              {/* FOOTER ACTIONS: UPVOTE, COMMENTS, PHOTOS, TIME */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/80 text-xs">
                <div className="flex items-center gap-3">
                  {/* UPVOTE PILL BUTTON */}
                  <button
                    onClick={(e) => handleUpvote(e, issue.id)}
                    className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#155DFC] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="Upvote Issue"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 fill-[#155DFC]/10" />
                    <span>{issue.upvotes}</span>
                  </button>

                  {/* COMMENTS */}
                  <div className="flex items-center gap-1 text-gray-500 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <span>{issue.commentsCount}</span>
                  </div>

                  {/* PHOTOS */}
                  <div className="flex items-center gap-1 text-gray-500 font-medium">
                    <Camera className="w-3.5 h-3.5 text-gray-400" />
                    <span>{issue.photosCount}</span>
                  </div>
                </div>

                {/* TIME AGO */}
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{issue.reportedAt}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

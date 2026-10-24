import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  ThumbsUp, 
  MessageSquare, 
  Camera, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  User, 
  Send, 
  Trash2, 
  AlertTriangle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function CityMakersIssueDetails({ 
  issue, 
  onBack, 
  onNavigateToMap 
}) {
  const defaultIssue = {
    id: 'ISS-1235',
    title: 'Overflowing Garbage Bins',
    category: 'Garbage',
    icon: Trash2,
    iconBg: 'bg-orange-100 text-orange-600',
    priority: 'URGENT',
    status: 'ACKNOWLEDGED',
    location: 'Green Park Extension, Block C',
    coordinates: '28.5589° N, 77.2065° E',
    description: 'Bins not collected for 3 days, attracting stray animals and blocking the pedestrian walkway.',
    reportedAt: '5 hours ago',
    reportedBy: 'Priya Malhotra',
    reporterPoints: '189 points',
    upvotes: 34,
    commentsCount: 8,
    photosCount: 2
  };

  const current = issue || defaultIssue;
  const [upvotes, setUpvotes] = useState(current.upvotes || 34);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    { author: 'Vikram S.', time: '3h ago', text: 'Confirmed, visited this morning and trash is spilling onto road.' },
    { author: 'Sanitation Desk', time: '1h ago', text: 'Truck #DL-04-G assigned. Crew arriving in 45 mins.' }
  ]);

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
    } else {
      setUpvotes((prev) => prev - 1);
      setHasUpvoted(false);
    }
  };

  const handleAddComment = (e) => {
    e?.preventDefault();
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      { author: 'You', time: 'Just now', text: commentText }
    ]);
    setCommentText('');
  };

  const Icon = current.icon || AlertTriangle;

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      
      {/* 2. TOP CLEAN WHITE HEADER */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 shadow-2xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">
              Issue Details
            </h1>
            <p className="text-[11px] text-gray-500 font-mono font-medium">
              {current.id}
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 transition-all cursor-pointer border border-gray-200"
          title="Share Report"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* 3. SCROLLABLE DETAILS BODY */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 py-4 space-y-3.5">
        
        {/* ISSUE OVERVIEW CARD */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100/80 text-[#155DFC] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 leading-tight">
                  {current.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#155DFC] border border-blue-200 text-[10px] font-extrabold">
                    {current.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200 text-[10px] font-extrabold">
                    {current.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-700 leading-relaxed pt-1">
            {current.description}
          </p>

          {/* Location details card */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block leading-tight">{current.location}</span>
                <span className="text-[10px] text-gray-400 font-mono">{current.coordinates}</span>
              </div>
            </div>
            <button
              onClick={onNavigateToMap}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-[#155DFC] font-bold text-[10px] rounded-lg border border-gray-200 shadow-xs cursor-pointer active:scale-95"
            >
              Map View
            </button>
          </div>

          {/* 3 STATS PILLS */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-sm font-black text-[#155DFC] block">{upvotes}</span>
              <span className="text-[10px] text-blue-900/70 font-semibold">Upvotes</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
              <span className="text-sm font-black text-[#9333EA] block">{comments.length}</span>
              <span className="text-[10px] text-purple-900/70 font-semibold">Comments</span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100">
              <span className="text-sm font-black text-[#EA580C] block">{current.photosCount || 2}</span>
              <span className="text-[10px] text-orange-900/70 font-semibold">Photos</span>
            </div>
          </div>
        </div>

        {/* REPORTED BY CARD */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-[#9333EA] flex items-center justify-center font-bold text-sm">
              {current.reportedBy ? current.reportedBy.charAt(0) : 'P'}
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Reported By</span>
              <h4 className="text-xs font-black text-gray-900">{current.reportedBy || 'Priya Malhotra'}</h4>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-gray-400 font-medium text-[10px] block">{current.reportedAt}</span>
            <span className="text-emerald-600 font-extrabold text-[11px]">{current.reporterPoints || '189 pts'}</span>
          </div>
        </div>

        {/* STATUS UPDATES TIMELINE */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Resolution Timeline
          </h3>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 pl-8">
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <h5 className="text-xs font-black text-gray-900">Issue Reported</h5>
              <p className="text-[10px] text-gray-400 mt-0.5">Submitted by citizen with geo-tagged photos</p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-blue-100 text-[#155DFC] flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <h5 className="text-xs font-black text-gray-900">Acknowledged by Sanitation Dept.</h5>
              <p className="text-[10px] text-gray-400 mt-0.5">Assigned to Green Park Maintenance Ward #4</p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs animate-pulse">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <h5 className="text-xs font-black text-gray-900">Crew Dispatched</h5>
              <p className="text-[10px] text-amber-700 font-medium mt-0.5">Scheduled for cleanup today (ETA ~45 mins)</p>
            </div>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Community Comments ({comments.length})
          </h3>

          <div className="space-y-2.5">
            {comments.map((c, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">{c.author}</span>
                  <span className="text-[10px] text-gray-400">{c.time}</span>
                </div>
                <p className="text-gray-600 leading-snug">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Add comment input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment or update..."
              className="flex-1 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2.5 rounded-xl bg-[#9333EA] hover:bg-purple-700 active:scale-95 text-white disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* 4. BOTTOM ACTION BAR */}
      <div className="bg-white border-t border-gray-200/90 p-4 shadow-xl shrink-0 flex items-center gap-3">
        <button
          onClick={handleUpvote}
          className={`flex-1 py-3 font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer ${
            hasUpvoted 
              ? 'bg-[#155DFC] text-white shadow-blue-500/25' 
              : 'bg-blue-50 text-[#155DFC] hover:bg-blue-100 border border-blue-200'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-white' : ''}`} />
          <span>{hasUpvoted ? 'Upvoted' : 'Upvote'} ({upvotes})</span>
        </button>

        <button
          onClick={onBack}
          className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl active:scale-98 transition-all cursor-pointer"
        >
          Back to Feed
        </button>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ onGetStarted, onLogin }) {
  const [isExiting, setIsExiting] = useState(false);
  const [exitAction, setExitAction] = useState(null);

  const handleGetStartedClick = () => {
    if (isExiting) return;
    setIsExiting(true);
    setExitAction('start');
    
    // Coordinated delay: let the button ripple/press and screen exit motion play smoothly
    setTimeout(() => {
      if (onGetStarted) onGetStarted();
    }, 280);
  };

  const handleLoginClick = () => {
    if (isExiting) return;
    setIsExiting(true);
    setExitAction('login');
    
    setTimeout(() => {
      if (onLogin) onLogin();
    }, 280);
  };

  return (
    <div 
      className={`w-full h-full bg-white flex flex-col justify-between overflow-y-auto no-scrollbar select-none transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        isExiting 
          ? 'opacity-0 -translate-y-3 scale-[0.985] pointer-events-none' 
          : 'opacity-100 translate-y-0 scale-100 animate-in fade-in duration-500'
      }`}
    >
      
      {/* 1. TOP HEADER - SAJAG LOGO */}
      <div className="pt-5 sm:pt-7 pb-2 flex justify-center items-center shrink-0">
        <img 
          src="./welcome-logo.png" 
          alt="SAJAG" 
          className="h-8 sm:h-9 w-auto object-contain select-none"
          draggable={false}
        />
      </div>

      {/* 2. HERO ILLUSTRATION - Bengaluru Landmark & Mobility Scene */}
      <div className="flex-1 min-h-0 flex items-center justify-center w-full px-2 sm:px-4 py-1 overflow-hidden">
        <img 
          src="./welcome-illustration.png" 
          alt="Bengaluru Vidhana Soudha, Metro, and Auto-rickshaw" 
          className="w-full max-h-[52vh] sm:max-h-[56vh] object-contain select-none drop-shadow-xs transition-transform duration-300"
          draggable={false}
        />
      </div>

      {/* 3. BOTTOM CONTENT & ACTIONS */}
      <div className="px-6 sm:px-7 pt-2 pb-7 sm:pb-9 shrink-0 flex flex-col">
        {/* Headline */}
        <h1 className="text-[28px] sm:text-[32px] font-black tracking-tight text-[#071B49] leading-[1.18] font-sans">
          Feel at home<br />in Bengaluru.
        </h1>

        {/* Subtitle */}
        <p className="mt-2.5 text-[14px] sm:text-[15px] font-normal text-[#475467] leading-relaxed">
          Find your way, access city services, and make your neighbourhood better.
        </p>

        {/* Primary CTA Button */}
        <button
          type="button"
          onClick={handleGetStartedClick}
          disabled={isExiting}
          className={`mt-6 sm:mt-7 w-full h-[52px] sm:h-[56px] text-white font-semibold text-[15px] sm:text-[16px] rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(37,99,235,0.28)] transition-all cursor-pointer group relative overflow-hidden ${
            isExiting && exitAction === 'start'
              ? 'bg-[#1D4ED8] scale-[0.98] ring-4 ring-blue-300/60 shadow-lg'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.97] hover:shadow-[0_6px_20px_rgba(37,99,235,0.36)]'
          }`}
          aria-label="Get started"
        >
          {/* Subtle click shine effect */}
          {isExiting && exitAction === 'start' && (
            <span className="absolute inset-0 bg-white/15 animate-pulse" />
          )}

          <span>Get started</span>
          <ArrowRight 
            className={`w-5 h-5 transition-transform duration-200 ${
              isExiting && exitAction === 'start' ? 'translate-x-2' : 'group-hover:translate-x-1'
            }`} 
            strokeWidth={2.2} 
          />
        </button>

        {/* Login Alternative */}
        <div className="mt-4 text-center">
          <span className="text-[13px] sm:text-[14px] text-[#475467]">
            Already have an account?{' '}
          </span>
          <button
            type="button"
            onClick={handleLoginClick}
            disabled={isExiting}
            className={`text-[13px] sm:text-[14px] font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer active:opacity-75 transition-colors ${
              isExiting && exitAction === 'login' ? 'opacity-50' : ''
            }`}
          >
            Log in
          </button>
        </div>
      </div>

    </div>
  );
}

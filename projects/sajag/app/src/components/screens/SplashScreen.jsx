import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 1. Smooth entrance
    const t0 = setTimeout(() => {
      setHasStarted(true);
    }, 50);

    // 2. Automatically advance to app after presentation
    const t1 = setTimeout(() => {
      handleExit();
    }, 3200);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, []);

  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    try {
      if (window.NativeApp && window.NativeApp.onSplashFinished) {
        window.NativeApp.onSplashFinished();
      }
    } catch (e) {
      console.warn(e);
    }
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 450);
  };

  return (
    <div 
      onClick={handleExit}
      className={`absolute inset-0 z-[100] flex items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-450 ease-out ${
        isExiting 
          ? 'opacity-0 scale-[1.03] pointer-events-none' 
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #1A60FD 0%, #155DFC 50%, #0E4ED4 100%)'
      }}
      title="Tap anywhere to skip"
    >
      {/* 1. BACKGROUND IMAGE (Matches Image 1 with SAJAG branding & gradient) */}
      <img 
        src="./splash-bg.png" 
        alt="Sajag Background" 
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-1000 ease-out"
      />

      {/* 2. AMBIENT GLOW OVERLAY */}
      <div 
        className={`absolute w-[360px] h-[360px] rounded-full bg-blue-400/20 blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          hasStarted ? 'opacity-100 scale-110' : 'opacity-0 scale-75'
        }`}
      />

      {/* 3. ANIMATED SKYLINE SILHOUETTES AT BOTTOM (Doubled size, sitting flush at the bottom edge) */}
      <div 
        className={`absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none z-20 h-48 sm:h-56 transition-opacity duration-700 ease-out ${
          hasStarted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex w-max animate-skyline-scroll">
          {/* Track 1 */}
          <div className="flex shrink-0">
            <img 
              src="./skyline-silhouette.png" 
              alt="City Skyline" 
              className="h-48 sm:h-56 w-auto shrink-0 select-none object-contain brightness-0 invert opacity-45 drop-shadow-[0_4px_16px_rgba(255,255,255,0.22)]" 
            />
            <img 
              src="./skyline-silhouette.png" 
              alt="City Skyline" 
              className="h-48 sm:h-56 w-auto shrink-0 select-none object-contain brightness-0 invert opacity-45 drop-shadow-[0_4px_16px_rgba(255,255,255,0.22)]" 
            />
          </div>
          {/* Track 2 (Seamless loop duplicate) */}
          <div className="flex shrink-0">
            <img 
              src="./skyline-silhouette.png" 
              alt="City Skyline" 
              className="h-48 sm:h-56 w-auto shrink-0 select-none object-contain brightness-0 invert opacity-45 drop-shadow-[0_4px_16px_rgba(255,255,255,0.22)]" 
            />
            <img 
              src="./skyline-silhouette.png" 
              alt="City Skyline" 
              className="h-48 sm:h-56 w-auto shrink-0 select-none object-contain brightness-0 invert opacity-45 drop-shadow-[0_4px_16px_rgba(255,255,255,0.22)]" 
            />
          </div>
        </div>
      </div>

      {/* 4. BOTTOM PROGRESS BAR INDICATOR */}
      <div 
        className={`absolute bottom-2 flex flex-col items-center transition-all duration-500 z-30 ${
          hasStarted ? 'opacity-60' : 'opacity-0'
        }`}
      >
        <div className="w-12 h-0.5 bg-white/25 rounded-full overflow-hidden">
          <div className="h-full bg-white/90 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

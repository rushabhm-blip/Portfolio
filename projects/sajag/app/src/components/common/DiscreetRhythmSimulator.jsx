import React, { useState, useEffect } from 'react';
import { Smartphone, Zap, CheckCircle2, X, ShieldAlert, Radio } from 'lucide-react';
import { powerRhythmTracker, triggerSilentSnapshot } from '../../services/safetySnapshotService';

export default function DiscreetRhythmSimulator({ onSnapshotCaptured }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastMatched, setLastMatched] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleManualPress = () => {
    const result = powerRhythmTracker.recordPress();
    setTapCount(result.count || 0);

    if (result.matched) {
      setLastMatched(true);
      setFeedbackMsg('Rhythm Matched (2+2)! Location Snapshot Captured.');
      if (onSnapshotCaptured) onSnapshotCaptured();
      setTimeout(() => {
        setLastMatched(false);
        setTapCount(0);
        setIsOpen(false);
      }, 1500);
    } else {
      setFeedbackMsg(`Press registered (${result.count || 1}/4)`);
    }
  };

  const handleInstantTrigger = async () => {
    setLastMatched(true);
    setFeedbackMsg('Capturing Location Snapshot...');
    const snap = await triggerSilentSnapshot();
    if (onSnapshotCaptured) onSnapshotCaptured(snap);
    setTimeout(() => {
      setLastMatched(false);
      setIsOpen(false);
    }, 1200);
  };

  return (
    <>
      {/* DISCREET FLOATING HARDWARE TRIGGER PILL (Bottom left of screen) */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-20 left-4 z-[900] bg-gray-900/90 hover:bg-black text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer group"
        title="Test Power Button Rhythm (press-press, press-press)"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse group-hover:scale-125 transition-transform" />
        <span className="text-gray-300">Power Rhythm:</span>
        <span className="text-rose-400 font-mono font-black">2 + 2</span>
      </button>

      {/* INTERACTIVE SIMULATOR POPUP */}
      {isOpen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[2600] animate-in fade-in duration-150">
          <div className="w-full max-w-[340px] bg-white rounded-3xl shadow-2xl border border-gray-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-900">Power Button Simulator</h3>
                  <p className="text-[10px] text-gray-500">Rhythm: Press • Press ... Press • Press</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-gray-600 leading-snug">
              In real life, press your physical phone power button twice quickly, pause a moment, then twice again. 
              You can test the rhythm below or press the <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-[10px] font-bold">P</kbd> key on your keyboard.
            </p>

            {/* RHYTHM TAP BUTTON */}
            <div className="space-y-2">
              <button
                onClick={handleManualPress}
                className="w-full py-4 bg-gradient-to-b from-gray-800 to-gray-950 hover:from-gray-700 hover:to-gray-900 text-white font-extrabold text-xs rounded-2xl shadow-md border border-gray-700/80 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>TAP TO SIMULATE POWER BUTTON</span>
                </div>
                <span className="text-[9px] text-gray-400 font-mono">
                  (Rhythm: Tap-Tap, Pause, Tap-Tap)
                </span>
              </button>

              {/* Instant Auto Trigger */}
              <button
                onClick={handleInstantTrigger}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-bold text-[11px] rounded-xl border border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-rose-600" />
                <span>Trigger 2+2 Rhythm Instantly</span>
              </button>
            </div>

            {/* FEEDBACK STATUS */}
            {feedbackMsg && (
              <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                lastMatched ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {lastMatched ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />}
                <span className="truncate">{feedbackMsg}</span>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ArrowRight } from 'lucide-react';

export default function SavingsSuccessScreen({ 
  amountAdded = 500, 
  newBalance = 1428, 
  onDone, 
  onContinueLearning 
}) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const hasAnimatedRef = useRef(false);

  // Preload all assets immediately on mount
  useEffect(() => {
    const assets = [
      './assets/success_disc.png',
      './assets/success_checkmark.png',
      './assets/success_coin.png',
      './assets/success_calendar_icon.png',
      './assets/success_book_icon.png'
    ];
    assets.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // 800ms total animation duration: freeze into static held state after 820ms
  useEffect(() => {
    if (hasAnimatedRef.current) {
      setAnimationComplete(true);
      return;
    }
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      hasAnimatedRef.current = true;
    }, 820);

    return () => clearTimeout(timer);
  }, []);

  const formattedAmount = Number(amountAdded).toLocaleString('en-IN');
  const formattedBalance = Number(newBalance).toLocaleString('en-IN');

  return (
    <div className="gullak-success-screen" role="region" aria-label="Savings Successful Screen">
      {/* Top Header: GULLAK brand label & Close X */}
      <header className="success-header">
        <span className="success-brand-title">GULLAK</span>
        <button 
          className="success-close-btn" 
          onClick={onDone} 
          aria-label="Close"
          type="button"
        >
          <X size={20} strokeWidth={2.4} color="#1e2430" />
        </button>
      </header>

      {/* Scrollable / Centered Body */}
      <div className="success-content-body">
        {/* Responsive Animation Container in empty area above heading */}
        <div className="success-anim-container" aria-hidden="true">
          <div className={`success-stage ${animationComplete ? 'held-still' : ''}`}>
            {/* Layer 0: Ground Soft Shadow (strengthens as coin lands) */}
            <div className="success-layer-shadow"></div>

            {/* Layer 1: Lavender Disc (Behind, centered, 0–150ms scale 92%->100%) */}
            <img 
              src="./assets/success_disc.png" 
              alt="" 
              className="success-layer-disc"
              draggable={false}
            />

            {/* Layer 2: White Checkmark (Centered on visible front face of disc, ~48% visible width, 100–400ms) */}
            <img 
              src="./assets/success_checkmark.png" 
              alt="" 
              className="success-layer-checkmark"
              draggable={false}
            />

            {/* Layer 3: Gold Coin (In front, overlapping lower-right edge, ~45% visible width, 150–800ms drop & bounce) */}
            <img 
              src="./assets/success_coin.png" 
              alt="" 
              className="success-layer-coin"
              draggable={false}
            />
          </div>
        </div>

        {/* Headings */}
        <div className="success-headings-group">
          <h1 className="success-main-headline">
            A little saved.<br />A step forward.
          </h1>
          <p className="success-added-subtitle">
            ₹{formattedAmount} added to your Gullak
          </p>
        </div>

        {/* Gullak Balance Display */}
        <div className="success-balance-section">
          <div className="success-balance-label">GULLAK BALANCE</div>
          <div className="success-balance-value">₹{formattedBalance}</div>
        </div>

        {/* Information Cards */}
        <div className="success-cards-group">
          {/* Card 1: Habit / Saved Today card (light lavender accent) */}
          <div className="success-habit-card">
            <div className="habit-card-icon-wrap">
              <img 
                src="./assets/success_calendar_icon.png" 
                alt="Calendar" 
                className="habit-card-icon"
                draggable={false}
              />
            </div>
            <div className="habit-card-divider"></div>
            <div className="habit-card-text">
              <div className="habit-card-title">You saved today</div>
              <div className="habit-card-desc">Keep building your saving habit.</div>
            </div>
          </div>

          {/* Card 2: Next money move smarter (link to learning) */}
          <div 
            className="success-learn-card" 
            onClick={onContinueLearning}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onContinueLearning();
              }
            }}
          >
            <div className="learn-card-icon-wrap">
              <img 
                src="./assets/success_book_icon.png" 
                alt="Book" 
                className="learn-card-icon"
                draggable={false}
              />
            </div>
            <div className="learn-card-text">
              <div className="learn-card-title">Make your next money move smarter</div>
              <div className="learn-card-desc">Pick up where you left off.</div>
            </div>
            <ChevronRight size={18} strokeWidth={2.4} color="#94a3b8" className="learn-card-chevron" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="success-actions-group">
          <button 
            className="success-done-btn" 
            onClick={onDone}
            type="button"
          >
            Done
          </button>

          <button 
            className="success-continue-learn-link" 
            onClick={onContinueLearning}
            type="button"
          >
            <span>Continue learning</span>
            <ArrowRight size={15} strokeWidth={2.4} />
          </button>
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="success-home-indicator"></div>
      </div>
    </div>
  );
}

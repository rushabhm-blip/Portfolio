import React, { useEffect, useRef, useState } from 'react';

export default function PortfolioDonutChart({
  data = [],
  totalValue = 12450,
  selectedCategory = null,
  onSelectCategory,
  holdingsCount = 3
}) {
  const [progress, setProgress] = useState(0);

  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Clockwise reveal over ~800ms after data loads
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }

    let startTime = null;
    let rafId = null;
    const DURATION = 800; // ms

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / DURATION);
      // smooth ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);

      if (t < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  // Donut geometry constants
  const size = 180;
  const strokeWidth = 26;
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4; // ~73px
  const circumference = 2 * Math.PI * radius;

  // Calculate segment angles and strokeDasharray / strokeDashoffset
  // Segments order in screenshot (clockwise starting from top 12 o'clock / -90deg):
  // 1. Mutual funds (lavender #A78BFA) ~ 60%
  // 2. Fixed deposit (blue #60A5FA) ~ 25%
  // 3. Gold (peach/orange #FDBA74) ~ 15%
  let accumulatedAngle = 0;

  const segments = data.map((item) => {
    const fraction = totalValue > 0 ? item.amount / totalValue : 0;
    const arcLength = fraction * circumference;
    const rotation = accumulatedAngle - 90; // Start at 12 o'clock
    accumulatedAngle += fraction * 360;

    const isSelected = selectedCategory === item.id;
    const isOtherSelected = selectedCategory && selectedCategory !== item.id;

    return {
      ...item,
      fraction,
      arcLength,
      rotation,
      isSelected,
      isOtherSelected
    };
  });

  return (
    <div className="portfolio-donut-wrap" aria-label={`Asset allocation chart: ${data.map(d => `${d.label} ${d.percentage}%`).join(', ')}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="portfolio-donut-svg"
      >
        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        {/* Revealed segments */}
        {segments.map((seg) => {
          // Progress-based reveal: each segment reveals clockwise
          const revealedArc = seg.arcLength * progress;
          const strokeDasharray = `${revealedArc} ${circumference}`;

          return (
            <circle
              key={seg.id}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={seg.isSelected ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={0}
              transform={`rotate(${seg.rotation} ${center} ${center})`}
              className={`donut-segment-circle ${seg.isSelected ? 'selected' : ''} ${seg.isOtherSelected ? 'dimmed' : ''}`}
              onClick={() => onSelectCategory && onSelectCategory(seg.id)}
              style={{
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease',
                opacity: seg.isOtherSelected ? 0.45 : 1,
                filter: seg.isSelected ? `drop-shadow(0 0 6px ${seg.color})` : 'none'
              }}
            />
          );
        })}
      </svg>

      {/* Center inner label: "3 holdings" (or selected category count) */}
      <div 
        className="portfolio-donut-center"
        onClick={() => onSelectCategory && onSelectCategory(null)}
        role="button"
        tabIndex={0}
        aria-label="Reset filter to all holdings"
      >
        <span className="donut-center-count">{holdingsCount}</span>
        <span className="donut-center-text">holdings</span>
      </div>
    </div>
  );
}

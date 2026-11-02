import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Volume2, 
  VolumeX, 
  X,
  Home as HomeIcon,
  BookOpen,
  PieChart,
  MoreHorizontal
} from 'lucide-react';
import MunshijiConversation from './MunshijiConversation';

const HOTSPOTS = [
  {
    id: 'elephant',
    name: 'Gullak Elephant',
    feature: 'Gullak',
    desc: 'Your regular savings pot & 11-day habit streak.',
    tab: 'gullak',
    badge: '₹928 saved',
    x: 21.0,   // % from left of panorama
    y: 56.0,  // % from top of panorama
    color: '#8b5cf6',
    icon: '🐘'
  },
  {
    id: 'books',
    name: 'Lesson Books',
    feature: 'Learn',
    desc: '“The magic of compounding” · Lesson 4 (3 min).',
    tab: 'learn',
    badge: 'Resume L4',
    x: 35.6,
    y: 67.0,
    color: '#3b82f6',
    icon: '📚'
  },
  {
    id: 'radio',
    name: 'Vintage Radio',
    feature: 'Radio',
    desc: 'Audio lessons on budgeting, investments & markets.',
    tab: 'radio',
    badge: 'Ep. 3 ready',
    x: 20.0,
    y: 16.0,
    color: '#ec4899',
    icon: '📻'
  },
  {
    id: 'clock',
    name: 'Target Clock',
    feature: 'Goals',
    desc: 'Track time horizons and milestone targets.',
    tab: 'goals',
    badge: '3 Goals active',
    x: 73.0,
    y: 16.0,
    color: '#ef4444',
    icon: '🎯'
  },
  {
    id: 'ledger',
    name: 'Munshiji’s Ledger',
    feature: 'Portfolio',
    desc: 'All your investments, mutual funds & net worth.',
    tab: 'portfolio',
    badge: 'Overview',
    x: 74.0,
    y: 76.0,
    color: '#10b981',
    icon: '📖'
  }
];

export default function MunshijiRoom({ onClose, onNavigateTab, motionEnabled, onToggleMotion }) {
  const containerRef = useRef(null);
  const panoRef = useRef(null);
  
  // Interaction Mode: 'exploring' | 'conversation'
  const [interactionMode, setInteractionMode] = useState('exploring');
  
  // Pan state: panX is pixel offset of panorama (0 to maxPan)
  const [panX, setPanX] = useState(0);
  const [maxPan, setMaxPan] = useState(0);
  
  // Remembered position before entering conversation
  const rememberedPanXRef = useRef(0);
  const conversationRef = useRef(null);
  
  // Gaze pose: 'left' | 'center' | 'right'
  const [gazePose, setGazePose] = useState('center');
  
  // Mouth state for conversation mode ('closed' | 'narrow' | 'open' | 'rounded')
  // The character base (eyes, turban, torso, glasses, hands) remains 100% stationary.
  const [mouthState, setMouthState] = useState('closed');

  // Body pose for independent hand gestures:
  // 'resting' | 'lift' | 'inward' | 'open_high' | 'open_hold' | 'lowering' | 'near_rest'
  const [bodyPose, setBodyPose] = useState('resting');

  // Audio state
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isAmbientDucked, setIsAmbientDucked] = useState(false);

  // Active Hotspot Drawer
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [motionCalibratedOffset, setMotionCalibratedOffset] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(0);
  const [roomNotification, setRoomNotification] = useState(null);

  // Auto-dismissing Tooltip State
  const [showTooltip, setShowTooltip] = useState(true);
  const [isTooltipLeaving, setIsTooltipLeaving] = useState(false);

  // Preload and decode exploration and conversation assets on mount
  useEffect(() => {
    const assetsToPreload = [
      './assets/munshiji_sprite_center.png',
      './assets/munshiji_sprite_left.png',
      './assets/munshiji_sprite_right.png',
      './assets/conversation/body_resting.png',
      './assets/conversation/body_lift.png',
      './assets/conversation/body_inward.png',
      './assets/conversation/body_open_high.png',
      './assets/conversation/body_open_hold.png',
      './assets/conversation/body_lowering.png',
      './assets/conversation/body_near_rest.png',
      './assets/conversation/mouth_closed.png',
      './assets/conversation/mouth_narrow.png',
      './assets/conversation/mouth_open.png',
      './assets/conversation/mouth_rounded.png'
    ];
    assetsToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  }, []);

  // Ambient sound system (synthesizer-based, duckable, muteable)
  const ambientCtxRef = useRef(null);
  const ambientGainRef = useRef(null);

  useEffect(() => {
    if (!isAudioMuted && !ambientCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          ambientCtxRef.current = ctx;

          const osc1 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(110, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(260, ctx.currentTime);

          gain.gain.setValueAtTime(0.018, ctx.currentTime);
          ambientGainRef.current = gain;

          osc1.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
        }
      } catch {
        // audio context setup
      }
    }

    if (ambientGainRef.current && ambientCtxRef.current) {
      const now = ambientCtxRef.current.currentTime;
      if (isAudioMuted) {
        ambientGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      } else if (isAmbientDucked) {
        ambientGainRef.current.gain.linearRampToValueAtTime(0.004, now + 0.3); // Duck to ~20%
      } else {
        ambientGainRef.current.gain.linearRampToValueAtTime(0.018, now + 0.3); // Normal volume
      }
    }
  }, [isAudioMuted, isAmbientDucked]);

  useEffect(() => {
    return () => {
      if (ambientCtxRef.current) {
        try {
          ambientCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsTooltipLeaving(true);
    }, 3800);
    const removeTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 4300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);
  
  // Dragging interaction
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPanXRef = useRef(0);
  const panXRef = useRef(0);
  panXRef.current = panX;

  // Smoothing animation frame ref
  const targetPanXRef = useRef(0);
  const animFrameRef = useRef(null);

  const showToast = (msg) => {
    setRoomNotification(msg);
    setTimeout(() => setRoomNotification(null), 2400);
  };

  // Recenter helper
  const recenter = useCallback(() => {
    if (panoRef.current && containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      const panoW = panoRef.current.clientWidth;
      const centerPan = Math.max(0, Math.min(panoW - containerW, panoW * 0.532 - containerW / 2));
      targetPanXRef.current = centerPan;
      setPanX(centerPan);
      setMotionCalibratedOffset(tiltAngle);
      showToast('Centered on Munshiji 🎯');
    }
  }, [tiltAngle]);

  // Transition to Conversation Mode
  const handleEnterConversation = useCallback(() => {
    if (interactionMode === 'conversation') return;

    // 1. Remember the current room pan position
    rememberedPanXRef.current = panXRef.current;

    // 2. Set mode to conversation and reset mouth to closed and body to resting
    setInteractionMode('conversation');
    setGazePose('center');
    setMouthState('closed');
    setBodyPose('resting');

    // 3. Smoothly center room on Munshiji over 400-600ms without visual jump
    if (containerRef.current && panoRef.current) {
      const containerW = containerRef.current.clientWidth;
      const panoW = panoRef.current.clientWidth;
      const max = Math.max(0, panoW - containerW);
      const centerPan = Math.max(0, Math.min(max, panoW * 0.532 - containerW / 2));

      const startPan = panXRef.current;
      const startTime = performance.now();
      const duration = 500;

      const animateCenter = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Smooth cubic easeInOut
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const cur = startPan + (centerPan - startPan) * ease;
        setPanX(cur);
        targetPanXRef.current = centerPan;

        if (progress < 1) {
          requestAnimationFrame(animateCenter);
        } else {
          setPanX(centerPan);
        }
      };

      requestAnimationFrame(animateCenter);
    }
  }, [interactionMode]);

  // Transition from Conversation Mode (Restore Exploration)
  const handleCloseConversation = useCallback(() => {
    if (interactionMode === 'exploring') return;

    // Reset mouth state to closed and body to resting immediately
    setMouthState('closed');
    setBodyPose('resting');

    // Smoothly restore remembered room position over 500ms
    const targetRestore = rememberedPanXRef.current;
    if (containerRef.current && panoRef.current) {
      const startPan = panXRef.current;
      const startTime = performance.now();
      const duration = 500;

      const animateRestore = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const cur = startPan + (targetRestore - startPan) * ease;
        setPanX(cur);
        targetPanXRef.current = targetRestore;

        if (progress < 1) {
          requestAnimationFrame(animateRestore);
        } else {
          setPanX(targetRestore);
          // Rebase sensor neutral orientation to prevent jump
          setMotionCalibratedOffset(tiltAngle);
          setInteractionMode('exploring');
        }
      };

      requestAnimationFrame(animateRestore);
    } else {
      setInteractionMode('exploring');
      setMotionCalibratedOffset(tiltAngle);
    }
  }, [interactionMode, tiltAngle]);

  // Hierarchical back action:
  // 1. If composer or active conversation is open -> closes and restores room exploration.
  // 2. If already exploring -> exits to dashboard.
  const handleHeaderBack = useCallback(() => {
    if (conversationRef.current && conversationRef.current.handleBack) {
      const handled = conversationRef.current.handleBack();
      if (handled) return;
    }
    if (interactionMode === 'conversation') {
      handleCloseConversation();
      return;
    }
    onClose();
  }, [interactionMode, handleCloseConversation, onClose]);

  // Platform back listener
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      handleHeaderBack();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleHeaderBack]);

  // Measure and set initial center position
  const updateDimensions = useCallback((initial = false) => {
    if (containerRef.current && panoRef.current) {
      const containerW = containerRef.current.clientWidth;
      const panoW = panoRef.current.clientWidth;
      const max = Math.max(0, panoW - containerW);
      setMaxPan(max);
      
      if (initial) {
        const center = Math.max(0, Math.min(max, panoW * 0.532 - containerW / 2));
        setPanX(center);
        targetPanXRef.current = center;
      }
    }
  }, []);

  useEffect(() => {
    updateDimensions(true);
    const handleResize = () => updateDimensions(false);
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => updateDimensions(true), 120);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [updateDimensions]);

  // Smooth animation loop for lerping panX (active in Exploring mode)
  useEffect(() => {
    const animate = () => {
      if (!isDraggingRef.current && interactionMode === 'exploring') {
        const current = panXRef.current;
        const target = targetPanXRef.current;
        const diff = target - current;
        if (Math.abs(diff) > 0.3) {
          const next = current + diff * 0.12;
          setPanX(next);
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [interactionMode]);

  // Update gaze pose with hysteresis and neutral zone (in Exploring mode)
  useEffect(() => {
    if (interactionMode === 'conversation') {
      setGazePose('center');
      return;
    }
    if (!containerRef.current || !panoRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const panoW = panoRef.current.clientWidth;
    if (panoW <= 0) return;

    // Viewport center relative to the panorama
    const viewCenterInPano = (panX + containerW / 2) / panoW;
    // Munshiji center is at 0.532 (53.2%)
    const offsetFromMunshiji = viewCenterInPano - 0.532;

    // Neutral zone: [-0.08, +0.08] around Munshiji
    setGazePose(current => {
      if (current === 'center') {
        if (offsetFromMunshiji < -0.09) return 'left';
        if (offsetFromMunshiji > +0.09) return 'right';
        return 'center';
      } else if (current === 'left') {
        if (offsetFromMunshiji > -0.04) return 'center';
        return 'left';
      } else if (current === 'right') {
        if (offsetFromMunshiji < +0.04) return 'center';
        return 'right';
      }
      return 'center';
    });
  }, [panX, interactionMode]);

  // Gyroscope / Tilt Listener (active only in Exploring mode)
  useEffect(() => {
    if (!motionEnabled || interactionMode === 'conversation') return;

    const handleOrientation = (e) => {
      if (e.gamma !== null && !isDraggingRef.current && interactionMode === 'exploring') {
        const rawAngle = e.gamma;
        setTiltAngle(rawAngle);
        const effectiveAngle = rawAngle - motionCalibratedOffset;
        
        // Responsive sensitivity: comfortable reach at +/- 18 degrees
        const maxAngle = 18;
        const deadzone = 2.0;
        const clamped = Math.max(-maxAngle, Math.min(maxAngle, effectiveAngle));
        
        let normalized = 0;
        if (Math.abs(clamped) > deadzone) {
          normalized = (clamped - Math.sign(clamped) * deadzone) / (maxAngle - deadzone);
        }
        // Clamp normalized strictly to [-1, 1]
        normalized = Math.max(-1, Math.min(1, normalized));

        if (containerRef.current && panoRef.current) {
          const containerW = containerRef.current.clientWidth;
          const panoW = panoRef.current.clientWidth;
          const max = Math.max(0, panoW - containerW);
          const center = Math.max(0, Math.min(max, panoW * 0.532 - containerW / 2));
          
          // normalized: -1 -> 0 (most left), 0 -> center, +1 -> max (most right)
          const target = center + normalized * (normalized < 0 ? center : (max - center));
          targetPanXRef.current = Math.max(0, Math.min(max, target));
        }
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [motionEnabled, motionCalibratedOffset, interactionMode]);

  // Touch Swipe & Pointer Events
  const handlePointerDown = (e) => {
    if (interactionMode === 'conversation') return;
    if (showTooltip && !isTooltipLeaving) {
      setIsTooltipLeaving(true);
      setTimeout(() => setShowTooltip(false), 500);
    }
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragStartPanXRef.current = panXRef.current;
  };

  const handlePointerMove = (e) => {
    if (interactionMode === 'conversation' || !isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - dragStartXRef.current;
    
    const newPan = dragStartPanXRef.current - deltaX;
    const clamped = Math.max(0, Math.min(maxPan, newPan));
    targetPanXRef.current = clamped;
    setPanX(clamped);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Hotspot tap handler
  const handleHotspotClick = (spot) => {
    setActiveHotspot(spot);
    if (navigator.vibrate) navigator.vibrate(25);
  };

  const spriteSrc = {
    left: './assets/munshiji_sprite_left.png',
    center: './assets/munshiji_sprite_center.png',
    right: './assets/munshiji_sprite_right.png'
  }[gazePose];

  return (
    <div className={`new-room-screen ${interactionMode}`}>
      {/* iOS Top Status Bar */}
      <div className="status-bar" style={{ zIndex: 10, background: '#ffffff', flexShrink: 0 }}>
        <span className="status-bar-time">9:41</span>
        <div className="status-bar-icons">
          <div className="status-signal">
            <span className="signal-bar"></span>
            <span className="signal-bar"></span>
            <span className="signal-bar"></span>
            <span className="signal-bar"></span>
          </div>
          {/* Wi-Fi Icon */}
          <svg width="15" height="11" viewBox="0 0 16 12" fill="none">
            <path d="M8 9.5C8.82843 9.5 9.5 8.82843 9.5 8C9.5 7.17157 8.82843 6.5 8 6.5C7.17157 6.5 6.5 7.17157 6.5 8C6.5 8.82843 7.17157 9.5 8 9.5Z" fill="#0F172A"/>
            <path d="M12.5 5.5C11.3 4.2 9.7 3.5 8 3.5C6.3 3.5 4.7 4.2 3.5 5.5" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M15.5 2.5C13.5 0.9 10.8 0 8 0C5.2 0 2.5 0.9 0.5 2.5" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          {/* Battery Indicator */}
          <div className="status-battery">
            <div className="battery-level"></div>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <header className="new-room-header">
        <button 
          className="header-icon-btn back-btn" 
          onClick={handleHeaderBack}
          aria-label="Back"
        >
          <ChevronLeft size={24} strokeWidth={2.4} color="#0f172a" />
        </button>

        <div className="header-titles">
          <h1 className="header-room-title">Munshiji’s room</h1>
        </div>

        <button 
          className="header-icon-btn audio-btn"
          onClick={() => {
            setIsAudioMuted(!isAudioMuted);
            showToast(isAudioMuted ? 'Sound enabled 🔊' : 'Sound muted 🔇');
          }}
          aria-label={isAudioMuted ? "Unmute narration" : "Mute narration"}
        >
          {isAudioMuted ? (
            <VolumeX size={21} strokeWidth={2.2} color="#0f172a" />
          ) : (
            <Volume2 size={21} strokeWidth={2.2} color="#0f172a" />
          )}
        </button>
      </header>

      {/* Main Viewport Card (The Room Window) */}
      <div className="new-room-card-wrapper">
        <div 
          className="new-room-card-viewport"
          ref={containerRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <div 
            className="room-panorama-strip"
            ref={panoRef}
            style={{
              transform: `translate3d(${-panX}px, 0, 0)`
            }}
          >
            {/* Main Panorama Background Image */}
            <img 
              src="./assets/room_panorama.png" 
              alt="Munshiji's Study Room Panorama" 
              className="room-pano-img"
              draggable={false}
              onLoad={() => updateDimensions(true)}
            />

            {/* Munshiji Dynamic Character:
                - In Exploration mode: uses dynamic left/center/right gaze sprite (spriteSrc).
                - In Conversation mode: 
                  1. Fixed Permanent Base: Approved centre character (eyes, turban, torso, glasses, hands 100% stationary).
                  2. Registered Mouth Layer: Tightly bounded mouth state (closed, small, wide) on identical 340x340 coordinate system.
                Zero body shaking, zero turban movement, zero double mouth, zero ghosting. */}
            <div 
              className="munshiji-character-anchor"
              onClick={(e) => {
                e.stopPropagation();
                if (interactionMode === 'exploring') recenter();
              }}
              style={{ cursor: interactionMode === 'exploring' ? 'pointer' : 'default' }}
              title={interactionMode === 'exploring' ? "Tap to center Munshiji" : "Munshiji"}
            >
              {interactionMode === 'conversation' ? (
                <>
                  <img 
                    src={`./assets/conversation/body_${bodyPose}.png`} 
                    alt="Munshiji"
                    className="munshiji-sprite-img"
                    draggable={false}
                  />
                  <img 
                    src={`./assets/conversation/mouth_${mouthState}.png`} 
                    alt={`Mouth ${mouthState}`}
                    className="munshiji-mouth-img"
                    draggable={false}
                  />
                </>
              ) : (
                <img 
                  src={spriteSrc} 
                  alt={`Munshiji looking ${gazePose}`}
                  className="munshiji-sprite-img"
                  draggable={false}
                />
              )}
            </div>

            {/* Tappable White Pill Badges (Visible during Exploring mode) */}
            {interactionMode === 'exploring' && HOTSPOTS.map((spot) => (
              <button
                key={spot.id}
                className="room-pill-hotspot"
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHotspotClick(spot);
                }}
              >
                <span>{spot.feature}</span>
                <ChevronRight size={13} strokeWidth={2.6} className="pill-chevron" />
              </button>
            ))}
          </div>

          {/* Auto-dismissing Glassmorphic Hint Tooltip (Exploring mode only) */}
          {interactionMode === 'exploring' && showTooltip && (
            <div className={`room-tilt-tooltip ${isTooltipLeaving ? 'leaving' : ''}`}>
              <div className="room-tilt-tooltip-icon">
                <img src="./assets/tilt_icon_trans.png" alt="Tilt Phone" />
              </div>
              <div className="room-tilt-tooltip-text">
                <span className="room-tilt-tooltip-title">Tilt to look around</span>
                <span className="room-tilt-tooltip-sub">Or swipe to explore the room</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Ask Munshiji Conversation Controls Component (Above bottom navigation) */}
      <MunshijiConversation
        ref={conversationRef}
        mode={interactionMode}
        onEnterConversation={handleEnterConversation}
        onCloseConversation={handleCloseConversation}
        onMouthStateChange={setMouthState}
        onBodyPoseChange={setBodyPose}
        isAudioMuted={isAudioMuted}
        onToggleNarration={() => setIsAudioMuted(!isAudioMuted)}
        onAmbientDuckingChange={setIsAmbientDucked}
      />

      {/* Toast Notification */}
      {roomNotification && (
        <div className="room-toast-notification">
          {roomNotification}
        </div>
      )}

      {/* Interactive Feature Modal Drawer (When tapping any hotspot in Exploring mode) */}
      {activeHotspot && (
        <div className="hotspot-modal-backdrop" onClick={() => setActiveHotspot(null)}>
          <div className="hotspot-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle-bar"></div>
            
            <div className="sheet-header">
              <div className="sheet-icon-bubble" style={{ backgroundColor: `${activeHotspot.color}18` }}>
                <span style={{ fontSize: '24px' }}>{activeHotspot.icon}</span>
              </div>
              <div className="sheet-title-info">
                <h3>{activeHotspot.name}</h3>
                <span className="sheet-badge-tag" style={{ color: activeHotspot.color }}>
                  {activeHotspot.feature}
                </span>
              </div>
              <button className="sheet-close-btn" onClick={() => setActiveHotspot(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="sheet-desc">{activeHotspot.desc}</p>

            <div className="sheet-stats-card">
              <div className="stats-row">
                <span className="stats-label">Status</span>
                <span className="stats-val" style={{ color: activeHotspot.color, fontWeight: 700 }}>
                  {activeHotspot.badge}
                </span>
              </div>
              <div className="stats-row">
                <span className="stats-label">Guide</span>
                <span className="stats-val">Munshiji is ready</span>
              </div>
            </div>

            <div className="sheet-actions">
              <button 
                className="sheet-primary-btn"
                style={{ backgroundColor: '#1e293b' }}
                onClick={() => {
                  const targetTab = activeHotspot.tab;
                  setActiveHotspot(null);
                  onClose();
                  onNavigateTab(targetTab);
                }}
              >
                <span>Open {activeHotspot.feature}</span>
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Global Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-tabs">
          <button 
            className="nav-tab-item active" 
            onClick={() => {
              if (interactionMode === 'conversation') handleCloseConversation();
              onClose();
              if (onNavigateTab) onNavigateTab('home');
            }}
          >
            <div className="nav-tab-icon">
              <HomeIcon size={22} strokeWidth={2.4} color="#0f172a" />
            </div>
            <span className="nav-tab-label active">Home</span>
          </button>

          <button 
            className="nav-tab-item" 
            onClick={() => {
              if (interactionMode === 'conversation') handleCloseConversation();
              onClose();
              if (onNavigateTab) onNavigateTab('gullak');
            }}
          >
            <div className="nav-tab-icon">
              <img 
                src="./assets/goals/nav_gullak_exact.png" 
                alt="Gullak" 
                style={{ width: '20px', height: '18px', objectFit: 'contain' }} 
              />
            </div>
            <span className="nav-tab-label">Gullak</span>
          </button>

          <button 
            className="nav-tab-item" 
            onClick={() => {
              if (interactionMode === 'conversation') handleCloseConversation();
              onClose();
              if (onNavigateTab) onNavigateTab('learn');
            }}
          >
            <div className="nav-tab-icon">
              <BookOpen size={21} strokeWidth={1.8} color="#94a3b8" />
            </div>
            <span className="nav-tab-label">Learn</span>
          </button>

          <button 
            className="nav-tab-item" 
            onClick={() => {
              if (interactionMode === 'conversation') handleCloseConversation();
              onClose();
              if (onNavigateTab) onNavigateTab('portfolio');
            }}
          >
            <div className="nav-tab-icon">
              <PieChart size={21} strokeWidth={1.8} color="#94a3b8" />
            </div>
            <span className="nav-tab-label">Portfolio</span>
          </button>

          <button 
            className="nav-tab-item" 
            onClick={() => {
              if (interactionMode === 'conversation') handleCloseConversation();
              onClose();
              if (onNavigateTab) onNavigateTab('more');
            }}
          >
            <div className="nav-tab-icon">
              <MoreHorizontal size={22} strokeWidth={2} color="#94a3b8" />
            </div>
            <span className="nav-tab-label">More</span>
          </button>
        </div>
        <div className="home-indicator-bar"></div>
      </nav>
    </div>
  );
}

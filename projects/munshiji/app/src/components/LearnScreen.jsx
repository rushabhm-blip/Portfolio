import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, HelpCircle, Check, Play, BookOpen, X, Volume2, Sparkles, ChevronRight } from 'lucide-react';
import LearnHeroPlant from './LearnHeroPlant';
import EmergencyFundLesson from './EmergencyFundLesson';


const LESSON_CONFIGS = [
  {
    id: 'know-money',
    number: 1,
    title: 'Know your money',
    subtitle: 'Completed',
    duration: '2 min',
    icon: './assets/learn/nodes/node_wallet.png',
    align: 'align-left',
    description: 'Understand what you own, what you owe, and how cash flows through your everyday life.',
    takeaway: 'Your net worth is your assets minus your liabilities.',
    imageStyle: {
      width: '68px',
      height: '68px',
      marginLeft: '5.2px',
      marginBottom: '10px'
    }
  },
  {
    id: 'emergency-fund',
    number: 2,
    title: 'Emergency fund',
    subtitle: '4 min · Lesson + activity',
    duration: '4 min',
    icon: './assets/learn/nodes/node_shield.png',
    align: 'align-right',
    description: 'Learn how to build a 3-month safety cushion so unexpected expenses never derail your goals.',
    takeaway: 'Keep your emergency fund in liquid, safe instruments separate from daily spending.',
    imageStyle: {
      width: '68px',
      height: '68px',
      marginLeft: '8.2px',
      marginBottom: '13px'
    }
  },
  {
    id: 'needs-wants',
    number: 3,
    title: 'Needs or wants?',
    subtitle: '3 min',
    duration: '3 min',
    icon: './assets/learn/nodes/node_basket.png',
    align: 'align-mid-left',
    description: 'Master the 24-hour rule to separate impulsive desires from essential living requirements.',
    takeaway: 'Wait 24 hours before making any non-essential purchase over ₹1,000.',
    imageStyle: {
      width: '64px',
      height: '64px',
      marginLeft: '9px',
      marginBottom: '13px'
    }
  },
  {
    id: 'simple-budgeting',
    number: 4,
    title: 'Simple budgeting',
    subtitle: '5 min',
    duration: '5 min',
    icon: './assets/learn/nodes/node_notepad.png',
    align: 'align-mid-right',
    description: 'The 50/30/20 guideline tailored for Indian households and lifestyle aspirations.',
    takeaway: 'Automate 20% to savings on the day your salary arrives.',
    imageStyle: {
      width: '71px',
      height: '71px',
      marginLeft: '4.8px',
      marginBottom: '11px'
    }
  },
  {
    id: 'saving-habits',
    number: 5,
    title: 'Saving habits',
    subtitle: '3 min',
    duration: '3 min',
    icon: './assets/learn/nodes/node_coins.png',
    align: 'align-left',
    description: 'Small daily micro-deposits in your Gullak snowball into wealth through compounding.',
    takeaway: 'Consistency beats intensity: saving ₹50 daily yields ₹18,250 a year.',
    imageStyle: {
      width: '68px',
      height: '68px',
      marginLeft: '6.4px',
      marginBottom: '11px'
    }
  }
];


export default function LearnScreen({ onBack, motionEnabled = true }) {
  const [activeTab, setActiveTab] = useState('path'); // 'path' | 'saved'
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [tiltFeedback, setTiltFeedback] = useState(null);
  const [isDocVisible, setIsDocVisible] = useState(!document.hidden);
  const [isEmergencyLessonOpen, setIsEmergencyLessonOpen] = useState(false);


  // Learning progress persisted in localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    try {
      const saved = localStorage.getItem('munshiji_completed_lessons');
      return saved ? JSON.parse(saved) : ['know-money'];
    } catch {
      return ['know-money'];
    }
  });

  const [inProgressLessonId, setInProgressLessonId] = useState(() => {
    try {
      return localStorage.getItem('munshiji_in_progress_lesson') || null;
    } catch {
      return null;
    }
  });

  // Preload images to prevent flicker
  useEffect(() => {
    LESSON_CONFIGS.forEach((config) => {
      const img = new Image();
      img.src = config.icon;
    });
  }, []);

  // Pause animations when screen/document is not visible
  useEffect(() => {
    const handleVis = () => {
      setIsDocVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  // Tilt navigation between 'Your path' and 'Saved' tabs:
  const isNeutralRef = useRef(true);
  const holdTimerRef = useRef(null);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  useEffect(() => {
    if (!motionEnabled || selectedLesson || isHelpOpen) {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      return;
    }

    const handleTilt = (e) => {
      const gamma = e.gamma;
      if (gamma === null || gamma === undefined) return;

      // Neutral zone (-8 to +8 degrees)
      if (Math.abs(gamma) <= 8) {
        isNeutralRef.current = true;
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        return;
      }

      if (!isNeutralRef.current) return;

      // Tilting left: gamma < -18 -> Switch to 'path' if on 'saved'
      if (gamma < -18 && activeTabRef.current === 'saved') {
        if (!holdTimerRef.current) {
          holdTimerRef.current = setTimeout(() => {
            setActiveTab('path');
            isNeutralRef.current = false;
            if (navigator.vibrate) navigator.vibrate(25);
            setTiltFeedback('Switched to Your path ◀');
            setTimeout(() => setTiltFeedback(null), 1800);
            holdTimerRef.current = null;
          }, 360);
        }
      } 
      // Tilting right: gamma > 18 -> Switch to 'saved' if on 'path'
      else if (gamma > 18 && activeTabRef.current === 'path') {
        if (!holdTimerRef.current) {
          holdTimerRef.current = setTimeout(() => {
            setActiveTab('saved');
            isNeutralRef.current = false;
            if (navigator.vibrate) navigator.vibrate(25);
            setTiltFeedback('Switched to Saved ▶');
            setTimeout(() => setTiltFeedback(null), 1800);
            holdTimerRef.current = null;
          }, 360);
        }
      }
    };

    window.addEventListener('deviceorientation', handleTilt);
    return () => {
      window.removeEventListener('deviceorientation', handleTilt);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [motionEnabled, selectedLesson, isHelpOpen]);

  // Determine activeLessonId dynamically from actual learning progress
  const activeLessonId = inProgressLessonId && !completedLessonIds.includes(inProgressLessonId)
    ? inProgressLessonId
    : (LESSON_CONFIGS.find(l => !completedLessonIds.includes(l.id))?.id || null);

  const isInProgress = activeLessonId && inProgressLessonId === activeLessonId;

  // Build lesson display state
  const lessons = LESSON_CONFIGS.map((config) => {
    const isCompleted = completedLessonIds.includes(config.id);
    const isActive = config.id === activeLessonId;
    let badge = null;
    let status = 'upcoming';

    if (isCompleted) {
      status = 'completed';
    } else if (isActive) {
      if (isInProgress) {
        status = 'in-progress';
        badge = 'CONTINUE';
      } else {
        status = 'up-next';
        badge = 'UP NEXT';
      }
    }

    return {
      ...config,
      isCompleted,
      isActive,
      status,
      badge
    };
  });

  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.min(100, Math.round((completedCount / LESSON_CONFIGS.length) * 100));

  const handleOpenLesson = (lesson) => {
    if (lesson.id === 'emergency-fund') {
      handleBeginOrContinue(lesson);
      setIsEmergencyLessonOpen(true);
    } else {
      setSelectedLesson(lesson);
    }
  };

  const handleBeginOrContinue = (lesson) => {
    if (!lesson.isCompleted) {
      setInProgressLessonId(lesson.id);
      try {
        localStorage.setItem('munshiji_in_progress_lesson', lesson.id);
      } catch {}
    }
  };

  const handleCompleteLesson = (lessonId) => {
    setCompletedLessonIds((prev) => {
      const next = prev.includes(lessonId) ? prev : [...prev, lessonId];
      try {
        localStorage.setItem('munshiji_completed_lessons', JSON.stringify(next));
      } catch {}
      return next;
    });
    setInProgressLessonId(null);
    try {
      localStorage.removeItem('munshiji_in_progress_lesson');
    } catch {}
    setSelectedLesson(null);
  };

  const handleResetProgress = () => {
    const initial = ['know-money'];
    setCompletedLessonIds(initial);
    setInProgressLessonId(null);
    try {
      localStorage.setItem('munshiji_completed_lessons', JSON.stringify(initial));
      localStorage.removeItem('munshiji_in_progress_lesson');
    } catch {}
    setSelectedLesson(null);
  };

  if (isEmergencyLessonOpen) {
    return (
      <EmergencyFundLesson 
        onBack={() => setIsEmergencyLessonOpen(false)}
        onClose={() => setIsEmergencyLessonOpen(false)}
        onComplete={() => {
          handleCompleteLesson('emergency-fund');
          setIsEmergencyLessonOpen(false);
        }}
      />
    );
  }

  return (
    <div className="learn-screen-container">
      {/* Top Header */}
      <header className="learn-header">
        <button 

          className="learn-icon-btn" 
          onClick={onBack} 
          aria-label="Back to home"
          type="button"
        >
          <ArrowLeft size={22} strokeWidth={2.4} color="#0f172a" />
        </button>

        <h1 className="learn-header-title">Learn</h1>

        <button 
          className="learn-icon-btn" 
          onClick={() => setIsHelpOpen(true)} 
          aria-label="Learning Help"
          type="button"
        >
          <HelpCircle size={22} strokeWidth={2.2} color="#0f172a" />
        </button>
      </header>

      {/* Tilt feedback pill */}
      {tiltFeedback && (
        <div className="learn-tilt-toast">
          {tiltFeedback}
        </div>
      )}

      {/* Scrollable Screen Content */}
      <div className="learn-scroll-content">
        {/* Top Hero Section: Title on left, Animated Plant on right */}
        <section className="learn-hero-row">
          <div className="learn-hero-text">
            <h2 className="learn-main-title">
              Your money<br />journey
            </h2>
            <p className="learn-main-subtitle">
              One small lesson at a time.
            </p>
          </div>

          {/* Plant Growth from Book Hero Animation Container */}
          <div className="learn-hero-graphic-wrap">
            <LearnHeroPlant />
          </div>
        </section>

        {/* Navigation Tabs: 'Your path' & 'Saved' */}
        <div className="learn-tabs-bar" role="tablist">
          <button 
            role="tab"
            aria-selected={activeTab === 'path'}
            className={`learn-tab-btn ${activeTab === 'path' ? 'active' : ''}`}
            onClick={() => setActiveTab('path')}
          >
            <span>Your path</span>
            {activeTab === 'path' && <div className="learn-tab-indicator"></div>}
          </button>

          <button 
            role="tab"
            aria-selected={activeTab === 'saved'}
            className={`learn-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <span>Saved</span>
            {activeTab === 'saved' && <div className="learn-tab-indicator"></div>}
          </button>
        </div>

        {activeTab === 'path' ? (
          <>
            {/* Money Foundations Progress Section */}
            <div className="learn-progress-section">
              <div className="progress-labels-row">
                <span className="progress-title-label">MONEY FOUNDATIONS</span>
                <span className="progress-fraction-label">{completedCount} of 5 complete</span>
              </div>
              <div className="progress-track-bg">
                <div className="progress-fill-bar" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            {/* Curved Meandering Lesson Journey */}
            <div className="learn-journey-map-area">
              {/* SVG Connecting Winding Path through platforms */}
              <svg 
                className="journey-svg-path" 
                viewBox="0 0 320 520" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                {/* Meandering curved path through all 5 platform centers */}
                <path 
                  d="M 52 46 C 100 46, 152 95, 152 148 C 152 200, 80 195, 80 250 C 80 302, 137 298, 137 352 C 137 405, 56 400, 56 454" 
                  stroke="#ede9fe" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                />
                {/* Intermediate milestone dots along the journey */}
                <circle cx="102" cy="97" r="4.5" fill="#ddd6fe" />
                <circle cx="116" cy="199" r="4.5" fill="#ddd6fe" />
                <circle cx="108.5" cy="301" r="4.5" fill="#ddd6fe" />
                <circle cx="96.5" cy="403" r="4.5" fill="#ddd6fe" />
              </svg>

              {/* 5 Lesson Nodes */}
              <div className="journey-nodes-list">
                {lessons.map((lesson) => {
                  const isCompleted = lesson.isCompleted;
                  const isActive = lesson.isActive;
                  const shouldAnimate = isActive && motionEnabled && isDocVisible;

                  return (
                    <div 
                      key={lesson.id} 
                      className={`journey-node-row ${lesson.align} ${lesson.status} ${isActive ? 'is-active-node' : ''}`}
                      onClick={() => handleOpenLesson(lesson)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleOpenLesson(lesson);
                      }}
                      aria-label={`${lesson.title}: ${isCompleted ? 'Completed' : lesson.badge || 'Available'}`}
                    >
                      {/* Node Artwork / 3D Icon Container */}
                      <div className="node-artwork-col">
                        <div className="node-platform-stage">
                          {/* Faint stationary lavender halo behind active node */}
                          {isActive && (
                            <div className="node-active-halo" aria-hidden="true" />
                          )}

                          {/* Stationary Code-drawn Pale Lavender Platform */}
                          <div className="node-code-platform" aria-hidden="true">
                            <div className="platform-ground-shadow" />
                            <div className="platform-cylinder-rim" />
                            <div className="platform-top-face" />
                          </div>

                          {/* Separate Object Contact Shadow - animated in sync on active node */}
                          <div 
                            className={`node-contact-shadow ${shouldAnimate ? 'is-floating-shadow' : ''}`} 
                            aria-hidden="true" 
                          />

                          {/* Floating Illustration Layer (tap area stationary, only image moves) */}
                          <div className={`node-float-container ${shouldAnimate ? 'is-floating' : ''}`}>
                            {/* Nested press wrapper (briefly scales to 96% on active without overwriting float) */}
                            <div className="node-press-wrapper">
                              <img 
                                src={lesson.icon} 
                                alt="" 
                                className="node-3d-img" 
                                style={lesson.imageStyle}
                                draggable={false}
                              />
                            </div>
                          </div>

                          {/* Stationary Completion Badge */}
                          {isCompleted && (
                            <div className="node-check-badge" aria-label="Completed">
                              <Check size={11} strokeWidth={3} color="#ffffff" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Node Text Description (Always to the right of icon) */}
                      <div className="node-info-col">
                        {lesson.badge && (
                          <div className={`node-status-badge ${lesson.badge === 'CONTINUE' ? 'in-progress' : 'up-next'}`}>
                            {lesson.badge}
                          </div>
                        )}
                        <h3 className="node-title">{lesson.title}</h3>
                        <p className="node-subtitle">{isCompleted ? 'Completed' : lesson.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Primary Button */}

            <div className="learn-bottom-actions">
              <button 
                className="learn-primary-cta-btn"
                onClick={() => {
                  if (activeLesson) {
                    handleOpenLesson(activeLesson);
                  }
                }}
              >
                <span>
                  {activeLesson.status === 'in-progress'
                    ? `Continue ${activeLesson.title.toLowerCase()} lesson`
                    : completedCount >= 5
                      ? 'Review your money journey'
                      : `Start ${activeLesson.title.toLowerCase()} lesson`}
                </span>
              </button>
            </div>

          </>
        ) : (
          /* Saved Tab View */
          <div className="learn-saved-tab-view">
            <div className="saved-empty-header">
              <BookOpen size={36} color="#a855f7" strokeWidth={1.8} />
              <h3 className="saved-title">Your saved financial insights</h3>
              <p className="saved-desc">
                Key rules and takeaways from completed lessons are stored here for quick reference.
              </p>
            </div>

            <div className="saved-cards-list">
              <div className="saved-card-item">
                <div className="saved-card-badge">LESSON 1</div>
                <h4 className="saved-card-heading">Know your net worth</h4>
                <p className="saved-card-text">
                  "Your net worth is your assets minus your liabilities. Track this monthly instead of daily bank balances."
                </p>
              </div>

              <div className="saved-card-item">
                <div className="saved-card-badge">GULLAK PRINCIPLE</div>
                <h4 className="saved-card-heading">Micro-saving habit</h4>
                <p className="saved-card-text">
                  "Small daily micro-deposits in your Gullak snowball into wealth through compounding. Consistency beats intensity."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Details Dialog / Bottom Sheet */}
      {selectedLesson && (
        <div className="learn-modal-overlay" onClick={() => setSelectedLesson(null)}>
          <div 
            className="learn-modal-card" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header-row">
              <span className="modal-lesson-tag">
                LESSON {selectedLesson.number} · {selectedLesson.duration}
              </span>
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedLesson(null)}
                aria-label="Close"
              >
                <X size={20} strokeWidth={2.4} color="#0f172a" />
              </button>
            </div>

            <div className="modal-art-wrap">
              <img 
                src={selectedLesson.icon} 
                alt="" 
                className="modal-lesson-img" 
              />
            </div>

            <h2 className="modal-lesson-title">{selectedLesson.title}</h2>
            <p className="modal-lesson-desc">{selectedLesson.description}</p>

            <div className="modal-takeaway-box">
              <div className="takeaway-header">
                <Sparkles size={16} color="#7c3aed" />
                <span>Key Takeaway</span>
              </div>
              <p className="takeaway-text">{selectedLesson.takeaway}</p>
            </div>

            {/* Modal Actions */}
            <div className="modal-buttons-group">
              {selectedLesson.isCompleted ? (
                <>
                  <button 
                    className="modal-start-btn" 
                    onClick={() => setSelectedLesson(null)}
                  >
                    <Check size={16} color="#ffffff" style={{ marginRight: '6px' }} />
                    <span>Lesson completed</span>
                  </button>
                  <button
                    className="modal-secondary-link"
                    onClick={handleResetProgress}
                  >
                    Reset journey progress
                  </button>
                </>
              ) : selectedLesson.status === 'in-progress' ? (
                <>
                  <button 
                    className="modal-start-btn" 
                    onClick={() => handleCompleteLesson(selectedLesson.id)}
                  >
                    <Sparkles size={16} color="#ffffff" style={{ marginRight: '6px' }} />
                    <span>Complete lesson (+50 Gullak bonus)</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="modal-start-btn" 
                    onClick={() => {
                      if (selectedLesson.id === 'emergency-fund') {
                        handleBeginOrContinue(selectedLesson);
                        setSelectedLesson(null);
                        setIsEmergencyLessonOpen(true);
                      } else {
                        handleBeginOrContinue(selectedLesson);
                        setSelectedLesson(null);
                      }
                    }}
                  >
                    <Play size={16} fill="#ffffff" color="#ffffff" style={{ marginRight: '6px' }} />
                    <span>Begin lesson</span>
                  </button>

                  <button 
                    className="modal-secondary-link" 
                    onClick={() => handleCompleteLesson(selectedLesson.id)}
                  >
                    Quick complete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Learning Help Dialog */}
      {isHelpOpen && (
        <div className="learn-modal-overlay" onClick={() => setIsHelpOpen(false)}>
          <div 
            className="learn-modal-card" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header-row">
              <span className="modal-lesson-tag">GUIDE</span>
              <button 
                className="modal-close-btn" 
                onClick={() => setIsHelpOpen(false)}
                aria-label="Close"
              >
                <X size={20} strokeWidth={2.4} color="#0f172a" />
              </button>
            </div>

            <h2 className="modal-lesson-title">How Learning Works</h2>
            <p className="modal-lesson-desc">
              Munshiji teaches foundational money skills in bite-sized, 3-minute lessons designed for practical daily use.
            </p>

            <div className="modal-help-list">
              <div className="help-item">
                <span className="help-bullet">🌱</span>
                <span><strong>Plant Growth:</strong> As you progress, your money garden flourishes with knowledge and savings.</span>
              </div>
              <div className="help-item">
                <span className="help-bullet">🪙</span>
                <span><strong>Gullak Rewards:</strong> Complete lessons to unlock streak bonuses and bonus Gullak coins.</span>
              </div>
              <div className="help-item">
                <span className="help-bullet">🧭</span>
                <span><strong>Tilt Navigation:</strong> Tilt your phone left or right and hold briefly to switch between "Your path" and "Saved".</span>
              </div>
            </div>

            <button 
              className="modal-start-btn" 
              onClick={() => setIsHelpOpen(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, HelpCircle, Plus, ArrowRight, X,
  Home as HomeIcon, BookOpen, PieChart, MoreHorizontal,
  Target, Trash2, Calendar, ChevronRight
} from 'lucide-react';
import CreateGoalFlow from './CreateGoalFlow';
import GoalDashboard from './GoalDashboard';

// The 5 animation frames: Target ready -> Arrow in flight -> Bullseye hit!
const ANIMATION_SEQUENCE = [
  './assets/goals/f1.png', // Frame 0: Target ready
  './assets/goals/f5.png', // Frame 1: Arrow flying in from top-right
  './assets/goals/f3.png', // Frame 2: Arrow approaching center
  './assets/goals/f4.png', // Frame 3: Arrow entering target
  './assets/goals/f2.png'  // Frame 4: Arrow solid in bullseye!
];

export default function GoalsScreen({ 
  onBack, 
  onTabChange, 
  goals = [], 
  onAddGoal, 
  onUpdateGoal,
  onDeleteGoal 
}) {
  // Goal creation flow state
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [initialGoalCategory, setInitialGoalCategory] = useState(null);
  const [savedDraft, setSavedDraft] = useState(null);

  // Active goal opened in dashboard
  const [activeDashboardGoal, setActiveDashboardGoal] = useState(null);
  const [isJustCreated, setIsJustCreated] = useState(false);

  // Current animation frame index (0..4)
  const [frameIndex, setFrameIndex] = useState(0);
  // Coin animation state: 'hidden' | 'rolling' | 'resting'
  const [coinState, setCoinState] = useState('hidden');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showToast, setShowToast] = useState(null);

  // Preload all frames and assets immediately
  useEffect(() => {
    ANIMATION_SEQUENCE.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const coin = new Image();
    coin.src = './assets/goals/gold_coin_clean.png';
    const shield = new Image();
    shield.src = './assets/goals_shield_3d.png';
  }, []);

  // Coordinated animation loop: Target waiting -> Arrow shoots -> Bullseye impact -> Coin rolls in & rests!
  useEffect(() => {
    let timer;
    let coinRestTimer;

    if (frameIndex === 0) {
      setCoinState('hidden');
      // Hold ready target for 1.8s
      timer = setTimeout(() => {
        setFrameIndex(1);
      }, 1800);
    } else if (frameIndex === 1) {
      // Arrow launches: 110ms
      timer = setTimeout(() => {
        setFrameIndex(2);
      }, 110);
    } else if (frameIndex === 2) {
      // Arrow in flight: 110ms
      timer = setTimeout(() => {
        setFrameIndex(3);
      }, 110);
    } else if (frameIndex === 3) {
      // Arrow near impact: 110ms
      timer = setTimeout(() => {
        setFrameIndex(4);
      }, 110);
    } else if (frameIndex === 4) {
      // Impact! Trigger coin rolling in
      setCoinState('rolling');
      coinRestTimer = setTimeout(() => {
        setCoinState('resting');
      }, 650);

      // Hold glorious bullseye + resting gold coin for 2.8 seconds
      timer = setTimeout(() => {
        setFrameIndex(0);
      }, 2800);
    }

    return () => {
      clearTimeout(timer);
      if (coinRestTimer) clearTimeout(coinRestTimer);
    };
  }, [frameIndex]);

  // Click target to shoot arrow manually
  const handleTargetClick = () => {
    if (frameIndex === 0) {
      setFrameIndex(1);
    } else if (frameIndex === 4) {
      setFrameIndex(0);
    }
  };

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2400);
  };

  // If user is currently in the goal creation flow:
  if (isCreatingGoal) {
    return (
      <CreateGoalFlow 
        initialCategory={initialGoalCategory}
        initialDraft={savedDraft}
        onBack={(draft) => {
          if (draft) setSavedDraft(draft);
          setIsCreatingGoal(false);
        }}
        onComplete={(newGoal) => {
          if (onAddGoal) onAddGoal(newGoal);
          setSavedDraft(null);
          setIsCreatingGoal(false);
          setActiveDashboardGoal(newGoal);
          setIsJustCreated(true);
        }}
      />
    );
  }

  // If user is viewing a specific goal dashboard:
  if (activeDashboardGoal) {
    return (
      <GoalDashboard 
        goal={activeDashboardGoal}
        isJustCreated={isJustCreated}
        onBack={() => {
          setActiveDashboardGoal(null);
          setIsJustCreated(false);
        }}
        onViewAllGoals={() => {
          setActiveDashboardGoal(null);
          setIsJustCreated(false);
        }}
        onUpdateGoal={(updatedGoal) => {
          setActiveDashboardGoal(updatedGoal);
          if (onUpdateGoal) onUpdateGoal(updatedGoal);
        }}
        onDeleteGoal={(goalId) => {
          if (onDeleteGoal) onDeleteGoal(goalId);
          setActiveDashboardGoal(null);
          setIsJustCreated(false);
        }}
      />
    );
  }

  const hasGoals = goals && goals.length > 0;

  return (
    <div className="goals-screen-container">
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

      {/* Top Header Bar */}
      <div className="goals-top-bar">
        <div className="goals-top-bar-left">
          <button 
            className="goals-icon-btn" 
            onClick={onBack}
            aria-label="Back"
          >
            <ArrowLeft size={22} color="#0f172a" strokeWidth={2.4} />
          </button>
          <h1 className="goals-title">Goals</h1>
        </div>

        <button 
          className="goals-icon-btn" 
          onClick={() => setShowHelpModal(true)}
          aria-label="Help with Goals"
        >
          <HelpCircle size={22} color="#0f172a" strokeWidth={2} />
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="goals-toast">
          {showToast}
        </div>
      )}

      {/* Main Screen Body */}
      <div className="goals-content-body">
        {/* Top Header Section */}
        <div className="goals-header-section">
          <h2 className="goals-heading">Make room for what matters</h2>
          <p className="goals-subheading">
            A little saved today. A step closer tomorrow.
          </p>
        </div>

        {/* Central Blank Space for Animation (Plays f1..f5 target & arrow sequence) */}
        <div 
          className="goals-animation-stage" 
          id="goals-animation-stage"
          onClick={handleTargetClick}
          title="Click to shoot arrow"
        >
          <div className="clay-target-container">
            <img 
              src={ANIMATION_SEQUENCE[frameIndex]} 
              alt="3D Clay Target Animation" 
              className={`clay-target-illustration-img ${frameIndex === 4 ? 'impact' : 'idle'}`}
            />
            {coinState !== 'hidden' && (
              <img 
                src="./assets/goals/gold_coin_clean.png"
                alt="3D Gold Coin"
                className={`clay-target-coin ${coinState === 'resting' ? 'resting' : ''}`}
              />
            )}
          </div>
        </div>

        {/* Action Section */}
        <div className="goals-action-section">
          <h3 className="goals-action-heading">Your first goal starts here</h3>
          <p className="goals-action-subheading">
            Choose something to save for. Set a pace that works for you.
          </p>

          {/* Primary CTA: + Create a goal */}
          <button 
            className="goals-create-btn"
            onClick={() => {
              setInitialGoalCategory(null);
              setIsCreatingGoal(true);
            }}
          >
            <Plus size={19} strokeWidth={2.6} />
            <span>Create a goal</span>
          </button>

          {/* Emergency Fund Card */}
          <div 
            className="goals-emergency-card"
            onClick={() => {
              setInitialGoalCategory('emergency');
              setIsCreatingGoal(true);
            }}
          >
            <div className="goals-emergency-shield-wrap">
              <img 
                src="./assets/goals/shield_clean_transparent.png" 
                alt="3D Emergency Shield with Checkmark" 
                className="goals-emergency-shield-img"
              />
            </div>
            <div className="goals-emergency-info">
              <h4 className="goals-emergency-title">Build an emergency fund</h4>
              <p className="goals-emergency-desc">Prepare for unexpected expenses.</p>
              <button 
                className="goals-emergency-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setInitialGoalCategory('emergency');
                  setIsCreatingGoal(true);
                }}
              >
                <span>Set up emergency fund</span>
                <ArrowRight size={14} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Micro-disclaimer */}
          <p className="goals-disclaimer">
            Creating a goal won’t move any money.
          </p>
        </div>
      </div>

      {/* HELP BOTTOM SHEET */}
      {showHelpModal && (
        <div className="goals-help-backdrop" onClick={() => setShowHelpModal(false)}>
          <div className="goals-help-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="help-sheet-handle"></div>
            <div className="help-sheet-header">
              <div className="help-sheet-title-wrap">
                <HelpCircle size={22} color="#7c3aed" />
                <h3>About Goals</h3>
              </div>
              <button 
                className="help-sheet-close" 
                onClick={() => setShowHelpModal(false)}
                aria-label="Close help"
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="help-sheet-content">
              <div className="help-point-card">
                <div className="help-point-icon">🎯</div>
                <div>
                  <h4>Targets & Milestones</h4>
                  <p>
                    A target is the specific amount you aspire to save. It gives your daily savings a clear destination.
                  </p>
                </div>
              </div>

              <div className="help-point-card">
                <div className="help-point-icon">📈</div>
                <div>
                  <h4>Pacing & Contributions</h4>
                  <p>
                    Contributions break down your target into small, realistic monthly steps so you reach your milestone comfortably.
                  </p>
                </div>
              </div>

              <div className="help-point-card highlight">
                <div className="help-point-icon">🔒</div>
                <div>
                  <h4>Zero Money Moved</h4>
                  <p>
                    Creating or editing a goal never initiates payments or debits your bank account. It is solely for planning and tracking.
                  </p>
                </div>
              </div>
            </div>

            <button 
              className="help-sheet-btn"
              onClick={() => setShowHelpModal(false)}
            >
              Got it, thank you!
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <div className="bottom-nav-tabs">
          {/* Home */}
          <button 
            className="nav-tab-item"
            onClick={() => {
              if (onTabChange) onTabChange('home');
              else onBack();
            }}
          >
            <div className="nav-tab-icon">
              <img 
                src="./assets/goals/nav_home_exact.png" 
                alt="Home" 
                style={{ width: '22px', height: '18px', objectFit: 'contain' }} 
              />
            </div>
            <span className="nav-tab-label">Home</span>
          </button>

          {/* Gullak */}
          <button 
            className="nav-tab-item"
            onClick={() => {
              if (onTabChange) onTabChange('gullak');
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

          {/* Learn */}
          <button 
            className="nav-tab-item"
            onClick={() => {
              if (onTabChange) onTabChange('learn');
            }}
          >
            <div className="nav-tab-icon">
              <img 
                src="./assets/goals/nav_learn_exact.png" 
                alt="Learn" 
                style={{ width: '20px', height: '18px', objectFit: 'contain' }} 
              />
            </div>
            <span className="nav-tab-label">Learn</span>
          </button>

          {/* Portfolio */}
          <button 
            className="nav-tab-item"
            onClick={() => {
              if (onTabChange) onTabChange('portfolio');
            }}
          >
            <div className="nav-tab-icon">
              <img 
                src="./assets/goals/nav_portfolio_exact.png" 
                alt="Portfolio" 
                style={{ width: '20px', height: '18px', objectFit: 'contain' }} 
              />
            </div>
            <span className="nav-tab-label">Portfolio</span>
          </button>

          {/* More (Active tab on Goals screen as shown in reference) */}
          <button 
            className="nav-tab-item active"
            onClick={() => {
              if (onTabChange) onTabChange('more');
            }}
          >
            <div className="nav-tab-icon">
              <img 
                src="./assets/goals/nav_more_exact.png" 
                alt="More" 
                style={{ width: '20px', height: '10px', objectFit: 'contain' }} 
              />
            </div>
            <span className="nav-tab-label">More</span>
          </button>
        </div>

        {/* iOS Bottom Indicator Bar */}
        <div className="home-indicator-bar"></div>
      </nav>
    </div>
  );
}

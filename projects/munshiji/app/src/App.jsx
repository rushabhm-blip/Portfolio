import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  Play, 
  Pause, 
  ArrowRight, 
  Home as HomeIcon, 
  BookOpen, 
  PieChart, 
  MoreHorizontal,
  Plus
} from 'lucide-react';
import MunshijiRoom from './components/MunshijiRoom';
import GullakDragInteraction from './components/GullakDragInteraction';
import LearnScreen from './components/LearnScreen';
import GoalsScreen from './components/GoalsScreen';
import PortfolioScreen from './components/PortfolioScreen';
import RadioScreen from './components/RadioScreen';
import MiniPlayer from './components/MiniPlayer';
import FullPlayerModal from './components/FullPlayerModal';
import GullakAnimatedCard from './components/GullakAnimatedCard';
import { AudioProvider } from './context/AudioContext';

const TABS = ['home', 'gullak', 'learn', 'portfolio', 'more'];

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && TABS.includes(tabParam)) return tabParam;
    }
    return 'home';
  });
  const [isRadioOpen, setIsRadioOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('screen') === 'radio') return true;
      if (params.get('screen') === 'home') return false;
    }
    return false; // Launch directly on the Home screen to view explore icons
  });
  const [isPlayingLesson, setIsPlayingLesson] = useState(false);
  const [notificationCount, setNotificationCount] = useState(1);
  const [savingsToast, setSavingsToast] = useState(null);
  const [isRoomOpen, setIsRoomOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room') === 'true' || params.get('screen') === 'room') return true;
    }
    return false;
  });
  const [isGullakDragOpen, setIsGullakDragOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [gullakBalance, setGullakBalance] = useState(928);
  const [streakDays, setStreakDays] = useState(11);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [isFormOrDialogOpen, setIsFormOrDialogOpen] = useState(false);
  const [tiltFeedback, setTiltFeedback] = useState(null);

  const handleAddGoal = (newGoal) => {
    setGoals(prev => [newGoal, ...prev]);
    showToast(`Goal "${newGoal.title}" created! 🎯`);
  };

  const handleUpdateGoal = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    showToast('Goal removed.');
  };

  // Auto-request iOS permission on first interaction if needed
  useEffect(() => {
    const requestMotionIfNeeded = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            setMotionEnabled(true);
          }
        } catch (err) {
          console.log('DeviceOrientation permission request:', err);
        }
      }
    };
    window.addEventListener('click', requestMotionIfNeeded, { once: true });
    window.addEventListener('touchstart', requestMotionIfNeeded, { once: true });
    return () => {
      window.removeEventListener('click', requestMotionIfNeeded);
      window.removeEventListener('touchstart', requestMotionIfNeeded);
    };
  }, []);

  // Tilt navigation state outside the room
  const isNeutralRef = useRef(true);
  const holdTimerRef = useRef(null);
  const currentTabRef = useRef(activeTab);
  currentTabRef.current = activeTab;

  const showToast = (msg) => {
    setSavingsToast(msg);
    setTimeout(() => setSavingsToast(null), 2500);
  };

  // Toggle Motion with iOS permission support
  const handleToggleMotion = useCallback(async () => {
    if (!motionEnabled) {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            setMotionEnabled(true);
            showToast('Motion navigation enabled! 🧭');
          } else {
            showToast('Permission denied for motion.');
          }
        } catch (err) {
          console.error(err);
          setMotionEnabled(true);
        }
      } else {
        setMotionEnabled(true);
        showToast('Motion navigation enabled! 🧭');
      }
    } else {
      setMotionEnabled(false);
      showToast('Motion navigation turned off.');
    }
  }, [motionEnabled]);

  // Dashboard tilt-and-hold tab switching:
  // "Outside the room, tilt-and-hold can switch adjacent tabs once; require a return to neutral before another switch."
  // "pause tilt navigation during forms, payments and dialogs."
  useEffect(() => {
    if (!motionEnabled || isRoomOpen || isFormOrDialogOpen || isGullakDragOpen) {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      return;
    }

    const handleDashboardTilt = (e) => {
      const gamma = e.gamma;
      if (gamma === null || gamma === undefined) return;

      // Neutral zone: -8 to +8 degrees
      if (Math.abs(gamma) <= 8) {
        isNeutralRef.current = true;
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        return;
      }

      // If already triggered a switch and haven't returned to neutral yet, ignore!
      if (!isNeutralRef.current) return;

      // Tilting left: gamma < -18
      if (gamma < -18) {
        if (!holdTimerRef.current) {
          holdTimerRef.current = setTimeout(() => {
            const currentIdx = TABS.indexOf(currentTabRef.current);
            if (currentIdx > 0) {
              const newTab = TABS[currentIdx - 1];
              setActiveTab(newTab);
              isNeutralRef.current = false;
              if (navigator.vibrate) navigator.vibrate(25);
              setTiltFeedback(`Switched to ${newTab.toUpperCase()} ◀`);
              setTimeout(() => setTiltFeedback(null), 1800);
            }
            holdTimerRef.current = null;
          }, 360); // Tilt-and-hold delay
        }
      } 
      // Tilting right: gamma > +18
      else if (gamma > 18) {
        if (!holdTimerRef.current) {
          holdTimerRef.current = setTimeout(() => {
            const currentIdx = TABS.indexOf(currentTabRef.current);
            if (currentIdx < TABS.length - 1) {
              const newTab = TABS[currentIdx + 1];
              setActiveTab(newTab);
              isNeutralRef.current = false;
              if (navigator.vibrate) navigator.vibrate(25);
              setTiltFeedback(`Switched to ${newTab.toUpperCase()} ▶`);
              setTimeout(() => setTiltFeedback(null), 1800);
            }
            holdTimerRef.current = null;
          }, 360);
        }
      }
    };

    window.addEventListener('deviceorientation', handleDashboardTilt);
    return () => {
      window.removeEventListener('deviceorientation', handleDashboardTilt);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [motionEnabled, isRoomOpen, isFormOrDialogOpen]);

  const handleAddSavings = () => {
    setIsGullakDragOpen(true);
  };

  const handleEnterRoom = () => {
    setIsRoomOpen(true);
  };


  return (
    <AudioProvider>
      <div className="simulator-wrapper">
        {/* Phone Hardware Mockup Frame */}
        <div className="phone-frame">
        {/* Status Bar */}
        <div className="status-bar">
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

        {/* Tilt Feedback Notification */}
        {tiltFeedback && (
          <div style={{
            position: 'absolute',
            top: '52px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(124, 58, 237, 0.92)',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            zIndex: 45,
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
            animation: 'fadeIn 0.2s ease-out',
            whiteSpace: 'nowrap'
          }}>
            {tiltFeedback}
          </div>
        )}

        {/* If Gullak Drag Interaction is Open */}
        {isGullakDragOpen ? (
          <GullakDragInteraction 
            onBack={() => setIsGullakDragOpen(false)}
            currentSavings={gullakBalance}
            onComplete={(addedAmount, targetTab = 'home') => {
              const amountToAdd = Number(addedAmount) > 0 ? Number(addedAmount) : 500;
              setGullakBalance(prev => prev + amountToAdd);
              setStreakDays(prev => prev + 1);
              setIsGullakDragOpen(false);
              if (targetTab === 'learn') {
                setActiveTab('learn');
                showToast(`₹${amountToAdd} added to your Gullak! Switched to Learn 📖`);
              } else {
                setActiveTab('home');
                showToast(`₹${amountToAdd} added to your Gullak! 🎉 Streak updated!`);
              }
            }}
          />
        ) : isRoomOpen ? (
          <MunshijiRoom 
            onClose={() => setIsRoomOpen(false)}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setIsRoomOpen(false);
              if (tab === 'gullak') setIsGullakDragOpen(true);
              else showToast(`Navigated to ${tab.toUpperCase()} from Room 🌟`);
            }}
            motionEnabled={motionEnabled}
            onToggleMotion={handleToggleMotion}
          />
        ) : isRadioOpen ? (
          <RadioScreen 
            onBack={() => setIsRadioOpen(false)}
            onNavigateTab={(tab) => {
              setIsRadioOpen(false);
              setActiveTab(tab);
              if (tab === 'gullak') setIsGullakDragOpen(true);
            }}
          />
        ) : isGoalsOpen ? (
          <GoalsScreen 
            onBack={() => setIsGoalsOpen(false)}
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            activeTab="more"
            onTabChange={(tab) => {
              setIsGoalsOpen(false);
              setActiveTab(tab);
              if (tab === 'gullak') setIsGullakDragOpen(true);
            }}
          />
        ) : activeTab === 'learn' ? (
          <LearnScreen 
            onBack={() => setActiveTab('home')}
            motionEnabled={motionEnabled}
          />
        ) : activeTab === 'portfolio' ? (
          <PortfolioScreen 
            key="portfolio-screen"
            isActive={activeTab === 'portfolio'}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'gullak') setIsGullakDragOpen(true);
            }}
            gullakBalance={gullakBalance}
            investedAmount={12000}
          />
        ) : (
          <>
            {/* Scrollable Screen Content */}
            <div className="screen-scroll-container">
              {/* Header */}
              <header className="app-header">
                <h1 className="app-brand">munshiji</h1>
                <div className="header-actions">
                  <button 
                    className="icon-btn" 
                    aria-label="Notifications"
                    onClick={() => setNotificationCount(prev => prev > 0 ? 0 : 1)}
                  >
                    <Bell size={21} color="#0f172a" strokeWidth={2} />
                    {notificationCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '5px',
                        right: '6px',
                        width: '7px',
                        height: '7px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </button>
                  <button className="avatar-btn" aria-label="Munshiji Profile" onClick={handleEnterRoom}>
                    <img 
                      src="./assets/avatar_munshiji.png" 
                      alt="Munshiji avatar" 
                    />
                  </button>
                </div>
              </header>

              {/* Subtitle / Greeting */}
              <div className="greeting-text">
                Good afternoon, Rushabh
              </div>

              {/* Toast message if triggered */}
              {savingsToast && (
                <div style={{
                  background: '#1e293b',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'center',
                  marginBottom: '14px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {savingsToast}
                </div>
              )}

              {/* Hero Card: Your Gullak */}
              <section 
                className="gullak-card"
                onClick={handleAddSavings}
                style={{ cursor: 'pointer' }}
              >
                <div className="gullak-card-left">
                  <span className="gullak-label">Your Gullak</span>
                  <div className="gullak-balance">₹{gullakBalance}</div>
                  <div className="streak-pill">
                    <span className="flame-icon">🔥</span>
                    <span>{streakDays} day streak</span>
                  </div>
                  <button 
                    className="btn-add-savings"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSavings();
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Add savings</span>
                  </button>
                </div>
                <div className="gullak-card-right">
                  <GullakAnimatedCard onClick={handleAddSavings} />
                </div>
              </section>

              {/* Explore Section */}
              <section>
                <div className="section-heading">
                  <span>Explore</span>
                </div>
                <div className="explore-grid">
                  <button 
                    className="explore-item" 
                    onClick={() => {
                      setActiveTab('learn');
                      showToast('Switched to Learn tab 📚');
                    }}
                  >
                    <div className="explore-icon-wrapper" style={{ padding: '4px' }}>
                      <img src="./assets/icon_learn.png" alt="Learn" className="explore-icon-img" />
                    </div>
                    <span className="explore-label">Learn</span>
                  </button>

                  <button 
                    className="explore-item" 
                    onClick={() => {
                      setActiveTab('portfolio');
                      showToast('Switched to Portfolio tab 📊');
                    }}
                  >
                    <div className="explore-icon-wrapper" style={{ padding: '4px' }}>
                      <img src="./assets/icon_portfolio.png" alt="Portfolio" className="explore-icon-img" />
                    </div>
                    <span className="explore-label">Portfolio</span>
                  </button>

                  <button 
                    className="explore-item" 
                    onClick={() => {
                      setIsGoalsOpen(true);
                    }}
                  >
                    <div className="explore-icon-wrapper" style={{ padding: '2px' }}>
                      <img src="./assets/icon_goals.png" alt="Goals" className="explore-icon-img" />
                    </div>
                    <span className="explore-label">Goals</span>
                  </button>

                  <button 
                    className="explore-item" 
                    onClick={() => {
                      setIsRadioOpen(true);
                    }}
                  >
                    <div className="explore-icon-wrapper" style={{ padding: '2px' }}>
                      <img src="./assets/icon_radio.png" alt="Radio" className="explore-icon-img" />
                    </div>
                    <span className="explore-label">Radio</span>
                  </button>
                </div>
              </section>

              {/* Continue Learning Section */}
              <section>
                <div className="section-heading">
                  <span>Continue learning</span>
                </div>
                <div 
                  className="lesson-card" 
                  onClick={() => setIsPlayingLesson(!isPlayingLesson)}
                >
                  <div className="lesson-thumb">
                    <img src="./assets/icon_learn.png" alt="Lesson thumbnail" />
                  </div>
                  <div className="lesson-info">
                    <div className="lesson-title">The magic of compounding</div>
                    <div className="lesson-meta">Lesson 4 · 3 min</div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                  <button 
                    className="play-circle-btn" 
                    aria-label="Play Lesson"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlayingLesson(!isPlayingLesson);
                    }}
                  >
                    {isPlayingLesson ? (
                      <Pause size={15} fill="#ffffff" color="#ffffff" />
                    ) : (
                      <Play size={15} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                    )}
                  </button>
                </div>
              </section>

              {/* Visit Munshiji Room Preview Section */}
              <section>
                <div className="room-card" onClick={handleEnterRoom}>
                  <div className="room-card-content">
                    <h2 className="room-card-title">Visit Munshiji</h2>
                    <p className="room-card-sub">Explore his room, at your pace.</p>
                    <button className="btn-enter-room" onClick={(e) => {
                      e.stopPropagation();
                      handleEnterRoom();
                    }}>
                      <span>Enter room</span>
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="room-card-art">
                    <img 
                      src="./assets/room_munshiji_clean.png" 
                      alt="Munshiji room illustration" 
                    />
                  </div>
                </div>
              </section>
            </div>


            {/* Shared Mini-Player & Full Player across the Home screen */}
            <MiniPlayer />
            <FullPlayerModal />

            {/* Bottom Navigation Bar */}
            <nav className="bottom-nav">
              <div className="bottom-nav-tabs">
                {/* Home */}
                <button 
                  className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
                  onClick={() => setActiveTab('home')}
                >
                  <div className="nav-tab-icon">
                    <HomeIcon 
                      size={22} 
                      strokeWidth={activeTab === 'home' ? 2.6 : 1.8} 
                      fill={activeTab === 'home' ? '#0f172a' : 'none'} 
                      color="#0f172a" 
                    />
                  </div>
                  <span className="nav-tab-label">Home</span>
                </button>

                {/* Gullak */}
                <button 
                  className={`nav-tab-item ${activeTab === 'gullak' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('gullak');
                    setIsGullakDragOpen(true);
                  }}
                >
                  <div className="nav-tab-icon">
                    <div 
                      role="img"
                      aria-label="Gullak"
                      style={{ 
                        width: '23px', 
                        height: '19px', 
                        backgroundColor: activeTab === 'gullak' ? '#0f172a' : '#94a3b8',
                        maskImage: 'url(./assets/exact_elephant_icon_trans.png)',
                        WebkitMaskImage: 'url(./assets/exact_elephant_icon_trans.png)',
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        transition: 'background-color 0.15s ease'
                      }} 
                    />
                  </div>
                  <span className="nav-tab-label">Gullak</span>
                </button>

                {/* Learn */}
                <button 
                  className={`nav-tab-item ${activeTab === 'learn' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('learn');
                    showToast('Learn: Lesson 4 "Compounding" 📖');
                  }}
                >
                  <div className="nav-tab-icon">
                    <BookOpen 
                      size={21} 
                      strokeWidth={activeTab === 'learn' ? 2.4 : 1.8} 
                      color={activeTab === 'learn' ? '#0f172a' : '#94a3b8'} 
                    />
                  </div>
                  <span className="nav-tab-label">Learn</span>
                </button>

                {/* Portfolio */}
                <button 
                  className={`nav-tab-item ${activeTab === 'portfolio' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('portfolio');
                    showToast('Portfolio: Overview & Holdings 📊');
                  }}
                >
                  <div className="nav-tab-icon">
                    <PieChart 
                      size={21} 
                      strokeWidth={activeTab === 'portfolio' ? 2.4 : 1.8} 
                      color={activeTab === 'portfolio' ? '#0f172a' : '#94a3b8'} 
                    />
                  </div>
                  <span className="nav-tab-label">Portfolio</span>
                </button>

                {/* More */}
                <button 
                  className={`nav-tab-item ${activeTab === 'more' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('more');
                    showToast('Settings & Tilt Sensitivity ⚙️');
                  }}
                >
                  <div className="nav-tab-icon">
                    <MoreHorizontal 
                      size={22} 
                      strokeWidth={activeTab === 'more' ? 2.5 : 1.8} 
                      color={activeTab === 'more' ? '#0f172a' : '#94a3b8'} 
                    />
                  </div>
                  <span className="nav-tab-label">More</span>
                </button>
              </div>

              {/* iOS Bottom Indicator Bar */}
              <div className="home-indicator-bar"></div>
            </nav>
          </>
        )}
      </div>
    </div>
  </AudioProvider>
  );
}



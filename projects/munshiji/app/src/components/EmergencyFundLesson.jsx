import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, X, ChevronRight, Calendar, Info, Check, Sparkles, 
  AlertCircle, ShoppingCart, Home, Lightbulb, Wifi, Gamepad2,
  ArrowRight, RotateCcw, 
  Minus, Plus 
} from 'lucide-react';

export default function EmergencyFundLesson({ onBack, onClose, onComplete }) {
  // Current screen: 1 to 7
  const [currentStep, setCurrentStep] = useState(1);

  // ==========================================
  // SCREEN 1: EXPLORE
  // ==========================================
  const [s1Choice, setS1Choice] = useState(null); // 'set-aside' | 'rework-budget'

  // ==========================================
  // SCREEN 2: SORT (2 CARDS: TRAVEL & HOLIDAY)
  // ==========================================
  const sortCardsData = [
    {
      id: 1,
      badgeText: '1 of 2',
      dotIndex: 0,
      title: 'Urgent family travel',
      subtitle: 'Unexpected essential travel for an urgent family situation.',
      category: 'emergency',
      illustration: './assets/learn/s2_card3_travel.png',
      feedbackSuccessTitle: 'That’s right — emergency.',
      explanation: 'An unforeseen family emergency is sudden and non-negotiable — what a buffer is for.'
    },
    {
      id: 2,
      badgeText: '2 of 2',
      dotIndex: 1,
      title: 'Planned holiday',
      subtitle: 'A year-end beach trip with friends to relax and unwind.',
      category: 'planned',
      illustration: './assets/learn/s2_card4_holiday.png',
      feedbackSuccessTitle: 'That’s right — plan for it.',
      explanation: 'A holiday is a planned expense. Save for it separately from your emergency fund.'
    }
  ];

  const [s2CardIndex, setS2CardIndex] = useState(0);
  const [s2CardState, setS2CardState] = useState({}); // { [index]: { chosenCategory, isCorrect } }
  const [s2Feedback, setS2Feedback] = useState(null); // { isCorrect, title, message }
  const [s2ReviewedAll, setS2ReviewedAll] = useState(false);

  // Dragging state for Screen 2
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const currentSortCard = sortCardsData[s2CardIndex];

  const handleSortAnswer = (chosenCategory) => {
    if (!currentSortCard) return;
    const isCorrect = chosenCategory === currentSortCard.category;
    
    setS2CardState(prev => ({
      ...prev,
      [s2CardIndex]: { chosenCategory, isCorrect }
    }));

    if (isCorrect) {
      setS2Feedback({
        isCorrect: true,
        title: currentSortCard.feedbackSuccessTitle || 'That’s right.',
        message: currentSortCard.explanation
      });
      if (s2CardIndex === sortCardsData.length - 1) {
        setS2ReviewedAll(true);
      }
    } else {
      setS2Feedback({
        isCorrect: false,
        title: 'Not quite — try again.',
        message: 'Is this an urgent, unexpected need, or something that can be planned ahead?'
      });
    }
  };

  const handleNextSortCard = () => {
    setS2Feedback(null);
    setDragOffset({ x: 0, y: 0 });
    if (s2CardIndex < sortCardsData.length - 1) {
      setS2CardIndex(prev => prev + 1);
    }
  };

  const handlePointerDown = (e) => {
    if (s2Feedback && s2Feedback.isCorrect) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: Math.max(-40, Math.min(40, dy)) });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset.x < -70) {
      handleSortAnswer('emergency');
    } else if (dragOffset.x > 70) {
      handleSortAnswer('planned');
    }
    setDragOffset({ x: 0, y: 0 });
  };

  // ==========================================
  // SCREEN 3: ESSENTIAL EXPENSES (BUILD A BUDGET)
  // ==========================================
  const expenseItems = [
    { id: 'rent', label: 'Rent', amount: 6000, isEssential: true, icon: Home },
    { id: 'groceries', label: 'Groceries', amount: 3000, isEssential: true, icon: ShoppingCart },
    { id: 'utilities', label: 'Utilities', amount: 1000, isEssential: true, icon: Lightbulb },
    { id: 'entertainment', label: 'Entertainment', amount: 1500, isEssential: false, icon: Gamepad2 },
    { id: 'subscriptions', label: 'Optional subscriptions', amount: 500, isEssential: false, icon: Wifi }
  ];

  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [s3Feedback, setS3Feedback] = useState(null);

  const toggleExpense = (id) => {
    setSelectedExpenses(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    if (s3Feedback) setS3Feedback(null);
  };

  const s3SelectedTotal = expenseItems
    .filter(item => selectedExpenses.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0);

  const handleCheckExpenses = () => {
    const hasRent = selectedExpenses.includes('rent');
    const hasGroceries = selectedExpenses.includes('groceries');
    const hasUtilities = selectedExpenses.includes('utilities');
    const hasEntertainment = selectedExpenses.includes('entertainment');
    const hasSubscriptions = selectedExpenses.includes('subscriptions');

    const exactMatch = hasRent && hasGroceries && hasUtilities && !hasEntertainment && !hasSubscriptions;

    if (exactMatch) {
      setS3Feedback({
        isCorrect: true,
        text: 'Spot on! Rent, groceries, and utilities are essentials (₹10,000/mo).'
      });
    } else {
      setS3Feedback({
        isCorrect: false,
        text: 'Choose only costs that cannot reasonably be paused.'
      });
    }
  };

  // ==========================================
  // SCREEN 4: EXPLORE COVER (1, 2, 3 MONTHS)
  // ==========================================
  const [coverMonths, setCoverMonths] = useState(2); // 1, 2, 3
  const monthlyEssentialBaseline = 10000;
  const totalCushion = coverMonths * monthlyEssentialBaseline;

  // ==========================================
  // SCREEN 5: STARTER MILESTONE
  // ==========================================
  const [weeklyRate, setWeeklyRate] = useState(500); // 250, 500, 750
  const starterGoal = 3000;
  const weeksToReach = Math.ceil(starterGoal / weeklyRate);

  // ==========================================
  // SCREEN 6: USE AND REBUILD
  // Explicit states: 'initial' | 'transferring' | 'rebuilding' | 'completed'
  // ==========================================
  const [s6State, setS6State] = useState(() => {
    try {
      const saved = localStorage.getItem('munshiji_emergency_fund_s6_sim');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.state === 'rebuilding' || parsed.state === 'completed') {
          return parsed.state;
        }
      }
    } catch {}
    return 'initial';
  });

  const [s6RebuildPace, setS6RebuildPace] = useState(() => {
    try {
      const saved = localStorage.getItem('munshiji_emergency_fund_s6_sim');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.rebuildPace || null;
      }
    } catch {}
    return null;
  });

  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const persistS6Simulation = (state, pace) => {
    try {
      localStorage.setItem('munshiji_emergency_fund_s6_sim', JSON.stringify({
        state,
        rebuildPace: pace
      }));
    } catch {}
  };

  const handleCoverRepair = () => {
    // Prevent repeated activation during transfer or if already transferred
    if (s6State !== 'initial') return;

    if (prefersReducedMotion) {
      setS6State('rebuilding');
      persistS6Simulation('rebuilding', null);
      return;
    }

    setS6State('transferring');
    setTimeout(() => {
      setS6State('rebuilding');
      persistS6Simulation('rebuilding', null);
    }, 950);
  };

  const handleSelectRebuildPace = (rate) => {
    setS6RebuildPace(rate);
    setS6State('completed');
    persistS6Simulation('completed', rate);
  };

  const handleResetS6 = () => {
    setS6State('initial');
    setS6RebuildPace(null);
    try {
      localStorage.removeItem('munshiji_emergency_fund_s6_sim');
    } catch {}
  };

  // ==========================================
  // SCREEN 6: RECAP
  // ==========================================
  const [completedOnce, setCompletedOnce] = useState(false);

  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const handleFinishAll = () => {
    if (!completedOnce) {
      setCompletedOnce(true);
      if (onComplete) onComplete();
    }
    if (onClose) onClose();
    else onBack();
  };

  const handleCreateEmergencyGoal = () => {
    if (!completedOnce) {
      setCompletedOnce(true);
      if (onComplete) onComplete();
    }
    if (onClose) onClose();
    else onBack();
  };

  return (
    <div className="emergency-lesson-screen">
      {/* Top Header */}
      <header className="lesson-nav-header">
        <button 
          className="lesson-nav-btn" 
          onClick={handleBackNavigation} 
          aria-label={currentStep === 1 ? "Back to lessons" : "Previous step"}
          type="button"
        >
          <ArrowLeft size={22} strokeWidth={2.4} color="#0f172a" />
        </button>

        <h1 className="lesson-nav-title">Emergency fund</h1>

        <button 
          className="lesson-nav-btn" 
          onClick={onClose || onBack} 
          aria-label="Close lesson"
          type="button"
        >
          <X size={22} strokeWidth={2.4} color="#0f172a" />
        </button>
      </header>

      {/* 7-Segment Progress Bar */}
      <div 
        className="lesson-step-bar-wrap" 
        role="progressbar" 
        aria-valuenow={currentStep} 
        aria-valuemin={1} 
        aria-valuemax={7}
        aria-label={`Step ${currentStep} of 7`}
      >
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <button 
            key={step} 
            type="button"
            className={`lesson-step-segment ${step <= currentStep ? 'active' : ''}`}
            onClick={() => setCurrentStep(step)}
            aria-label={`Jump to step ${step}`}
            style={{ cursor: 'pointer', border: 'none', padding: 0 }}
          />
        ))}
      </div>

      {/* Scrollable Lesson Body */}
      <div className="lesson-scroll-body">
        
        {/* ==================================================== */}
        {/* SCREEN 1: EXPLORE */}
        {/* ==================================================== */}
        {currentStep === 1 && (
          <div className="lesson-step-fade">
            <div className="lesson-plain-step-label left">
              1 of 7 · Explore
            </div>

            <h2 className="lesson-heading-title">
              An unexpected repair.
            </h2>
            <p className="lesson-heading-subtitle">
              Meet Asha. Her phone stopped working, and she needs it for work.
            </p>

            <div className="lesson-hero-illu-wrap">
              <img 
                src="./assets/learn/emergency_repair_phone_trans.png" 
                alt="Broken phone needing unexpected repair" 
                className="lesson-hero-img" 
                draggable={false}
              />
            </div>

            {/* Context Card: Repair cost & Budget state */}
            <div className="lesson-context-card">
              <div className="context-col-left">
                <div className="context-icon-circle">
                  <span className="rupee-symbol">₹</span>
                </div>
                <div className="context-text-stack">
                  <span className="context-label">Repair cost</span>
                  <span className="context-value">₹1,000</span>
                </div>
              </div>

              <div className="context-divider-line" />

              <div className="context-col-right">
                <div className="context-icon-circle">
                  <Calendar size={18} strokeWidth={2.2} color="#7c3aed" />
                </div>
                <p className="context-note">
                  Monthly budget already allocated for regular essentials.
                </p>
              </div>
            </div>

            <h3 className="lesson-prompt-question">
              How should Asha handle this unexpected expense?
            </h3>

            {/* Two Exploration Options */}
            <div className="lesson-options-group">
              <div 
                className={`lesson-option-card ${s1Choice === 'set-aside' ? 'selected' : ''}`}
                onClick={() => setS1Choice('set-aside')}
                role="button"
                tabIndex={0}
              >
                <div className="option-radio-indicator">
                  {s1Choice === 'set-aside' && <div className="radio-inner-dot" />}
                </div>

                <div className="option-text-stack">
                  <span className="option-title">Use money set aside</span>
                  <span className="option-desc">From an emergency buffer or savings</span>
                </div>

                <ChevronRight size={19} strokeWidth={2.2} color="#94a3b8" className="option-chevron" />
              </div>

              <div 
                className={`lesson-option-card ${s1Choice === 'rework-budget' ? 'selected' : ''}`}
                onClick={() => setS1Choice('rework-budget')}
                role="button"
                tabIndex={0}
              >
                <div className="option-radio-indicator">
                  {s1Choice === 'rework-budget' && <div className="radio-inner-dot" />}
                </div>

                <div className="option-text-stack">
                  <span className="option-title">Rework this month’s budget</span>
                  <span className="option-desc">Find ₹1,000 by changing other spending</span>
                </div>

                <ChevronRight size={19} strokeWidth={2.2} color="#94a3b8" className="option-chevron" />
              </div>
            </div>

            {/* Inline Feedback - Concise one-liner */}
            {s1Choice === 'set-aside' && (
              <div className="lesson-inline-feedback success-soft" role="status">
                <Sparkles size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
                <span className="feedback-one-liner">
                  Planned spending stays covered; savings decreases by ₹1,000.
                </span>
              </div>
            )}

            {s1Choice === 'rework-budget' && (
              <div className="lesson-inline-feedback neutral-soft" role="status">
                <AlertCircle size={16} color="#ea580c" style={{ flexShrink: 0 }} />
                <span className="feedback-one-liner">
                  ₹1,000 must come from other spending, which may be difficult.
                </span>
              </div>
            )}

            <button 
              className={`lesson-primary-action-btn ${s1Choice ? 'purple-active' : 'grey-disabled'}`}
              disabled={!s1Choice}
              onClick={() => setCurrentStep(2)}
              type="button"
              style={{ marginTop: '16px' }}
            >
              <span>Continue</span>
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* SCREEN 2: SORT (URGENT TRAVEL & PLANNED HOLIDAY) */}
        {/* ==================================================== */}
        {currentStep === 2 && (
          <div className="lesson-step-fade">
            <div className="lesson-plain-step-label center">
              2 of 7 · Sort
            </div>

            <h2 className="lesson-heading-title center">
              Emergency or planned?
            </h2>
            <p className="lesson-heading-subtitle center" style={{ marginBottom: '14px' }}>
              Sort each expense into the right place.
            </p>

            {/* Interactive Card */}
            <div className="sort-card-outer">
              <div 
                className={`sort-interactive-card ${isDragging ? 'is-dragging' : ''}`}
                style={{
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.04}deg)`
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className="sort-card-top-row">
                  <span className="sort-card-counter-pill">
                    {currentSortCard.badgeText}
                  </span>
                </div>

                <div className="sort-card-illu-center">
                  <img 
                    src={currentSortCard.illustration} 
                    alt="" 
                    className="sort-card-hero-img"
                    draggable={false}
                  />
                </div>

                <h3 className="sort-card-title">
                  {currentSortCard.title}
                </h3>
                <p className="sort-card-sub">
                  {currentSortCard.subtitle}
                </p>
              </div>
            </div>

            {/* Category Drop/Tap Targets */}
            <div className="sort-targets-grid">
              <button 
                type="button"
                className={`sort-target-btn target-emergency ${
                  s2CardState[s2CardIndex]?.chosenCategory === 'emergency'
                    ? (s2CardState[s2CardIndex]?.isCorrect ? 'is-selected' : 'is-wrong')
                    : ''
                } ${dragOffset.x < -35 ? 'is-hovered' : ''}`}
                onClick={() => handleSortAnswer('emergency')}
                aria-label="Sort into Emergency fund"
              >
                {s2CardState[s2CardIndex]?.chosenCategory === 'emergency' && (
                  s2CardState[s2CardIndex]?.isCorrect ? (
                    <div className="target-selected-check-badge">
                      <Check size={12} color="#ffffff" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="target-selected-retry-badge">
                      <RotateCcw size={12} color="#ffffff" strokeWidth={2.8} />
                    </div>
                  )
                )}
                <div className="target-icon-wrap">
                  <img 
                    src="./assets/learn/s2_shield_icon_clean.png" 
                    alt="" 
                    className="target-clay-icon" 
                  />
                </div>
                <span className="target-label">Emergency fund</span>
              </button>

              <button 
                type="button"
                className={`sort-target-btn target-planned ${
                  s2CardState[s2CardIndex]?.chosenCategory === 'planned'
                    ? (s2CardState[s2CardIndex]?.isCorrect ? 'is-selected' : 'is-wrong')
                    : ''
                } ${dragOffset.x > 35 ? 'is-hovered' : ''}`}
                onClick={() => handleSortAnswer('planned')}
                aria-label="Sort into Plan and save"
              >
                {s2CardState[s2CardIndex]?.chosenCategory === 'planned' && (
                  s2CardState[s2CardIndex]?.isCorrect ? (
                    <div className="target-selected-check-badge">
                      <Check size={12} color="#ffffff" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="target-selected-retry-badge">
                      <RotateCcw size={12} color="#ffffff" strokeWidth={2.8} />
                    </div>
                  )
                )}
                <div className="target-icon-wrap">
                  <img 
                    src="./assets/learn/s2_calendar_icon_clean.png" 
                    alt="" 
                    className="target-clay-icon" 
                  />
                </div>
                <span className="target-label">Plan and save</span>
              </button>
            </div>

            {/* Counter text or Touch hint & Dots row */}
            {s2Feedback?.isCorrect && s2CardIndex === sortCardsData.length - 1 ? (
              <p className="sort-sorted-counter-text">
                2 of 2 sorted
              </p>
            ) : s2Feedback && !s2Feedback.isCorrect ? (
              <>
                <p className="sort-try-again-hint">
                  Tap a category to try again.
                </p>
                <div className="sort-dots-row" aria-hidden="true">
                  {sortCardsData.map((_, dotIdx) => {
                    const isDotActive = dotIdx === s2CardIndex;
                    const isDotCompleted = dotIdx < s2CardIndex;
                    return (
                      <div 
                        key={dotIdx}
                        className={`sort-dot ${isDotActive ? 'active' : ''} ${isDotCompleted ? 'completed' : ''}`}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <p className="sort-touch-hint">
                  Tap a category or drag the card into it.
                </p>
                <div className="sort-dots-row" aria-hidden="true">
                  {sortCardsData.map((_, dotIdx) => {
                    const isDotActive = dotIdx === s2CardIndex;
                    const isDotCompleted = dotIdx < s2CardIndex;
                    return (
                      <div 
                        key={dotIdx}
                        className={`sort-dot ${isDotActive ? 'active' : ''} ${isDotCompleted ? 'completed' : ''}`}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* Structured Feedback Card */}
            {s2Feedback ? (
              <div 
                className={`sort-feedback-card ${s2Feedback.isCorrect ? 'is-correct' : 'is-wrong'}`}
                role="status"
              >
                <div className={`sort-feedback-icon-wrap ${!s2Feedback.isCorrect ? 'is-wrong' : ''}`}>
                  {s2Feedback.isCorrect ? (
                    <Check size={18} color="#ffffff" strokeWidth={3} />
                  ) : (
                    <RotateCcw size={18} color="#ffffff" strokeWidth={2.4} />
                  )}
                </div>
                <div className="sort-feedback-content">
                  <h4 className="sort-feedback-title">
                    {s2Feedback.title}
                  </h4>
                  <p className="sort-feedback-body">
                    {s2Feedback.message}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Action Area: Continue Button or 'Choose again to continue' */}
            {s2Feedback?.isCorrect ? (
              <button 
                className="lesson-primary-action-btn purple-active"
                onClick={s2CardIndex < sortCardsData.length - 1 ? handleNextSortCard : () => setCurrentStep(3)}
                type="button"
                style={{ marginTop: '16px' }}
              >
                <span>Continue</span>
                <ArrowRight size={18} strokeWidth={2.2} />
              </button>
            ) : s2Feedback && !s2Feedback.isCorrect ? (
              <p className="sort-choose-again-text">
                Choose again to continue
              </p>
            ) : (
              <p className="sort-choose-again-text" style={{ visibility: 'hidden' }}>
                Choose again to continue
              </p>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* SCREEN 3: ESSENTIAL EXPENSES (BUILD A BUDGET) */}
        {/* ==================================================== */}
        {currentStep === 3 && (
          <div className="lesson-step-fade">
            <div className="lesson-plain-step-label center">
              3 of 7 · Build a budget
            </div>

            <div className="s3-top-split">
              <div className="s3-title-col">
                <h2 className="lesson-heading-title" style={{ marginBottom: '6px' }}>
                  What must stay<br />covered?
                </h2>
                <p className="lesson-heading-subtitle" style={{ marginBottom: '0' }}>
                  Select Asha’s essential monthly expenses.
                </p>
              </div>

              <div className="s3-wallet-illu-col">
                <img 
                  src="./assets/learn/screen3_wallet_clean.png" 
                  alt="Asha's monthly budget wallet" 
                  className="s3-wallet-img"
                  draggable={false}
                />
              </div>
            </div>

            <span className="s3-section-label">Monthly example</span>

            {/* Checkbox List */}
            <div className="s3-checklist-wrap">
              {expenseItems.map((item) => {
                const isChecked = selectedExpenses.includes(item.id);
                const ItemIcon = item.icon;
                return (
                  <div 
                    key={item.id}
                    className={`s3-expense-row ${isChecked ? 'selected' : ''}`}
                    onClick={() => toggleExpense(item.id)}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                  >
                    <div className={`s3-checkbox-box ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={14} strokeWidth={3} color="#ffffff" />}
                    </div>

                    <div className="s3-item-icon-circle">
                      <ItemIcon size={20} color="#7c3aed" strokeWidth={2.2} />
                    </div>

                    <div className="s3-item-text-stack">
                      <span className="s3-item-name">{item.label}</span>
                      <span className="s3-item-cost">₹{item.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Total Box */}
            <div className="s3-total-banner">
              <span className="s3-total-label">Selected essentials</span>
              <span className="s3-total-value">
                ₹{s3SelectedTotal.toLocaleString('en-IN')} / month
              </span>
            </div>

            <p className="s3-sub-helper">
              Choose costs she cannot reasonably pause.
            </p>

            {/* Feedback when checked - Concise one-liner */}
            {s3Feedback && (
              <div 
                className={`lesson-inline-feedback ${s3Feedback.isCorrect ? 'success-soft' : 'warning-soft'}`}
                role="status"
              >
                {s3Feedback.isCorrect ? (
                  <Sparkles size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={16} color="#ea580c" style={{ flexShrink: 0 }} />
                )}
                <span className="feedback-one-liner">
                  {s3Feedback.text}
                </span>
              </div>
            )}

            {/* Action Button */}
            {!s3Feedback?.isCorrect ? (
              <button 
                className={`lesson-primary-action-btn ${selectedExpenses.length > 0 ? 'purple-active' : 'grey-disabled'}`}
                disabled={selectedExpenses.length === 0}
                onClick={handleCheckExpenses}
                type="button"
                style={{ marginTop: '14px' }}
              >
                <span>Check my choices</span>
              </button>
            ) : (
              <button 
                className="lesson-primary-action-btn purple-active"
                onClick={() => setCurrentStep(4)}
                type="button"
                style={{ marginTop: '14px' }}
              >
                <span>Continue</span>
                <ArrowRight size={18} strokeWidth={2.2} />
              </button>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* SCREEN 4: EXPLORE COVER (1, 2, 3 MONTHS) */}
        {/* ==================================================== */}
        {currentStep === 4 && (
          <div className="lesson-step-fade">
            <div className="lesson-plain-step-label left">
              4 of 7 · Explore
            </div>

            <h2 className="lesson-heading-title">
              How much is a cushion?
            </h2>
            <p className="lesson-heading-subtitle">
              Explore cover for Asha’s essential expenses.
            </p>

            {/* Static 3D Illustration */}
            <div className="s4-shield-stage">
              <img 
                src="./assets/learn/screen4_shield_clean.png" 
                alt="Protection shield cushion" 
                className="s4-shield-img"
                draggable={false}
              />
            </div>

            {/* Amount Display */}
            <div className="s4-amount-display-wrap">
              <div className="s4-amount-main">
                ₹{totalCushion.toLocaleString('en-IN')}
              </div>
              <div className="s4-amount-sub">
                {coverMonths} {coverMonths === 1 ? 'month' : 'months'} of essentials
              </div>
              <div className="s4-amount-formula-pill">
                ₹10,000 per month × {coverMonths} {coverMonths === 1 ? 'month' : 'months'}
              </div>
            </div>

            {/* Slider with Discrete Visual Stops */}
            <div className="s4-slider-control-block">
              <div className="s4-slider-track-wrap">
                <input 
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={coverMonths}
                  onChange={(e) => setCoverMonths(Number(e.target.value))}
                  className="s4-range-slider"
                  aria-label="Cushion duration in months"
                />
                {/* Visual Stop Markers on the track */}
                <div className="s4-track-stops-overlay" aria-hidden="true">
                  <span className={`stop-dot dot-1 ${coverMonths === 1 ? 'active' : ''}`} />
                  <span className={`stop-dot dot-2 ${coverMonths === 2 ? 'active' : ''}`} />
                  <span className={`stop-dot dot-3 ${coverMonths === 3 ? 'active' : ''}`} />
                </div>
              </div>

              <div className="s4-slider-stops-labels">
                <span className={coverMonths === 1 ? 'active' : ''}>1 month</span>
                <span className={coverMonths === 2 ? 'active' : ''}>2 months</span>
                <span className={coverMonths === 3 ? 'active' : ''}>3 months</span>
              </div>
            </div>

            {/* Stepper Controls Row */}
            <div className="s4-stepper-row">
              <button 
                type="button"
                className={`s4-stepper-btn ${coverMonths <= 1 ? 'disabled' : ''}`}
                disabled={coverMonths <= 1}
                onClick={() => setCoverMonths(prev => Math.max(1, prev - 1))}
                aria-label="Decrease months"
              >
                <Minus size={20} strokeWidth={2.4} />
              </button>

              <div className="s4-stepper-center-info">
                <span className="s4-stepper-val">₹{totalCushion.toLocaleString('en-IN')}</span>
                <span className="s4-stepper-lbl">{coverMonths} months of essentials</span>
              </div>

              <button 
                type="button"
                className={`s4-stepper-btn ${coverMonths >= 3 ? 'disabled' : ''}`}
                disabled={coverMonths >= 3}
                onClick={() => setCoverMonths(prev => Math.min(3, prev + 1))}
                aria-label="Increase months"
              >
                <Plus size={20} strokeWidth={2.4} />
              </button>
            </div>

            {/* Learning Example Tip Card */}
            <div className="learning-tip-card">
              <div className="tip-bulb-icon">
                <Lightbulb size={22} color="#7c3aed" />
              </div>
              <div className="tip-content">
                <span className="tip-tag-title">LEARNING EXAMPLE</span>
                <p>
                  More months means a larger cushion. Your own target depends on your circumstances.
                </p>
              </div>
            </div>

            {/* Purple CTA Button */}
            <button 
              className="lesson-primary-action-btn purple-active"
              onClick={() => setCurrentStep(5)}
              type="button"
              style={{ marginTop: '16px' }}
            >
              <span>Continue</span>
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* SCREEN 5: STARTER MILESTONE */}
        {/* ==================================================== */}
        {currentStep === 5 && (
          <div className="lesson-step-fade">
            <div className="lesson-plain-step-label left">
              5 of 7 · Plan
            </div>

            <h2 className="lesson-heading-title">
              Start with a small<br />milestone.
            </h2>
            <p className="lesson-heading-subtitle">
              Help Asha plan her first ₹3,000.
            </p>

            {/* 3D Calendar & Coins Illustration */}
            <div className="s5-calendar-stage">
              <img 
                src="./assets/learn/screen5_calendar_clean.png" 
                alt="Calendar milestone with coins" 
                className="s5-calendar-img"
                draggable={false}
              />
            </div>

            {/* Starter Target Card */}
            <div className="s5-starter-card">
              <span className="s5-starter-label">Starter target</span>
              <span className="s5-starter-amount">₹3,000</span>
            </div>

            <h3 className="s5-choice-prompt">
              Choose your weekly contribution
            </h3>

            {/* 3 Weekly Contribution Options */}
            <div className="s5-weekly-options-grid">
              {[250, 500, 750].map((rate) => (
                <button 
                  key={rate}
                  type="button"
                  className={`s5-option-btn ${weeklyRate === rate ? 'selected' : ''}`}
                  onClick={() => setWeeklyRate(rate)}
                >
                  <span className="s5-opt-amount">₹{rate}</span>
                  <span className="s5-opt-unit">/ week</span>
                </button>
              ))}
            </div>

            {/* Timeline Result Card */}
            <div className="s5-timeline-result-card">
              <span className="s5-timeline-sub">You’ll reach ₹3,000 in</span>
              <span className="s5-timeline-weeks">{weeksToReach} weeks</span>
              <span className="s5-timeline-footer">At ₹{weeklyRate} each week.</span>
            </div>

            <p className="s5-assumes-note">
              Assumes regular contributions and no withdrawals.
            </p>

            {/* Info Tip Card */}
            <div className="s5-info-banner">
              <Info size={18} color="#7c3aed" style={{ flexShrink: 0 }} />
              <p>Compare the options. There is no single right pace.</p>
            </div>

            {/* Purple CTA Button */}
            <button 
              className="lesson-primary-action-btn purple-active"
              onClick={() => setCurrentStep(6)}
              type="button"
              style={{ marginTop: '16px' }}
            >
              <span>Try the repair scenario</span>
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>

            <span className="lesson-footer-caption">
              Practice only · No payment.
            </span>
          </div>
        )}

        {/* ==================================================== */}
        {/* SCREEN 6: USE AND REBUILD */}
        {/* ==================================================== */}
        {currentStep === 6 && (
          <div className="lesson-step-fade">
            <div className="lesson-plain-step-label left">
              6 of 7 · Use and rebuild
            </div>

            <h2 className="lesson-heading-title">
              Use it when you need it.
            </h2>
            <p className="lesson-heading-subtitle">
              Asha has now saved ₹3,000. Her essential repair costs ₹1,000.
            </p>

            <div className="s6-hero-illu-stage">
              <img 
                src="./assets/learn/screen6_asha_clean.png" 
                alt="Asha with broken phone" 
                className="s6-asha-img"
                draggable={false}
              />
            </div>

            {/* Panels + Coin Animation Wrapper */}
            {/* Two Panels Grid */}
            <div className="s6-panels-grid">
              <div className="s6-panel-card source-panel">
                <div className="s6-panel-header">
                  <span className="s6-panel-title">Emergency fund</span>
                </div>
                <div className="s6-panel-body">
                  <span className="s6-panel-amount">
                    {s6State === 'initial' || s6State === 'transferring' ? '₹3,000' : '₹2,000'}
                  </span>
                  <img 
                    src="./assets/learn/s2_shield_icon_clean.png" 
                    alt="" 
                    className="s6-panel-icon" 
                  />
                </div>
              </div>

              <div className={`s6-panel-card dest-panel ${s6State === 'rebuilding' || s6State === 'completed' ? 'covered' : ''}`}>
                <div className="s6-panel-header">
                  <span className="s6-panel-title">Phone repair</span>
                </div>
                <div className="s6-panel-body">
                  {s6State === 'rebuilding' || s6State === 'completed' ? (
                    <div className="s6-covered-badge">
                      <Check size={18} strokeWidth={2.6} color="#16a34a" />
                      <span>Repair covered</span>
                    </div>
                  ) : (
                    <>
                      <span className="s6-panel-amount">₹1,000</span>
                      <img 
                        src="./assets/learn/s6_wrench_icon_clean.png" 
                        alt="" 
                        className="s6-panel-icon wrench-icon" 
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Square Animation Stage inside empty UI area */}
            <div className="s6-animation-stage" aria-hidden="true">
              {s6State === 'transferring' && (
                <>
                  <svg className="s6-arc-guide" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path 
                      d="M 20 65 Q 50 18 80 65" 
                      fill="none" 
                      stroke="rgba(124, 58, 237, 0.3)" 
                      strokeWidth="2" 
                      strokeDasharray="3 3" 
                    />
                  </svg>
                  <img 
                    src="./assets/learn/screen6_coin.png" 
                    alt="₹1,000 coin" 
                    className="s6-animated-coin" 
                    draggable={false}
                  />
                </>
              )}
            </div>

            {/* Pre-transfer: action prompt and button */}
            {(s6State === 'initial' || s6State === 'transferring') && (
              <div className="s6-stage-container">
                <p className="s6-action-helper">
                  Use the fund for the repair, then plan to rebuild it.
                </p>

                <button 
                  className={`lesson-primary-action-btn ${s6State === 'transferring' ? 'grey-disabled' : 'charcoal-active'}`}
                  disabled={s6State === 'transferring'}
                  onClick={handleCoverRepair}
                  type="button"
                  id="s6-cover-repair-btn"
                  style={{ marginTop: '10px' }}
                >
                  <span>{s6State === 'transferring' ? 'Covering repair...' : 'Cover the repair'}</span>
                </button>
              </div>
            )}

            {/* Rebuilding choices revealed after transfer */}
            {(s6State === 'rebuilding' || s6State === 'completed') && (
              <div className="s6-rebuild-section-fade">
                <div className="s6-rebuild-header-card">
                  <div className="rebuild-badge-icon">
                    <RotateCcw size={18} color="#7c3aed" />
                  </div>
                  <div className="rebuild-header-text">
                    <span className="rebuild-title">₹1,000 to rebuild your starter fund</span>
                    <p className="rebuild-desc">
                      The fund did its job! Choose a pace to bring Asha’s starter fund back to ₹3,000.
                    </p>
                  </div>
                </div>

                <div className="s6-rebuild-choices-grid">
                  <button 
                    type="button"
                    className={`s6-rebuild-choice-btn ${s6RebuildPace === 250 ? 'selected' : ''}`}
                    onClick={() => handleSelectRebuildPace(250)}
                    id="s6-choice-250-btn"
                  >
                    <span className="rebuild-pace-amt">₹250/week</span>
                    <span className="rebuild-pace-dur">4 weeks</span>
                  </button>

                  <button 
                    type="button"
                    className={`s6-rebuild-choice-btn ${s6RebuildPace === 500 ? 'selected' : ''}`}
                    onClick={() => handleSelectRebuildPace(500)}
                    id="s6-choice-500-btn"
                  >
                    <span className="rebuild-pace-amt">₹500/week</span>
                    <span className="rebuild-pace-dur">2 weeks</span>
                  </button>
                </div>

                {s6RebuildPace && (
                  <div className="s6-rebuild-summary-pill">
                    <Sparkles size={16} color="#7c3aed" />
                    <span>
                      Asha is back at ₹3,000 in just {s6RebuildPace === 500 ? '2 weeks' : '4 weeks'}!
                    </span>
                  </div>
                )}

                <button 
                  className={`lesson-primary-action-btn ${s6State === 'completed' ? 'charcoal-active' : 'grey-disabled'}`}
                  disabled={s6State !== 'completed'}
                  onClick={() => setCurrentStep(7)}
                  type="button"
                  id="s6-finish-chapter-btn"
                  style={{ marginTop: '16px' }}
                >
                  <span>Finish chapter</span>
                  <ArrowRight size={18} strokeWidth={2.2} />
                </button>

                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleResetS6}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Reset simulation
                  </button>
                </div>
              </div>
            )}

            <span className="lesson-footer-caption" style={{ marginTop: '8px' }}>
              Simulation only · No real payment
            </span>
          </div>
        )}

        {/* ==================================================== */}
        {/* SCREEN 7: RECAP */}
        {/* ==================================================== */}
        {currentStep === 7 && (
          <div className="lesson-step-fade">
            <div className="lesson-plain-step-label center">
              7 of 7 · Complete
            </div>

            <h2 className="lesson-heading-title center">
              A little more prepared.
            </h2>

            <div className="s7-shield-stage">
              <img 
                src="./assets/learn/screen7_shield_clean.png" 
                alt="Emergency fund completion badge" 
                className="s7-shield-img"
                draggable={false}
              />
            </div>

            <p className="s7-recap-subtitle">
              You practised building, using and rebuilding an emergency fund.
            </p>

            <div className="s7-takeaways-list">
              <div className="s7-takeaway-item">
                <div className="s7-check-circle">
                  <Check size={16} strokeWidth={3} color="#ffffff" />
                </div>
                <span className="s7-takeaway-text">
                  Separate urgent needs from planned spending
                </span>
              </div>

              <div className="s7-takeaway-item">
                <div className="s7-check-circle">
                  <Check size={16} strokeWidth={3} color="#ffffff" />
                </div>
                <span className="s7-takeaway-text">
                  Base your cushion on essential expenses
                </span>
              </div>

              <div className="s7-takeaway-item">
                <div className="s7-check-circle">
                  <Check size={16} strokeWidth={3} color="#ffffff" />
                </div>
                <span className="s7-takeaway-text">
                  Start small and rebuild after using it
                </span>
              </div>
            </div>

            <div className="s7-cta-block">
              <span className="s7-goal-prompt">
                Want to turn this into your own goal?
              </span>

              <button 
                className="lesson-primary-action-btn purple-active"
                onClick={handleCreateEmergencyGoal}
                type="button"
                style={{ marginTop: '10px' }}
              >
                <span>Create an emergency goal</span>
              </button>

              <button 
                className="s7-secondary-back-btn"
                onClick={handleFinishAll}
                type="button"
              >
                Back to lessons
              </button>

              <span className="lesson-footer-caption" style={{ marginTop: '6px' }}>
                Creating a goal does not move money.
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

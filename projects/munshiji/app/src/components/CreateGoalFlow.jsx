import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, Check, Shield, Info,
  Sparkles, Calendar, IndianRupee, Layers, X,
  Bell, ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'emergency',
    title: 'Emergency fund',
    subtitle: 'For unexpected expenses.',
    icon: './assets/goals/icon_emergency.png',
    nextHelper: 'Next: work out your emergency fund target.',
    defaultName: 'Emergency fund',
    isFullWidth: true
  },
  {
    id: 'purchase',
    title: 'A purchase',
    subtitle: 'For something you want.',
    icon: './assets/goals/icon_purchase.png',
    nextHelper: 'Next: work out your purchase target.',
    defaultName: 'A purchase',
    isFullWidth: false
  },
  {
    id: 'travel',
    title: 'Travel',
    subtitle: 'For your next adventure.',
    icon: './assets/goals/icon_travel.png',
    nextHelper: 'Next: work out your travel target.',
    defaultName: 'Travel',
    isFullWidth: false
  },
  {
    id: 'education',
    title: 'Education',
    subtitle: 'For your learning and growth.',
    icon: './assets/goals/icon_education.png',
    nextHelper: 'Next: work out your education target.',
    defaultName: 'Education',
    isFullWidth: false
  },
  {
    id: 'custom',
    title: 'Something else',
    subtitle: 'A goal that’s unique to you.',
    icon: './assets/goals/icon_custom.png',
    nextHelper: 'Next: work out your custom goal target.',
    defaultName: '',
    isFullWidth: false
  }
];

const ESTIMATE_CATEGORIES = [
  { id: 'housing', label: 'Housing', sub: 'Rent, maintenance, society dues' },
  { id: 'groceries', label: 'Groceries', sub: 'Daily food, groceries, household supplies' },
  { id: 'utilities', label: 'Utilities', sub: 'Electricity, water, cooking gas, internet' },
  { id: 'transport', label: 'Essential transport', sub: 'Fuel, bus/metro passes, commute' },
  { id: 'healthcare', label: 'Healthcare', sub: 'Medications, essential doctor visits' },
  { id: 'repayments', label: 'Required repayments', sub: 'Active EMIs, loan minimums' },
  { id: 'other', label: 'Other essentials', sub: 'Critical recurring family commitments' }
];

export default function CreateGoalFlow({ 
  onBack, 
  onComplete,
  initialCategory = null,
  initialDraft = null
}) {
  // Current stage: 1 (Type) -> 2 (Target) -> 3 (Timeline) -> 4 (Review)
  const [stage, setStage] = useState(1);

  // Setup Draft States (Preserved when going back!)
  const [selectedType, setSelectedType] = useState(initialCategory || initialDraft?.selectedType || null);
  const [goalName, setGoalName] = useState(initialDraft?.goalName ?? (initialCategory === 'emergency' ? 'Emergency fund' : ''));
  
  // Emergency Fund Stage 2 Specific States
  // Starts blank for new users; screenshot values are examples, not defaults!
  const [emergencyMode, setEmergencyMode] = useState(initialDraft?.emergencyMode || 'calculate'); // 'calculate' | 'custom'
  const [monthlyExpense, setMonthlyExpense] = useState(initialDraft?.monthlyExpense || '');
  const [coverageMonths, setCoverageMonths] = useState(initialDraft?.coverageMonths || '3'); // '1' | '3' | '6' | 'custom'
  const [customMonths, setCustomMonths] = useState(initialDraft?.customMonths || '4');
  const [customTargetAmount, setCustomTargetAmount] = useState(initialDraft?.customTargetAmount || '');

  // Other goals target amount (starts blank for new users)
  const [targetAmount, setTargetAmount] = useState(initialDraft?.targetAmount || '');
  
  // Existing savings (optional, added in Stage 3)
  const [existingSavings, setExistingSavings] = useState(initialDraft?.existingSavings || '');

  // Timeline & plan duration
  const [durationMonths, setDurationMonths] = useState(initialDraft?.durationMonths || '6');

  // Reminders enabled (Stage 4)
  const [remindersEnabled, setRemindersEnabled] = useState(initialDraft?.remindersEnabled || false);

  // Help Me Estimate Bottom Sheet State
  const [showEstimateSheet, setShowEstimateSheet] = useState(false);
  const [estimateDraft, setEstimateDraft] = useState({
    housing: '',
    groceries: '',
    utilities: '',
    transport: '',
    healthcare: '',
    repayments: '',
    other: ''
  });

  const selectedCategoryObj = CATEGORIES.find(c => c.id === selectedType);

  // Auto-fill or adjust name when category is selected
  const handleSelectCategory = (catId) => {
    setSelectedType(catId);
    const cat = CATEGORIES.find(c => c.id === catId);
    if (catId === 'custom') {
      if (!goalName || goalName === 'Emergency fund' || goalName === 'A purchase' || goalName === 'Travel' || goalName === 'Education') {
        setGoalName('');
      }
    } else if (cat) {
      if (!goalName || goalName === 'Emergency fund' || goalName === 'A purchase' || goalName === 'Travel' || goalName === 'Education') {
        setGoalName(cat.defaultName);
      }
    }
  };

  const getCurrentDraft = () => ({
    selectedType,
    goalName,
    targetAmount,
    emergencyMode,
    monthlyExpense,
    coverageMonths,
    customMonths,
    customTargetAmount,
    existingSavings,
    durationMonths
  });

  // Calculate target for Emergency Fund
  const getCalculatedEmergencyTarget = () => {
    if (emergencyMode === 'custom') {
      return Number(customTargetAmount) || 0;
    }
    const m = Number(monthlyExpense) || 0;
    const numMonths = coverageMonths === 'custom' ? (Number(customMonths) || 0) : Number(coverageMonths);
    if (m > 0 && numMonths > 0) {
      return m * numMonths;
    }
    return 0;
  };

  const effectiveEmergencyTarget = getCalculatedEmergencyTarget();

  // Selected months count for formula display
  const selectedMonthsCount = coverageMonths === 'custom' ? (Number(customMonths) || 0) : Number(coverageMonths);

  // Validation for Stage 2
  const isStage2EmergencyValid = () => {
    if (emergencyMode === 'custom') {
      const num = Number(customTargetAmount);
      return !isNaN(num) && num > 0;
    }
    const m = Number(monthlyExpense);
    const c = coverageMonths === 'custom' ? Number(customMonths) : Number(coverageMonths);
    return !isNaN(m) && m > 0 && !isNaN(c) && c > 0 && Math.floor(c) === c;
  };

  const isStage2OtherValid = () => {
    const amt = Number(targetAmount);
    return !isNaN(amt) && amt > 0 && (goalName.trim().length > 0);
  };

  const isStage2Valid = selectedType === 'emergency' ? isStage2EmergencyValid() : isStage2OtherValid();

  // Stage 1 Continue handler
  const handleContinueStage1 = () => {
    if (!selectedType) return;
    if (selectedType === 'emergency') {
      if (!goalName) setGoalName('Emergency fund');
    } else if (selectedType === 'custom') {
      if (!goalName) setGoalName('');
    } else {
      if (!goalName) setGoalName(selectedCategoryObj?.defaultName || 'My Goal');
    }
    setStage(2);
  };

  // Stage 2 Continue handler
  const handleContinueStage2 = () => {
    if (!isStage2Valid) return;
    if (selectedType === 'emergency') {
      setTargetAmount(String(effectiveEmergencyTarget));
    }
    setStage(3);
  };

  // Stage 3 Continue handler
  const handleContinueStage3 = () => {
    setStage(4);
  };

  // Final confirmation: create goal with zero payment
  const handleConfirmGoal = () => {
    const finalTarget = selectedType === 'emergency' ? effectiveEmergencyTarget : (Number(targetAmount) || 0);
    const savedAmount = Number(existingSavings) || 0;
    const remainingAmount = Math.max(0, finalTarget - savedAmount);
    const finalDuration = Number(durationMonths) || 6;
    const monthlyPace = Math.round(remainingAmount / (finalDuration || 1));

    const newGoal = {
      id: `goal-${Date.now()}`,
      title: goalName || selectedCategoryObj?.defaultName || 'Emergency fund',
      category: selectedType,
      targetAmount: finalTarget,
      currentAmount: savedAmount,
      durationMonths: finalDuration,
      monthlyContribution: monthlyPace,
      icon: selectedCategoryObj?.icon || './assets/goals/icon_emergency.png',
      createdAt: new Date().toISOString()
    };

    onComplete(newGoal);
  };

  // Stage 1 Helper Text
  const getStage1HelperText = () => {
    if (!selectedType) return 'Next: choose what you’re saving for.';
    return selectedCategoryObj?.nextHelper || 'Next: work out your target.';
  };

  // Estimate Sheet live total calculation
  const estimateTotal = Object.values(estimateDraft).reduce((sum, val) => sum + (Number(val) || 0), 0);

  const handleApplyEstimate = () => {
    setMonthlyExpense(String(estimateTotal));
    setShowEstimateSheet(false);
  };

  // Calculations for Stage 3 & 4
  const currentTargetFinal = selectedType === 'emergency' ? (effectiveEmergencyTarget || Number(targetAmount) || 0) : (Number(targetAmount) || 0);
  const currentSavedNum = Number(existingSavings) || 0;
  const currentNetRemaining = Math.max(0, currentTargetFinal - currentSavedNum);
  const currentDurNum = Number(durationMonths) || 6;
  const calculatedMonthlyPace = Math.round(currentNetRemaining / (currentDurNum || 1));

  // Dynamic Header Title
  const getHeaderTitle = () => {
    if (stage === 1) return 'Create a goal';
    if (stage === 4) return 'Review goal';
    if (selectedType === 'emergency') return 'Emergency fund';
    return goalName || 'Set target';
  };

  return (
    <div className="goal-flow-container">
      {/* Top Header Bar */}
      <div className="goal-flow-header">
        <button 
          className="goals-icon-btn" 
          onClick={() => {
            if (stage > 1) {
              setStage(prev => prev - 1);
            } else {
              onBack(getCurrentDraft());
            }
          }}
          aria-label="Back"
        >
          <ArrowLeft size={22} color="#0f172a" strokeWidth={2.4} />
        </button>

        <h1 className="goal-flow-title">{getHeaderTitle()}</h1>

        <span className="goal-flow-step-badge">{stage} of 4</span>
      </div>

      {/* ====================================================================
          STAGE 1: GOAL TYPE SELECTION
          ==================================================================== */}
      {stage === 1 && (
        <div className="goal-flow-body">
          <div className="goal-flow-content-scroll">
            {/* Headline */}
            <div className="goal-flow-title-block">
              <h2 className="goal-flow-main-heading">What are you saving for?</h2>
              <p className="goal-flow-sub-text">Choose a goal. You can make it your own.</p>
            </div>

            {/* Emergency fund (Top full-width card) */}
            {(() => {
              const emergencyCat = CATEGORIES.find(c => c.id === 'emergency');
              const isSelected = selectedType === 'emergency';
              return (
                <div 
                  className={`goal-card-full ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectCategory('emergency')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="goal-card-icon-wrap">
                    <img 
                      src={emergencyCat.icon} 
                      alt="Emergency Fund Shield" 
                      className="goal-card-img-shield"
                    />
                  </div>

                  <div className="goal-card-text">
                    <h3 className="goal-card-title">{emergencyCat.title}</h3>
                    <p className="goal-card-desc">{emergencyCat.subtitle}</p>
                  </div>

                  {/* Radio Button */}
                  <div className={`goal-radio ${isSelected ? 'selected' : ''}`}>
                    {isSelected && <div className="goal-radio-dot"></div>}
                  </div>
                </div>
              );
            })()}

            {/* 2x2 Category Grid */}
            <div className="goal-grid-2x2">
              {CATEGORIES.filter(c => !c.isFullWidth).map((cat) => {
                const isSelected = selectedType === cat.id;
                return (
                  <div 
                    key={cat.id}
                    className={`goal-grid-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectCategory(cat.id)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Radio Button top-right */}
                    <div className={`goal-radio ${isSelected ? 'selected' : ''}`}>
                      {isSelected && <div className="goal-radio-dot"></div>}
                    </div>

                    {/* 3D Clay Icon */}
                    <div className="goal-grid-icon-wrap">
                      <img 
                        src={cat.icon} 
                        alt={cat.title} 
                        className="goal-grid-img"
                      />
                    </div>

                    {/* Titles */}
                    <h3 className="goal-card-title">{cat.title}</h3>
                    <p className="goal-card-desc">{cat.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Safe Action Area */}
          <div className="goal-flow-sticky-bottom">
            <p className="goal-next-helper">
              {getStage1HelperText()}
            </p>

            <button 
              className={`goals-create-btn ${!selectedType ? 'disabled' : ''}`}
              disabled={!selectedType}
              onClick={handleContinueStage1}
            >
              <span>Continue</span>
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>

            <p className="goal-change-later-text">
              You can change this later.
            </p>
          </div>
        </div>
      )}

      {/* ====================================================================
          STAGE 2: TARGET AMOUNT & COVERAGE
          ==================================================================== */}
      {stage === 2 && (
        <div className="goal-flow-body">
          <div className="goal-flow-content-scroll">
            {selectedType === 'emergency' ? (
              /* ================= EMERGENCY FUND TARGET SCREEN ================= */
              <>
                <div className="goal-flow-title-block">
                  <h2 className="goal-flow-main-heading">Set your safety cushion</h2>
                  <p className="goal-flow-sub-text">
                    Start with your essentials. You can adjust this anytime.
                  </p>
                </div>

                {/* Segmented Mode Switcher */}
                <div className="goal-mode-toggle">
                  <button 
                    type="button"
                    className={`goal-mode-btn ${emergencyMode === 'calculate' ? 'active' : ''}`}
                    onClick={() => setEmergencyMode('calculate')}
                  >
                    Calculate target
                  </button>
                  <button 
                    type="button"
                    className={`goal-mode-btn ${emergencyMode === 'custom' ? 'active' : ''}`}
                    onClick={() => setEmergencyMode('custom')}
                  >
                    Enter my own
                  </button>
                </div>

                {emergencyMode === 'calculate' ? (
                  /* MODE 1: CALCULATE TARGET */
                  <div>
                    {/* Monthly Essential Expenses */}
                    <div className="goal-field-group">
                      <label className="goal-field-label">Monthly essential expenses</label>
                      <div className={`goal-input-box ${monthlyExpense !== '' && (isNaN(Number(monthlyExpense)) || Number(monthlyExpense) <= 0) ? 'has-error' : ''}`}>
                        <span className="goal-input-currency">₹</span>
                        <input 
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="goal-input-field"
                          placeholder="10,000"
                          value={monthlyExpense}
                          onChange={(e) => setMonthlyExpense(e.target.value)}
                        />
                      </div>
                      <p className="goal-field-subtext">
                        Rent, food, bills, transport and other essentials.
                      </p>
                      
                      {monthlyExpense !== '' && (isNaN(Number(monthlyExpense)) || Number(monthlyExpense) <= 0) && (
                        <p className="goal-inline-error">
                          Please enter a valid positive monthly expense amount.
                        </p>
                      )}

                      <div>
                        <button 
                          type="button" 
                          className="goal-help-estimate-btn"
                          onClick={() => {
                            setEstimateDraft({
                              housing: monthlyExpense ? String(Math.round(Number(monthlyExpense) * 0.4)) : '',
                              groceries: monthlyExpense ? String(Math.round(Number(monthlyExpense) * 0.25)) : '',
                              utilities: monthlyExpense ? String(Math.round(Number(monthlyExpense) * 0.15)) : '',
                              transport: monthlyExpense ? String(Math.round(Number(monthlyExpense) * 0.1)) : '',
                              healthcare: '',
                              repayments: '',
                              other: ''
                            });
                            setShowEstimateSheet(true);
                          }}
                        >
                          <span>Help me estimate</span>
                          <ArrowRight size={14} strokeWidth={2.4} />
                        </button>
                      </div>
                    </div>

                    {/* Months to cover */}
                    <div className="goal-field-group" style={{ marginTop: '20px' }}>
                      <label className="goal-field-label">Months to cover</label>
                      <div className="goal-months-grid">
                        {[
                          { label: '1 month', val: '1' },
                          { label: '3 months', val: '3' },
                          { label: '6 months', val: '6' },
                          { label: 'Custom', val: 'custom' },
                        ].map((m) => (
                          <button
                            key={m.val}
                            type="button"
                            className={`goal-month-btn ${coverageMonths === m.val ? 'active' : ''}`}
                            onClick={() => setCoverageMonths(m.val)}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom Months Input */}
                      {coverageMonths === 'custom' && (
                        <div className="goal-custom-months-wrap">
                          <label className="goal-custom-months-label">Number of months:</label>
                          <input 
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="60"
                            className="goal-custom-months-input"
                            value={customMonths}
                            onChange={(e) => setCustomMonths(e.target.value)}
                            placeholder="4"
                          />
                          <span style={{ fontSize: '13px', color: '#64748b' }}>months</span>
                        </div>
                      )}

                      {coverageMonths === 'custom' && (isNaN(Number(customMonths)) || Number(customMonths) <= 0 || !Number.isInteger(Number(customMonths))) && (
                        <p className="goal-inline-error">
                          Please enter a positive whole number of months (e.g. 4, 9, 12).
                        </p>
                      )}
                    </div>

                    {/* Target Summary Card */}
                    <div className="goal-target-card-emergency">
                      <div className="target-card-left">
                        <div className="target-card-label">Your emergency fund target</div>
                        <div className="target-card-amount">
                          {effectiveEmergencyTarget > 0 
                            ? `₹${effectiveEmergencyTarget.toLocaleString('en-IN')}` 
                            : '₹ 0'}
                        </div>
                        <div className="target-card-formula">
                          {monthlyExpense && Number(monthlyExpense) > 0 && selectedMonthsCount > 0
                            ? `₹${Number(monthlyExpense).toLocaleString('en-IN')} × ${selectedMonthsCount} ${selectedMonthsCount === 1 ? 'month' : 'months'}`
                            : 'Enter monthly essentials to calculate'}
                        </div>
                      </div>

                      <img 
                        src="./assets/goals/icon_emergency.png" 
                        alt="Emergency Shield" 
                        className="target-card-shield-img"
                      />
                    </div>

                    {/* Switch Mode Link */}
                    <div className="goal-switch-mode-link">
                      <span>Prefer to start smaller? </span>
                      <button 
                        type="button"
                        onClick={() => {
                          if (effectiveEmergencyTarget > 0 && !customTargetAmount) {
                            setCustomTargetAmount(String(effectiveEmergencyTarget));
                          }
                          setEmergencyMode('custom');
                        }}
                      >
                        Enter your own target.
                      </button>
                    </div>

                    {/* Already have savings info card */}
                    <div className="goal-already-savings-card">
                      <div className="savings-info-icon-wrap">
                        <Info size={18} strokeWidth={2.4} />
                      </div>
                      <div>
                        <div className="savings-info-title">Already have savings?</div>
                        <div className="savings-info-desc">Add them in the next step.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MODE 2: ENTER MY OWN TARGET */
                  <div>
                    <div className="goal-field-group">
                      <label className="goal-field-label">Custom emergency target amount</label>
                      <div className={`goal-input-box ${customTargetAmount !== '' && (isNaN(Number(customTargetAmount)) || Number(customTargetAmount) <= 0) ? 'has-error' : ''}`}>
                        <span className="goal-input-currency">₹</span>
                        <input 
                          type="number"
                          inputMode="numeric"
                          className="goal-input-field"
                          placeholder="30,000"
                          value={customTargetAmount}
                          onChange={(e) => setCustomTargetAmount(e.target.value)}
                        />
                      </div>
                      <p className="goal-field-subtext">
                        Set any target cushion amount you feel comfortable starting with.
                      </p>

                      {customTargetAmount !== '' && (isNaN(Number(customTargetAmount)) || Number(customTargetAmount) <= 0) && (
                        <p className="goal-inline-error">
                          Please enter a valid positive target amount greater than ₹0.
                        </p>
                      )}
                    </div>

                    {/* Target Summary Card */}
                    <div className="goal-target-card-emergency">
                      <div className="target-card-left">
                        <div className="target-card-label">Your emergency fund target</div>
                        <div className="target-card-amount">
                          {Number(customTargetAmount) > 0 
                            ? `₹${Number(customTargetAmount).toLocaleString('en-IN')}` 
                            : '₹ 0'}
                        </div>
                        <div className="target-card-formula">
                          Custom safety buffer
                        </div>
                      </div>

                      <img 
                        src="./assets/goals/icon_emergency.png" 
                        alt="Emergency Shield" 
                        className="target-card-shield-img"
                      />
                    </div>

                    {/* Switch back Link */}
                    <div className="goal-switch-mode-link">
                      <span>Want to work it out from your expenses? </span>
                      <button 
                        type="button"
                        onClick={() => setEmergencyMode('calculate')}
                      >
                        Calculate target.
                      </button>
                    </div>

                    {/* Already have savings info card */}
                    <div className="goal-already-savings-card">
                      <div className="savings-info-icon-wrap">
                        <Info size={18} strokeWidth={2.4} />
                      </div>
                      <div>
                        <div className="savings-info-title">Already have savings?</div>
                        <div className="savings-info-desc">Add them in the next step.</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ================= PURCHASE / TRAVEL / EDUCATION / CUSTOM ================= */
              <div className="goal-form-card">
                <div className="goal-flow-title-block">
                  <h2 className="goal-flow-main-heading">Set your target amount</h2>
                  <p className="goal-flow-sub-text">
                    Define a realistic target you can work toward.
                  </p>
                </div>

                <label className="goal-form-label">Goal name</label>
                <input 
                  type="text"
                  className="goal-form-input"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. New iPhone 16, Japan Trip, Coding Bootcamp"
                />

                <label className="goal-form-label" style={{ marginTop: '18px' }}>
                  Target amount (₹)
                </label>
                <div className="goal-amount-input-wrap">
                  <span className="goal-currency-symbol">₹</span>
                  <input 
                    type="number"
                    inputMode="numeric"
                    className="goal-amount-input"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="50,000"
                  />
                </div>

                {targetAmount !== '' && (isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) && (
                  <p className="goal-inline-error">
                    Please enter a valid positive target amount.
                  </p>
                )}

                <div className="goal-quick-chips">
                  {['25000', '50000', '100000', '250000'].map((amt) => (
                    <button 
                      key={amt}
                      type="button"
                      className={`goal-chip ${targetAmount === amt ? 'active' : ''}`}
                      onClick={() => setTargetAmount(amt)}
                    >
                      ₹{(Number(amt) / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Safe Area */}
          <div className="goal-flow-sticky-bottom">
            <button 
              className={`goals-create-btn ${!isStage2Valid ? 'disabled' : ''}`}
              disabled={!isStage2Valid}
              onClick={handleContinueStage2}
            >
              <span>Continue</span>
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>

            <p className="goal-change-later-text">
              Next: choose your saving pace.
            </p>
          </div>
        </div>
      )}

      {/* ====================================================================
          STAGE 3: TIMELINE, EXISTING SAVINGS & SAVING PACE
          ==================================================================== */}
      {stage === 3 && (
        <div className="goal-flow-body">
          <div className="goal-flow-content-scroll">
            <div className="goal-flow-title-block">
              <h2 className="goal-flow-main-heading">Choose your saving pace</h2>
              <p className="goal-flow-sub-text">
                How quickly would you like to build your ₹{currentTargetFinal.toLocaleString('en-IN')} cushion?
              </p>
            </div>

            <div className="goal-form-card">
              {/* Optional Existing Savings Field */}
              <label className="goal-form-label">
                Already have savings for this? (Optional)
              </label>
              <div className="goal-amount-input-wrap">
                <span className="goal-currency-symbol">₹</span>
                <input 
                  type="number"
                  inputMode="numeric"
                  className="goal-amount-input"
                  style={{ fontSize: '20px', height: '48px' }}
                  value={existingSavings}
                  onChange={(e) => setExistingSavings(e.target.value)}
                  placeholder="0"
                />
              </div>
              <p className="goal-field-subtext" style={{ margin: '4px 0 16px 0' }}>
                Any money you have already earmarked will be credited toward this goal.
              </p>

              {/* Timeline selector */}
              <label className="goal-form-label">Timeline duration</label>
              <div className="goal-duration-grid">
                {[
                  { label: '3 months', val: '3' },
                  { label: '6 months', val: '6' },
                  { label: '12 months', val: '12' },
                  { label: '24 months', val: '24' },
                ].map((dur) => (
                  <button 
                    key={dur.val}
                    type="button"
                    className={`goal-duration-btn ${durationMonths === dur.val ? 'active' : ''}`}
                    onClick={() => setDurationMonths(dur.val)}
                  >
                    <div className="dur-label">{dur.label}</div>
                  </button>
                ))}
              </div>

              {/* Monthly Contribution Calculation */}
              <div className="goal-pace-callout" style={{ marginTop: '20px' }}>
                <div className="pace-label">Recommended Monthly Pace</div>
                <div className="pace-amount">₹{calculatedMonthlyPace.toLocaleString('en-IN')}/month</div>
                <div className="pace-sub">
                  {currentSavedNum > 0 ? (
                    <>
                      With ₹{currentSavedNum.toLocaleString('en-IN')} already saved, putting away ₹{calculatedMonthlyPace.toLocaleString('en-IN')} each month reaches your remaining ₹{currentNetRemaining.toLocaleString('en-IN')} target in {durationMonths} months.
                    </>
                  ) : (
                    <>
                      Putting away ₹{calculatedMonthlyPace.toLocaleString('en-IN')} every month reaches your ₹{currentTargetFinal.toLocaleString('en-IN')} goal in {durationMonths} months.
                    </>
                  )}
                </div>
              </div>

              {/* Zero money moved guarantee */}
              <div className="goals-zero-payment-badge" style={{ marginTop: '16px' }}>
                <Info size={15} color="#64748b" />
                <span>Creating this goal does not move or debit any money.</span>
              </div>
            </div>
          </div>

          <div className="goal-flow-sticky-bottom">
            <p className="goal-next-helper">
              Next: review your plan details.
            </p>

            <button 
              className="goals-create-btn"
              onClick={handleContinueStage3}
            >
              <span>Continue</span>
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>

            <p className="goal-change-later-text">
              You can change this later.
            </p>
          </div>
        </div>
      )}

      {/* ====================================================================
          STAGE 4: REVIEW GOAL (Exact match to design)
          ==================================================================== */}
      {stage === 4 && (
        <div className="goal-flow-body">
          <div className="goal-flow-content-scroll">
            {/* Headline */}
            <div className="goal-flow-title-block">
              <h2 className="goal-flow-main-heading">Ready to start saving?</h2>
              <p className="goal-flow-sub-text">
                Here’s your {selectedType === 'emergency' ? 'emergency fund' : (goalName || 'goal')} plan.
              </p>
            </div>

            {/* Top Target Hero Card */}
            <div className="goal-review-hero-card">
              <div className="goal-review-hero-left">
                <div className="goal-review-cat-title">
                  {selectedType === 'emergency' ? 'Emergency fund' : (goalName || selectedCategoryObj?.title)}
                </div>
                <div className="goal-review-hero-amount">
                  ₹{currentTargetFinal > 0 ? currentTargetFinal.toLocaleString('en-IN') : '30,000'}
                </div>
                <div className="goal-review-hero-sub">
                  {selectedType === 'emergency' 
                    ? `Covers ${selectedMonthsCount > 0 ? selectedMonthsCount : 3} months of essentials.`
                    : `Target for ${goalName || selectedCategoryObj?.title}`}
                </div>
                <button 
                  type="button"
                  className="goal-review-edit-link"
                  onClick={() => setStage(2)}
                >
                  Edit target
                </button>
              </div>

              <img 
                src={selectedCategoryObj?.icon || './assets/goals/icon_emergency.png'} 
                alt="Goal Shield"
                className="goal-review-hero-img"
              />
            </div>

            {/* "Your plan" Section */}
            <div className="goal-review-plan-section">
              <div className="goal-review-plan-header">
                <h3 className="goal-review-plan-heading">Your plan</h3>
                <button 
                  type="button" 
                  className="goal-review-edit-plan-btn"
                  onClick={() => setStage(3)}
                >
                  Edit
                </button>
              </div>

              <div className="goal-review-plan-list">
                <div className="goal-review-plan-row">
                  <span className="plan-row-label">Already saved</span>
                  <span className="plan-row-value">₹{currentSavedNum.toLocaleString('en-IN')}</span>
                </div>

                <div className="goal-review-plan-row">
                  <span className="plan-row-label">Save each month</span>
                  <span className="plan-row-value">₹{calculatedMonthlyPace > 0 ? calculatedMonthlyPace.toLocaleString('en-IN') : '2,500'}</span>
                </div>

                <div className="goal-review-plan-row">
                  <span className="plan-row-label">Estimated time</span>
                  <span className="plan-row-value">{durationMonths} months</span>
                </div>

                <div className="goal-review-plan-row">
                  <span className="plan-row-label">Deadline</span>
                  <span className="plan-row-value">None</span>
                </div>
              </div>

              {/* Reminders Row Card */}
              <div 
                className="goal-review-reminders-card"
                onClick={() => setRemindersEnabled(prev => !prev)}
                role="button"
                tabIndex={0}
              >
                <div className="reminders-card-left">
                  <Bell size={18} strokeWidth={2} color="#0f172a" />
                  <span className="reminders-card-label">Reminders</span>
                </div>

                <div className="reminders-card-right">
                  <span className="reminders-card-val">{remindersEnabled ? 'Monthly (1st)' : 'Off'}</span>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
              </div>

              <p className="goal-review-adjust-note">
                You can adjust your plan anytime.
              </p>
            </div>
          </div>

          {/* Sticky Bottom Safe Action Area */}
          <div className="goal-flow-sticky-bottom">
            <p className="goal-review-disclaimer-text">
              No money moves until you add it.
            </p>

            <button 
              className="goals-create-btn"
              onClick={handleConfirmGoal}
            >
              <span>Create goal</span>
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          HELP ME ESTIMATE BOTTOM SHEET
          ==================================================================== */}
      {showEstimateSheet && (
        <div className="estimate-sheet-backdrop" onClick={() => setShowEstimateSheet(false)}>
          <div className="estimate-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="estimate-sheet-handle"></div>
            
            <div className="estimate-sheet-header">
              <h3 className="estimate-sheet-title">Help me estimate</h3>
              <button 
                type="button" 
                className="estimate-sheet-close-btn"
                onClick={() => setShowEstimateSheet(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="estimate-sheet-body">
              <p className="estimate-sheet-intro">
                Enter your typical monthly expenses across essential categories to work out your baseline:
              </p>

              {ESTIMATE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="estimate-category-row">
                  <div className="estimate-cat-info">
                    <div className="estimate-cat-title">{cat.label}</div>
                    <div className="estimate-cat-sub">{cat.sub}</div>
                  </div>

                  <div className="estimate-cat-input-wrap">
                    <span className="estimate-cat-sym">₹</span>
                    <input 
                      type="number"
                      inputMode="numeric"
                      className="estimate-cat-input"
                      placeholder="0"
                      value={estimateDraft[cat.id]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEstimateDraft(prev => ({ ...prev, [cat.id]: val }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="estimate-sheet-footer">
              <div className="estimate-total-bar">
                <span className="estimate-total-label">Total Monthly Essentials:</span>
                <span className="estimate-total-val">₹{estimateTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="estimate-actions-row">
                <button 
                  type="button"
                  className="estimate-btn-cancel"
                  onClick={() => setShowEstimateSheet(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="estimate-btn-use"
                  onClick={handleApplyEstimate}
                >
                  Use this total
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

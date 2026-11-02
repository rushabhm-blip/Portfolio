import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MoreHorizontal, Check, Plus, Edit2, Bell, ChevronRight, 
  ArrowRight, X, AlertCircle, Shield, CheckCircle2, PauseCircle, PlayCircle, Trash2
} from 'lucide-react';

export default function GoalDashboard({
  goal,
  onBack,
  onViewAllGoals,
  onUpdateGoal,
  onDeleteGoal,
  isJustCreated = false
}) {
  // Goal state
  const [currentGoal, setCurrentGoal] = useState(goal);
  const [showCreatedBanner, setShowCreatedBanner] = useState(isJustCreated);
  const [progressBarAnimated, setProgressBarAnimated] = useState(false);

  // Modals & Bottom Sheets
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showEditTargetModal, setShowEditTargetModal] = useState(false);

  // Add Money Form States
  const [addAmount, setAddAmount] = useState('');
  const [fundingSource, setFundingSource] = useState('upi'); // 'upi' | 'bank' | 'gullak'
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'failed'
  const [addMoneyError, setAddMoneyError] = useState('');

  // Edit Plan Form States
  const [editMonthlySaving, setEditMonthlySaving] = useState(String(goal?.monthlyContribution || 2500));
  const [editDurationMonths, setEditDurationMonths] = useState(String(goal?.durationMonths || 12));

  // Edit Target Form State
  const [editTargetAmount, setEditTargetAmount] = useState(String(goal?.targetAmount || 30000));

  // Rename Form State
  const [renameValue, setRenameValue] = useState(goal?.title || 'Emergency fund');

  // Reminders Form State
  const [remindersStatus, setRemindersStatus] = useState(goal?.reminders || 'Off');
  const [reminderDay, setReminderDay] = useState('1st');

  // Sync state if prop changes
  useEffect(() => {
    setCurrentGoal(goal);
    setEditMonthlySaving(String(goal?.monthlyContribution || 2500));
    setEditDurationMonths(String(goal?.durationMonths || 12));
    setEditTargetAmount(String(goal?.targetAmount || 30000));
    setRenameValue(goal?.title || 'Emergency fund');
    setRemindersStatus(goal?.reminders || 'Off');
  }, [goal]);

  // Initial progress bar animation trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressBarAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Dismiss "Goal created" banner automatically after 6 seconds
  useEffect(() => {
    if (showCreatedBanner) {
      const timer = setTimeout(() => {
        setShowCreatedBanner(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showCreatedBanner]);

  const targetAmt = Number(currentGoal?.targetAmount) || 30000;
  const savedAmt = Number(currentGoal?.currentAmount) || 0;
  const remainingAmt = Math.max(0, targetAmt - savedAmt);
  const percentComplete = targetAmt > 0 ? Math.min(100, Math.round((savedAmt / targetAmt) * 100)) : 0;
  const contributions = currentGoal?.contributions || [];

  // Handler: Confirm Funding
  const handleConfirmPayment = (simulateFailure = false) => {
    const numAmt = Number(addAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setAddMoneyError('Please enter a valid amount greater than ₹0.');
      return;
    }
    setAddMoneyError('');
    setPaymentStatus('processing');

    setTimeout(() => {
      if (simulateFailure) {
        setPaymentStatus('failed');
        setAddMoneyError('Payment was declined or cancelled. Progress unchanged.');
        return;
      }

      // Successful funding
      const newSaved = savedAmt + numAmt;
      const sourceLabel = 
        fundingSource === 'upi' ? 'UPI (Google Pay)' :
        fundingSource === 'bank' ? 'HDFC Bank •••• 4821' : 'Munshiji Gullak';

      const newContribution = {
        id: `txn-${Date.now()}`,
        amount: numAmt,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        source: sourceLabel,
        status: 'Completed'
      };

      const updated = {
        ...currentGoal,
        currentAmount: newSaved,
        contributions: [newContribution, ...contributions]
      };

      setCurrentGoal(updated);
      if (onUpdateGoal) onUpdateGoal(updated);

      setPaymentStatus('success');
      setTimeout(() => {
        setShowAddMoneyModal(false);
        setPaymentStatus('idle');
        setAddAmount('');
      }, 1000);
    }, 700);
  };

  // Handler: Save Edited Plan
  const handleSavePlan = () => {
    const newMonthly = Number(editMonthlySaving) || currentGoal.monthlyContribution;
    const newDur = Number(editDurationMonths) || currentGoal.durationMonths;
    const updated = {
      ...currentGoal,
      monthlyContribution: newMonthly,
      durationMonths: newDur
    };
    setCurrentGoal(updated);
    if (onUpdateGoal) onUpdateGoal(updated);
    setShowEditPlanModal(false);
  };

  // Handler: Save Reminders
  const handleSaveReminders = () => {
    const updated = {
      ...currentGoal,
      reminders: remindersStatus === 'Off' ? 'Off' : `Monthly (${reminderDay})`
    };
    setCurrentGoal(updated);
    if (onUpdateGoal) onUpdateGoal(updated);
    setShowRemindersModal(false);
  };

  // Handler: Save Rename
  const handleSaveRename = () => {
    if (!renameValue.trim()) return;
    const updated = {
      ...currentGoal,
      title: renameValue.trim()
    };
    setCurrentGoal(updated);
    if (onUpdateGoal) onUpdateGoal(updated);
    setShowRenameModal(false);
  };

  // Handler: Save Target
  const handleSaveTarget = () => {
    const newTgt = Number(editTargetAmount);
    if (isNaN(newTgt) || newTgt <= 0) return;
    const updated = {
      ...currentGoal,
      targetAmount: newTgt
    };
    setCurrentGoal(updated);
    if (onUpdateGoal) onUpdateGoal(updated);
    setShowEditTargetModal(false);
  };

  // Handler: Toggle Pause/Resume Plan
  const handleTogglePause = () => {
    const newStatus = currentGoal.status === 'Paused' ? 'Active' : 'Paused';
    const updated = {
      ...currentGoal,
      status: newStatus
    };
    setCurrentGoal(updated);
    if (onUpdateGoal) onUpdateGoal(updated);
    setShowMenuModal(false);
  };

  return (
    <div className="goal-dashboard-container">
      {/* Top Navigation Bar */}
      <div className="goal-dashboard-header">
        <button 
          className="goals-icon-btn" 
          onClick={onBack || onViewAllGoals}
          aria-label="Back to goals"
        >
          <ArrowLeft size={22} color="#0f172a" strokeWidth={2.4} />
        </button>

        <h1 className="goal-dashboard-title">{currentGoal?.title || 'Emergency fund'}</h1>

        <button 
          className="goals-icon-btn" 
          onClick={() => setShowMenuModal(true)}
          aria-label="Goal options"
        >
          <MoreHorizontal size={22} color="#0f172a" strokeWidth={2.4} />
        </button>
      </div>

      {/* Scrollable Dashboard Body */}
      <div className="goal-dashboard-scroll">
        {/* "Goal created" Success Banner (only immediately after creation) */}
        {showCreatedBanner && (
          <div className="goal-created-banner">
            <div className="goal-created-badge">
              <Check size={12} color="#ffffff" strokeWidth={3} />
            </div>
            <span className="goal-created-text">Goal created</span>
            <button 
              className="goal-created-close" 
              onClick={() => setShowCreatedBanner(false)}
              aria-label="Dismiss banner"
            >
              <X size={14} color="#7c3aed" />
            </button>
          </div>
        )}

        {/* Hero Progress Card */}
        <div className="goal-hero-card">
          <div className="goal-hero-left">
            <span className="goal-hero-sublabel">Saved so far</span>
            <div className="goal-hero-saved-amount">
              ₹{savedAmt.toLocaleString('en-IN')}
            </div>
            <span className="goal-hero-target-label">
              of ₹{targetAmt.toLocaleString('en-IN')}
            </span>

            {/* Progress Bar (Strictly 0% when savedAmt is 0) */}
            <div className="goal-progress-track">
              <div 
                className="goal-progress-fill" 
                style={{ 
                  width: progressBarAnimated && savedAmt > 0 ? `${percentComplete}%` : '0%' 
                }}
              />
            </div>

            {/* Progress Metrics */}
            <div className="goal-progress-metrics">
              <span>{percentComplete}% complete</span>
              <span>₹{remainingAmt.toLocaleString('en-IN')} to go</span>
            </div>
          </div>

          <div className="goal-hero-shield-wrap">
            <img 
              src={currentGoal?.icon || './assets/goals/icon_emergency.png'} 
              alt="Emergency Shield" 
              className="goal-hero-shield-img"
            />
          </div>
        </div>

        {/* Primary CTA: + Add Money */}
        <button 
          className="goal-add-money-btn"
          onClick={() => {
            setAddAmount('');
            setPaymentStatus('idle');
            setAddMoneyError('');
            setShowAddMoneyModal(true);
          }}
        >
          <Plus size={18} strokeWidth={2.6} />
          <span>Add money</span>
        </button>

        {/* Your Saving Plan Section */}
        <div className="goal-saving-plan-card">
          <div className="saving-plan-header">
            <h2 className="saving-plan-title">Your saving plan</h2>
            <button 
              className="saving-plan-edit-btn"
              onClick={() => setShowEditPlanModal(true)}
            >
              Edit
            </button>
          </div>

          <div className="saving-plan-grid">
            <div className="saving-plan-col">
              <span className="plan-col-label">Monthly saving</span>
              <span className="plan-col-val">
                ₹{(currentGoal?.monthlyContribution || 2500).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="saving-plan-col divider">
              <span className="plan-col-label">Estimated time</span>
              <span className="plan-col-val">
                {currentGoal?.durationMonths || 12} months
              </span>
            </div>
          </div>
        </div>

        {/* Reminders Row */}
        <div 
          className="goal-reminders-row"
          onClick={() => setShowRemindersModal(true)}
          role="button"
          tabIndex={0}
        >
          <div className="reminders-left">
            <Bell size={18} strokeWidth={2} color="#0f172a" />
            <span className="reminders-label">Reminders</span>
          </div>

          <div className="reminders-right">
            <span className="reminders-val">{remindersStatus}</span>
            <ChevronRight size={16} color="#94a3b8" />
          </div>
        </div>

        {/* Activity Section */}
        <div className="goal-activity-section">
          <h2 className="activity-title">Activity</h2>

          {contributions.length === 0 ? (
            /* Empty Activity State matching design */
            <div className="activity-empty-state">
              {/* Clean stacked coins outline SVG with rays */}
              <div className="activity-coins-svg-wrap">
                <svg width="68" height="52" viewBox="0 0 68 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Top rays */}
                  <path d="M34 4V8" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M22 8L25 11" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M46 8L43 11" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                  {/* Coin 1 (Top right) */}
                  <ellipse cx="44" cy="23" rx="16" ry="7" stroke="#94A3B8" strokeWidth="2" fill="#FFFFFF"/>
                  <path d="M28 23V27C28 30.8 35.2 34 44 34C52.8 34 60 30.8 60 27V23" stroke="#94A3B8" strokeWidth="2"/>
                  {/* Coin 2 (Bottom left) */}
                  <ellipse cx="24" cy="33" rx="16" ry="7" stroke="#94A3B8" strokeWidth="2" fill="#FFFFFF"/>
                  <path d="M8 33V37C8 40.8 15.2 44 24 44C32.8 44 40 40.8 40 37V33" stroke="#94A3B8" strokeWidth="2"/>
                </svg>
              </div>

              <h3 className="activity-empty-heading">Your first contribution starts here.</h3>
              <p className="activity-empty-sub">Add money to begin your progress.</p>
            </div>
          ) : (
            /* Real Contribution History */
            <div className="activity-list">
              {contributions.map((item) => (
                <div key={item.id} className="activity-item-card">
                  <div className="activity-item-left">
                    <div className="activity-item-icon">
                      <Plus size={14} color="#16a34a" strokeWidth={3} />
                    </div>
                    <div>
                      <div className="activity-item-source">{item.source}</div>
                      <div className="activity-item-date">{item.date}</div>
                    </div>
                  </div>
                  <div className="activity-item-right">
                    <span className="activity-item-amount">+₹{item.amount.toLocaleString('en-IN')}</span>
                    <span className="activity-item-status">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View all goals link */}
        <div style={{ textAlign: 'center', margin: '24px 0 32px 0' }}>
          <button 
            type="button"
            className="view-all-goals-link"
            onClick={onViewAllGoals}
          >
            <span>View all goals</span>
            <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* ====================================================================
          MODAL 1: ADD MONEY (Amount & Funding Source)
          ==================================================================== */}
      {showAddMoneyModal && (
        <div className="goal-modal-backdrop" onClick={() => setShowAddMoneyModal(false)}>
          <div className="goal-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-handle"></div>
            
            <div className="goal-modal-header">
              <h3 className="goal-modal-title">Add money to goal</h3>
              <button className="goal-modal-close" onClick={() => setShowAddMoneyModal(false)}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="goal-modal-body">
              <label className="goal-field-label">Amount (₹)</label>
              <div className="goal-input-box" style={{ marginBottom: '8px' }}>
                <span className="goal-input-currency">₹</span>
                <input 
                  type="number"
                  inputMode="numeric"
                  className="goal-input-field"
                  placeholder="2,500"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                />
              </div>

              {/* Quick Chips */}
              <div className="goal-quick-chips" style={{ marginBottom: '16px' }}>
                {['500', '1000', '2500', '5000'].map((amt) => (
                  <button 
                    key={amt}
                    type="button"
                    className={`goal-chip ${addAmount === amt ? 'active' : ''}`}
                    onClick={() => setAddAmount(amt)}
                  >
                    +₹{Number(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Funding Source Selector */}
              <label className="goal-field-label" style={{ marginTop: '12px' }}>Choose funding source</label>
              <div className="funding-source-list">
                {[
                  { id: 'upi', title: 'UPI (GPay / PhonePe)', sub: 'Fast & instant debit' },
                  { id: 'bank', title: 'HDFC Bank Account', sub: '•••• 4821 (Linked bank)' },
                  { id: 'gullak', title: 'Munshiji Gullak Balance', sub: '₹928 available in savings' }
                ].map((src) => (
                  <div 
                    key={src.id}
                    className={`funding-source-item ${fundingSource === src.id ? 'selected' : ''}`}
                    onClick={() => setFundingSource(src.id)}
                  >
                    <div className="funding-radio">
                      {fundingSource === src.id && <div className="funding-radio-dot" />}
                    </div>
                    <div>
                      <div className="funding-title">{src.title}</div>
                      <div className="funding-sub">{src.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Error display */}
              {addMoneyError && (
                <div className="goal-inline-error" style={{ marginTop: '10px' }}>
                  <AlertCircle size={14} />
                  <span>{addMoneyError}</span>
                </div>
              )}

              {/* Payment Status State */}
              {paymentStatus === 'success' && (
                <div className="payment-success-badge">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Contribution confirmed! Adding to goal...</span>
                </div>
              )}
            </div>

            <div className="goal-modal-footer">
              <button 
                type="button"
                className="goal-modal-action-btn primary"
                disabled={paymentStatus === 'processing'}
                onClick={() => handleConfirmPayment(false)}
              >
                {paymentStatus === 'processing' ? 'Processing...' : 'Confirm contribution'}
              </button>

              {/* Simulator link to demonstrate that failed payments do not increase progress */}
              <button 
                type="button"
                className="simulate-failed-link"
                onClick={() => handleConfirmPayment(true)}
              >
                Simulate failed payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: EDIT SAVING PLAN
          ==================================================================== */}
      {showEditPlanModal && (
        <div className="goal-modal-backdrop" onClick={() => setShowEditPlanModal(false)}>
          <div className="goal-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-handle"></div>
            
            <div className="goal-modal-header">
              <h3 className="goal-modal-title">Edit saving plan</h3>
              <button className="goal-modal-close" onClick={() => setShowEditPlanModal(false)}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="goal-modal-body">
              <label className="goal-field-label">Monthly saving (₹)</label>
              <div className="goal-input-box" style={{ marginBottom: '16px' }}>
                <span className="goal-input-currency">₹</span>
                <input 
                  type="number"
                  inputMode="numeric"
                  className="goal-input-field"
                  value={editMonthlySaving}
                  onChange={(e) => setEditMonthlySaving(e.target.value)}
                />
              </div>

              <label className="goal-field-label">Timeline duration</label>
              <div className="goal-duration-grid" style={{ marginBottom: '16px' }}>
                {[
                  { label: '3 months', val: '3' },
                  { label: '6 months', val: '6' },
                  { label: '12 months', val: '12' },
                  { label: '24 months', val: '24' }
                ].map((d) => (
                  <button 
                    key={d.val}
                    type="button"
                    className={`goal-duration-btn ${editDurationMonths === d.val ? 'active' : ''}`}
                    onClick={() => setEditDurationMonths(d.val)}
                  >
                    <div className="dur-label">{d.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="goal-modal-footer">
              <button 
                type="button"
                className="goal-modal-action-btn primary"
                onClick={handleSavePlan}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: REMINDERS SETTINGS
          ==================================================================== */}
      {showRemindersModal && (
        <div className="goal-modal-backdrop" onClick={() => setShowRemindersModal(false)}>
          <div className="goal-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-handle"></div>
            
            <div className="goal-modal-header">
              <h3 className="goal-modal-title">Reminder settings</h3>
              <button className="goal-modal-close" onClick={() => setShowRemindersModal(false)}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="goal-modal-body">
              <label className="goal-field-label">Status</label>
              <div className="goal-mode-toggle" style={{ marginBottom: '16px' }}>
                <button 
                  type="button"
                  className={`goal-mode-btn ${remindersStatus !== 'Off' ? 'active' : ''}`}
                  onClick={() => setRemindersStatus('On')}
                >
                  Enabled
                </button>
                <button 
                  type="button"
                  className={`goal-mode-btn ${remindersStatus === 'Off' ? 'active' : ''}`}
                  onClick={() => setRemindersStatus('Off')}
                >
                  Off
                </button>
              </div>

              {remindersStatus !== 'Off' && (
                <>
                  <label className="goal-field-label">Reminder day of month</label>
                  <div className="goal-months-grid" style={{ marginBottom: '16px' }}>
                    {['1st', '5th', '10th', '15th'].map((day) => (
                      <button 
                        key={day}
                        type="button"
                        className={`goal-month-btn ${reminderDay === day ? 'active' : ''}`}
                        onClick={() => setReminderDay(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="goal-modal-footer">
              <button 
                type="button"
                className="goal-modal-action-btn primary"
                onClick={handleSaveReminders}
              >
                Save reminder setting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: OPTIONS MENU (•••)
          ==================================================================== */}
      {showMenuModal && (
        <div className="goal-modal-backdrop" onClick={() => setShowMenuModal(false)}>
          <div className="goal-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-handle"></div>
            
            <div className="goal-modal-header">
              <h3 className="goal-modal-title">Goal options</h3>
              <button className="goal-modal-close" onClick={() => setShowMenuModal(false)}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="goal-menu-list">
              <button 
                className="goal-menu-item"
                onClick={() => {
                  setShowMenuModal(false);
                  setShowRenameModal(true);
                }}
              >
                <Edit2 size={18} color="#0f172a" />
                <span>Rename goal</span>
              </button>

              <button 
                className="goal-menu-item"
                onClick={() => {
                  setShowMenuModal(false);
                  setShowEditTargetModal(true);
                }}
              >
                <Shield size={18} color="#0f172a" />
                <span>Edit target amount</span>
              </button>

              <button 
                className="goal-menu-item"
                onClick={handleTogglePause}
              >
                {currentGoal.status === 'Paused' ? (
                  <>
                    <PlayCircle size={18} color="#16a34a" />
                    <span>Resume saving plan</span>
                  </>
                ) : (
                  <>
                    <PauseCircle size={18} color="#f59e0b" />
                    <span>Pause saving plan</span>
                  </>
                )}
              </button>

              {onDeleteGoal && (
                <button 
                  className="goal-menu-item danger"
                  onClick={() => {
                    setShowMenuModal(false);
                    onDeleteGoal(currentGoal.id);
                  }}
                >
                  <Trash2 size={18} color="#ef4444" />
                  <span>Delete goal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 5: RENAME GOAL
          ==================================================================== */}
      {showRenameModal && (
        <div className="goal-modal-backdrop" onClick={() => setShowRenameModal(false)}>
          <div className="goal-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-handle"></div>
            
            <div className="goal-modal-header">
              <h3 className="goal-modal-title">Rename goal</h3>
              <button className="goal-modal-close" onClick={() => setShowRenameModal(false)}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="goal-modal-body">
              <label className="goal-field-label">Goal name</label>
              <input 
                type="text"
                className="goal-form-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
              />
            </div>

            <div className="goal-modal-footer">
              <button 
                type="button"
                className="goal-modal-action-btn primary"
                onClick={handleSaveRename}
              >
                Save name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 6: EDIT TARGET AMOUNT
          ==================================================================== */}
      {showEditTargetModal && (
        <div className="goal-modal-backdrop" onClick={() => setShowEditTargetModal(false)}>
          <div className="goal-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-handle"></div>
            
            <div className="goal-modal-header">
              <h3 className="goal-modal-title">Edit target amount</h3>
              <button className="goal-modal-close" onClick={() => setShowEditTargetModal(false)}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="goal-modal-body">
              <label className="goal-field-label">Target amount (₹)</label>
              <div className="goal-input-box">
                <span className="goal-input-currency">₹</span>
                <input 
                  type="number"
                  inputMode="numeric"
                  className="goal-input-field"
                  value={editTargetAmount}
                  onChange={(e) => setEditTargetAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="goal-modal-footer">
              <button 
                type="button"
                className="goal-modal-action-btn primary"
                onClick={handleSaveTarget}
              >
                Save target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, HelpCircle, Flame, CheckCircle, Delete, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import SavingsSuccessScreen from './SavingsSuccessScreen';

const TOTAL_FRAMES = 12;
const FPS = 8;
const FRAME_DURATION = 1000 / FPS; // 125ms per frame

const PAYMENT_METHODS = [
  { id: 'gpay', name: 'Google Pay', icon: './assets/payment_gpay.png' },
  { id: 'phonepe', name: 'PhonePe', icon: './assets/payment_phonepe.png' },
  { id: 'paytm', name: 'Paytm', icon: './assets/payment_paytm.png' },
  { id: 'other', name: 'Other UPI apps', icon: './assets/payment_upi.png' },
];

export default function GullakDragInteraction({ onBack, onComplete, currentSavings = 928 }) {
  // Screen step: 'drag' (initial coin drop) -> 'amount' (keypad) -> 'payment' (choose how to pay)
  const [screenStep, setScreenStep] = useState('drag');
  const [saveAmount, setSaveAmount] = useState('500');
  const [selectedPayment, setSelectedPayment] = useState('gpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Explicit drop lifecycle states: 'idle' | 'dragging' | 'dropping' | 'reacting' | 'navigating'
  const [dropState, setDropState] = useState('idle');
  // Elephant expression frame: 0 (open eyes) | 1 (softening) | 2 (nearly closed) | 3 (fully smiling)
  const [elephantFrame, setElephantFrame] = useState(0);

  // 8 FPS Sprite Frame Loop state
  const [frameIndex, setFrameIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  // Dragging & coin positioning state
  const [coinPos, setCoinPos] = useState({ x: 0, y: 0 }); // offset from initial pos
  const [isSlotApproached, setIsSlotApproached] = useState(false);
  const [isCoinHidden, setIsCoinHidden] = useState(false);

  // References
  const containerRef = useRef(null);
  const coinRef = useRef(null);
  const elephantRef = useRef(null);
  const dragStartRef = useRef({ y: 0, startPosY: 0 });
  const hasMovedRef = useRef(false);
  const depositGuardRef = useRef(false);

  // Reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preload all elephant expression frames, slot mask, coin frames, and success assets
  useEffect(() => {
    const elephantFrames = [
      './assets/gullak_elephant_frame0.png',
      './assets/gullak_elephant_frame1.png',
      './assets/gullak_elephant_frame2.png',
      './assets/gullak_elephant_frame3.png',
      './assets/gullak_elephant_front_lip.png'
    ];
    elephantFrames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `./assets/coin/coin-${String(i).padStart(2, '0')}.png`;
    }

    const successAssets = [
      './assets/success_disc.png',
      './assets/success_checkmark.png',
      './assets/success_coin.png',
      './assets/success_calendar_icon.png',
      './assets/success_book_icon.png'
    ];
    successAssets.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Reset to Frame 0 and initial state on a fresh visit to the coin-drop screen
  useEffect(() => {
    if (screenStep === 'drag') {
      setDropState('idle');
      setElephantFrame(0);
      setCoinPos({ x: 0, y: 0 });
      setIsCoinHidden(false);
      setIsSlotApproached(false);
      depositGuardRef.current = false;
      setIsRotating(true);
    }
  }, [screenStep]);

  // 8 FPS Frame Loop (pauses when dragging or dropping)
  useEffect(() => {
    if (!isRotating || dropState !== 'idle') return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % TOTAL_FRAMES);
    }, FRAME_DURATION);

    return () => clearInterval(interval);
  }, [isRotating, dropState]);

  // Dynamically calculated travel distance from coin start to elephant slot opening
  const [slotTravel, setSlotTravel] = useState(328);

  useEffect(() => {
    const updateTravel = () => {
      if (elephantRef.current && coinRef.current) {
        const elephantRect = elephantRef.current.getBoundingClientRect();
        const coinRect = coinRef.current.getBoundingClientRect();
        const slotY = elephantRect.top + elephantRect.height * 0.226;
        const coinInitialY = coinRect.top + coinRect.height / 2 - coinPos.y;
        const travel = slotY - coinInitialY;
        if (travel > 80) {
          setSlotTravel(travel);
        }
      }
    };
    updateTravel();
    const timer = setTimeout(updateTravel, 120);
    window.addEventListener('resize', updateTravel);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTravel);
    };
  }, []);

  // Execute Deposit Transition & Expression Sequence (strictly guarded against duplicate calls)
  const executeDeposit = useCallback(() => {
    if (depositGuardRef.current || dropState === 'dropping' || dropState === 'reacting' || dropState === 'navigating') return;
    depositGuardRef.current = true;
    setDropState('dropping');
    setIsRotating(false);
    setIsSlotApproached(true);

    if (navigator.vibrate) navigator.vibrate([25, 40, 25]);

    // Select angled coin frame matching the slot angle (frame 2)
    setFrameIndex(2);

    if (prefersReducedMotion) {
      // Reduced motion: skip intermediate motion, hide coin, show Frame 3 for 650ms, then continue
      setIsCoinHidden(true);
      setElephantFrame(3);
      setDropState('reacting');
      setTimeout(() => {
        setDropState('navigating');
        setScreenStep('amount');
      }, 650);
      return;
    }

    // Step 1: Slide smoothly into the slot entrance (strictly vertical x: 0)
    setCoinPos({ x: 0, y: slotTravel + 4 });

    // Step 2: Slide down deep into the slot behind front lip
    setTimeout(() => {
      setCoinPos({ x: 0, y: slotTravel + 54 });
    }, 240);

    // Step 3: Coin has completely disappeared inside!
    // Trigger expression change: Frame 1 (100ms) -> Frame 2 (100ms) -> Frame 3 (650ms) -> Next Screen
    setTimeout(() => {
      setIsCoinHidden(true);
      setDropState('reacting');
      if (navigator.vibrate) navigator.vibrate(60);

      // Frame 1 for 100ms: eyes beginning to soften
      setElephantFrame(1);

      setTimeout(() => {
        // Frame 2 for 100ms: nearly closed happy eyes
        setElephantFrame(2);

        setTimeout(() => {
          // Frame 3 for 650ms: fully smiling elephant
          setElephantFrame(3);

          setTimeout(() => {
            // Open existing next screen while holding final happy expression
            setDropState('navigating');
            setScreenStep('amount');
          }, 650);
        }, 100);
      }, 100);
    }, 420);
  }, [dropState, slotTravel, prefersReducedMotion]);

  // Handle Amount Keypad inputs
  const handleKeyPress = (key) => {
    if (navigator.vibrate) navigator.vibrate(15);
    if (key === 'backspace') {
      setSaveAmount((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
    } else {
      setSaveAmount((prev) => {
        if (prev === '0') return key;
        if (prev.length >= 7) return prev;
        return prev + key;
      });
    }
  };

  const handleQuickPill = (val) => {
    if (navigator.vibrate) navigator.vibrate(20);
    setSaveAmount(String(val));
  };

  // Continue from Amount Screen -> Navigates to Payment Screen!
  const handleContinueToPayment = () => {
    const amt = Number(saveAmount);
    if (amt <= 0) return;
    if (navigator.vibrate) navigator.vibrate(25);
    setScreenStep('payment');
  };

  // Execute Payment -> Confirms payment success and shows Success Screen
  const handleExecutePayment = () => {
    const amt = Number(saveAmount);
    if (amt <= 0 || isProcessingPayment) return;
    setIsProcessingPayment(true);
    if (navigator.vibrate) navigator.vibrate([30, 40, 50]);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setScreenStep('success');
    }, 750);
  };

  // Handle Drag Move & Drop (Strictly 1D straight vertical line)
  const handlePointerDown = (e) => {
    if (dropState !== 'idle') return;

    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;

    setDropState('dragging');
    setIsRotating(false);
    hasMovedRef.current = false;

    dragStartRef.current = {
      y: clientY,
      startPosY: coinPos.y,
    };
  };

  const handlePointerMove = (e) => {
    if (dropState !== 'dragging') return;

    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;
    const deltaY = clientY - dragStartRef.current.y;

    if (Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
    }

    // Strictly vertical movement (x is ALWAYS 0)
    const newY = Math.max(0, Math.min(slotTravel + 10, dragStartRef.current.startPosY + deltaY));
    setCoinPos({ x: 0, y: newY });

    // Check proximity to slot
    const progress = Math.min(1, newY / slotTravel);
    setIsSlotApproached(progress > 0.65);

    // Orient coin toward frame 2 as it nears the slot
    if (progress > 0.45) {
      setFrameIndex(2);
    }
  };

  const handlePointerUp = () => {
    if (dropState !== 'dragging') return;

    // If tapped without dragging -> valid deposit
    if (!hasMovedRef.current) {
      executeDeposit();
      return;
    }

    // If dropped near slot -> valid deposit
    if (coinPos.y >= slotTravel * 0.55) {
      executeDeposit();
    } else {
      // Invalid drop: spring return smoothly to top & resume 8 FPS rotation
      setCoinPos({ x: 0, y: 0 });
      setIsSlotApproached(false);
      setDropState('idle');
      setElephantFrame(0);
      setTimeout(() => {
        if (!depositGuardRef.current) setIsRotating(true);
      }, 380);
    }
  };

  // Dynamic scale: 1.0 at top, down to 0.58 as it enters the slot
  const dragProgress = Math.min(1, Math.max(0, coinPos.y / slotTravel));
  const currentScale = (dropState === 'dropping' || dropState === 'reacting' || dropState === 'navigating')
    ? (coinPos.y > slotTravel + 20 ? 0.52 : 0.58)
    : (1.0 - dragProgress * 0.42);

  const currentFrameSrc = `./assets/coin/coin-${String(frameIndex).padStart(2, '0')}.png`;

  if (screenStep === 'amount') {
    return (
      <div className="gullak-amount-screen">
        {/* Top Header */}
        <header className="gullak-amount-header">
          <button 
            className="gullak-nav-icon-btn" 
            onClick={() => {
              setScreenStep('drag');
              setDropState('idle');
              setElephantFrame(0);
              setIsCoinHidden(false);
              setCoinPos({ x: 0, y: 0 });
              setIsRotating(true);
              depositGuardRef.current = false;
            }} 
            aria-label="Go back"
          >
            <ChevronLeft size={24} strokeWidth={2.4} color="#0f172a" />
          </button>
          <h1 className="gullak-amount-title">Add to your Gullak</h1>
          <button 
            className="gullak-nav-icon-btn" 
            aria-label="Help"
            onClick={() => alert("Enter the amount you'd like to save, then tap Continue!")}
          >
            <HelpCircle size={22} strokeWidth={2.2} color="#0f172a" />
          </button>
        </header>

        {/* Main Headline */}
        <h2 className="gullak-amount-headline">How much would you like to save?</h2>

        {/* 3D Elephant Piggy Bank with floor shadow */}
        <div className="gullak-amount-elephant-wrap">
          <img 
            src="./assets/gullak_elephant_frame3.png" 
            alt="Gullak Elephant" 
            className="gullak-amount-elephant-img"
            draggable={false}
          />
          <div className="elephant-floor-shadow" style={{ bottom: '2px', width: '168px' }}></div>
        </div>

        {/* Amount Display */}
        <div className="gullak-amount-display-section">
          <span className="gullak-amount-label">Enter amount</span>
          <div className="gullak-amount-value-row">
            <span className="gullak-amount-currency">₹</span>
            <span className="gullak-amount-digits">
              {saveAmount === '0' ? '0' : Number(saveAmount).toLocaleString('en-IN')}
            </span>
            <span className="gullak-amount-cursor"></span>
          </div>
        </div>

        {/* Quick Amount Pills */}
        <div className="gullak-quick-pills">
          {[10, 50, 100, 500].map((val) => (
            <button 
              key={val}
              className={`quick-pill-btn ${saveAmount === String(val) ? 'active' : ''}`}
              onClick={() => handleQuickPill(val)}
            >
              ₹{val}
            </button>
          ))}
        </div>

        {/* Thin Divider Line */}
        <div className="gullak-amount-divider"></div>

        {/* Your current savings Row */}
        <div className="gullak-savings-row">
          <span className="savings-row-label">Your current savings</span>
          <span className="savings-row-val">₹{currentSavings}</span>
        </div>

        {/* Custom Numeric Keypad */}
        <div className="gullak-keypad-grid">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button 
              key={num} 
              className="keypad-key-btn" 
              onClick={() => handleKeyPress(num)}
            >
              {num}
            </button>
          ))}
          <div className="keypad-key-btn" style={{ pointerEvents: 'none' }}></div>
          <button 
            className="keypad-key-btn" 
            onClick={() => handleKeyPress('0')}
          >
            0
          </button>
          <button 
            className="keypad-key-btn keypad-backspace-btn" 
            onClick={() => handleKeyPress('backspace')}
            aria-label="Backspace"
          >
            <Delete size={26} strokeWidth={1.8} color="#0f172a" />
          </button>
        </div>

        {/* Continue Button */}
        <button 
          className={`gullak-continue-btn ${Number(saveAmount) > 0 ? 'active' : 'disabled'}`}
          disabled={Number(saveAmount) <= 0}
          onClick={handleContinueToPayment}
        >
          Continue
        </button>

        {/* Helper subtitle */}
        <div className="gullak-continue-hint">
          {Number(saveAmount) > 0 ? `Tap to continue with ₹${Number(saveAmount).toLocaleString('en-IN')}` : 'Enter an amount to continue'}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="gullak-home-indicator"></div>
      </div>
    );
  }

  // STEP 3: Choose How to Pay Screen
  if (screenStep === 'payment') {
    const getMethodName = () => {
      if (selectedPayment === 'card') return 'Debit Card';
      const found = PAYMENT_METHODS.find((m) => m.id === selectedPayment);
      return found ? found.name : 'UPI';
    };

    return (
      <div className="gullak-payment-screen">
        {/* Top Header */}
        <header className="gullak-payment-header">
          <button 
            className="gullak-nav-icon-btn" 
            onClick={() => setScreenStep('amount')} 
            aria-label="Go back"
          >
            <ChevronLeft size={24} strokeWidth={2.4} color="#0f172a" />
          </button>
        </header>

        {/* Title Group */}
        <div className="payment-sub-tag">ADD SAVINGS</div>
        <h1 className="payment-screen-title">Choose how to pay</h1>
        <p className="payment-screen-subtitle">Select a UPI app to add to your Gullak.</p>

        {/* Summary Card */}
        <div className="payment-summary-card">
          <img 
            src="./assets/coin/coin-00.png" 
            alt="Gold Rupee Coin" 
            className="payment-coin-icon" 
          />
          <span className="payment-adding-label">Adding to your Gullak</span>
          <div className="payment-amount-val">
            ₹{Number(saveAmount).toLocaleString('en-IN')}
          </div>
          <button 
            className="payment-edit-btn" 
            onClick={() => setScreenStep('amount')}
          >
            Edit amount
          </button>
        </div>

        {/* Section: Pay using UPI */}
        <div className="payment-section-heading">Pay using UPI</div>
        <div className="payment-options-list">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPayment === method.id;
            return (
              <div 
                key={method.id}
                className={`payment-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedPayment(method.id);
                  if (navigator.vibrate) navigator.vibrate(15);
                }}
              >
                <div className="payment-option-left">
                  <img src={method.icon} alt={method.name} className="payment-method-logo" />
                  <span className="payment-method-name">{method.name}</span>
                </div>
                <div className={`payment-radio ${isSelected ? 'selected' : ''}`}>
                  {isSelected && <div className="payment-radio-dot"></div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pay with debit card option */}
        <div 
          className="debit-card-row"
          onClick={() => {
            setSelectedPayment('card');
            if (navigator.vibrate) navigator.vibrate(15);
          }}
        >
          <div className="debit-card-left">
            <CreditCard size={22} color="#475569" strokeWidth={1.8} />
            <span className="debit-card-title">Pay with debit card</span>
          </div>
          <ChevronRight size={18} color="#94a3b8" />
        </div>

        {/* Checkout Footer */}
        <div className="payment-checkout-footer">
          <div className="payment-total-row">
            <span className="payment-total-label">Total</span>
            <span className="payment-total-amount">₹{Number(saveAmount).toLocaleString('en-IN')}</span>
          </div>

          <button 
            className="payment-pay-btn"
            onClick={handleExecutePayment}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                <span>Processing...</span>
              </>
            ) : (
              <span>Pay ₹{Number(saveAmount).toLocaleString('en-IN')} with {getMethodName()}</span>
            )}
          </button>

          <div className="payment-footer-note">
            Approve the payment in your selected UPI app.
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="gullak-home-indicator"></div>
        </div>
      </div>
    );
  }

  // STEP 4: Savings Success Screen (Munshiji savings-success matching reference)
  if (screenStep === 'success') {
    const amt = Number(saveAmount) > 0 ? Number(saveAmount) : 500;
    const newBal = currentSavings + amt;
    return (
      <SavingsSuccessScreen 
        amountAdded={amt}
        newBalance={newBal}
        onDone={() => {
          if (onComplete) onComplete(amt, 'home');
        }}
        onContinueLearning={() => {
          if (onComplete) onComplete(amt, 'learn');
        }}
      />
    );
  }

  return (
    <div 
      className="gullak-drag-screen"
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Top Header */}
      <header className="gullak-screen-header">
        <button className="gullak-nav-icon-btn" onClick={onBack} aria-label="Go back">
          <ChevronLeft size={24} strokeWidth={2.4} color="#0f172a" />
        </button>
        <h1 className="gullak-screen-title">Your Gullak</h1>
        <button 
          className="gullak-nav-icon-btn" 
          aria-label="Help"
          onClick={() => alert("Drag the ₹ coin straight down into the Gullak's slot to add savings!")}
        >
          <HelpCircle size={22} strokeWidth={2.2} color="#0f172a" />
        </button>
      </header>

      {/* Headline & Subtitle */}
      <div className="gullak-headings">
        <h2 className="gullak-main-headline">Every little bit counts.</h2>
        <p className="gullak-sub-headline">Drag the coin into your Gullak</p>
      </div>

      {/* Main Interactive Stage */}
      <div className="gullak-stage-area">
        {/* Dashed Drag Guide (Strictly straight vertical line aligned to slot) */}
        <div className={`dashed-drag-guide ${dropState !== 'idle' && dropState !== 'dragging' ? 'fade-out' : ''}`}>
          <div className="guide-dashed-line"></div>
        </div>

        {/* Elephant Piggy Bank & Sandwiched Coin Stage */}
        <div 
          className={`elephant-stage-container ${dropState === 'reacting' || dropState === 'navigating' ? 'bounce-joy' : ''}`}
          ref={elephantRef}
        >
          {/* Soft Floor Shadow (in code) */}
          <div className="elephant-floor-shadow"></div>

          {/* Layer 1: Base Elephant Image (Expression Frame 0, 1, 2, or 3) */}
          <img 
            src={`./assets/gullak_elephant_frame${elephantFrame}.png`} 
            alt="Lavender Elephant Coin Bank" 
            className="elephant-base-img"
            draggable={false}
          />

          {/* Layer 2: The 3D Rotating & Draggable Coin (Sandwiched between base and front lip) */}
          <div 
            ref={coinRef}
            className={`gullak-coin-container ${dropState === 'dragging' ? 'is-dragging' : ''} ${dropState === 'dropping' ? 'is-depositing' : 'spring-return'}`}
            style={{
              transform: `translate3d(0, ${coinPos.y}px, 0) scale(${currentScale})`,
              opacity: isCoinHidden ? 0 : 1,
            }}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
          >
            <img 
              src={currentFrameSrc} 
              alt="Gold Rupee Coin" 
              className="coin-sprite-img"
              draggable={false}
            />
          </div>

          {/* Layer 3: Slot Mask Front Lip (progressive occlusion behind slot) */}
          <img 
            src="./assets/gullak_elephant_front_lip.png" 
            alt="" 
            aria-hidden="true"
            className="elephant-front-lip-layer"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Guidance Text */}
      <div className="gullak-bottom-hint">
        <div className="bottom-hint-primary">Drag to begin</div>
        <div className="bottom-hint-secondary">Or tap the coin</div>
      </div>

      {/* Bottom Thin Divider Line */}
      <div className="gullak-bottom-divider"></div>

      {/* Bottom Habit Streak Pill */}
      <div className="gullak-streak-footer">
        <div className="streak-indicator-pill">
          <Flame size={18} fill="#7c3aed" color="#7c3aed" />
          <span>11-day streak</span>
        </div>
      </div>
    </div>
  );
}

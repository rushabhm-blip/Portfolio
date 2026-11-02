import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Info, 
  HelpCircle, 
  FileText, 
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  TrendingUp,
  Receipt,
  Home as HomeIcon,
  BookOpen,
  PieChart
} from 'lucide-react';

// Centralized Holdings Data with full details
export const HOLDINGS_DETAILS_DATA = {
  h1: {
    id: 'h1',
    category: 'mutual_funds',
    categoryLabel: 'Mutual funds',
    name: 'Index fund',
    subname: 'Mutual fund • Growth',
    icon: './assets/portfolio/icon_index_fund_box.png',
    amount: 7470,
    invested: 7200,
    gain: 270,
    gainPercent: 3.75,
    units: 120,
    averageCost: 60.00,
    latestNav: 62.25,
    navDate: '16 Oct 2026',
    unitLabel: 'units',
    costLabel: 'Average cost',
    navLabel: 'Latest NAV',
    navDateLabel: 'NAV date',
    valuationBasis: 'NAV updated daily at market close (3:30 PM)',
    fundInfo: {
      fullName: 'Munshiji Nifty 50 Index Fund - Direct Plan - Growth',
      category: 'Equity: Large Cap',
      benchmark: 'NIFTY 50 Total Return Index (TRI)',
      expenseRatio: '0.20%',
      categoryAvgExpense: '0.85%',
      risk: 'Very High (Equity Market Risk)',
      lockIn: 'Nil (Open-ended fund)',
      exitLoad: 'Nil (0% after 30 days of investment)',
      settlement: 'T+2 business days',
      minInvestment: 500,
      fundManager: 'Arun Singhania & Munshiji Partner AMC',
      aum: '₹14,820 Cr',
      turnoverRatio: '14%'
    },
    activity: [
      {
        id: 'TXN-MF-20260910-8492',
        title: 'Investment completed',
        date: '10 Sep 2026',
        time: '11:32 AM',
        amount: 3600,
        units: 58.064,
        nav: 62.00,
        status: 'Completed',
        type: 'Monthly SIP',
        paymentMode: 'Auto-debit from Linked Bank (•••• 4821)',
        folio: '18492048/92'
      },
      {
        id: 'TXN-MF-20260810-7311',
        title: 'Investment completed',
        date: '10 Aug 2026',
        time: '11:30 AM',
        amount: 3600,
        units: 61.936,
        nav: 58.12,
        status: 'Completed',
        type: 'Monthly SIP',
        paymentMode: 'Auto-debit from Linked Bank (•••• 4821)',
        folio: '18492048/92'
      }
    ]
  },
  h2: {
    id: 'h2',
    category: 'fixed_deposit',
    categoryLabel: 'Fixed deposit',
    name: 'Bank deposit',
    subname: 'Fixed deposit • Cumulative',
    icon: './assets/portfolio/icon_bank_deposit.png',
    amount: 3112,
    invested: 3000,
    gain: 112,
    gainPercent: 3.73,
    units: 3000,
    averageCost: 1.00,
    latestNav: 1.037,
    navDate: '16 Oct 2026',
    unitLabel: 'deposit units',
    costLabel: 'Principal per unit',
    navLabel: 'Current rate unit',
    navDateLabel: 'Accrual date',
    valuationBasis: 'Accrued compound interest calculated daily',
    fundInfo: {
      fullName: 'Munshiji Partner Scheduled Bank Term Deposit',
      category: 'Fixed Income: Term Deposit (AAA Rated)',
      benchmark: '1-Year SBI FD Rate',
      expenseRatio: '0.00%',
      risk: 'Low Risk',
      lockIn: '12 Months (Premature withdrawal allowed with 0.5% penalty)',
      exitLoad: '0.5% if broken before maturity',
      settlement: 'Instant / Same-day credit',
      minInvestment: 1000,
      fundManager: 'Scheduled Commercial Partner Bank',
      aum: 'Insured up to ₹5 Lakh by DICGC'
    },
    activity: [
      {
        id: 'TXN-FD-20260615-1029',
        title: 'Investment completed',
        date: '15 Jun 2026',
        time: '02:15 PM',
        amount: 3000,
        units: 3000,
        nav: 1.00,
        status: 'Completed',
        type: 'One-time Deposit',
        paymentMode: 'Linked Bank Account (•••• 4821)',
        folio: 'FD-7749102'
      }
    ]
  },
  h3: {
    id: 'h3',
    category: 'gold',
    categoryLabel: 'Gold',
    name: 'Gold holding',
    subname: 'Digital Gold • 24K 99.9%',
    icon: './assets/portfolio/icon_gold_holding.png',
    amount: 1868,
    invested: 1800,
    gain: 68,
    gainPercent: 3.78,
    units: 0.24,
    averageCost: 7500.00,
    latestNav: 7783.33,
    navDate: '16 Oct 2026',
    unitLabel: 'grams',
    costLabel: 'Average cost/g',
    navLabel: 'Live rate/g',
    navDateLabel: 'Rate date',
    valuationBasis: 'Live market rate from certified partner vaults',
    fundInfo: {
      fullName: 'Munshiji Digital Gold 24K 999 Purity',
      category: 'Precious Metals: Physical Vaulted Gold',
      benchmark: 'MCX Spot Gold (999 Purity)',
      expenseRatio: '0.00% (Storage free for 5 years)',
      risk: 'Moderate (Commodity market fluctuations)',
      lockIn: 'Nil (Sell anytime 24/7)',
      exitLoad: 'Nil',
      settlement: 'Instant to Linked Bank Account',
      minInvestment: 100,
      fundManager: 'Augmont / MMTC-PAMP Partner Vault',
      aum: '100% Insured in Brink\'s Vaults'
    },
    activity: [
      {
        id: 'TXN-GD-20260722-5501',
        title: 'Investment completed',
        date: '22 Jul 2026',
        time: '04:45 PM',
        amount: 1800,
        units: 0.24,
        nav: 7500.00,
        status: 'Completed',
        type: 'One-time Buy',
        paymentMode: 'UPI AutoPay (•••• 4821)',
        folio: 'GLD-9938102'
      }
    ]
  }
};

export default function InvestmentDetailsScreen({ 
  holdingId = 'h1', 
  onBack,
  onNavigateTab,
  // Developer prop to test loading / error states
  forceState = null // 'loading' | 'error' | null
}) {
  // Synchronous initialization for instant paint
  const [holding, setHolding] = useState(() => HOLDINGS_DETAILS_DATA[holdingId] || null);
  const [loadState, setLoadState] = useState(() => {
    if (forceState) return forceState;
    return HOLDINGS_DETAILS_DATA[holdingId] ? 'ready' : 'error';
  });

  // Active sheets
  const [isNavSheetOpen, setIsNavSheetOpen] = useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFundInfoOpen, setIsFundInfoOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Transaction Review Flows
  const [isInvestMoreOpen, setIsInvestMoreOpen] = useState(false);
  const [investStep, setInvestStep] = useState(1); // 1 = entry, 2 = review, 3 = success
  const [investAmount, setInvestAmount] = useState('1000');
  const [investType, setInvestType] = useState('one_time'); // 'one_time' | 'sip'
  const [investSuccessTx, setInvestSuccessTx] = useState(null);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1); // 1 = entry, 2 = review, 3 = success
  const [withdrawMode, setWithdrawMode] = useState('amount'); // 'amount' | 'units'
  const [withdrawValue, setWithdrawValue] = useState('2000');
  const [withdrawSuccessTx, setWithdrawSuccessTx] = useState(null);

  // Update holding data if holdingId or forceState changes
  useEffect(() => {
    if (forceState === 'loading') {
      setLoadState('loading');
      return;
    }
    if (forceState === 'error') {
      setLoadState('error');
      return;
    }

    const data = HOLDINGS_DETAILS_DATA[holdingId];
    if (data) {
      setHolding(data);
      setLoadState('ready');
    } else {
      setLoadState('error');
    }
  }, [holdingId, forceState]);

  const handleRetry = () => {
    setLoadState('loading');
    setTimeout(() => {
      const data = HOLDINGS_DETAILS_DATA[holdingId] || HOLDINGS_DETAILS_DATA['h1'];
      setHolding(data);
      setLoadState('ready');
    }, 300);
  };

  // Helper formatting
  const formatInr = (val) => Number(val).toLocaleString('en-IN');

  // Dynamic NAV date fallback
  const getNavDate = (h) => {
    if (!h) return '16 Oct 2026';
    return h.navDate || '16 Oct 2026';
  };

  // ---------------------------------------------------------------------------
  // RENDER: LOADING SKELETON STATE
  // ---------------------------------------------------------------------------
  if (loadState === 'loading') {
    return (
      <div className="inv-details-container">
        {/* Header */}
        <header className="inv-details-header">
          <button className="inv-header-btn" onClick={onBack} aria-label="Back">
            <ChevronLeft size={24} color="#0f172a" />
          </button>
          <h1 className="inv-header-title">Investment details</h1>
          <div style={{ width: 40 }}></div>
        </header>

        {/* Skeleton Body */}
        <div className="inv-details-body">
          {/* Hero Skeleton */}
          <div className="inv-hero-skeleton">
            <div className="skeleton-box shimmer" style={{ width: 52, height: 52, borderRadius: 16 }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <div className="skeleton-bar shimmer" style={{ width: '55%', height: 20 }}></div>
              <div className="skeleton-bar shimmer" style={{ width: '40%', height: 14 }}></div>
            </div>
          </div>

          {/* Current Value Card Skeleton */}
          <div className="inv-card-skeleton shimmer"></div>

          {/* Holding Grid Skeleton */}
          <div className="inv-grid-skeleton shimmer"></div>

          {/* Banner Skeleton */}
          <div className="inv-banner-skeleton shimmer"></div>

          {/* Activity Skeleton */}
          <div className="inv-activity-skeleton shimmer"></div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: ERROR / RETRY STATE
  // ---------------------------------------------------------------------------
  if (loadState === 'error' || !holding) {
    return (
      <div className="inv-details-container">
        <header className="inv-details-header">
          <button className="inv-header-btn" onClick={onBack} aria-label="Back">
            <ChevronLeft size={24} color="#0f172a" />
          </button>
          <h1 className="inv-header-title">Investment details</h1>
          <div style={{ width: 40 }}></div>
        </header>

        <div className="inv-details-body" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="portfolio-error-box" style={{ maxWidth: 360 }}>
            <AlertCircle size={36} color="#ef4444" />
            <h3 className="portfolio-error-title">Holding details unavailable</h3>
            <p className="portfolio-error-desc">We couldn't retrieve the latest data for holding #{holdingId}.</p>
            <button className="portfolio-retry-action-btn" onClick={handleRetry}>
              <RefreshCw size={16} />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CALCULATIONS (Dynamically bound)
  // ---------------------------------------------------------------------------
  const currentVal = holding.amount;
  const investedVal = holding.invested;
  const totalGain = holding.gain;
  const gainPct = holding.gainPercent;
  const unitsHeld = holding.units;
  const avgCost = holding.averageCost;
  const latestNav = holding.latestNav;
  const navDateStr = getNavDate(holding);

  // Invest more helpers
  const numInvest = Number(investAmount) || 0;
  const minInvest = holding.fundInfo?.minInvestment || 500;
  const isInvestValid = numInvest >= minInvest;
  const estInvestUnits = (numInvest / latestNav).toFixed(3);

  // Withdraw helpers
  const maxWithdrawAmt = currentVal;
  const numWithdraw = Number(withdrawValue) || 0;
  const withdrawUnitsCalc = withdrawMode === 'units'
    ? numWithdraw
    : Number((numWithdraw / latestNav).toFixed(3));
  const withdrawAmtCalc = withdrawMode === 'units'
    ? Number((numWithdraw * latestNav).toFixed(0))
    : numWithdraw;
  const isWithdrawValid = withdrawAmtCalc > 0 && withdrawAmtCalc <= maxWithdrawAmt;

  return (
    <div className="inv-details-container">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER (Stationary, Matching Reference)                   */}
      {/* ------------------------------------------------------------- */}
      <header className="inv-details-header">
        <button 
          className="inv-header-btn" 
          onClick={onBack} 
          aria-label="Back to Portfolio"
        >
          <ChevronLeft size={25} color="#0f172a" strokeWidth={2.4} />
        </button>

        <h1 className="inv-header-title">Investment details</h1>

        <button 
          className="inv-header-btn" 
          onClick={() => setIsMenuOpen(true)}
          aria-label="More options"
        >
          <MoreHorizontal size={23} color="#0f172a" strokeWidth={2.2} />
        </button>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* SCROLLABLE SCREEN BODY                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="inv-details-body">
        
        {/* HERO TITLE & CLAY ICON SECTION */}
        <section className="inv-hero-section">
          <div className="inv-hero-icon-wrap">
            <img 
              src={holding.icon} 
              alt="" 
              aria-hidden="true" 
              className="inv-hero-icon-img"
            />
          </div>
          <div className="inv-hero-text">
            <h2 className="inv-hero-title">{holding.name}</h2>
            <p className="inv-hero-sub">{holding.subname}</p>
          </div>
        </section>

        {/* CURRENT VALUE SUMMARY CARD (Signature lavender gradient) */}
        <section className="inv-summary-card">
          <div className="inv-summary-top">
            <span className="inv-card-label">Current value</span>
            <div className="inv-card-amount">₹{formatInr(currentVal)}</div>
          </div>

          <div className="inv-card-divider"></div>

          <div className="inv-summary-bottom-row">
            <div className="inv-stat-col">
              <span className="inv-stat-label">Invested</span>
              <span className="inv-stat-val">₹{formatInr(investedVal)}</span>
            </div>

            <div className="inv-stat-divider"></div>

            <div className="inv-stat-col">
              <span className="inv-stat-label">Total gain</span>
              <span className="inv-stat-val gain">
                +{formatInr(totalGain)} ({gainPct}%)
              </span>
            </div>
          </div>
        </section>

        {/* YOUR HOLDING 2x2 METRICS GRID */}
        <section className="inv-holding-section">
          <h2 className="inv-section-title">Your holding</h2>

          <div className="inv-holding-grid-card">
            {/* Row 1 */}
            <div className="inv-grid-row">
              <div className="inv-grid-cell">
                <span className="inv-grid-label">Units held</span>
                <span className="inv-grid-val">{unitsHeld} {holding.unitLabel}</span>
              </div>
              <div className="inv-grid-vdivider"></div>
              <div className="inv-grid-cell">
                <span className="inv-grid-label">{holding.costLabel || 'Average cost'}</span>
                <span className="inv-grid-val">₹{avgCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="inv-grid-hdivider"></div>

            {/* Row 2 */}
            <div className="inv-grid-row">
              <div className="inv-grid-cell">
                <span className="inv-grid-label">{holding.navLabel || 'Latest NAV'}</span>
                <span className="inv-grid-val">₹{latestNav.toFixed(2)}</span>
              </div>
              <div className="inv-grid-vdivider"></div>
              <div className="inv-grid-cell">
                <span className="inv-grid-label">{holding.navDateLabel || 'NAV date'}</span>
                <span className="inv-grid-val">{navDateStr}</span>
              </div>
            </div>
          </div>
        </section>

        {/* "WHAT IS NAV?" DISMISSIBLE BANNER */}
        <section 
          className="inv-nav-banner" 
          onClick={() => setIsNavSheetOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="What is NAV? Learn more"
        >
          <div className="inv-nav-banner-left">
            <img 
              src="./assets/portfolio/icon_nav_book.png" 
              alt="Book" 
              className="inv-nav-book-icon"
            />
            <span className="inv-nav-banner-text">What is NAV?</span>
          </div>
          <ChevronRight size={19} color="#94a3b8" />
        </section>

        {/* RECENT ACTIVITY SECTION */}
        <section className="inv-activity-section">
          <div className="inv-activity-header">
            <h2 className="inv-section-title">Recent activity</h2>
            <button 
              className="inv-view-all-link"
              onClick={() => setIsHistorySheetOpen(true)}
            >
              <span>View all</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="inv-activity-card">
            {holding.activity.map((tx, idx) => (
              <React.Fragment key={tx.id}>
                {idx > 0 && <div className="inv-activity-divider"></div>}
                <div 
                  className="inv-activity-row"
                  onClick={() => setSelectedTxDetail(tx)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${tx.title}, ${tx.date}, amount ₹${formatInr(tx.amount)}`}
                >
                  <div className="inv-activity-left">
                    <div className="inv-doc-icon-wrap">
                      <FileText size={19} color="#475569" strokeWidth={1.8} />
                    </div>
                    <div className="inv-activity-info">
                      <span className="inv-activity-name">{tx.title}</span>
                      <span className="inv-activity-date">{tx.date}</span>
                    </div>
                  </div>

                  <div className="inv-activity-right">
                    <span className="inv-activity-amt">₹{formatInr(tx.amount)}</span>
                    <ChevronRight size={17} color="#94a3b8" />
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* SUBTLE MARKET DISCLAIMER CAPTION */}
        <p className="inv-market-note">Value changes with the market.</p>

        {/* ACTION BUTTONS (Pill buttons right above bottom nav) */}
        <div className="inv-action-buttons-row">
          <button 
            className="inv-btn-secondary"
            onClick={() => {
              setWithdrawStep(1);
              setWithdrawValue('2000');
              setIsWithdrawOpen(true);
            }}
          >
            Withdraw
          </button>

          <button 
            className="inv-btn-primary"
            onClick={() => {
              setInvestStep(1);
              setInvestAmount('1000');
              setIsInvestMoreOpen(true);
            }}
          >
            Invest more
          </button>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. "WHAT IS NAV?" DISMISSIBLE SHEET MODAL                     */}
      {/* ------------------------------------------------------------- */}
      {isNavSheetOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsNavSheetOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>

            <div className="portfolio-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="./assets/portfolio/icon_nav_book.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                <h3 className="portfolio-sheet-title">What is NAV?</h3>
              </div>
              <button 
                className="portfolio-sheet-close"
                onClick={() => setIsNavSheetOpen(false)}
                aria-label="Close"
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="portfolio-holding-details-body">
              <p className="inv-sheet-body-text">
                <strong>NAV (Net Asset Value)</strong> is the value of one unit of a mutual fund. Your holding value uses your units and the applicable NAV.
              </p>

              <div className="inv-nav-calc-box">
                <span className="nav-calc-title">How your holding is calculated:</span>
                <div className="nav-calc-formula">
                  <span>Units held ({unitsHeld})</span>
                  <span>×</span>
                  <span>Latest NAV (₹{latestNav.toFixed(2)})</span>
                  <span>=</span>
                  <strong>₹{formatInr(currentVal)}</strong>
                </div>
              </div>

              <div className="holding-valuation-badge" style={{ marginTop: 12 }}>
                <span className="valuation-dot"></span>
                <span>Latest valuation date: {navDateStr}</span>
              </div>
            </div>

            <button 
              className="portfolio-sheet-btn"
              onClick={() => setIsNavSheetOpen(false)}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. TRANSACTION HISTORY (VIEW ALL) SHEET                       */}
      {/* ------------------------------------------------------------- */}
      {isHistorySheetOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsHistorySheetOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>

            <div className="portfolio-sheet-header">
              <h3 className="portfolio-sheet-title">{holding.name} activity</h3>
              <button className="portfolio-sheet-close" onClick={() => setIsHistorySheetOpen(false)} aria-label="Close">
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="portfolio-history-list" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
              {holding.activity.map(tx => (
                <div 
                  key={tx.id} 
                  className="portfolio-history-item"
                  onClick={() => {
                    setSelectedTxDetail(tx);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="history-item-left">
                    <span className="history-item-name">{tx.title}</span>
                    <span className="history-item-date">{tx.date} · {tx.type}</span>
                  </div>
                  <div className="history-item-right">
                    <span className="history-item-amount">₹{formatInr(tx.amount)}</span>
                    <span className="history-item-status completed">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="portfolio-sheet-btn" onClick={() => setIsHistorySheetOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. INDIVIDUAL TRANSACTION DETAILS SHEET                       */}
      {/* ------------------------------------------------------------- */}
      {selectedTxDetail && (
        <div className="portfolio-sheet-backdrop" onClick={() => setSelectedTxDetail(null)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>

            <div className="portfolio-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={22} color="#475569" />
                <h3 className="portfolio-sheet-title">Transaction receipt</h3>
              </div>
              <button className="portfolio-sheet-close" onClick={() => setSelectedTxDetail(null)} aria-label="Close">
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="portfolio-holding-details-body">
              <div className="tx-receipt-card">
                <div className="tx-receipt-header">
                  <span className="tx-receipt-status-pill">
                    <CheckCircle2 size={13} color="#16a34a" />
                    <span>{selectedTxDetail.status}</span>
                  </span>
                  <div className="tx-receipt-total">₹{formatInr(selectedTxDetail.amount)}</div>
                  <span className="tx-receipt-type">{selectedTxDetail.type}</span>
                </div>

                <div className="tx-receipt-details">
                  <div className="tx-receipt-row">
                    <span className="tx-label">Transaction ID</span>
                    <span className="tx-val mono">{selectedTxDetail.id}</span>
                  </div>
                  <div className="tx-receipt-row">
                    <span className="tx-label">Date & Time</span>
                    <span className="tx-val">{selectedTxDetail.date}, {selectedTxDetail.time || '11:30 AM'}</span>
                  </div>
                  <div className="tx-receipt-row">
                    <span className="tx-label">Allotted Units</span>
                    <span className="tx-val">{selectedTxDetail.units} units</span>
                  </div>
                  <div className="tx-receipt-row">
                    <span className="tx-label">Applicable NAV</span>
                    <span className="tx-val">₹{selectedTxDetail.nav?.toFixed(2)}</span>
                  </div>
                  <div className="tx-receipt-row">
                    <span className="tx-label">Folio Number</span>
                    <span className="tx-val">{selectedTxDetail.folio || '18492048/92'}</span>
                  </div>
                  <div className="tx-receipt-row">
                    <span className="tx-label">Payment mode</span>
                    <span className="tx-val">{selectedTxDetail.paymentMode}</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="portfolio-sheet-btn" onClick={() => setSelectedTxDetail(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ELLIPSIS MENU: FUND INFO & GET HELP                        */}
      {/* ------------------------------------------------------------- */}
      {isMenuOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsMenuOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>

            <div className="portfolio-sheet-header">
              <h3 className="portfolio-sheet-title">Options</h3>
              <button className="portfolio-sheet-close" onClick={() => setIsMenuOpen(false)} aria-label="Close">
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="inv-menu-options">
              <button 
                className="inv-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsFundInfoOpen(true);
                }}
              >
                <div className="inv-menu-icon"><Info size={20} color="#475569" /></div>
                <div className="inv-menu-info">
                  <span className="inv-menu-title">Fund information</span>
                  <span className="inv-menu-desc">Benchmark, expense ratio, AUM and manager</span>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </button>

              <button 
                className="inv-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsHelpOpen(true);
                }}
              >
                <div className="inv-menu-icon"><HelpCircle size={20} color="#475569" /></div>
                <div className="inv-menu-info">
                  <span className="inv-menu-title">Get help</span>
                  <span className="inv-menu-desc">FAQs, order processing time and support</span>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </button>
            </div>

            <button className="portfolio-sheet-btn" onClick={() => setIsMenuOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4A. FUND INFORMATION SHEET                                    */}
      {/* ------------------------------------------------------------- */}
      {isFundInfoOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsFundInfoOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>

            <div className="portfolio-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={22} color="#0f172a" />
                <h3 className="portfolio-sheet-title">Fund information</h3>
              </div>
              <button className="portfolio-sheet-close" onClick={() => setIsFundInfoOpen(false)} aria-label="Close">
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="portfolio-holding-details-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="fund-info-list">
                <div className="fund-info-row">
                  <span className="fund-info-label">Scheme Name</span>
                  <span className="fund-info-val bold">{holding.fundInfo?.fullName}</span>
                </div>
                <div className="fund-info-row">
                  <span className="fund-info-label">Benchmark Index</span>
                  <span className="fund-info-val">{holding.fundInfo?.benchmark}</span>
                </div>
                <div className="fund-info-row">
                  <span className="fund-info-label">Expense Ratio</span>
                  <span className="fund-info-val highlight">{holding.fundInfo?.expenseRatio} (Category avg: {holding.fundInfo?.categoryAvgExpense || '0.85%'})</span>
                </div>
                <div className="fund-info-row">
                  <span className="fund-info-label">Riskometer</span>
                  <span className="fund-info-val">{holding.fundInfo?.risk}</span>
                </div>
                <div className="fund-info-row">
                  <span className="fund-info-label">Lock-in Period</span>
                  <span className="fund-info-val">{holding.fundInfo?.lockIn}</span>
                </div>
                <div className="fund-info-row">
                  <span className="fund-info-label">Exit Load</span>
                  <span className="fund-info-val">{holding.fundInfo?.exitLoad}</span>
                </div>
                <div className="fund-info-row">
                  <span className="fund-info-label">Settlement Timeline</span>
                  <span className="fund-info-val">{holding.fundInfo?.settlement}</span>
                </div>
                <div className="fund-info-row">
                  <span className="fund-info-label">Fund Manager</span>
                  <span className="fund-info-val">{holding.fundInfo?.fundManager}</span>
                </div>
              </div>
            </div>

            <button className="portfolio-sheet-btn" onClick={() => setIsFundInfoOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4B. GET HELP SHEET                                            */}
      {/* ------------------------------------------------------------- */}
      {isHelpOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsHelpOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>

            <div className="portfolio-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={22} color="#0f172a" />
                <h3 className="portfolio-sheet-title">Help & FAQs</h3>
              </div>
              <button className="portfolio-sheet-close" onClick={() => setIsHelpOpen(false)} aria-label="Close">
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="portfolio-holding-details-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="inv-faq-item">
                <h4 className="inv-faq-q">When will my order get placed?</h4>
                <p className="inv-faq-a">Orders submitted before 3:00 PM on market working days receive the same day's NAV. Orders placed after 3:00 PM receive the next business day's NAV.</p>
              </div>

              <div className="inv-faq-item">
                <h4 className="inv-faq-q">Are there any taxes when I withdraw?</h4>
                <p className="inv-faq-a">Equity funds held over 12 months qualify for Long-Term Capital Gains (LTCG) tax (12.5% on gains over ₹1.25 Lakh). Short-term holdings (&lt; 12 months) are taxed at 20%.</p>
              </div>

              <div className="inv-faq-item">
                <h4 className="inv-faq-q">How does Munshiji keep costs low?</h4>
                <p className="inv-faq-a">We exclusively route through Direct Mutual Fund plans with zero distributor commissions, saving you up to 1.5% each year.</p>
              </div>
            </div>

            <button className="portfolio-sheet-btn" onClick={() => setIsHelpOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. INVEST MORE: AMOUNT ENTRY & REVIEW FLOW                    */}
      {/* ------------------------------------------------------------- */}
      {isInvestMoreOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsInvestMoreOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>

            <div className="portfolio-sheet-header">
              <h3 className="portfolio-sheet-title">
                {investStep === 1 && `Invest in ${holding.name}`}
                {investStep === 2 && 'Review your investment'}
                {investStep === 3 && 'Investment scheduled!'}
              </h3>
              <button className="portfolio-sheet-close" onClick={() => setIsInvestMoreOpen(false)} aria-label="Close">
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* STEP 1: AMOUNT ENTRY & RESTRICTIONS */}
            {investStep === 1 && (
              <div className="portfolio-holding-details-body">
                {/* Investment Type Toggle */}
                <div className="inv-pill-toggle">
                  <button 
                    className={`pill-toggle-btn ${investType === 'one_time' ? 'active' : ''}`}
                    onClick={() => setInvestType('one_time')}
                  >
                    One-time
                  </button>
                  <button 
                    className={`pill-toggle-btn ${investType === 'sip' ? 'active' : ''}`}
                    onClick={() => setInvestType('sip')}
                  >
                    Monthly SIP
                  </button>
                </div>

                {/* Amount Input */}
                <div className="inv-input-box">
                  <span className="inv-input-prefix">₹</span>
                  <input 
                    type="number" 
                    className="inv-amount-input" 
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="500"
                    min="500"
                    step="100"
                  />
                </div>

                {/* Quick Chips */}
                <div className="inv-quick-chips">
                  {['500', '1000', '2500', '5000'].map(val => (
                    <button 
                      key={val}
                      className={`quick-chip ${investAmount === val ? 'selected' : ''}`}
                      onClick={() => setInvestAmount(val)}
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>

                {/* Estimated Units */}
                {isInvestValid && (
                  <div className="inv-est-units-note">
                    Estimated units: <strong>~{estInvestUnits} units</strong> at latest NAV ₹{latestNav.toFixed(2)}
                  </div>
                )}

                {/* Eligibility & Restrictions Advisory */}
                <div className="inv-restriction-box">
                  <div className="restriction-item">
                    <ShieldCheck size={16} color="#059669" />
                    <span>Eligibility: Linked Bank mandate active</span>
                  </div>
                  <div className="restriction-item">
                    <Clock size={16} color="#64748b" />
                    <span>Cut-off time: Orders before 3:00 PM get today's NAV</span>
                  </div>
                  <div className="restriction-item">
                    <Info size={16} color="#64748b" />
                    <span>Minimum investment: ₹{minInvest}</span>
                  </div>
                </div>

                {!isInvestValid && (
                  <p className="inv-input-error">
                    Minimum investment amount is ₹{minInvest}.
                  </p>
                )}

                <button 
                  className="portfolio-sheet-btn"
                  disabled={!isInvestValid}
                  onClick={() => setInvestStep(2)}
                  style={{ opacity: isInvestValid ? 1 : 0.5 }}
                >
                  Review investment
                </button>
              </div>
            )}

            {/* STEP 2: REVIEW FLOW (Never executes immediately) */}
            {investStep === 2 && (
              <div className="portfolio-holding-details-body">
                <div className="inv-review-summary-box">
                  <div className="review-row">
                    <span className="review-label">Fund</span>
                    <span className="review-val bold">{holding.name} (Growth)</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Order Type</span>
                    <span className="review-val">{investType === 'sip' ? 'Monthly SIP' : 'One-time investment'}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Investment Amount</span>
                    <span className="review-val large">₹{formatInr(numInvest)}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Estimated Units</span>
                    <span className="review-val">~{estInvestUnits} units</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Applicable NAV</span>
                    <span className="review-val">₹{latestNav.toFixed(2)} (subject to cut-off)</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Payment Source</span>
                    <span className="review-val">Linked Bank (•••• 4821)</span>
                  </div>
                </div>

                <p className="inv-regulatory-note">
                  By clicking Confirm, you authorize Munshiji to debit ₹{formatInr(numInvest)} from your linked account. Mutual funds are subject to market risks.
                </p>

                <div className="inv-review-actions">
                  <button className="inv-back-step-btn" onClick={() => setInvestStep(1)}>
                    Edit
                  </button>
                  <button 
                    className="portfolio-sheet-btn primary"
                    onClick={() => {
                      const newTx = {
                        id: `TXN-MF-${Date.now().toString().slice(-8)}`,
                        title: 'Investment submitted',
                        date: 'Today',
                        time: 'Just now',
                        amount: numInvest,
                        units: Number(estInvestUnits),
                        nav: latestNav,
                        status: 'Completed',
                        type: investType === 'sip' ? 'Monthly SIP' : 'One-time',
                        paymentMode: 'Linked Bank Account (•••• 4821)',
                        folio: '18492048/92'
                      };
                      setInvestSuccessTx(newTx);
                      // Update holding state
                      setHolding(prev => ({
                        ...prev,
                        amount: prev.amount + numInvest,
                        invested: prev.invested + numInvest,
                        units: Number((prev.units + Number(estInvestUnits)).toFixed(2)),
                        activity: [newTx, ...prev.activity]
                      }));
                      setInvestStep(3);
                    }}
                  >
                    Confirm investment
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION RECEIPT */}
            {investStep === 3 && (
              <div className="portfolio-holding-details-body" style={{ textAlign: 'center', padding: '10px 0' }}>
                <div className="inv-success-icon-wrap">
                  <CheckCircle2 size={54} color="#16a34a" />
                </div>
                <h4 className="inv-success-title">Order placed successfully!</h4>
                <p className="inv-success-sub">
                  ₹{formatInr(numInvest)} will be allotted ~{estInvestUnits} units based on applicable NAV.
                </p>

                <div className="tx-receipt-card" style={{ marginTop: 14, textAlign: 'left' }}>
                  <div className="tx-receipt-row">
                    <span className="tx-label">Ref ID</span>
                    <span className="tx-val mono">{investSuccessTx?.id}</span>
                  </div>
                  <div className="tx-receipt-row">
                    <span className="tx-label">Status</span>
                    <span className="tx-val" style={{ color: '#16a34a', fontWeight: 700 }}>Processing</span>
                  </div>
                </div>

                <button 
                  className="portfolio-sheet-btn"
                  style={{ marginTop: 16 }}
                  onClick={() => setIsInvestMoreOpen(false)}
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. WITHDRAW: AMOUNT/UNITS ENTRY & REVIEW FLOW                 */}
      {/* ------------------------------------------------------------- */}
      {isWithdrawOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsWithdrawOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>

            <div className="portfolio-sheet-header">
              <h3 className="portfolio-sheet-title">
                {withdrawStep === 1 && `Withdraw from ${holding.name}`}
                {withdrawStep === 2 && 'Review withdrawal'}
                {withdrawStep === 3 && 'Withdrawal requested!'}
              </h3>
              <button className="portfolio-sheet-close" onClick={() => setIsWithdrawOpen(false)} aria-label="Close">
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* STEP 1: ENTRY & RESTRICTIONS */}
            {withdrawStep === 1 && (
              <div className="portfolio-holding-details-body">
                <div className="inv-available-banner">
                  <span>Available to withdraw: <strong>₹{formatInr(maxWithdrawAmt)}</strong> ({unitsHeld} units)</span>
                </div>

                {/* Mode Toggle */}
                <div className="inv-pill-toggle">
                  <button 
                    className={`pill-toggle-btn ${withdrawMode === 'amount' ? 'active' : ''}`}
                    onClick={() => {
                      setWithdrawMode('amount');
                      setWithdrawValue('2000');
                    }}
                  >
                    By Amount (₹)
                  </button>
                  <button 
                    className={`pill-toggle-btn ${withdrawMode === 'units' ? 'active' : ''}`}
                    onClick={() => {
                      setWithdrawMode('units');
                      setWithdrawValue('32');
                    }}
                  >
                    By Units
                  </button>
                </div>

                {/* Value Input */}
                <div className="inv-input-box">
                  <span className="inv-input-prefix">{withdrawMode === 'amount' ? '₹' : 'units'}</span>
                  <input 
                    type="number" 
                    className="inv-amount-input" 
                    value={withdrawValue}
                    onChange={(e) => setWithdrawValue(e.target.value)}
                    max={withdrawMode === 'amount' ? maxWithdrawAmt : unitsHeld}
                    min="1"
                  />
                </div>

                {/* Percentage Chips */}
                <div className="inv-quick-chips">
                  {[25, 50, 75, 100].map(pct => {
                    const chipAmt = Math.round((maxWithdrawAmt * pct) / 100);
                    const chipUnits = Number(((unitsHeld * pct) / 100).toFixed(2));
                    return (
                      <button 
                        key={pct}
                        className="quick-chip"
                        onClick={() => {
                          if (withdrawMode === 'amount') setWithdrawValue(chipAmt.toString());
                          else setWithdrawValue(chipUnits.toString());
                        }}
                      >
                        {pct === 100 ? '100% (All)' : `${pct}%`}
                      </button>
                    );
                  })}
                </div>

                {/* Real-time equivalence */}
                {isWithdrawValid && (
                  <div className="inv-est-units-note">
                    {withdrawMode === 'amount' ? (
                      <span>Redeeming: <strong>~{withdrawUnitsCalc} units</strong></span>
                    ) : (
                      <span>Redeeming: <strong>~₹{formatInr(withdrawAmtCalc)}</strong></span>
                    )}
                  </div>
                )}

                {/* Restrictions and Eligibility */}
                <div className="inv-restriction-box">
                  <div className="restriction-item">
                    <ShieldCheck size={16} color="#059669" />
                    <span>Exit load: Nil (0% after 30 days)</span>
                  </div>
                  <div className="restriction-item">
                    <Clock size={16} color="#64748b" />
                    <span>Settlement: T+2 business days to linked bank</span>
                  </div>
                  <div className="restriction-item">
                    <Info size={16} color="#64748b" />
                    <span>Lock-in period: None</span>
                  </div>
                </div>

                {!isWithdrawValid && (
                  <p className="inv-input-error">
                    {withdrawAmtCalc > maxWithdrawAmt
                      ? `Amount cannot exceed available holding ₹${formatInr(maxWithdrawAmt)}.`
                      : 'Please enter a valid withdrawal amount.'}
                  </p>
                )}

                <button 
                  className="portfolio-sheet-btn"
                  disabled={!isWithdrawValid}
                  onClick={() => setWithdrawStep(2)}
                  style={{ opacity: isWithdrawValid ? 1 : 0.5 }}
                >
                  Review withdrawal
                </button>
              </div>
            )}

            {/* STEP 2: REVIEW FLOW */}
            {withdrawStep === 2 && (
              <div className="portfolio-holding-details-body">
                <div className="inv-review-summary-box">
                  <div className="review-row">
                    <span className="review-label">Fund</span>
                    <span className="review-val bold">{holding.name} (Growth)</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Units to Redeem</span>
                    <span className="review-val">{withdrawUnitsCalc} units</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Estimated Gross Payout</span>
                    <span className="review-val large">₹{formatInr(withdrawAmtCalc)}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Exit Load (0%)</span>
                    <span className="review-val">₹0.00</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Net Credit Payout</span>
                    <span className="review-val bold" style={{ color: '#16a34a' }}>₹{formatInr(withdrawAmtCalc)}</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Destination Bank</span>
                    <span className="review-val">HDFC Bank (•••• 4821)</span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Expected Settlement</span>
                    <span className="review-val">T+2 business days</span>
                  </div>
                </div>

                <p className="inv-regulatory-note">
                  Redemption will be processed at the applicable NAV. The actual credit amount may vary slightly with market closing NAV.
                </p>

                <div className="inv-review-actions">
                  <button className="inv-back-step-btn" onClick={() => setWithdrawStep(1)}>
                    Edit
                  </button>
                  <button 
                    className="portfolio-sheet-btn primary"
                    onClick={() => {
                      const newTx = {
                        id: `TXN-RED-${Date.now().toString().slice(-8)}`,
                        title: 'Withdrawal requested',
                        date: 'Today',
                        time: 'Just now',
                        amount: withdrawAmtCalc,
                        units: withdrawUnitsCalc,
                        nav: latestNav,
                        status: 'Processing',
                        type: 'Redemption',
                        paymentMode: 'Credit to Linked Bank (•••• 4821)',
                        folio: '18492048/92'
                      };
                      setWithdrawSuccessTx(newTx);
                      // Update holding state
                      setHolding(prev => ({
                        ...prev,
                        amount: Math.max(0, prev.amount - withdrawAmtCalc),
                        units: Math.max(0, Number((prev.units - withdrawUnitsCalc).toFixed(2))),
                        activity: [newTx, ...prev.activity]
                      }));
                      setWithdrawStep(3);
                    }}
                  >
                    Confirm withdrawal
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION RECEIPT */}
            {withdrawStep === 3 && (
              <div className="portfolio-holding-details-body" style={{ textAlign: 'center', padding: '10px 0' }}>
                <div className="inv-success-icon-wrap">
                  <CheckCircle2 size={54} color="#16a34a" />
                </div>
                <h4 className="inv-success-title">Withdrawal request submitted!</h4>
                <p className="inv-success-sub">
                  ₹{formatInr(withdrawAmtCalc)} will be credited to your linked HDFC Bank account within T+2 business days.
                </p>

                <div className="tx-receipt-card" style={{ marginTop: 14, textAlign: 'left' }}>
                  <div className="tx-receipt-row">
                    <span className="tx-label">Redemption ID</span>
                    <span className="tx-val mono">{withdrawSuccessTx?.id}</span>
                  </div>
                  <div className="tx-receipt-row">
                    <span className="tx-label">Destination</span>
                    <span className="tx-val">HDFC Bank (•••• 4821)</span>
                  </div>
                </div>

                <button 
                  className="portfolio-sheet-btn"
                  style={{ marginTop: 16 }}
                  onClick={() => setIsWithdrawOpen(false)}
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation (Portfolio active) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-tabs">
          <button className="nav-tab-item" onClick={() => onNavigateTab && onNavigateTab('home')}>
            <div className="nav-tab-icon"><HomeIcon size={22} strokeWidth={1.8} color="#94a3b8" /></div>
            <span className="nav-tab-label">Home</span>
          </button>
          <button className="nav-tab-item" onClick={() => onNavigateTab && onNavigateTab('gullak')}>
            <div className="nav-tab-icon">
              <img src="./assets/goals/nav_gullak_exact.png" alt="Gullak" style={{ width: '20px', height: '18px', objectFit: 'contain' }} />
            </div>
            <span className="nav-tab-label">Gullak</span>
          </button>
          <button className="nav-tab-item" onClick={() => onNavigateTab && onNavigateTab('learn')}>
            <div className="nav-tab-icon"><BookOpen size={21} strokeWidth={1.8} color="#94a3b8" /></div>
            <span className="nav-tab-label">Learn</span>
          </button>
          <button className="nav-tab-item active" onClick={onBack}>
            <div className="portfolio-nav-pill">
              <PieChart size={19} strokeWidth={2.4} color="#0f172a" fill="#0f172a" />
            </div>
            <span className="nav-tab-label active">Portfolio</span>
          </button>
          <button className="nav-tab-item" onClick={() => onNavigateTab && onNavigateTab('more')}>
            <div className="nav-tab-icon"><MoreHorizontal size={22} strokeWidth={2} color="#94a3b8" /></div>
            <span className="nav-tab-label">More</span>
          </button>
        </div>
        <div className="home-indicator-bar"></div>
      </nav>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  History as HistoryIcon,
  HelpCircle, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown,
  X, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Home as HomeIcon,
  BookOpen,
  PieChart,
  MoreHorizontal
} from 'lucide-react';
import ExploreInvestmentsScreen from './ExploreInvestmentsScreen';
import InvestmentDetailsScreen from './InvestmentDetailsScreen';
import PlantGrowthAnimation from './PlantGrowthAnimation';
import PortfolioDonutChart from './PortfolioDonutChart';

// Initial Demo Portfolio Data
const DEMO_HOLDINGS = [
  {
    id: 'h1',
    category: 'mutual_funds',
    categoryLabel: 'Mutual funds',
    name: 'Index fund',
    subname: 'Mutual fund',
    amount: 7470,
    invested: 7200,
    gain: 270,
    gainPercent: 3.75,
    icon: './assets/portfolio/icon_index_fund.png',
    color: '#A78BFA', // Lavender
    lastValued: 'Today, 3:30 PM (NAV updated daily)'
  },
  {
    id: 'h2',
    category: 'fixed_deposit',
    categoryLabel: 'Fixed deposit',
    name: 'Bank deposit',
    subname: 'Fixed deposit',
    amount: 3112,
    invested: 3000,
    gain: 112,
    gainPercent: 3.73,
    icon: './assets/portfolio/icon_bank_deposit.png',
    color: '#60A5FA', // Blue
    lastValued: 'Accrued to date (Reported current value, not future maturity)'
  },
  {
    id: 'h3',
    category: 'gold',
    categoryLabel: 'Gold',
    name: 'Gold holding',
    subname: 'Gold',
    amount: 1868,
    invested: 1800,
    gain: 68,
    gainPercent: 3.78,
    icon: './assets/portfolio/icon_gold_holding.png',
    color: '#FDBA74', // Peach/amber
    lastValued: 'Live market rate (99.9% 24K purity)'
  }
];

const CATEGORIES = [
  { id: 'mutual_funds', label: 'Mutual funds', amount: 7470, percentage: 60, color: '#A78BFA' },
  { id: 'fixed_deposit', label: 'Fixed deposit', amount: 3112, percentage: 25, color: '#60A5FA' },
  { id: 'gold', label: 'Gold', amount: 1868, percentage: 15, color: '#FDBA74' }
];

export default function PortfolioScreen({ 
  onNavigateTab, 
  gullakBalance = 928, 
  investedAmount = 12000,
  isActive = true,
  // Developer prop to simulate loading failure or empty state if needed
  initialLoadState = null // 'loading' | 'invested' | 'empty' | 'error'
}) {
  // Opening flow state machine: 'loading' -> 'invested' | 'empty' | 'error'
  // Has cached data state: once fetched, subsequent visits show immediately
  const [loadStatus, setLoadStatus] = useState(() => {
    if (initialLoadState) return initialLoadState;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stateParam = params.get('portfolioState');
      if (stateParam && ['loading', 'invested', 'empty', 'error'].includes(stateParam)) {
        return stateParam;
      }
      if (window.__MUNSHIJI_PORTFOLIO_CACHE__) {
        return 'invested';
      }
    }
    return 'loading';
  });

  // Selected filter category ('all' | 'mutual_funds' | 'fixed_deposit' | 'gold')
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Sub-screens & modals
  const [selectedHoldingId, setSelectedHoldingId] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('holdingId') || null;
    }
    return null;
  });
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHoldingDetail, setSelectedHoldingDetail] = useState(null);
  const [fadeTransition, setFadeTransition] = useState(false);

  const fetchTimerRef = useRef(null);

  // Reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Concurrent data fetching on mount when in 'loading' state
  useEffect(() => {
    if (loadStatus !== 'loading') return;

    // Simulate concurrent live portfolio fetch
    // Transition within ~1200ms once data is retrieved
    fetchTimerRef.current = setTimeout(() => {
      // Fade out loading screen smoothly over 250ms
      setFadeTransition(true);
      setTimeout(() => {
        setLoadStatus('invested');
        setFadeTransition(false);
        if (typeof window !== 'undefined') {
          window.__MUNSHIJI_PORTFOLIO_CACHE__ = true;
        }
      }, 250);
    }, 1200);

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, [loadStatus]);

  // Handle retry from error state
  const handleRetry = () => {
    setLoadStatus('loading');
  };

  const handleOpenExplore = () => {
    setIsExploreOpen(true);
  };

  const handleOpenIntroLesson = () => {
    if (onNavigateTab) onNavigateTab('learn');
  };

  const handleOpenGullak = () => {
    if (onNavigateTab) onNavigateTab('gullak');
  };

  // If user navigated into "Investment details"
  if (selectedHoldingId) {
    return (
      <InvestmentDetailsScreen 
        holdingId={selectedHoldingId}
        onBack={() => setSelectedHoldingId(null)}
        onNavigateTab={(tab) => {
          setSelectedHoldingId(null);
          if (onNavigateTab) onNavigateTab(tab);
        }}
      />
    );
  }

  // If user navigated into "Explore investments"
  if (isExploreOpen) {
    return (
      <ExploreInvestmentsScreen 
        onBack={() => setIsExploreOpen(false)}
        onNavigateTab={(tab) => {
          setIsExploreOpen(false);
          if (onNavigateTab) onNavigateTab(tab);
        }}
      />
    );
  }

  // Filtered holdings list
  const filteredHoldings = selectedCategory
    ? DEMO_HOLDINGS.filter(h => h.category === selectedCategory)
    : DEMO_HOLDINGS;

  // Selected category info for text announcement
  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="portfolio-screen-container">
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

      {/* Scrollable Screen Content */}
      <div className="portfolio-content-body">
        {/* Top Header Section (Consistently stationary across states) */}
        <header className="portfolio-header">
          <div className="portfolio-header-text">
            <h1 className="portfolio-title">Portfolio</h1>
            <p className="portfolio-subtitle">Your investments, in one place.</p>
          </div>
          <div className="portfolio-header-actions">
            {loadStatus === 'invested' && (
              <button 
                className="portfolio-icon-btn"
                onClick={() => setIsHistoryOpen(true)}
                aria-label="Transaction history"
              >
                <HistoryIcon size={22} color="#0f172a" strokeWidth={2} />
              </button>
            )}
            <button 
              className="portfolio-icon-btn"
              onClick={() => setIsHelpOpen(true)}
              aria-label="About your portfolio"
            >
              <HelpCircle size={22} color="#0f172a" strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* STATE 1: LOADING STATE (Plant + Skeletons + Dots)              */}
        {/* ------------------------------------------------------------- */}
        {loadStatus === 'loading' && (
          <div className={`portfolio-state-flow ${fadeTransition ? 'fade-out' : ''}`}>
            {/* Top Skeleton Summary Card */}
            <section className="portfolio-skeleton-card">
              <div className="skeleton-bar short shimmer"></div>
              <div className="skeleton-bar large shimmer"></div>
              <div className="skeleton-bottom-row">
                <div className="skeleton-bar medium shimmer"></div>
                <div className="skeleton-bar medium shimmer"></div>
              </div>
            </section>

            {/* Central Animated Plant */}
            <div className="portfolio-loading-plant-area">
              <PlantGrowthAnimation isActive={isActive} />
            </div>

            {/* Loading text and 3 gentle pulsing dots */}
            <div className="portfolio-loading-text-area">
              <h2 className="portfolio-loading-title">Gathering your investments…</h2>
              <p className="portfolio-loading-subtitle">Your portfolio will appear here.</p>
              
              <div className="portfolio-pulsing-dots" aria-label="Loading data">
                <span className="pulse-dot dot-1"></span>
                <span className="pulse-dot dot-2"></span>
                <span className="pulse-dot dot-3"></span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 2: ERROR STATE (With Retry)                             */}
        {/* ------------------------------------------------------------- */}
        {loadStatus === 'error' && (
          <div className="portfolio-error-state">
            <div className="portfolio-error-box">
              <AlertCircle size={32} color="#ef4444" strokeWidth={2} />
              <h3 className="portfolio-error-title">Couldn’t load your portfolio</h3>
              <p className="portfolio-error-desc">Please check your connection and try again.</p>
              <button className="portfolio-retry-action-btn" onClick={handleRetry}>
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 3: INVESTED STATE DASHBOARD                             */}
        {/* ------------------------------------------------------------- */}
        {loadStatus === 'invested' && (
          <div className="portfolio-invested-dashboard animate-enter">


            {/* Main Current Value & Performance Summary Card */}
            <section className="portfolio-invested-card">
              <div className="invested-card-top">
                <span className="invested-card-label">Current value</span>
                <div className="invested-card-amount">₹12,450</div>
              </div>

              <div className="invested-card-divider"></div>

              <div className="invested-card-bottom-row">
                <div className="invested-stat-col">
                  <span className="invested-stat-label">Invested</span>
                  <span className="invested-stat-val">₹12,000</span>
                </div>
                <div className="invested-stat-col text-right">
                  <span className="invested-stat-label">Total gain</span>
                  <span className="invested-stat-val gain">+₹450 (3.75%)</span>
                </div>
              </div>
            </section>

            {/* Allocation Section */}
            <section className="portfolio-allocation-section">
              <h2 className="portfolio-section-title">Your allocation</h2>

              <div className="portfolio-allocation-card">
                {/* Real SVG Donut Chart */}
                <PortfolioDonutChart 
                  data={CATEGORIES}
                  totalValue={12450}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(catId) => setSelectedCategory(prev => prev === catId ? null : catId)}
                  holdingsCount={filteredHoldings.length}
                />

                {/* Donut Legend */}
                <div className="portfolio-legend-list">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const isDimmed = selectedCategory && !isSelected;

                    return (
                      <div 
                        key={cat.id}
                        className={`portfolio-legend-item ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}`}
                        onClick={() => setSelectedCategory(prev => prev === cat.id ? null : cat.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${cat.label}: ₹${cat.amount.toLocaleString('en-IN')} (${cat.percentage}%)`}
                      >
                        <div className="legend-dot" style={{ backgroundColor: cat.color }}></div>
                        <div className="legend-text-col">
                          <span className="legend-label">{cat.label}</span>
                          <div className="legend-val-row">
                            <span className="legend-amount">₹{cat.amount.toLocaleString('en-IN')}</span>
                            <span className="legend-pct">({cat.percentage}%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Category Filter Feedback */}
              {selectedCategory && (
                <div className="portfolio-active-filter-bar">
                  <span>Filtered by: <strong>{activeCategoryObj?.label}</strong></span>
                  <button 
                    className="portfolio-clear-filter-btn"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Show all
                  </button>
                </div>
              )}
            </section>

            {/* Your Investments Holdings List */}
            <section className="portfolio-holdings-section">
              <div className="portfolio-holdings-header">
                <h2 className="portfolio-section-title">Your investments</h2>

                {/* Filter Dropdown */}
                <div className="portfolio-filter-dropdown-container">
                  <button 
                    className="portfolio-filter-btn"
                    onClick={() => setIsFilterDropdownOpen(prev => !prev)}
                    aria-expanded={isFilterDropdownOpen}
                  >
                    <span>{selectedCategory ? activeCategoryObj?.label : 'All'}</span>
                    <ChevronDown size={16} />
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="portfolio-filter-menu">
                      <button 
                        className={`filter-menu-item ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => { setSelectedCategory(null); setIsFilterDropdownOpen(false); }}
                      >
                        All
                      </button>
                      {CATEGORIES.map(c => (
                        <button 
                          key={c.id}
                          className={`filter-menu-item ${selectedCategory === c.id ? 'active' : ''}`}
                          onClick={() => { setSelectedCategory(c.id); setIsFilterDropdownOpen(false); }}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Holdings Rows */}
              <div className="portfolio-holdings-list">
                {filteredHoldings.map((item) => (
                  <div 
                    key={item.id}
                    className="portfolio-holding-row"
                    onClick={() => setSelectedHoldingId(item.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.name}, ${item.subname}, current value ₹${item.amount.toLocaleString('en-IN')}`}
                  >
                    <div className="holding-row-left">
                      <div className="holding-icon-wrap">
                        <img 
                          src={item.icon} 
                          alt="" 
                          aria-hidden="true" 
                          className="holding-icon-img"
                        />
                      </div>
                      <div className="holding-info">
                        <span className="holding-name">{item.name}</span>
                        <span className="holding-sub">{item.subname}</span>
                      </div>
                    </div>

                    <div className="holding-row-right">
                      <span className="holding-val">₹{item.amount.toLocaleString('en-IN')}</span>
                      <ChevronRight size={18} color="#94a3b8" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Primary CTA Button: Explore investments -> */}
            <button 
              className="portfolio-explore-btn"
              onClick={handleOpenExplore}
            >
              <span>Explore investments</span>
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>

            {/* Gullak Savings Card (Separate from investment totals) */}
            <div 
              className="portfolio-option-card gullak-card"
              onClick={handleOpenGullak}
              role="button"
              tabIndex={0}
            >
              <div className="portfolio-option-left">
                <img 
                  src="./assets/portfolio/gullak_elephant_exact.png" 
                  alt="Your Gullak" 
                  className="portfolio-option-img elephant"
                />
                <div className="portfolio-option-text">
                  <span className="portfolio-gullak-label">Your Gullak</span>
                  <span className="portfolio-gullak-balance">₹{gullakBalance.toLocaleString('en-IN')}</span>
                  <span className="portfolio-gullak-sub">Separate from investments</span>
                </div>
              </div>
              <ChevronRight size={19} color="#64748b" strokeWidth={2} />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 4: EMPTY STATE (Plant + Start small)                     */}
        {/* ------------------------------------------------------------- */}
        {loadStatus === 'empty' && (
          <div className="portfolio-empty-dashboard animate-enter">
            {/* Investment Summary Card (Total invested ₹0 with 3D Pie Chart) */}
            <section className="portfolio-summary-card">
              <div className="portfolio-summary-info">
                <span className="portfolio-summary-label">Total invested</span>
                <div className="portfolio-summary-amount">₹0</div>
                <span className="portfolio-summary-sub">No investments yet</span>
              </div>
              <div className="portfolio-summary-art">
                <img 
                  src="./assets/portfolio/pie_chart_clean.png" 
                  alt="" 
                  aria-hidden="true" 
                  className="portfolio-pie-img"
                />
              </div>
            </section>

            {/* Plant Growth Illustration Stage */}
            <PlantGrowthAnimation isActive={isActive && !isExploreOpen} />

            {/* Action Section */}
            <section className="portfolio-action-section">
              <h2 className="portfolio-action-heading">Start small. Grow at your pace.</h2>
              <p className="portfolio-action-subheading">Understand your options before you begin.</p>

              <button className="portfolio-explore-btn" onClick={handleOpenExplore}>
                <span>Explore investments</span>
                <ArrowRight size={17} strokeWidth={2.4} />
              </button>

              <div className="portfolio-option-card" onClick={handleOpenIntroLesson} role="button" tabIndex={0}>
                <div className="portfolio-option-left">
                  <img src="./assets/portfolio/books_clean.png" alt="" aria-hidden="true" className="portfolio-option-img books" />
                  <div className="portfolio-option-text">
                    <span className="portfolio-option-title">New to investing?</span>
                    <span className="portfolio-option-sub">Learn the basics</span>
                  </div>
                </div>
                <ChevronRight size={19} color="#64748b" strokeWidth={2} />
              </div>

              <div className="portfolio-option-card gullak-card" onClick={handleOpenGullak} role="button" tabIndex={0}>
                <div className="portfolio-option-left">
                  <img src="./assets/portfolio/gullak_elephant_exact.png" alt="Your Gullak" className="portfolio-option-img elephant" />
                  <div className="portfolio-option-text">
                    <span className="portfolio-gullak-label">Your Gullak</span>
                    <span className="portfolio-gullak-balance">₹{gullakBalance.toLocaleString('en-IN')}</span>
                    <span className="portfolio-gullak-sub">Separate from investments</span>
                  </div>
                </div>
                <ChevronRight size={19} color="#64748b" strokeWidth={2} />
              </div>
            </section>
          </div>
        )}
      </div>

      {/* DISMISSIBLE HOLDING DETAILS SHEET */}
      {selectedHoldingDetail && (
        <div className="portfolio-sheet-backdrop" onClick={() => setSelectedHoldingDetail(null)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>
            <div className="portfolio-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={selectedHoldingDetail.icon} 
                  alt="" 
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
                />
                <h3 className="portfolio-sheet-title">{selectedHoldingDetail.name}</h3>
              </div>
              <button 
                className="portfolio-sheet-close"
                onClick={() => setSelectedHoldingDetail(null)}
                aria-label="Close"
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="portfolio-holding-details-body">
              <div className="holding-detail-metric-row">
                <div className="holding-detail-stat">
                  <span className="detail-stat-label">Current Value</span>
                  <span className="detail-stat-val">₹{selectedHoldingDetail.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="holding-detail-stat">
                  <span className="detail-stat-label">Invested Amount</span>
                  <span className="detail-stat-val">₹{selectedHoldingDetail.invested.toLocaleString('en-IN')}</span>
                </div>
                <div className="holding-detail-stat">
                  <span className="detail-stat-label">Gain / Return</span>
                  <span className="detail-stat-val gain">+{selectedHoldingDetail.gainPercent}%</span>
                </div>
              </div>

              <div className="holding-valuation-badge">
                <span className="valuation-dot"></span>
                <span>Valuation basis: {selectedHoldingDetail.lastValued}</span>
              </div>
            </div>

            <button 
              className="portfolio-sheet-btn"
              onClick={() => setSelectedHoldingDetail(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DISMISSIBLE HISTORY SHEET */}
      {isHistoryOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsHistoryOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>
            <div className="portfolio-sheet-header">
              <h3 className="portfolio-sheet-title">Investment History</h3>
              <button className="portfolio-sheet-close" onClick={() => setIsHistoryOpen(false)} aria-label="Close">
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div className="portfolio-history-list">
              <div className="history-item">
                <div className="history-item-left">
                  <span className="history-item-title">Index fund purchase</span>
                  <span className="history-item-date">12 Oct 2026 • Confirmed</span>
                </div>
                <span className="history-item-amount">+₹2,000</span>
              </div>
              <div className="history-item">
                <div className="history-item-left">
                  <span className="history-item-title">Fixed deposit created</span>
                  <span className="history-item-date">01 Oct 2026 • 1 Year tenure</span>
                </div>
                <span className="history-item-amount">+₹3,000</span>
              </div>
              <div className="history-item">
                <div className="history-item-left">
                  <span className="history-item-title">Digital Gold accumulated</span>
                  <span className="history-item-date">24 Sep 2026 • Confirmed</span>
                </div>
                <span className="history-item-amount">+₹1,800</span>
              </div>
            </div>
            <button className="portfolio-sheet-btn" onClick={() => setIsHistoryOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* DISMISSIBLE HELP SHEET: "Understanding your figures" */}
      {isHelpOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsHelpOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>
            <div className="portfolio-sheet-header">
              <h3 className="portfolio-sheet-title">Understanding your figures</h3>
              <button className="portfolio-sheet-close" onClick={() => setIsHelpOpen(false)} aria-label="Close">
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div className="portfolio-help-content">
              <div className="help-term">
                <strong>Current value:</strong> The latest valuation of your confirmed holdings across mutual funds, fixed deposits, and gold.
              </div>
              <div className="help-term">
                <strong>Invested:</strong> Total principal amount you contributed.
              </div>
              <div className="help-term">
                <strong>Total gain:</strong> The difference between your current value and net invested amount.
              </div>
              <div className="help-term">
                <strong>Gullak:</strong> Emergency & short-term savings, tracked completely separately from market investments.
              </div>
            </div>
            <button className="portfolio-sheet-btn" onClick={() => setIsHelpOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation (Portfolio tab selected) */}
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
          <button className="nav-tab-item active" onClick={() => onNavigateTab && onNavigateTab('portfolio')}>
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

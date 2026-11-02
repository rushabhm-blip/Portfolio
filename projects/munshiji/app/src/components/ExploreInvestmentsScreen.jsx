import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  HelpCircle,
  AlertTriangle,
  Clock,
  Percent,
  Sparkles,
  BookOpen,
  Home as HomeIcon,
  PieChart,
  MoreHorizontal
} from 'lucide-react';

const INTRO_DETAILS = {
  mutual_funds: {
    title: 'Mutual funds',
    subtitle: 'Invest in a mix of assets.',
    badge: 'Market-linked',
    icon: './assets/portfolio/pie_chart_clean.png',
    badgeClass: 'badge-purple',
    howItWorks: 'Pooled money from multiple investors is invested across a diversified basket of stocks, bonds, or commodities managed by a professional fund manager.',
    risks: 'Returns are market-linked and fluctuate based on market conditions. Capital is not guaranteed and can go up or down.',
    costs: 'An annual Expense Ratio (typically 0.1% to 2%) is deducted automatically to cover fund management and operations.',
    withdrawals: 'Open-ended funds can be redeemed on any business day. Certain categories (like ELSS tax savers) have a mandatory 3-year lock-in, and short-term redemptions may incur an exit load.'
  },
  fixed_deposits: {
    title: 'Fixed deposits',
    subtitle: 'Save for a chosen period.',
    badge: 'Fixed rate • lock-in may apply',
    icon: './assets/portfolio/safe_clean.png',
    badgeClass: 'badge-blue',
    howItWorks: 'You deposit a lump sum amount with a bank or regulated financial institution for a fixed tenure at a predetermined, guaranteed interest rate.',
    risks: 'Very low risk. In India, bank deposits are insured up to ₹5,00,000 per depositor per bank by DICGC.',
    costs: 'No entry or account fee. Interest earned is added to your income and taxed according to your applicable income tax slab (TDS may apply).',
    withdrawals: 'You can withdraw before maturity, but premature withdrawals usually incur a small interest rate penalty (e.g. 0.5%–1%). Tax-saving FDs are locked for 5 years.'
  },
  gold: {
    title: 'Gold',
    subtitle: 'Understand ways to own gold.',
    badge: 'Prices can rise or fall',
    icon: './assets/portfolio/gold_clean.png',
    badgeClass: 'badge-amber',
    howItWorks: 'Gold can be owned physically (coins/bars), digitally via gold apps, through Gold Exchange Traded Funds (ETFs), or Sovereign Gold Bonds (SGBs).',
    risks: 'Gold does not generate interest or dividends; its value depends on global supply, inflation, and currency movements.',
    costs: 'Physical gold involves making charges and safe storage. Digital gold and ETFs incur minor spread and expense ratios. GST applies on physical purchases.',
    withdrawals: 'Gold ETFs can be sold on market days. SGBs have an 8-year maturity with early redemption windows starting from the 5th year. Physical gold can be sold to jewelers.'
  },
  risk_return: {
    title: 'Risk and return',
    subtitle: 'Learn the fundamentals before investing.',
    badge: 'Educational Activity',
    icon: './assets/portfolio/books_clean.png',
    badgeClass: 'badge-purple',
    howItWorks: 'Risk and return are closely linked. Generally, investments offering higher potential growth come with higher short-term fluctuations and chance of loss.',
    risks: 'Taking too much risk can lead to panic selling, while taking too little risk can cause your savings to lose purchasing power against inflation.',
    costs: 'Zero financial cost. Learning the basics saves you from expensive mistakes.',
    withdrawals: 'Matching your investment horizon with the right asset class ensures you never need to sell volatile assets at a temporary low.'
  }
};

import MutualFundsScreen from './MutualFundsScreen';

export default function ExploreInvestmentsScreen({ onBack, onNavigateTab }) {
  // Navigation to sub-screen
  const [activeSubScreen, setActiveSubScreen] = useState(null); // 'mutual_funds' | null
  // Modal state for active investment introduction
  const [selectedIntroKey, setSelectedIntroKey] = useState(null);
  const [comingSoonSheet, setComingSoonSheet] = useState(null);

  const selectedIntro = selectedIntroKey ? INTRO_DETAILS[selectedIntroKey] : null;

  const handleCardClick = (key) => {
    if (key === 'mutual_funds') {
      setActiveSubScreen('mutual_funds');
    } else {
      setSelectedIntroKey(key);
    }
  };

  const handleActionClick = () => {
    // Show explicit coming soon sheet without simulating purchases or changing balances
    setComingSoonSheet({
      title: `${selectedIntro?.title || 'Investment'} Options`,
      body: `Direct integration for ${selectedIntro?.title.toLowerCase()} is rolling out soon. In the meantime, explore introductory lessons in the Learn tab.`
    });
  };

  // If user navigated into Mutual funds introduction screen
  if (activeSubScreen === 'mutual_funds') {
    return (
      <MutualFundsScreen
        onBack={() => setActiveSubScreen(null)}
        onNavigateTab={(tab) => {
          setActiveSubScreen(null);
          if (onNavigateTab) onNavigateTab(tab);
        }}
      />
    );
  }

  return (
    <div className="explore-invest-container">
      {/* Top Header Bar */}
      <header className="explore-invest-top-bar">
        <button 
          className="explore-invest-back-btn" 
          onClick={onBack}
          aria-label="Back to Portfolio"
        >
          <ArrowLeft size={22} color="#0f172a" strokeWidth={2.4} />
        </button>
        <h1 className="explore-invest-top-title">Explore investments</h1>
      </header>

      {/* Scrollable Body */}
      <div className="explore-invest-content-body">
        {/* Title Section */}
        <section className="explore-invest-header-section">
          <h2 className="explore-invest-heading">Understand before you invest.</h2>
          <p className="explore-invest-subheading">Choose an option to learn more.</p>
        </section>

        {/* 4 Pastel Cards */}
        <div className="explore-invest-cards-list">
          {/* Card 1: Mutual funds */}
          <div 
            className="explore-invest-card card-mutual-funds"
            onClick={() => handleCardClick('mutual_funds')}
            role="button"
            tabIndex={0}
            aria-label="Mutual funds. Invest in a mix of assets. Market-linked."
          >
            <div className="explore-card-left">
              <div className="explore-card-art">
                <img 
                  src="./assets/portfolio/pie_chart_clean.png" 
                  alt="" 
                  aria-hidden="true" 
                  className="explore-card-img pie"
                />
              </div>
              <div className="explore-card-info">
                <h3 className="explore-card-title">Mutual funds</h3>
                <p className="explore-card-desc">Invest in a mix of assets.</p>
                <div className="explore-card-badge badge-purple">Market-linked</div>
              </div>
            </div>
            <ChevronRight size={20} color="#64748b" strokeWidth={2} className="explore-card-chevron" />
          </div>

          {/* Card 2: Fixed deposits */}
          <div 
            className="explore-invest-card card-fixed-deposits"
            onClick={() => handleCardClick('fixed_deposits')}
            role="button"
            tabIndex={0}
            aria-label="Fixed deposits. Save for a chosen period. Fixed rate lock-in may apply."
          >
            <div className="explore-card-left">
              <div className="explore-card-art">
                <img 
                  src="./assets/portfolio/safe_clean.png" 
                  alt="" 
                  aria-hidden="true" 
                  className="explore-card-img safe"
                />
              </div>
              <div className="explore-card-info">
                <h3 className="explore-card-title">Fixed deposits</h3>
                <p className="explore-card-desc">Save for a chosen period.</p>
                <div className="explore-card-badge badge-blue">Fixed rate • lock-in may apply</div>
              </div>
            </div>
            <ChevronRight size={20} color="#64748b" strokeWidth={2} className="explore-card-chevron" />
          </div>

          {/* Card 3: Gold */}
          <div 
            className="explore-invest-card card-gold"
            onClick={() => handleCardClick('gold')}
            role="button"
            tabIndex={0}
            aria-label="Gold. Understand ways to own gold. Prices can rise or fall."
          >
            <div className="explore-card-left">
              <div className="explore-card-art">
                <img 
                  src="./assets/portfolio/gold_clean.png" 
                  alt="" 
                  aria-hidden="true" 
                  className="explore-card-img gold"
                />
              </div>
              <div className="explore-card-info">
                <h3 className="explore-card-title">Gold</h3>
                <p className="explore-card-desc">Understand ways to own gold.</p>
                <div className="explore-card-badge badge-amber">Prices can rise or fall</div>
              </div>
            </div>
            <ChevronRight size={20} color="#64748b" strokeWidth={2} className="explore-card-chevron" />
          </div>

          {/* Card 4: Not sure where to begin? */}
          <div 
            className="explore-invest-card card-learn"
            onClick={() => handleCardClick('risk_return')}
            role="button"
            tabIndex={0}
            aria-label="Not sure where to begin? Learn risk and return."
          >
            <div className="explore-card-left">
              <div className="explore-card-art">
                <img 
                  src="./assets/portfolio/books_clean.png" 
                  alt="" 
                  aria-hidden="true" 
                  className="explore-card-img books"
                />
              </div>
              <div className="explore-card-info">
                <h3 className="explore-card-title learn-title">Not sure where to begin?</h3>
                <p className="explore-card-desc learn-desc">Learn risk and return</p>
              </div>
            </div>
            <ChevronRight size={20} color="#64748b" strokeWidth={2} className="explore-card-chevron" />
          </div>
        </div>

        {/* Micro-disclaimer */}
        <p className="explore-invest-disclaimer">
          Compare risks, costs and access to your money.
        </p>
      </div>

      {/* INVESTMENT INTRODUCTION BOTTOM SHEET */}
      {selectedIntro && (
        <div className="portfolio-sheet-backdrop" onClick={() => setSelectedIntroKey(null)}>
          <div className="portfolio-sheet-modal intro-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>
            
            <div className="intro-sheet-header">
              <div className="intro-sheet-header-left">
                <img src={selectedIntro.icon} alt="" className="intro-sheet-icon" />
                <div>
                  <h3 className="intro-sheet-title">{selectedIntro.title}</h3>
                  <div className={`explore-card-badge ${selectedIntro.badgeClass}`}>
                    {selectedIntro.badge}
                  </div>
                </div>
              </div>
              <button 
                className="portfolio-sheet-close"
                onClick={() => setSelectedIntroKey(null)}
                aria-label="Close details"
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="intro-details-scroll">
              {/* How it works */}
              <div className="intro-detail-row">
                <div className="intro-detail-bullet blue">
                  <TrendingUp size={16} color="#2563eb" />
                </div>
                <div>
                  <h4 className="intro-detail-label">How it works</h4>
                  <p className="intro-detail-text">{selectedIntro.howItWorks}</p>
                </div>
              </div>

              {/* Risks */}
              <div className="intro-detail-row">
                <div className="intro-detail-bullet amber">
                  <AlertTriangle size={16} color="#d97706" />
                </div>
                <div>
                  <h4 className="intro-detail-label">Risks</h4>
                  <p className="intro-detail-text">{selectedIntro.risks}</p>
                </div>
              </div>

              {/* Costs */}
              <div className="intro-detail-row">
                <div className="intro-detail-bullet purple">
                  <Percent size={16} color="#7c3aed" />
                </div>
                <div>
                  <h4 className="intro-detail-label">Costs</h4>
                  <p className="intro-detail-text">{selectedIntro.costs}</p>
                </div>
              </div>

              {/* Withdrawals & Lock-ins */}
              <div className="intro-detail-row">
                <div className="intro-detail-bullet green">
                  <Clock size={16} color="#16a34a" />
                </div>
                <div>
                  <h4 className="intro-detail-label">Withdrawal conditions</h4>
                  <p className="intro-detail-text">{selectedIntro.withdrawals}</p>
                </div>
              </div>
            </div>

            <div className="intro-sheet-actions">
              <button 
                className="intro-action-btn primary"
                onClick={handleActionClick}
              >
                <span>View {selectedIntro.title} options</span>
                <ChevronRight size={16} />
              </button>
              <button 
                className="intro-action-btn secondary"
                onClick={() => setSelectedIntroKey(null)}
              >
                Back to Explore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISMISSIBLE COMING SOON SHEET */}
      {comingSoonSheet && (
        <div className="portfolio-sheet-backdrop" onClick={() => setComingSoonSheet(null)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>
            <div className="portfolio-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#7c3aed" />
                <h3 className="portfolio-sheet-title">{comingSoonSheet.title}</h3>
              </div>
              <button 
                className="portfolio-sheet-close"
                onClick={() => setComingSoonSheet(null)}
                aria-label="Close"
              >
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div className="portfolio-coming-badge">Coming Soon</div>
            <p className="portfolio-sheet-body">
              {comingSoonSheet.body}
            </p>
            <button 
              className="portfolio-sheet-btn"
              onClick={() => setComingSoonSheet(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar (Portfolio Tab Active) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-tabs">
          {/* Home */}
          <button 
            className="nav-tab-item"
            onClick={() => onNavigateTab && onNavigateTab('home')}
          >
            <div className="nav-tab-icon">
              <HomeIcon size={22} strokeWidth={1.8} color="#94a3b8" />
            </div>
            <span className="nav-tab-label">Home</span>
          </button>

          {/* Gullak */}
          <button 
            className="nav-tab-item"
            onClick={() => onNavigateTab && onNavigateTab('gullak')}
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
            onClick={() => onNavigateTab && onNavigateTab('learn')}
          >
            <div className="nav-tab-icon">
              <BookOpen size={21} strokeWidth={1.8} color="#94a3b8" />
            </div>
            <span className="nav-tab-label">Learn</span>
          </button>

          {/* Portfolio (Active tab with soft lavender pill highlight) */}
          <button 
            className="nav-tab-item active"
            onClick={() => onNavigateTab && onNavigateTab('portfolio')}
          >
            <div className="portfolio-nav-pill">
              <PieChart size={19} strokeWidth={2.4} color="#0f172a" fill="#0f172a" />
            </div>
            <span className="nav-tab-label active">Portfolio</span>
          </button>

          {/* More */}
          <button 
            className="nav-tab-item"
            onClick={() => onNavigateTab && onNavigateTab('more')}
          >
            <div className="nav-tab-icon">
              <MoreHorizontal size={22} strokeWidth={2} color="#94a3b8" />
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

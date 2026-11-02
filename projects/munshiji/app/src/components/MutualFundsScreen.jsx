import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  X, 
  Check, 
  Home as HomeIcon, 
  BookOpen, 
  PieChart, 
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import MutualFundsCoinAnimation from './MutualFundsCoinAnimation';

export default function MutualFundsScreen({
  onBack,
  onNavigateTab,
  onExploreFundTypes
}) {
  // Accordion open/close states
  const [openAccordion, setOpenAccordion] = useState(null); // 'risk' | 'costs' | 'withdrawals' | null
  // Sheet modal for "How does it work?"
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  // Coming soon sheet fallback for "Explore fund types"
  const [comingSoonSheet, setComingSoonSheet] = useState(null);

  const toggleAccordion = (key) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const handleExploreFundTypes = () => {
    if (onExploreFundTypes) {
      onExploreFundTypes();
    } else {
      setComingSoonSheet({
        title: 'Explore fund types',
        badge: 'Coming soon',
        body: 'Browse large-cap, mid-cap, hybrid and debt funds with personalized comparisons based on your horizon.'
      });
    }
  };

  return (
    <div className="mf-screen-container">
      {/* Top Header Bar */}
      <header className="mf-top-bar">
        <button 
          className="mf-back-btn" 
          onClick={onBack} 
          aria-label="Back to Explore investments"
        >
          <ChevronLeft size={24} color="#0f172a" strokeWidth={2.4} />
        </button>
        <h1 className="mf-top-title">Mutual funds</h1>
      </header>

      {/* Scrollable Content Body */}
      <div className="mf-content-body">
        {/* Lavender Hero Card */}
        <section className="mf-hero-card">
          {/* Animation Container (Stationary basket + coin falling + front rim) */}
          <div className="mf-hero-illustration-area">
            <MutualFundsCoinAnimation isActive={true} />
          </div>

          {/* Hero Headline & Subtitle */}
          <div className="mf-hero-text">
            <h2 className="mf-hero-heading">Many investors. One shared fund.</h2>
            <p className="mf-hero-subheading">
              Your money is pooled and invested across assets.
            </p>
          </div>
        </section>

        {/* "Before you begin" Section */}
        <section className="mf-begin-section">
          <h3 className="mf-begin-title">Before you begin</h3>

          <div className="mf-cards-list">
            {/* 1. Risk Card (Expandable) */}
            <div className={`mf-card ${openAccordion === 'risk' ? 'open' : ''}`}>
              <div 
                className="mf-card-header"
                onClick={() => toggleAccordion('risk')}
                role="button"
                tabIndex={0}
                aria-expanded={openAccordion === 'risk'}
              >
                <div className="mf-card-left">
                  <div className="mf-icon-wrapper">
                    <img 
                      src="./assets/portfolio/icon_risk_shield.png" 
                      alt="" 
                      aria-hidden="true" 
                      className="mf-card-icon"
                    />
                  </div>
                  <div className="mf-card-info">
                    <span className="mf-card-label">Risk</span>
                    <span className="mf-card-desc">Value can rise or fall</span>
                  </div>
                </div>
                <div className="mf-card-arrow">
                  {openAccordion === 'risk' ? (
                    <ChevronUp size={20} color="#0f172a" strokeWidth={2.2} />
                  ) : (
                    <ChevronDown size={20} color="#0f172a" strokeWidth={2.2} />
                  )}
                </div>
              </div>
              {openAccordion === 'risk' && (
                <div className="mf-card-body">
                  <p>Your investment can lose value. Different funds carry different levels of risk.</p>
                </div>
              )}
            </div>

            {/* 2. Costs Card (Expandable) */}
            <div className={`mf-card ${openAccordion === 'costs' ? 'open' : ''}`}>
              <div 
                className="mf-card-header"
                onClick={() => toggleAccordion('costs')}
                role="button"
                tabIndex={0}
                aria-expanded={openAccordion === 'costs'}
              >
                <div className="mf-card-left">
                  <div className="mf-icon-wrapper">
                    <img 
                      src="./assets/portfolio/icon_costs_coins.png" 
                      alt="" 
                      aria-hidden="true" 
                      className="mf-card-icon"
                    />
                  </div>
                  <div className="mf-card-info">
                    <span className="mf-card-label">Costs</span>
                    <span className="mf-card-desc">Check fees and charges</span>
                  </div>
                </div>
                <div className="mf-card-arrow">
                  {openAccordion === 'costs' ? (
                    <ChevronUp size={20} color="#0f172a" strokeWidth={2.2} />
                  ) : (
                    <ChevronDown size={20} color="#0f172a" strokeWidth={2.2} />
                  )}
                </div>
              </div>
              {openAccordion === 'costs' && (
                <div className="mf-card-body">
                  <p>Check ongoing expenses and any charges for withdrawing.</p>
                </div>
              )}
            </div>

            {/* 3. Withdrawals Card (Expandable) */}
            <div className={`mf-card ${openAccordion === 'withdrawals' ? 'open' : ''}`}>
              <div 
                className="mf-card-header"
                onClick={() => toggleAccordion('withdrawals')}
                role="button"
                tabIndex={0}
                aria-expanded={openAccordion === 'withdrawals'}
              >
                <div className="mf-card-left">
                  <div className="mf-icon-wrapper">
                    <img 
                      src="./assets/portfolio/icon_withdrawals_wallet.png" 
                      alt="" 
                      aria-hidden="true" 
                      className="mf-card-icon"
                    />
                  </div>
                  <div className="mf-card-info">
                    <span className="mf-card-label">Withdrawals</span>
                    <span className="mf-card-desc">Rules vary by fund</span>
                  </div>
                </div>
                <div className="mf-card-arrow">
                  {openAccordion === 'withdrawals' ? (
                    <ChevronUp size={20} color="#0f172a" strokeWidth={2.2} />
                  ) : (
                    <ChevronDown size={20} color="#0f172a" strokeWidth={2.2} />
                  )}
                </div>
              </div>
              {openAccordion === 'withdrawals' && (
                <div className="mf-card-body">
                  <p>Check withdrawal timelines and any lock-in before investing.</p>
                </div>
              )}
            </div>

            {/* 4. "How does it work?" Card (Opens dismissible sheet) */}
            <div 
              className="mf-card link-card"
              onClick={() => setIsHowItWorksOpen(true)}
              role="button"
              tabIndex={0}
            >
              <div className="mf-card-header">
                <div className="mf-card-left">
                  <div className="mf-icon-wrapper">
                    <img 
                      src="./assets/portfolio/books_clean.png" 
                      alt="" 
                      aria-hidden="true" 
                      className="mf-card-icon"
                    />
                  </div>
                  <div className="mf-card-info">
                    <span className="mf-card-label">How does it work?</span>
                    <span className="mf-card-desc">See a simple example</span>
                  </div>
                </div>
                <ChevronRight size={20} color="#0f172a" strokeWidth={2.2} />
              </div>
            </div>
          </div>

          {/* Primary CTA Button: Explore fund types > */}
          <button 
            className="mf-explore-btn"
            onClick={handleExploreFundTypes}
          >
            <span>Explore fund types</span>
            <ChevronRight size={19} strokeWidth={2.4} />
          </button>

          {/* Disclaimers caption */}
          <p className="mf-disclaimer-caption">
            Returns are not guaranteed.
          </p>
        </section>
      </div>

      {/* DISMISSIBLE SHEET: "How does it work?" */}
      {isHowItWorksOpen && (
        <div className="portfolio-sheet-backdrop" onClick={() => setIsHowItWorksOpen(false)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>
            <div className="portfolio-sheet-header">
              <h3 className="portfolio-sheet-title">How does it work?</h3>
              <button 
                className="portfolio-sheet-close"
                onClick={() => setIsHowItWorksOpen(false)}
                aria-label="Close"
              >
                <X size={20} color="#64748b" />
              </button>
            </div>
            
            <div className="mf-how-steps">
              <div className="mf-how-step">
                <div className="mf-step-num">1</div>
                <p className="mf-step-text">Investors contribute money to a shared fund.</p>
              </div>
              <div className="mf-how-step">
                <div className="mf-step-num">2</div>
                <p className="mf-step-text">The fund invests according to its strategy.</p>
              </div>
              <div className="mf-how-step">
                <div className="mf-step-num">3</div>
                <p className="mf-step-text">Investors own units whose value can change.</p>
              </div>
            </div>

            <button 
              className="portfolio-sheet-btn"
              onClick={() => setIsHowItWorksOpen(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* DISMISSIBLE SHEET: "Coming soon" fallback for Explore fund types */}
      {comingSoonSheet && (
        <div className="portfolio-sheet-backdrop" onClick={() => setComingSoonSheet(null)}>
          <div className="portfolio-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-sheet-handle"></div>
            <div className="portfolio-sheet-header">
              <h3 className="portfolio-sheet-title">{comingSoonSheet.title}</h3>
              <button 
                className="portfolio-sheet-close"
                onClick={() => setComingSoonSheet(null)}
                aria-label="Close"
              >
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div className="portfolio-coming-badge">{comingSoonSheet.badge}</div>
            <p className="portfolio-sheet-body">{comingSoonSheet.body}</p>
            <button 
              className="portfolio-sheet-btn"
              onClick={() => setComingSoonSheet(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation (Portfolio tab selected) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-tabs">
          <button 
            className="nav-tab-item"
            onClick={() => onNavigateTab && onNavigateTab('home')}
          >
            <div className="nav-tab-icon">
              <HomeIcon size={22} strokeWidth={1.8} color="#94a3b8" />
            </div>
            <span className="nav-tab-label">Home</span>
          </button>

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

          <button 
            className="nav-tab-item"
            onClick={() => onNavigateTab && onNavigateTab('learn')}
          >
            <div className="nav-tab-icon">
              <BookOpen size={21} strokeWidth={1.8} color="#94a3b8" />
            </div>
            <span className="nav-tab-label">Learn</span>
          </button>

          <button 
            className="nav-tab-item active"
            onClick={() => onNavigateTab && onNavigateTab('portfolio')}
          >
            <div className="portfolio-nav-pill">
              <PieChart size={19} strokeWidth={2.4} color="#0f172a" fill="#0f172a" />
            </div>
            <span className="nav-tab-label active">Portfolio</span>
          </button>

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
        <div className="home-indicator-bar"></div>
      </nav>
    </div>
  );
}

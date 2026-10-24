// ==========================================================================
// Sajag Case Study - Interactive Scroll Revealer & Session Persistence
// Strict Requirement: Each reveal plays ONLY ONCE per session.
// ==========================================================================

(function () {
  'use strict';

  try {
    sessionStorage.setItem('portfolio_has_seen_intro', 'true');
  } catch (e) {}

  // Ensure fresh navigation opens at top
  if (!window.location.hash) {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }

  const STORAGE_KEY = 'sajag_revealed_sections';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Retrieve persistent session reveals
  let revealedSet = new Set();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      revealedSet = new Set(JSON.parse(raw));
    }
  } catch (e) {
    console.warn('SessionStorage not available:', e);
  }

  function persistRevealed(id) {
    revealedSet.add(id);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...revealedSet]));
    } catch (e) {}
  }

  function markRevealed(section, id) {
    section.classList.add('is-revealed');
    if (id) {
      persistRevealed(id);
    }
  }

  const isEnteringFromPortfolio = (() => {
    try {
      const flag = sessionStorage.getItem('portfolio_case_study_enter');
      if (flag === 'true') {
        sessionStorage.removeItem('portfolio_case_study_enter');
        return true;
      }
    } catch (e) {}
    return false;
  })();

  function initCaseStudy() {
    const sections = Array.from(document.querySelectorAll('.case-section'));
    if (!sections.length) return;

    // Smooth incoming reveal animation when entering from portfolio thumbnail zoom
    const curtain = document.getElementById('portfolioTransitionCurtain');
    if (isEnteringFromPortfolio && !reducedMotion) {
      if (curtain) {
        // Smoothly fade out the white curtain into the project (reducing opacity to project)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            curtain.style.opacity = '0';
            setTimeout(() => {
              if (curtain.parentNode) curtain.parentNode.removeChild(curtain);
              document.documentElement.classList.remove('is-entering-transition');
            }, 700);
          });
        });
      }

      const heroBlock = document.querySelector('#sec-hero .cs-canvas-block');
      const csHeader = document.querySelector('header.cs-header');
      if (heroBlock) {
        heroBlock.style.opacity = '0';
        heroBlock.style.transform = 'translateY(16px)';
        heroBlock.style.transition = 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            heroBlock.style.opacity = '1';
            heroBlock.style.transform = 'translateY(0)';
          });
        });
      }
      if (csHeader) {
        csHeader.style.opacity = '0';
        csHeader.style.transition = 'opacity 0.45s ease 0.1s';
        requestAnimationFrame(() => {
          csHeader.style.opacity = '1';
        });
      }
    } else if (curtain) {
      curtain.remove();
      document.documentElement.classList.remove('is-entering-transition');
    }

    // 1. If reduced motion is preferred, immediately reveal everything
    if (reducedMotion) {
      sections.forEach((sec) => {
        sec.classList.add('is-revealed');
      });
      return;
    }

    // 2. Immediate reveal for opening section (Section 1) and any already-revealed sections
    sections.forEach((sec, idx) => {
      const id = sec.id || `sec-${idx}`;
      if (idx === 0 || revealedSet.has(id)) {
        markRevealed(sec, id);
      }
    });

    // 3. Fast scroll & initial position check: Any section already within or above the viewport
    const vh = window.innerHeight;
    sections.forEach((sec, idx) => {
      const id = sec.id || `sec-${idx}`;
      if (sec.classList.contains('is-revealed')) return;

      const rect = sec.getBoundingClientRect();
      // If heading is already above 85% of viewport
      if (rect.top <= vh * 0.85) {
        markRevealed(sec, id);
      }
    });

    // 4. Set up IntersectionObserver with threshold at lower 80-85% of viewport
    // rootMargin: '0px 0px -15% 0px' triggers when top enters 85% from top (lower 15%)
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -15% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sec = entry.target;
          const id = sec.id;
          markRevealed(sec, id);
          // Permanently stop observing once revealed!
          obs.unobserve(sec);
        }
      });
    }, observerOptions);

    // Observe unrevealed sections only
    sections.forEach((sec) => {
      if (!sec.classList.contains('is-revealed')) {
        observer.observe(sec);
      }
    });

    // 5. If landing via anchor hash (e.g. #sec-interactive-demo), reveal target and scroll
    if (window.location.hash) {
      try {
        const hashEl = document.querySelector(window.location.hash);
        if (hashEl) {
          markRevealed(hashEl, hashEl.id);
          requestAnimationFrame(() => {
            setTimeout(() => {
              hashEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 120);
          });
        }
      } catch (err) {}
    }

    // ========================================================================
    // Minimal Dot Section Navigator (All 18 Editorial Headings & Rolling Wheel)
    // ========================================================================
    const dotNav = document.getElementById('csDotNav');
    const dotItems = Array.from(document.querySelectorAll('.cs-dot-item'));
    const dotLinks = Array.from(document.querySelectorAll('.cs-dot-link'));

    let currentSectionIndex = 0;
    let rollTimeout = null;

    // Trigger subtle rolling animation along shallow elliptical path
    function triggerRolling(direction) {
      if (reducedMotion || !dotNav) return;
      if (dotNav.matches(':hover') || dotNav.matches(':focus-within')) return;

      // Handle fast scrolling by smoothly transitioning to latest state instead of queuing
      dotNav.classList.remove('is-rolling-down', 'is-rolling-up');
      if (rollTimeout) {
        clearTimeout(rollTimeout);
        rollTimeout = null;
      }

      // Force reflow so rapid triggers restart cleanly
      void dotNav.offsetWidth;

      const animClass = direction === 'down' ? 'is-rolling-down' : 'is-rolling-up';
      dotNav.classList.add(animClass);

      rollTimeout = setTimeout(() => {
        dotNav.classList.remove('is-rolling-down', 'is-rolling-up');
        rollTimeout = null;
      }, 350);
    }

    function setActiveSection(newIndex, triggerAnimation = true) {
      if (newIndex < 0 || newIndex >= dotItems.length) return;

      const previousIndex = currentSectionIndex;
      const changed = newIndex !== previousIndex;

      currentSectionIndex = newIndex;

      dotItems.forEach((item, idx) => {
        const isActive = idx === newIndex;
        item.classList.toggle('is-active', isActive);
        const link = item.querySelector('.cs-dot-link');
        if (link) {
          if (isActive) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        }
      });

      if (changed && triggerAnimation) {
        const direction = newIndex > previousIndex ? 'down' : 'up';
        triggerRolling(direction);
      }
    }

    function updateActiveDot() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const vh = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY < 180) {
        setActiveSection(0);
        return;
      }

      if (scrollY + vh >= docHeight - 80) {
        setActiveSection(dotItems.length - 1);
        return;
      }

      const triggerPoint = scrollY + (vh * 0.38);
      let activeIdx = 0;

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (sec.offsetTop <= triggerPoint) {
          activeIdx = i;
        } else {
          break;
        }
      }

      setActiveSection(activeIdx);
    }

    // Dot click jump handler: stationary click targets & smooth scroll accounting for fixed header
    dotLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').replace('#', '');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const item = link.closest('.cs-dot-item');
          const idx = parseInt(item.dataset.index, 10);
          setActiveSection(idx, true);
          const headerOffset = 70;
          const targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: reducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });

    // Initial dot check (no entrance roll)
    setActiveSection(0, false);
    updateActiveDot();

    // Fast-scroll safety check during continuous scrolling
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(() => {
          const currentVh = window.innerHeight;
          sections.forEach((sec) => {
            if (!sec.classList.contains('is-revealed')) {
              const rect = sec.getBoundingClientRect();
              if (rect.top <= currentVh * 0.85) {
                markRevealed(sec, sec.id);
                observer.unobserve(sec);
              }
            }
          });
          updateActiveDot();
          scrollTicking = false;
        });
      }
    }, { passive: true });

    // Handle "Back to projects" links
    const backLinks = document.querySelectorAll('.cs-back-link, .cs-return-btn');
    backLinks.forEach((link) => {
      link.addEventListener('click', () => {
        // Return destination is handled via standard href (/#projects)
      });
    });

    // Handle "rushabh." logo and "Home" links taking user back to the landing page top
    const landingLinks = document.querySelectorAll('.cs-nav-logo, .cs-nav-link[href*="#home"], .cs-nav-link[href="/"]');
    landingLinks.forEach((link) => {
      link.addEventListener('click', () => {
        try {
          sessionStorage.removeItem('portfolio_return_scroll');
        } catch (e) {}
      });
    });

    // Handle "Back to top" button
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        setActiveSection(0, true);
      });
    }
  }

  window.initSajagCaseStudy = initCaseStudy;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCaseStudy);
  } else {
    initCaseStudy();
  }
})();

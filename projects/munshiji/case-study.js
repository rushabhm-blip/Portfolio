// ==========================================================================
// Munshiji Case Study - Interactive Scroll Revealer & Dynamic Dot Navigation
// ==========================================================================

(function () {
  'use strict';

  try {
    sessionStorage.setItem('portfolio_has_seen_intro', 'true');
  } catch (e) {}

  if (!window.location.hash) {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }

  const STORAGE_KEY = 'munshiji_revealed_sections';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Smooth curtain reveal
    const curtain = document.getElementById('portfolioTransitionCurtain');
    if (isEnteringFromPortfolio && !reducedMotion) {
      if (curtain) {
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

    if (reducedMotion) {
      sections.forEach(sec => sec.classList.add('is-revealed'));
      return;
    }

    sections.forEach((sec, idx) => {
      const id = sec.id || `sec-${idx}`;
      if (idx === 0 || revealedSet.has(id)) {
        markRevealed(sec, id);
      }
    });

    const vh = window.innerHeight;
    sections.forEach((sec, idx) => {
      const id = sec.id || `sec-${idx}`;
      if (sec.classList.contains('is-revealed')) return;
      const rect = sec.getBoundingClientRect();
      if (rect.top <= vh * 0.85) {
        markRevealed(sec, id);
      }
    });

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sec = entry.target;
          markRevealed(sec, sec.id);
          obs.unobserve(sec);
        }
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0 });

    sections.forEach(sec => {
      if (!sec.classList.contains('is-revealed')) {
        observer.observe(sec);
      }
    });

    // ========================================================================
    // Dot Section Navigator Tracking
    // ========================================================================
    const dotItems = Array.from(document.querySelectorAll('.cs-dot-item'));
    const dotLinks = Array.from(document.querySelectorAll('.cs-dot-link'));

    function updateActiveDot() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const midView = scrollY + window.innerHeight * 0.4;

      let activeIndex = 0;
      for (let i = sections.length - 1; i >= 0; i--) {
        const top = sections[i].offsetTop;
        if (midView >= top - 80) {
          activeIndex = i;
          break;
        }
      }

      dotItems.forEach((item, idx) => {
        const isActive = idx === activeIndex;
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
    }

    let isScrolling = false;
    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          updateActiveDot();
          isScrolling = false;
        });
        isScrolling = true;
      }
    }, { passive: true });

    updateActiveDot();

    // Smooth navigation click
    dotLinks.forEach(link => {
      link.addEventListener('click', e => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            markRevealed(targetEl, targetEl.id);
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, null, targetId);
          }
        }
      });
    });

    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, null, '#sec-hero');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCaseStudy);
  } else {
    initCaseStudy();
  }
})();

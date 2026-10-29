// ==========================================================================
// Time Wanderers Case Study - Navigation & ScrollSpy
// ==========================================================================

(function () {
  'use strict';

  try {
    sessionStorage.setItem('portfolio_has_seen_intro', 'true');
  } catch (e) {}

  // Smooth curtain reveal
  const curtain = document.getElementById('portfolioTransitionCurtain');
  if (curtain) {
    requestAnimationFrame(() => {
      curtain.style.opacity = '0';
      setTimeout(() => {
        if (curtain.parentNode) curtain.parentNode.removeChild(curtain);
        document.documentElement.classList.remove('is-entering-transition');
      }, 550);
    });
  }

  // Scroll position handling
  const urlParams = new URLSearchParams(window.location.search);
  const scrollParam = urlParams.get('scroll');
  if (scrollParam) {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    const targetY = parseInt(scrollParam, 10);
    window.scrollTo(0, targetY);
    setTimeout(() => window.scrollTo(0, targetY), 50);
  } else if (!window.location.hash) {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }

  // Initialize navigation & scrollspy
  function initNavigation() {
    const anchors = Array.from(document.querySelectorAll('.cs-section-anchor'));
    const dotItems = Array.from(document.querySelectorAll('.cs-dot-item'));
    const header = document.getElementById('csHeader');

    if (!anchors.length || !dotItems.length) return;

    function getHeaderOffset() {
      return header ? header.offsetHeight + 10 : 70;
    }

    // Scrollspy: update active dot based on current scroll position
    let ticking = false;
    function updateActiveSection() {
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
      const headerOffset = getHeaderOffset();
      const triggerPoint = scrollPos + headerOffset + 80;

      let currentAnchorIndex = 0;
      for (let i = 0; i < anchors.length; i++) {
        const anchor = anchors[i];
        const rect = anchor.getBoundingClientRect();
        const absoluteTop = rect.top + scrollPos;

        if (triggerPoint >= absoluteTop) {
          currentAnchorIndex = i;
        } else {
          break;
        }
      }

      // Check if user is near bottom of page
      if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
        currentAnchorIndex = anchors.length - 1;
      }

      dotItems.forEach((dot, idx) => {
        if (idx === currentAnchorIndex) {
          dot.classList.add('is-active');
          const link = dot.querySelector('.cs-dot-link');
          if (link) link.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('is-active');
          const link = dot.querySelector('.cs-dot-link');
          if (link) link.removeAttribute('aria-current');
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      updateActiveSection();
    }, { passive: true });

    // Smooth click handler for dot navigation
    dotItems.forEach((dot) => {
      const link = dot.querySelector('.cs-dot-link');
      if (!link) return;

      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const headerOffset = getHeaderOffset();
            const rect = target.getBoundingClientRect();
            const targetTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop) - headerOffset;

            window.scrollTo({
              top: Math.max(0, targetTop),
              behavior: 'smooth'
            });

            try {
              history.pushState(null, '', href);
            } catch (err) {}
          }
        }
      });
    });

    // Keyboard navigation (ArrowUp, ArrowDown) to cycle through sections
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        const activeIndex = dotItems.findIndex(d => d.classList.contains('is-active'));
        if (activeIndex >= 0 && activeIndex < anchors.length - 1) {
          e.preventDefault();
          const nextAnchor = anchors[activeIndex + 1];
          const headerOffset = getHeaderOffset();
          const rect = nextAnchor.getBoundingClientRect();
          const targetTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop) - headerOffset;
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        const activeIndex = dotItems.findIndex(d => d.classList.contains('is-active'));
        if (activeIndex > 0) {
          e.preventDefault();
          const prevAnchor = anchors[activeIndex - 1];
          const headerOffset = getHeaderOffset();
          const rect = prevAnchor.getBoundingClientRect();
          const targetTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop) - headerOffset;
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      }
    });

    // Initial update
    setTimeout(updateActiveSection, 150);
  }

  // Back link smooth transition
  const backLink = document.getElementById('headerBackLink');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = backLink.getAttribute('href') || '/#projects';
      document.body.style.transition = 'opacity 0.3s ease';
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 300);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();

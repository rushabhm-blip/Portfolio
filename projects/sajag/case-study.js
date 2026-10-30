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

    // Initialize interactive Design Process section
    initDesignProcessSection();
  }

  // ==========================================================================
  // Design Process Interactive Sticky Transition & Mobile Pan-Zoom
  // ==========================================================================
  function initDesignProcessSection() {
    const section = document.getElementById('sec-process');
    const container = document.getElementById('processInteractiveContainer');
    const stickyStage = document.getElementById('processStickyStage');
    const mediaStage = document.getElementById('processMediaStage');
    const video = document.getElementById('processVideo');
    const playBtn = document.getElementById('processPlayBtn');
    const videoLayer = document.getElementById('processVideoLayer');
    const previewLayer = document.getElementById('processDiagramPreviewLayer');
    const diagramFlow = document.getElementById('processDiagramFlow');
    const headingBlock = document.getElementById('processHeadingBlock');
    const captionBar = document.getElementById('processCaptionBar');
    const captionHint = document.getElementById('processCaptionHint');
    const exploreBtn = document.getElementById('processExploreBtn');
    const zoomBtn = document.getElementById('processZoomBtn');
    const zoomDialog = document.getElementById('processZoomDialog');

    if (!section || !container || !video) return;

    let currentProgress = 0;
    let isIntersecting = false;
    let videoHeight = 674;
    let transitionDist = window.innerHeight * 0.55;
    const headerStickyOffset = 76; // header height (70px) + 6px breathing room

    // 1. Responsive video-height & transition distance updater
    function updateDimensions() {
      const containerWidth = container.clientWidth || 1198;
      // 16:9 ratio
      videoHeight = containerWidth / (16 / 9);
      transitionDist = Math.max(260, window.innerHeight * 0.55);
      container.style.setProperty('--video-height', `${videoHeight.toFixed(2)}px`);
      container.style.setProperty('--transition-distance', `${transitionDist.toFixed(2)}px`);
    }

    updateDimensions();
    window.addEventListener('resize', () => {
      updateDimensions();
      onScroll();
    }, { passive: true });

    // 2. Video playback & Autoplay failure fallback
    function attemptPlay() {
      if (!video) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (playBtn) playBtn.style.display = 'none';
          })
          .catch((err) => {
            console.log('Video autoplay blocked or pending:', err);
            if (playBtn) playBtn.style.display = 'inline-flex';
          });
      }
    }

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = true;
        video.play().then(() => {
          playBtn.style.display = 'none';
        });
      });
    }

    // Video viewport intersection observer (pause when offscreen to save resources)
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isIntersecting = entry.isIntersecting;
            if (isIntersecting && currentProgress < 0.95) {
              attemptPlay();
            } else if (!isIntersecting) {
              if (!video.paused) video.pause();
            }
          });
        },
        { threshold: [0, 0.1, 0.5] }
      );
      videoObserver.observe(section);
    } else {
      attemptPlay();
    }

    // 3. Hover preview on desktop
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (captionHint) {
      captionHint.textContent = hasHover ? 'Scroll or hover to explore' : 'Scroll to explore the process';
    }
    if (hasHover && mediaStage) {
      mediaStage.addEventListener('mouseenter', () => {
        if (currentProgress < 0.08) {
          mediaStage.classList.add('is-hover-previewing');
        }
      });
      mediaStage.addEventListener('mouseleave', () => {
        mediaStage.classList.remove('is-hover-previewing');
      });
    }

    // 4. Scroll Transition Engine
    function onScroll() {
      if (reducedMotion) return;

      const rect = container.getBoundingClientRect();
      const scrollInside = headerStickyOffset - rect.top;

      let progress = 0;
      if (scrollInside <= 0) {
        progress = 0;
      } else if (scrollInside >= transitionDist) {
        progress = 1;
      } else {
        progress = scrollInside / transitionDist;
      }

      currentProgress = progress;

      // When user starts scrolling down, cancel any desktop hover preview override
      if (progress > 0.05 && mediaStage && mediaStage.classList.contains('is-hover-previewing')) {
        mediaStage.classList.remove('is-hover-previewing');
      }

      // Smooth Crossfade:
      // Video layer fades from 1 -> 0
      if (videoLayer) {
        videoLayer.style.opacity = (1 - progress).toFixed(3);
      }

      // Diagram preview fades in from 0 -> 1 and rises by 16px -> 0px
      if (previewLayer) {
        previewLayer.style.opacity = progress.toFixed(3);
        const translateY = ((1 - progress) * 16).toFixed(1);
        previewLayer.style.transform = `translateY(${translateY}px)`;
      }

      // Section heading block above video fades out gently so it doesn't collide with the diagram's internal heading
      if (headingBlock) {
        headingBlock.style.opacity = Math.max(0, 1 - progress * 1.5).toFixed(3);
      }

      // Caption bar fades out quickly
      if (captionBar) {
        const captionOpacity = Math.max(0, 1 - progress * 2.5);
        captionBar.style.opacity = captionOpacity.toFixed(3);
        captionBar.style.pointerEvents = progress > 0.2 ? 'none' : 'auto';
      }

      // Pause/resume video and toggle flow handoff based on progress
      if (progress >= 0.98) {
        if (!video.paused) video.pause();
        if (diagramFlow) diagramFlow.classList.add('is-flow-active');
        if (stickyStage) stickyStage.style.visibility = 'hidden';
      } else {
        if (diagramFlow) diagramFlow.classList.remove('is-flow-active');
        if (stickyStage) stickyStage.style.visibility = 'visible';
        if (previewLayer) {
          previewLayer.style.opacity = progress.toFixed(3);
        }
        if (isIntersecting && video.paused) {
          attemptPlay();
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on init
    onScroll();

    // 5. "Explore full process" button smooth scroll
    if (exploreBtn) {
      exploreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = container.getBoundingClientRect();
        const targetScrollTop = window.pageYOffset + rect.top - headerStickyOffset + transitionDist + 6;
        window.scrollTo({
          top: targetScrollTop,
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
      });
    }

    // 6. Mobile & Accessible Pan-Zoom Dialog
    if (zoomBtn && zoomDialog) {
      const zoomImg = document.getElementById('zoomDialogImg');
      const zoomBody = document.getElementById('zoomDialogBody');
      const closeBtn = document.getElementById('zoomCloseBtn');
      const inBtn = document.getElementById('zoomInBtn');
      const outBtn = document.getElementById('zoomOutBtn');
      const resetBtn = document.getElementById('zoomResetBtn');

      let currentScale = 1;
      const minScale = 0.8;
      const maxScale = 3.5;
      const scaleStep = 0.35;

      function updateZoomTransform() {
        if (zoomImg) {
          zoomImg.style.transform = `scale(${currentScale})`;
        }
      }

      function openZoom() {
        currentScale = 1;
        updateZoomTransform();
        if (typeof zoomDialog.showModal === 'function') {
          zoomDialog.showModal();
        } else {
          zoomDialog.setAttribute('open', '');
        }
        document.body.style.overflow = 'hidden';
      }

      function closeZoom() {
        if (typeof zoomDialog.close === 'function') {
          zoomDialog.close();
        } else {
          zoomDialog.removeAttribute('open');
        }
        document.body.style.overflow = '';
      }

      zoomBtn.addEventListener('click', openZoom);
      if (closeBtn) closeBtn.addEventListener('click', closeZoom);

      zoomDialog.addEventListener('click', (e) => {
        if (e.target === zoomDialog) {
          closeZoom();
        }
      });

      if (inBtn) {
        inBtn.addEventListener('click', () => {
          currentScale = Math.min(maxScale, currentScale + scaleStep);
          updateZoomTransform();
        });
      }

      if (outBtn) {
        outBtn.addEventListener('click', () => {
          currentScale = Math.max(minScale, currentScale - scaleStep);
          updateZoomTransform();
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          currentScale = 1;
          updateZoomTransform();
          if (zoomBody) {
            zoomBody.scrollTop = 0;
            zoomBody.scrollLeft = 0;
          }
        });
      }

      // Wheel zoom inside dialog body
      if (zoomBody) {
        zoomBody.addEventListener('wheel', (e) => {
          if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 20) {
            e.preventDefault();
            const delta = e.deltaY < 0 ? scaleStep : -scaleStep;
            currentScale = Math.min(maxScale, Math.max(minScale, currentScale + delta));
            updateZoomTransform();
          }
        }, { passive: false });
      }
    }
  }

  window.initSajagCaseStudy = initCaseStudy;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCaseStudy);
  } else {
    initCaseStudy();
  }
})();

/**
 * ARSENAL: GSAP MOTION GRAPHICS & SCROLL RECIPES
 * Ready-to-use kinetic typography, ScrollTrigger paired layouts, SVG drawing, and FLIP animations.
 */

export class GsapArsenal {
  /**
   * 1. Kinetic Character Stagger & 3D Text Reveal
   */
  static splitTextReveal(element, options = {}) {
    const { stagger = 0.03, duration = 0.8, delay = 0.1 } = options;
    const text = element.innerText;
    element.innerHTML = '';
    
    // Wrap words & characters in spans
    const chars = text.split('').map(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.transformOrigin = 'bottom center';
      element.appendChild(span);
      return span;
    });

    return gsap.from(chars, {
      y: '120%',
      opacity: 0,
      rotateX: -90,
      stagger,
      duration,
      delay,
      ease: 'power3.out'
    });
  }

  /**
   * 2. Hacker / Cyberpunk Text Scramble Decrypt Animation
   */
  static scrambleText(element, finalString, duration = 1.2) {
    const characters = '!<>-_\\/[]{}—=+*^?#________ABCDEF0123456789';
    let frame = 0;
    const totalFrames = duration * 60;
    
    const update = () => {
      let output = '';
      const progress = frame / totalFrames;
      
      for (let i = 0; i < finalString.length; i++) {
        if (i < Math.floor(progress * finalString.length)) {
          output += finalString[i];
        } else {
          output += characters[Math.floor(Math.random() * characters.length)];
        }
      }
      
      element.textContent = output;
      frame++;
      
      if (frame <= totalFrames) {
        requestAnimationFrame(update);
      } else {
        element.textContent = finalString;
      }
    };
    
    update();
  }

  /**
   * 3. Paired Split-Screen Pinned Layout (ScrollTrigger)
   */
  static initSplitPairLayout(containerSelector, pinnedColumnSelector, scrub = 1.0) {
    if (!window.ScrollTrigger) return;
    
    return ScrollTrigger.create({
      trigger: containerSelector,
      start: "top top+=80",
      end: "bottom bottom",
      pin: pinnedColumnSelector,
      pinSpacing: false,
      scrub: scrub,
      invalidateOnRefresh: true
    });
  }

  /**
   * 4. Horizontal Portfolio Ribbon Scroll (ScrollTrigger)
   */
  static initHorizontalStrip(sectionSelector, trackSelector, scrub = 1.2) {
    if (!window.ScrollTrigger) return;
    const track = document.querySelector(trackSelector);
    if (!track) return;

    const totalDistance = () => track.scrollWidth - window.innerWidth + 100;

    return gsap.to(track, {
      x: () => -totalDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: sectionSelector,
        pin: true,
        scrub: scrub,
        start: "top top",
        end: () => `+=${totalDistance()}`,
        invalidateOnRefresh: true
      }
    });
  }

  /**
   * 5. 3D Card Stacking Deck (ScrollTrigger)
   */
  static initStackingDeck(cardsSelector, scrub = 1.0) {
    if (!window.ScrollTrigger) return;
    const cards = gsap.utils.toArray(cardsSelector);
    
    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        const nextCard = cards[i + 1];
        gsap.to(card, {
          scale: 0.92 - i * 0.02,
          opacity: 0.35,
          y: -25,
          ease: "none",
          scrollTrigger: {
            trigger: nextCard,
            start: "top center+=120",
            end: "top top+=140",
            scrub: scrub
          }
        });
      }
    });
  }

  /**
   * 6. Smooth SVG Path Drawing on Scroll
   */
  static initSvgPathDraw(pathElement, triggerSelector) {
    const length = pathElement.getTotalLength();
    gsap.set(pathElement, {
      strokeDasharray: length,
      strokeDashoffset: length
    });

    return gsap.to(pathElement, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: triggerSelector,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1
      }
    });
  }
}

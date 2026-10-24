/**
 * ARSENAL: CURSOR PHYSICS & INTERACTION MODULE
 * Magnetic pull buttons, lerped cursor trails, and 3D interactive card tilt.
 */

export class PhysicsArsenal {
  /**
   * 1. Magnetic Pull on Hover (Buttons, Badges, Icons)
   */
  static initMagneticElements(selector = '.magnetic', strength = 0.35) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      const onMouseMove = (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;
        
        gsap.to(el, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out'
        });
      };

      const onMouseLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1.2, 0.4)'
        });
      };

      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('mouseleave', onMouseLeave);
    });
  }

  /**
   * 2. 3D Card Perspective Tilt with Specular Glare
   */
  static init3DTiltCards(selector = '.tilt-card', maxAngle = 15) {
    const cards = document.querySelectorAll(selector);

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -maxAngle;
        const rotateY = ((x - centerX) / centerX) * maxAngle;

        gsap.to(card, {
          transformPerspective: 1000,
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.03,
          duration: 0.4,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  /**
   * 3. Fluid Trailing Custom Cursor
   */
  static initSmoothCursor() {
    let dot = document.querySelector('.custom-cursor-dot');
    let ring = document.querySelector('.custom-cursor-ring');

    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'custom-cursor-dot';
      document.body.appendChild(dot);
    }
    if (!ring) {
      ring = document.createElement('div');
      ring.className = 'custom-cursor-ring';
      document.body.appendChild(ring);
    }

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: mouse.x, y: mouse.y };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      gsap.set(dot, { x: mouse.x, y: mouse.y });
    });

    gsap.ticker.add(() => {
      ringPos.x += (mouse.x - ringPos.x) * 0.15;
      ringPos.y += (mouse.y - ringPos.y) * 0.15;
      gsap.set(ring, { x: ringPos.x, y: ringPos.y });
    });
  }
}

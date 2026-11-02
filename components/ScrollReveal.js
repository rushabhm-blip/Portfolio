/**
 * ScrollReveal
 * Fades + lifts text and image blocks into place the first time they scroll into view.
 *
 * - Animates the standalone `translate` property (not `transform`) via the Web Animations API,
 *   so it composes with each element's own rotations / hover lifts instead of overriding them.
 * - Elements entering in the same frame are staggered top-to-bottom.
 * - Skips entirely under prefers-reduced-motion.
 */

const TEXT_TARGETS = [
  '.jar-caption-title',
  '.jar-caption-subtitle',
  '.selected-work-title',
  '.selected-work-subtitle',
  '.project-index-label',
  '.project-name',
  '.project-subheading',
  '.project-desc',
  '.project-meta-details',
  '.project-discipline-capsules',
  '.project-link-wrapper',
  '.about-section-tab',
  '.about-section-heading',
  '.memory-main-heading',
  '.memory-main-para',
  '.memory-body',
  '.memory-secondary-para',
  '.services-kicker',
  '.services-heading',
  '.services-intro',
  '.services-cta'
];

const IMAGE_TARGETS = [
  '.note-assembly',
  '.selected-work-plane-wrapper',
  '.project-paper-frame',
  '.childhood-collage-wrap',
  '.vr-sticker-wrapper',
  '.services-folder'
];

const STAGGER_MS = 90;

export function initScrollReveal(root = document) {
  if (!Element.prototype.animate) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = [
    ...[...root.querySelectorAll(TEXT_TARGETS.join(','))].map(el => [el, 'text']),
    ...[...root.querySelectorAll(IMAGE_TARGETS.join(','))].map(el => [el, 'image'])
  ];

  const kindOf = new Map(targets);
  kindOf.forEach((_, el) => el.classList.add('sr-pending'));

  const reveal = (el, delay) => {
    el.classList.remove('sr-pending');
    const isImage = kindOf.get(el) === 'image';
    const endOpacity = getComputedStyle(el).opacity;

    el.animate(
      [
        { opacity: 0, translate: isImage ? '0 48px' : '0 28px', scale: isImage ? '0.96' : '1', filter: 'blur(6px)' },
        { opacity: endOpacity, translate: '0 0', scale: '1', filter: 'blur(0)' }
      ],
      {
        duration: isImage ? 1000 : 800,
        delay,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'backwards'
      }
    );
  };

  // Checked on scroll rather than with IntersectionObserver: a fast scroll can jump a block from
  // below the viewport to above it without ever "intersecting", which would leave it hidden.
  const pending = new Set(kindOf.keys());
  let ticking = false;

  const check = () => {
    ticking = false;
    const revealLine = window.innerHeight * 0.92;
    const entering = [];

    pending.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return; // display: none (e.g. mobile-only variants)
      if (rect.bottom < 0) {
        pending.delete(el);
        el.classList.remove('sr-pending');
      } else if (rect.top < revealLine) {
        pending.delete(el);
        entering.push([el, rect]);
      }
    });

    entering
      .sort(([, a], [, b]) => a.top - b.top || a.left - b.left)
      .forEach(([el], i) => reveal(el, i * STAGGER_MS));

    if (pending.size === 0) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(check);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  check();
}

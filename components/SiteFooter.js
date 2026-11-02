/**
 * SiteFooter.js
 * Closing of the page, after the services folder.
 * - Contact section on the shared graph paper: 60/40 grid with the pitch, email link and the
 *   envelope illustration with a handwritten "say hello" note and curved arrow.
 * - Footer band on the cobalt paper texture: wordmark + tagline, site links, then copyright,
 *   "Keep calm. Experiment on." and a Back to top button.
 * Work and About jump to their sections; Playground opens its chapter like the header does.
 * Reduced motion: no illustration lift, Back to top jumps instead of scrolling.
 */

const LINKEDIN_URL = 'https://www.linkedin.com/in/rushabh-mahore-834425207/';
const RESUME_URL = '/assets/Rushabh_Mahore_Resume.pdf';
const EMAIL = 'rushabh_m@nid.edu';

const ARROW_UP_RIGHT = '<svg class="footer-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function createContactSection() {
  const section = document.createElement('section');
  section.className = 'contact-section';
  section.id = 'contact';
  section.setAttribute('aria-labelledby', 'contactHeading');

  section.innerHTML = `
    <div class="contact-inner">
      <div class="contact-copy">
        <p class="contact-kicker">Have something in mind?</p>
        <h2 class="contact-heading" id="contactHeading">
          Let’s make something <span class="contact-heading-accent">useful together.</span>
        </h2>
        <p class="contact-text">A project, a question, or a simple hello.</p>
        <a class="contact-email" href="mailto:${EMAIL}">
          ${EMAIL}${ARROW_UP_RIGHT}
          <svg class="contact-email-underline" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <path d="M3 9 C 60 3, 130 2, 197 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </a>
      </div>

      <figure class="contact-art">
        <span class="contact-note" aria-hidden="true">
          say hello
          <svg class="contact-note-arrow" viewBox="0 0 60 56" fill="none">
            <path d="M8 4 C 2 22, 14 40, 46 46" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M36 37 L 47 46 L 35 52" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <img class="contact-envelope" src="assets/footer/envelope.webp" width="640" height="640"
             alt="An open clay envelope holding a letter, with a speech bubble and a lime star."
             loading="lazy" decoding="async" draggable="false" />
      </figure>
    </div>
  `;

  return { element: section };
}

export function createSiteFooter({ onSelectChapter } = {}) {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="site-footer-inner">
      <div class="site-footer-top">
        <div class="site-footer-brand">
          <a class="site-footer-wordmark" href="/" aria-label="rushabh. home">rushabh<span>.</span></a>
          <p class="site-footer-tagline">Things I notice. Things I make.</p>
        </div>
        <nav class="site-footer-nav" aria-label="Footer navigation">
          <ul class="site-footer-links">
            <li><a class="site-footer-link" href="#works">Work</a></li>
            <li><a class="site-footer-link" href="#about">About</a></li>
            <li><button type="button" class="site-footer-link" data-chapter="Playground">Playground</button></li>
            <li><a class="site-footer-link" href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer">LinkedIn${ARROW_UP_RIGHT}<span class="sr-only"> (opens in a new tab)</span></a></li>
            <li><a class="site-footer-link" href="${RESUME_URL}" target="_blank" rel="noopener noreferrer">My résumé${ARROW_UP_RIGHT}<span class="sr-only"> (PDF, opens in a new tab)</span></a></li>
          </ul>
        </nav>
      </div>

      <div class="site-footer-bottom">
        <p class="site-footer-copy">© ${year} Rushabh Mahore</p>
        <p class="site-footer-motto">Keep calm. Experiment on.</p>
        <button type="button" class="site-footer-top-btn">
          <span class="site-footer-top-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none"><path d="M10 15.5V4.5M5 9.5l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          Back to top
        </button>
      </div>
    </div>
  `;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => (reducedMotion.matches ? 'instant' : 'smooth');

  // Work / About: same smooth jump as the header (the dialog may be open over the page)
  footer.querySelectorAll('.site-footer-link[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: behavior() });
    });
  });

  footer.querySelector('.site-footer-wordmark').addEventListener('click', (e) => {
    if (!onSelectChapter) return;
    e.preventDefault();
    onSelectChapter('Home');
  });

  footer.querySelector('[data-chapter="Playground"]').addEventListener('click', (e) => {
    onSelectChapter?.('Playground', e.currentTarget);
  });

  // Back to top: scroll up, then hand keyboard focus to the header wordmark
  footer.querySelector('.site-footer-top-btn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: behavior() });
    document.querySelector('.site-header .wordmark')?.focus({ preventScroll: true });
  });

  return { element: footer };
}

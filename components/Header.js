/**
 * Reusable Header Component
 * Renders the top-level wordmark and navigation buttons.
 */
export function createHeader({ brand, navigation, onSelectChapter }) {
  const header = document.createElement('header');
  header.className = 'site-header';

  // Wordmark
  const wordmark = document.createElement('a');
  wordmark.className = 'wordmark';
  wordmark.href = brand.url || '/';
  wordmark.innerHTML = `${brand.wordmark}<span>${brand.dot}</span>`;
  wordmark.addEventListener('click', (e) => {
    e.preventDefault();
    onSelectChapter('Home');
  });

  // Nav
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Main navigation');

  navigation.forEach((item) => {
    let el;
    if (item.url) {
      el = document.createElement('a');
      el.href = item.url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else {
      el = document.createElement('button');
      el.type = 'button';
      el.addEventListener('click', () => {
        onSelectChapter(item.id);
      });
    }
    el.className = `nav-item ${item.active ? 'active' : ''}`;
    el.setAttribute('data-chapter', item.id);
    el.textContent = item.label;
    nav.appendChild(el);
  });

  header.appendChild(wordmark);
  header.appendChild(nav);

  return header;
}

/**
 * Keeps the header reachable from anywhere on the page: it slides away while scrolling down and
 * slides back on any scroll up. Past the hero it floats on a cobalt band so the white links stay
 * readable over the light sections. Stays visible while it holds keyboard focus.
 */
export function enableHeaderAutoHide(header) {
  if (!header) return;
  const THRESHOLD = 6; // px of travel before changing state, so tiny jitters don't flicker it
  let lastY = window.scrollY;

  // Scroll events already arrive at most once per frame, and this only reads scrollY and one height
  const update = () => {
    const y = Math.max(0, window.scrollY);
    const floating = y > header.offsetHeight;
    header.classList.toggle('is-floating', floating);

    const delta = y - lastY;
    if (Math.abs(delta) < THRESHOLD) return;
    const hide = floating && delta > 0 && !header.contains(document.activeElement);
    header.classList.toggle('is-hidden', hide);
    lastY = y;
  };

  window.addEventListener('scroll', update, { passive: true });

  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();
}

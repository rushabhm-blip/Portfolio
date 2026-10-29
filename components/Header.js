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

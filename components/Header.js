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
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `nav-item ${item.active ? 'active' : ''}`;
    btn.setAttribute('data-chapter', item.id);
    btn.textContent = item.label;
    btn.addEventListener('click', () => {
      onSelectChapter(item.id);
    });
    nav.appendChild(btn);
  });

  header.appendChild(wordmark);
  header.appendChild(nav);

  return header;
}

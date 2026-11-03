/**
 * films.js
 * - Players: a poster button that swaps itself for the Drive player on click (16:9, Drive's own
 *   controls and fullscreen; nothing plays until the visitor presses play).
 * - Frames: any <img data-frame> whose file is missing becomes a dashed "Frame needed" placeholder
 *   that names the file to add to /playground/films/frames/.
 * - Accordions: buttons with aria-expanded; the panel animates open unless reduced motion is on.
 */
(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- placeholders for missing frames ---------- */

  const toPlaceholder = (img) => {
    const file = img.getAttribute('src').split('/').pop();
    const box = document.createElement('span');
    box.className = 'fm-missing';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', `Placeholder: ${img.dataset.needs || 'image needed'}`);
    box.innerHTML = '<span class="fm-missing-tag">Frame needed</span>' +
      `<span class="fm-missing-text">${img.dataset.needs || ''}</span>` +
      `<code class="fm-missing-file">frames/${file}</code>`;
    img.replaceWith(box);
  };

  document.querySelectorAll('img[data-frame]').forEach(img => {
    if (img.complete && img.naturalWidth === 0) toPlaceholder(img);
    else img.addEventListener('error', () => toPlaceholder(img), { once: true });
  });

  /* ---------- players ---------- */

  document.querySelectorAll('.fm-player').forEach(player => {
    const button = player.querySelector('.fm-play');
    button.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = player.dataset.embed;
      frame.title = player.dataset.title;
      frame.allow = 'autoplay; fullscreen';
      frame.allowFullscreen = true;
      player.classList.add('is-playing');
      button.replaceWith(frame);
      frame.focus();
    });
  });

  /* ---------- accordions ---------- */

  document.querySelectorAll('.fm-acc-btn').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        panel.hidden = false;
        if (!reducedMotion.matches) {
          panel.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
            { duration: 280, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        }
      } else {
        panel.hidden = true;
      }
    });
  });
})();

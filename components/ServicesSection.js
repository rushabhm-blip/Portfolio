/**
 * ServicesSection.js
 * "What can I do for you?" section that follows About me.
 * One interactive folder with three chapter tabs (UX research / Design / Prototype):
 * - The whole folder and the active tab take the chapter colour; inactive tabs stay ivory.
 * - Each chapter: heading, services, related-work link and a
 *   four-frame stop-motion illustration (1→2→3→4→3→2→1, hard frame swaps, ~150ms).
 * - Illustration plays once when its tab opens (or first scrolls into view) and replays on
 *   hover, keyboard focus or tap, then rests on frame 1. Reduced motion shows frame 1 only.
 * - All panels share one grid cell so the folder keeps the same size across tabs.
 * - Scroll-driven: when the folder fits the viewport it pins (sticky) inside a taller track and
 *   the chapters advance as the page scrolls; picking a tab scrolls to that chapter's spot.
 *   Viewports too short for the folder keep plain tabs.
 * - Accessible tabs (roving tabindex, arrow keys, Home/End).
 * - Phones show service names only, with a "See more…" toggle for their descriptions.
 * - Contact and footer links live in SiteFooter.js.
 */

const FRAME_SEQUENCE = [1, 2, 3, 4, 3, 2, 1];
const FRAME_MS = 150;

const CHAPTERS = [
  {
    id: 'understand',
    label: 'UX research',
    color: '#E7DDF7',
    title: 'Find the right problem.',
    items: [
      { name: 'Research & discovery', line: 'Understand people, their needs and everyday context.' },
      { name: 'Service & systems', line: 'Map the people, touchpoints and connections behind a service.' },
      { name: 'Usability testing', line: 'Find friction, learn from feedback and improve the experience.' }
    ],
    link: '/projects/sajag/',
    art: 'A magnifying glass over a folded journey map with three clay figures joined by a dotted path.'
  },
  {
    id: 'design',
    label: 'Design',
    color: '#FFE1CC',
    title: 'Design that makes sense.',
    items: [
      { name: 'Interaction & UX design', line: 'Clear flows, thoughtful interfaces, useful details.' },
      { name: 'Data storytelling', line: 'Complex information, made easy to explore.' }
    ],
    link: '/projects/snakbite/',
    art: 'A blue pencil sketching a phone wireframe beside a hand-drawn bar chart.'
  },
  {
    id: 'make',
    label: 'Prototype',
    color: '#D5EEDC',
    title: 'Bring ideas to life.',
    items: [
      { name: 'Prototyping', line: 'Clickable and coded experiences to test ideas early.' },
      { name: 'Multimodal & spatial', line: 'Explore interactions through gesture, voice and space.' },
      { name: 'Tangible interaction', line: 'Make physical objects respond through sensors and fabrication.' }
    ],
    link: '/projects/digital-fabrication/',
    art: 'A paper VR headset wired to a prototype box with a big blue button.'
  }
];

export function createServicesSection() {
  const section = document.createElement('section');
  section.className = 'services-section';
  section.id = 'services';
  section.setAttribute('aria-labelledby', 'servicesHeading');

  const tabs = CHAPTERS.map((c, i) => `
        <button type="button" class="services-tab-btn${i === 0 ? ' is-active' : ''}" role="tab"
                id="servicesTab-${c.id}" aria-controls="servicesPanel-${c.id}"
                aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" style="--chapter-color: ${c.color}">
          <span class="services-tab-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="services-tab-label">${c.label}</span>
        </button>`).join('');

  const panels = CHAPTERS.map((c, i) => `
        <div class="services-panel${i === 0 ? ' is-active' : ''}" role="tabpanel"
             id="servicesPanel-${c.id}" aria-labelledby="servicesTab-${c.id}" tabindex="0"${i === 0 ? '' : ' inert'}>
          <div class="services-panel-text">
            <h3 class="services-panel-title">${c.title}</h3>
            <ul class="services-panel-list">
              ${c.items.map(item => `
              <li>
                <h4 class="services-item-name">${item.name}</h4>
                <p class="services-item-line">${item.line}</p>
              </li>`).join('')}
            </ul>
            <button type="button" class="services-details-toggle" aria-expanded="false">See more…</button>
            <a class="services-panel-link" href="${c.link}">Explore related work <span aria-hidden="true">↗</span></a>
          </div>
          <div class="services-art" role="img" aria-label="${c.art}" tabindex="0" data-chapter="${c.id}">
            ${[1, 2, 3, 4].map(n => `<img class="services-art-frame${n === 1 ? ' is-current' : ''}" src="assets/services/${c.id}-${n}.webp" alt="" draggable="false" decoding="async" data-frame="${n}" />`).join('')}
          </div>
        </div>`).join('');

  section.innerHTML = `
    <div class="services-grid-bg" aria-hidden="true"></div>
    <div class="services-inner">
      <header class="services-header">
        <p class="services-kicker">How I can help</p>
        <h2 class="services-heading" id="servicesHeading">
          What can I do <span class="services-heading-accent">for you?</span>
        </h2>
      </header>

      <div class="services-scroll">
      <div class="services-folder" style="--folder-color: ${CHAPTERS[0].color}">
        <div class="services-tabs-row">
          <span class="services-pick" aria-hidden="true">
            Pick a chapter
            <svg viewBox="0 0 30 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 3 C 18 6, 22 16, 18 30" /><path d="M12 25 L 18 31 L 23 24" />
            </svg>
          </span>
          <div class="services-tabs" role="tablist" aria-label="What I can help with">${tabs}
          </div>
        </div>
        <div class="services-card">${panels}
        </div>
      </div>
      </div>
    </div>
  `;

  const folder = section.querySelector('.services-folder');
  const tabButtons = [...section.querySelectorAll('.services-tab-btn')];
  const panelEls = [...section.querySelectorAll('.services-panel')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Stop-motion: hard frame swaps through 1→2→3→4→3→2→1, resting on frame 1
  const playing = new WeakMap();
  const showFrame = (art, n) => {
    art.querySelectorAll('.services-art-frame').forEach(img => {
      img.classList.toggle('is-current', Number(img.dataset.frame) === n);
    });
  };
  const play = (art) => {
    if (!art || reducedMotion.matches || playing.get(art)) return;
    playing.set(art, true);
    FRAME_SEQUENCE.forEach((n, step) => {
      setTimeout(() => {
        showFrame(art, n);
        if (step === FRAME_SEQUENCE.length - 1) playing.set(art, false);
      }, step * FRAME_MS);
    });
  };

  section.querySelectorAll('.services-art').forEach(art => {
    ['mouseenter', 'focus', 'click'].forEach(evt => art.addEventListener(evt, () => play(art)));
  });

  const track = section.querySelector('.services-scroll');
  let activeIndex = 0;

  // Scroll-driven chapters: the folder pins once it is centred and each chapter gets `step`
  // pixels of scroll. Recomputed on resize; off when the folder is taller than the viewport.
  const pin = { on: false, top: 0, step: 0, lockUntil: 0 };
  const layout = () => {
    const folderH = folder.offsetHeight;
    const vh = window.innerHeight;
    pin.on = folderH + 48 <= vh;
    section.classList.toggle('is-pinned', pin.on);
    if (!pin.on) {
      track.style.height = '';
      return;
    }
    pin.top = Math.round((vh - folderH) / 2);
    pin.step = Math.round(vh * 0.6);
    folder.style.setProperty('--services-pin-top', `${pin.top}px`);
    track.style.height = `${folderH + (CHAPTERS.length - 1) * pin.step}px`;
  };
  // How far the folder has travelled while pinned (0 → (chapters - 1) * step)
  const pinnedDistance = () => pin.top - track.getBoundingClientRect().top;

  const scrollToChapter = (index) => {
    const delta = index * pin.step - pinnedDistance();
    if (Math.abs(delta) < 2) return;
    pin.lockUntil = performance.now() + 1000;
    window.scrollBy({ top: delta, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  };

  const select = (index, focus = false, fromScroll = false) => {
    if (pin.on && !fromScroll) scrollToChapter(index);
    if (index === activeIndex && fromScroll) return;
    activeIndex = index;
    tabButtons.forEach((btn, i) => {
      const active = i === index;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
      btn.tabIndex = active ? 0 : -1;
      panelEls[i].classList.toggle('is-active', active);
      panelEls[i].inert = !active;
    });
    folder.style.setProperty('--folder-color', CHAPTERS[index].color);
    if (focus) tabButtons[index].focus();
    const art = panelEls[index].querySelector('.services-art');
    showFrame(art, 1);
    play(art);
  };

  // Phone: service descriptions stay tucked away until "See more…"; one state for every chapter
  const detailToggles = [...section.querySelectorAll('.services-details-toggle')];
  detailToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const open = section.classList.toggle('is-details-open');
      detailToggles.forEach(t => {
        t.setAttribute('aria-expanded', String(open));
        t.textContent = open ? 'See less' : 'See more…';
      });
    });
  });

  tabButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => select(i));
    btn.addEventListener('keydown', (e) => {
      const last = tabButtons.length - 1;
      const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(next, true);
    });
  });

  // Scroll events already fire at most once per frame, and this only reads one rect
  const onScroll = () => {
    // A tab pick is smooth-scrolling to its chapter: don't flicker through the ones in between
    if (!pin.on || performance.now() < pin.lockUntil) return;
    const index = Math.min(CHAPTERS.length - 1, Math.max(0, Math.round(pinnedDistance() / pin.step)));
    select(index, false, true);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scrollend', () => { pin.lockUntil = 0; onScroll(); });
  // Ignore small height-only resizes (mobile address bar showing/hiding) so the track doesn't
  // change length mid-scroll
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 150) return;
    lastW = window.innerWidth;
    lastH = window.innerHeight;
    layout();
    onScroll();
  });
  // Re-measure whenever the folder's size settles (fonts, art loading, breakpoints)
  if ('ResizeObserver' in window) new ResizeObserver(() => { layout(); onScroll(); }).observe(folder);
  else requestAnimationFrame(layout);

  // Preload every frame once the folder is near the viewport, then play the opening tab once
  // when it first comes into view.
  const preload = () => CHAPTERS.forEach(c => [1, 2, 3, 4].forEach(n => {
    const img = new Image();
    img.src = `assets/services/${c.id}-${n}.webp`;
  }));
  if ('IntersectionObserver' in window) {
    const preloadIo = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) { preload(); preloadIo.disconnect(); }
    }, { rootMargin: '600px 0px' });
    preloadIo.observe(folder);

    const playIo = new IntersectionObserver((entries) => {
      if (entries.some(e => e.intersectionRatio >= 0.4)) {
        play(panelEls.find(p => p.classList.contains('is-active')).querySelector('.services-art'));
        playIo.disconnect();
      }
    }, { threshold: 0.4 });
    playIo.observe(folder);
  } else {
    preload();
  }

  return { element: section };
}

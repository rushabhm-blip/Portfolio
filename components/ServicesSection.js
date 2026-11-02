/**
 * ServicesSection.js
 * "What can I do for you?" section that follows About me.
 * One interactive folder with three chapter tabs (Understand / Design / Make):
 * - The whole folder and the active tab take the chapter colour; inactive tabs stay ivory.
 * - Each chapter: handwritten line, heading, services, related-work link and a
 *   four-frame stop-motion illustration (1→2→3→4→3→2→1, hard frame swaps, ~150ms).
 * - Illustration plays once when its tab opens (or first scrolls into view) and replays on
 *   hover, keyboard focus or tap, then rests on frame 1. Reduced motion shows frame 1 only.
 * - All panels share one grid cell so the folder keeps the same size across tabs.
 * - Accessible tabs (roving tabindex, arrow keys, Home/End).
 */

const LINKEDIN_URL = 'https://www.linkedin.com/in/rushabh-mahore-834425207/';
const RESUME_URL = '/assets/Rushabh_Mahore_Resume.pdf';

const FRAME_SEQUENCE = [1, 2, 3, 4, 3, 2, 1];
const FRAME_MS = 150;

const CHAPTERS = [
  {
    id: 'understand',
    label: 'Understand',
    color: '#E7DDF7',
    eyebrow: 'Listen closely. Connect the dots.',
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
    eyebrow: 'Make it clear. Make it feel right.',
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
    label: 'Make',
    color: '#D5EEDC',
    eyebrow: 'Build it. Play with it. Make it work.',
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
            <p class="services-panel-eyebrow">${c.eyebrow}</p>
            <h3 class="services-panel-title">${c.title}</h3>
            <ul class="services-panel-list">
              ${c.items.map(item => `
              <li>
                <h4 class="services-item-name">${item.name}</h4>
                <p class="services-item-line">${item.line}</p>
              </li>`).join('')}
            </ul>
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
        <p class="services-intro">From the first question to something you can try.</p>
      </header>

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

      <div class="services-cta">
        <div class="services-cta-start">
          <p class="services-cta-text">Have something in mind?</p>
          <a class="services-cta-hand" href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer">
            Let's make it useful <span aria-hidden="true">↗</span>
            <svg class="services-cta-underline" viewBox="0 0 200 12" fill="none" aria-hidden="true">
              <path d="M3 9 C 60 3, 130 2, 197 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </a>
        </div>
        <div class="services-cta-links">
          <a class="services-cta-link" href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
          <a class="services-cta-link" href="${RESUME_URL}" target="_blank" rel="noopener noreferrer">My résumé <span aria-hidden="true">↗</span></a>
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

  const select = (index, focus = false) => {
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

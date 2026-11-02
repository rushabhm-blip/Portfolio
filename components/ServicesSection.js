/**
 * ServicesSection.js
 * "What can I do for you?" section that follows About me.
 * A minimal folder with three chapter tabs (Understand / Design / Make):
 * - Each chapter: handwritten eyebrow, heavy Inter title, two services, a related-work link
 *   and a hand-drawn blue sketch on paper with a pencil.
 * - Accessible tabs (roving tabindex, arrow keys, Home/End).
 * - Footer: handwritten "Let's make it useful" (LinkedIn), LinkedIn and résumé links.
 */

const LINKEDIN_URL = 'https://www.linkedin.com/in/rushabh-mahore-834425207/';
const RESUME_URL = '/assets/Rushabh_Mahore_Resume.pdf';

// Shared hand-drawn pencil, laid diagonally across the paper's right edge
const PENCIL = `
  <g class="sketch-pencil" stroke="none" transform="translate(318 52) rotate(-27)">
    <polygon points="0,22 9,0 18,22" fill="#e9c896"/>
    <polygon points="6,8 9,0 12,8" fill="#1f2937"/>
    <rect x="0" y="22" width="18" height="262" rx="2" fill="#1d4ed8"/>
    <rect x="0" y="22" width="6" height="262" fill="#2563eb"/>
    <rect x="12" y="22" width="6" height="262" fill="#1e40af"/>
    <rect x="0" y="280" width="18" height="8" rx="1.5" fill="#1e3a8a"/>
  </g>`;

// Paper card behind each sketch
const PAPER = `
  <g class="sketch-paper" stroke="none" transform="rotate(-6 210 205)">
    <rect x="66" y="48" width="300" height="350" rx="3" fill="rgba(15, 30, 80, 0.10)"/>
    <rect x="62" y="42" width="300" height="350" rx="3" fill="#eef1fb"/>
  </g>`;

const STAR = (x, y) => `
  <path class="sketch-star" transform="translate(${x} ${y})"
        d="M0 -13 L3.6 -4.2 L13 -4 L5.6 2 L8.4 11.5 L0 6 L-8.4 11.5 L-5.6 2 L-13 -4 L-3.6 -4.2 Z"
        fill="#c7f23a" stroke="#9cc31c" stroke-width="1.2" stroke-linejoin="round"/>`;

const SKETCHES = {
  // Research: sticky notes, speech bubble and a magnifying glass
  understand: `
    <g class="sketch-lines" transform="rotate(-6 210 205)">
      <path d="M100 88 h74 v62 h-74 z" />
      <path d="M112 106 h48 M112 120 h40 M112 134 h30" />
      <path d="M196 98 l70 -6 l5 60 l-70 6 z" />
      <path d="M208 116 l44 -4 M209 130 l36 -3" />
      <path d="M104 182 h120 a14 14 0 0 1 14 14 v42 a14 14 0 0 1 -14 14 h-78 l-22 20 v-20 h-20 a14 14 0 0 1 -14 -14 v-42 a14 14 0 0 1 14 -14 z" />
      <path d="M150 206 c0 -12 22 -12 22 0 c0 9 -11 9 -11 19" />
      <path d="M161 236 v1" />
      <circle cx="262" cy="276" r="34" />
      <path d="M286 300 l34 34" stroke-width="6" />
      <path d="M248 266 c4 -8 12 -12 20 -12" />
      <path d="M104 312 h96 M104 330 h70" />
    </g>
    ${STAR(286, 84)}`,

  // Design: phone wireframe (matches the reference)
  design: `
    <g class="sketch-lines" transform="rotate(-6 210 205)">
      <rect x="118" y="78" width="168" height="296" rx="22" />
      <path d="M182 96 h40" />
      <rect x="140" y="122" width="124" height="66" />
      <path d="M140 122 l124 66 M264 122 l-124 66" />
      <path d="M142 214 h94 M142 232 h118 M142 250 h80" />
      <circle cx="158" cy="288" r="12" /><circle cx="202" cy="288" r="12" /><circle cx="246" cy="288" r="12" />
      <path d="M142 318 h112" />
      <rect x="146" y="334" width="112" height="22" rx="11" />
      <path d="M154 352 l12 -14 M166 352 l12 -14 M178 352 l12 -14 M190 352 l12 -14 M202 352 l12 -14 M214 352 l12 -14 M226 352 l12 -14 M238 352 l12 -14" stroke-width="1.6" />
    </g>
    ${STAR(286, 84)}`,

  // Make: a prototype screen with a cursor, plus a dice cube (tangible build)
  make: `
    <g class="sketch-lines" transform="rotate(-6 210 205)">
      <rect x="96" y="82" width="190" height="132" rx="10" />
      <path d="M96 106 h190" />
      <circle cx="112" cy="94" r="4" /><circle cx="126" cy="94" r="4" /><circle cx="140" cy="94" r="4" />
      <path d="M114 128 h96 M114 144 h70" />
      <rect x="114" y="164" width="84" height="28" rx="14" />
      <path d="M190 184 l0 34 l9 -9 l8 16 l7 -3 l-8 -16 l13 0 z" />
      <path d="M176 172 l-8 -8 M186 168 v-10 M196 172 l8 -8" stroke-width="1.8" />
      <path d="M150 262 l52 -24 l52 24 l-52 24 z" />
      <path d="M150 262 v58 l52 26 v-60" />
      <path d="M254 262 v58 l-52 26" />
      <circle cx="202" cy="262" r="5" fill="#1d4ed8" />
      <circle cx="170" cy="292" r="4.5" fill="#1d4ed8" /><circle cx="182" cy="318" r="4.5" fill="#1d4ed8" />
      <circle cx="222" cy="294" r="4.5" fill="#1d4ed8" /><circle cx="236" cy="310" r="4.5" fill="#1d4ed8" /><circle cx="224" cy="324" r="4.5" fill="#1d4ed8" />
    </g>
    ${STAR(286, 84)}`
};

const CHAPTERS = [
  {
    id: 'understand',
    label: 'Understand',
    eyebrow: 'Ask first. Listen closely.',
    title: 'Research that finds the real problem.',
    items: [
      { name: 'Research & discovery', line: 'Interviews, field studies and journey maps.' },
      { name: 'Service & system design', line: 'The people, touchpoints and steps behind it all.' }
    ],
    link: { href: '/projects/sajag/', text: 'Explore related work' }
  },
  {
    id: 'design',
    label: 'Design',
    eyebrow: 'Make it clear. Make it feel right.',
    title: 'Design that makes sense.',
    items: [
      { name: 'Interaction & UX design', line: 'Clear flows, thoughtful interfaces, useful details.' },
      { name: 'Data storytelling', line: 'Complex information, made easy to explore.' }
    ],
    link: { href: '/projects/snakbite/', text: 'Explore related work' }
  },
  {
    id: 'make',
    label: 'Make',
    eyebrow: 'Build it. Try it. Repeat.',
    title: 'Prototypes you can actually try.',
    items: [
      { name: 'Prototyping & testing', line: 'Clickable or coded, then tested with real people.' },
      { name: 'Multimodal & tangible', line: 'Gesture, spatial and physical interactions.' }
    ],
    link: { href: '/projects/digital-fabrication/', text: 'Explore related work' }
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
                aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
          <span class="services-tab-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="services-tab-label">${c.label}</span>
        </button>`).join('');

  const panels = CHAPTERS.map((c, i) => `
        <div class="services-panel${i === 0 ? ' is-active' : ''}" role="tabpanel"
             id="servicesPanel-${c.id}" aria-labelledby="servicesTab-${c.id}" tabindex="0"${i === 0 ? '' : ' hidden'}>
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
            <a class="services-panel-link" href="${c.link.href}">${c.link.text} <span aria-hidden="true">↗</span></a>
          </div>
          <div class="services-panel-art" aria-hidden="true">
            <svg viewBox="0 0 440 410" fill="none" stroke="#1d4ed8" stroke-width="2.4"
                 stroke-linecap="round" stroke-linejoin="round">
              ${PAPER}
              ${SKETCHES[c.id]}
              ${PENCIL}
            </svg>
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

      <div class="services-folder">
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

  // Tabs: click, arrow keys, Home/End
  const tabButtons = [...section.querySelectorAll('.services-tab-btn')];
  const panelEls = [...section.querySelectorAll('.services-panel')];

  const select = (index, focus = false) => {
    tabButtons.forEach((btn, i) => {
      const active = i === index;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
      btn.tabIndex = active ? 0 : -1;
      panelEls[i].hidden = !active;
      panelEls[i].classList.toggle('is-active', active);
    });
    if (focus) tabButtons[index].focus();
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

  return { element: section };
}

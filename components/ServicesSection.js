/**
 * ServicesSection.js
 * "What can I do for you?" section that follows About me.
 * Same sketchbook language as the About section:
 * - Warm ivory grid paper continuing from the About backdrop.
 * - Cobalt tab label, heavy Inter heading, lime marker highlight, Caveat handwritten aside.
 * - Taped paper index cards (slightly rotated) with pastel discipline capsules.
 */

const SERVICES = [
  {
    title: 'Research & discovery',
    desc: 'Talk to people, watch how things really get used, and turn the mess into clear opportunities.',
    tags: ['Interviews', 'Field studies', 'Journey maps'],
    tone: 'lavender'
  },
  {
    title: 'Interaction & UX design',
    desc: 'Flows, wireframes and interfaces that feel obvious, from the first tap to the last edge case.',
    tags: ['User flows', 'Wireframes', 'Hi-fi UI'],
    tone: 'peach'
  },
  {
    title: 'Prototyping',
    desc: 'Clickable or coded prototypes you can test, demo and pitch long before production.',
    tags: ['Figma', 'Framer', 'Coded prototypes'],
    tone: 'mint'
  },
  {
    title: 'Service & system design',
    desc: 'Map the people, touchpoints and behind-the-scenes steps so the whole experience works, not just one screen.',
    tags: ['Service blueprints', 'Ecosystem maps'],
    tone: 'lavender'
  },
  {
    title: 'Usability testing',
    desc: 'Put designs in front of real people, see where they stumble, and fix it fast.',
    tags: ['Test plans', 'Sessions', 'Iteration'],
    tone: 'peach'
  },
  {
    title: 'Data storytelling',
    desc: 'Turn numbers into scrollable, explorable stories that people actually remember.',
    tags: ['Data visualisation', 'Scrollytelling'],
    tone: 'mint'
  },
  {
    title: 'Multimodal & spatial',
    desc: 'Gesture, voice and spatial interactions for museums, AR/VR and places beyond the screen.',
    tags: ['Gesture', 'Spatial computing', 'AR / VR'],
    tone: 'lavender'
  },
  {
    title: 'Tangible interaction',
    desc: 'Physical things that respond to you, built with sensors, microcontrollers and fabricated forms.',
    tags: ['Physical computing', 'Digital fabrication'],
    tone: 'peach'
  }
];

export function createServicesSection() {
  const section = document.createElement('section');
  section.className = 'services-section';
  section.id = 'services';
  section.setAttribute('aria-labelledby', 'servicesHeading');

  const cards = SERVICES.map((service, i) => `
      <li class="service-card service-tone-${service.tone}">
        ${i % 3 === 0 ? `<img class="service-tape ${i % 2 === 0 ? 'service-tape-left' : 'service-tape-right'}" src="assets/yellow-tape.webp" alt="" aria-hidden="true" loading="lazy" />` : ''}
        <span class="service-index">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="service-title">${service.title}</h3>
        <p class="service-desc">${service.desc}</p>
        <ul class="service-tags" aria-label="Includes">
          ${service.tags.map((tag, t) => `<li class="discipline-capsule capsule-${['lavender', 'peach', 'mint'][(i + t) % 3]}">${tag}</li>`).join('')}
        </ul>
      </li>`).join('');

  section.innerHTML = `
    <div class="services-grid-bg" aria-hidden="true"></div>
    <div class="services-inner">
      <header class="services-header">
        <div class="about-section-tab services-tab">How I can help</div>
        <h2 class="services-heading" id="servicesHeading">
          What can I do <span class="services-heading-accent">for you?</span>
        </h2>
        <p class="services-intro">
          From a messy problem to something people can tap, hold or walk through.
          Here's where I can <mark class="lime-marker">jump in.</mark>
        </p>
        <div class="services-aside" aria-hidden="true">
          <span class="services-aside-text">pick one, or all of them!</span>
          <svg class="services-aside-arrow" viewBox="0 0 60 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6 C 18 30, 36 34, 52 26" />
            <path d="M44 20 L 53 26 L 44 33" />
          </svg>
        </div>
      </header>

      <ol class="services-list">${cards}
      </ol>

      <div class="services-cta">
        <p class="services-cta-text">Have something in mind? <span class="services-cta-hand">Let's make it useful.</span></p>
        <a class="project-case-study-link" href="/assets/Rushabh_Mahore_Resume.pdf" target="_blank" rel="noopener noreferrer">See my resume <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  `;

  return { element: section };
}

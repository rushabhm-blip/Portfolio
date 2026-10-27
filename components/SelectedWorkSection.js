/**
 * SelectedWorkSection.js
 * Selected Work header area and Projects showcase grid.
 * Closely matching reference image:
 * - Plain white header area with bold black title and muted subtitle.
 * - Seamless pale-blue organic graph grid starting below with a gentle fade.
 * - Alternating image-and-text rows:
 *     1. Sajag: thumbnail left, text right
 *     2. The Fear Between Us: text left, thumbnail right
 *     3. Munshiji: thumbnail left, text right
 * - Paper frame around 3:2 video aperture (#FAF8F0 warm ivory, subtle border & shadow).
 * - Decorative yellow tape, location pin, and snake stickers with exact visible proportions.
 * - Live HTML category tabs (pale lavender "System design", pale peach "Data storytelling").
 * - Clean sans-serif typography, inline marker highlights, and cobalt blue underlined links.
 */

export function createSelectedWorkSection() {
  // 1. Header Section (Plain White Background)
  const headerSection = document.createElement('section');
  headerSection.className = 'selected-work-header-section';
  headerSection.id = 'works';
  headerSection.setAttribute('aria-label', 'Selected Work Header');

  headerSection.innerHTML = `
    <div class="selected-work-header-container">
      <div class="selected-work-plane-wrapper" aria-hidden="true">
        <video class="selected-work-plane-video" autoplay muted loop playsinline aria-hidden="true">
          <source src="IMG_0135_dark.webm?v=31" type="video/webm">
        </video>
      </div>
      <h2 class="selected-work-title">Selected work</h2>
      <p class="selected-work-subtitle">Explorations in systems, stories, and everyday experiences.</p>
    </div>
  `;

  // 2. Projects Showcase Section (Repeating Pale-Blue Notebook Grid)
  const projectsSection = document.createElement('section');
  projectsSection.className = 'projects-section';
  projectsSection.id = 'projects';
  projectsSection.setAttribute('aria-label', 'Selected Projects Showcase');

  projectsSection.innerHTML = `
    <div class="projects-grid-fade" aria-hidden="true"></div>
    <div class="projects-container">
      <!-- Project 1: Sajag (Thumbnail Left, Text Right) -->
      <article class="project-row project-row-sajag" id="project-sajag" data-project-id="sajag">
        <div class="project-media-col">
          <div class="project-index-label" aria-hidden="true">01 / SAJAG</div>
          
          <div class="project-paper-frame">
            <!-- Decorative Yellow Tape (Upper-Left, ~ -20deg) -->
            <img class="tape-strip tape-upper-left" src="assets/yellow-tape.png" alt="" aria-hidden="true" loading="lazy" />

            <!-- 3:2 Video Aperture -->
            <a href="/projects/sajag/" class="project-aperture-link" aria-label="Explore Sajag case study">
              <div class="project-video-aperture">
                <video class="project-video"
                       src="assets/projects/sajag/thumbnail_video.mp4"
                       autoplay
                       muted
                       loop
                       playsinline
                       preload="auto"
                       poster="assets/sajag_showcase_cover.png">
                </video>
              </div>
            </a>

            <!-- Decorative Location Pin Sticker (Lower-Left edge) -->
            <img class="sticker-pin" src="assets/location-pin.png" alt="" aria-hidden="true" loading="lazy" />

            <!-- Category Tab (Lower-Right overhang) -->
            <div class="category-tab tab-lavender" aria-hidden="true">
              <span>System design</span>
            </div>
          </div>
        </div>

        <div class="project-text-col">
          <h3 class="project-name">Sajag</h3>
          <p class="project-subheading">Everyday concerns.<br><span class="marker-highlight marker-lime">Collective action.</span></p>
          <p class="project-desc">Helping people raise civic concerns, find support, and stay informed about what happens next.</p>
          <div class="project-meta-details">
            <span class="project-meta-item">2026 · Individual project</span>
            <span class="project-meta-item">Interaction design · UX design</span>
          </div>
          <div class="project-link-wrapper">
            <a href="/projects/sajag/" class="project-case-study-link" id="sajagExploreLink">
              <span>Explore case study</span>
              <span class="link-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </article>

      <!-- Project 2: The Fear Between Us (Text Left, Thumbnail Right on Desktop) -->
      <article class="project-row project-row-fear" id="project-the-fear-between-us" data-project-id="the-fear-between-us">
        <div class="project-text-col">
          <h3 class="project-name">The Fear<br>Between Us</h3>
          <p class="project-subheading">Understanding <span class="marker-highlight marker-peach">beyond fear.</span></p>
          <p class="project-desc">An interactive data story exploring snakebite and our relationship with snakes in India.</p>
          <div class="project-meta-details">
            <span class="project-meta-item">Data visualisation · Scrollytelling</span>
          </div>
          <div class="project-link-wrapper">
            <a href="/projects/snakbite/" class="project-case-study-link" id="fearBetweenUsExploreLink">
              <span>Explore project</span>
              <span class="link-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div class="project-media-col">
          <div class="project-index-label" aria-hidden="true">02 / THE FEAR BETWEEN US</div>
          
          <div class="project-paper-frame">
            <!-- Decorative Yellow Tape (Upper-Right, ~ +18deg) -->
            <img class="tape-strip tape-upper-right" src="assets/yellow-tape.png" alt="" aria-hidden="true" loading="lazy" />

            <!-- 3:2 Video Aperture -->
            <a href="/projects/snakbite/" class="project-aperture-link" aria-label="Explore The Fear Between Us case study">
              <div class="project-video-aperture">
                <video class="project-video"
                       src="assets/projects/snakbite/thumbnail_video.mp4"
                       autoplay
                       muted
                       loop
                       playsinline
                       preload="auto"
                       poster="assets/the_fear_between_us_artwork.png">
                </video>
              </div>
            </a>

            <!-- Decorative Snake Sticker (Lower-Left edge) -->
            <img class="sticker-snake" src="assets/snake-sticker.png" alt="" aria-hidden="true" loading="lazy" />

            <!-- Category Tab (Lower-Right overhang) -->
            <div class="category-tab tab-peach" aria-hidden="true">
              <span>Data storytelling</span>
            </div>
          </div>
        </div>
      </article>

      <!-- Project 3: Munshiji (Thumbnail Left, Text Right) -->
      <article class="project-row project-row-munshiji" id="project-munshiji" data-project-id="munshiji">
        <div class="project-media-col">
          <div class="project-index-label" aria-hidden="true">03 / MUNSHIJI</div>
          
          <div class="project-paper-frame">
            <!-- Decorative Yellow Tape (Upper-Left, ~ -16deg) -->
            <img class="tape-strip tape-upper-left" src="assets/yellow-tape.png" alt="" aria-hidden="true" loading="lazy" />

            <!-- 3:2 Video Aperture -->
            <a href="/projects/munshiji/" class="project-aperture-link" aria-label="Explore Munshiji case study">
              <div class="project-video-aperture">
                <video class="project-video"
                       src="assets/projects/munshiji/thumbnail_video.mp4"
                       autoplay
                       muted
                       loop
                       playsinline
                       preload="auto"
                       poster="assets/projects/munshiji/thumbnail.png">
                </video>
              </div>
            </a>

            <!-- Category Tab (Lower-Right overhang) -->
            <div class="category-tab tab-mint" aria-hidden="true">
              <span>System design</span>
            </div>
          </div>
        </div>

        <div class="project-text-col">
          <h3 class="project-name">Munshiji</h3>
          <p class="project-subheading">Financial confidence for everyday decisions.</p>
          <p class="project-desc">A digital companion helping small business owners track expenses, understand cash flow, and make informed choices.</p>
          <div class="project-meta-details">
            <span class="project-meta-item">2026 · Academic project</span>
            <span class="project-meta-item">Interaction design · UX design</span>
          </div>
          <div class="project-link-wrapper">
            <a href="/projects/munshiji/" class="project-case-study-link" id="munshijiExploreLink">
              <span>Explore case study</span>
              <span class="link-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  `;

  // Ensure paper airplane doodle video autoplays reliably
  const planeVideo = headerSection.querySelector('.selected-work-plane-video');
  if (planeVideo) {
    planeVideo.muted = true;
    const tryPlay = () => {
      const playPromise = planeVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy fallback: re-try on first user interaction
          window.addEventListener('click', () => planeVideo.play().catch(() => {}), { once: true });
          window.addEventListener('scroll', () => planeVideo.play().catch(() => {}), { once: true });
        });
      }
    };
    tryPlay();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            tryPlay();
          }
        });
      }, { threshold: 0.15 });
      observer.observe(planeVideo);
    }
  }

  return {
    headerElement: headerSection,
    projectsElement: projectsSection
  };
}

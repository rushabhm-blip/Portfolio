/**
 * LeftPage Component
 * Inside spread left page:
 * - Left-aligned 4-line heading with lime highlight behind "Explorer"
 * - Independently draggable Architecture sticker beside heading toward upper-right
 * - Live selectable paragraph with subtle marker-style highlights:
 *     - "Architecture": pale peach
 *     - "Interaction design": pale lavender
 *     - "smaller moments": thin cobalt underline
 *     - "feel easier": pale lime
 * - Lightweight decorative accents: orange sparkle and purple cursor
 * - 4-stop vertical timeline (VNIT Nagpur, AtkinsRéalis, Dar Al-Handasah, NID Bengaluru)
 * - Page number "01"
 */
export function createLeftPage({ leftData, onNextPage }) {
  const page = document.createElement('section');
  page.className = 'page page-left';
  page.id = 'leftPage';
  page.setAttribute('aria-label', 'Rushabh background, design philosophy, and timeline');

  // Inner content area with safe padding from paper edges and binding crease
  const content = document.createElement('div');
  content.className = 'left-page-content';

  // 1. Top Section: Heading Column + Beside it the Architecture Sticker
  const headerRow = document.createElement('div');
  headerRow.className = 'left-header-row';

  // Heading Block
  const headingContainer = document.createElement('div');
  headingContainer.className = 'left-heading-container';

  const heading = document.createElement('h2');
  heading.className = 'left-page-heading';
  heading.id = 'openBookHeading';
  heading.setAttribute('tabindex', '-1');

  const line1 = document.createElement('span');
  line1.className = 'heading-line line-1';
  line1.textContent = 'Architect';

  const line2 = document.createElement('span');
  line2.className = 'heading-line line-2';
  line2.textContent = 'by training.';

  const line3 = document.createElement('span');
  line3.className = 'heading-line line-3';

  const highlightWrap = document.createElement('span');
  highlightWrap.className = 'highlight-wrapper';

  const highlightSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  highlightSvg.setAttribute('class', 'highlight-svg');
  highlightSvg.setAttribute('viewBox', '0 0 240 64');
  highlightSvg.setAttribute('preserveAspectRatio', 'none');
  highlightSvg.setAttribute('aria-hidden', 'true');

  const highlightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  highlightPath.setAttribute('d', 'M5 14C36 7 205 5 235 11C239 13 237 28 235 44C233 58 227 63 218 61C172 58 45 62 12 56C3 54 2 43 4 28C5 18 2 15 5 14Z');
  highlightPath.setAttribute('fill', '#bdff00');
  highlightSvg.appendChild(highlightPath);

  const highlightText = document.createElement('span');
  highlightText.className = 'highlight-text';
  highlightText.textContent = 'Explorer';

  highlightWrap.appendChild(highlightSvg);
  highlightWrap.appendChild(highlightText);
  line3.appendChild(highlightWrap);

  const line4 = document.createElement('span');
  line4.className = 'heading-line line-4';
  line4.textContent = 'at heart.';

  heading.appendChild(line1);
  heading.appendChild(line2);
  heading.appendChild(line3);
  heading.appendChild(line4);
  headingContainer.appendChild(heading);
  headerRow.appendChild(headingContainer);

  // Architecture Sticker (Draggable)
  const archWrapper = document.createElement('div');
  archWrapper.className = 'architecture-sticker-wrapper';
  archWrapper.id = 'archStickerWrapper';
  archWrapper.setAttribute('tabindex', '0');
  archWrapper.setAttribute('role', 'button');
  archWrapper.setAttribute('aria-label', 'Architectural blueprint with triangle ruler and pencil sticker. Draggable.');

  // Radiating sketch lines above the sticker
  const raysSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  raysSvg.setAttribute('class', 'arch-accent-rays');
  raysSvg.setAttribute('viewBox', '0 0 36 20');
  raysSvg.setAttribute('fill', 'none');
  raysSvg.setAttribute('aria-hidden', 'true');

  const raysPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  raysPath.setAttribute('d', 'M6 18L2 4M18 16L18 2M30 18L34 4');
  raysPath.setAttribute('stroke', '#0647fa');
  raysPath.setAttribute('stroke-width', '2.2');
  raysPath.setAttribute('stroke-linecap', 'round');
  raysSvg.appendChild(raysPath);
  archWrapper.appendChild(raysSvg);

  const archImg = document.createElement('img');
  archImg.className = 'architecture-sticker-img';
  archImg.src = 'assets/architecture-sticker.png';
  archImg.alt = 'Floor plan blueprint, triangle ruler and orange pencil sticker';
  archImg.loading = 'eager';
  archImg.decoding = 'async';
  archImg.draggable = false;
  archWrapper.appendChild(archImg);

  headerRow.appendChild(archWrapper);
  content.appendChild(headerRow);

  // 2. Selectable Bio Paragraph with Marker Highlights & Accents
  const paragraphContainer = document.createElement('div');
  paragraphContainer.className = 'left-paragraph-container';

  // Orange sparkle accent beside paragraph
  const sparkleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sparkleSvg.setAttribute('class', 'bio-sparkle-accent');
  sparkleSvg.setAttribute('viewBox', '0 0 24 24');
  sparkleSvg.setAttribute('fill', 'none');
  sparkleSvg.setAttribute('aria-hidden', 'true');

  const sparklePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  sparklePath.setAttribute('d', 'M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z');
  sparklePath.setAttribute('fill', '#f97316');
  sparkleSvg.appendChild(sparklePath);
  paragraphContainer.appendChild(sparkleSvg);

  const bio = document.createElement('p');
  bio.className = 'left-page-bio';
  // Use HTML with inline marker spans
  bio.innerHTML = `I’m Rushabh. <span class="marker-peach">Architecture</span> taught me to notice how people move through spaces. <span class="marker-lavender">Interaction design</span> has me noticing the <span class="marker-underline">smaller moments</span> too—where someone pauses, what feels confusing, and what could <span class="marker-lime">feel easier</span>.`;
  paragraphContainer.appendChild(bio);

  // Small purple cursor accent near bottom right of paragraph
  const cursorSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  cursorSvg.setAttribute('class', 'bio-cursor-accent');
  cursorSvg.setAttribute('viewBox', '0 0 28 28');
  cursorSvg.setAttribute('fill', 'none');
  cursorSvg.setAttribute('aria-hidden', 'true');

  const cursorPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  cursorPath1.setAttribute('d', 'M6 3L18 15L12 16L15 22L12 23.5L9 17.5L5 20.5L6 3Z');
  cursorPath1.setAttribute('fill', '#8b5cf6');
  cursorPath1.setAttribute('stroke', '#4c1d95');
  cursorPath1.setAttribute('stroke-width', '1.2');

  const cursorPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  cursorPath2.setAttribute('d', 'M21 7L25 4M23 11L27 10M17 3L19 1');
  cursorPath2.setAttribute('stroke', '#8b5cf6');
  cursorPath2.setAttribute('stroke-width', '1.5');
  cursorPath2.setAttribute('stroke-linecap', 'round');

  cursorSvg.appendChild(cursorPath1);
  cursorSvg.appendChild(cursorPath2);
  paragraphContainer.appendChild(cursorSvg);

  content.appendChild(paragraphContainer);

  // 3. 4-Stop Vertical Timeline
  const timelineBlock = document.createElement('div');
  timelineBlock.className = 'left-timeline-block';
  timelineBlock.setAttribute('aria-label', 'Education and practice timeline');

  const timelineList = document.createElement('ol');
  timelineList.className = 'timeline-list';

  // One continuous thin blue connector line through the dots
  const continuousLine = document.createElement('div');
  continuousLine.className = 'timeline-continuous-line';
  continuousLine.setAttribute('aria-hidden', 'true');
  timelineList.appendChild(continuousLine);

  const stops = leftData?.timeline || [
    { institution: 'VNIT Nagpur', type: 'Education' },
    { institution: 'AtkinsRéalis', type: 'Practice' },
    { institution: 'Dar Al-Handasah', type: 'Practice' },
    { institution: 'NID Bengaluru', type: 'Education' }
  ];

  stops.forEach((stop, idx) => {
    const item = document.createElement('li');
    item.className = 'timeline-item';

    const bullet = document.createElement('span');
    bullet.className = 'timeline-bullet';
    bullet.setAttribute('aria-hidden', 'true');

    const contentDiv = document.createElement('div');
    contentDiv.className = 'timeline-item-content';

    const title = document.createElement('span');
    title.className = 'timeline-institution';
    title.textContent = stop.institution;

    const desc = document.createElement('span');
    desc.className = 'timeline-type';
    desc.textContent = stop.type;

    contentDiv.appendChild(title);
    contentDiv.appendChild(desc);

    item.appendChild(bullet);
    item.appendChild(contentDiv);
    timelineList.appendChild(item);
  });

  timelineBlock.appendChild(timelineList);
  content.appendChild(timelineBlock);

  // Next page button in single-page mode
  const singleNextBtn = document.createElement('button');
  singleNextBtn.type = 'button';
  singleNextBtn.className = 'single-page-next-btn';
  singleNextBtn.id = 'singlePageNextBtn';
  singleNextBtn.setAttribute('aria-label', 'Turn to Page 2: A little more me');

  const nextLabel = document.createElement('span');
  nextLabel.textContent = 'A little more me';

  const nextSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  nextSvg.setAttribute('viewBox', '0 0 16 16');
  nextSvg.setAttribute('fill', 'none');
  nextSvg.setAttribute('stroke', 'currentColor');
  nextSvg.setAttribute('stroke-width', '2');
  nextSvg.setAttribute('stroke-linecap', 'round');
  nextSvg.setAttribute('stroke-linejoin', 'round');
  nextSvg.setAttribute('aria-hidden', 'true');

  const nextPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  nextPath.setAttribute('d', 'M6 12l4-4-4-4');
  nextSvg.appendChild(nextPath);

  singleNextBtn.appendChild(nextLabel);
  singleNextBtn.appendChild(nextSvg);
  singleNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof onNextPage === 'function') {
      onNextPage();
    }
  });
  content.appendChild(singleNextBtn);

  page.appendChild(content);

  // 4. Page number 01
  const pageNum = document.createElement('span');
  pageNum.className = 'page-number page-number-left';
  pageNum.textContent = leftData?.pageNumber || '01';
  pageNum.setAttribute('aria-hidden', 'true');
  page.appendChild(pageNum);

  function updateTimelineLine() {
    const bullets = timelineList.querySelectorAll('.timeline-bullet');
    if (bullets.length >= 2) {
      const listRect = timelineList.getBoundingClientRect();
      const firstB = bullets[0].getBoundingClientRect();
      const lastB = bullets[bullets.length - 1].getBoundingClientRect();
      if (listRect.height > 0) {
        const topY = firstB.top + firstB.height / 2 - listRect.top;
        const bottomY = lastB.top + lastB.height / 2 - listRect.top;
        continuousLine.style.top = `${topY}px`;
        continuousLine.style.height = `${bottomY - topY}px`;
      }
    }
  }

  // Update line after render / fonts ready
  setTimeout(updateTimelineLine, 50);
  window.addEventListener('resize', updateTimelineLine);

  // Draggable interaction for Architecture Sticker
  let activeDrag = null;
  const ARCH_STORAGE_KEY = 'rushabh_arch_sticker_pos';

  // Load saved position or default
  let currentOffset = { x: 0, y: 0 };
  try {
    const saved = localStorage.getItem(ARCH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        currentOffset = parsed;
        archWrapper.style.transform = `translate(${parsed.x}px, ${parsed.y}px) rotate(-3deg)`;
      }
    }
  } catch (e) {}

  function onArchPointerDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    activeDrag = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initX: currentOffset.x,
      initY: currentOffset.y,
      hasMoved: false
    };

    archWrapper.setPointerCapture(e.pointerId);
    archWrapper.classList.add('is-dragging');
    archWrapper.style.transform = `translate(${currentOffset.x}px, ${currentOffset.y}px) rotate(-3deg) scale(1.06)`;
  }

  function onArchPointerMove(e) {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    const dx = e.clientX - activeDrag.startX;
    const dy = e.clientY - activeDrag.startY;

    if (!activeDrag.hasMoved && Math.hypot(dx, dy) < 4) return;
    activeDrag.hasMoved = true;

    // Boundary clamp within left page area
    const newX = Math.max(-180, Math.min(120, activeDrag.initX + dx));
    const newY = Math.max(-40, Math.min(260, activeDrag.initY + dy));

    currentOffset = { x: newX, y: newY };
    archWrapper.style.transform = `translate(${newX}px, ${newY}px) rotate(-3deg) scale(1.06)`;
  }

  function onArchPointerUp(e) {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    try {
      archWrapper.releasePointerCapture(activeDrag.pointerId);
    } catch (err) {}

    archWrapper.classList.remove('is-dragging');
    archWrapper.style.transform = `translate(${currentOffset.x}px, ${currentOffset.y}px) rotate(-3deg)`;
    activeDrag = null;

    try {
      localStorage.setItem(ARCH_STORAGE_KEY, JSON.stringify(currentOffset));
    } catch (e) {}
  }

  archWrapper.addEventListener('pointerdown', onArchPointerDown);
  window.addEventListener('pointermove', onArchPointerMove);
  window.addEventListener('pointerup', onArchPointerUp);
  window.addEventListener('pointercancel', onArchPointerUp);

  // Keyboard navigation for architecture sticker
  archWrapper.addEventListener('keydown', (e) => {
    let dx = 0;
    let dy = 0;
    const step = e.shiftKey ? 20 : 5;
    switch (e.key) {
      case 'ArrowLeft': dx = -step; break;
      case 'ArrowRight': dx = step; break;
      case 'ArrowUp': dy = -step; break;
      case 'ArrowDown': dy = step; break;
      default: return;
    }
    e.preventDefault();
    currentOffset.x = Math.max(-180, Math.min(120, currentOffset.x + dx));
    currentOffset.y = Math.max(-40, Math.min(260, currentOffset.y + dy));
    archWrapper.style.transform = `translate(${currentOffset.x}px, ${currentOffset.y}px) rotate(-3deg)`;
    try {
      localStorage.setItem(ARCH_STORAGE_KEY, JSON.stringify(currentOffset));
    } catch (e) {}
  });

  function resetStickers() {
    currentOffset = { x: 0, y: 0 };
    archWrapper.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    archWrapper.style.transform = 'translate(0px, 0px) rotate(-3deg)';
    setTimeout(() => {
      archWrapper.style.transition = '';
    }, 450);
    try {
      localStorage.removeItem(ARCH_STORAGE_KEY);
    } catch (e) {}
  }

  return {
    element: page,
    resetStickers,
    updateTimelineLine
  };
}

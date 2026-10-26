/**
 * Reusable ChapterDialog Component
 * Manages the chapter preview modal with accessible focus trapping,
 * ESC dismissal, backdrop click closing, and focus return.
 */
export function createChapterDialog({ chaptersData }) {
  const dialog = document.createElement('dialog');
  dialog.id = 'chapterDialog';
  dialog.className = 'chapter-dialog';
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'dialogTitle');

  let lastActiveElement = null;

  dialog.innerHTML = `
    <div class="dialog-content">
      <button type="button" class="dialog-close-btn" aria-label="Close dialog">×</button>
      <p class="dialog-eyebrow" id="dialogEyebrow">NEXT CHAPTER</p>
      <h2 class="dialog-title" id="dialogTitle">Works</h2>
      <p class="dialog-desc" id="dialogDesc">Explore chapter details and case studies.</p>
      <div class="dialog-projects" id="dialogProjects"></div>
      <div class="dialog-actions">
        <button type="button" class="dialog-back-btn">Back to the cover</button>
      </div>
    </div>
  `;

  const closeBtn = dialog.querySelector('.dialog-close-btn');
  const backBtn = dialog.querySelector('.dialog-back-btn');
  const eyebrowEl = dialog.querySelector('#dialogEyebrow');
  const titleEl = dialog.querySelector('#dialogTitle');
  const descEl = dialog.querySelector('#dialogDesc');
  const projectsEl = dialog.querySelector('#dialogProjects');

  function closeDialog() {
    if (dialog.open) {
      dialog.close();
      if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus();
      }
    }
  }

  closeBtn.addEventListener('click', closeDialog);
  backBtn.addEventListener('click', closeDialog);

  // Close on backdrop click
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeDialog();
      }
    }
  });

  // Open with chapter data
  function openChapter(chapterId, triggerElement = null) {
    lastActiveElement = triggerElement || document.activeElement;
    const data = chaptersData[chapterId] || {
      eyebrow: 'CHAPTER PREVIEW',
      title: chapterId,
      description: 'This is the cover-page reference. We’ll build this chapter next, one section at a time.'
    };

    eyebrowEl.textContent = data.eyebrow || 'NEXT CHAPTER';
    titleEl.textContent = data.title || chapterId;
    descEl.textContent = data.description || '';

    // Render projects list if available
    projectsEl.innerHTML = '';
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      const list = document.createElement('div');
      list.className = 'dialog-project-links';

      data.projects.forEach((proj) => {
        const item = document.createElement('a');
        item.href = proj.url;
        item.className = 'dialog-project-item';
        item.innerHTML = `
          <div class="proj-text">
            <strong>${proj.title}</strong>
            <span>${proj.subtitle}</span>
          </div>
          <span class="proj-arrow">↗</span>
        `;
        list.appendChild(item);
      });

      projectsEl.appendChild(list);
    }

    dialog.showModal();
    closeBtn.focus();
  }

  return {
    element: dialog,
    openChapter,
    closeDialog
  };
}

import { sketchbookData } from './data.js';
import { createHeader } from './components/Header.js';
import { createSketchbookCover } from './components/SketchbookCover.js';
import { createChapterDialog } from './components/ChapterDialog.js';

/**
 * Closed-Sketchbook Landing Page Controller
 */
function initSketchbookLanding() {
  const root = document.getElementById('appRoot') || document.body;

  // Chapter Dialog Manager
  const dialogManager = createChapterDialog({
    chaptersData: sketchbookData.chapters
  });

  // Handler for opening chapters
  function handleSelectChapter(chapterId, triggerEl = null) {
    if (chapterId === 'Home') {
      dialogManager.closeDialog();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    dialogManager.openChapter(chapterId, triggerEl);
  }

  function handleOpenSketchbook() {
    dialogManager.openChapter('Sketchbook');
  }

  // Header Component
  const header = createHeader({
    brand: sketchbookData.brand,
    navigation: sketchbookData.navigation,
    onSelectChapter: handleSelectChapter
  });

  // Main Stage
  const main = document.createElement('main');
  main.className = 'main-stage';

  // Sketchbook Cover Component
  const cover = createSketchbookCover({
    coverData: sketchbookData.cover,
    onOpenSketchbook: handleOpenSketchbook
  });

  main.appendChild(cover);

  // Mount components
  root.innerHTML = '';
  root.appendChild(header);
  root.appendChild(main);
  root.appendChild(dialogManager.element);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSketchbookLanding);
} else {
  initSketchbookLanding();
}

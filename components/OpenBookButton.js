/**
 * Cover actions: two small buttons at the bottom of the closed sketchbook.
 *   "My works"         scrolls down to the work cards
 *   "Open sketchbook"  opens the book
 * They are kept deliberately small and quiet so they never compete with the cover.
 * The wrapper keeps the old class name (open-book-btn), so the reveal sequence and focus handling keep working.
 */
function scrollToWorks() {
  const target = document.getElementById('works') || document.getElementById('pageContent');
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}

export function createOpenBookButton({ label = 'Open sketchbook', worksLabel = 'My works', onOpenSketchbook, onOpenWorks }) {
  const wrap = document.createElement('div');
  wrap.className = 'open-book-btn cover-actions';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Explore');
  wrap.setAttribute('data-chapter', 'Sketchbook');

  // 1) My works
  const works = document.createElement('button');
  works.type = 'button';
  works.className = 'cover-action cover-action--works';
  works.innerHTML = '<span>' + worksLabel + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
  works.addEventListener('click', () => {
    if (typeof onOpenWorks === 'function') onOpenWorks(); else scrollToWorks();
  });

  // 2) Open sketchbook
  const book = document.createElement('button');
  book.type = 'button';
  book.className = 'cover-action cover-action--book';
  book.setAttribute('aria-label', 'Open my sketchbook');
  book.innerHTML = '<span>' + label.replace(/^Open my /i, 'Open ') + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  book.addEventListener('click', () => {
    if (typeof onOpenSketchbook === 'function') onOpenSketchbook();
  });

  wrap.appendChild(works);
  wrap.appendChild(book);
  // closing the book returns focus to the "Open sketchbook" button
  wrap.focus = () => book.focus();
  return wrap;
}

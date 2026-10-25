const fs = require('fs');

let content = fs.readFileSync('script.js', 'utf8');

// 1. Add initBigFourSection() to DOMContentLoaded
const targetCall = 'initSpectrumSection();';
if (!content.includes('initBigFourSection();')) {
    content = content.replace(targetCall, 'initSpectrumSection();\r\n    initBigFourSection();');
}

// 2. Append initBigFourSection function implementation
const bigFourFunc = `

/**
 * SECTION 9: The Big Four - Deadliest Draw Card Deck
 * Interaction Logic:
 * - 4 Playing cards with realistic discard pile layout
 * - Draw a card button with custom arrow icon
 * - Card index progress indicator (e.g. 1 / 4)
 * - Reset / Recycle deck once all cards drawn
 * - Horizontal swipe support with non-blocking vertical scroll pass-through
 * - Keyboard accessible
 */
function initBigFourSection() {
    const stage = document.getElementById('cardStack');
    const drawBtn = document.getElementById('bigfourDrawBtn');
    const drawBtnText = document.getElementById('bigfourDrawBtnText');
    const cardIndexEl = document.getElementById('bigfourCardIndex');

    if (!stage || !drawBtn) return;

    const cards = Array.from(stage.querySelectorAll('.card'));
    if (!cards.length) return;

    let deck = [0, 1, 2, 3];
    let discarded = [];

    function updateDeckLayout() {
        deck.forEach((cardIdx, stackIndex) => {
            const card = cards[cardIdx];
            card.classList.remove('discarded');
            card.classList.add('in-deck');
            card.style.transform = ''; 
            card.style.zIndex = '';
            card.style.opacity = '';
            card.setAttribute('data-index', stackIndex);
        });

        if (deck.length > 0) {
            const activeNum = 4 - deck.length + 1;
            if (cardIndexEl) cardIndexEl.textContent = activeNum;
            if (drawBtnText) drawBtnText.textContent = "Draw a card";
            drawBtn.setAttribute('aria-label', \`Draw a card. Currently showing card \${activeNum} of 4.\`);
        } else {
            if (cardIndexEl) cardIndexEl.textContent = "4";
            if (drawBtnText) drawBtnText.textContent = "Reset deck ↺";
            drawBtn.setAttribute('aria-label', "Reset deck to draw cards again");
        }
    }

    function throwToDiscardPile(card) {
        card.classList.remove('in-deck');
        card.classList.add('discarded');
        
        const isNarrow = window.innerWidth < 640;
        const offsetX = isNarrow ? (window.innerWidth / 2 + 140) : 340;
        const randomY = (Math.random() - 0.5) * 24;
        const randomRot = (Math.random() - 0.5) * 16 + 10;
        
        card.style.transform = \`translate(\${offsetX}px, \${randomY}px) rotate(\${randomRot}deg) scale(0.92)\`;
        card.style.opacity = isNarrow ? '0' : '0.45';
        card.style.zIndex = discarded.length; 
    }

    function drawCard() {
        if (deck.length === 0) {
            collectCards();
            return;
        }

        const topCardIdx = deck.shift();
        discarded.push(topCardIdx);
        
        const topCard = cards[topCardIdx];
        throwToDiscardPile(topCard);
        
        updateDeckLayout();
    }

    function collectCards() {
        if (discarded.length === 0) return;
        
        deck = [...discarded.reverse(), ...deck];
        discarded = [];
        
        updateDeckLayout();
    }

    drawBtn.addEventListener('click', drawCard);

    // Keyboard accessibility on cards
    cards.forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                drawCard();
            }
        });
    });

    // Touch and Drag Logic
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let hasDeterminedDirection = false;

    function handleStart(e) {
        if (deck.length === 0) return;
        const topCard = cards[deck[0]];
        if (!e.target.closest('.card') || e.target.closest('.card') !== topCard) return;

        isDragging = true;
        hasDeterminedDirection = false;
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        topCard.style.transition = 'none';
    }

    function handleMove(e) {
        if (!isDragging || deck.length === 0) return;
        currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const diffX = currentX - startX;
        const diffY = currentY - startY;

        // Preserve natural vertical scrolling if user is scrolling page
        if (!hasDeterminedDirection) {
            if (Math.abs(diffY) > Math.abs(diffX)) {
                isDragging = false;
                return;
            }
            hasDeterminedDirection = true;
        }

        if (e.cancelable) e.preventDefault();

        const topCard = cards[deck[0]];
        topCard.style.transform = \`translate(\${diffX}px, \${diffY * 0.3}px) rotate(\${diffX * 0.05}deg)\`;
    }

    function handleEnd() {
        if (!isDragging || deck.length === 0) return;
        isDragging = false;
        
        const diffX = currentX - startX;
        const topCard = cards[deck[0]];
        
        topCard.style.transition = 'transform 0.48s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease, box-shadow 0.35s ease';

        if (Math.abs(diffX) > 80) {
            drawCard();
        } else {
            topCard.style.transform = '';
        }
        
        startX = 0;
        currentX = 0;
    }

    stage.addEventListener('touchstart', handleStart, {passive: false});
    window.addEventListener('touchmove', handleMove, {passive: false});
    window.addEventListener('touchend', handleEnd);

    stage.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    updateDeckLayout();
}
`;

if (!content.includes('function initBigFourSection()')) {
    content += bigFourFunc;
}

fs.writeFileSync('script.js', content, 'utf8');
console.log('Successfully updated script.js with Big Four card deck controller.');

const fs = require('fs');

let css = fs.readFileSync('scratch/snc_styles.css', 'utf8');

// Replace font-sans with Google Sans Flex
css = css.replace(
    "--font-sans: inherit;",
    "--font-sans: 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif;"
);

// Make component background transparent for seamless site background integration
css = css.replace(
    "background-color: var(--forest);",
    "background-color: transparent;"
);

// Outer padding clamp(64px, 5vw, 80px)
css = css.replace(
    "padding: clamp(48px, 5vw, 72px);",
    "padding: clamp(64px, 5vw, 80px);"
);

// Update species row card styling with arrow support
const oldRowCss = `#snakes-neighbourhood-component .snc-species-row {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 14px 10px;
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--subtle-border);
            color: var(--ivory);
            font-family: inherit;
            text-align: left;
            cursor: pointer;
            transition: background-color 180ms ease;
        }

        #snakes-neighbourhood-component .snc-species-row:hover {
            background-color: rgba(168, 185, 163, 0.08);
        }

        #snakes-neighbourhood-component .snc-species-row:focus-visible {
            outline: 2px solid var(--ivory);
            outline-offset: -2px;
        }

        #snakes-neighbourhood-component .snc-species-row[aria-pressed="true"] {
            background-color: rgba(168, 185, 163, 0.14);
            border-left: 3px solid var(--ivory);
            padding-left: 13px;
        }`;

const newRowCss = `#snakes-neighbourhood-component .snc-species-row {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 12px 16px;
            margin-bottom: 10px;
            background: rgba(10, 41, 32, 0.50);
            border: 1px solid var(--subtle-border);
            border-radius: 8px;
            color: var(--ivory);
            font-family: inherit;
            text-align: left;
            cursor: pointer;
            transition: background-color 180ms ease, border-color 180ms ease, transform 180ms ease;
        }

        #snakes-neighbourhood-component .snc-species-row:hover {
            background-color: rgba(168, 185, 163, 0.12);
            border-color: var(--sage);
            transform: translateX(2px);
        }

        #snakes-neighbourhood-component .snc-species-row:focus-visible {
            outline: 2px solid var(--ivory);
            outline-offset: 2px;
        }

        #snakes-neighbourhood-component .snc-species-row[aria-pressed="true"] {
            background-color: rgba(168, 185, 163, 0.18);
            border-color: var(--ivory);
            box-shadow: 0 0 0 1px var(--ivory);
        }

        #snakes-neighbourhood-component .snc-row-right {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
        }

        #snakes-neighbourhood-component .snc-obs-count-line {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
        }

        #snakes-neighbourhood-component .snc-row-arrow {
            stroke: var(--sage);
            transition: transform 180ms ease, stroke 180ms ease;
            flex-shrink: 0;
        }

        #snakes-neighbourhood-component .snc-species-row:hover .snc-row-arrow {
            stroke: var(--ivory);
            transform: translateX(3px);
        }`;

if (css.includes('#snakes-neighbourhood-component .snc-species-row {')) {
    // Replace the block
    css = css.replace(oldRowCss, newRowCss);
}

// Ensure subtle section entrance
css += `
/* Subtle Section Entrance */
.snakes-neighbourhood-section {
    opacity: 1;
    transition: opacity 0.4s ease-out;
}
`;

fs.writeFileSync('assets/neighbourhood_map.css', css);
console.log('Wrote assets/neighbourhood_map.css successfully!');

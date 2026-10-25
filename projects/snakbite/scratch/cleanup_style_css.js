const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// Replace .scroll-canvas-spacer height
css = css.replace(
`.scroll-canvas-spacer {
    height: 85vh;
}`,
`.scroll-canvas-spacer {
    height: 0;
    margin: 0;
    padding: 0;
}`
);

// Remove SECTION 10: LOOK CLOSER block
const lookCloserStart = css.indexOf('/* ==========================================================================\n   SECTION 10: LOOK CLOSER');
if (lookCloserStart !== -1) {
    css = css.substring(0, lookCloserStart).trimEnd() + '\n';
    console.log('Removed old lookcloser section CSS from style.css');
} else {
    // try with \r\n
    const lookCloserStartCRLF = css.indexOf('/* ==========================================================================\r\n   SECTION 10: LOOK CLOSER');
    if (lookCloserStartCRLF !== -1) {
        css = css.substring(0, lookCloserStartCRLF).trimEnd() + '\n';
        console.log('Removed old lookcloser section CSS (CRLF) from style.css');
    } else {
        console.warn('Could not find lookcloser section in style.css');
    }
}

fs.writeFileSync('style.css', css);
console.log('Updated style.css successfully!');

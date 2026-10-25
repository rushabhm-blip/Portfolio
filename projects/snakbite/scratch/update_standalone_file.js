const fs = require('fs');

let html = fs.readFileSync('who_shares_your_neighbourhood_snakes_india-v4.html', 'utf8');

// 1. Remove gesture gate HTML
const oldGateHtml = `                <!-- Deliberate Map Scroll-Wheel Toggle -->
                <div class="snc-gesture-gate">
                    <button type="button" class="snc-gesture-btn" id="snc-gesture-btn" aria-pressed="false" onclick="window.SNC.toggleScrollWheelZoom()">
                        Enable scroll zoom
                    </button>
                </div>`;

if (html.includes(oldGateHtml)) {
    html = html.replace(oldGateHtml, '');
    console.log('Removed gesture gate HTML from standalone file');
}

// 2. Update CSS for grid, map area and map frame height
html = html.replace('row-gap: 28px;\n            align-items: start;', 'row-gap: 28px;\n            align-items: stretch;');
html = html.replace(
`        #snakes-neighbourhood-component .snc-map-area {
            grid-area: map;
            min-width: 0;
            position: relative;
        }`,
`        #snakes-neighbourhood-component .snc-map-area {
            grid-area: map;
            min-width: 0;
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
        }`
);

html = html.replace(
`        #snakes-neighbourhood-component .snc-map-frame {
            width: 100%;
            height: clamp(560px, 68vh, 700px);`,
`        #snakes-neighbourhood-component .snc-map-frame {
            width: 100%;
            height: 100%;
            flex: 1 1 auto;
            min-height: clamp(620px, 75vh, 800px);`
);

// Mobile map frame height in standalone
html = html.replace(
`            #snakes-neighbourhood-component .snc-map-frame {
                height: clamp(380px, 54vh, 460px);
            }`,
`            #snakes-neighbourhood-component .snc-map-area {
                height: auto;
            }
            #snakes-neighbourhood-component .snc-map-frame {
                min-height: 0;
                height: clamp(400px, 54vh, 500px);
            }`
);

// 3. Update scrollWheelZoom: false to true in JS
html = html.replace('scrollWheelZoom: false', 'scrollWheelZoom: true, wheelDebounceTime: 40, wheelPxPerZoomLevel: 60');

fs.writeFileSync('who_shares_your_neighbourhood_snakes_india-v4.html', html);
console.log('Saved who_shares_your_neighbourhood_snakes_india-v4.html');

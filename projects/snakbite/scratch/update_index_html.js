const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Leaflet & MarkerCluster CSS into <head>
const oldHeadLink = '<link rel="stylesheet" href="style.css?v=cobra_v1">';
const newHeadLinks = `    <!-- Leaflet & MarkerCluster for Neighbourhood Observations Map -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css" />
    <link rel="stylesheet" href="assets/neighbourhood_map.css?v=snc_v1" />
    <link rel="stylesheet" href="style.css?v=snc_v1">`;

if (html.includes(oldHeadLink)) {
    html = html.replace(oldHeadLink, newHeadLinks);
    console.log('Updated <head> links in index.html');
} else {
    // try fallback
    html = html.replace(/<link rel="stylesheet" href="style\.css[^"]*">/, newHeadLinks);
    console.log('Updated <head> links (regex) in index.html');
}

// 2. Replace SECTION 10 cobra section with the observation map section
const oldSectionStart = html.indexOf('<!-- SECTION 10: LOOK CLOSER');
if (oldSectionStart === -1) {
    console.error('Could not find SECTION 10 in index.html!');
    process.exit(1);
}

const mainClose = html.indexOf('</main>', oldSectionStart);
if (mainClose === -1) {
    console.error('Could not find </main> in index.html!');
    process.exit(1);
}

const newSectionHtml = `<!-- SECTION 10: WHO SHARES YOUR NEIGHBOURHOOD - INTERACTIVE OBSERVATION MAP -->
        <section id="snakes-neighbourhood-component" class="snakes-neighbourhood-section" aria-labelledby="snc-main-heading">
            <div class="snc-grid">
                <!-- 1. Heading & Search Controls -->
                <div class="snc-intro">
                    <p class="snc-eyebrow">EXPLORE THE OBSERVATIONS</p>
                    <h2 class="snc-heading" id="snc-main-heading">Who shares your neighbourhood?</h2>
                    <p class="snc-supporting">Explore recorded snake sightings across India.</p>

                    <form class="snc-search-form" id="snc-search-form" onsubmit="event.preventDefault(); window.SNC.runLocationSearch();">
                        <div class="snc-input-wrap">
                            <svg class="snc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input
                                type="text"
                                id="snc-location-input"
                                class="snc-location-input"
                                value=""
                                placeholder="Search an area, city or postcode"
                                aria-label="Search an area, city or postcode"
                                autocomplete="off"
                            />
                        </div>
                        <button type="submit" class="snc-btn-search" id="snc-btn-search">Search</button>
                    </form>

                    <div class="snc-primary-actions">
                        <button type="button" class="snc-btn-location" id="snc-btn-my-location" onclick="window.SNC.useMyLocation()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="3.5"/>
                                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                                <circle cx="12" cy="12" r="8"/>
                            </svg>
                            <span>Use my location</span>
                        </button>

                        <button type="button" class="snc-text-control" id="snc-btn-pick-map" aria-pressed="false" onclick="window.SNC.togglePickOnMap()">
                            Choose on map
                        </button>
                    </div>

                    <!-- Explicit Manual Point Selection Banner -->
                    <div class="snc-pick-banner" id="snc-pick-banner" hidden>
                        <span>Click anywhere on the map to set your search location.</span>
                        <button type="button" class="snc-secondary-btn" onclick="window.SNC.togglePickOnMap(false)">Cancel</button>
                    </div>

                    <!-- Secondary Controls: Change Radius (shown after location selected) & Filter Species -->
                    <div class="snc-secondary-bar">
                        <div class="snc-radius-wrap" id="snc-radius-wrap" hidden>
                            <label for="snc-radius-select">Change radius</label>
                            <select id="snc-radius-select" class="snc-select" onchange="window.SNC.onRadiusChange(this.value)">
                                <option value="5" selected>5 km</option>
                                <option value="10">10 km</option>
                                <option value="25">25 km</option>
                                <option value="50">50 km</option>
                            </select>
                        </div>

                        <button type="button" class="snc-text-control" id="snc-btn-toggle-sp-filter" aria-expanded="false" onclick="window.SNC.toggleSpeciesSearchPanel()">
                            Filter species
                        </button>
                    </div>

                    <div class="snc-species-filter-panel" id="snc-species-filter-panel" hidden>
                        <div class="snc-species-filter-row">
                            <input
                                type="text"
                                id="snc-species-input"
                                class="snc-species-input"
                                list="snc-species-datalist"
                                placeholder="Type a common or scientific name"
                                aria-label="Filter by snake species name"
                                onkeydown="if(event.key==='Enter'){event.preventDefault(); window.SNC.applySpeciesInputFilter();}"
                            />
                            <datalist id="snc-species-datalist"></datalist>
                            <button type="button" class="snc-secondary-btn" onclick="window.SNC.applySpeciesInputFilter()">Apply</button>
                        </div>
                    </div>
                </div>

                <!-- 2. Main Interactive Map -->
                <div class="snc-map-area">
                    <div class="snc-map-frame" id="snc-map-frame">
                        <div class="snc-map-top-bar">
                            <div class="snc-map-left-controls">
                                <button type="button" class="snc-map-btn" id="snc-btn-all-india" onclick="window.SNC.resetToAllIndia()">
                                    All India
                                </button>

                                <select id="snc-explore-select" class="snc-map-select" aria-label="Explore a place" onchange="window.SNC.jumpToPresetPlace(this.value)">
                                    <option value="">Explore a place</option>
                                    <option value="13.5027,75.0903,Agumbe, Karnataka">Agumbe, Karnataka</option>
                                    <option value="13.0285,77.5197,Peenya, Bengaluru">Peenya, Bengaluru</option>
                                    <option value="19.0760,72.8777,Mumbai, Maharashtra">Mumbai, Maharashtra</option>
                                    <option value="18.5204,73.8567,Pune, Maharashtra">Pune, Maharashtra</option>
                                    <option value="15.3339,74.2883,Mollem, Goa">Mollem, Goa</option>
                                    <option value="10.1249,76.6790,Thattekad, Kerala">Thattekad, Kerala</option>
                                    <option value="13.0827,80.2707,Chennai, Tamil Nadu">Chennai, Tamil Nadu</option>
                                    <option value="22.5726,88.3639,Kolkata, West Bengal">Kolkata, West Bengal</option>
                                    <option value="26.1445,91.7362,Guwahati, Assam">Guwahati, Assam</option>
                                    <option value="28.6139,77.2090,New Delhi">New Delhi</option>
                                </select>
                            </div>

                            <div class="snc-zoom-group" role="group" aria-label="Map zoom controls">
                                <button type="button" class="snc-zoom-btn" onclick="window.SNC.zoomIn()" aria-label="Zoom in" title="Zoom in">+</button>
                                <button type="button" class="snc-zoom-btn" onclick="window.SNC.zoomOut()" aria-label="Zoom out" title="Zoom out">−</button>
                            </div>
                        </div>

                        <!-- Deliberate Map Scroll-Wheel Toggle -->
                        <div class="snc-gesture-gate">
                            <button type="button" class="snc-gesture-btn" id="snc-gesture-btn" aria-pressed="false" onclick="window.SNC.toggleScrollWheelZoom()">
                                Enable scroll zoom
                            </button>
                        </div>

                        <div id="snc-main-map" role="region" aria-label="Interactive map of recorded snake observations across India"></div>

                        <!-- Single Quiet Map Legend -->
                        <div class="snc-map-legend" aria-label="Map legend">
                            <div class="snc-legend-row">
                                <span class="snc-legend-dot" aria-hidden="true"></span>
                                <span>Recorded observation</span>
                            </div>
                            <div class="snc-legend-row">
                                <span class="snc-legend-cluster" aria-hidden="true">12</span>
                                <span>Numbered cluster</span>
                            </div>
                            <div class="snc-legend-row" id="snc-legend-search-area" hidden>
                                <span class="snc-legend-area" aria-hidden="true"></span>
                                <span>Search area</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Nearby Species Results & Persistent Source Note -->
                <div class="snc-results-area">
                    <div class="snc-status-msg" id="snc-status-msg" role="status" aria-live="polite" hidden></div>

                    <div class="snc-invitation" id="snc-invitation">
                        Search your area to discover species recorded within 5 km.
                    </div>

                    <div class="snc-results-header" id="snc-results-header" hidden>
                        <h3 class="snc-results-title" id="snc-results-title">Most recorded species near your area</h3>
                        <p class="snc-results-sub" id="snc-results-sub">Within 5 km · 0 observations</p>
                    </div>

                    <div class="snc-active-filter-bar" id="snc-active-filter-bar" hidden>
                        <span id="snc-active-filter-text">Filtered by species</span>
                        <button type="button" class="snc-text-control" onclick="window.SNC.clearSpeciesFilter()" style="min-height: 32px; padding: 2px 6px; font-size: 14px;">
                            Clear species filter
                        </button>
                    </div>

                    <div class="snc-species-list" id="snc-species-list" role="list"></div>

                    <div class="snc-expand-wrap" id="snc-expand-wrap" hidden>
                        <button type="button" class="snc-secondary-btn" id="snc-btn-expand" onclick="window.SNC.toggleExpandAllSpecies()">
                            View all recorded species
                        </button>
                    </div>

                    <div class="snc-footer-notes">
                        <div class="snc-persistent-note">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="flex-shrink:0;">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            <span>Records show past observations, not real-time presence.</span>
                        </div>
                        <div id="snc-dataset-summary">Source: Community-contributed snake observation dataset (iNaturalist open data).</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Zero height spacer anchor -->
        <div class="scroll-canvas-spacer" id="next-stages-anchor"></div>
    `;

html = html.substring(0, oldSectionStart) + newSectionHtml + html.substring(mainClose);

// 3. Add Scripts before </body>
const scriptSection = `    <!-- Leaflet & MarkerCluster JS Dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.js"></script>
    <!-- Observation Dataset and Interactive Map Controller -->
    <script src="assets/snake_observations_data.js"></script>
    <script src="assets/neighbourhood_map.js"></script>
    <script src="script.js?v=snc_v1"></script>
</body>`;

html = html.replace(/<script src="script\.js[^"]*"><\/script>\s*<\/body>/, scriptSection);

fs.writeFileSync('index.html', html);
console.log('Updated index.html successfully!');

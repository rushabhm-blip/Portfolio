(function() {
    'use strict';

    // Detect standalone vs embedded mode
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbedded = urlParams.get('embed') === '1' || urlParams.get('embedded') === 'true' || window.self !== window.top;
    const rootEl = document.getElementById('snakes-neighbourhood-component');
    if (isEmbedded) {
        document.documentElement.classList.add('snakes-embedded-page');
        rootEl.classList.add('is-embedded');
    } else {
        document.documentElement.classList.add('snakes-standalone-page');
    }

    // Escape external/dataset strings before inserting into HTML markup
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Validate dataset availability
    const SPECIES = (typeof DB !== 'undefined' && Array.isArray(DB.species)) ? DB.species : (window.SNC_DB && Array.isArray(window.SNC_DB.species) ? window.SNC_DB.species : null);
    const DATA = (typeof DB !== 'undefined' && Array.isArray(DB.data)) ? DB.data : (window.SNC_DB && Array.isArray(window.SNC_DB.data) ? window.SNC_DB.data : null);

    const statusEl = document.getElementById('snc-status-msg');
    const summaryEl = document.getElementById('snc-dataset-summary');

    function showStatus(htmlContent, isError = false) {
        statusEl.innerHTML = htmlContent;
        statusEl.classList.toggle('is-error', Boolean(isError));
        statusEl.hidden = false;
    }

    function clearStatus() {
        statusEl.innerHTML = '';
        statusEl.classList.remove('is-error');
        statusEl.hidden = true;
    }

    if (!SPECIES || !DATA || DATA.length === 0) {
        showStatus('<div><span class="snc-error-dot"></span>Observation data failed to load. Please refresh or check the dataset source.</div>', true);
        return;
    }

    // Dynamically calculate total record count from actual loaded dataset
    const totalDatasetRecords = DATA.length;
    const totalDatasetSpecies = SPECIES.length;
    summaryEl.textContent = `${totalDatasetRecords.toLocaleString()} recorded observations across ${totalDatasetSpecies.toLocaleString()} taxa in this dataset (iNaturalist open data).`;

    // Populate species datalist for secondary species filter
    const datalistEl = document.getElementById('snc-species-datalist');
    if (datalistEl) {
        const frag = document.createDocumentFragment();
        SPECIES.forEach(sp => {
            if (sp.com && sp.com !== 'Unknown') {
                const opt = document.createElement('option');
                opt.value = `${sp.com} (${sp.sci})`;
                frag.appendChild(opt);
            } else if (sp.sci) {
                const opt = document.createElement('option');
                opt.value = sp.sci;
                frag.appendChild(opt);
            }
        });
        datalistEl.appendChild(frag);
    }

    const URL_PREFIXES = [
        "https://inaturalist-open-data.s3.amazonaws.com/photos/",
        "https://static.inaturalist.org/photos/"
    ];
    const URL_EXTS = ["/square.jpg", "/square.JPG", "/square.jpeg", "/square.png"];

    // Neutral SVG fallback for broken thumbnails
    const THUMB_FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">' +
        '<rect width="52" height="52" fill="#0A2920"/>' +
        '<path d="M14 33c5-8 10-8 15 0s9 8 11-2" fill="none" stroke="#A8B9A3" stroke-width="1.8" stroke-linecap="round"/>' +
        '</svg>'
    );

    // Component State — Initial state is National Overview with no preselected locality
    const INDIA_CENTER = [22.2, 79.2];
    const INDIA_ZOOM = 5;

    let hasActiveLocation = false;
    let searchLat = null;
    let searchLon = null;
    let searchName = "";
    let searchIsApproximate = false;
    let searchRadiusKm = 5;
    let selectedSpeciesIdx = null;
    let isExpandedResults = false;
    let isPickOnMapMode = false;
    let scrollZoomEnabled = false;
    let currentLocalIndices = [];

    // Initialize Single Main Map with visible attribution and deliberate scroll-zoom control
    const mainMap = L.map('snc-main-map', {
        center: INDIA_CENTER,
        zoom: INDIA_ZOOM,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true, wheelDebounceTime: 40, wheelPxPerZoomLevel: 60
    });

    mainMap.attributionControl.setPrefix('Leaflet');

    // Single readable primary basemap (Esri World Street Map — 100% free, no API key, works on file:// without 403 blocks)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        className: 'snc-basemap-tiles',
        attribution: 'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom'
    }).addTo(mainMap);

    // Community-maintained India state boundary overlay (no unsupported official claim)
    fetch('https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson')
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Boundary GeoJSON status ' + r.status)))
        .then(geo => {
            L.geoJSON(geo, {
                style: {
                    color: '#A8B9A3',
                    weight: 0.9,
                    opacity: 0.38,
                    fillColor: '#071F18',
                    fillOpacity: 0.12,
                    interactive: false
                }
            }).addTo(mainMap);
        })
        .catch(() => {
            // Non-blocking: basemap already includes boundaries
        });

    // Numbered Cluster Group with flat muted-green fill, ivory numerals, and 28/34/42/50 px visual sizes
    const clusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        chunkInterval: 100,
        chunkDelay: 12,
        maxClusterRadius: function(zoom) {
            if (zoom <= 5) return 80;
            if (zoom <= 7) return 65;
            if (zoom <= 10) return 50;
            return 35;
        },
        disableClusteringAtZoom: 14,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            let sizeClass = 'snc-cluster-28';
            let boxSize = 44;
            if (count >= 1000) {
                sizeClass = 'snc-cluster-50';
                boxSize = 50;
            } else if (count >= 200) {
                sizeClass = 'snc-cluster-42';
                boxSize = 44;
            } else if (count >= 30) {
                sizeClass = 'snc-cluster-34';
                boxSize = 44;
            }

            const label = count >= 1000
                ? (count >= 10000 ? (count / 1000).toFixed(1) + 'k' : count.toLocaleString())
                : String(count);

            return L.divIcon({
                html: `<div class="snc-cluster-hit"><div class="snc-cluster-circle ${sizeClass}"><span>${escapeHtml(label)}</span></div></div>`,
                className: 'snc-cluster-icon',
                iconSize: L.point(boxSize, boxSize)
            });
        }
    });

    mainMap.addLayer(clusterGroup);

    // Build Small, Readable Popup Content (escaped, no dominant venom badges, photo ID treated strictly as photo URL)
    function buildPopup(row) {
        const sp = SPECIES[row[2]] || { com: 'Recorded snake', sci: '', status: '' };
        const hasPhotoId = row[5] !== undefined && row[5] !== null && URL_PREFIXES[row[6]] && URL_EXTS[row[7]];
        const sqPhotoUrl = hasPhotoId ? (URL_PREFIXES[row[6]] + row[5] + URL_EXTS[row[7]]) : '';
        const medPhotoUrl = sqPhotoUrl ? sqPhotoUrl.replace('/square.', '/medium.') : '';

        const comName = (sp.com && sp.com !== 'Unknown') ? sp.com : sp.sci;
        const sciName = sp.sci || '';
        const obsDate = row[3] || 'Date not recorded';
        const locDesc = row[4] ? row[4] : `${Number(row[0]).toFixed(3)}°N, ${Number(row[1]).toFixed(3)}°E`;
        const suppliedClass = sp.status ? sp.status : '';

        const imgHtml = sqPhotoUrl
            ? `<img class="snc-popup-img" referrerpolicy="no-referrer" src="${escapeHtml(sqPhotoUrl)}" alt="${escapeHtml(comName)}" loading="lazy" onerror="this.style.display='none'"/>`
            : '';

        const linkHtml = medPhotoUrl
            ? `<a class="snc-popup-link" href="${escapeHtml(medPhotoUrl)}" target="_blank" rel="noopener noreferrer">View source photo (iNaturalist) ↗</a>`
            : '';

        const classLine = suppliedClass
            ? `<div><span>Dataset group:</span> ${escapeHtml(suppliedClass)} (not for field ID)</div>`
            : '';

        return `
            <div>
                ${imgHtml}
                <div class="snc-popup-body">
                    <div class="snc-popup-com">${escapeHtml(comName)}</div>
                    ${sciName ? `<div class="snc-popup-sci">${escapeHtml(sciName)}</div>` : ''}
                    <div class="snc-popup-meta">
                        <div><span>Observed:</span> ${escapeHtml(obsDate)}</div>
                        <div><span>Location:</span> ${escapeHtml(locDesc)}</div>
                        ${classLine}
                    </div>
                    ${linkHtml}
                </div>
            </div>
        `;
    }

    // Build Individual Observation Markers (Small sage dots with restrained contrasting outline)
    const allMarkers = new Array(DATA.length);
    for (let i = 0; i < DATA.length; i++) {
        const r = DATA[i];
        const m = L.circleMarker([r[0], r[1]], {
            radius: 4.5,
            fillColor: '#A8B9A3',
            color: '#071F18',
            weight: 1.25,
            opacity: 0.95,
            fillOpacity: 0.88
        });
        m.bindPopup(() => buildPopup(r), { maxWidth: 245 });
        allMarkers[i] = m;
    }
    clusterGroup.addLayers(allMarkers);

    // Search Area & Location Pin Overlays on mainMap
    let searchPinMarker = null;
    let searchRadiusCircle = null;

    function createSearchPinIcon(label) {
        return L.divIcon({
            className: '',
            html: `
                <div class="snc-search-pin-wrap">
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" fill="rgba(7, 31, 24, 0.9)" stroke="#EEECE3" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3.5" fill="#EEECE3"/>
                    </svg>
                    <span class="snc-search-pin-label">${escapeHtml(label)}</span>
                </div>
            `,
            iconAnchor: [12, 12]
        });
    }

    // Haversine Distance in km
    function getDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function moveMapTo(lat, lon, zoom) {
        if (prefersReducedMotion()) {
            mainMap.setView([lat, lon], zoom, { animate: false });
        } else {
            mainMap.flyTo([lat, lon], zoom, { duration: 0.85 });
        }
    }

    function getZoomForRadius(radiusKm) {
        if (radiusKm <= 5) return 12;
        if (radiusKm <= 10) return 11;
        if (radiusKm <= 25) return 10;
        return 9;
    }

    // Synchronize Map Markers with Current Search Location & Species Filter
    function syncMapLayers() {
        clusterGroup.clearLayers();

        if (hasActiveLocation) {
            const subset = [];
            for (let j = 0; j < currentLocalIndices.length; j++) {
                const idx = currentLocalIndices[j];
                if (selectedSpeciesIdx === null || DATA[idx][2] === selectedSpeciesIdx) {
                    subset.push(allMarkers[idx]);
                }
            }
            clusterGroup.addLayers(subset);
        } else {
            if (selectedSpeciesIdx === null) {
                clusterGroup.addLayers(allMarkers);
            } else {
                const subset = [];
                for (let i = 0; i < DATA.length; i++) {
                    if (DATA[i][2] === selectedSpeciesIdx) {
                        subset.push(allMarkers[i]);
                    }
                }
                clusterGroup.addLayers(subset);
            }
        }

        // Update active species filter bar
        const filterBarEl = document.getElementById('snc-active-filter-bar');
        const filterTextEl = document.getElementById('snc-active-filter-text');
        if (selectedSpeciesIdx !== null && SPECIES[selectedSpeciesIdx]) {
            const sp = SPECIES[selectedSpeciesIdx];
            const name = (sp.com && sp.com !== 'Unknown') ? sp.com : sp.sci;
            filterTextEl.textContent = hasActiveLocation
                ? `Showing ${name} within ${searchRadiusKm} km`
                : `Showing ${name} across India`;
            filterBarEl.hidden = false;
        } else {
            filterBarEl.hidden = true;
        }
    }

    // Apply or Update Local Search View
    function updateLocalSearch(shouldMoveMap = true) {
        if (!hasActiveLocation || searchLat === null || searchLon === null) return;

        // Show radius control and search-area legend item
        document.getElementById('snc-radius-wrap').hidden = false;
        document.getElementById('snc-legend-search-area').hidden = false;
        document.getElementById('snc-invitation').hidden = true;
        document.getElementById('snc-results-header').hidden = false;

        // Draw search pin and thin sage radius outline on mainMap
        if (searchPinMarker) mainMap.removeLayer(searchPinMarker);
        if (searchRadiusCircle) mainMap.removeLayer(searchRadiusCircle);

        const pinLabel = searchIsApproximate ? `${searchName} (approx.)` : searchName;
        searchPinMarker = L.marker([searchLat, searchLon], {
            icon: createSearchPinIcon(pinLabel),
            interactive: false
        }).addTo(mainMap);

        searchRadiusCircle = L.circle([searchLat, searchLon], {
            radius: searchRadiusKm * 1000,
            color: '#A8B9A3',
            weight: 1.5,
            opacity: 0.85,
            fillColor: '#A8B9A3',
            fillOpacity: 0.08,
            interactive: false
        }).addTo(mainMap);

        if (shouldMoveMap) {
            moveMapTo(searchLat, searchLon, getZoomForRadius(searchRadiusKm));
        }

        // Compute qualifying observations within radius
        const spCounts = new Int32Array(SPECIES.length);
        currentLocalIndices = [];

        for (let i = 0; i < DATA.length; i++) {
            const r = DATA[i];
            const d = getDistanceKm(searchLat, searchLon, r[0], r[1]);
            if (d <= searchRadiusKm) {
                spCounts[r[2]]++;
                currentLocalIndices.push(i);
            }
        }

        // Reset selected species if it has 0 observations in the new radius/location
        if (selectedSpeciesIdx !== null && spCounts[selectedSpeciesIdx] === 0) {
            selectedSpeciesIdx = null;
        }

        const totalObs = currentLocalIndices.length;

        // Update editorial headings
        const titleEl = document.getElementById('snc-results-title');
        const subEl = document.getElementById('snc-results-sub');
        titleEl.textContent = `Most recorded species near ${searchName}`;
        subEl.textContent = `Within ${searchRadiusKm} km · ${totalObs.toLocaleString()} ${totalObs === 1 ? 'observation' : 'observations'}`;

        syncMapLayers();
        renderSpeciesList(spCounts, totalObs);
        requestAnimationFrame(() => mainMap.invalidateSize({ pan: false }));
    }

    // Render Top 3 Distinct Species (or inline expansion on request)
    function renderSpeciesList(spCounts, totalObs) {
        const listEl = document.getElementById('snc-species-list');
        const expandWrapEl = document.getElementById('snc-expand-wrap');
        const expandBtnEl = document.getElementById('snc-btn-expand');

        listEl.innerHTML = '';

        const ranked = [];
        for (let i = 0; i < SPECIES.length; i++) {
            if (spCounts[i] > 0) {
                ranked.push({ idx: i, count: spCounts[i], ...SPECIES[i] });
            }
        }
        ranked.sort((a, b) => b.count - a.count);

        if (ranked.length === 0) {
            expandWrapEl.hidden = true;
            showStatus(
                `<div>No recorded observations within ${searchRadiusKm} km of <strong>${escapeHtml(searchName)}</strong>.</div>` +
                (searchRadiusKm < 50
                    ? `<div class="snc-status-actions">` +
                      `<button type="button" class="snc-secondary-btn" onclick="window.SNC.onRadiusChange(25)">Expand to 25 km</button>` +
                      `<button type="button" class="snc-secondary-btn" onclick="window.SNC.onRadiusChange(50)">Expand to 50 km</button>` +
                      `</div>`
                    : ''),
                false
            );
            return;
        }

        const visibleSpecies = isExpandedResults ? ranked : ranked.slice(0, 3);

        visibleSpecies.forEach(sp => {
            const isSelected = selectedSpeciesIdx === sp.idx;
            const comDisplay = (sp.com && sp.com !== 'Unknown') ? sp.com : sp.sci;
            const obsLabel = `${sp.count.toLocaleString()} ${sp.count === 1 ? 'observation' : 'observations'}`;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'snc-species-row';
            btn.setAttribute('role', 'listitem');
            btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

            const thumbHtml = sp.img
                ? `<div class="snc-thumb-wrap"><img class="snc-thumb" referrerpolicy="no-referrer" src="${escapeHtml(sp.img)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${THUMB_FALLBACK}';"/></div>`
                : '';

            btn.innerHTML = `
                <div class="snc-row-left">
                    ${thumbHtml}
                    <div class="snc-row-names">
                        <div class="snc-com-name">${escapeHtml(comDisplay)}</div>
                        <div class="snc-sci-name">${escapeHtml(sp.sci)}</div>
                    </div>
                </div>
                <div class="snc-row-right">
                    <div class="snc-obs-count-line">
                        <span class="snc-obs-count">${escapeHtml(obsLabel)}</span>
                        ${isSelected ? `<span class="snc-selected-tag">✓ Filtered</span>` : ''}
                    </div>
                    <svg class="snc-row-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </div>
            `;

            btn.addEventListener('click', () => {
                toggleSpeciesFilter(sp.idx);
            });

            listEl.appendChild(btn);
        });

        if (ranked.length > 3) {
            expandWrapEl.hidden = false;
            expandBtnEl.textContent = isExpandedResults
                ? 'Show top 3 recorded species'
                : `View all ${ranked.length} recorded species`;
        } else {
            expandWrapEl.hidden = true;
        }
    }

    function toggleSpeciesFilter(spIdx) {
        if (selectedSpeciesIdx === spIdx) {
            selectedSpeciesIdx = null;
        } else {
            selectedSpeciesIdx = spIdx;
        }

        if (hasActiveLocation) {
            updateLocalSearch(false);
        } else {
            syncMapLayers();
        }
    }

    function clearSpeciesFilter() {
        selectedSpeciesIdx = null;
        const spInput = document.getElementById('snc-species-input');
        if (spInput) spInput.value = '';
        if (hasActiveLocation) {
            updateLocalSearch(false);
        } else {
            syncMapLayers();
        }
    }

    // Complete Reset to "All India" National Overview
    function resetToAllIndia() {
        hasActiveLocation = false;
        searchLat = null;
        searchLon = null;
        searchName = "";
        searchIsApproximate = false;
        selectedSpeciesIdx = null;
        isExpandedResults = false;
        currentLocalIndices = [];

        if (isPickOnMapMode) {
            togglePickOnMap(false);
        }

        if (searchPinMarker) {
            mainMap.removeLayer(searchPinMarker);
            searchPinMarker = null;
        }
        if (searchRadiusCircle) {
            mainMap.removeLayer(searchRadiusCircle);
            searchRadiusCircle = null;
        }

        searchRadiusKm = 5;
        const radSelect = document.getElementById('snc-radius-select');
        if (radSelect) radSelect.value = '5';

        document.getElementById('snc-location-input').value = '';
        document.getElementById('snc-explore-select').value = '';
        const spInput = document.getElementById('snc-species-input');
        if (spInput) spInput.value = '';

        document.getElementById('snc-radius-wrap').hidden = true;
        document.getElementById('snc-legend-search-area').hidden = true;
        document.getElementById('snc-results-header').hidden = true;
        document.getElementById('snc-expand-wrap').hidden = true;
        const inv = document.getElementById('snc-invitation'); if (inv) { inv.hidden = false; inv.textContent = 'Search your area to discover species recorded within 5 km.'; }
        document.getElementById('snc-species-list').innerHTML = '';

        clearStatus();
        syncMapLayers();
        moveMapTo(INDIA_CENTER[0], INDIA_CENTER[1], INDIA_ZOOM);
        requestAnimationFrame(() => mainMap.invalidateSize({ pan: false }));
    }

    // Helper: Find approximate coordinates from dataset place descriptions when offline or geocoder fails
    function findApproximatePlaceInDataset(queryStr) {
        const qLow = queryStr.toLowerCase();
        let latSum = 0, lonSum = 0, hits = 0;
        for (let i = 0; i < DATA.length; i++) {
            const p = DATA[i][4];
            if (p && p.toLowerCase().includes(qLow)) {
                latSum += DATA[i][0];
                lonSum += DATA[i][1];
                hits++;
            }
        }
        if (hits > 0) {
            return { lat: latSum / hits, lon: lonSum / hits, hits };
        }
        return null;
    }

    // Run Area / City / Postcode Search
    async function runLocationSearch() {
        const inputEl = document.getElementById('snc-location-input');
        const q = inputEl.value.trim();
        if (!q) {
            showStatus('<div>Please enter an area, city, or postcode to search.</div>', false);
            return;
        }

        if (isPickOnMapMode) togglePickOnMap(false);

        showStatus('<div>Searching for <strong>' + escapeHtml(q) + '</strong>…</div>', false);

        // 1. Check direct coordinate input (e.g. "13.0285, 77.5197")
        const coordMatch = q.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lon = parseFloat(coordMatch[2]);
            if (lat >= 5 && lat <= 38 && lon >= 66 && lon <= 99) {
                clearStatus();
                setSearchLocation(lat, lon, `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`, false);
                return;
            }
        }

        // 2. Resolve locality via OpenStreetMap Nominatim Geocoder (scoped to India)
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=1&q=${encodeURIComponent(q)}`;
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error('Geocoder HTTP ' + res.status);
            const json = await res.json();

            if (Array.isArray(json) && json.length > 0) {
                const place = json[0];
                const lat = parseFloat(place.lat);
                const lon = parseFloat(place.lon);
                const resolvedTitle = (place.display_name || q).split(',')[0].trim();
                clearStatus();
                setSearchLocation(lat, lon, resolvedTitle, false);
                return;
            }

            // 3. If geocoder returned no matches, check if dataset records contain matching place text and label as approximate
            const approx = findApproximatePlaceInDataset(q);
            if (approx) {
                const shortName = q.split(',')[0].trim();
                setSearchLocation(approx.lat, approx.lon, shortName, true);
                showStatus(
                    `<div>Showing an <strong>approximate centre</strong> for “${escapeHtml(shortName)}” derived from ${approx.hits.toLocaleString()} matching dataset records.</div>` +
                    `<div class="snc-status-actions">` +
                    `<button type="button" class="snc-secondary-btn" onclick="window.SNC.togglePickOnMap(true)">Refine point on map</button>` +
                    `</div>`,
                    false
                );
                return;
            }

            // No matching place found anywhere
            showStatus(
                `<div><span class="snc-error-dot"></span>No matching place found in India for “<strong>${escapeHtml(q)}</strong>”. Try a nearby city, postcode, or choose a point on the map.</div>` +
                `<div class="snc-status-actions">` +
                `<button type="button" class="snc-secondary-btn" onclick="window.SNC.togglePickOnMap(true)">Choose on map</button>` +
                `</div>`,
                true
            );
        } catch (err) {
            // 4. Geocoder network/service failure: offer approximate dataset fallback if available, or manual map pick
            const approx = findApproximatePlaceInDataset(q);
            if (approx) {
                const shortName = q.split(',')[0].trim();
                setSearchLocation(approx.lat, approx.lon, shortName, true);
                showStatus(
                    `<div>Place lookup service was unreachable. Showing an <strong>approximate location</strong> for “${escapeHtml(shortName)}” based on ${approx.hits.toLocaleString()} dataset records.</div>` +
                    `<div class="snc-status-actions">` +
                    `<button type="button" class="snc-secondary-btn" onclick="window.SNC.togglePickOnMap(true)">Refine point on map</button>` +
                    `</div>`,
                    false
                );
            } else {
                showStatus(
                    `<div><span class="snc-error-dot"></span>Unable to reach the place-search service for “<strong>${escapeHtml(q)}</strong>”. Please check your connection or select a location directly on the map.</div>` +
                    `<div class="snc-status-actions">` +
                    `<button type="button" class="snc-secondary-btn" onclick="window.SNC.togglePickOnMap(true)">Choose on map</button>` +
                    `</div>`,
                    true
                );
            }
        }
    }

    function setSearchLocation(lat, lon, label, isApprox = false) {
        hasActiveLocation = true;
        searchLat = lat;
        searchLon = lon;
        searchName = label;
        searchIsApproximate = Boolean(isApprox);
        isExpandedResults = false;
        selectedSpeciesIdx = null;
        updateLocalSearch(true);
    }

    // Use Visitor's Geolocation (Never silently falls back to Bengaluru)
    function useMyLocation() {
        if (isPickOnMapMode) togglePickOnMap(false);

        if (!navigator.geolocation) {
            showStatus(
                `<div><span class="snc-error-dot"></span>Geolocation is not supported by your browser. Search for an area above or choose a point on the map.</div>` +
                `<div class="snc-status-actions">` +
                `<button type="button" class="snc-secondary-btn" onclick="document.getElementById('snc-location-input').focus()">Search an area</button>` +
                `<button type="button" class="snc-secondary-btn" onclick="window.SNC.togglePickOnMap(true)">Choose on map</button>` +
                `</div>`,
                true
            );
            return;
        }

        showStatus('<div>Requesting your location…</div>', false);

        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                clearStatus();
                document.getElementById('snc-location-input').value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                setSearchLocation(lat, lon, 'your location', false);
            },
            () => {
                // Keep current map state; explain clearly; offer area search or manual point selection
                showStatus(
                    `<div><span class="snc-error-dot"></span>Location access was declined or unavailable. Your map view has not been changed. You can search by area/postcode or pick a point on the map.</div>` +
                    `<div class="snc-status-actions">` +
                    `<button type="button" class="snc-secondary-btn" onclick="document.getElementById('snc-location-input').focus()">Search by area</button>` +
                    `<button type="button" class="snc-secondary-btn" onclick="window.SNC.togglePickOnMap(true)">Choose on map</button>` +
                    `</div>`,
                    true
                );
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
    }

    // Explicit "Choose on map" Mode
    function togglePickOnMap(forceState) {
        isPickOnMapMode = typeof forceState === 'boolean' ? forceState : !isPickOnMapMode;
        const pickBtn = document.getElementById('snc-btn-pick-map');
        const pickBanner = document.getElementById('snc-pick-banner');

        pickBtn.setAttribute('aria-pressed', isPickOnMapMode ? 'true' : 'false');
        pickBanner.hidden = !isPickOnMapMode;
        rootEl.classList.toggle('is-picking-location', isPickOnMapMode);
    }

    mainMap.on('click', function(e) {
        if (!isPickOnMapMode) return; // Ordinary map exploration never changes the search centre
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        const coordLabel = `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`;
        togglePickOnMap(false);
        clearStatus();
        document.getElementById('snc-location-input').value = coordLabel;
        setSearchLocation(lat, lon, coordLabel, false);
    });

    // Secondary Radius Change
    function onRadiusChange(newRadiusVal) {
        const parsed = parseInt(newRadiusVal, 10);
        if (!isNaN(parsed) && parsed > 0) {
            searchRadiusKm = parsed;
            const selectEl = document.getElementById('snc-radius-select');
            if (selectEl && selectEl.value !== String(parsed)) {
                selectEl.value = String(parsed);
            }
            clearStatus();
            updateLocalSearch(true);
        }
    }

    // Secondary Species Filter Control
    function toggleSpeciesSearchPanel() {
        const panel = document.getElementById('snc-species-filter-panel');
        const btn = document.getElementById('snc-btn-toggle-sp-filter');
        const willShow = panel.hidden;
        panel.hidden = !willShow;
        btn.setAttribute('aria-expanded', willShow ? 'true' : 'false');
        if (willShow) {
            document.getElementById('snc-species-input').focus();
        }
    }

    function applySpeciesInputFilter() {
        const raw = document.getElementById('snc-species-input').value.trim();
        if (!raw) {
            clearSpeciesFilter();
            return;
        }
        const qLow = raw.toLowerCase();
        const idx = SPECIES.findIndex(sp => {
            const com = (sp.com || '').toLowerCase();
            const sci = (sp.sci || '').toLowerCase();
            const combined = `${com} (${sci})`;
            return com === qLow || sci === qLow || combined === qLow || com.includes(qLow) || sci.includes(qLow);
        });

        if (idx === -1) {
            showStatus(`<div><span class="snc-error-dot"></span>No species matching “<strong>${escapeHtml(raw)}</strong>” in this dataset.</div>`, true);
            return;
        }

        clearStatus();
        selectedSpeciesIdx = idx;
        if (hasActiveLocation) {
            updateLocalSearch(false);
        } else {
            syncMapLayers();
        }
    }

    function toggleExpandAllSpecies() {
        isExpandedResults = !isExpandedResults;
        if (hasActiveLocation) {
            updateLocalSearch(false);
        }
    }

    function jumpToPresetPlace(val) {
        if (!val) return;
        const parts = val.split(',');
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        const label = parts.slice(2).join(',').trim();
        if (!isNaN(lat) && !isNaN(lon)) {
            clearStatus();
            document.getElementById('snc-location-input').value = label;
            setSearchLocation(lat, lon, label, false);
        }
    }

    // Map Scroll-Wheel Zoom (Enabled immediately by default)
    function toggleScrollWheelZoom() {
        // Kept for backward compatibility
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (isPickOnMapMode) togglePickOnMap(false);
        }
    });

    // ResizeObserver & Visibility handling to ensure map tiles always size accurately
    const mapFrameEl = document.getElementById('snc-map-frame');
    if (window.ResizeObserver && mapFrameEl) {
        const ro = new ResizeObserver(() => {
            mainMap.invalidateSize({ pan: false });
        });
        ro.observe(mapFrameEl);
    }
    window.addEventListener('resize', () => mainMap.invalidateSize({ pan: false }));
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) mainMap.invalidateSize({ pan: false });
    });

    
    // Invalidate map size when section scrolls into viewport
    if ('IntersectionObserver' in window && rootEl) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    mainMap.invalidateSize({ pan: false });
                }
            });
        }, { threshold: 0.1 });
        observer.observe(rootEl);
    }

    // Expose public controller methods
    window.SNC = {
        runLocationSearch,
        useMyLocation,
        togglePickOnMap,
        onRadiusChange,
        toggleSpeciesSearchPanel,
        applySpeciesInputFilter,
        clearSpeciesFilter,
        toggleExpandAllSpecies,
        resetToAllIndia,
        jumpToPresetPlace,
        toggleScrollWheelZoom,
        zoomIn: () => mainMap.zoomIn(),
        zoomOut: () => mainMap.zoomOut()
    };
})();
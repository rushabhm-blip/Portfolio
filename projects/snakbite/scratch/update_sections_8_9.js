const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Find start of Section 8
const s8Index = html.indexOf('<!-- SECTION 8: DIVERSITY SPECTRUM - UNIT CHART (307 SPECIES) -->');
if (s8Index === -1) {
  console.error('Could not find SECTION 8 in index.html');
  process.exit(1);
}

// Find start of Section 10
const s10Index = html.indexOf('<!-- SECTION 10: LOOK CLOSER - SCROLL-DRIVEN ANATOMY SEQUENCE -->');
if (s10Index === -1) {
  console.error('Could not find SECTION 10 in index.html');
  process.exit(1);
}

// Extract content of Section 8 between s8Index and SECTION 9
const s9Index = html.indexOf('<!-- SECTION 9: THE BIG FOUR - DEADLIEST DRAW CARD INTERACTION -->');
if (s9Index === -1) {
  console.error('Could not find SECTION 9 in index.html');
  process.exit(1);
}

const section8Html = html.substring(s8Index, s9Index).trim();

// The new combined wrapper containing Section 8 and Section 9
const newCombinedHtml = `<!-- SHARED FOREST ENVIRONMENT FOR SECTIONS 8 & 9 -->
        <div class="forest-environment-group" id="forestEnvironmentGroup">
            <!-- Decorative Forest Canvas Layer (Spans both Section 8 and Section 9) -->
            <div class="forest-shared-edges" id="forestSharedEdges" aria-hidden="true">
                <canvas id="forestEdgesCanvas"></canvas>
            </div>

            ${section8Html}

            <!-- SECTION 9: THE BIG FOUR - DEADLIEST DRAW CARD INTERACTION -->
            <section class="bigfour-chapter-section" id="bigfour-section" aria-label="The Big Four - Deadliest Draw">
                <div class="bigfour-text-scrim" aria-hidden="true"></div>

                <div class="bigfour-container" id="bigfour-container">
                    
                    <!-- LEFT COLUMN: Editorial & Explanatory Text -->
                    <div class="bigfour-col-left">
                        <header class="bigfour-header">
                            <div class="bigfour-eyebrow-row">
                                <span class="bigfour-eyebrow-line" aria-hidden="true"></span>
                                <span class="bigfour-eyebrow">THE BIG FOUR</span>
                                <span class="bigfour-eyebrow-line" aria-hidden="true"></span>
                            </div>

                            <h2 class="bigfour-main-question">
                                <span class="bigfour-q-line1">Which snakes cause most</span>
                                <span class="bigfour-q-line2">snakebite deaths<span class="bigfour-desktop-break"><br></span>in India?</span>
                            </h2>

                            <p class="bigfour-supporting-line">
                                Let’s meet the “Big Four”.
                            </p>
                        </header>

                        <div class="bigfour-deck-intro">
                            <h3 class="bigfour-deck-heading">Deadliest Draw</h3>
                            <p class="bigfour-deck-instruction">Draw a card to explore each snake’s venom profile.</p>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN: Interactive Playing Card Stack & Controls -->
                    <div class="bigfour-col-right">
                        <div class="bigfour-stage" id="cardStack" role="region" aria-label="Interactive Big Four playing card deck">

                            <!-- Card 1: Common Indian Krait -->
                            <div class="card in-deck theme-krait" data-card-id="1" tabindex="0" role="region" aria-label="Card 1: Common Indian Krait">
                                <div class="card-inner card-front">
                                    <div class="corner"><span class="value">1</span><span class="suit">♣</span></div>
                                    <div class="card-art"><img src="assets/krait.png" alt="Common Indian Krait illustration" loading="lazy"></div>
                                    <div class="card-content">
                                        <h4 class="card-name">COMMON<br>INDIAN KRAIT</h4>
                                        <div class="divider" aria-hidden="true">
                                            <svg viewBox="0 0 24 24"><path d="M12 2L15 12L24 12L16 18L19 28L12 22L5 28L8 18L0 12L9 12Z"/></svg>
                                        </div>
                                        <div class="stats-table">
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-3 8c-.83 0-1.5-.67-1.5-1.5S8.17 7 9 7s1.5.67 1.5 1.5S9.83 10 9 10zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 7 15 7s1.5.67 1.5 1.5S15.83 10 15 10zm-1 4h-4v-1h4v1z"/></svg>
                                                    LD₅₀ (mg/kg)
                                                </span>
                                                <span class="stat-value">0.09</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l2 1v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l2-1-10-5zm-1 15H9v-2h2v2zm0-4H9v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>
                                                    Avg. Yield (mg)
                                                </span>
                                                <span class="stat-value">12.5</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                                    Yield Range (mg)
                                                </span>
                                                <span class="stat-value">8 – 20</span>
                                            </div>
                                            <div class="stat-row stat-row-toxicity">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                                                    PRIMARY TOXICITY TYPE
                                                </span>
                                                <span class="stat-value stat-value-toxicity">POTENT NEUROTOXIC</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-inner card-back" aria-hidden="true"></div>
                            </div>

                            <!-- Card 2: Saw-scaled Viper -->
                            <div class="card in-deck theme-viper" data-card-id="2" tabindex="0" role="region" aria-label="Card 2: Saw-scaled Viper">
                                <div class="card-inner card-front">
                                    <div class="corner"><span class="value">2</span><span class="suit">♥</span></div>
                                    <div class="card-art"><img src="assets/saw_scaled_viper.png" alt="Saw-scaled Viper illustration" loading="lazy"></div>
                                    <div class="card-content">
                                        <h4 class="card-name">SAW-SCALED<br>VIPER</h4>
                                        <div class="divider" aria-hidden="true">
                                            <svg viewBox="0 0 24 24"><path d="M12 2L15 12L24 12L16 18L19 28L12 22L5 28L8 18L0 12L9 12Z"/></svg>
                                        </div>
                                        <div class="stats-table">
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-3 8c-.83 0-1.5-.67-1.5-1.5S8.17 7 9 7s1.5.67 1.5 1.5S9.83 10 9 10zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 7 15 7s1.5.67 1.5 1.5S15.83 10 15 10zm-1 4h-4v-1h4v1z"/></svg>
                                                    LD₅₀ (mg/kg)
                                                </span>
                                                <span class="stat-value">0.15 – 0.24</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l2 1v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l2-1-10-5zm-1 15H9v-2h2v2zm0-4H9v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>
                                                    Avg. Yield (mg)
                                                </span>
                                                <span class="stat-value">14.0</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                                    Yield Range (mg)
                                                </span>
                                                <span class="stat-value">5 – 20</span>
                                            </div>
                                            <div class="stat-row stat-row-toxicity">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                                                    PRIMARY TOXICITY TYPE
                                                </span>
                                                <span class="stat-value stat-value-toxicity">POTENT HEMOTOXIC</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-inner card-back" aria-hidden="true"></div>
                            </div>

                            <!-- Card 3: Indian Cobra -->
                            <div class="card in-deck theme-cobra" data-card-id="3" tabindex="0" role="region" aria-label="Card 3: Indian Cobra">
                                <div class="card-inner card-front">
                                    <div class="corner"><span class="value">3</span><span class="suit">♠</span></div>
                                    <div class="card-art"><img src="assets/indian_cobra.png" alt="Indian Cobra illustration" loading="lazy"></div>
                                    <div class="card-content">
                                        <h4 class="card-name">INDIAN<br>COBRA</h4>
                                        <div class="divider" aria-hidden="true">
                                            <svg viewBox="0 0 24 24"><path d="M12 2L15 12L24 12L16 18L19 28L12 22L5 28L8 18L0 12L9 12Z"/></svg>
                                        </div>
                                        <div class="stats-table">
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-3 8c-.83 0-1.5-.67-1.5-1.5S8.17 7 9 7s1.5.67 1.5 1.5S9.83 10 9 10zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 7 15 7s1.5.67 1.5 1.5S15.83 10 15 10zm-1 4h-4v-1h4v1z"/></svg>
                                                    LD₅₀ (mg/kg)
                                                </span>
                                                <span class="stat-value">0.28 – 0.56</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l2 1v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l2-1-10-5zm-1 15H9v-2h2v2zm0-4H9v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>
                                                    Avg. Yield (mg)
                                                </span>
                                                <span class="stat-value">190.0</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                                    Yield Range (mg)
                                                </span>
                                                <span class="stat-value">150 – 250</span>
                                            </div>
                                            <div class="stat-row stat-row-toxicity">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                                                    PRIMARY TOXICITY TYPE
                                                </span>
                                                <span class="stat-value stat-value-toxicity">POST-SYNAPTIC NEUROTOXIC</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-inner card-back" aria-hidden="true"></div>
                            </div>

                            <!-- Card 4: Russell's Viper -->
                            <div class="card in-deck theme-russell" data-card-id="4" tabindex="0" role="region" aria-label="Card 4: Russell's Viper">
                                <div class="card-inner card-front">
                                    <div class="corner"><span class="value">4</span><span class="suit">♦</span></div>
                                    <div class="card-art"><img src="assets/russells_viper.png" alt="Russell's Viper illustration" loading="lazy"></div>
                                    <div class="card-content">
                                        <h4 class="card-name">RUSSELL'S<br>VIPER</h4>
                                        <div class="divider" aria-hidden="true">
                                            <svg viewBox="0 0 24 24"><path d="M12 2L15 12L24 12L16 18L19 28L12 22L5 28L8 18L0 12L9 12Z"/></svg>
                                        </div>
                                        <div class="stats-table">
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-3 8c-.83 0-1.5-.67-1.5-1.5S8.17 7 9 7s1.5.67 1.5 1.5S9.83 10 9 10zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 7 15 7s1.5.67 1.5 1.5S15.83 10 15 10zm-1 4h-4v-1h4v1z"/></svg>
                                                    LD₅₀ (mg/kg)
                                                </span>
                                                <span class="stat-value">0.40 – 0.75</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l2 1v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l2-1-10-5zm-1 15H9v-2h2v2zm0-4H9v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>
                                                    Avg. Yield (mg)
                                                </span>
                                                <span class="stat-value">170.0</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                                    Yield Range (mg)
                                                </span>
                                                <span class="stat-value">130 – 250</span>
                                            </div>
                                            <div class="stat-row stat-row-toxicity">
                                                <span class="stat-label">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                                                    PRIMARY TOXICITY TYPE
                                                </span>
                                                <span class="stat-value stat-value-toxicity">CYTOTOXIC &amp; HEMOTOXIC</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-inner card-back" aria-hidden="true"></div>
                            </div>

                        </div>

                        <!-- Controls Block -->
                        <div class="bigfour-controls">
                            <button type="button" class="bigfour-draw-btn" id="bigfourDrawBtn" aria-label="Draw a card from the Big Four deck">
                                <span id="bigfourDrawBtnText">Draw a card</span>
                                <span class="btn-arrow" aria-hidden="true">→</span>
                            </button>
                            
                            <div class="bigfour-progress" id="bigfourProgress" aria-live="polite">
                                <span id="bigfourCardIndex">1</span> / 4
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>\n\n`;

html = html.substring(0, s8Index) + newCombinedHtml + html.substring(s10Index);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with Sections 8 & 9!');

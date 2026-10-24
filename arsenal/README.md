# 🚀 Creative Portfolio Animation & 3D Arsenal

A curated suite of modular **3D WebGL (Three.js)** and **Motion Graphics (GSAP / ScrollTrigger / Lenis)** building blocks engineered for high-end portfolio websites.

---

## 📦 What's in Your Arsenal

### 1. 🌐 Three.js & GLSL Shaders (`arsenal/three-scene.js`)
- **Interactive Glass Mesh (`createGlassMeshScene`)**:
  - PBR Physical material with real-time transmission, IOR 1.5, specular reflection, and dynamic mouse parallax.
- **Morphing 3D Particle Cloud (`createParticleSystem`)**:
  - 2,500+ additive blending particles morphing smoothly between Sphere and Torus geometries.
- **Liquid Image Hover GLSL Shader (`createLiquidHoverShader`)**:
  - Custom vertex & fragment shader with distance-field wave ripples, chromatic aberration (RGB offset), and cyber glow on cursor hover.

### 2. ⚡ GSAP Motion & ScrollTrigger Recipes (`arsenal/gsap-motion.js`)
- **Kinetic Split Text Reveal (`splitTextReveal`)**:
  - 3D character rotation (`rotateX: -90deg`) and stagger cascade for titles.
- **Cyberpunk Scramble Decrypt (`scrambleText`)**:
  - Real-time character scrambling text decryption animation.
- **Pinned Split-Pair Storyteller (`initSplitPairLayout`)**:
  - Dual-column layout where the narrative pins while visuals scrub past.
- **Horizontal Ribbon Scroll (`initHorizontalStrip`)**:
  - Translates vertical page scroll into buttery horizontal project card ribbons.
- **3D Card Stacking Deck (`initStackingDeck`)**:
  - Depth scaling and opacity fade for stacked portfolio case studies.
- **SVG Path Drawing (`initSvgPathDraw`)**:
  - ScrollTrigger linked SVG stroke dashoffset drawing.

### 3. 🎯 Cursor Physics & Micro-Interactions (`arsenal/cursor-physics.js`)
- **Magnetic Buttons (`initMagneticElements`)**:
  - Spring-damped elastic pull towards the cursor.
- **3D Perspective Card Tilt (`init3DTiltCards`)**:
  - Sub-pixel card rotation based on mouse coordinates.
- **Smooth Trailing Cursor (`initSmoothCursor`)**:
  - High-performance RAF lerped ring & dot cursor.

---

## 🛠 Quick Integration Examples

### Three.js Glass Mesh in a Portfolio Hero:
```javascript
import { ThreeArsenal } from './arsenal/three-scene.js';

const container = document.getElementById('hero-webgl-box');
const scene3D = ThreeArsenal.createGlassMeshScene(container);
```

### Liquid Hover Shader on Portfolio Project Cards:
```javascript
import { ThreeArsenal } from './arsenal/three-scene.js';

const projectCard = document.getElementById('project-thumb');
ThreeArsenal.createLiquidHoverShader(projectCard, 'project-preview.jpg');
```

### Kinetic Title Entrance with GSAP:
```javascript
import { GsapArsenal } from './arsenal/gsap-motion.js';

GsapArsenal.splitTextReveal(document.querySelector('.portfolio-headline'), {
  stagger: 0.04,
  duration: 1.0
});
```

### Magnetic Navigation and Contact Button:
```javascript
import { PhysicsArsenal } from './arsenal/cursor-physics.js';

PhysicsArsenal.initMagneticElements('.btn-primary, .nav-link', 0.4);
PhysicsArsenal.init3DTiltCards('.portfolio-card', 18);
```

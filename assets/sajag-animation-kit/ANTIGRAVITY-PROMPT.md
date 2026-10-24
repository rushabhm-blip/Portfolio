Implement a polished Sajag app-screen showcase in my existing portfolio website using the attached sajag-animation-kit. Inspect my existing stack first and follow its conventions. Add this component only in the Sajag project section; preserve the rest of my website.

REFERENCE MOTION
A fixed, upright phone frame stays in the centre. Separate app screens are visible to its left and right. A screen travels from the left into the centre, aligns exactly inside the phone, pauses, then travels out to the right as the next screen arrives. The phone frame does not move. This must feel like one continuous row of screens travelling behind a stationary phone, not a crossfade slideshow or a rotating wheel.

ASSETS
- Read screens.json for the real app screens and their order.
- Use the eight updated PNGs in assets/screens as actual screen content. Do not redraw, regenerate or rewrite their UI. These were captured from the current running web interface inside the supplied APK, not the obsolete SVG folders.
- assets/device/phone-frame.svg is a transparent overlay. Its viewBox is 422 × 876. The transparent display opening begins at x=16, y=16 and is 390 × 844, with radius 40. Scale these measurements together.
- phone-frame.png is a transparent raster alternative, 844 × 1752.
- The screen images are opaque rectangular app exports, 780 × 1688. They should NOT have transparent backgrounds. Only the phone frame needs transparency.
- Do not use the previously generated angled promotional mockups inside the phone.

LAYOUT AND VISUALS
- Uniform pure white #FFFFFF background, no surrounding border, outer card, scene, blue haze or vignette.
- On desktop, show the central phone plus one screen on each side; optional partial screens at the outer edges.
- Central screen width about 280–300px, side cards about 88% scale and 62–75% opacity, all crisp. No blur on screen content.
- Keep all screen aspect ratios consistent at 390:844. The supplied PNGs are already standardised.
- Keep central phone upright, no spin, no perspective tilt, no exaggerated 3D.
- Scale the phone responsively; on narrow screens show centre plus partial side screens, no page-level horizontal scroll.

ANIMATION AND LAYERS
- Use index/phase driven translateX and scale animation with a seamless loop.
- Hold each centred screen for 2.4s, then move right by one slot over about 1.05s with gentle easing and no bounce.
- Layer 1: the side-screen row, masked out underneath the phone's outer bounds.
- Layer 2: a synchronised duplicate row clipped to the rounded 390 × 844 phone aperture.
- Layer 3: the fixed transparent phone-frame overlay, pointer-events:none.
- Both rows must use exactly the same image sequence, phase and transforms, so the incoming screen continues through the phone without a visible mismatch.
- Recycle offscreen cards outside the visible area. No visible jump or reversed travel at the loop boundary.
- Never stretch a single screen or hide part of its interface with an added Dynamic Island: these captures show the app content without the native Android system bars. The supplied frame intentionally has no notch overlay.

INTERACTION AND ACCESSIBILITY
- Autoplay only while the section is visible. Pause on hover, keyboard focus and when the tab is hidden.
- Add discreet Previous, Next and Play/Pause controls, keyboard arrow support and mobile swipe support.
- Respect prefers-reduced-motion: no autoplay; manual changes should be instantaneous.
- Preload images and reserve component dimensions to avoid layout shift.
- Keep image and observer loading local to this component. Clean up observers and animation callbacks on unmount.

IMPLEMENTATION
The included index.html is a framework-free working reference for the layering and motion. Adapt it into my existing framework rather than embedding an iframe or rebuilding my site. Use an animation library only if the project already uses one or if it simplifies the existing implementation. Show me the changed files and verify the screen-to-aperture alignment, loop continuity and mobile layout.

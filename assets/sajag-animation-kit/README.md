# Sajag screen animation kit — corrected screens

This version replaces the obsolete SVG exports with captures of the actual running interface from your supplied app-debug.apk. The current JavaScript bundle does not reference the old citymakers-screens or parking-screens assets used in the first kit.

Open index.html after extracting the ZIP. Screens travel left → centre → right through a fixed phone frame. No build step is required.

## Updated screen inventory
1. Bengaluru home dashboard
2. Transit & routes
3. Find parking
4. Safety
5. City Makers
6. Sajag Voice
7. Namma Kannada
8. Welcome

All eight PNGs are 780 × 1688, captured at a 390 × 844 CSS viewport and 2× resolution. These are the APK's bundled web UI rendered in Chromium, not screenshots from an Android emulator. Native Android status/navigation bars are excluded. App layout, illustrations, icons and sample data are retained. Google Sans Flex is loaded; a Noto Sans Kannada fallback supplies Kannada glyphs. Map tiles were allowed to finish loading before capture. Sample locations differ between app modules as they do in the supplied app.

## Files
- assets/screens/: the eight corrected PNGs; no legacy SVG screen exports.
- assets/device/: transparent phone frame in SVG and PNG.
- screens.json: image inventory and order.
- index.html: self-contained reference carousel using local images.
- ANTIGRAVITY-PROMPT.md: integration instructions.
- updated-screens-preview.jpg: contact sheet to review the corrected screen selection.

## Transparency and alignment
The app screenshots stay opaque. Only the phone-frame overlay needs transparency. Its 422 × 876 viewBox has a 390 × 844 display opening at (16,16), corner radius 40. Keep those proportions together when scaling. The frame has no notch.

## Implementation
Two synchronised rows make screens pass behind the stationary frame. One is masked outside the phone and the other is clipped inside its display. Images preload before animation. Controls support previous/next, play/pause, keyboard arrows and swipe. Reduced-motion preferences disable autoplay.

## Verification
All eight images loaded in the local demo. Desktop and mobile layouts were visually checked; the next-screen control advances to Transit & routes, and the mobile page has no horizontal overflow. Final integration still depends on your website's styles.

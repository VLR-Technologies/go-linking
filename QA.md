# Mozza Italia colorful quick-links update

## Result

The existing Next.js hub now has a warm ivory/peach/lavender background, subtle grain, original gradient-shaded SVG food illustrations, and a 500px link column. The original Mozza logo and local Barlow Condensed/Manrope fonts remain. Google Reviews leads with a warm yellow surface and small decorative star, followed by Website, Instagram and WhatsApp. All four rows navigate directly in the same tab and have matching copy controls.

Six food illustrations drift along the desktop edges with 16–22 second CSS animations. Mobile keeps three small accents within the logo gutters, with a soft fade at the clipping boundary. Decorations cannot intercept pointer events. A native checkbox pauses the animation without JavaScript; reduced motion keeps the food static. No new client component or dependency was added.

## Changed files

- `src/config/brands.ts`: four destinations, exact ordering/URLs, opt-in food theme, revised supporting copy.
- `src/app/[brand]/page.tsx`: metadata includes direct ordering.
- `src/app/brand-experience.css`: pastel surfaces, typography, platform row styling, food motion, clipping, responsive and reduced-motion behavior.
- `src/components/BrandShell.tsx`: optional scenery and native pause control.
- `src/components/FoodDecorations.tsx`: new server-rendered decoration component.
- `src/components/DestinationCard.tsx`: review star and arrow styling.
- `src/components/Icon.tsx`: local recognizable platform SVG marks.
- `src/components/CopyLinks.tsx`: quieter copy utility heading; existing copy component reused.
- `public/icons/`: Google, Instagram, WhatsApp and original globe SVGs, plus README.
- `public/brands/mozza-italia/food/`: original pizza, burger, fries, basil, tomatoes and grain SVGs, plus README.
- `src/lib/qr.ts`: compensate for a floating-point floor in the existing QR library so the longer WhatsApp payload produces an exact 1024px staff download.
- `tests/core.test.ts`, `tests/browser/experience.spec.ts`, `tests/browser/root-redirect.spec.ts`: four-link coverage, updated ordering, decoration/pause/reduced-motion checks.
- `README.md`, `QA.md`: current behavior, verification and local-run documentation.

The ten new SVG assets total 11,754 bytes uncompressed. The logo and font files were not modified. The root redirect, existing destination redirects, footer destination, staff QR route and unknown-route behavior remain compatible.

## Verification

- Lint, TypeScript and production build: passed.
- Core suite (`node --import tsx --test tests/core.test.ts`): 24 passed. Exact approved URLs and WhatsApp message verified; all five staff QR payloads independently decoded at 200, 250, 300 and 1024px.
- Full browser suite: 20 passed using installed Chrome on port 3102. The 11 cases affected by final visual refinements also passed on a focused rerun.
- Widths checked: 360, 390, 430, 768 and 1280px. All four compact rows fit within the initial viewport, with aligned columns and no horizontal overflow.
- Axe WCAG A/AA checks passed for collapsed and expanded hubs, copy-failure states and the staff utility.
- Verified same-tab direct navigation and exact URL copying for all four destinations, clipboard success/reset and failures, keyboard navigation, no-JavaScript links/manual copying/motion pause, reduced motion, logo fallback, root/deep-link redirects, 404s, staff downloads and preview-master protection.
- Food placement was checked at multiple animation phases at 360, 430, 768 and 1280px. Decorations remain outside protected content, links retain unobstructed hit targets, and static decorations remain visible with reduced motion.
- Mobile and desktop screenshots were visually reviewed. The suite writes viewport screenshots to ignored `test-results/hub-{width}.png`; focused reruns retain the selected cases. The final 360px clipping-fade check also passed.

The first core run exposed an existing QR renderer rounding issue (1023 rather than 1024 pixels) for the newly added WhatsApp URL. The generator was corrected and all 24 tests passed afterward.

## Limitations and local use

The [official website](https://www.mozzaitalia.com) confirms +91 99497 99488. A no-platform-fees policy was not found, so the public description is “Order directly with our team.” No fee, delivery or free-food promise is made.

Next.js emits a non-blocking warning about an ignored parent-directory lockfile. Physical-device and native WhatsApp/Instagram handoff testing were not performed. External navigation is intercepted in browser tests; no messages or reviews were submitted.

Run `npm run dev` and open `http://localhost:3000/mozza-italia` (the root also redirects there). For production browser QA: `npm run build`, then `PLAYWRIGHT_PORT=3102 PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`. No push or deployment was performed.

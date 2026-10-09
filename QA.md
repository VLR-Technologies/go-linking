# Mozza Italia premium hub — implementation and QA

## Result

A mobile-first customer hub with a 520px maximum column, the original unmodified logo, the restaurant's approved palette, locally served Barlow Condensed and Manrope fonts, three compact direct links, and a collapsed native copy accordion. No fullscreen intro or customer QR screens remain. The staff utility and QR-generation functions are preserved. No dependencies were added, and no commit, push or deployment was performed.

## Files changed

Paths below are relative to this repository.

- `src/app/[brand]/page.tsx`
- `src/app/[brand]/[destination]/page.tsx`
- `src/app/brand-experience.css`
- `src/app/globals.css` — removed obsolete hub/intro rules; retained shared staff and error-page styles
- `src/app/layout.tsx`
- `src/app/fonts.ts` — added local font integration
- `src/app/fonts/barlow-condensed-bold.ttf` — added original website font
- `src/app/fonts/manrope-regular.ttf` — added original website font
- `src/app/fonts/manrope-semibold.ttf` — added original website font
- `src/app/fonts/barlow-condensed-OFL.txt` — added license
- `src/app/fonts/manrope-OFL.txt` — added license
- `src/app/fonts/README.md` — added font provenance
- `src/components/BrandHeader.tsx`
- `src/components/BrandShell.tsx`
- `src/components/DestinationCard.tsx`
- `src/components/CopyLinkButton.tsx`
- `src/components/CopyIcon.tsx` — added
- `src/components/CopyLinks.tsx` — added
- `src/components/Footer.tsx`
- `src/components/BrandIntro.tsx` — removed
- `src/components/DestinationPage.tsx` — removed
- `src/config/brands.ts`
- `playwright.config.ts` — optional installed-browser channel override
- `tests/browser/experience.spec.ts`
- `tests/browser/root-redirect.spec.ts`
- `tests/browser/chef-intro.spec.ts` — removed obsolete overlay tests
- `README.md`
- `public/brands/mozza-italia/README.md`
- `QA.md`

The user's pre-existing `package-lock.json` and `next-env.d.ts` changes remain intact. The logo, chef image, QR generation code, and staff utility route were not modified.

## Validation

- `npm test`: 20 passed, including independent decoding of four QR targets at 200, 250, 300 and 1024px. The first sandbox invocation blocked tsx's IPC pipe; the same command passed with local-process permissions.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed; hub and destination redirects pre-rendered.
- `git diff --check`: passed.
- All 16 browser cases passed across the full initial run and focused reruns of affected cases, using installed Chrome on port 3100. The final responsive run passed all five widths.
- Requested widths: 360, 390, 430, 768 and 1280px. Verified centered columns, 78px link rows, logo proportions, all three links visible within the initial viewport, no horizontal overflow, and no customer QR displays.
- Axe WCAG 2 A/AA and 2.1 AA checks passed for the collapsed hub, expanded copy controls and staff utility at all five widths, plus the clipboard-failure state.
- Verified exact same-tab external navigation, all three links and original logo without JavaScript, no-JavaScript manual copying, all three server redirect Location headers, clipboard success/reset and both denied/unavailable clipboard fallback, keyboard focus/copying, reduced motion, pre-hydration logo failure, staff downloads/noindex/preview-master protection, root redirect and unknown-route 404s.
- Hub outbound requests are intercepted; deep-link redirects are inspected without following their external destinations. Screenshots are in ignored `test-results/hub-{width}.png`; mobile and desktop layouts were visually inspected.

The first browser run exposed incorrect assertions against Next.js local-font aliases, a logo error occurring before hydration, keyboard timing during accordion expansion, and an outbound interception limitation for HTTP redirects. These were corrected. Responsive contrast measurements now wait for the 260ms entrance fade to settle, which removed transient animation measurements without changing the approved colors.

## Remaining issues

No known unresolved implementation issues. Next.js emits a non-blocking warning that a parent-directory lockfile outside this Git repository is ignored. Chrome was used for browser QA; physical-device testing and deployment were not performed.

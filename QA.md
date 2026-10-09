# Go-Linking final visual refinement and QA

Workspace: `C:\Users\Jai\go-linking`. Branch: `feature/go-linking-development`.

## Visual implementation

- A compact restaurant composition capped at 1000px, with shorter hero spacing and balanced cards.
- The supplied original `public/brands/mozza-italia/LOGO.png` is used unchanged. Intrinsic dimensions (3557 × 1445), object-fit contain, and responsive sizing preserve proportions. CSS multiply blending integrates the white image background into an ivory plate with an inner highlight, fine border, and layered shadow. Cached-image hydration is handled so the fallback cannot remain after a successful cached load.
- Intro: 2.5 seconds total, soft cream/wine ambience, subtle scale reveal, then the logo plate moves to the measured hub header position using the Web Animations API. Choices reveal underneath. Skip, Escape, Tab, resize, and reduced motion are handled. It plays once per brand per tab, with optional session storage and an in-memory fallback. No animation dependency added.
- Hub: stronger but compact serif headings, primary tagline, requested support copy, quieter background lighting, no dominant circles, and integrated footer strip.
- Cards: matching glass-like surfaces, inner borders, layered contact shadows, moving reflection, restrained accent edges, responsive arrow controls, hover lift/tilt, and pressed feedback. Instagram has restrained warm social accents; review uses olive/gold. Hover motion is limited to capable pointer devices and disabled under reduced motion.
- Destinations: branded back control, compact logo plate, dimensional action panel, strong direct CTA, framed copy control, and a separate warm QR presentation. Review copy invites an honest rating and does not preselect stars.
- QR: unchanged black/white PNG pixels, four-module quiet zone, no blur, opacity change, perspective, overlays, or graphics. Only the outer frame is styled. Download remains 1024px PNG; displayed QR remains 250px.

## Files changed in this refinement

- `src/app/brand-experience.css` (new presentation layer)
- `src/app/layout.tsx`
- `src/app/[brand]/page.tsx`
- `src/components/BrandHeader.tsx`
- `src/components/BrandIntro.tsx`
- `src/components/DestinationPage.tsx`
- `src/config/brands.ts`
- `tests/core.test.ts`
- `tests/browser/experience.spec.ts`
- `README.md`
- `public/brands/mozza-italia/README.md`
- `QA.md`

The supplied `LOGO.png` was read but not modified. No packages were added. Existing routes, master utility, 404, QR generation, downloads, copy links, back navigation, and VLR footer remain.

## Exact destinations and master target

| Asset                      | Target                                    |
| -------------------------- | ----------------------------------------- |
| Master, local preview only | `http://localhost:3000/mozza-italia`      |
| Website                    | `https://www.mozzaitalia.com`             |
| Instagram                  | `https://www.instagram.com/italia.mozza/` |
| Google review              | `https://g.page/r/CbxmdpzE3rO4EBM/review` |

## Verification

- Core tests: 20 passed, including independent PNG decoding of all four QR targets at 200, 250, 300, and 1024px.
- Lint: passed, no errors or warnings.
- TypeScript: passed.
- Production build: passed; customer routes pre-rendered.
- Browser tests: 14 passed in approximately 1.3 minutes. All requested viewport checks and the 1280 × 800 laptop card-fit check passed. Screenshots confirmed the real logo and refined layout.
- Browser coverage includes all six routes at 390, 430, 768, 1024, 1280, and 1440px; no horizontal overflow; axe WCAG A/AA checks; explicit real-logo visibility before screenshots; direct outbound targets; clipboard success/failure; downloads; back navigation; 404; local master download guard; intro timing, skip, storage denial, return navigation, and reduced motion; no-JavaScript link use.
- A separate 1280 × 800 laptop check verifies all three cards fit vertically within the initial viewport.
- Actual full-page screenshots are saved under ignored `test-results/` and visually reviewed for the logo, spacing, cards, QR presentation, and footer. Automated accessibility tests are not a full screen-reader certification.
- External requests are intercepted in tests to verify exact outbound targets without submitting reviews. Native Instagram handoff, real phone-camera scans, printed proofs, and physical NFC tags remain manual checks.

## Production master QR workflow — not performed

1. Establish the real deployed HTTPS origin.
2. Set `NEXT_PUBLIC_SITE_URL=https://<production-domain>` in the hosting environment, without a path, credentials, query, or fragment.
3. Rebuild and deploy when separately authorized. If the hostname changes after initial deployment, rebuild/redeploy with the final value.
4. Verify `https://<production-domain>/mozza-italia` opens the hub on a phone.
5. Open the deployed `/qr/mozza-italia`, verify the displayed master target, and download the regenerated master PNG.
6. Scan a final-size physical print proof on iOS and Android before bulk printing. Write the identical hub URL to physical NFC tags and read it back.

Localhost is NEVER production-print-ready and cannot point a phone to the development computer. Master downloads remain disabled for local/preview origins. A public HTTPS configuration permits download but does not establish reachability; physical checks are still required.

## Existing limitations and repository state

The previously recorded full dependency audit has five development-only findings propagated from the unresolved braces advisory through Next lint tooling; the prior production audit was clean. No dependency changes were made in this refinement. Physical device testing and deployment are not claimed.

The branch remains `feature/go-linking-development`. No commit, push, merge, or deployment was performed. The QA server on port 3100 is owned by the browser suite and stops after the run. An existing server on port 3000 was not stopped or replaced.

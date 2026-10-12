# Multi-brand UI refinement QA — 12 October 2026

## Scope and repository

Work stayed in `C:\Users\Jai\go-linking` on `feature/multi-company-logins`. HEAD remains `bc3326a614d05321dcbcbde85a0e4ccba3e64129`. No branch switch, commit, push, merge, deployment, dependency installation, authentication, database, admin or tracking was added. Earlier multi-brand implementation changes remain uncommitted alongside this refinement.

## Files changed in this refinement

- `src/app/page.tsx`: VLR directory, themed brand cards and full-card native navigation.
- `src/app/multi-brand.css`: directory backgrounds, responsive layout, card depth, 44px directory controls, client presets, back navigation, footer and motion refinements.
- `src/components/VlrLockup.tsx` (new): existing VLR logo plus TECHNOLOGIES, and the official tagline constant.
- `src/components/Footer.tsx`: consistent lockup and official tagline.
- `src/components/BrandShell.tsx`: All Brands back link.
- `src/components/DestinationCard.tsx`: shared enabled/disabled card rendering and themed icons.
- `src/components/Icon.tsx`: monochrome client icons while preserving Mozza platform icons.
- `src/app/[brand]/page.tsx`: all client destinations use the shared card engine; restrained preview notice.
- `src/config/brands/elevator-company.ts`, `tuition-classes.ts`: relevant placeholder descriptions, with URLs still empty and disabled.
- `tests/browser/multi-brand.spec.ts`: updated placeholder, independent action and touch-target checks.
- `tests/browser/refinement.spec.ts` (new): full-card pointer/keyboard navigation, back navigation, branding, reduced motion and Mozza fallback/proportion coverage.
- `README.md`, `QA.md`: implementation and verification documentation.
- `next-env.d.ts`: Next production build regenerates its types reference.

## Result

The directory uses an ice-blue/silver layered background, subtle grid, restrained orange accents, a connection illustration and individually themed client artwork. Each entire company card is a native internal link. QR and Copy are sibling buttons above the link's overlay, with independent mouse and keyboard behavior and 44×44px targets. A discovered artwork stacking issue was fixed and covered by real coordinate-click regression tests.

VLR branding uses the existing unmodified logo followed by TECHNOLOGIES, without duplicate VLR text. The shared supporting line is ENGINEERING INTELLIGENCE FOR TOMORROW. Footers link to https://vlrtechnologies.net/.

All brand pages have an All Brands link, accessible as Back to Go-Linking. Elevator has charcoal/navy and silver-blue styling, a shaft reveal, rising cabin and sequential floor indicators. Tuition has deep blue/violet, white and yellow, an opening book, academic symbols and a pencil slide. Motion uses existing local SVG/CSS and respects reduced motion. Both clients use the same DestinationCard as Mozza; all 18 missing destinations show Coming soon with no actionable URL or QR.

The existing shared QR/copy engine is retained. QRs encode exact URLs, use black on white and a four-module quiet zone, and provide 1024px PNG downloads where enabled. The modal supports focus wrapping/restoration, Escape and Close. Copy preserves the current page, announces success with a fixed 1.8-second toast and supplies a manual fallback if clipboard access fails. Master downloads remain protected on local/preview origins.

## Verification

| Check                                      | Result                                                                                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit/configuration/independent QR decoding | 26 passed                                                                                                                                             |
| Full browser suite                         | 44 passed in one final run                                                                                                                            |
| Lint                                       | Passed                                                                                                                                                |
| TypeScript                                 | Passed                                                                                                                                                |
| Production build                           | Passed; all three client routes generated                                                                                                             |
| Responsive layout                          | All four pages at 390, 430, 768, 1024, 1280 and 1440px; no horizontal overflow                                                                        |
| Accessibility                              | No axe WCAG 2 A/AA and 2.1 AA violations in tested pages/dialogs; keyboard actions, modal focus, reduced motion and fallback checks passed            |
| Navigation                                 | Entire artwork/text/card areas, arrows, keyboard Enter, back links, independent QR/Copy, same-tab operation without JavaScript, invalid routes passed |
| Original food motion                       | Existing clipping, pause and placement tests passed                                                                                                   |

Tests used installed Microsoft Edge on Windows. Final screenshots of the directory, Mozza, Elevator, Tuition, QR modal and footer were visually inspected at 390, 430, 768, 1280 and 1440px. Automated responsive checks also cover 1024px. Final directory screenshots are under ignored `test-results/`; detailed before/after captures are under ignored `.npm-cache/ui-refinement/`.

## Mozza regression comparison

The baseline for this refinement was the existing multi-brand implementation before these UI edits. Across all six widths, measured main, logo, heading, destination-card and footer geometry remained identical; sampled fonts, backgrounds and padding also matched. Cards remain 78px high. The original food stylesheet, decorative assets, logo and exact destination URLs were preserved. Only the requested back navigation and footer branding/tagline were added to Mozza in this pass.

Visual inspection confirmed the composition and footer placement remain unchanged. Desktop composition crops matched pixel-for-pixel in repeat comparisons. Mobile captures showed some image/text rasterization variation despite identical measurements, so an all-width pixel-perfect result is not claimed.

## Remaining inputs and limits

Elevator and Tuition still need real names, logos, approved copy, contact details and destination URLs. Their current symbols and identities are clearly marked client previews. The actual live HTTPS origin must be configured and rebuilt before production master QR printing. Physical iOS/Android devices, printed QR/NFC scans and screen-reader devices were not tested. The public, configuration-driven architecture remains; client four needs a configuration, assets, links and theme rather than a separate application.

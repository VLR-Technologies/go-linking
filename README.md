# Go-Linking — VLR partner brands

One codebase, one deployment, one dedicated smart page and master QR/NFC URL per VLR client. This is a VLR client product, not a public signup platform.

## Local development and QA

Use the existing Node.js 20.9+ dependencies (`npm ci` for a fresh checkout), then `npm run dev`. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`, and `npm run test:e2e`. Browser tests use installed Edge and a production server. Set `PLAYWRIGHT_PORT` to select a free QA port or `PLAYWRIGHT_CHANNEL=chrome` for installed Chrome. Tests intercept outbound destinations; no third-party submissions occur.

## Routes and shared engine

- `/`: VLR directory with all configured clients and QR, Copy, Open actions.
- `/mozza-italia`: approved Mozza experience, exact existing destinations.
- `/elevator-company`: temporary engineering client preview.
- `/tuition-classes`: temporary Classes 6–10 preview.
- `/<brand>/<destination>`: same-tab server redirect to a configured usable destination.
- `/qr/<brand>`: public, noindex staff utility with master and usable destination QR assets.
- Unknown brands, unknown destinations and disabled destinations return the existing 404.

`src/config/brands.ts` is the registry and validation layer. Each client has one file in `src/config/brands/`, using the shared `Brand` and `Destination` types in `types.ts`. The dynamic brand route, `BrandShell`, `BrandHeader`, `DestinationCard`, `LinkActions`, and common `Footer` implement the shared experience.

A brand defines slug, name, category, tagline, logo path, hero copy, theme colors, links, decorative asset paths (`decor`), and the animation preset (`experience`). Links define id, icon kind, title, description, exact URL, open labels and optional `disabled`. Usable URLs are HTTPS or telephone destinations. Empty/disabled entries never produce anchors, QR codes or redirects. Mozza keeps its original platform icons. Elevator/Tuition use lightweight theme-colored SVG icons from the same `Icon.tsx` component. Placeholder clients render the same destination cards with a Coming soon label; no QR/Copy/Open action is created until a verified usable URL is enabled.

## Add a fourth client

1. Create `src/config/brands/<slug>.ts` exporting a `Brand` object. Copy the nearest preset configuration.
2. Put the client logo and original SVG decorations in `public/brands/<slug>/` and its `decor/` subfolder. Reference these public paths in the configuration.
3. Set name, category, copy, theme, `experience`, `decor`, and verified links in that single configuration. Set `disabled: false` only when the exact destination is available.
4. Import the new configuration and append it to `brands` in `src/config/brands.ts`.
5. Rebuild and test. Directory cards, brand route, metadata, redirects, master QR and staff assets resolve automatically.

For Elevator/Tuition, replace the temporary names, generic symbols, hero copy and link details in their existing configuration files. Remove `placeholder: true` once client setup is ready. No real company/institute identity, phone number or external URL has been fabricated.

## Visual and animation presets

`experience: 'food'` keeps Mozza's existing `FoodDecorations`, logo, background, fonts, colors, hero, food SVGs and responsive rules. `brand-experience.css` retains its approved styling. Only the bottom copy accordion is removed and QR/Copy controls are added beside the existing open arrow. The card body remains a same-tab open target, with utility controls independently clickable. The added All Brands control is absolutely positioned outside the main composition. Compact footer branding uses the original VLR logo followed by TECHNOLOGIES and the official tagline; the tagline is outside layout flow so Mozza footer placement stays unchanged.

`experience: 'elevator'` uses graphite/navy, silver and electric blue. Original architectural SVG linework supports a CSS shaft reveal, rising cabin and illuminating indicators.

`experience: 'education'` uses blue/violet with warm yellow accents. Original book, pencil, science and ruler artwork supports a book-opening entrance, academic symbols and pencil slide.

New presets live in `BrandAnimation.tsx` and `multi-brand.css`. Their motion finishes within 2.4 seconds; all respect reduced motion. Mozza's original looping food animation and pause checkbox are preserved. New assets are local SVGs; there is no animation service, video or new dependency.

## QR, copy and accessibility

The shared controls are ordered QR, Copy, Open. Copy writes only the exact configured URL, keeps the current page, and announces success through a polite live region with a fixed 1.8-second toast. Clipboard failures offer a selectable read-only URL in the dialog. Open preserves normal same-tab links, including without JavaScript.

QR opens a native modal dialog: centered on desktop, bottom sheet on phones. Native modality confines keyboard focus and makes background content inert. Escape and Close dismiss it and restore focus. It contains the brand logo, link title, instruction, Copy Link and Download QR. QR generation is lazy-loaded locally using the existing `qrcode` dependency, with untouched black modules, white background and four-module quiet zone. Download PNGs are 1024px. Tests independently decode their pixels using `jsqr`.

## Master QR and NFC safety

Configure `NEXT_PUBLIC_SITE_URL` with the actual deployment origin before building. Master URLs are exactly `${NEXT_PUBLIC_SITE_URL}/<brand-slug>`. They never encode the directory route. Physical client QR/NFC cards should directly use these brand URLs.

Development falls back to `http://localhost:3000`; this is preview only. Master downloads are disabled for missing origins, HTTP, localhost, private and example domains. Destination QR downloads are independent of the master origin. A public HTTPS origin enables master download but does not prove the deployment is live.

**Production master QR becomes print-ready only after the live deployment domain is configured, rebuilt, and verified on a phone.** Scan a physical proof before printing in bulk. Localhost on a phone refers to the phone itself. NFC tags use the same master URL; destination updates then need only a configuration change and deployment.

No authentication, database, analytics, tracking, cookies, signup or marketing collection is included. Nothing is deployed by these changes.

## VLR presentation and directory interactions

The root uses an ice-blue/silver background with ambient lighting, a faint engineering grid and restrained orange accents. A controlled-width hero leads directly to brand-specific cream, navy and violet cards. A real Next link extends over each complete card; QR/Copy buttons sit above it as independent sibling controls. Root action targets are at least 44 by 44 pixels. No nested buttons or links, JavaScript-only card navigation, or event propagation workaround is needed.

`VlrLockup.tsx` is the single source for the unmodified logo, TECHNOLOGIES text and official line ENGINEERING INTELLIGENCE FOR TOMORROW. It is used by the directory header and common footer. The footer link remains https://vlrtechnologies.net/.

Elevator/Tuition preserve the shared card engine and configuration routing. Their layered backgrounds, coordinated SVG/CSS entrances, monochrome icons and disabled card previews are scoped outside the food preset. Adding a fourth brand still requires configuration/assets rather than a new page.

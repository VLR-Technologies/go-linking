# Go-Linking — VLR partner brands

One codebase, one deployment, one dedicated smart page and master QR/NFC URL per VLR client. This is a VLR client product, not a public signup platform.

## Local development and QA

Use the existing Node.js 20.9+ dependencies (`npm ci` for a fresh checkout), then `npm run dev`. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`, and `npm run test:e2e`. Browser tests use installed Edge and a fresh production server, and expect the canonical production share origin even though the server itself runs on localhost. Set `PLAYWRIGHT_PORT` to select a free QA port or `PLAYWRIGHT_CHANNEL=chrome` for installed Chrome. To exercise local development, use `PLAYWRIGHT_SERVER_MODE=development npm run test:e2e`; this starts a dev server with a matching local share origin. Tests intercept outbound destinations; no third-party submissions occur.

## Routes and shared engine

- `/`: VLR directory with all configured clients and QR, Copy, Open actions.
- `/mozza-italia`: approved Mozza experience, exact existing destinations.
- `/elevator-company`: temporary engineering client preview.
- `/tuition-classes`: temporary Classes 6–10 preview.
- `/<brand>/<destination>`: same-tab server redirect to a configured usable destination.
- `/qr/<brand>`: public, noindex staff utility with master and usable destination QR assets.
- Unknown brands, unknown destinations and disabled destinations return the existing 404.

`src/config/brands.ts` is the registry and validation layer. `getDestinationUrl(brand, destinationId)` returns only a usable configured destination, preserving the original URL string exactly. Destination cards, copy actions, staff QR assets and compatibility redirects all use this resolver. Each client has one file in `src/config/brands/`, using the shared `Brand` and `Destination` types in `types.ts`. The dynamic brand route, `BrandShell`, `BrandHeader`, `DestinationCard`, `LinkActions`, and common `Footer` implement the shared experience.

A brand defines slug, name, category, tagline, logo path, hero copy, theme colors, links, decorative asset paths (`decor`), and the animation preset (`experience`). Links define id, icon kind, title, description, exact URL, open labels and optional `disabled`. Usable URLs are public HTTPS or validated telephone destinations. Relative URLs, credentials, unsafe schemes and local/private/example HTTPS hosts are rejected. Empty/disabled entries never produce anchors, QR codes or redirects. Mozza keeps its original platform icons. Elevator/Tuition use lightweight theme-colored SVG icons from the same `Icon.tsx` component. Placeholder clients render the same destination cards with a Coming soon label; no QR/Copy/Open action is created until a verified usable URL is enabled.

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

`src/lib/site.ts` owns `getPublicBrandUrl(slug)` and the public origin policy. Master QRs, copied brand links and brand metadata use this resolver. The directory's Open brand action remains an internal link. Master URLs never encode the directory route or an external business destination.

Set **`NEXT_PUBLIC_SITE_URL=https://go-linking.vercel.app` in both Vercel Production and Preview before building**. Remove any localhost value from those environments and rebuild the deployment: Next.js can embed public environment variables and prerendered links at build time. Do not include a path, query, fragment or credentials. There is no need to set `VERCEL_URL` or `VERCEL_PROJECT_PRODUCTION_URL`; neither is used as a share origin. Request `Host` and forwarded-host headers are never trusted for URL generation.

| Environment                                                   | Missing `NEXT_PUBLIC_SITE_URL`                                           | Explicit configuration                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Production (`NODE_ENV=production` or `VERCEL_ENV=production`) | Stable `https://go-linking.vercel.app` fallback                          | Must be a public HTTPS origin; invalid/local/private/HTTP values fail the build/request with a configuration error |
| Vercel Preview (`VERCEL_ENV=preview`)                         | Same stable production origin, regardless of preview deployment hostname | Same public HTTPS validation; use the canonical production setting above                                           |
| Local development/test                                        | `http://localhost:3000`                                                  | Local HTTP origins and custom ports are allowed; local master downloads remain disabled                            |

The production fallback is intentional and deterministic: missing configuration cannot silently create a localhost QR. Explicit invalid configuration is rejected instead of hidden. Local development with `npm run dev` remains functional; set a local-only `.env.local` value such as `http://localhost:3000` if you copied the production-oriented `.env.example`. A production build on a developer machine follows production rules too.

External destination QRs, copies and clicks use their exact configured URL, independent of the Go-Linking origin. They do not go through a Go-Linking redirect. Existing `/<brand>/<destination>` routes remain compatible and redirect only to configured usable destinations; query parameters cannot override their target. For Mozza Italia the master payload is `https://go-linking.vercel.app/mozza-italia`, while the Website payload is exactly `https://www.mozzaitalia.com` (no added slash). Google Reviews, Instagram and WhatsApp likewise retain their configured paths and query encoding.

A public HTTPS origin enables master downloads but does not prove the deployment is live. Verify the deployed hub and a physical QR proof on a phone before printing in bulk. NFC tags use the same master URL; destination updates then need only a configuration change and deployment.

No authentication, database, analytics, tracking, cookies, signup or marketing collection is included. Nothing is deployed by these changes.

## VLR presentation and directory interactions

The root uses an ice-blue/silver background with ambient lighting, a faint engineering grid and restrained orange accents. A controlled-width hero leads directly to brand-specific cream, navy and violet cards. A real Next link extends over each complete card; QR/Copy buttons sit above it as independent sibling controls. Root action targets are at least 44 by 44 pixels. No nested buttons or links, JavaScript-only card navigation, or event propagation workaround is needed.

`VlrLockup.tsx` is the single source for the unmodified logo, TECHNOLOGIES text and official line ENGINEERING INTELLIGENCE FOR TOMORROW. It is used by the directory header and common footer. The footer link remains https://vlrtechnologies.net/.

Elevator/Tuition preserve the shared card engine and configuration routing. Their layered backgrounds, coordinated SVG/CSS entrances, monochrome icons and disabled card previews are scoped outside the food preset. Adding a fourth brand still requires configuration/assets rather than a new page.

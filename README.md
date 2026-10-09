# Go-Linking

Smart links for physical-to-digital experiences, by VLR Technologies. One master QR or NFC tag opens a branded hub. Customers open the final destination with one tap. QR codes are kept in a separate staff utility for sharing and printing.

## Install and run

Requires Node.js 20.9+ and npm. Node 24 is recommended.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. No secrets, database, authentication, tracking cookies, marketing forms, or analytics are required. npm uses a checkout-local cache.

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run start
```

Browser tests use installed Microsoft Edge and start a production server automatically. Build first. They cover requested widths, accessibility, navigation, downloads, clipboard, and errors. Outbound requests are intercepted to verify exact targets without contacting third-party sites or submitting reviews. To use installed Chrome, set `PLAYWRIGHT_CHANNEL=chrome`; `msedge` remains the default. `PLAYWRIGHT_PORT` selects a separate local QA port.

## Routes

| Route                     | Purpose                            |
| ------------------------- | ---------------------------------- |
| `/`                       | Server redirect to the Mozza hub   |
| `/mozza-italia`           | Mozza Italia destination hub       |
| `/mozza-italia/website`   | Server redirect to the website     |
| `/mozza-italia/instagram` | Server redirect to Instagram       |
| `/mozza-italia/review`    | Server redirect to Google reviews  |
| `/qr/mozza-italia`        | Unlinked, noindex QR asset utility |

Unknown brands and destinations show a polished 404. The utility is public, not authenticated, and contains only public URLs.

## Brand configuration and logo

`src/config/brands.ts` centralizes name, tagline, theme, logo, links, and handle. Exact configured destinations:

- Website: https://www.mozzaitalia.com
- Instagram: https://www.instagram.com/italia.mozza/
- Google review: https://g.page/r/CbxmdpzE3rO4EBM/review

Configuration validates HTTPS links, identifiers, duplicate IDs/slugs, required values, and theme colors. Decorative stars never select or submit a rating. The customer chooses on Google.

The original logo is **`public/brands/mozza-italia/logo.png`** (case-sensitive, 3557 × 1445). Its bytes and proportions are unchanged. It is visible in server HTML, including without JavaScript, and falls back to the brand name if loading fails. CSS multiply blending integrates its white background with the ivory surface.

To add a brand, add a `Brand` object with a unique slug to `src/config/brands.ts`, put its logo under `public/brands/<slug>/`, and configure destination objects with unique IDs. Existing routes, metadata, and components resolve automatically. Rebuild to pre-render it. Extend the destination kind union and icon component for new categories.

## QR generation and downloads

The `qrcode` library generates real 1024px PNGs server-side with black modules, a white background, four-module quiet zone, medium error correction, and no overlays. On-page codes display at 250px. Download buttons save the high-resolution image with descriptive filenames, including `mozza-italia-google-review-qr.png`. Unit tests independently decode PNG pixels at 200, 250, 300, and 1024px.

Set the master origin in `.env.local`:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

This must be an HTTP(S) origin without a path, query, fragment, or credentials. The local master is `http://localhost:3000/mozza-italia`. **Localhost on a phone means the phone itself, not the development computer.** Use the computer's LAN IP and allow local server access for phone testing. LAN master downloads remain disabled.

For production, set the actual deployed HTTPS origin and rebuild. `/qr/mozza-italia` shows all four assets and their encoded URLs. Master download is disabled for missing configuration, HTTP, loopback, common private addresses, and reserved/example hostnames. A public HTTPS origin enables download but does not verify deployment or reachability. The master is production-print-ready only after the actual domain serves the hub and phone-camera and physical-proof tests pass.

Destination downloads are available independently of the master origin. Before bulk printing, scan final-size proofs in realistic lighting on the chosen material using iOS and Android. Preserve the white border. Automated image decoding cannot replace physical testing.

## NFC setup

Use an NFC writing app and a compatible writable tag. Write a URL/URI record with `https://<production-domain>/mozza-italia`, identical to the master QR target. Read it back on a phone and verify the hub. This application cannot rewrite physical tags. Avoid permanently locking a tag until verification. Future destination changes require only configuration updates while the hub URL remains stable.

## Customer experience, accessibility and performance

The customer hub uses a 520px maximum column, warm ivory surfaces, Mozza's approved colors, Barlow Condensed headings, and Manrope UI text. Fonts are self-hosted with `next/font/local`, using the same files as the restaurant website; SIL Open Font licenses are included in `src/app/fonts/`.

Three 78px semantic anchor rows navigate directly in the same tab to the exact URLs in `brands.ts`. Existing destination routes issue server redirects to those URLs. No customer QR displays or fullscreen intro remain.

The optional native `<details>` copy section starts collapsed and works with keyboard or pointer input. Each copy control announces success, briefly shows a checkmark and “Copied!”, and shows a read-only selectable URL on failure. Without JavaScript, the accordion offers manual-copy fields. CSS transitions take 200–260ms; reduced motion disables them. Keyboard expansion makes the copy controls immediately reachable.

Brand configuration, CSS variables and components retain the multi-brand architecture. Presentation lives in `src/app/brand-experience.css`; shared 404 and staff utility styles live in `globals.css`. The staff QR route and generation functions remain independent of the customer hub.

Browser QA covers 360, 390, 430, 768 and 1280px, axe WCAG A/AA checks, keyboard navigation, reduced motion, logo loading/fallback, clipboard success/failure, direct navigation without JavaScript, server redirects, staff downloads and 404s. Third-party targets are intercepted for hub navigation; deep links are verified through their exact server Location headers without following them.

## Deployment notes — not deployed

Use a Next.js-compatible Node host: `npm ci`, `npm run build`, `npm run start`. Set the public origin before building, add the original logo, and test all routes over HTTPS. Keep environment files untracked; `.env.example` contains only a public URL. No deployment pipeline is included. Review dependencies and repeat QA before release.

## Complete source structure

```text
.env.example
.gitignore
.npmrc
.prettierignore
.prettierrc.json
README.md
QA.md
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
package-lock.json
playwright.config.ts
tsconfig.json
public/brands/mozza-italia/README.md
public/brands/mozza-italia/logo.png
src/
  app/
    layout.tsx
    fonts.ts
    fonts/
    page.tsx
    globals.css
    brand-experience.css
    icon.svg
    not-found.tsx
    [brand]/page.tsx
    [brand]/[destination]/page.tsx
    qr/[brand]/page.tsx
  components/
    BrandHeader.tsx
    BrandShell.tsx
    CopyIcon.tsx
    CopyLinkButton.tsx
    CopyLinks.tsx
    DestinationCard.tsx
    Footer.tsx
    Icon.tsx
    QRCodeCard.tsx
  config/brands.ts
  lib/qr.ts
  lib/site.ts
tests/
  core.test.ts
  browser/experience.spec.ts
```

Dependencies, caches, builds, and test outputs are ignored. See `QA.md` for verification results and remaining physical-device checks.

# Go-Linking

Smart links for physical-to-digital experiences, by VLR Technologies. One master QR or NFC tag opens a branded hub. Customers choose a destination and open it directly; destination QR codes are for sharing, other devices, and printing.

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

Browser tests use installed Microsoft Edge and start a production server automatically. Build first. They cover requested widths, accessibility, navigation, downloads, clipboard, and errors. Outbound requests are intercepted to verify exact targets without contacting third-party sites or submitting reviews. For Chromium, remove `channel: 'msedge'` in playwright.config.ts and install Playwright Chromium.

## Routes

| Route                     | Purpose                            |
| ------------------------- | ---------------------------------- |
| `/`                       | Minimal Go-Linking introduction    |
| `/mozza-italia`           | Mozza Italia destination hub       |
| `/mozza-italia/website`   | Website action and QR              |
| `/mozza-italia/instagram` | Instagram action and QR            |
| `/mozza-italia/review`    | Google review action and QR        |
| `/qr/mozza-italia`        | Unlinked, noindex QR asset utility |

Unknown brands and destinations show a polished 404. The utility is public, not authenticated, and contains only public URLs.

## Brand configuration and logo

`src/config/brands.ts` centralizes name, tagline, theme, logo, links, and handle. Exact configured destinations:

- Website: https://www.mozzaitalia.com
- Instagram: https://www.instagram.com/italia.mozza/
- Google review: https://g.page/r/CbxmdpzE3rO4EBM/review

Configuration validates HTTPS links, identifiers, duplicate IDs/slugs, required values, and theme colors. Decorative stars never select or submit a rating. The customer chooses on Google.

The supplied original logo is **`public/brands/mozza-italia/LOGO.png`** (case-sensitive path, 3557 × 1445). Its bytes are unchanged. The header and intro display it with its original proportions inside an ivory brand plate; CSS multiply blending integrates its white background without masking the chef or lettering. A text fallback is retained for load failures, with cached-image hydration handled explicitly. The favicon is a generic Go-Linking chain icon.

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

## Accessibility and performance

The hub greets first-time visitors in each tab with a 2.5-second centered logo reveal. The Web Animations API moves the logo plate to the measured position and scale of the actual hub header while the ambient backdrop recedes and the choices reveal underneath. Skip intro, Escape, Tab, or window resizing dismisses it. It does not replay on return from a destination or refresh in the same tab. Reduced-motion visitors bypass it. Optional session storage remembers only whether this visual greeting played; an in-memory fallback supports blocked storage. Without JavaScript, the server-rendered hub and destination links remain usable. No animation library was added.

Brand copy is centralized in `brands.ts`. `src/app/brand-experience.css` contains the restaurant presentation layer: compact composition, ivory brand plates, layered glass cards, reflected highlights, accent edges, dimensional CTA controls, and framed QR displays. Desktop content is capped at 1000px. Hover transforms are limited to cards and buttons, never the QR itself. Mobile cards stay compact and readable. The original logo is used in both intro and page header.

For browser QA on a separate port, use `$env:PLAYWRIGHT_PORT='3100'; npm run test:e2e` in PowerShell. The default remains port 3000.

Mobile cards stack; desktop cards use three columns. Direct buttons precede QR assets on mobile. Semantic links, skip navigation, visible keyboard focus, status announcements, reduced-motion support, safe areas, and explicit hub navigation are included. External links open separately with `noopener noreferrer`. System fonts and lightweight browser animation avoid remote fonts and large motion packages. Server components generate QR assets; only the intro, logo fallback, and clipboard control need custom client JavaScript.

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
public/brands/mozza-italia/LOGO.png
src/
  app/
    layout.tsx
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
    BrandIntro.tsx
    BrandShell.tsx
    CopyLinkButton.tsx
    DestinationCard.tsx
    DestinationPage.tsx
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

# Go-Linking — VLR client workspace

One codebase, one public destination and one master QR/NFC URL per VLR client. This is a VLR-managed client product, not a public signup platform.

## Run locally

Use the installed project dependencies and run `npm run dev`. Set your own development credentials and session secret in ignored `.env.local`, following `.env.example`, then restart and open `/admin`. There is no default password. See [Local admin setup and operations](docs/local-admin.md).

The local product includes login/logout, dashboard counts, brand search/filtering, a six-step editor, original logo uploads, local palette extraction, link ordering, theme/animation presets, live mobile/desktop preview, drafts, publishing, unpublishing, archiving and QR assets. Creating client four requires **no source-code edits**: use Create Brand in the admin workspace.

## Routes and architecture

- `/`: approved public VLR landing page, populated with published directory-visible brands.
- `/<brand>`: shared public rendering engine; drafts, archived and unknown brands return 404.
- `/<brand>/<destination>`: validated same-tab destination redirect.
- `/qr/<brand>`: existing public QR utility for published brands.
- `/admin`: protected overview; `/admin/login` is the development sign-in page.
- `/admin/brands`, `/admin/brands/new`, `/admin/brands/<id>`: client management and editor.
- `/admin/preview/<id>` and `/admin/live-preview`: authenticated saved/live previews using the public rendering engine.
- `/admin/qr`: master and individual QR assets; `/admin/settings`: local workspace information.

Admin UI → protected HTTP endpoints → BrandService → BrandRepository. AssetStorage and AdminAuthProvider are separate contracts. Only `src/lib/product/providers.ts` chooses adapters. Business components never directly read JSON or local files.

Development stores versioned brand/link data and original uploads under ignored `.dev-data/`. Initial seeding is idempotent and preserves the exact existing Mozza, Elevator and Tuition configurations. The static configuration files remain the initial seed and read-only production fallback, not the onboarding mechanism for new local clients.

`BrandPage`, `BrandShell`, `BrandHeader`, `DestinationCard`, `LinkActions` and the VLR footer form the shared public engine. Existing food, education and engineering presentation is preserved. Reusable healthcare, real-estate, retail, network and minimal styles and animations support new clients. Animation can be disabled. Reduced motion is respected.

## Local safety and production boundary

Local admin works only with `NODE_ENV=development` and configured environment credentials. Sessions are signed, HttpOnly, SameSite=Strict and Secure on HTTPS; logout revocations persist. All admin data pages and APIs authenticate independently. Writes enforce same origin and server-side validation.

Production admin and local writes **fail closed**. A production build serves the original read-only brand seed until real production adapters are supplied. Do not deploy local JSON storage as the production database. No Supabase connection, keys, SDK, migrations, storage buckets or auth settings were added. See the [future Supabase integration plan](docs/supabase-integration-plan.md).

PNG/JPEG/WebP uploads are bounded and validated; SVG uploads are rejected. Assets use generated identifiers through a controlled endpoint. Draft/unreferenced images require admin authorization. Website discovery is explicitly deferred behind its contract; it performs no outbound fetch. Logo palettes and optional filename suggestions are local, real and admin-confirmed.

## QR, Copy and NFC

Public QR/Copy/Open actions remain independent. QR uses the exact destination, black modules on white and a four-module quiet zone. PNG output is 1024px. Admin also offers SVG downloads. Copy announces success with a fixed toast and provides manual fallback if clipboard access fails.

`src/lib/site.ts` is the single public-origin resolver. Directory, brand metadata and QR tools use `getPublicBrandUrl(slug)` for master links; internal navigation continues to use a relative brand path. Production and Vercel Preview default to `https://go-linking.vercel.app`. If `NEXT_PUBLIC_SITE_URL` is explicitly set there, it must be a clean public HTTPS origin. Request and forwarded-host headers are never used to build QR or share URLs.

For local development, set `NEXT_PUBLIC_SITE_URL` to the actual local origin and port in ignored `.env.local`, for example `http://localhost:3000`. A public master QR download stays disabled for local/private origins. The `.env.example` localhost value is for local development only; do not configure that value in Vercel. Set **`NEXT_PUBLIC_SITE_URL=https://go-linking.vercel.app` in both Vercel Production and Preview**, then rebuild. Next.js may inline public environment variables and generated metadata during the build. If the variable is absent in production or preview, the resolver uses the same canonical production origin rather than localhost.

Dynamic routes keep using `brandService` and the selected provider. Published records are converted through `renderBrand`; unpublished, archived and unknown brands still return 404. `src/config/brands.ts` remains the initial seed and read-only production fallback. Its shared `getDestinationUrl(brand, id)` validates each enabled destination and returns the original configured string without URL serialization. The admin editor uses the same public-web URL checks. Supported destinations include public HTTP(S), telephone, email and the configured WhatsApp URL formats; local/private HTTP(S) destinations and unsafe schemes are rejected.

Public destination cards, their copy actions, the public QR utility, admin QR assets and compatibility redirects all consume the validated configured URL. Business links open directly and QR images encode the same URL. Existing `/<brand>/<destination>` routes remain available and cannot be redirected by a query parameter. Mozza Italia's master payload is `https://go-linking.vercel.app/mozza-italia`; the Website target is exactly `https://www.mozzaitalia.com`. Google Reviews, Instagram and WhatsApp retain their exact configured paths and query values, including the prefilled message.

Admin development downloads remain labeled **Development QR — not for printing**. A configured HTTPS domain does not confirm that the deployment is live. Verify the deployed brand on a phone and test a physical QR/NFC proof before printing.

## Checks

- `npm test`: existing QR/configuration tests and new repository/auth/upload/validation tests.
- `npm run test:admin`: full local onboarding and responsive admin checks, with generated process-only credentials and isolated QA data/build output.
- `npm run build` then `npm run test:e2e`: existing public regressions plus production fail-closed checks. Set `PLAYWRIGHT_PORT` to use a free port.
- `npm run lint`, `npm run typecheck`, `npm run format:check`.

Browser tests default to installed Microsoft Edge; this merge run used installed Chrome through `PLAYWRIGHT_CHANNEL=chrome`. See the [product QA report](QA.md) and [PR #6 merge and QR verification](QR_FIX_QA.md) for results and practical limits. No package version was changed in this merge resolution.

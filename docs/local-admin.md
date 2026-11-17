# Go-Linking local client workspace

This phase is a working local product, not a production database or authentication deployment. Run `npm run dev` and open `/admin`. Public routes keep their existing presentation. Creating a new client requires no source-code changes.

## First run

Create an ignored `.env.local` in the project root using `.env.example` as a guide. Set your own `GO_LINKING_ADMIN_USERNAME`, `GO_LINKING_ADMIN_PASSWORD` (at least 12 characters) and `GO_LINKING_SESSION_SECRET` (at least 32 random characters). Never put real credentials in tracked files. Restart the development server after changing environment variables. The UI intentionally has no default password.

Set `NEXT_PUBLIC_SITE_URL` to the origin on which you run development, including its port, such as `http://localhost:3000`. This controls master QR/NFC URLs. Sign in at `/admin/login`. The root `/admin` redirects unauthenticated users there.

## Create a client

1. Select **Create Brand**. Enter its name, unique slug, industry, category and approved copy. Slugs auto-fill until manually edited.
2. Upload a PNG, JPEG or WebP logo, or explicitly approve the neutral fallback. Review the palette extracted locally from the image. Applying suggestions is optional. The uploaded original remains untouched.
3. Add and order links. Type-specific validation supports HTTP(S), WhatsApp phone/URL, telephone and email. Disable incomplete channels or remove them before saving.
4. Choose an industry style, animation, hero copy and directory visibility.
5. Inspect the actual rendering engine in the mobile/desktop iframe. Horizontal scrolling exposes a full desktop viewport on a narrow screen. Saved previews are available separately from the brand list.
6. Save a draft or publish locally. Required fields, unique slug, approved logo/fallback and an enabled valid link are checked on the server. The new public route is available immediately.

The brand list supports search, status filtering, edit, preview, QR, Copy URL, publish/unpublish and archive. QR Assets supplies master and individual QR previews, Copy, PNG and SVG downloads. The master URL is also the NFC destination. Development QRs are clearly marked **not for printing**, including when a public-looking site URL is configured: local persistence is still not a production backend.

Unpublishing or archiving hides both the public page and directory entry without deleting data. Published brands can also be hidden only from the directory. Changing a currently published slug requires explicit confirmation because printed QR/NFC URLs can break. There are no automatic slug aliases in this phase. Treat previously printed slugs as permanent even after unpublishing.

## Persistence and safety

- `BrandRepository`, `AssetStorage` and `AdminAuthProvider` are contracts; `providers.ts` selects adapters. Components never read/write JSON or filesystem paths.
- `.dev-data/brands.json` is initialized once from the existing three configurations, including exact legacy visual settings. It stores versioned brand/link records. Original seed previews stay published for compatibility; newly published clients must pass the stricter publish requirements.
- Updates use a cross-process exclusive lock and temporary-file rename. Concurrent duplicate slugs are rejected inside the transaction. An `updatedAt` check rejects stale edits instead of overwriting newer work.
- A corrupt store fails rather than being silently reseeded. A crash can leave `brands.lock`; after stopping all development servers, inspect and back up the directory before manually removing an abandoned lock. No automatic discard/recovery is performed.
- Logos live in `.dev-data/uploads/`, use generated filenames and are served only through `/api/assets/[id]`. Draft/unreferenced logos require authentication; published logos are readable publicly. Reads are non-cacheable so unpublishing also revokes public asset access. No arbitrary filesystem paths are accepted. Raster headers, MIME, extension, byte size and dimensions are checked; SVG uploads are rejected. Original image metadata is retained with the original bytes.
- Sessions are signed, expire after eight hours and use HttpOnly, SameSite=Strict cookies, with Secure on HTTPS. Logged-out token hashes are persisted under `revoked-sessions/`, so logout survives process reloads. Rotate the session secret to invalidate all sessions. The local provider has a bounded single-process login throttle; it is not a production distributed rate limiter.
- Every admin data page and API checks the session. Writes check exact request origin and reject cross-site requests. JSON/upload bodies are bounded. Errors shown to the browser omit stack traces, paths and secrets.
- `NODE_ENV=production` disables local admin and writes unconditionally. The public production build retains only the original read-only config seed until real production adapters are supplied. Locally created clients are intentionally not deployed by a production build.
- Back up `.dev-data/` while the server is stopped. It contains client data, uploaded originals and revocations; it is ignored by Git. Do not deploy writable local storage to serverless hosting.

## Honest suggestions

Canvas samples the logo into a small pixel grid, ignores transparent/near-white pixels and ranks quantized colors. It suggests a palette and readable foreground. The industry controls the suggested theme. The filename may suggest a name only if the name is blank, and requires confirmation. No phone number, social account, review URL or description is invented.

Company Website can add the explicitly entered URL as a link. Website metadata discovery is deliberately deferred: the `WebsiteDiscovery` contract returns an unavailable result and performs no fetch. A future fetcher needs DNS/IP validation at every redirect, private-network blocking, connection pinning, time/size limits and strict HTML parsing.

## Verification commands

`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`, `npm run test:admin`.

Admin browser tests use installed Edge, random process-only credentials and port 3116. `GO_LINKING_QA=1` isolates build output in `.next-product-qa` and runtime data in `.dev-data/qa`; it does not bypass production auth safeguards. Existing public browser tests use the production build and configurable `PLAYWRIGHT_PORT`. Screenshots/test fixtures are ignored. No packages were added for this phase.

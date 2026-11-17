# PR #6 merge resolution and QR verification

| Date   | 17 November 2026       |
| ------ | ---------------------- |
| Branch | `codex/qr-linking-fix` |
| Target | `main`                 |

Resolved the merge against `origin/main` while preserving the newer dynamic product architecture. The merge work is staged as conflict resolutions; no commit, push, PR merge, or deployment was performed.

## Architecture retained

- The directory reads brands through `brandService.directory()` and `renderBrand()`.
- Public brand, destination, and QR pages resolve published records through `brandService.published()` and `renderBrand()`. Draft, archived, and unknown records remain unavailable publicly.
- Admin brand management, provider/repository/storage contracts, and existing brand presentation remain in place.
- `src/config/brands.ts` remains the seed and read-only production fallback. New brands are not routed through the static brand list.

## URL and QR resolution

- `src/lib/site.ts` is the single master-origin resolver. Production and Vercel Preview default to `https://go-linking.vercel.app`; explicit origins there must be clean public HTTPS origins. Localhost is allowed only in development/test settings and cannot enable a public master download.
- `getPublicBrandUrl()` constructs master links for directory actions, metadata, and QR tools. Internal navigation remains relative.
- `getDestinationUrl()` is shared by public cards/copy actions, public QR assets, admin QR assets, and compatibility redirects. It returns the exact configured target for an enabled destination.
- Validation rejects unsafe schemes, credentials, malformed hosts, local/private IPs and local hostnames. Supported HTTP(S), `tel:`, `mailto:`, and configured WhatsApp URL forms remain available. WhatsApp messages, paths, queries, and URL escaping are preserved.
- Existing QR display, download, and copy controls remain functional.

Mozza Italia's required payloads are verified as:

| Use            | Exact URL                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Master QR      | `https://go-linking.vercel.app/mozza-italia`                                                           |
| Website        | `https://www.mozzaitalia.com`                                                                          |
| Google Reviews | `https://g.page/r/CbxmdpzE3rO4EBM/review`                                                              |
| Instagram      | `https://www.instagram.com/italia.mozza`                                                               |
| WhatsApp       | `https://wa.me/919949799488?text=Hi%20Mozza%20Italia%2C%20I%20would%20like%20to%20place%20an%20order.` |

## Validation results

| Check                                                                                       | Result                                                                                                                        |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                                                                    | Passed from the merged lockfile; installed Next.js 16.4.3. npm reported 9 advisories (8 moderate, 1 high).                    |
| `npm run lint`                                                                              | Passed                                                                                                                        |
| `npm run typecheck`                                                                         | Passed                                                                                                                        |
| `npm test`                                                                                  | Passed: 47 tests, including exact QR payload decoding at four sizes and dynamic-brand URL coverage                            |
| `npm run build`                                                                             | Passed; dynamic routes compiled and production build completed                                                                |
| Production browser suite: `PLAYWRIGHT_CHANNEL=chrome PLAYWRIGHT_PORT=3210 npm run test:e2e` | Passed: 54 tests                                                                                                              |
| Admin browser suite: `PLAYWRIGHT_CHANNEL=chrome npm run test:admin`                         | Passed: 8 tests, including dynamic create/publish, master and destination QR payloads, copy, redirect, and unpublish behavior |
| `git diff --check`                                                                          | Passed                                                                                                                        |
| Unresolved paths and conflict-marker scan                                                   | None found                                                                                                                    |

The first admin browser invocation stopped because the Next.js development server paused to show its security advisory. Retrying the same suite continued normally and all 8 tests passed. No dependency upgrade was part of this merge resolution.

The production browser run decoded the actual rendered and downloaded QR images and verified the canonical Mozza master URL and configured external destinations. The admin onboarding browser test verified that a newly created and published dynamic brand retains the exact configured Website target in its QR, copy action, public card, and 307 compatibility redirect.

## Resolved conflict files

- `.env.example`
- `README.md`
- `src/app/[brand]/[destination]/page.tsx`
- `src/app/[brand]/page.tsx`
- `src/app/page.tsx`
- `src/app/qr/[brand]/page.tsx`
- `src/components/directory/BrandTile.tsx`
- `src/config/brands.ts`
- `tests/browser/directory-experience.spec.ts`

Additional URL validation and QR coverage was added in `src/lib/url-validation.ts`, `src/lib/product/validation.ts`, `tests/core.test.ts`, `tests/product.test.ts`, and `tests/admin/product.spec.ts`.

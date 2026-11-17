# QR and URL resolution fix — 16 November 2026

Implemented in the existing `V2-design` checkout. No push, merge or deployment was performed.

## Root cause and audit

`src/lib/site.ts` previously used `value || 'http://localhost:3000'` for every environment. Both the directory's master QR/copy actions and the staff master QR consumed that resolver. Disabling master downloads for a missing or local origin still allowed a localhost QR to be displayed and a localhost URL to be copied. `.env.example` also supplied localhost without limiting it to development. Existing browser expectations explicitly accepted that fallback when testing a production server.

Mozza Italia's configured external destinations already contained the correct business URLs in this checkout. `DestinationCard`, `LinkActions` and the compatibility redirect page used those strings. The previous destination validator, however, accepted HTTPS localhost/private hosts. Those callers now share a validated destination resolver so origin configuration cannot change business targets and future brands use the same contract.

The existing route implementations are `page.tsx` files, rather than the `route.ts` names suggested in the request. Their public paths remain unchanged.

## Resolution flow

- `siteSettings()` validates the canonical origin. Production, Vercel Production and Vercel Preview use `https://go-linking.vercel.app` when the variable is absent. An explicitly unsafe, local or HTTP origin fails with a configuration error in these environments. Local development/test can use localhost and custom ports, with local master downloads disabled.
- `getPublicBrandUrl(slug)` validates the slug and constructs the absolute brand URL. Directory master QR/copy actions, staff master assets and brand metadata use it. Internal directory navigation uses `hubPath(slug)`.
- `getDestinationUrl(brand, destinationId)` returns the exact configured string only for an enabled, validated destination. Cards, copy actions, staff QR assets and existing redirects use it. The resolver preserves paths, escaping, queries, fragments and WhatsApp prefilled messages without serializing them through `URL.href`.
- Shared validation rejects credentials, relative URLs, unsafe schemes, control characters and local/private/example HTTPS hosts. Existing validated telephone destinations remain supported. Unknown/disabled destinations remain unavailable.
- The existing `qrDataUrl()` renderer, QR styling, logos and 1024px download behavior are preserved. Visible and downloaded images consume the same resolved payload. External destination QRs encode the business target directly.
- No request host, forwarded-host header or ephemeral Vercel deployment URL is used as a trusted origin. Compatibility redirect query parameters cannot override configured targets.

## Mozza Italia payloads and expected destinations

| Action                                            | Exact payload / destination                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Master brand QR / brand copy                      | `https://go-linking.vercel.app/mozza-italia`                                                           |
| Google Reviews QR / copy / open / legacy redirect | `https://g.page/r/CbxmdpzE3rO4EBM/review`                                                              |
| Website QR / copy / open / legacy redirect        | `https://www.mozzaitalia.com`                                                                          |
| Instagram QR / copy / open / legacy redirect      | `https://www.instagram.com/italia.mozza`                                                               |
| WhatsApp QR / copy / open / legacy redirect       | `https://wa.me/919949799488?text=Hi%20Mozza%20Italia%2C%20I%20would%20like%20to%20place%20an%20order.` |

The Instagram URL without a trailing slash was already an uncommitted user edit at the start of this task. That edit is preserved, and exact-URL expectations reflect the configured value. No business URL was changed by this fix.

## QR verification

Independent `jsqr` decoding of generated PNG pixels verifies the production master, local master and all four configured external payloads at 200, 250, 300 and 1024px. Browser tests decode the actual visible image sources and the PNG files saved by browser downloads for destination modals, directory master modals and staff assets. Payloads match exactly, including the Website URL without an added trailing slash and the original WhatsApp message encoding.

The production build's decoded master payload is `https://go-linking.vercel.app/mozza-italia`; its decoded Website payload is `https://www.mozzaitalia.com`. Production QR/copy checks contain no localhost target. All brands' directory master controls use their public brand URLs. Disabled placeholder destinations expose no QR/copy/open actions or valid redirect routes.

## Verification results

| Check                                                               | Result                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `npm run lint`                                                      | Passed                                                       |
| `npm run typecheck`                                                 | Passed                                                       |
| `npm run test`                                                      | 33 passed                                                    |
| `npm run build`                                                     | Passed, including prerendered brand and compatibility routes |
| `npm run format:check`                                              | Passed                                                       |
| Production Playwright suite, installed Chrome, port 3210            | 53 passed                                                    |
| Local development Playwright link/QR regressions, Chrome, port 3211 | 11 passed on retry                                           |
| `git diff --check`                                                  | Passed                                                       |

Production browser verification used an optimized production build with `NEXT_PUBLIC_SITE_URL` absent. Unit tests also cover explicitly configured production, Vercel preview, invalid production configuration, local development/custom ports and future-brand exact URL preservation. Browser coverage includes clipboard success/fallback, forwarded-host independence, exact 307 Location headers, query-parameter injection, unknown/disabled routes, same-tab navigation with and without JavaScript, actual downloaded QR decoding, responsive layout, accessibility, keyboard focus and existing animation behavior.

The initial development run could not connect because Next.js stopped the server to display its dependency security-upgrade advisory. Retrying the same command allowed the server to continue and all 11 selected tests passed. Dependency versions were left unchanged. Next.js also emitted existing workspace-lockfile, image sizing and smooth-scroll notices; these did not block successful verification.

No automated check remains unexecuted. Physical-phone/printed QR scans and post-deployment live verification were outside this local change; the production deployment has not been updated. No styling, font, logo, animation, destination ordering or responsive CSS files were modified. Directory mobile and Mozza desktop screenshots were visually inspected.

## Files modified by this fix

- `src/lib/site.ts`
- `src/lib/url-validation.ts` (new)
- `src/config/brands.ts`
- `src/components/directory/BrandTile.tsx`
- `src/components/DestinationCard.tsx`
- `src/components/CopyLinks.tsx`
- `src/app/[brand]/page.tsx`
- `src/app/[brand]/[destination]/page.tsx`
- `src/app/qr/[brand]/page.tsx`
- `.env.example`
- `README.md`
- `playwright.config.ts`
- `tests/core.test.ts`
- `tests/browser/qr-helpers.ts` (new)
- `tests/browser/experience.spec.ts`
- `tests/browser/multi-brand.spec.ts`
- `tests/browser/directory-experience.spec.ts`
- `tests/browser/refinement.spec.ts`
- `QR_FIX_QA.md` (new)

`src/config/brands/mozza-italia.ts` retains only its pre-existing user change. Next.js-generated development guidance and development-only type-reference changes were cleaned up after testing.

## Required Vercel settings

Set `NEXT_PUBLIC_SITE_URL=https://go-linking.vercel.app` for both **Production** and **Preview**, removing any localhost value. Rebuild when these settings and the fix are applied, because public variables and prerendered output can be embedded at build time. Missing configuration safely uses this same canonical public origin. There is no need to configure `VERCEL_URL` or `VERCEL_PROJECT_PRODUCTION_URL` for sharing. The application does not use request-host headers for origin resolution.

Verify the deployed master and Website QR on an unrelated phone after deployment. Deployment remains a separate user action.

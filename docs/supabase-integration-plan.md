# Supabase integration boundary — plan only

No Supabase connection, CLI, SDK, migration, SQL execution, auth configuration, bucket or credential is part of this phase.

## Adapter mapping

| Current contract  | Local implementation                                             | Future implementation                                                                     |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| BrandRepository   | LocalBrandRepository, versioned JSON and serialized transactions | SupabaseBrandRepository, database transactions/RPC and unique constraints                 |
| AssetStorage      | LocalAssetStorage, controlled raster endpoint                    | Supabase Storage adapter with ownership and publication-aware reads                       |
| AdminAuthProvider | LocalAdminAuthProvider, env credentials and signed cookie        | Supabase Auth adapter with server-validated sessions and explicit VLR admin authorization |
| WebsiteDiscovery  | Disabled helper                                                  | Optional independent hardened discovery service; unrelated to Supabase                    |

The composition root is `src/lib/product/providers.ts`. `BrandService` owns validation, lifecycle and conflict rules. UI/API components use contracts/services; public pages consume `renderBrand()` rather than database rows. Preserve the seeded `legacyPresentation` during migration to keep exact Mozza/Elevator/Tuition output.

The repository's `transact` callback expresses the atomic unit expected by the service. A database adapter must execute the read/check/write with optimistic concurrency and transactional uniqueness. Prefer implementing this contract with a versioned compare-and-swap transaction/RPC, retrying serialization conflicts, rather than independently issuing client-side SQL statements. If this boundary evolves to explicit repository commands, keep that change inside the service/repository layer; UI and HTTP contracts stay unchanged.

## Proposed tables (design, not executable SQL)

- **brands**: UUID primary key; unique normalized slug; name, category, industry, tagline, hero_title, hero_subtitle, description; logo_asset_id; fallback_approved; primary/secondary/accent/background colors; theme_preset; animation_preset; status; directory_visible; created_at; updated_at/version; legacy_presentation JSON for exact migrated presets. Enforce enums, length limits and slug constraints server-side.
- **brand_links**: UUID or migration-compatible stable ID, brand_id foreign key, type, label, description, URL, icon, sort_order, enabled, optional legacy CTA/handle. Enforce brand ownership and stable ordering.
- **assets**: asset identifier, storage object path, MIME, size, dimensions and creation timestamp. Publication authorization derives from referencing brands. Do not expose internal paths in public DTOs.
- **admin_profiles**: auth user ID, role, active flag; provision only explicitly approved VLR administrators. There is no public signup flow.
- **brand_slug_aliases**: not currently implemented. Add only with an intentional redirect policy, uniqueness across active slugs/aliases and cycle prevention. Until then retain explicit published-slug warnings.

## Required authorization and RLS

- Public users may SELECT only published public brand fields and enabled links of published brands. Directory queries additionally require directory_visible. Direct routes can still serve published directory-hidden brands.
- Drafts, archived brands, internal metadata and administrator information are never publicly readable. Use a public view/DTO if column-level projection needs stronger isolation.
- Only authenticated users with a server-verified active VLR admin profile may perform CRUD. Authentication alone does not imply admin authorization. No anonymous writes and no browser service-role key.
- Apply explicit RLS policies to every table; test both allowed and denied operations using anon, authenticated non-admin and admin sessions.
- Storage accepts writes only from approved admins, with MIME/size/dimension validation. Public reads must be restricted to assets referenced by published brands. A private bucket with an authorized delivery endpoint is preferable where unpublish must revoke access immediately. Account for signed URL/cache lifetime explicitly.
- Server/service privileges are used only for narrowly scoped provisioning or migration operations where RLS cannot serve the workflow. Keep all secrets server-side and audit privileged actions.
- Replace local throttling with production request limits. Use HTTPS cookies, appropriate CSRF protection, session expiry/refresh and logout revocation from the auth provider.

## Integration acceptance checklist

1. Provision a project only when explicitly authorized later; review its region, backup and access settings.
2. Implement and review schema/RLS and storage policies; run migrations only in that future task.
3. Implement adapters and configure server environment variables; remove the read-only production seed fallback only when all production adapters are present.
4. Import each local brand/link/asset exactly once, map seeded IDs to database IDs, preserve slugs and original URLs, and validate checksums/counts.
5. Re-run repository, lifecycle, concurrency, auth, upload, cross-origin, public visibility and exact visual regression tests against the new adapters.
6. Configure the final `NEXT_PUBLIC_SITE_URL`, verify production pages and QR/NFC on physical devices and printed proofs, then authorize deployment separately.

Supabase is the remaining production integration, not a prerequisite for demonstrating the local workflow.

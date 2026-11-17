import { isPublicHttpsUrl } from './url-validation';

export const PRODUCTION_ORIGIN = 'https://go-linking.vercel.app';

type SiteEnvironment = { nodeEnv?: string; vercelEnv?: string };

export function siteSettings(
  value = process.env.NEXT_PUBLIC_SITE_URL,
  environment: SiteEnvironment = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  },
) {
  // Vercel previews deliberately share the stable public origin. VERCEL_URL and
  // request hosts are deployment addresses, not canonical QR/share targets.
  const development =
    environment.vercelEnv !== 'production' &&
    environment.vercelEnv !== 'preview' &&
    (environment.nodeEnv === 'development' || environment.nodeEnv === 'test');
  const origin =
    value || (development ? 'http://localhost:3000' : PRODUCTION_ORIGIN);
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL must be a valid absolute HTTP(S) origin.',
    );
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    origin.includes('?') ||
    origin.includes('#') ||
    /[\s\u0000-\u001f\u007f\\]/.test(origin)
  )
    throw new Error(
      'NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without a path, credentials, query or fragment.',
    );
  const publicOrigin = isPublicHttpsUrl(origin);
  if (!development && !publicOrigin)
    throw new Error(
      'NEXT_PUBLIC_SITE_URL must be a public HTTPS origin in production and Vercel previews. Set it to https://go-linking.vercel.app and rebuild.',
    );
  return {
    origin: url.origin,
    downloadableMaster: publicOrigin,
  };
}
export function hubPath(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error('Invalid brand slug');
  return `/${slug}`;
}
export const getPublicBrandUrl = (slug: string, settings = siteSettings()) =>
  `${settings.origin}${hubPath(slug)}`;

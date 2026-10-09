export function siteSettings(value = process.env.NEXT_PUBLIC_SITE_URL) {
  const url = new URL(value || 'http://localhost:3000');
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error(
      'NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without a path, credentials, query or fragment.',
    );
  const host = url.hostname.toLowerCase();
  const local =
    host === 'localhost' ||
    !host.includes('.') ||
    /(^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|^169\.254\.|^0\.|:|\.(local|localhost|test|invalid|example)$)/.test(
      host,
    ) ||
    /(^|\.)example\.(com|org|net)$/.test(host);
  return {
    origin: url.origin,
    downloadableMaster: Boolean(value) && url.protocol === 'https:' && !local,
  };
}
export const hubPath = (slug: string) => `/${slug}`;
export const masterUrl = (slug: string) =>
  `${siteSettings().origin}${hubPath(slug)}`;

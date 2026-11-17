// Shared by public-origin and destination validation. Never infer a public URL
// from request headers or allow device-local addresses into shareable assets.
export function isPublicHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.+$/, '');
  return !(
    !host.includes('.') ||
    /(^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|^169\.254\.|^0\.|:|\.(local|localhost|internal|lan|home|test|invalid|example)$)/.test(
      host,
    ) ||
    /(^|\.)example\.(com|org|net)$/.test(host)
  );
}

export function isPublicHttpsUrl(value: string) {
  if (!/^https:\/\//i.test(value) || /[\s\u0000-\u001f\u007f\\]/.test(value))
    return false;
  try {
    const url = new URL(value);
    return !url.username && !url.password && isPublicHostname(url.hostname);
  } catch {
    return false;
  }
}

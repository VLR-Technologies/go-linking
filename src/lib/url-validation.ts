const localSuffixes = [
  '.local',
  '.localhost',
  '.internal',
  '.lan',
  '.home',
  '.test',
  '.invalid',
  '.example',
];

function isBlockedIpv4(host: string) {
  const octets = host.split('.').map(Number);
  if (
    octets.length !== 4 ||
    octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  )
    return true;

  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && octets[2] === 0) ||
    (a === 192 && b === 0 && octets[2] === 2) ||
    (a === 192 && b === 88 && octets[2] === 99) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && octets[2] === 100) ||
    (a === 203 && b === 0 && octets[2] === 113) ||
    a >= 224
  );
}

/** Reject device-local, private, and non-routable IP destinations. */
export function isPublicHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.+$/, '');
  if (
    !host ||
    host.split('.').length < 2 ||
    host
      .split('.')
      .some(
        (label) =>
          !label ||
          label.length > 63 ||
          !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
      ) ||
    host.includes(':') ||
    localSuffixes.some((suffix) => host.endsWith(suffix))
  )
    return false;

  // URL normalizes abbreviated and integer IPv4 forms to dotted decimal first.
  if (/^[0-9.]+$/.test(host)) return !isBlockedIpv4(host);
  return true;
}

function hasCleanHttpUrl(value: string) {
  if (!/^https?:\/\//i.test(value) || /[\s\u0000-\u001f\u007f\\]/.test(value))
    return false;
  try {
    const url = new URL(value);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      isPublicHostname(url.hostname)
    );
  } catch {
    return false;
  }
}

/** Public HTTP(S) destination used by brand links and the admin editor. */
export function isPublicWebUrl(value: string) {
  return hasCleanHttpUrl(value);
}

/** Canonical origin check is stricter than a configured business destination. */
export function isPublicHttpsUrl(value: string) {
  if (!/^https:\/\//i.test(value) || !hasCleanHttpUrl(value)) return false;
  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/\.+$/, '');
    return !/(^|\.)example\.(com|org|net)$/.test(hostname);
  } catch {
    return false;
  }
}

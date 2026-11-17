import {
  animations,
  iconKinds,
  industries,
  linkTypes,
  presets,
  type BrandRecord,
  type LinkType,
} from './model';
import { isPublicWebUrl } from '../url-validation';
export class ProductError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const reservedSlugs = new Set([
  'admin',
  'api',
  'qr',
  'assets',
  '_next',
  'favicon',
  'robots',
  'sitemap',
  'login',
  'logout',
]);
export function normalizeLink(type: LinkType, value: string): string {
  const raw = value.trim();
  if (type === 'call') {
    const phone = raw.replace(/^tel:/i, '').replace(/[ ()-]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(phone))
      throw new ProductError('Enter a valid phone number (7–15 digits).');
    return `tel:${phone}`;
  }
  if (type === 'email') {
    const email = raw.replace(/^mailto:/i, '');
    if (!/^[^\s@?&#:]+@[^\s@?&#:]+\.[^\s@?&#:]+$/.test(email))
      throw new ProductError('Enter a valid email address.');
    return `mailto:${email}`;
  }
  if (type === 'whatsapp' && /^\+?[0-9 ()-]+$/.test(raw)) {
    const phone = raw.replace(/\D/g, '');
    if (!/^[1-9][0-9]{6,14}$/.test(phone))
      throw new ProductError('WhatsApp needs a country code and 7–15 digits.');
    return `https://wa.me/${phone}`;
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ProductError('Enter a complete http:// or https:// URL.');
  }
  if (!isPublicWebUrl(raw))
    throw new ProductError(
      'Only safe HTTP(S) URLs without credentials are allowed.',
    );
  const domains: Partial<Record<LinkType, string[]>> = {
    instagram: ['instagram.com'],
    facebook: ['facebook.com', 'fb.com'],
    youtube: ['youtube.com', 'youtu.be'],
    whatsapp: ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'],
  };
  if (
    domains[type] &&
    !domains[type]!.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    )
  )
    throw new ProductError(`Invalid ${type} URL.`);
  if (type === 'whatsapp') {
    const phone =
      url.hostname === 'wa.me'
        ? /^\/(\+?[1-9][0-9]{6,14})\/?$/.exec(url.pathname)?.[1]
        : url.searchParams.get('phone');
    if (!phone || !/^\+?[1-9][0-9]{6,14}$/.test(phone))
      throw new ProductError('WhatsApp URL must include a valid phone number.');
    return raw;
  }
  return raw;
}
function text(value: unknown, label: string, max = 300) {
  if (typeof value !== 'string' || value.length > max)
    throw new ProductError(`${label} must be text under ${max} characters.`);
  return value.trim();
}
export function validateInput(
  input: unknown,
  current?: BrandRecord,
): BrandRecord {
  if (!input || typeof input !== 'object')
    throw new ProductError('Invalid brand.');
  const x = input as BrandRecord;
  const result = { ...current } as BrandRecord;
  for (const key of [
    'name',
    'slug',
    'category',
    'industry',
    'tagline',
    'heroTitle',
    'heroSubtitle',
    'description',
    'logo',
  ] as const)
    result[key] = text(x[key], key, key === 'description' ? 2000 : 300);
  if (!result.name) throw new ProductError('Brand name is required.');
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug) ||
    result.slug.length > 70 ||
    reservedSlugs.has(result.slug)
  )
    throw new ProductError(
      'Choose an available lowercase slug using letters, numbers and hyphens.',
    );
  if (!(industries as readonly string[]).includes(result.industry))
    throw new ProductError('Choose an industry.');
  for (const key of [
    'primaryColor',
    'secondaryColor',
    'accentColor',
    'backgroundColor',
  ] as const) {
    if (!/^#[0-9a-f]{6}$/i.test(x[key]))
      throw new ProductError('Colors must use six-digit hex values.');
    result[key] = x[key];
  }
  if (
    !(presets as readonly string[]).includes(x.themePreset) ||
    !(animations as readonly string[]).includes(x.animationPreset)
  )
    throw new ProductError('Choose a valid style and animation.');
  result.themePreset = x.themePreset;
  result.animationPreset = x.animationPreset;
  if (
    typeof x.directoryVisible !== 'boolean' ||
    typeof x.fallbackApproved !== 'boolean'
  )
    throw new ProductError('Invalid visibility or fallback setting.');
  result.directoryVisible = x.directoryVisible;
  result.fallbackApproved = x.fallbackApproved;
  if (
    result.logo &&
    !/^\/api\/assets\/[a-f0-9-]+\.(png|jpg|webp)$/.test(result.logo) &&
    result.logo !== current?.logo
  )
    throw new ProductError('Upload a supported logo.');
  if (!Array.isArray(x.links) || x.links.length > 40)
    throw new ProductError('Use at most 40 links.');
  const ids = new Set<string>();
  result.links = x.links.map((link, index) => {
    if (
      !link ||
      !linkTypes.includes(link.type) ||
      !iconKinds.includes(link.icon) ||
      typeof link.enabled !== 'boolean'
    )
      throw new ProductError('Choose a valid link type and icon.');
    const id = text(link.id, 'Link ID', 80);
    if (!/^[a-zA-Z0-9-]+$/.test(id) || ids.has(id))
      throw new ProductError('Invalid or duplicate link ID.');
    ids.add(id);
    const label = text(link.label, 'Link label', 100),
      description = text(link.description, 'Link description', 300),
      url = text(link.url, 'URL', 2000);
    if (!label) throw new ProductError('Every link needs a label.');
    if (link.enabled && !url)
      throw new ProductError(`${label} needs a URL or must be disabled.`);
    return {
      id,
      brandId: current?.id || '',
      type: link.type,
      label,
      description,
      url: url ? normalizeLink(link.type, url) : '',
      icon: link.icon,
      sortOrder: index,
      enabled: link.enabled,
      cta: current?.links.find((l) => l.id === id)?.cta,
      cardCta: current?.links.find((l) => l.id === id)?.cardCta,
      handle: current?.links.find((l) => l.id === id)?.handle,
    };
  });
  if (
    current &&
    (
      [
        'primaryColor',
        'secondaryColor',
        'accentColor',
        'backgroundColor',
        'themePreset',
      ] as const
    ).some((key) => result[key] !== current[key])
  )
    result.legacyPresentation = undefined;
  return result;
}
export function publishIssues(brand: BrandRecord) {
  return [
    !brand.name && 'Brand name is required.',
    !brand.slug && 'A unique slug is required.',
    !brand.industry && 'Industry is required.',
    !brand.logo &&
      !brand.fallbackApproved &&
      'Upload a logo or approve the fallback.',
    !brand.links.some((l) => l.enabled && l.url) &&
      'At least one enabled valid link is required.',
  ].filter(Boolean) as string[];
}

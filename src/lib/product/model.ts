import type { Brand, Destination } from '@/config/brands';

export const industries = [
  'Restaurant / Food',
  'Education / Tuition',
  'Elevator / Industrial',
  'Healthcare',
  'Real Estate',
  'Retail',
  'Professional Services',
  'Hospitality',
  'Other',
] as const;
export const presets = [
  'food',
  'education',
  'elevator',
  'healthcare',
  'real-estate',
  'retail',
  'network',
  'minimal',
] as const;
export const animations = [...presets, 'none'] as const;
export const linkTypes = [
  'website',
  'google_review',
  'whatsapp',
  'instagram',
  'facebook',
  'youtube',
  'call',
  'email',
  'maps',
  'brochure',
  'admissions',
  'appointment',
  'enquiry',
  'services',
  'courses',
  'results',
  'custom',
] as const;
export const iconKinds = [
  'website',
  'review',
  'whatsapp',
  'instagram',
  'youtube',
  'phone',
  'location',
  'brochure',
  'enquiry',
  'services',
  'courses',
  'results',
  'timings',
] as const;
export type Preset = (typeof presets)[number];
export type LinkType = (typeof linkTypes)[number];
export type BrandLink = {
  id: string;
  brandId: string;
  type: LinkType;
  label: string;
  description: string;
  url: string;
  icon: Destination['kind'];
  sortOrder: number;
  enabled: boolean;
  cta?: string;
  cardCta?: string;
  handle?: string;
};
export type BrandRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  industry: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  logo: string;
  fallbackApproved: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  themePreset: Preset;
  animationPreset: (typeof animations)[number];
  status: 'draft' | 'published' | 'archived';
  directoryVisible: boolean;
  createdAt: string;
  updatedAt: string;
  links: BrandLink[];
  legacyPresentation?: Pick<Brand, 'theme' | 'copy' | 'decor' | 'placeholder'>;
};
export const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
export function industryPreset(industry: string): Preset {
  return (
    (
      {
        'Restaurant / Food': 'food',
        'Education / Tuition': 'education',
        'Elevator / Industrial': 'elevator',
        Healthcare: 'healthcare',
        'Real Estate': 'real-estate',
        Retail: 'retail',
        'Professional Services': 'network',
        Hospitality: 'minimal',
      } as Record<string, Preset>
    )[industry] || 'minimal'
  );
}
export function emptyBrand(): BrandRecord {
  return {
    id: '',
    slug: '',
    name: '',
    category: '',
    industry: 'Other',
    tagline: '',
    heroTitle: '',
    heroSubtitle: '',
    description: '',
    logo: '',
    fallbackApproved: false,
    primaryColor: '#255C88',
    secondaryColor: '#183047',
    accentColor: '#CB6A24',
    backgroundColor: '#F1F6FA',
    themePreset: 'minimal',
    animationPreset: 'minimal',
    status: 'draft',
    directoryVisible: true,
    createdAt: '',
    updatedAt: '',
    links: [],
  };
}
export function foreground(hex: string) {
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179
    ? '#182633'
    : '#FFFFFF';
}
export function renderBrand(record: BrandRecord): Brand {
  const legacy = record.legacyPresentation;
  return {
    slug: record.slug,
    name: record.name,
    category: record.category || record.industry,
    tagline: record.tagline,
    logo: record.logo || '/brands/fallback.svg',
    experience: record.themePreset,
    animationPreset: record.animationPreset,
    customTheme: !legacy,
    placeholder: legacy?.placeholder,
    decor: legacy?.decor,
    copy: {
      brandLine: legacy?.copy.brandLine || record.name,
      heading: record.heroTitle || record.name,
      description: record.heroSubtitle || record.description || record.tagline,
    },
    theme: legacy?.theme || {
      red: record.primaryColor,
      darkRed: record.secondaryColor,
      softRed: record.backgroundColor,
      green: record.accentColor,
      cream: record.backgroundColor,
      ink: foreground(record.backgroundColor),
      muted: foreground(record.backgroundColor),
      surfaceAlt: record.backgroundColor,
      border: record.primaryColor,
    },
    links: [...record.links]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((link) => ({
        id: link.id,
        kind: link.icon,
        title: link.label,
        description: link.description,
        url: link.url,
        disabled: !link.enabled,
        cta: link.cta || `Open ${link.label}`,
        cardCta: link.cardCta || 'Open',
        handle: link.handle,
      })),
  };
}

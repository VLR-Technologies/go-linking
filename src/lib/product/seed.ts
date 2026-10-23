import { brands } from '@/config/brands';
import type { BrandRecord, LinkType } from './model';
export function seedBrands(): BrandRecord[] {
  const now = new Date().toISOString();
  return brands.map((brand) => ({
    id: `seed-${brand.slug}`,
    slug: brand.slug,
    name: brand.name,
    category: brand.category,
    industry:
      brand.experience === 'food'
        ? 'Restaurant / Food'
        : brand.experience === 'education'
          ? 'Education / Tuition'
          : 'Elevator / Industrial',
    tagline: brand.tagline,
    heroTitle: brand.copy.heading,
    heroSubtitle: brand.copy.description,
    description: brand.copy.description,
    logo: brand.logo,
    fallbackApproved: false,
    primaryColor: brand.theme.red,
    secondaryColor: brand.theme.darkRed,
    accentColor: brand.theme.green,
    backgroundColor: brand.theme.cream,
    themePreset: brand.experience,
    animationPreset: brand.experience,
    status: 'published',
    directoryVisible: true,
    createdAt: now,
    updatedAt: now,
    legacyPresentation: {
      theme: brand.theme,
      copy: brand.copy,
      decor: brand.decor,
      placeholder: brand.placeholder,
    },
    links: brand.links.map((link, sortOrder) => ({
      id: link.id,
      brandId: `seed-${brand.slug}`,
      type:
        (
          {
            review: 'google_review',
            phone: 'call',
            location: 'maps',
            timings: 'custom',
          } as Record<string, LinkType>
        )[link.kind] || (link.kind as LinkType),
      label: link.title,
      description: link.description,
      url: link.url,
      icon: link.kind,
      sortOrder,
      enabled: !link.disabled,
      cta: link.cta,
      cardCta: link.cardCta,
      handle: link.handle,
    })),
  }));
}

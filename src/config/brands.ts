export type Destination = {
  id: string;
  kind: 'website' | 'instagram' | 'review';
  title: string;
  description: string;
  url: string;
  cta: string;
  cardCta: string;
  handle?: string;
};
export type Brand = {
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  copy: {
    brandLine: string;
    heading: string;
    description: string;
  };
  theme: {
    red: string;
    darkRed: string;
    softRed: string;
    green: string;
    cream: string;
    ink: string;
    muted: string;
    surfaceAlt: string;
    border: string;
  };
  links: Destination[];
};
export const brands: Brand[] = [
  {
    slug: 'mozza-italia',
    name: 'Mozza Italia',
    tagline: 'Taste Brings People Together',
    logo: '/brands/mozza-italia/logo.png',
    copy: {
      brandLine: 'A LITTLE TASTE OF ITALY',
      heading: 'MORE MOZZA.\nONE TAP AWAY.',
      description: 'Your favourite links, all in one place.',
    },
    theme: {
      red: '#A50F16',
      darkRed: '#7E0B10',
      softRed: '#F7E7E5',
      green: '#173D32',
      cream: '#FFFDF9',
      ink: '#242220',
      muted: '#6F6B65',
      surfaceAlt: '#F7F3EC',
      border: '#E8E2D8',
    },
    links: [
      {
        id: 'website',
        kind: 'website',
        title: 'Website',
        description: 'Discover our menu & more',
        url: 'https://www.mozzaitalia.com',
        cta: 'Open Website',
        cardCta: 'Visit Website',
      },
      {
        id: 'instagram',
        kind: 'instagram',
        title: 'Instagram',
        description: '@italia.mozza',
        handle: '@italia.mozza',
        url: 'https://www.instagram.com/italia.mozza/',
        cta: 'Open Instagram',
        cardCta: 'Open Instagram',
      },
      {
        id: 'review',
        kind: 'review',
        title: 'Google Reviews',
        description: 'Tell us about your visit',
        url: 'https://g.page/r/CbxmdpzE3rO4EBM/review',
        cta: 'Leave a Google Review',
        cardCta: 'Leave a Review',
      },
    ],
  },
];
export function validateBrands(items: Brand[]) {
  const slugs = new Set<string>();
  for (const brand of items) {
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(brand.slug) ||
      slugs.has(brand.slug) ||
      !brand.name.trim() ||
      !brand.tagline.trim() ||
      !brand.links.length ||
      !brand.logo.startsWith('/brands/')
    )
      throw new Error('Invalid brand configuration');
    slugs.add(brand.slug);
    if (
      Object.values(brand.theme).some((color) => !/^#[0-9a-f]{6}$/i.test(color))
    )
      throw new Error('Invalid brand theme');
    const ids = new Set<string>();
    for (const link of brand.links) {
      const url = new URL(link.url);
      if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        !/^[a-z0-9-]+$/.test(link.id) ||
        ids.has(link.id) ||
        !link.title ||
        !link.cta ||
        !link.description
      )
        throw new Error('Invalid destination configuration');
      ids.add(link.id);
    }
  }
}
validateBrands(brands);
export const getBrand = (slug: string) =>
  brands.find((brand) => brand.slug === slug);
export const getDestination = (brand: Brand, id: string) =>
  brand.links.find((link) => link.id === id);

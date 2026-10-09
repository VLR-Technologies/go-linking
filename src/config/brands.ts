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
    welcome: string;
    heading: string;
    description: string;
    closing: string;
  };
  theme: { red: string; green: string; cream: string };
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
      welcome: 'WELCOME TO MOZZA ITALIA',
      heading: 'What would you like to explore?',
      description: 'Everything Mozza Italia, just one scan away.',
      closing: 'One scan. Many ways to connect.',
    },
    theme: { red: '#8f282b', green: '#213f34', cream: '#f8f3e9' },
    links: [
      {
        id: 'website',
        kind: 'website',
        title: 'Visit Our Website',
        description: 'Explore our menu, locations and more.',
        url: 'https://www.mozzaitalia.com',
        cta: 'Open Website',
        cardCta: 'Visit Website',
      },
      {
        id: 'instagram',
        kind: 'instagram',
        title: 'Follow Us on Instagram',
        description: 'Food updates, reels and more from Mozza Italia.',
        handle: '@italia.mozza',
        url: 'https://www.instagram.com/italia.mozza/',
        cta: 'Open Instagram',
        cardCta: 'Open Instagram',
      },
      {
        id: 'review',
        kind: 'review',
        title: 'Review Us on Google',
        description: 'Loved your visit? Share your experience with us.',
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

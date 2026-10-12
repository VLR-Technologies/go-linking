import type { Brand, Destination } from './brands/types';
import { mozzaItalia } from './brands/mozza-italia';
import { elevatorCompany } from './brands/elevator-company';
import { tuitionClasses } from './brands/tuition-classes';
export type { Brand, Destination } from './brands/types';
export const brands: Brand[] = [mozzaItalia, elevatorCompany, tuitionClasses];
export function isUsableDestination(link: Destination) {
  if (link.disabled || !link.url) return false;
  try {
    const url = new URL(link.url);
    return (
      !url.username &&
      !url.password &&
      (url.protocol === 'https:' ||
        (url.protocol === 'tel:' &&
          /^tel:\+?[0-9][0-9 ()-]{4,}$/.test(link.url)))
    );
  } catch {
    return false;
  }
}
export function validateBrands(items: Brand[]) {
  const slugs = new Set<string>();
  for (const brand of items) {
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(brand.slug) ||
      slugs.has(brand.slug) ||
      !brand.name.trim() ||
      !brand.tagline.trim() ||
      !brand.category.trim() ||
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
      if (
        (!link.disabled && Boolean(link.url) && !isUsableDestination(link)) ||
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
  brand.links.find((link) => link.id === id && isUsableDestination(link));

import { isPublicWebUrl } from '../lib/url-validation';
import { elevatorCompany } from './brands/elevator-company';
import { mozzaItalia } from './brands/mozza-italia';
import { tuitionClasses } from './brands/tuition-classes';
import type { Brand, Destination } from './brands/types';

export type { Brand, Destination } from './brands/types';

// These configurations seed the product repository and remain its read-only
// production fallback. Runtime routes use BrandService and the provider layer.
export const brands: Brand[] = [mozzaItalia, elevatorCompany, tuitionClasses];

function isUsableTelephone(value: string) {
  const match = /^tel:(\+?)([0-9 ()-]+)$/i.exec(value);
  const digits = match?.[2].replace(/\D/g, '') || '';
  return Boolean(match && digits.length >= 7 && digits.length <= 15);
}

function isUsableEmail(value: string) {
  return /^mailto:[^\s@?&#:]+@[^\s@?&#:]+\.[^\s@?&#:]+$/i.test(value);
}

export function isUsableDestination(link: Destination) {
  if (link.disabled || !link.url) return false;
  if (isUsableWebDestination(link.url)) return true;
  return isUsableEmail(link.url) || isUsableTelephone(link.url);
}

function isUsableWebDestination(value: string) {
  return isPublicWebUrl(value);
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
        (!link.disabled &&
          Boolean(link.url) &&
          (!isUsableDestination(link) || /^http:/i.test(link.url))) ||
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

// Return the configured bytes. URL serialization can change escaping in
// approved business paths, query parameters and WhatsApp messages.
export const getDestinationUrl = (brand: Brand, id: string) =>
  getDestination(brand, id)?.url;

import { randomUUID } from 'node:crypto';
import type { BrandRepository, AssetStorage } from './contracts';
import type { BrandRecord } from './model';
import { ProductError, publishIssues, validateInput } from './validation';
export class BrandService {
  constructor(
    private repository: BrandRepository,
    private assets?: AssetStorage,
  ) {}
  list() {
    return this.repository.list();
  }
  async get(id: string) {
    return (await this.list()).find((b) => b.id === id);
  }
  async published(slug: string) {
    return (await this.list()).find(
      (b) => b.slug === slug && b.status === 'published',
    );
  }
  async directory() {
    return (await this.list()).filter(
      (b) => b.status === 'published' && b.directoryVisible,
    );
  }
  async save(input: unknown, id?: string, confirmSlug = false) {
    const logo = (input as BrandRecord | undefined)?.logo;
    if (
      typeof logo === 'string' &&
      logo.startsWith('/api/assets/') &&
      this.assets &&
      !(await this.assets.read(logo.slice('/api/assets/'.length)))
    )
      throw new ProductError(
        'Uploaded logo is unavailable. Please upload it again.',
      );
    return this.repository.transact((items) => {
      const previous = id ? items.find((b) => b.id === id) : undefined;
      if (id && !previous) throw new ProductError('Brand not found.', 404);
      if (previous && (input as BrandRecord).updatedAt !== previous.updatedAt)
        throw new ProductError(
          'This brand changed in another window. Reload before saving.',
          409,
        );
      const brand = validateInput(input, previous);
      if (items.some((b) => b.slug === brand.slug && b.id !== id))
        throw new ProductError('Slug is already being used.', 409);
      if (
        previous?.status === 'published' &&
        previous.slug !== brand.slug &&
        !confirmSlug
      )
        throw new ProductError(
          'This can break existing printed QR codes and NFC tags. Confirm the slug change.',
          409,
        );
      const now = new Date(
        Math.max(Date.now(), previous ? Date.parse(previous.updatedAt) + 1 : 0),
      ).toISOString();
      brand.id = previous?.id || randomUUID();
      brand.createdAt = previous?.createdAt || now;
      brand.updatedAt = now;
      brand.status = previous?.status || 'draft';
      brand.links = brand.links.map((l) => ({ ...l, brandId: brand.id }));
      if (
        brand.status === 'published' &&
        !brand.legacyPresentation?.placeholder
      ) {
        const issues = publishIssues(brand);
        if (issues.length) throw new ProductError(issues.join(' '));
      }
      if (previous) items[items.findIndex((b) => b.id === id)] = brand;
      else items.push(brand);
      return brand;
    });
  }
  async transition(id: string, status: BrandRecord['status']) {
    return this.repository.transact((items) => {
      const brand = items.find((b) => b.id === id);
      if (!brand) throw new ProductError('Brand not found.', 404);
      if (!['published', 'draft', 'archived'].includes(status))
        throw new ProductError('Invalid status.');
      if (status === 'published') {
        const issues = publishIssues(brand);
        if (issues.length) throw new ProductError(issues.join(' '));
        validateInput(brand, brand);
        if (brand.legacyPresentation?.placeholder)
          brand.legacyPresentation = {
            ...brand.legacyPresentation,
            placeholder: false,
          };
      }
      brand.status = status;
      brand.updatedAt = new Date(
        Math.max(Date.now(), Date.parse(brand.updatedAt) + 1),
      ).toISOString();
      return brand;
    });
  }
}

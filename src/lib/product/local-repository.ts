import {
  mkdir,
  readFile,
  writeFile,
  rename,
  open,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { BrandRepository } from './contracts';
import type { BrandRecord } from './model';
import { seedBrands } from './seed';
import { mozzaItalia } from '@/config/brands/mozza-italia';

function migrateLegacyMozzaInstagram(items: BrandRecord[]) {
  const brand = items.find(
    (item) => item.id === 'seed-mozza-italia' && item.slug === mozzaItalia.slug,
  );
  const link = brand?.links.find(
    (item) =>
      item.id === 'instagram' &&
      item.type === 'instagram' &&
      item.url === 'https://www.instagram.com/italia.mozza',
  );
  const official = mozzaItalia.links.find((item) => item.id === 'instagram');
  if (!brand || !link || !official) return false;
  // Only replace the obsolete seeded target; preserve admin customizations.
  link.url = official.url;
  if (link.handle === '@italia.mozza') link.handle = official.handle;
  brand.updatedAt = new Date(
    Math.max(Date.now(), Date.parse(brand.updatedAt) + 1),
  ).toISOString();
  return true;
}

export class LocalBrandRepository implements BrandRepository {
  constructor(private directory: string) {}
  private async read(): Promise<BrandRecord[]> {
    try {
      const data = JSON.parse(
        await readFile(path.join(this.directory, 'brands.json'), 'utf8'),
      );
      if (data.version !== 1 || !Array.isArray(data.brands))
        throw new Error('Invalid store');
      return data.brands;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT')
        return seedBrands();
      throw new Error(
        'Local brand storage could not be read. Restore a valid backup before continuing.',
      );
    }
  }
  async list() {
    // Initialization and targeted seed corrections share the write lock.
    try {
      await readFile(path.join(this.directory, 'brands.json'));
      const items = await this.read();
      if (migrateLegacyMozzaInstagram(items))
        return this.transact((items) => structuredClone(items));
      return structuredClone(items);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      return this.transact((items) => structuredClone(items));
    }
  }
  async transact<T>(operation: (brands: BrandRecord[]) => T): Promise<T> {
    await mkdir(this.directory, { recursive: true });
    const lockPath = path.join(this.directory, 'brands.lock');
    let lock;
    for (let i = 0; i < 100; i++) {
      try {
        lock = await open(lockPath, 'wx', 0o600);
        break;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
        await new Promise((r) => setTimeout(r, 30));
      }
    }
    if (!lock) throw new Error('Brand storage is busy. Please retry.');
    const temporary = path.join(this.directory, `${randomUUID()}.tmp`);
    try {
      const items = await this.read();
      migrateLegacyMozzaInstagram(items);
      const result = operation(items);
      await writeFile(
        temporary,
        JSON.stringify({ version: 1, brands: items }, null, 2),
        { mode: 0o600 },
      );
      await rename(temporary, path.join(this.directory, 'brands.json'));
      return result;
    } finally {
      await unlink(temporary).catch(() => {});
      await lock.close();
      await unlink(lockPath);
    }
  }
}
export class ReadOnlySeedRepository implements BrandRepository {
  async list() {
    return seedBrands();
  }
  async transact<T>(): Promise<T> {
    throw new Error('Local persistence is disabled in production.');
  }
}

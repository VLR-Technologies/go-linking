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
    // Initialization is serialized with writes; an existing file is never re-seeded.
    try {
      await readFile(path.join(this.directory, 'brands.json'));
      return structuredClone(await this.read());
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

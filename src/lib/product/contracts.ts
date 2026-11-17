import type { BrandRecord } from './model';
export interface BrandRepository {
  list(): Promise<BrandRecord[]>;
  transact<T>(operation: (brands: BrandRecord[]) => T): Promise<T>;
}
export interface AssetStorage {
  save(bytes: Buffer, extension: string): Promise<string>;
  read(id: string): Promise<{ bytes: Buffer; contentType: string } | undefined>;
}
export interface AdminAuthProvider {
  available(): boolean;
  login(username: string, password: string): Promise<string | null>;
  verify(session: string | undefined): Promise<boolean>;
  logout(session: string | undefined): Promise<void>;
}
export interface WebsiteDiscovery {
  discover(url: string): Promise<{
    available: boolean;
    suggestions: Record<string, string>;
    message: string;
  }>;
}

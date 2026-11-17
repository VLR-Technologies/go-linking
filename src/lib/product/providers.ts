import path from 'node:path';
import {
  LocalBrandRepository,
  ReadOnlySeedRepository,
} from './local-repository';
import { LocalAssetStorage } from './local-assets';
import { LocalAdminAuthProvider } from './local-auth';
import { BrandService } from './service';
import type { WebsiteDiscovery } from './contracts';
// Only this composition root chooses concrete adapters. No production local-write override.
const root = path.join(
  process.cwd(),
  '.dev-data',
  process.env.GO_LINKING_QA === '1' ? 'qa' : '',
);
export const repository =
  process.env.NODE_ENV === 'development'
    ? new LocalBrandRepository(root)
    : new ReadOnlySeedRepository();
export const assetStorage = new LocalAssetStorage(path.join(root, 'uploads'));
export const brandService = new BrandService(repository, assetStorage);
export const adminAuth = new LocalAdminAuthProvider(
  undefined,
  path.join(root, 'revoked-sessions'),
);
export const discovery: WebsiteDiscovery = {
  async discover() {
    return {
      available: false,
      suggestions: {},
      message:
        'Website discovery is planned. Add verified company links manually for now.',
    };
  },
};

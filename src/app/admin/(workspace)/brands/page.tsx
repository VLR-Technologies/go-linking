import { requireAdminPage } from '@/lib/product/http';
import { brandService } from '@/lib/product/providers';
import { BrandList } from '@/components/admin/BrandList';
export default async function Brands() {
  await requireAdminPage();
  return <BrandList initial={await brandService.list()} />;
}

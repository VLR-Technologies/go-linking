import { requireAdminPage } from '@/lib/product/http';
import { BrandWizard } from '@/components/admin/BrandWizard';
import { emptyBrand } from '@/lib/product/model';
export default async function NewBrand() {
  await requireAdminPage();
  return <BrandWizard initial={emptyBrand()} />;
}

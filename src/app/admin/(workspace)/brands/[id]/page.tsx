import { requireAdminPage } from '@/lib/product/http';
import { notFound } from 'next/navigation';
import { BrandWizard } from '@/components/admin/BrandWizard';
import { brandService } from '@/lib/product/providers';
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const brand = await brandService.get((await params).id);
  if (!brand) notFound();
  return <BrandWizard initial={brand} />;
}

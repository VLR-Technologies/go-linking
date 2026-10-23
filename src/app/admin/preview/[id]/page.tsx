import { notFound, redirect } from 'next/navigation';
import { authorized } from '@/lib/product/http';
import { brandService } from '@/lib/product/providers';
import { renderBrand } from '@/lib/product/model';
import { BrandPage } from '@/components/BrandPage';
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await authorized())) redirect('/admin/login');
  const brand = await brandService.get((await params).id);
  if (!brand) notFound();
  return <BrandPage brand={renderBrand(brand)} />;
}

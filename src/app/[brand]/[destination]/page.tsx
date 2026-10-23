import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getDestination } from '@/config/brands';
import { brandService } from '@/lib/product/providers';
import { renderBrand } from '@/lib/product/model';
export const dynamic = 'force-dynamic';
type Params = Promise<{ brand: string; destination: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const route = await params;
  const record = await brandService.published(route.brand);
  const brand = record && renderBrand(record);
  const link = brand && getDestination(brand, route.destination);
  return link && brand
    ? {
        title: `${link.title} | ${brand.name}`,
        description: link.description,
        alternates: { canonical: link.url },
      }
    : {};
}
export default async function DestinationRoute({ params }: { params: Params }) {
  const route = await params;
  const record = await brandService.published(route.brand);
  const brand = record && renderBrand(record);
  if (!brand) notFound();
  const destination = getDestination(brand, route.destination);
  if (!destination) notFound();
  redirect(destination.url);
}

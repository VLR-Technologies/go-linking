import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getDestination, getDestinationUrl } from '@/config/brands';
import { brandService } from '@/lib/product/providers';
import { renderBrand } from '@/lib/product/model';

export const dynamic = 'force-dynamic';

type Params = Promise<{ brand: string; destination: string }>;

async function publishedBrand(slug: string) {
  const record = await brandService.published(slug);
  return record && renderBrand(record);
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const route = await params;
  const brand = await publishedBrand(route.brand);
  const link = brand && getDestination(brand, route.destination);
  const url = brand && getDestinationUrl(brand, route.destination);
  return link && url
    ? {
        title: `${link.title} | ${brand.name}`,
        description: link.description,
        alternates: { canonical: url },
      }
    : {};
}

export default async function DestinationRoute({ params }: { params: Params }) {
  const route = await params;
  const brand = await publishedBrand(route.brand);
  if (!brand) notFound();
  const url = getDestinationUrl(brand, route.destination);
  if (!url) notFound();
  redirect(url);
}

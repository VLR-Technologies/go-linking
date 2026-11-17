import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrandPage } from '@/components/BrandPage';
import { brandService } from '@/lib/product/providers';
import { renderBrand } from '@/lib/product/model';
import { getPublicBrandUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const record = await brandService.published((await params).brand);
  const brand = record && renderBrand(record);
  if (!brand) return {};
  const title = `${brand.name} | Quick Links`;
  const description = brand.copy.description;
  const url = getPublicBrandUrl(brand.slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: brand.name,
    },
  };
}

export default async function BrandHub({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const record = await brandService.published((await params).brand);
  const brand = record && renderBrand(record);
  if (!brand) notFound();
  return <BrandPage brand={brand} />;
}

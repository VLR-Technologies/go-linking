import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
  brands,
  getBrand,
  getDestination,
  getDestinationUrl,
  isUsableDestination,
} from '@/config/brands';
type Params = Promise<{ brand: string; destination: string }>;
export function generateStaticParams() {
  return brands.flatMap((brand) =>
    brand.links.filter(isUsableDestination).map((destination) => ({
      brand: brand.slug,
      destination: destination.id,
    })),
  );
}
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const route = await params;
  const brand = getBrand(route.brand);
  const link = brand && getDestination(brand, route.destination);
  return link && brand
    ? {
        title: `${link.title} | ${brand.name}`,
        description: link.description,
        alternates: { canonical: getDestinationUrl(brand, route.destination) },
      }
    : {};
}
export default async function DestinationRoute({ params }: { params: Params }) {
  const route = await params;
  const brand = getBrand(route.brand);
  if (!brand) notFound();
  const url = getDestinationUrl(brand, route.destination);
  if (!url) notFound();
  redirect(url);
}

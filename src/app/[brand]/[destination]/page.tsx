import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brands, getBrand, getDestination } from '@/config/brands';
import { DestinationPage } from '@/components/DestinationPage';
type Params = Promise<{ brand: string; destination: string }>;
export function generateStaticParams() {
  return brands.flatMap((brand) =>
    brand.links.map((destination) => ({
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
        alternates: { canonical: `/${brand.slug}/${link.id}` },
      }
    : {};
}
export default async function DestinationRoute({ params }: { params: Params }) {
  const route = await params;
  const brand = getBrand(route.brand);
  if (!brand) notFound();
  const destination = getDestination(brand, route.destination);
  if (!destination) notFound();
  return <DestinationPage brand={brand} destination={destination} />;
}

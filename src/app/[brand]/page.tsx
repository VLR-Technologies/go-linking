import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brands, getBrand } from '@/config/brands';
import { BrandShell } from '@/components/BrandShell';
import { BrandHeader } from '@/components/BrandHeader';
import { DestinationCard } from '@/components/DestinationCard';
import { CopyLinks } from '@/components/CopyLinks';
export function generateStaticParams() {
  return brands.map((brand) => ({ brand: brand.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const brand = getBrand((await params).brand);
  if (!brand) return {};
  const title = `${brand.name} | Quick Links`;
  const description = `Visit ${brand.name} online, follow us on Instagram or leave a Google review.`;
  return {
    title,
    description,
    alternates: { canonical: `/${brand.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/${brand.slug}`,
      siteName: brand.name,
    },
  };
}
export default async function BrandHub({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const brand = getBrand((await params).brand);
  if (!brand) notFound();
  return (
    <BrandShell brand={brand}>
      <BrandHeader brand={brand} />
      <section className="hub-section" aria-labelledby="hub-heading">
        <div className="section-heading">
          <h1 id="hub-heading">
            {brand.copy.heading.split('\n').map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p>{brand.copy.description}</p>
        </div>
        <nav className="destination-list" aria-label={`${brand.name} links`}>
          {brand.links.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </nav>
        <CopyLinks links={brand.links} />
      </section>
    </BrandShell>
  );
}

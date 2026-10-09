import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brands, getBrand } from '@/config/brands';
import { BrandShell } from '@/components/BrandShell';
import { BrandHeader } from '@/components/BrandHeader';
import { DestinationCard } from '@/components/DestinationCard';
import { BrandIntro } from '@/components/BrandIntro';
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
    <>
      <BrandIntro brand={brand} />
      <BrandShell brand={brand}>
        <div className="topline">
          <span className="eyebrow">{brand.copy.welcome}</span>
          <span className="topline-end">SCAN. CHOOSE. CONNECT.</span>
        </div>
        <div className="hub-brand-anchor">
          <BrandHeader brand={brand} />
        </div>
        <section className="hub-section">
          <div className="section-heading">
            <span className="eyebrow">FROM OUR TABLE TO YOUR WORLD</span>
            <h1>{brand.copy.heading}</h1>
            <p>{brand.copy.description}</p>
          </div>
          <div className="destination-grid">
            {brand.links.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                brand={brand}
                destination={destination}
                index={index}
              />
            ))}
          </div>
        </section>
        <p className="closing-note">{brand.copy.closing}</p>
      </BrandShell>
    </>
  );
}

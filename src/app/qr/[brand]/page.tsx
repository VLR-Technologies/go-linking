import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrand } from '@/config/brands';
import { masterUrl, siteSettings } from '@/lib/site';
import { QRCodeCard } from '@/components/QRCodeCard';
import { Footer } from '@/components/Footer';
export const metadata: Metadata = {
  title: 'QR Assets | Go-Linking',
  robots: { index: false, follow: false },
};
export default async function QRAssets({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const brand = getBrand((await params).brand);
  if (!brand) notFound();
  const settings = siteSettings();
  const master = masterUrl(brand.slug);
  const assets = [
    { id: 'master', title: 'Master hub', url: master },
    ...brand.links.map((link) => ({
      id: link.kind === 'review' ? 'google-review' : link.id,
      title: link.title,
      url: link.url,
    })),
  ];
  return (
    <div className="assets-shell">
      <main id="main">
        <Link className="text-button" href={`/${brand.slug}`}>
          ← Back to {brand.name}
        </Link>
        <p className="eyebrow">GO-LINKING · STAFF UTILITY</p>
        <h1>QR Assets</h1>
        <p>One destination for every connection.</p>
        <div className="notice">
          {settings.downloadableMaster
            ? 'Public HTTPS origin configured. Before printing the master QR, verify the deployed hub on a phone and test a physical proof. Configuration alone does not verify deployment.'
            : 'Local / preview master QR — not for printing. Master download is disabled. Set NEXT_PUBLIC_SITE_URL to your real public HTTPS origin and rebuild before preparing production assets.'}
        </div>
        <div className="assets-grid">
          {assets.map((asset) => (
            <section className="asset" key={asset.id}>
              <h2>{asset.title}</h2>
              <QRCodeCard
                url={asset.url}
                label={asset.title}
                filename={`${brand.slug}-${asset.id}-qr.png`}
                allowDownload={
                  asset.id !== 'master' || settings.downloadableMaster
                }
              />
              <code>{asset.url}</code>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { brands } from '@/config/brands';
import { siteSettings } from '@/lib/site';
import { Footer } from '@/components/Footer';
import { VlrLockup } from '@/components/VlrLockup';
import { BrandTile } from '@/components/directory/BrandTile';
import { ConnectedHero } from '@/components/directory/ConnectedHero';
import { ConnectionMark } from '@/components/directory/ConnectionMark';
import { uiFont } from './fonts';
import './directory-experience.css';

export const metadata: Metadata = {
  title: 'Go-Linking — One Link. Endless Connections. | VLR Technologies',
  description:
    'Discover partner brands and their digital destinations with Go-Linking, the digital connection hub by VLR Technologies. Explore, scan a QR, or share a brand link.',
};

export default function Home() {
  const { downloadableMaster } = siteSettings();

  return (
    <div className={`directory-shell ${uiFont.variable}`}>
      <header className="directory-header directory-container">
        <Link
          className="directory-wordmark"
          href="/"
          aria-label="Go-Linking home"
        >
          <ConnectionMark />
          <span>GO-LINKING</span>
        </Link>
        <a
          className="directory-maker"
          href="https://vlrtechnologies.net/"
          aria-label="VLR Technologies"
        >
          <VlrLockup />
          <span className="maker-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      </header>
      <main id="main" className="directory-main" tabIndex={-1}>
        <ConnectedHero />
        <section
          id="connections"
          className="partner-discovery directory-container"
          aria-labelledby="discovery-title"
          tabIndex={-1}
        >
          <div className="directory-section-heading">
            <h2 id="discovery-title">
              Explore the Network<span>.</span>
            </h2>
            <span className="directory-heading-mark" aria-hidden="true">
              ↘
            </span>
          </div>
          <nav className="company-list" aria-label="VLR partner brands">
            {brands.map((brand) => (
              <BrandTile
                key={brand.slug}
                brand={brand}
                allowDownload={downloadableMaster}
              />
            ))}
          </nav>
        </section>
      </main>
      <Footer directory />
    </div>
  );
}

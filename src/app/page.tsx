import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { brands } from '@/config/brands';
import { masterUrl, siteSettings } from '@/lib/site';
import { LinkActions } from '@/components/LinkActions';
import { Footer } from '@/components/Footer';
import { VlrLockup, vlrTagline } from '@/components/VlrLockup';
import { ConnectedHero } from '@/components/directory/ConnectedHero';
import { displayFont, uiFont } from './fonts';
import './directory-experience.css';

export const metadata: Metadata = {
  title: 'Go-Linking — One Link. Infinite Connections. | VLR Technologies',
  description:
    'Discover partner brands and their digital destinations with Go-Linking, the digital connection hub by VLR Technologies. Explore, scan a QR, or share a brand link.',
};

export default function Home() {
  return (
    <div
      className={`directory-shell ${uiFont.variable} ${displayFont.variable}`}
    >
      <main id="main" className="directory-main" tabIndex={-1}>
        <header className="directory-header">
          <div className="directory-brand">
            <a
              href="https://vlrtechnologies.net/"
              aria-label="VLR Technologies"
            >
              <VlrLockup />
            </a>
            <p className="vlr-tagline">{vlrTagline}</p>
          </div>
          <span className="partner-label">
            <i aria-hidden="true" /> THE CONNECTION HUB
          </span>
        </header>
        <ConnectedHero />
        <div className="network-story">
          <p>
            From one connection to <strong>endless possibilities.</strong>
          </p>
          <div className="story-stages" aria-label="Discover, connect, explore">
            <span>Discover</span>
            <span className="story-line" aria-hidden="true" />
            <span>Connect</span>
            <span className="story-line" aria-hidden="true" />
            <span>
              Explore <span aria-hidden="true">↘</span>
            </span>
          </div>
        </div>
        <section
          id="connections"
          className="partner-discovery"
          aria-labelledby="discovery-title"
          tabIndex={-1}
        >
          <div className="directory-label">
            <div>
              <p className="eyebrow">GOOD BRANDS. CLOSER CONNECTIONS.</p>
              <h2 id="discovery-title">
                Discover what’s connected<span>.</span>
              </h2>
              <p className="discovery-description">
                Explore the brands and experiences in our growing digital
                network.
              </p>
            </div>
            <span className="connection-count">
              <strong>{String(brands.length).padStart(2, '0')}</strong> brand
              connections
            </span>
          </div>
          <nav className="company-list" aria-label="VLR partner brands">
            {brands.map((brand, index) => (
              <article
                className="company-card"
                key={brand.slug}
                data-preset={brand.experience}
              >
                <div className="company-visual">
                  <span className="company-number">
                    {String(index + 1).padStart(2, '0')} / THE NETWORK
                  </span>
                  <span className="company-orbit" aria-hidden="true" />
                  {brand.experience === 'food' && (
                    <Image
                      className="company-food-art"
                      src="/brands/mozza-italia/food/basil.svg"
                      alt=""
                      width={80}
                      height={80}
                      unoptimized
                    />
                  )}
                  <Image
                    className="company-logo"
                    src={brand.logo}
                    alt=""
                    width={180}
                    height={82}
                    unoptimized
                  />
                  <span
                    className={
                      brand.placeholder ? 'preview-badge' : 'brand-status'
                    }
                  >
                    {brand.placeholder
                      ? 'Client preview'
                      : 'Discover the brand'}
                  </span>
                </div>
                <div className="company-details">
                  <p className="company-category">{brand.category}</p>
                  <h3>{brand.name}</h3>
                  <p className="company-tagline">{brand.tagline}</p>
                  <div className="company-bottom">
                    <Link
                      className="company-open"
                      href={`/${brand.slug}`}
                      aria-label={`Open ${brand.name}`}
                    >
                      Explore brand <span aria-hidden="true">↗</span>
                    </Link>
                    <div className="card-actions">
                      <LinkActions
                        title={brand.name}
                        url={masterUrl(brand.slug)}
                        logo={brand.logo}
                        filename={`${brand.slug}-master-qr.png`}
                        allowDownload={siteSettings().downloadableMaster}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </nav>
          <p className="directory-note">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z" />
            </svg>
            One smart page. One QR. A direct connection to each brand.
          </p>
        </section>
        <div className="connection-ribbon" aria-hidden="true">
          <div className="ribbon-track">
            {[0, 1].map((copy) => (
              <span className="ribbon-copy" key={copy}>
                DISCOVER <i>✳</i> CONNECT <i>✳</i> EXPLORE <i>✳</i> EXPERIENCE{' '}
                <i>✳</i> GO BEYOND <i>✳</i>
              </span>
            ))}
          </div>
        </div>
      </main>
      <Footer directory />
    </div>
  );
}

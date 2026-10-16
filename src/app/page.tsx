import Link from 'next/link';
import { brands } from '@/config/brands';
import { siteSettings } from '@/lib/site';
import { Footer } from '@/components/Footer';
<<<<<<< Updated upstream
import { VlrLockup, vlrTagline } from '@/components/VlrLockup';
import { uiFont } from './fonts';
=======
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
>>>>>>> Stashed changes

export default function Home() {
  const { downloadableMaster } = siteSettings();

  return (
    <div className={`directory-shell ${uiFont.variable}`}>
<<<<<<< Updated upstream
      <main id="main" className="directory-main">
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
            <i aria-hidden="true" />
            PARTNER CONNECTIONS
          </span>
        </header>
        <section className="directory-intro">
          <div>
            <p className="eyebrow">
              <span aria-hidden="true" />
              ONE CONNECTION. EVERY POSSIBILITY.
            </p>
            <h1>
              GO-LINKING<span aria-hidden="true">.</span>
            </h1>
            <p className="directory-subtitle">
              One connection. Every brand within reach.
            </p>
          </div>
          <svg
            className="connection-art"
            viewBox="0 0 240 190"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="120"
              cy="95"
              r="76"
              stroke="currentColor"
              strokeDasharray="2 8"
            />
            <path d="M42 46 120 95 200 42M120 95l54 65" stroke="currentColor" />
            <rect
              x="92"
              y="67"
              width="56"
              height="56"
              rx="18"
              fill="#F1F6FC"
              stroke="currentColor"
            />
            <path
              d="m109 99 8-8m-3 15-3 3a9 9 0 0 1-13-13l9-9a9 9 0 0 1 13 0m-1 4 3-3a9 9 0 0 1 13 13l-9 9a9 9 0 0 1-13 0"
              transform="translate(5 -4)"
              stroke="#466B94"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="42" cy="46" r="10" fill="#FBEADB" stroke="#C27B3F" />
            <circle cx="200" cy="42" r="8" fill="#DCE9FA" stroke="#6484AC" />
            <circle cx="174" cy="160" r="8" fill="#E7E1F8" stroke="#9580C4" />
          </svg>
        </section>
        <div className="directory-label">
          <div>
            <span className="eyebrow">THE VLR NETWORK</span>
            <h2>Explore our partner brands</h2>
          </div>
          <span>{String(brands.length).padStart(2, '0')} CONNECTIONS</span>
        </div>
        <nav className="company-list" aria-label="VLR partner brands">
          {brands.map((brand, index) => (
            <article
              className="company-card"
              key={brand.slug}
              data-preset={brand.experience}
            >
              <div className="company-visual">
                <span className="company-number">0{index + 1}</span>
                <span className="company-orbit" aria-hidden="true" />
                <Image
                  src={brand.logo}
                  alt=""
                  width={180}
                  height={82}
                  unoptimized
                />
                {brand.placeholder && (
                  <span className="preview-badge">Client preview</span>
                )}
              </div>
              <div className="company-details">
                <p className="company-category">{brand.category}</p>
                <h2>{brand.name}</h2>
                <p className="company-tagline">{brand.tagline}</p>
                <div className="company-bottom">
                  <span>
                    Explore brand <span aria-hidden="true">↗</span>
                  </span>
                  <div className="card-actions">
                    <LinkActions
                      title={brand.name}
                      url={masterUrl(brand.slug)}
                      logo={brand.logo}
                      filename={`${brand.slug}-master-qr.png`}
                      allowDownload={siteSettings().downloadableMaster}
                    />
                    <Link
                      className="card-action company-open"
                      href={`/${brand.slug}`}
                      aria-label={`Open ${brand.name}`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M7 17 17 7M7 7h10v10" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </nav>
        <p className="directory-note">
          <svg
            width="16"
            height="16"
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
=======
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
>>>>>>> Stashed changes
      </main>
      <Footer />
    </div>
  );
}

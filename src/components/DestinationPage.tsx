import Link from 'next/link';
import type { Brand, Destination } from '@/config/brands';
import { BrandShell } from './BrandShell';
import { BrandHeader } from './BrandHeader';
import { Icon } from './Icon';
import { QRCodeCard } from './QRCodeCard';
import { CopyLinkButton } from './CopyLinkButton';
export function DestinationPage({
  brand,
  destination,
}: {
  brand: Brand;
  destination: Destination;
}) {
  return (
    <BrandShell brand={brand}>
      <nav className="back-nav">
        <Link href={`/${brand.slug}`}>
          ← <span>Back to {brand.name}</span>
        </Link>
        <span className="eyebrow">{brand.copy.brandLine}</span>
      </nav>
      <BrandHeader brand={brand} compact />
      <section className={`destination-panel ${destination.kind}`}>
        <div className="destination-intro">
          <span className="icon-badge">
            <Icon kind={destination.kind} />
          </span>
          <p className="eyebrow">LET’S STAY CONNECTED</p>
          <h1>{destination.title}</h1>
          <p>
            {destination.kind === 'review'
              ? 'Loved your visit? Share your experience with us.'
              : destination.description}
          </p>
          {destination.handle && <p className="handle">{destination.handle}</p>}
          {destination.kind === 'review' && (
            <>
              <span className="stars" aria-hidden="true">
                ★★★★★
              </span>
              <p className="rating-note">
                Your experience. Your honest rating.
              </p>
            </>
          )}
          <a
            className="primary-button"
            href={destination.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {destination.cta} <span aria-hidden="true">↗</span>
          </a>
          <p className="direct-hint">Already on your phone? Just tap above.</p>
          <CopyLinkButton url={destination.url} />
        </div>
        <div className="destination-qr">
          <span className="qr-overline">A CONNECTION TO KEEP</span>
          <QRCodeCard
            url={destination.url}
            label={destination.title}
            filename={`${brand.slug}-${destination.kind === 'review' ? 'google-review' : destination.id}-qr.png`}
          />
          <p className="qr-use">
            Take a little Mozza with you.
            <br />
            Save it for another screen or print.
          </p>
        </div>
      </section>
      <p className="closing-note">{brand.copy.closing}</p>
    </BrandShell>
  );
}

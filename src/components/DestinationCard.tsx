import Link from 'next/link';
import type { Brand, Destination } from '@/config/brands';
import { Icon } from './Icon';
export function DestinationCard({
  brand,
  destination,
  index,
}: {
  brand: Brand;
  destination: Destination;
  index: number;
}) {
  return (
    <Link
      className={`destination-card ${destination.kind}`}
      href={`/${brand.slug}/${destination.id}`}
    >
      <div className="card-top">
        <span className="icon-badge">
          <Icon kind={destination.kind} />
        </span>
        <span className="card-number">0{index + 1}</span>
      </div>
      <div className="card-copy">
        <h2>{destination.title}</h2>
        <p>{destination.description}</p>
        {destination.handle && (
          <span className="handle">{destination.handle}</span>
        )}
        {destination.kind === 'review' && (
          <span className="stars" aria-hidden="true">
            ★★★★★
          </span>
        )}
      </div>
      <div className="card-bottom">
        <span>{destination.cardCta}</span>
        <span className="arrow" aria-hidden="true">
          ↗
        </span>
      </div>
    </Link>
  );
}

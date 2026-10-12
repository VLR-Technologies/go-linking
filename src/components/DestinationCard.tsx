import { LinkActions } from './LinkActions';
import type { Destination } from '@/config/brands';
import { isUsableDestination } from '@/config/brands';
import type { CSSProperties } from 'react';
import { Icon } from './Icon';
export function DestinationCard({
  destination,
  logo,
  themedIcons = false,
  index = 0,
}: {
  destination: Destination;
  logo?: string;
  themedIcons?: boolean;
  index?: number;
}) {
  const usable = isUsableDestination(destination);
  return (
    <article
      className={`destination-card ${destination.kind}`}
      data-disabled={!usable || undefined}
      style={{ '--card-index': index } as CSSProperties}
    >
      <span className="icon-badge">
        <Icon kind={destination.kind} monochrome={themedIcons} />
      </span>
      <div className="card-copy">
        <h2>
          {destination.title}
          {destination.kind === 'review' && (
            <svg
              className="review-star"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="m12 2 3 6.3 7 .9-5 4.9 1.2 6.9-6.2-3.3L5.8 21 7 14.1 2 9.2l7-.9Z"
                fill="currentColor"
              />
            </svg>
          )}
        </h2>
        <p>{destination.description}</p>
      </div>
      {usable ? (
        <div className="card-actions">
          <LinkActions
            url={destination.url}
            title={destination.title}
            logo={logo}
            filename={`${destination.id}-qr.png`}
          />
          <a
            className="card-action open-action"
            href={destination.url}
            aria-label={destination.cta}
          >
            <svg
              className="link-arrow"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
        </div>
      ) : (
        <span className="destination-pending">Coming soon</span>
      )}
    </article>
  );
}

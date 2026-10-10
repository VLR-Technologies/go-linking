import type { Destination } from '@/config/brands';
import { Icon } from './Icon';
export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <a
      className={`destination-card ${destination.kind}`}
      href={destination.url}
    >
      <span className="icon-badge">
        <Icon kind={destination.kind} />
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
  );
}

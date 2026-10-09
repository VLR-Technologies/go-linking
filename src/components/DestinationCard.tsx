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
        <h2>{destination.title}</h2>
        <p>{destination.description}</p>
      </div>
      <svg
        className="link-arrow"
        width="20"
        height="20"
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

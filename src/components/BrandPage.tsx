import type { Brand } from '@/config/brands';
import { isUsableDestination } from '@/config/brands';
import { BrandShell } from './BrandShell';
import { BrandHeader } from './BrandHeader';
import { DestinationCard } from './DestinationCard';
export function BrandPage({ brand }: { brand: Brand }) {
  return (
    <BrandShell brand={brand}>
      <BrandHeader brand={brand} />
      <section className="hub-section" aria-labelledby="hub-heading">
        <div className="section-heading">
          <h1 id="hub-heading">
            {brand.copy.heading.split('\n').map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p>{brand.copy.description}</p>
        </div>
        {brand.placeholder && (
          <aside className="placeholder-notice">
            <span className="preview-dot" aria-hidden="true" />
            <p>
              <strong>Client preview</strong> · Identity and links coming soon
            </p>
          </aside>
        )}
        <nav className="destination-list" aria-label={`${brand.name} links`}>
          {brand.links
            .filter((link) => brand.placeholder || isUsableDestination(link))
            .map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                brand={brand}
                themedIcons={brand.experience !== 'food'}
                index={index}
              />
            ))}
        </nav>
      </section>
    </BrandShell>
  );
}

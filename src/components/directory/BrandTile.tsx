import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Brand } from '@/config/brands';
import { masterUrl } from '@/lib/site';
import { LinkActions } from '@/components/LinkActions';

export function BrandTile({
  brand,
  allowDownload,
}: {
  brand: Brand;
  allowDownload: boolean;
}) {
  return (
    <article
      className="company-card"
      data-preset={brand.experience}
      style={{ '--tile-accent': brand.theme.red } as CSSProperties}
    >
      <div className="company-visual">
        <span className="company-contours" aria-hidden="true" />
        <Image
          className="company-logo"
          src={brand.logo}
          alt=""
          width={200}
          height={100}
          unoptimized
        />
      </div>
      <div className="company-details">
        <h3>{brand.name}</h3>
        <p className="company-description">
          {brand.category}
          {brand.placeholder && ' · Preview'}
        </p>
        <div className="company-controls">
          <Link
            className="company-open"
            href={`/${brand.slug}`}
            aria-label={`Open ${brand.name}`}
          >
            Open brand <span aria-hidden="true">↗</span>
          </Link>
          <div className="card-actions">
            <LinkActions
              title={brand.name}
              url={masterUrl(brand.slug)}
              logo={brand.logo}
              filename={`${brand.slug}-master-qr.png`}
              allowDownload={allowDownload}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

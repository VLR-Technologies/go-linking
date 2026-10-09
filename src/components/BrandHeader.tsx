'use client';
import { useCallback, useState } from 'react';
import type { Brand } from '@/config/brands';
export function BrandHeader({
  brand,
  compact = false,
}: {
  brand: Brand;
  compact?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  // A cached image may finish before hydration attaches its load handler.
  const attachLogo = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    <header className={`brand-header ${compact ? 'compact' : ''}`}>
      <div className="brand-identity">
        {/* A plain image allows a missing, user-supplied asset to fall back without an optimizer error. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={attachLogo}
          className={`brand-logo ${loaded ? 'loaded' : ''}`}
          src={brand.logo}
          alt={brand.name}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          width="3557"
          height="1445"
          fetchPriority="high"
        />
        {!loaded && (
          <div className="brand-wordmark">
            {brand.name}
            <span aria-hidden="true">{brand.copy.brandLine}</span>
          </div>
        )}
      </div>
      <div className="tricolore" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <p className="tagline">{brand.tagline}</p>
    </header>
  );
}

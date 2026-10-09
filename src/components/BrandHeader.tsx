'use client';
import { useCallback, useState } from 'react';
import type { Brand } from '@/config/brands';
export function BrandHeader({ brand }: { brand: Brand }) {
  const [failed, setFailed] = useState(false);
  // A cached failure can finish before hydration attaches the error handler.
  const attachLogo = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, []);
  return (
    <header className="brand-header">
      <div className="brand-identity">
        {/* Visible in server HTML, including when JavaScript is disabled. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={attachLogo}
          className="brand-logo"
          src={brand.logo}
          alt={brand.name}
          hidden={failed}
          onError={() => setFailed(true)}
          width="3557"
          height="1445"
          fetchPriority="high"
        />
        {failed && (
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
    </header>
  );
}

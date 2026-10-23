'use client';
import { useEffect, useState } from 'react';
import { BrandPage } from '../BrandPage';
import { emptyBrand, renderBrand, type BrandRecord } from '@/lib/product/model';
import { normalizeLink } from '@/lib/product/validation';
export function LivePreview() {
  const [brand, setBrand] = useState<BrandRecord>(emptyBrand());
  useEffect(() => {
    function receive(event: MessageEvent) {
      if (
        event.origin !== location.origin ||
        event.source !== window.parent ||
        event.data?.type !== 'go-linking-preview'
      )
        return;
      const b = event.data.brand as BrandRecord;
      if (!b || typeof b.name !== 'string' || !Array.isArray(b.links)) return;
      setBrand({
        ...b,
        links: b.links.flatMap((l) => {
          try {
            return l.enabled
              ? [{ ...l, url: normalizeLink(l.type, l.url) }]
              : [];
          } catch {
            return [];
          }
        }),
      });
    }
    window.addEventListener('message', receive);
    window.parent.postMessage(
      { type: 'go-linking-preview-ready' },
      location.origin,
    );
    return () => window.removeEventListener('message', receive);
  }, []);
  return <BrandPage brand={renderBrand(brand)} />;
}

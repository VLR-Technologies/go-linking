import type { CSSProperties, ReactNode } from 'react';
import type { Brand } from '@/config/brands';
import { Footer } from './Footer';
export function BrandShell({
  brand,
  children,
}: {
  brand: Brand;
  children: ReactNode;
}) {
  return (
    <div
      className="brand-shell"
      style={
        {
          '--brand-red': brand.theme.red,
          '--brand-green': brand.theme.green,
          '--brand-cream': brand.theme.cream,
        } as CSSProperties
      }
    >
      <div className="botanical botanical-one" aria-hidden="true" />
      <div className="botanical botanical-two" aria-hidden="true" />
      <main id="main" className="brand-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}

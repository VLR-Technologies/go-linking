import type { CSSProperties, ReactNode } from 'react';
import type { Brand } from '@/config/brands';
import { Footer } from './Footer';
import { displayFont, uiFont } from '@/app/fonts';
import { FoodDecorations } from './FoodDecorations';
export function BrandShell({
  brand,
  children,
}: {
  brand: Brand;
  children: ReactNode;
}) {
  return (
    <div
      className={`brand-shell ${displayFont.variable} ${uiFont.variable}`}
      data-experience={brand.experience}
      style={
        {
          '--brand-red': brand.theme.red,
          '--brand-dark-red': brand.theme.darkRed,
          '--brand-soft-red': brand.theme.softRed,
          '--brand-green': brand.theme.green,
          '--brand-cream': brand.theme.cream,
          '--ink': brand.theme.ink,
          '--muted': brand.theme.muted,
          '--surface-alt': brand.theme.surfaceAlt,
          '--border': brand.theme.border,
        } as CSSProperties
      }
    >
      {brand.experience === 'food' && <FoodDecorations />}
      <main id="main" className="brand-main">
        {children}
      </main>
      <Footer compact />
      {brand.experience === 'food' && (
        <label className="motion-control">
          <input type="checkbox" aria-label="Pause background animation" />
          <span>Pause the float</span>
        </label>
      )}
    </div>
  );
}

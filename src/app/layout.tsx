import type { Metadata, Viewport } from 'next';
import './globals.css';
import './brand-experience.css';
import { siteSettings } from '@/lib/site';
export const metadata: Metadata = {
  metadataBase: new URL(siteSettings().origin),
  title: { default: 'Go-Linking by VLR Technologies', template: '%s' },
  description: 'Smart links for physical-to-digital experiences.',
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f8f3e9',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

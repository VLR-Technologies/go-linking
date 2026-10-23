import type { Metadata } from 'next';
import { uiFont } from '../fonts';
import './admin.css';
export const metadata: Metadata = {
  title: 'Go-Linking Admin | VLR Technologies',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={uiFont.variable}>{children}</div>;
}

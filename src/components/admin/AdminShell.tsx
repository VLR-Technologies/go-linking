'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { VlrLockup } from '../VlrLockup';
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const pathname = usePathname();
  async function logout() {
    try {
      const r = await fetch('/api/admin/auth', { method: 'DELETE' });
      if (!r.ok) throw new Error();
      router.push('/admin/login');
      router.refresh();
    } catch {
      setError('Unable to sign out. Please retry.');
    }
  }
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <Link className="admin-wordmark" href="/admin">
          GO-LINKING<span>CLIENT WORKSPACE</span>
        </Link>
        <nav aria-label="Admin navigation">
          {[
            ['/admin', '◈', 'Overview'],
            ['/admin/brands', '▤', 'Brands'],
            ['/admin/brands/new', '＋', 'Create Brand'],
            ['/admin/qr', '▦', 'QR Assets'],
            ['/admin/settings', '⚙', 'Settings'],
          ].map(([href, icon, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <VlrLockup />
          <p>Built for the brands we build.</p>
          <button onClick={logout}>Sign Out ↗</button>
          {error && <p role="alert">{error}</p>}
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            className="admin-menu"
            aria-label="Toggle admin navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
          <span>
            Go-Linking Admin <small> / VLR Technologies</small>
          </span>
          <span className="admin-environment">Local development storage</span>
        </header>
        <main id="main" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

import { requireAdminPage } from '@/lib/product/http';
import Link from 'next/link';
import { brandService } from '@/lib/product/providers';
export default async function Dashboard() {
  await requireAdminPage();
  const brands = await brandService.list();
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">YOUR WORKSPACE, CONNECTED</p>
          <h1>A home for every brand.</h1>
          <p>
            Create a destination. Give your clients a connection that lasts.
          </p>
        </div>
        <Link className="admin-primary" href="/admin/brands/new">
          ＋ Create New Brand
        </Link>
      </div>
      <div className="admin-stats">
        {[
          ['Total Brands', brands.length],
          ['Published', brands.filter((b) => b.status === 'published').length],
          ['Drafts', brands.filter((b) => b.status === 'draft').length],
          ['Archived', brands.filter((b) => b.status === 'archived').length],
        ].map(([label, value]) => (
          <section key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>In your workspace</small>
          </section>
        ))}
      </div>
      <section className="admin-panel">
        <div className="admin-section-heading">
          <h2>Recently updated</h2>
          <Link href="/admin/brands">View all brands ↗</Link>
        </div>
        {[...brands]
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .slice(0, 5)
          .map((b) => (
            <Link
              key={b.id}
              className="recent-brand"
              href={`/admin/brands/${b.id}`}
            >
              <span className="brand-initial">{b.name[0]}</span>
              <span>
                <strong>{b.name}</strong>
                <small>/{b.slug}</small>
              </span>
              <span className={`status-badge ${b.status}`}>{b.status}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        {!brands.length && (
          <p>
            No brands yet. Create your first brand to generate its smart-link
            page and QR code.
          </p>
        )}
      </section>
      <section className="admin-callout">
        <span>01 / CREATE · 02 / SHAPE · 03 / CONNECT</span>
        <h2>Your next client starts here.</h2>
        <p>
          Build a brand page, preview it on any screen, and publish locally. No
          source-code edits needed.
        </p>
        <Link href="/admin/brands/new">Create a brand →</Link>
      </section>
    </>
  );
}

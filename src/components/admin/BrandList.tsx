/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { BrandRecord } from '@/lib/product/model';
import { LinkActions } from '../LinkActions';
import { getPublicBrandUrl } from '@/lib/site';
export function BrandList({ initial }: { initial: BrandRecord[] }) {
  const [brands, setBrands] = useState(initial),
    [search, setSearch] = useState(''),
    [filter, setFilter] = useState('all'),
    [busy, setBusy] = useState(''),
    [error, setError] = useState('');
  async function change(brand: BrandRecord, status: BrandRecord['status']) {
    if (
      status !== 'published' &&
      !confirm(
        `${status === 'archived' ? 'Archive' : 'Unpublish'} ${brand.name}? Its public page and printed QR destination will become unavailable.`,
      )
    )
      return;
    setBusy(brand.id);
    setError('');
    try {
      const r = await fetch(`/api/admin/brands/${brand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setBrands(brands.map((b) => (b.id === data.id ? data : b)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update brand.');
    } finally {
      setBusy('');
    }
  }
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">CLIENT DIRECTORY</p>
          <h1>Your brands.</h1>
          <p>One workspace. Every client connection.</p>
        </div>
        <Link className="admin-primary" href="/admin/brands/new">
          ＋ Create Brand
        </Link>
      </div>
      <div className="admin-filters">
        <label>
          Search brands
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or slug"
          />
        </label>
        <label>
          Status
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {['all', 'published', 'draft', 'archived'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      <div className="admin-brand-grid">
        {brands
          .filter(
            (b) =>
              (filter === 'all' || b.status === filter) &&
              `${b.name} ${b.slug}`
                .toLowerCase()
                .includes(search.toLowerCase()),
          )
          .map((b) => (
            <article className="admin-brand-card" key={b.id}>
              <div className="admin-brand-top">
                <img src={b.logo || '/brands/fallback.svg'} alt="" />
                <span className={`status-badge ${b.status}`}>{b.status}</span>
              </div>
              <h2>{b.name}</h2>
              <p>{b.industry}</p>
              <code>/{b.slug}</code>
              <small>
                Updated {new Date(b.updatedAt).toLocaleDateString('en-IN')}
              </small>
              <div className="admin-row-actions">
                <Link href={`/admin/brands/${b.id}`}>Edit</Link>
                <Link href={`/admin/preview/${b.id}`} target="_blank">
                  Preview ↗
                </Link>
                <Link href={`/admin/qr?brand=${b.id}`}>QR assets</Link>
                <LinkActions
                  url={getPublicBrandUrl(b.slug)}
                  title={b.name}
                  filename={`${b.slug}-development-qr.png`}
                  notice="Development QR — not for printing"
                />
              </div>
              <div className="admin-row-actions">
                <button
                  disabled={!!busy}
                  onClick={() =>
                    change(b, b.status === 'published' ? 'draft' : 'published')
                  }
                >
                  {busy === b.id
                    ? 'Updating…'
                    : b.status === 'published'
                      ? 'Unpublish'
                      : 'Publish'}
                </button>
                {b.status !== 'archived' && (
                  <button
                    disabled={!!busy}
                    onClick={() => change(b, 'archived')}
                  >
                    Archive
                  </button>
                )}
              </div>
              {b.status !== 'published' && (
                <small>Draft/archive URLs are unavailable publicly.</small>
              )}
            </article>
          ))}
      </div>
      {!brands.some(
        (b) =>
          (filter === 'all' || b.status === filter) &&
          `${b.name} ${b.slug}`.toLowerCase().includes(search.toLowerCase()),
      ) && (
        <section className="admin-panel">
          <h2>No brands here yet.</h2>
          <p>Create your first brand or change your search.</p>
        </section>
      )}
    </>
  );
}

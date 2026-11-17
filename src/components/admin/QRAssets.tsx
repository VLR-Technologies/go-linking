/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';
import type { BrandRecord } from '@/lib/product/model';
import { getDestinationUrl } from '@/config/brands';
import { renderBrand } from '@/lib/product/model';
import { getPublicBrandUrl } from '@/lib/site';
import { qrDataUrl } from '@/lib/qr';
import QRCode from 'qrcode';
import { LinkActions } from '../LinkActions';
function Asset({
  url,
  title,
  filename,
}: {
  url: string;
  title: string;
  filename: string;
}) {
  const [png, setPng] = useState(''),
    [svg, setSvg] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([
      qrDataUrl(url),
      QRCode.toString(url, {
        type: 'svg',
        margin: 4,
        errorCorrectionLevel: 'M',
      }),
    ])
      .then(([png, svg]) => {
        if (active) {
          setPng(png);
          setSvg(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
        }
      })
      .catch(() => {
        if (active) setError('Unable to generate QR. Copy the URL and retry.');
      });
    return () => {
      active = false;
    };
  }, [url]);
  return (
    <section className="admin-qr-asset">
      <h3>{title}</h3>
      {png ? (
        <img src={png} alt={`QR code for ${title}`} width="220" height="220" />
      ) : (
        <p role="status">{error || 'Generating QR…'}</p>
      )}
      <code>{url}</code>
      <div className="admin-row-actions">
        <LinkActions
          url={url}
          title={title}
          filename={`${filename}.png`}
          notice="Development QR — not for printing"
        />
        {png && (
          <a href={png} download={`${filename}.png`}>
            Download PNG
          </a>
        )}
        {svg && (
          <a href={svg} download={`${filename}.svg`}>
            Download SVG
          </a>
        )}
      </div>
    </section>
  );
}
export function QRAssets({
  brands,
  selected,
}: {
  brands: BrandRecord[];
  selected?: string;
}) {
  const [id, setId] = useState(selected || brands[0]?.id || '');
  const brand = brands.find((b) => b.id === id);
  const renderedBrand = brand && renderBrand(brand);
  const master = brand && getPublicBrandUrl(brand.slug);
  return (
    <>
      <div className="admin-notice">
        <strong>Development QR — not for printing.</strong> Local storage and
        publishing are development-only. Configure and verify the final
        deployment before using QR/NFC with clients.
      </div>
      {brands.length > 1 && (
        <label>
          Select brand
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {brands.map((b) => (
              <option value={b.id} key={b.id}>
                {b.name} · {b.status}
              </option>
            ))}
          </select>
        </label>
      )}
      {brand && renderedBrand && master ? (
        <>
          <p>
            QR and NFC use the same public URL: <code>{master}</code>
          </p>
          {brand.status !== 'published' && (
            <p className="admin-notice">
              This brand is {brand.status}. Its public URL will not open until
              published.
            </p>
          )}
          <div className="admin-qr-grid">
            <Asset
              url={master}
              title={`${brand.name} master`}
              filename={`${brand.slug}-master-development`}
            />
            {brand.links.flatMap((link) => {
              const url = getDestinationUrl(renderedBrand, link.id);
              return url
                ? [
                    <Asset
                      key={link.id}
                      url={url}
                      title={link.label}
                      filename={`${brand.slug}-${link.id}`}
                    />,
                  ]
                : [];
            })}
          </div>
        </>
      ) : (
        <p>No brands yet. Save a draft to prepare its QR assets.</p>
      )}
    </>
  );
}

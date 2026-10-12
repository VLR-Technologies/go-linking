/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CopyIcon } from './CopyIcon';

export function LinkActions({
  url,
  title,
  logo,
  filename,
  allowDownload = true,
}: {
  url: string;
  title: string;
  logo?: string;
  filename: string;
  allowDownload?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [manual, setManual] = useState(false);
  const id = useId();
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setManual(false);
      setToast(`${title} link copied`);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(''), 1800);
    } catch {
      setManual(true);
      if (!dialog.current?.open) dialog.current?.showModal();
    }
  }
  async function openQr() {
    setManual(false);
    setError('');
    dialog.current?.showModal();
    try {
      const { qrDataUrl } = await import('@/lib/qr');
      setQr(await qrDataUrl(url));
    } catch {
      setError('QR could not be generated. Please copy the link instead.');
    }
  }
  return (
    <>
      <button
        ref={trigger}
        className="card-action"
        type="button"
        aria-label={`QR for ${title}`}
        onClick={openQr}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h3v3h-6zM12 3v9H3M12 15v6M15 12h6" />
        </svg>
      </button>
      <button
        className="card-action"
        type="button"
        aria-label={`Copy ${title} link`}
        onClick={copy}
      >
        <CopyIcon />
      </button>
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toast}
      </span>
      {toast &&
        createPortal(
          <span className="link-toast is-visible" aria-hidden="true">
            {toast}
          </span>,
          document.body,
        )}
      <dialog
        ref={dialog}
        className="brand-qr-modal"
        aria-labelledby={`${id}-title`}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled), a[href], input:not(:disabled)',
            ),
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="qr-modal-content">
          <button
            className="modal-close"
            type="button"
            aria-label="Close QR dialog"
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            ×
          </button>
          {logo && <img className="modal-logo" src={logo} alt="" />}
          <p className="eyebrow">SCAN · CONNECT</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>Scan to open {title}</p>
          {/* The generated image includes an untouched four-module white quiet zone. */}
          {qr ? (
            <img
              className="modal-qr"
              src={qr}
              alt={`QR code for ${title}`}
              width="280"
              height="280"
            />
          ) : (
            <p role="status">
              {error ||
                (manual ? 'Copy the exact link below.' : 'Preparing QR…')}
            </p>
          )}
          {!allowDownload && (
            <p className="qr-preview-note">
              Preview only — not for printing. Configure the live deployment
              domain first.
            </p>
          )}
          <div className="modal-actions">
            <button type="button" onClick={copy}>
              Copy Link
            </button>
            {qr && allowDownload && (
              <a href={qr} download={filename}>
                Download QR
              </a>
            )}
          </div>
          {manual && (
            <label className="manual-copy">
              Clipboard unavailable. Select and copy this link:
              <input
                aria-label={`${title} link to copy manually`}
                value={url}
                readOnly
                onFocus={(event) => event.target.select()}
              />
            </label>
          )}
          <span className="modal-copy-status" role="status" aria-live="polite">
            {toast}
          </span>
        </div>
      </dialog>
    </>
  );
}

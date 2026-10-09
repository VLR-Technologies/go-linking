'use client';

import { useEffect, useState } from 'react';
import { CopyIcon } from './CopyIcon';

export function CopyLinkButton({ url, label }: { url: string; label: string }) {
  const [status, setStatus] = useState<
    'idle' | 'copying' | 'copied' | 'failed'
  >('idle');

  useEffect(() => {
    if (status !== 'copied') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2200);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function copy() {
    setStatus('copying');
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }

  return (
    <div className="copy-control">
      <button
        type="button"
        className="copy-button"
        aria-label={`Copy ${label} link`}
        disabled={status === 'copying'}
        onClick={copy}
      >
        <span>{label}</span>
        <span className={`copy-action ${status === 'copied' ? 'copied' : ''}`}>
          <span aria-hidden="true">
            {status === 'copied'
              ? 'Copied!'
              : status === 'copying'
                ? 'Copying…'
                : ''}
          </span>
          <CopyIcon copied={status === 'copied'} />
        </span>
      </button>
      <span className="sr-only" role="status" aria-atomic="true">
        {status === 'copied'
          ? `${label} link copied.`
          : status === 'failed'
            ? `Unable to copy ${label} link. Select and copy the URL below.`
            : ''}
      </span>
      {status === 'failed' && (
        <label className="manual-copy">
          Select the URL to copy manually
          <input
            aria-label={`${label} link to copy manually`}
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
          />
        </label>
      )}
    </div>
  );
}

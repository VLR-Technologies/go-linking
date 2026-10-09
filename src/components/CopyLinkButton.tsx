'use client';
import { useState } from 'react';
export function CopyLinkButton({ url }: { url: string }) {
  const [status, setStatus] = useState('');
  return (
    <div className="copy-control">
      <button
        className="text-button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setStatus('Link copied');
          } catch {
            setStatus('Copy unavailable. Select and copy the link below.');
          }
        }}
      >
        Copy link <span aria-hidden="true">⧉</span>
      </button>
      <span className="copy-status" role="status">
        {status}
      </span>
      {status.startsWith('Copy unavailable') && (
        <input
          aria-label="Destination link to copy"
          readOnly
          value={url}
          onFocus={(event) => event.target.select()}
        />
      )}
    </div>
  );
}

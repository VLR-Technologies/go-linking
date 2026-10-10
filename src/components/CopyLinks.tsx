import type { Destination } from '@/config/brands';
import { CopyLinkButton } from './CopyLinkButton';
import { CopyIcon } from './CopyIcon';

export function CopyLinks({ links }: { links: Destination[] }) {
  return (
    <details className="copy-links">
      <summary>
        <CopyIcon />
        <span>Need the link? Copy it here</span>
        <svg
          className="copy-chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m7 10 5 5 5-5" />
        </svg>
      </summary>
      <div className="copy-links-content">
        {links.map((link) => (
          <CopyLinkButton key={link.id} url={link.url} label={link.title} />
        ))}
        <noscript>
          <style>{`.copy-links .copy-control { display: none; }`}</style>
          <p className="copy-hint">Select a link below to copy it.</p>
          {links.map((link) => (
            <label className="manual-copy" key={link.id}>
              {link.title}
              <input
                readOnly
                value={link.url}
                aria-label={`${link.title} link to copy manually`}
              />
            </label>
          ))}
        </noscript>
      </div>
    </details>
  );
}

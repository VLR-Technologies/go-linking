import { VlrLockup, vlrTagline } from './VlrLockup';

export function Footer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="hub-footer">
        <a href="https://vlrtechnologies.net/">
          <span>Powered by</span>
          <VlrLockup />
          <span aria-hidden="true">↗</span>
        </a>
        <p className="vlr-tagline">{vlrTagline}</p>
      </footer>
    );
  }
  return (
    <footer className="footer">
      <a className="footer-identity" href="https://vlrtechnologies.net/">
        <VlrLockup />
      </a>
      <p className="vlr-tagline">{vlrTagline}</p>
      <a className="footer-website" href="https://vlrtechnologies.net/">
        vlrtechnologies.net <span aria-hidden="true">↗</span>
      </a>
      <small>© 2026 VLR Technologies. All rights reserved.</small>
    </footer>
  );
}

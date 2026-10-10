import Image from 'next/image';

export function Footer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="hub-footer">
        <a href="https://vlrtechnologies.net/">
          <span>Powered by</span>
          <Image
            src="/brands/vlr/logo.png"
            alt=""
            width={880}
            height={305}
            unoptimized
            style={{ width: 32, height: 'auto', flexShrink: 0 }}
          />
          <strong>VLR Technologies</strong>
          <span aria-hidden="true">↗</span>
        </a>
      </footer>
    );
  }
  return (
    <footer className="footer">
      <p>
        Powered by <strong>VLR Technologies</strong>
      </p>
      <a
        href="https://vlrtechnologies.net/"
        target="_blank"
        rel="noopener noreferrer"
      >
        vlrtechnologies.net <span aria-hidden="true">↗</span>
      </a>
      <small>© 2026 VLR Technologies. All rights reserved.</small>
    </footer>
  );
}

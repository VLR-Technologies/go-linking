import Link from 'next/link';
import { Footer } from '@/components/Footer';
export default function NotFound() {
  return (
    <div className="entry-shell">
      <main id="main" className="entry">
        <span className="eyebrow">404 · A LITTLE DETOUR</span>
        <h1 className="not-found-title">This link isn&apos;t available.</h1>
        <p className="entry-small">Let’s get you back to a good connection.</p>
        <Link className="primary-button" href="/">
          Back to Go-Linking <span aria-hidden="true">↗</span>
        </Link>
      </main>
      <Footer />
    </div>
  );
}

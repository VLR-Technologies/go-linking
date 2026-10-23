'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VlrLockup } from '../VlrLockup';
export function LoginForm({ available }: { available: boolean }) {
  const router = useRouter();
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <main id="main" className="admin-root admin-login">
      <section className="login-story">
        <Link href="/" className="admin-wordmark">
          GO-LINKING
        </Link>
        <div>
          <p className="admin-kicker">THE VLR CLIENT WORKSPACE</p>
          <h1>
            Every brand.
            <br />A new connection.
          </h1>
          <p>
            Create, shape and publish your clients’ digital destinations from
            one considered workspace.
          </p>
          <div className="login-orbit" aria-hidden="true">
            <span>↗</span>
            <i />
            <i />
            <i />
          </div>
        </div>
        <VlrLockup />
      </section>
      <section className="login-form-panel">
        <div>
          <p className="admin-kicker">WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <p>Manage your brands. Make every connection count.</p>
          {!available && (
            <div className="admin-notice">
              Local admin is unavailable. In development, set the three admin
              environment variables from .env.example and restart. Production
              admin remains disabled.
            </div>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError('');
              const data = new FormData(e.currentTarget);
              try {
                const response = await fetch('/api/admin/auth', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    username: data.get('username'),
                    password: data.get('password'),
                  }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                router.push('/admin');
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Unable to sign in.');
                setBusy(false);
              }
            }}
          >
            <label>
              Username
              <input
                name="username"
                autoComplete="username"
                required
                disabled={busy || !available}
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  name="password"
                  aria-label="Password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={busy || !available}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}
            <button className="admin-primary" disabled={busy || !available}>
              {busy ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
          <p className="login-footnote">
            Authorized VLR administrators only.
            <br />
            Local development workspace · no production publishing.
          </p>
        </div>
      </section>
    </main>
  );
}

import { requireAdminPage } from '@/lib/product/http';
export default async function Settings() {
  await requireAdminPage();
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">WORKSPACE SETTINGS</p>
          <h1>Built locally. Ready to grow.</h1>
        </div>
      </div>
      <section className="admin-panel">
        <h2>Local development storage</h2>
        <p>
          Brands and logos persist on this computer across refreshes and server
          restarts. This is not the production database.
        </p>
        <h2>Development authentication</h2>
        <p>
          Credentials are configured through server environment variables.
          Passwords and session secrets are never sent to the browser. Admin
          access is disabled in production.
        </p>
        <h2>Production integration</h2>
        <p>
          Supabase integration is deferred. Repository, authentication and asset
          adapters can be replaced without rebuilding this workspace.
        </p>
        <h2>Website discovery</h2>
        <p>
          Planned. Add verified business details manually. No external website
          is fetched and no business information is guessed.
        </p>
      </section>
    </>
  );
}

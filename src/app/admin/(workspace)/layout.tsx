import { redirect } from 'next/navigation';
import { authorized } from '@/lib/product/http';
import { AdminShell } from '@/components/admin/AdminShell';
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await authorized())) redirect('/admin/login');
  return (
    <div className="admin-root">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}

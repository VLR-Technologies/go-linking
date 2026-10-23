import { redirect } from 'next/navigation';
import { authorized } from '@/lib/product/http';
import { LivePreview } from '@/components/admin/LivePreview';
export default async function Preview() {
  if (!(await authorized())) redirect('/admin/login');
  return <LivePreview />;
}

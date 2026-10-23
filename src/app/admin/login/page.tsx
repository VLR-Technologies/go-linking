import { redirect } from 'next/navigation';
import { authorized } from '@/lib/product/http';
import { adminAuth } from '@/lib/product/providers';
import { LoginForm } from '@/components/admin/LoginForm';
export default async function Login() {
  if (await authorized()) redirect('/admin');
  return <LoginForm available={adminAuth.available()} />;
}

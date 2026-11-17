import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from './providers';
import { ProductError } from './validation';
export const sessionCookie = 'go-linking-admin';
export async function authorized() {
  return adminAuth.verify((await cookies()).get(sessionCookie)?.value);
}
export async function requireAdminPage() {
  if (!(await authorized())) redirect('/admin/login');
}
export async function requireAdmin() {
  if (!(await authorized()))
    throw new ProductError('Sign in to continue.', 401);
}
export function sameOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    throw new ProductError('Request origin was not accepted.', 403);
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    throw new ProductError('Request origin was not accepted.', 403);
}
export async function jsonInput(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new ProductError('JSON is required.');
  const reader = request.body?.getReader();
  if (!reader) throw new ProductError('Request body is required.');
  let size = 0;
  const chunks = [];
  for (;;) {
    const result = await reader.read();
    if (result.done) break;
    size += result.value.length;
    if (size > 100000) {
      await reader.cancel();
      throw new ProductError('Request is too large.', 413);
    }
    chunks.push(result.value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    throw new ProductError('Invalid JSON.');
  }
}
export function failure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof ProductError
          ? error.message
          : 'Unable to complete this request. Please retry.',
    },
    {
      status: error instanceof ProductError ? error.status : 500,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

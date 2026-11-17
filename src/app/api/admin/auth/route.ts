import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/product/providers';
import {
  failure,
  jsonInput,
  sameOrigin,
  sessionCookie,
} from '@/lib/product/http';
import { sessionLifetime } from '@/lib/product/local-auth';
import { ProductError } from '@/lib/product/validation';
// Single local admin: bounded process-wide throttle without trusting forwarded IPs.
const attempts: number[] = [];
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!adminAuth.available())
      throw new ProductError(
        'Local admin is unavailable. Configure development credentials and restart.',
        503,
      );
    const now = Date.now();
    while (attempts.length && attempts[0] < now - 60000) attempts.shift();
    if (attempts.length >= 10)
      throw new ProductError(
        'Too many sign-in attempts. Try again in a minute.',
        429,
      );
    attempts.push(now);
    const data = await jsonInput(request);
    if (
      typeof data.username !== 'string' ||
      typeof data.password !== 'string' ||
      data.username.length > 200 ||
      data.password.length > 500
    )
      throw new ProductError('Invalid credentials.', 401);
    const token = await adminAuth.login(data.username, data.password);
    if (!token) throw new ProductError('Invalid credentials.', 401);
    (await cookies()).set(sessionCookie, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: new URL(request.url).protocol === 'https:',
      path: '/',
      maxAge: sessionLifetime,
    });
    return Response.json(
      { ok: true },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const jar = await cookies();
    await adminAuth.logout(jar.get(sessionCookie)?.value);
    jar.delete(sessionCookie);
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}

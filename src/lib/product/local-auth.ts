import {
  createHmac,
  randomBytes,
  timingSafeEqual,
  scryptSync,
} from 'node:crypto';
import type { AdminAuthProvider } from './contracts';
import { mkdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
type Settings = {
  mode?: string;
  username?: string;
  password?: string;
  secret?: string;
};
const revoked = new Map<string, number>();
export const sessionLifetime = 8 * 60 * 60;
export class LocalAdminAuthProvider implements AdminAuthProvider {
  constructor(
    private settings: Settings = {
      mode: process.env.NODE_ENV,
      username: process.env.GO_LINKING_ADMIN_USERNAME,
      password: process.env.GO_LINKING_ADMIN_PASSWORD,
      secret: process.env.GO_LINKING_SESSION_SECRET,
    },
    private revocationsDirectory?: string,
  ) {}
  available() {
    return (
      this.settings.mode === 'development' &&
      Boolean(
        this.settings.username &&
        this.settings.password &&
        this.settings.password.length >= 12 &&
        this.settings.secret &&
        this.settings.secret.length >= 32,
      )
    );
  }
  private sign(value: string) {
    return createHmac('sha256', this.settings.secret!)
      .update(value)
      .digest('base64url');
  }
  async login(username: string, password: string) {
    if (!this.available()) return null;
    const hash = (v: string) => scryptSync(v, this.settings.secret!, 32);
    const validUser = timingSafeEqual(
      hash(username),
      hash(this.settings.username!),
    );
    const validPassword = timingSafeEqual(
      hash(password),
      hash(this.settings.password!),
    );
    if (!validUser || !validPassword) return null;
    const payload = Buffer.from(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + sessionLifetime,
        nonce: randomBytes(24).toString('hex'),
      }),
    ).toString('base64url');
    return `${payload}.${this.sign(payload)}`;
  }
  async verify(session: string | undefined) {
    if (!this.available() || !session || session.length > 600) return false;
    try {
      const [payload, signature, ...rest] = session.split('.');
      const expected = this.sign(payload);
      if (
        rest.length ||
        !signature ||
        signature.length !== expected.length ||
        !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      )
        return false;
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
      if (this.revocationsDirectory) {
        try {
          await access(
            path.join(
              this.revocationsDirectory,
              createHash('sha256').update(session).digest('hex'),
            ),
          );
          return false;
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== 'ENOENT') return false;
        }
      }
      for (const [key, expiry] of revoked)
        if (expiry < Date.now()) revoked.delete(key);
      return (
        typeof data.exp === 'number' &&
        data.exp > Date.now() / 1000 &&
        data.exp <= Date.now() / 1000 + sessionLifetime + 5 &&
        !revoked.has(session)
      );
    } catch {
      return false;
    }
  }
  async logout(session: string | undefined) {
    if (session && this.revocationsDirectory) {
      await mkdir(this.revocationsDirectory, { recursive: true });
      await writeFile(
        path.join(
          this.revocationsDirectory,
          createHash('sha256').update(session).digest('hex'),
        ),
        'revoked',
        { mode: 0o600 },
      );
    }
    if (session) revoked.set(session, Date.now() + sessionLifetime * 1000);
  }
}

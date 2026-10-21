import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'mbs_admin';
export const ADMIN_SESSION_TTL = 60 * 60 * 8; // 8 hours

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Constant-time comparison of the typed password with ADMIN_PASSWORD.
export function passwordMatches(input: string): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}

// Cookie value = "<expiry>.<hmac(expiry, ADMIN_PASSWORD)>". Changing the
// password instantly invalidates every existing admin session.
export function createAdminSession(): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL;
  return `${exp}.${sign(String(exp), secret)}`;
}

export function isAdminAuthenticated(): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const value = cookies().get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const [expStr, sig] = value.split('.');
  const exp = Number(expStr);
  if (!sig || !Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  const expected = Buffer.from(sign(expStr, secret));
  const given = Buffer.from(sig);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

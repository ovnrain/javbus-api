import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload } from './definitions';
import { DEFAULT_SESSION_SECRET } from './constants';

const { NODE_ENV, JAVBUS_SESSION_SECRET = DEFAULT_SESSION_SECRET } = process.env;
const COOKIE_NAME = 'javbus.api.sid';
const encodedKey = new TextEncoder().encode(JAVBUS_SESSION_SECRET);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (e) {
    //
  }
}

export async function getSession() {
  const session = cookies().get(COOKIE_NAME)?.value;
  return await decrypt(session);
}

export async function createSession(username: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ username, expiresAt });

  cookies().set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  cookies().delete(COOKIE_NAME);
}

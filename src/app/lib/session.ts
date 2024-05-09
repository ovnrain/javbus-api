import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import ENV from '../env';

const { NODE_ENV, JAVBUS_SESSION_SECRET } = ENV;

export async function getIronSessionData() {
  return await getIronSession<{ username: string }>(cookies(), {
    password: JAVBUS_SESSION_SECRET,
    cookieName: 'javbus.api.sid',
    cookieOptions: {
      httpOnly: true,
      secure: NODE_ENV === 'production',
    },
  });
}

export async function createSession(username: string) {
  const session = await getIronSessionData();

  session.username = username;

  await session.save();
}

export async function deleteSession() {
  const session = await getIronSessionData();

  session.destroy();
}

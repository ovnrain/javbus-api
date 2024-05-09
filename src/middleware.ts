import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './app/lib/session';

export async function middleware(req: NextRequest) {
  const { JAVBUS_AUTH_TOKEN, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  const useCredentials = Boolean(ADMIN_USERNAME && ADMIN_PASSWORD);
  const token = req.headers.get('j-auth-token');
  const session = await getSession();

  if (token) {
    if (token === JAVBUS_AUTH_TOKEN) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } else if (useCredentials) {
    if (session?.username) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/(.*)',
};

'use server';

import { redirect } from 'next/navigation';
import { createSession } from '../lib/session';

export interface FormState {
  message: string | null;
  username: string;
  password: string;
}

export async function login(_: FormState, data: FormData) {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  const username = (data.get('username') || '') as string;
  const password = (data.get('password') || '') as string;

  if (!username || !password) {
    return { username, password, message: '请输入用户名密码' };
  }

  if (
    !ADMIN_USERNAME ||
    !ADMIN_PASSWORD ||
    username !== ADMIN_USERNAME ||
    password !== ADMIN_PASSWORD
  ) {
    return { username, password, message: '用户名或密码错误' };
  }

  await createSession(username);

  redirect('/');
}

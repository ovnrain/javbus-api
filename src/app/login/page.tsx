'use client';

import styles from './page.module.scss';
import { Fragment, useActionState } from 'react';
import Link from 'next/link';
import Title from '../components/title';
import { login, type FormState } from '../actions/auth';

export default function Login() {
  const [{ message, username: prevUsername, password: prevPassword }, loginAction] = useActionState<
    FormState,
    FormData
  >(login, {
    message: null,
    username: '',
    password: '',
  });

  return (
    <Fragment>
      <Title>登录</Title>
      <form className={styles.form} action={loginAction}>
        <div className={styles.item}>
          <label className={styles.label} htmlFor="username">
            用户名:
          </label>
          <input
            className={styles.input}
            id="username"
            type="text"
            name="username"
            defaultValue={prevUsername}
            autoFocus
          />
        </div>
        <div className={styles.item}>
          <label className={styles.label} htmlFor="password">
            密码:
          </label>
          <input
            className={styles.input}
            id="password"
            type="password"
            name="password"
            defaultValue={prevPassword}
          />
        </div>
        {message && <div className={styles.message}>{message}</div>}
        <div>
          <button className={styles['login-button']} type="submit">
            登录
          </button>
        </div>
      </form>
      <div className={styles['return-index']}>
        <Link href="/">回到首页</Link>
      </div>
    </Fragment>
  );
}

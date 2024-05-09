import styles from './page.module.scss';
import { Fragment } from 'react';
import Link from 'next/link';
import Title from '../components/title';

export default function Login() {
  return (
    <Fragment>
      <Title>登录</Title>
      <form className={styles.form} action="">
        <div className={styles.item}>
          <label className={styles.label} htmlFor="username">
            用户名:
          </label>
          <input className={styles.input} id="username" type="text" name="username" autoFocus />
        </div>
        <div className={styles.item}>
          <label className={styles.label} htmlFor="password">
            密码:
          </label>
          <input className={styles.input} id="password" type="password" name="password" />
        </div>
        <div className={styles.message}></div>
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

import styles from './page.module.scss';
import { Fragment } from 'react';
import Link from 'next/link';
import ENV from './env';
import Title from './components/title';
import { getIronSessionData } from './lib/session';

export default async function Home() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = ENV;

  const useCredentials = Boolean(ADMIN_USERNAME && ADMIN_PASSWORD);
  const session = await getIronSessionData();

  return (
    <Fragment>
      <Title>JavBus API</Title>
      <p className={styles.tip}>如果你看到这个页面，说明服务已经成功运行起来！</p>
      <p>
        <Link href="https://github.com/ovnrain/javbus-api#readme" target="_blank">
          查看文档
        </Link>
      </p>
      <p className={styles.try}>你可以尝试访问以下 API：</p>
      <ol className={styles.list}>
        <li>
          <Link href="/api/movies">返回有磁力链接的第一页影片</Link>
        </li>
        <li>
          <Link href="/api/movies?filterType=star&filterValue=qs6&magnet=all">
            返回演员 ID 为<span className={styles.tag}>qs6</span>
            的影片的第一页，包含有磁力链接和无磁力链接的影片
          </Link>
        </li>
        <li>
          <Link href="/api/movies/search?keyword=三上">
            搜索关键词为
            <span className={styles.tag}>三上</span>
            的影片的第一页，只返回有磁力链接的影片
          </Link>
        </li>
        <li>
          <p>影片详情</p>
          <ul className={styles.list}>
            <li>
              <Link href="/api/movies/IPX-585">IPX-585</Link>
            </li>
            <li>
              <Link href="/api/movies/IPZZ-023">IPZZ-023</Link>
            </li>
            <li>
              <Link href="/api/movies/IPX-451">IPX-451</Link>
            </li>
          </ul>
        </li>
        <li>
          <p>磁力链接</p>
          <ul className={styles.list}>
            <li>
              <Link href="/api/magnets/JUQ-434?gid=56326057355&uc=0">JUQ-434</Link>
            </li>
            <li>
              <Link href="/api/magnets/IPZZ-135?gid=56327757424&uc=0">IPZZ-135</Link>
            </li>
            <li>
              <Link href="/api/magnets/SSNI-730?gid=42785257471&uc=0">SSNI-730</Link>
              <ul>
                <li>
                  <Link href="/api/magnets/SSNI-730?gid=42785257471&uc=0&sortBy=date&sortOrder=desc">
                    按照日期降序排序
                  </Link>
                </li>
                <li>
                  <Link href="/api/magnets/SSNI-730?gid=42785257471&uc=0&sortBy=size&sortOrder=asc">
                    按照大小升序排序
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ol>
      <div className={styles['user-wrapper']}>
        {useCredentials && !session.username && (
          <div className={styles.login}>
            <Link className={styles['login-link']} href="/login">
              登录
            </Link>
          </div>
        )}
        {useCredentials && session.username && (
          <div className={styles.user}>
            <span className={styles.username}>{session.username}</span>
            <Link className={styles.logout} href="/logout">
              退出
            </Link>
          </div>
        )}
      </div>
    </Fragment>
  );
}

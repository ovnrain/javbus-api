import styles from './page.module.scss';
import { Fragment } from 'react';
import Title from './components/title';

export default function Home() {
  return (
    <Fragment>
      <Title>JavBus API</Title>
      <p className={styles.tip}>如果你看到这个页面，说明服务已经成功运行起来！</p>
      <p>
        <a href="https://github.com/ovnrain/javbus-api#readme" target="_blank">
          查看文档
        </a>
      </p>
      <p className={styles.try}>你可以尝试访问以下 API：</p>
      <ol className={styles.list}>
        <li>
          <a href="/api/movies">返回有磁力链接的第一页影片</a>
        </li>
        <li>
          <a href="/api/movies?filterType=star&filterValue=qs6&magnet=all">
            返回演员 ID 为<span className={styles.tag}>qs6</span>
            的影片的第一页，包含有磁力链接和无磁力链接的影片
          </a>
        </li>
        <li>
          <a href="/api/movies/search?keyword=三上">
            搜索关键词为
            <span className={styles.tag}>三上</span>
            的影片的第一页，只返回有磁力链接的影片
          </a>
        </li>
        <li>
          <p>影片详情</p>
          <ul className={styles.list}>
            <li>
              <a href="/api/movies/IPX-585">IPX-585</a>
            </li>
            <li>
              <a href="/api/movies/IPZZ-023">IPZZ-023</a>
            </li>
            <li>
              <a href="/api/movies/IPX-451">IPX-451</a>
            </li>
          </ul>
        </li>
        <li>
          <p>磁力链接</p>
          <ul className={styles.list}>
            <li>
              <a href="/api/magnets/JUQ-434?gid=56326057355&uc=0">JUQ-434</a>
            </li>
            <li>
              <a href="/api/magnets/IPZZ-135?gid=56327757424&uc=0">IPZZ-135</a>
            </li>
            <li>
              <a href="/api/magnets/SSNI-730?gid=42785257471&uc=0">SSNI-730</a>
              <ul>
                <li>
                  <a href="/api/magnets/SSNI-730?gid=42785257471&uc=0&sortBy=date&sortOrder=desc">
                    按照日期降序排序
                  </a>
                </li>
                <li>
                  <a href="/api/magnets/SSNI-730?gid=42785257471&uc=0&sortBy=size&sortOrder=asc">
                    按照大小升序排序
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ol>
      <div className={styles['user-wrapper']}>
        <div className={styles.login}>
          <a className={styles['login-link']} href="/login.html">
            登录
          </a>
        </div>
        <div className={styles.user}>
          <span className={styles.username}></span>
          <button className={styles.logout}>退出</button>
        </div>
      </div>
    </Fragment>
  );
}

import './normalize.css';
import './base.css';
import styles from './layout.module.scss';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JavBus API',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans">
      <body>
        <div className={styles.container}>{children}</div>
      </body>
    </html>
  );
}

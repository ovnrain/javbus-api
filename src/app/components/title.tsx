import styles from './title.module.scss';

export default function Title({ children }: { children: React.ReactNode }) {
  return <h1 className={styles.title}>{children}</h1>;
}

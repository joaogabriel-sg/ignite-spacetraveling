import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${commonStyles.content} ${styles.header}`}>
      <Link href="/">
        <img src="/logo.svg" alt="logo" />
      </Link>
    </header>
  );
}

import { site } from '@/content'
import ThemeToggle from './ThemeToggle'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header} data-testid="header">
      <a href="#top" className={styles.wordmark}>
        shane<span className={styles.wordmarkDim}>@dev</span>
        <span className={styles.cursor} aria-hidden="true">_</span>
      </a>
      <nav className={styles.nav} aria-label="Sections">
        {site.nav.map((item) => (
          <a key={item.href} className={styles.navLink} href={item.href}>
            <span className={styles.method}>{item.method}</span>
            {item.path}
          </a>
        ))}
        <ThemeToggle />
        <a className={styles.resume} href={site.resumeHref} download>
          Résumé ↓
        </a>
      </nav>
    </header>
  )
}

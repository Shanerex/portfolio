import { site } from '@/content'
import ThemeToggle from './ThemeToggle'
import styles from './Rail.module.css'

export default function Rail() {
  return (
    <aside className={styles.rail} data-testid="rail">
      <p className={styles.name}>
        {site.name[0]}
        <br />
        {site.name[1]}
      </p>

      <nav className={styles.nav} aria-label="Sections">
        {site.nav.map((item) => (
          <a key={item.href} className={styles.tick} href={item.href} data-nav-tick>
            {item.label}
          </a>
        ))}
      </nav>

      <div className={styles.foot}>
        <a className={styles.email} href={`mailto:${site.email}`}>
          {site.email}
        </a>
        <div className={styles.links}>
          {site.links.map((link) => (
            <a
              key={link.href}
              className={styles.link}
              href={link.href}
              {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {link.label}
            </a>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </aside>
  )
}

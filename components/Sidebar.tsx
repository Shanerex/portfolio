import { site } from '@/content'
import ThemeToggle from './ThemeToggle'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const [firstName, lastName] = site.name

  return (
    <aside className="sidebar">
      <ThemeToggle />
      <div>
        <h1 className={styles.name}>
          {firstName}
          <br />
          {lastName}
        </h1>
        <p className={styles.blurb}>{site.blurb}</p>

        <nav className={styles.nav} aria-label="Sections">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div>
        <p className={styles.meta}>
          {site.location}
          <br />
          {site.availability}
        </p>
        <div className={styles.contact}>
          <a className={styles.email} href={`mailto:${site.email}`}>
            Email
          </a>
          {site.links.map((link) => (
            <a
              key={link.label}
              className={styles.link}
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}

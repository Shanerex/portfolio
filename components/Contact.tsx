import { site } from '@/content'
import styles from './Contact.module.css'

export default function Contact() {
  return (
    <section id="contact" className={`${styles.contact} reveal`}>
      <div className={`${styles.inner} wrap`}>
        <span className={styles.eyebrow}>{'// 05_contact'}</span>
        <h2 className={styles.headline}>Let&apos;s build something that stays up.</h2>
        <div className={styles.emailRow}>
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email} ↗
          </a>
        </div>
        <div className={styles.ctaRow}>
          <a className={styles.resumeCta} href={site.resumeHref} download>
            Download Résumé
          </a>
          <a className="outline-pill" href={site.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="outline-pill" href={site.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <div className={styles.footRow}>
          <span>
            {site.location} · {site.availability}
          </span>
          <span>
            © {new Date().getFullYear()} {site.name.join(' ')}
          </span>
        </div>
      </div>
    </section>
  )
}

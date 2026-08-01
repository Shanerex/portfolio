import { site } from '@/content'
import styles from './Contact.module.css'

export default function Contact() {
  return (
    <section id="contact" className={`${styles.contact} wipe`}>
      <div className="court">
        <div className={`singles ${styles.inner}`}>
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <p className={styles.meta}>
            {site.location} — {site.availability}
          </p>
        </div>
      </div>
    </section>
  )
}

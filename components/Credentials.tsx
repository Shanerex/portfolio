import { certifications, publications } from '@/content'
import styles from './Credentials.module.css'

export default function Credentials() {
  return (
    <section id="credentials" className={`${styles.section} wrap`}>
      <div className="marker reveal">
        <span className="marker-label">{'// 04_credentials'}</span>
        <span className="marker-rule" />
      </div>

      <div className={`${styles.group} reveal`}>
        <div className={styles.label}>Certifications</div>
        <div className={styles.chips}>
          {certifications.map((cert) => (
            <span key={cert.name} className={styles.chip}>
              {cert.name}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <div className={`${styles.label} reveal`}>Publications</div>
        {publications.map((pub, i) => (
          <a
            key={pub.title}
            className={`${styles.pub} reveal`}
            style={{ transitionDelay: `${i * 90}ms` }}
            href={pub.href}
            target="_blank"
            rel="noreferrer"
          >
            <div className={styles.pubHeader}>
              <h3 className={styles.pubTitle}>{pub.title}</h3>
              <span className={styles.pubMeta}>
                {pub.venue} · {pub.date}
              </span>
            </div>
            <p className={styles.pubDescription}>{pub.description}</p>
            <span className={styles.pubLink}>Read paper ↗</span>
          </a>
        ))}
      </div>
    </section>
  )
}

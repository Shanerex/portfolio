import { journey } from '@/content'
import styles from './Journey.module.css'

export default function Journey() {
  return (
    <section id="journey" className={`${styles.section} wrap`}>
      <div className="marker reveal">
        <span className="marker-label">{'// 01_journey'}</span>
        <span className="marker-rule" />
      </div>
      <div className={styles.rail}>
        <div className={styles.railLine} aria-hidden="true" />
        {journey.map((entry, i) => (
          <div
            key={entry.title}
            className={`${styles.entry} reveal`}
            style={{ transitionDelay: `${i * 110}ms` }}
          >
            <span
              className={`${styles.dot} ${entry.kind === 'education' ? styles.dotMute : styles.dotAccent}`}
              aria-hidden="true"
            />
            <div className={styles.tags}>
              <span className={styles.kindPill}>
                {entry.kind === 'work' ? 'WORK' : 'EDUCATION'}
              </span>
              {entry.kind === 'work' && entry.current && (
                <span className={styles.currentTag}>● current</span>
              )}
            </div>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>{entry.title}</h3>
              <span className={styles.date}>{entry.dateLabel}</span>
            </div>
            <div className={styles.subtitle}>{entry.subtitle}</div>
            {entry.kind === 'work' ? (
              <ul className={styles.bullets}>
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>
                    <span className={styles.arrow} aria-hidden="true">→</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.note}>{entry.note}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

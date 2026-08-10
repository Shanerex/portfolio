import { site } from '@/content'
import styles from './StatusBand.module.css'

export default function StatusBand() {
  return (
    <div className={`${styles.band} reveal`} data-testid="status-band">
      <div className={`${styles.inner} wrap`}>
        <div className={styles.eyebrow}>
          <span className={styles.pulseDot} aria-hidden="true" />
          system_status — live
        </div>
        <dl className={styles.grid}>
          {site.metrics.map((metric, i) => (
            <div
              key={metric.label}
              className="reveal"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <dt className={styles.figure}>{metric.figure}</dt>
              <dd className={styles.label}>{metric.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

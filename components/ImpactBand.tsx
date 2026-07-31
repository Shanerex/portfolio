import { site } from '@/content'
import styles from './ImpactBand.module.css'

export default function ImpactBand() {
  return (
    <div className={`${styles.band} wipe`} data-testid="impact-band">
      <dl className={styles.grid}>
        {site.metrics.map((metric) => (
          <div key={metric.label}>
            <dt className={styles.figure}>{metric.figure}</dt>
            <dd className={styles.label}>{metric.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

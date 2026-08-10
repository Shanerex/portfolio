import { now } from '@/content'
import styles from './Now.module.css'

export default function Now() {
  return (
    <section id="now" className={`${styles.section} wrap reveal`}>
      <div className="marker reveal">
        <span className="marker-label">// 04_now</span>
        <span className="marker-rule" />
      </div>
      {now.map((entry, i) => (
        <div
          key={entry.text}
          className={`${styles.row} reveal`}
          style={{ transitionDelay: `${i * 90}ms` }}
        >
          <span className={styles.tag}>{entry.tag}</span>
          <span className={styles.text}>{entry.text}</span>
        </div>
      ))}
    </section>
  )
}

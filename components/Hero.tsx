import { site } from '@/content'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={`court ${styles.hero}`}>
      <p className={`bleed ${styles.name}`}>{site.name.join(' ')}</p>
      <div className="bleed">
        <h1 className={styles.thesis}>{site.thesis}</h1>
        <div className={styles.rule} />
        <p className={styles.role}>
          <strong>Senior Software Engineer</strong> — {site.blurb.replace('Senior Software Engineer building', 'building')}
        </p>
      </div>
      <p className={`bleed ${styles.cue}`}>Scroll</p>
    </section>
  )
}

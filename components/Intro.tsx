import { site } from '@/content'
import styles from './Intro.module.css'

export default function Intro() {
  return (
    <section className="court">
      <p className={`singles reveal ${styles.lede}`} data-testid="intro">
        {site.lede}
      </p>
    </section>
  )
}

import { about, site } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './About.module.css'

export default function About() {
  return (
    <section id="about" className="section">
      <SectionLabel>About</SectionLabel>
      <p className={`${styles.body} reveal`}>{about}</p>
      <a className={`${styles.email} reveal`} href={`mailto:${site.email}`}>
        {site.email} →
      </a>
    </section>
  )
}

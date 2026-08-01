import { about } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './About.module.css'

export default function About() {
  return (
    <section id="about" className="section court">
      <SectionLabel>About</SectionLabel>
      <div className="deuce">
        <p className={`${styles.body} reveal`}>{about}</p>
      </div>
    </section>
  )
}

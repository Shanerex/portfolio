import { experience } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './Experience.module.css'

export default function Experience() {
  return (
    <section id="experience" className="section">
      <SectionLabel>Experience</SectionLabel>
      {experience.map((role) => (
        <article key={`${role.title}-${role.dates}`} className={`${styles.entry} reveal`}>
          <div className={styles.header}>
            <h3 className={styles.title}>{role.title}</h3>
            <span className={styles.dates}>{role.dates}</span>
          </div>
          <p className={styles.company}>{role.company}</p>
          <ul className={styles.bullets}>
            {role.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  )
}

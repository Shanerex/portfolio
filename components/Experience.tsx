import { experience } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './Experience.module.css'

const METRIC = /\d[\d,]*\.?\d*(?:-\d[\d,]*\.?\d*)?(?:%|M\+|\+|s)?/g

function withMetrics(text: string) {
  const matches = text.match(METRIC) ?? []
  return text.split(METRIC).reduce<React.ReactNode[]>((nodes, plain, i) => {
    nodes.push(plain)
    if (matches[i]) {
      nodes.push(
        <span key={i} className={styles.metric}>
          {matches[i]}
        </span>
      )
    }
    return nodes
  }, [])
}

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
              <li key={bullet}>{withMetrics(bullet)}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  )
}

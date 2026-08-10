import { skills } from '@/content'
import styles from './Skills.module.css'

export default function Skills() {
  return (
    <section id="skills" className={`${styles.section} wrap`}>
      <div className="marker reveal">
        <span className="marker-label">// 03_skills</span>
        <span className="marker-rule" />
      </div>
      <div className={styles.grid}>
        {skills.map((group, i) => {
          const lead = group.items.slice(0, group.lead)
          const rest = group.items.slice(group.lead)
          return (
            <div
              key={group.category}
              className="reveal"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={styles.category}>{group.category}</div>
              <div className={styles.chips}>
                {lead.map((item) => (
                  <span key={item} className={styles.chipLead} data-testid="skill-chip">
                    {item}
                  </span>
                ))}
                {rest.map((item) => (
                  <span key={item} className={styles.chipQuiet} data-testid="skill-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

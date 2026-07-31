import { skills } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './Skills.module.css'

export default function Skills() {
  return (
    <section id="skills" className="section">
      <SectionLabel>Skills</SectionLabel>
      <div className={styles.groups}>
        {skills.map((group, i) => {
          const lead = group.items.slice(0, group.lead)
          const rest = group.items.slice(group.lead)

          return (
            <div
              key={group.category}
              className={`${styles.group} reveal`}
              style={{ transitionDelay: `${Math.min(i, 3) * 0.06}s` }}
            >
              <h3 className={styles.groupLabel}>{group.category}</h3>
              {lead.length > 0 && (
                <ul className={styles.lead}>
                  {lead.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              )}
              {rest.length > 0 && (
                <ul className={styles.rest}>
                  {rest.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

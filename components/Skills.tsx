import { skills } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './Skills.module.css'

export default function Skills() {
  return (
    <section id="skills" className="section">
      <SectionLabel>Skills</SectionLabel>
      <ul className={`${styles.list} reveal`}>
        {skills.map((skill) => (
          <li key={skill} className={styles.chip}>
            {skill}
          </li>
        ))}
      </ul>
    </section>
  )
}

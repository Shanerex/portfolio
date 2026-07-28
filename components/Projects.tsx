import { projects } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './Projects.module.css'

export default function Projects() {
  return (
    <section id="projects" className="section">
      <SectionLabel>Projects</SectionLabel>
      {projects.map((project, i) => (
        <a
          key={project.name}
          className={`${styles.row} reveal`}
          style={{ transitionDelay: `${Math.min(i, 3) * 0.06}s` }}
          href={project.href}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.header}>
            <span className={styles.name}>{project.name}</span>
            <span className={styles.stack}>{project.stack}</span>
          </div>
          <p className={styles.description}>{project.description}</p>
        </a>
      ))}
    </section>
  )
}

import { projects, type Project } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './Projects.module.css'

const STATUS_LABEL: Record<Project['status'], string> = {
  'in-progress': 'In progress',
  completed: 'Completed',
}

export default function Projects() {
  return (
    <section id="projects" className="section">
      <SectionLabel>Projects</SectionLabel>
      {projects.map((project, i) => {
        const placement = i % 2 === 0 ? 'deuce' : 'ad'
        const body = (
          <>
            <div className={styles.header}>
              <span className={styles.name}>{project.name}</span>
              <span className={styles.status} data-status={project.status}>
                <span className={styles.dot} aria-hidden="true" />
                {STATUS_LABEL[project.status]}
              </span>
              <span className={styles.stack}>{project.stack}</span>
            </div>
            <ul className={styles.bullets}>
              {project.description.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </>
        )

        return (
          <div className="court" key={project.name}>
            {project.href ? (
              <a
                data-project
                className={`${placement} ${styles.row} reveal`}
                style={{ transitionDelay: `${Math.min(i, 3) * 0.06}s` }}
                href={project.href}
                target="_blank"
                rel="noreferrer"
              >
                {body}
              </a>
            ) : (
              <div
                data-project
                className={`${placement} ${styles.row} reveal`}
                style={{ transitionDelay: `${Math.min(i, 3) * 0.06}s` }}
              >
                {body}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}

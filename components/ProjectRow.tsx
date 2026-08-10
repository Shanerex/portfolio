import type { Project } from '@/content'
import styles from './ProjectRow.module.css'

const STATUS_LABEL: Record<Project['status'], string> = {
  'in-progress': 'In progress',
  completed: 'Completed',
}

export default function ProjectRow({ project, index }: { project: Project; index: number }) {
  const idx = String(index + 1).padStart(2, '0')
  const body = (
    <>
      <div className={styles.header}>
        <h3 className={styles.name}>{project.name}</h3>
        <div className={styles.meta}>
          <span className={styles.status} data-status={project.status}>
            {STATUS_LABEL[project.status]}
          </span>
          <span className={styles.stack}>{project.stack}</span>
        </div>
      </div>
      <div className={styles.description}>
        {project.description.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {project.href && (
        <span className={styles.viewRepo}>View repo ↗</span>
      )}
    </>
  )

  return (
    <div className={styles.row}>
      <div className={styles.index} aria-hidden="true">{idx}</div>
      {project.href ? (
        <a className={styles.content} href={project.href} target="_blank" rel="noreferrer">
          {body}
        </a>
      ) : (
        <div className={styles.content}>{body}</div>
      )}
    </div>
  )
}

import { projects } from '@/content'
import ProjectRow from './ProjectRow'
import styles from './Projects.module.css'

export default function Projects() {
  return (
    <section id="projects" className={`${styles.section} wrap`}>
      <div className="marker reveal">
        <span className="marker-label">// 02_projects</span>
        <span className="marker-rule" />
      </div>
      {projects.map((project, i) => (
        <ProjectRow key={project.name} project={project} index={i} />
      ))}
    </section>
  )
}

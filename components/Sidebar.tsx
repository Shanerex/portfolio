import { site } from '@/content'
import ThemeToggle from './ThemeToggle'
import styles from './Sidebar.module.css'
import {
  ExperienceIcon,
  ProjectsIcon,
  SkillsIcon,
  AboutIcon,
  MailIcon,
  LinkedInIcon,
  GitHubIcon,
} from './icons'

const NAV_ICONS: Record<string, React.ReactNode> = {
  Experience: <ExperienceIcon />,
  Projects: <ProjectsIcon />,
  Skills: <SkillsIcon />,
  About: <AboutIcon />,
}

const LINK_ICONS: Record<string, React.ReactNode> = {
  LinkedIn: <LinkedInIcon />,
  GitHub: <GitHubIcon />,
}

export default function Sidebar() {
  const [firstName, lastName] = site.name

  return (
    <aside className="sidebar">
      <ThemeToggle />
      <div>
        <h2 className={styles.name}>
          {firstName}
          <br />
          {lastName}
        </h2>
        <p className={styles.blurb}>{site.blurb}</p>

        <nav className={styles.nav} aria-label="Sections">
          {site.nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={i === 0 ? 'true' : undefined}
            >
              <span className={styles.navIcon}>{NAV_ICONS[item.label]}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div>
        <p className={styles.meta}>
          {site.location}
          <br />
          {site.availability}
        </p>
        <div className={styles.contact}>
          <a className={styles.email} href={`mailto:${site.email}`}>
            <MailIcon />
            Email
          </a>
          {site.links.map((link) => (
            <a
              key={link.label}
              className={styles.link}
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {LINK_ICONS[link.label]}
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}

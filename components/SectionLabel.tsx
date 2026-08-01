import styles from './SectionLabel.module.css'

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className={`singles ${styles.label}`}>{children}</h2>
}

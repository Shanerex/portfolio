import styles from './CourtLines.module.css'

export default function CourtLines() {
  return <div className={styles.lines} data-testid="court-lines" aria-hidden="true" />
}

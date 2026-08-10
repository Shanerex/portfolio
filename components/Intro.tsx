import { site } from '@/content'
import styles from './Intro.module.css'

export default function Intro() {
  return (
    <p className={`${styles.lede} reveal wrap`} data-testid="intro">
      {site.lede}
    </p>
  )
}

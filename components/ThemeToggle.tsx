'use client'

import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.css'

type Theme = 'night' | 'day'
const KEY = 'srs-theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('night')

  // The pre-paint script is the source of truth on first render; read from it
  // rather than recomputing, so the button label never disagrees with the page.
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setTheme(current === 'day' ? 'day' : 'night')
  }, [])

  function toggle() {
    const next: Theme = theme === 'day' ? 'night' : 'day'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Private browsing — the theme still applies for this page view.
    }
  }

  const label = theme === 'day' ? 'Day match' : 'Night match'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'day' ? 'night' : 'day'} match`}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </button>
  )
}

'use client'

import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.css'

type Theme = 'light' | 'dark'
const KEY = 'srs-theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

  // The pre-paint script is the source of truth on first render; read from it
  // rather than recomputing, so the button label never disagrees with the page.
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setTheme(current === 'dark' ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Private browsing — the theme still applies for this page view.
    }
  }

  const label = theme === 'dark' ? 'Dark' : 'Light'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </button>
  )
}

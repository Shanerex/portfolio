'use client'

import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.css'

type Theme = 'dark' | 'light'
const KEY = 'srs-theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Hydration sync: layout.tsx's inline script sets data-theme pre-render; a lazy
    // initializer would re-read it during hydration and mismatch the server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
  }, [])

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Private browsing — the theme still applies for this page view.
    }
  }

  const label = theme === 'light' ? 'Dark mode' : 'Light mode'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={theme === 'light' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.44 1 .96 1.1 1.6h4.8c.1-.64.5-1.16 1.1-1.6A6 6 0 0 0 12 3z" />
      </svg>
    </button>
  )
}

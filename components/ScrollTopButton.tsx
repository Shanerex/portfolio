'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './ScrollTopButton.module.css'

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false)
  // While a click-triggered scroll-to-top is in flight, suppress the normal
  // scroll-based hide check. Hiding the button (display: none via the
  // `hidden` attribute) mid-animation removes it from the layout while the
  // browser's native smooth-scroll is still running, which cancels that
  // animation outright and strands the page part-way up instead of at the
  // top. Only re-arm the normal show/hide behaviour once the scroll has
  // actually settled at (or near) the top.
  const returningToTop = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (returningToTop.current) {
        if (window.scrollY <= 2) {
          returningToTop.current = false
          setVisible(false)
        }
        return
      }
      setVisible(window.scrollY > 480)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    returningToTop.current = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Safety net in case the scroll-end never lands exactly at scrollY <= 2
    // (e.g. sub-pixel rounding, or the animation gets cut short some other
    // way) — don't leave the button permanently stuck suppressing hides.
    window.setTimeout(() => {
      returningToTop.current = false
    }, 1500)
  }

  return (
    <button
      type="button"
      className={styles.button}
      data-testid="scroll-top"
      aria-label="Scroll to top"
      hidden={!visible}
      onClick={handleClick}
    >
      ↑
    </button>
  )
}

'use client'

import { useEffect, useRef } from 'react'

const REVEAL_FAILSAFE_MS = 2000

export default function ScrollEffects() {
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))

    const revealAll = () =>
      revealTargets.forEach((el) => {
        el.style.transitionDuration = '0s'
        el.classList.add('is-in')
      })

    let remaining = revealTargets.length
    const failsafe = window.setTimeout(() => {
      if (remaining <= 0) return
      revealAll()
    }, REVEAL_FAILSAFE_MS)

    if (!('IntersectionObserver' in window)) {
      revealAll()
      return () => window.clearTimeout(failsafe)
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            revealObserver.unobserve(entry.target)
            remaining -= 1
            if (remaining <= 0) window.clearTimeout(failsafe)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    revealTargets.forEach((el) => revealObserver.observe(el))

    // Scroll-spy. Classes are toggled on the DOM directly rather than lifted
    // into React state, so Header stays a server component.
    const navLinks = new Map<string, HTMLAnchorElement>()
    document
      .querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')
      .forEach((a) => navLinks.set(a.getAttribute('href')!.slice(1), a))
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main section[id]'),
    ).filter((s) => navLinks.has(s.id))

    const setActive = (id: string) => {
      navLinks.forEach((link, key) => {
        if (key === id) link.setAttribute('aria-current', 'true')
        else link.removeAttribute('aria-current')
      })
    }

    const visible = new Set<string>()
    const spyObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const active = sections.find((s) => visible.has(s.id))
        if (active) setActive(active.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    sections.forEach((s) => spyObserver.observe(s))

    let scrollTick = false
    const tick = () => {
      scrollTick = false

      // Progress bar
      if (progressRef.current) {
        const h = document.documentElement
        const height = h.scrollHeight - h.clientHeight
        const pct = height > 0 ? (h.scrollTop / height) * 100 : 0
        progressRef.current.style.width = pct + '%'
      }

      // Bottom-of-document scroll-spy fallback — see below.
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      if (atBottom && sections.length > 0) {
        setActive(sections[sections.length - 1].id)
      }
    }
    const onScroll = () => {
      if (scrollTick) return
      scrollTick = true
      window.requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    tick()

    return () => {
      window.clearTimeout(failsafe)
      revealObserver.disconnect()
      spyObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div
      ref={progressRef}
      data-testid="scroll-progress"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: '0%',
        background: 'var(--primary)',
        zIndex: 100,
      }}
    />
  )
}

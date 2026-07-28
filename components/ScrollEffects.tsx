'use client'

import { useEffect } from 'react'

const REVEAL_FAILSAFE_MS = 2000

export default function ScrollEffects() {
  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal'),
    )

    // Failsafe reveals skip the fade — by the time this runs, the element
    // has already sat unrevealed far longer than the animation is meant to
    // be felt, so snapping straight to visible (no transition) is correct,
    // not just expedient: it guarantees no observer/assistive tooling ever
    // samples the DOM mid-fade at a non-AA-compliant effective contrast.
    const revealAll = () =>
      revealTargets.forEach((el) => {
        el.style.transitionDuration = '0s'
        el.classList.add('is-in')
      })

    // Failsafe #2: if the observer never fires (or never finishes), show
    // everything anyway. Content must never be stuck invisible. But if the
    // observer has already revealed everything on its own, this timer must
    // be a no-op rather than snapping/re-triggering anything.
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
    // into React state, so Sidebar stays a server component.
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main section[id]'),
    )
    const navLinks = new Map<string, HTMLAnchorElement>()
    document
      .querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')
      .forEach((a) => navLinks.set(a.getAttribute('href')!.slice(1), a))

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
        // Pick the first section in document order that is currently in view.
        const active = sections.find((s) => visible.has(s.id))
        if (active) setActive(active.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    sections.forEach((s) => spyObserver.observe(s))

    // Bottom-of-document fallback. The -40%/-55% band above is a viewport-
    // relative detection zone: depending on viewport height and how much
    // total scrollable content there is, that band can end up positioned
    // such that it never actually reaches the last section(s), even once
    // the user has scrolled all the way to the bottom of the page. When
    // that happens, force the last section (last in site.nav / document
    // order) to be marked active — scrolled-to-bottom is an unambiguous
    // signal that the final section is "in view" regardless of what the
    // observer's band currently reports.
    let scrollTick = false
    const checkBottom = () => {
      scrollTick = false
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      if (atBottom && sections.length > 0) {
        setActive(sections[sections.length - 1].id)
      }
    }
    const onScroll = () => {
      if (scrollTick) return
      scrollTick = true
      window.requestAnimationFrame(checkBottom)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // Cover the case where the page loads already scrolled to the bottom
    // (e.g. reload with scroll restoration).
    checkBottom()

    return () => {
      window.clearTimeout(failsafe)
      revealObserver.disconnect()
      spyObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return null
}

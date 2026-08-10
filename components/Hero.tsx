import { site } from '@/content'
import styles from './Hero.module.css'

const reliability = site.metrics.find((m) => m.label === 'delivery reliability')!.figure
const throughput = site.metrics.find((m) => m.label === 'requests a day')!.figure

export default function Hero() {
  return (
    <section id="hero" className={`${styles.hero} wrap`}>
      <div className={styles.columns}>
        <div className={styles.text}>
          <p className={`${styles.eyebrow} reveal`} style={{ transitionDelay: '0ms' }}>
            — {site.thesis}
          </p>
          <h1 className={`${styles.name} reveal`} style={{ transitionDelay: '90ms' }}>
            {site.name[0]}
            <br />
            {site.name[1]}
          </h1>
          <p className={`${styles.blurb} reveal`} style={{ transitionDelay: '180ms' }}>
            {site.blurb}
          </p>
          <p className={`${styles.lede} reveal`} style={{ transitionDelay: '270ms' }}>
            {site.lede}
          </p>

          <div className={`${styles.ctaRow} reveal`} style={{ transitionDelay: '360ms' }}>
            <a className={styles.emailCta} href={`mailto:${site.email}`}>
              {site.email} ↗
            </a>
            <a
              className="outline-pill"
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              className="outline-pill"
              href={site.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <span className={styles.availability}>
              <span className={styles.pulseDot} aria-hidden="true" />
              {site.availability}
            </span>
          </div>
          <div className={styles.location}>{site.location}</div>

          <div
            className={`${styles.terminal} reveal`}
            style={{ transitionDelay: '420ms' }}
            data-testid="terminal-card"
          >
            <div className={styles.terminalBar}>
              <span className={styles.dotCoral} aria-hidden="true" />
              <span className={styles.dotLime} aria-hidden="true" />
              <span className={styles.dotMute} aria-hidden="true" />
              <span className={styles.terminalTitle}>health-check.sh</span>
            </div>
            <div className={styles.terminalBody}>
              <div className={styles.terminalDim}>$ curl -s api/health</div>
              <div>{'{'}</div>
              <div className={styles.terminalLine}>
                &nbsp;&nbsp;&quot;status&quot;: <span className={styles.terminalVal}>&quot;ok&quot;</span>,
              </div>
              <div className={styles.terminalLine}>
                &nbsp;&nbsp;&quot;reliability&quot;: <span className={styles.terminalVal}>&quot;{reliability}&quot;</span>,
              </div>
              <div className={styles.terminalLine}>
                &nbsp;&nbsp;&quot;throughput&quot;: <span className={styles.terminalVal}>&quot;{throughput.toLowerCase()}/day&quot;</span>,
              </div>
              <div className={styles.terminalLine}>
                &nbsp;&nbsp;&quot;p95_latency&quot;: <span className={styles.terminalVal}>&quot;&lt;1s&quot;</span>
              </div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>

        {/* Static-export build: next/image needs unoptimized mode (no benefit); w/h attrs already prevent CLS. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`${styles.photo} reveal`}
          style={{ transitionDelay: '0ms' }}
          src="/headshot.jpg"
          width={180}
          height={180}
          alt={`${site.name[0]} ${site.name[1]}`}
        />
      </div>
    </section>
  )
}

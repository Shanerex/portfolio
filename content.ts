export type Link = { label: string; href: string }

export type ExperienceEntry = {
  title: string
  dates: string
  company: string
  bullets: string[]
}

export type Project = {
  name: string
  stack: string
  description: string
  href: string
}

export const site = {
  name: ['Shane Rex', 'Sasikumar'] as const,
  blurb:
    'Senior Software Engineer building event-driven backends on Java, Spring Boot and GCP.',
  lede:
    'Three years building distributed services that stay up: streaming pipelines, transaction engines and zero-downtime migrations. I own what I ship — design doc through production incident.',
  location: 'Bengaluru, India',
  availability: 'Open to new roles',
  email: 'shanerexsasikumar@gmail.com',
  nav: [
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'About', href: '#about' },
  ] satisfies Link[],
  // TODO(shane): replace the two placeholder URLs below before launch.
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shanerexsasikumar' },
    { label: 'GitHub', href: 'https://github.com/shanerex' },
    { label: 'CV', href: '/cv.pdf' },
  ] satisfies Link[],
}

export const experience: ExperienceEntry[] = [
  {
    title: 'Senior Software Engineer',
    dates: '2025 — Present',
    company: 'Bounteous x Accolite',
    bullets: [
      'Pub/Sub pipeline for 20+ event types — 300,000+ requests a day at 99.99% delivery.',
      'Order history responses from 6-8s to under 1s via a Beam-fed pre-aggregated store.',
      '400,000+ customer records migrated with zero downtime and no data loss.',
      'Spec-driven workflow adopted team-wide; 30-50% faster than estimates.',
    ],
  },
  {
    title: 'Software Analyst',
    dates: '2023 — 2025',
    company: 'Bounteous x Accolite',
    bullets: [
      'Credit management system built from scratch; 3M+ transactions migrated live.',
      'Fixed a registration race handing out duplicate customer numbers.',
      'NiFi ingestion pipeline replacing 100+ manual hours a month.',
      'JUnit coverage 75% → 90%; Cloud Monitoring dashboards and alerting.',
    ],
  },
]

// TODO(shane): replace the three placeholder repo URLs before launch.
export const projects: Project[] = [
  {
    name: 'file-upload-sdd',
    stack: 'Spring Boot 4 · GCS',
    description:
      'Five endpoints, five spec folders. Every feature specified before it was written.',
    href: 'https://github.com/shanerex/file-upload-sdd',
  },
  {
    name: 'alef-jasper-rebuild',
    stack: 'Next.js · Spring AI',
    description:
      'Full-stack rebuild with an AI RFQ concierge, running entirely on local infrastructure.',
    href: 'https://github.com/shanerex/alef-jasper-rebuild',
  },
  {
    name: 'concurrency-client-server',
    stack: 'Java · Threads',
    description:
      'Thread pools, backpressure and graceful shutdown, learned by building them.',
    href: 'https://github.com/shanerex/concurrency-client-server',
  },
]

export const skills: string[] = [
  'Java',
  'Spring Boot',
  'GCP Pub/Sub',
  'Cloud Run',
  'Dataflow · Beam',
  'BigQuery',
  'Cloud SQL',
  'Redis',
  'Firestore',
  'PostgreSQL',
  'Apache NiFi',
  'Docker',
  'JUnit 5',
  'Distributed systems',
]

export const about =
  'B.E. Computer Science, Thiagarajar College of Engineering — 9.42 CGPA. Off the clock I play tennis (a few tournament wins in school and college), cricket and badminton, and watch plenty more. Weekends go to films with a story worth following, in any language.'

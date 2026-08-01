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
  status: 'in-progress' | 'completed'
  description: string[]
  href?: string
}

export type Metric = { figure: string; label: string }

export const site = {
  name: ['Shane Rex', 'Sasikumar'] as const,
  thesis: 'No dwelling on the last point.',
  blurb:
    'Senior Software Engineer building event-driven backends on Java, Spring Boot and GCP.',
  lede:
    "I'm an engineer who cares as much about how I build as what I ship. By profession I build event-driven backends on Java, Spring Boot and GCP. The rest of my time keeps turning into the same question, answered differently. A rough stretch of AI-assisted coding became a spec-driven workflow, now running across my team. That workflow turned into two side builds of my own: a file upload API and a full site rebuild.",
  location: 'Bengaluru, India',
  availability: 'Open to new roles',
  metrics: [
    { figure: '300K+', label: 'requests a day' },
    { figure: '99.99%', label: 'delivery reliability' },
    { figure: '3M+', label: 'records migrated live' },
    { figure: '6s → 1s', label: 'API response time' },
  ] satisfies Metric[],
  email: 'shanerexsasikumar@gmail.com',
  nav: [
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'About', href: '#about' },
  ] satisfies Link[],
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shane-rex-sasikumar' },
    { label: 'GitHub', href: 'https://github.com/Shanerex' },
  ] satisfies Link[],
}

export const experience: ExperienceEntry[] = [
  {
    title: 'Senior Software Engineer',
    dates: 'Aug 2025 — Present',
    company: 'Bounteous x Accolite',
    bullets: [
      'Architected a GCP Pub/Sub pipeline ingesting 20+ webhook event types, handling 300,000+ requests a day at 99.99% delivery reliability.',
      'Chose Pub/Sub over synchronous HTTP fanout to decouple ingestion from processing, isolating faults per event type with dead-letter queues and exponential backoff retries.',
      'Cut order history API responses from 6-8s to under 1s by replacing direct BigQuery queries with a pre-aggregated SQL Server store, fed by a Dataflow/Beam streaming pipeline.',
      'Owned end-to-end migration of 400,000+ customer records to a new platform, with zero downtime and no data loss.',
      'Introduced and drove team-wide adoption of a Spec Driven Development workflow, cutting development time 30-50% against estimates.',
      'Diagnosed and resolved a production data integrity incident, reconciling 35,000 incorrect debits and restoring 20,000 missing cancellation credits with zero customer escalations.',
    ],
  },
  {
    title: 'Software Analyst',
    dates: 'Jun 2023 — Jul 2025',
    company: 'Bounteous x Accolite',
    bullets: [
      'Designed and built a credit management system from scratch on Spring Boot and Cloud SQL, migrating 3M+ historical transactions live with zero downtime.',
      'Eliminated a concurrency race that handed out duplicate customer numbers at registration, wrapping ID generation in a Firestore transaction.',
      'Automated an inventory data ingestion pipeline on Apache NiFi, eliminating 100+ hours of manual effort a month.',
      'Built Cloud Monitoring dashboards and multi-threshold alerting across distributed Cloud Run services, improving observability and cutting MTTR.',
      'Raised JUnit test coverage from 75% to 88% by introducing parameterized tests and mocking strategies.',
    ],
  },
]

export const projects: Project[] = [
  {
    name: 'cryptouijc',
    stack: 'Kotlin · Jetpack Compose',
    status: 'completed',
    description: [
      'Crypto trading app UI cloned in Jetpack Compose: home, prices, portfolio, trade, transaction and settings screens.',
      'Bottom navigation ties the screens together, plus a coin detail view.',
      'Runs on static sample data, no backend or live pricing API.',
    ],
    href: 'https://github.com/Shanerex/CryptoUIJC',
  },
  {
    name: 'alef-jasper-rebuild',
    stack: 'Next.js · Spring AI',
    status: 'in-progress',
    description: [
      'Full-stack rebuild of a marketing site: home, services, project portfolio, trust, team, contact and lead capture.',
      'Next.js frontend, Spring Boot API and Postgres, running locally through Docker Compose.',
      'Every feature specified through requirements, architecture and design docs before implementation.',
      'Spec includes an AI RFQ concierge on Spring AI.',
    ],
    href: 'https://github.com/Shanerex/alef-jasper-rebuild',
  },
  {
    name: 'Atlas',
    stack: 'React · Spring Boot · PostgreSQL · GCP',
    status: 'in-progress',
    description: [
      'In-house PIM replacing Fabric PIM, covering the subset of its feature set the client actually uses.',
      'Co-drafted the technical design. Built spec-driven with Claude agents, hooks and skills, every piece of functionality scoped in its own spec.',
      'React/Vite frontend, Spring Boot and PostgreSQL backend, deployed on GCP.',
    ],
  },
]

/**
 * `lead` is how many of the leading `items` headline the group. Those set in the
 * display face; the rest follow as a quiet run. Reorder `items` to change which
 * ones lead — the first `lead` entries are the ones that get the weight.
 */
export type SkillGroup = { category: string; lead: number; items: string[] }

export const skills: SkillGroup[] = [
  {
    category: 'Languages & Frameworks',
    lead: 2,
    items: ['Java', 'Spring Boot', 'JUnit 5', 'Hibernate · JPA'],
  },
  {
    category: 'Cloud & Infrastructure',
    lead: 3,
    items: [
      'GCP Pub/Sub',
      'Dataflow',
      'BigQuery',
      'Cloud Run',
      'Cloud SQL',
      'Cloud Build',
      'Cloud Tasks',
      'GCS',
      'Cloud Monitoring',
      'Cloud Scheduler',
      'Docker',
    ],
  },
  {
    category: 'Databases & Data',
    lead: 2,
    items: ['PostgreSQL', 'SQL Server', 'Firestore', 'Apache Beam', 'Apache NiFi', 'Redis'],
  },
  {
    category: 'Core Concepts',
    lead: 3,
    items: [
      'Event-Driven Architecture',
      'Distributed Systems',
      'Spec Driven Development',
      'Microservices',
      'System Design',
      'REST API Design',
      'Multithreading & Concurrency',
      'Agentic Engineering',
    ],
  },
  {
    category: 'Tools',
    lead: 1,
    items: ['Claude Code', 'Git', 'Apache Maven', 'IntelliJ IDEA', 'Visual Studio Code'],
  },
]

export const about =
  "I studied Computer Science at Thiagarajar College of Engineering and came out the other side with a 9.42 CGPA. Outside of work most of my time goes to sport, tennis mostly, a few tournament wins from school and college days, plus cricket and badminton, and honestly I watch a lot more of all three than I actually play. Weekends are reserved for a good film, any language, as long as the story holds up."

import Sidebar from '@/components/Sidebar'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import About from '@/components/About'
import ScrollEffects from '@/components/ScrollEffects'
import CourtLines from '@/components/CourtLines'
import { site } from '@/content'

export default function Home() {
  return (
    <div className="page">
      <CourtLines />
      <Sidebar />
      <main className="content">
        <p className="lede reveal">{site.lede}</p>
        <Experience />
        <Projects />
        <Skills />
        <About />
      </main>
      <ScrollEffects />
    </div>
  )
}

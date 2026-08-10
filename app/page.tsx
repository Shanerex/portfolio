import Header from '@/components/Header'
import Intro from '@/components/Intro'
import Journey from '@/components/Journey'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Now from '@/components/Now'
import Contact from '@/components/Contact'
import ScrollEffects from '@/components/ScrollEffects'
import Hero from '@/components/Hero'
import StatusBand from '@/components/StatusBand'

export default function Home() {
  return (
    <div className="page">
      <a id="top" />
      <Header />
      <main className="content">
        <Hero />
        <StatusBand />
        <Intro />
        <Journey />
        <Projects />
        <Skills />
        <Now />
        <Contact />
      </main>
      <ScrollEffects />
    </div>
  )
}

import Header from '@/components/Header'
import Intro from '@/components/Intro'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import About from '@/components/About'
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
        <Experience />
        <Projects />
        <Skills />
        <About />
        <Contact />
      </main>
      <ScrollEffects />
    </div>
  )
}

import Header from '@/components/Header'
import Journey from '@/components/Journey'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Credentials from '@/components/Credentials'
import Now from '@/components/Now'
import Contact from '@/components/Contact'
import ScrollEffects from '@/components/ScrollEffects'
import ScrollTopButton from '@/components/ScrollTopButton'
import Hero from '@/components/Hero'
import StatusBand from '@/components/StatusBand'

export default function Home() {
  return (
    <>
      <a id="top" />
      <Header />
      <main>
        <Hero />
        <StatusBand />
        <Journey />
        <Projects />
        <Skills />
        <Credentials />
        <Now />
        <Contact />
      </main>
      <ScrollEffects />
      <ScrollTopButton />
    </>
  )
}

import type { Metadata } from 'next'
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-bricolage',
  display: 'swap',
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Shane Rex Sasikumar — Senior Software Engineer',
  description:
    'Senior Software Engineer building event-driven backends on Java, Spring Boot and GCP.',
}

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('srs-theme')
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})()
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${plexSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  )
}

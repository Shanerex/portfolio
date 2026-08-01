import type { Metadata } from 'next'
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  axes: ['wdth'],
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
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
    if (stored === 'light') stored = 'day'
    if (stored === 'dark') stored = 'night'
    var theme = stored === 'day' || stored === 'night' ? stored : 'night'
    document.documentElement.setAttribute('data-theme', theme)
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'night')
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
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>{`
    .reveal { opacity: 1 !important; transform: none !important; }
    .wipe { clip-path: none !important; }
  `}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  )
}

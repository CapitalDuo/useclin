import { Hanken_Grotesk, Newsreader } from 'next/font/google'
import './globals.css'

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
})

export const metadata = {
  title: 'Rosan — Clínica Integrativa',
  description: 'Sistema de gestão para clínicas médicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${hanken.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="font-hanken min-h-full">{children}</body>
    </html>
  )
}

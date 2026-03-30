import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { Instrument_Sans } from 'next/font/google'

import './globals.css'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Style My Look — Your wardrobe, styled by AI',
  description:
    'Upload your clothes, tell us where you are going, and get outfit suggestions tailored just for you.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable}`}>
      <body className={`${instrumentSans.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

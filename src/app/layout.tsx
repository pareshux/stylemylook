import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Instrument_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import './globals.css'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
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
    <html lang="en" className={instrumentSans.className}>
      <body className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}

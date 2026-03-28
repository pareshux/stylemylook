'use client'

import { useEffect } from 'react'
import { GeistSans } from 'geist/font/sans'

import './globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C] antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <p className="text-4xl" aria-hidden>
            👗
          </p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            StyleAI hit a snag
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#1C1C1C]/60">
            A critical error stopped the app from loading. Try refreshing the
            page.
          </p>
          {error.digest ? (
            <p className="mt-3 font-mono text-xs text-[#1C1C1C]/40">
              {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#E8724A] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#d4633e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8724A]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7F2]"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/'
              }}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#1C1C1C]/18 bg-transparent px-6 text-sm font-semibold text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8724A]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7F2]"
            >
              Back to home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

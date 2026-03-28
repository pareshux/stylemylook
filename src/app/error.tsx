'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@/components/button'

export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] p-6 text-center text-[#1C1C1C]">
      <p className="text-4xl" aria-hidden>
        👗
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#1C1C1C]/60">
        We couldn&apos;t load this page. You can try again or head back home.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-[#1C1C1C]/40">
          {error.digest}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={() => reset()}
          className="rounded-xl px-6"
        >
          Try again
        </Button>
        <Button variant="outline" className="rounded-xl px-6" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}

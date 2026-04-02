import Link from 'next/link'

import { Button } from '@/components/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] p-6 text-center text-[#1C1C1C]">
      <p className="text-5xl" aria-hidden>
        🔍
      </p>
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#E8724A]">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#1C1C1C]/60">
        This URL doesn&apos;t match anything in StyleAI. Check the link or go
        back to the app.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button className="rounded-xl px-6" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

import { EVENT_CHIPS } from '@/lib/events'
import { AppMaxWidth } from '@/components/app/app-max-width'

function greetingForNow() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomeClient({ displayName }: { displayName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="flex items-center justify-between border-b border-[#1C1C1C]/[0.06] px-4 py-3">
        <span className="text-sm font-bold tracking-tight text-[#1C1C1C]">
          StyleAI 👗
        </span>
        <div
          className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#E8724A] to-[#c95a38] text-sm font-bold text-white shadow-sm"
          aria-hidden
        >
          {displayName.slice(0, 1).toUpperCase()}
        </div>
      </header>

      <AppMaxWidth className="space-y-6 py-8">
        <p className="text-center text-[0.9375rem] text-[#1C1C1C]/70">
          {greetingForNow()}, {displayName}! ✨
        </p>
        <h1 className="text-center text-xl font-bold tracking-tight text-[#1C1C1C]">
          What are your plans today?
        </h1>

        <div className="grid grid-cols-2 gap-3">
          {EVENT_CHIPS.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
            >
              <Link
                href={`/suggestions?event=${encodeURIComponent(ev.id)}`}
                className="flex flex-col items-center rounded-2xl border border-[#1C1C1C]/[0.06] bg-white/80 px-3 py-5 text-center shadow-sm transition-all active:scale-[0.98] hover:border-[#E8724A]/25 hover:shadow-md"
              >
                <span className="text-3xl leading-none" aria-hidden>
                  {ev.emoji}
                </span>
                <span className="mt-2 text-xs font-semibold leading-tight text-[#1C1C1C]">
                  {ev.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </AppMaxWidth>
    </motion.div>
  )
}

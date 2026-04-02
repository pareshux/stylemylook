'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { EVENT_CHIPS } from '@/lib/events'
import { cn } from '@/lib/utils'

function greetingForNow() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomeClient({ firstName }: { firstName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto max-w-[1280px] px-6 py-8 md:py-12">
        <p className="mb-2 text-center text-[18px] font-normal text-[#4E4E4E]">
          {greetingForNow()}, {firstName}! ✨
        </p>
        <h1 className="mb-8 text-center text-[32px] font-bold leading-tight text-[#2A2A2A] md:mb-12 md:text-[48px]">
          What are your plans today?
        </h1>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {EVENT_CHIPS.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
            >
              <Link
                href={`/suggestions?event=${encodeURIComponent(ev.id)}`}
                className={cn(
                  'flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[20px] border border-[#E3DDCF] bg-white p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 ease-in-out',
                  'active:border-[#2A2A2A] active:bg-[#2A2A2A] active:shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:[&_span]:text-white',
                  'md:min-h-[160px]',
                  'md:hover:scale-[1.02] md:hover:border-[#2A2A2A] md:hover:bg-[#E3DDCF] md:hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
                  'cursor-pointer'
                )}
              >
                <span
                  className="text-[32px] leading-none text-[#2A2A2A] md:text-[40px]"
                  aria-hidden
                >
                  {ev.emoji}
                </span>
                <span className="text-[14px] font-medium leading-tight text-[#2A2A2A] md:text-[16px]">
                  {ev.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

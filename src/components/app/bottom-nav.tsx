'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const tabs = [
  { href: '/home', emoji: '🏠', label: 'Home' },
  { href: '/wardrobe', emoji: '👗', label: 'Wardrobe' },
  { href: '/saved', emoji: '♥', label: 'Saved' },
  { href: '/profile', emoji: '👤', label: 'Profile' },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1C1C1C]/[0.08] bg-[#FAF7F2]/95 backdrop-blur-lg"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-sm items-stretch justify-around px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {tabs.map(({ href, emoji, label }) => {
          const active =
            href === '/home'
              ? pathname === '/home'
              : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[0.65rem] font-semibold transition-colors',
                active
                  ? 'text-[#E8724A]'
                  : 'text-[#1C1C1C]/45 hover:text-[#1C1C1C]/70'
              )}
            >
              <span className="text-lg leading-none" aria-hidden>
                {emoji}
              </span>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const links = [
  { href: '/home', label: 'Home' },
  { href: '/wardrobe', label: 'Wardrobe' },
  { href: '/saved', label: 'Fav Looks' },
  { href: '/profile', label: 'Profile' },
] as const

function linkActive(pathname: string, href: string) {
  if (href === '/home') return pathname === '/home'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function TopNav({ showUpgradeNudge = false }: { showUpgradeNudge?: boolean }) {
  const pathname = usePathname()

  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 hidden h-16 border-b border-[#E3DDCF] bg-[#F5F3EC] md:block"
      role="banner"
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-8">
        <Link href="/home" className="shrink-0">
          <img
            src="/logo.svg"
            alt="StyleMyLook"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-6">
          <nav className="flex h-full items-stretch gap-8" aria-label="Main navigation">
            {links.map(({ href, label }) => {
              const active = linkActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center border-b-2 text-[15px] font-medium text-[#4E4E4E] transition-colors hover:text-[#2A2A2A]',
                    active
                      ? 'border-[#2A2A2A] font-semibold text-[#2A2A2A]'
                      : 'border-transparent'
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
          {showUpgradeNudge ? (
            <Link
              href="/pricing"
              className="rounded-full bg-[#2A2A2A] px-4 py-1.5 text-[13px] font-medium text-white"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            >
              Upgrade ✨
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}

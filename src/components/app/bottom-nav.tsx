'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Shirt, User, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const tabs: ReadonlyArray<
  | { href: string; label: string; logo: true }
  | { href: string; label: string; logo: false; Icon: LucideIcon }
> = [
  { href: '/home', label: 'Home', logo: true },
  { href: '/wardrobe', label: 'Wardrobe', logo: false, Icon: Shirt },
  { href: '/saved', label: 'Fav Looks', logo: false, Icon: Bookmark },
  { href: '/profile', label: 'Profile', logo: false, Icon: User },
]

export function BottomNav({ showUpgradeNudge = false }: { showUpgradeNudge?: boolean }) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E3DDCF] bg-[#F5F3EC] md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex min-h-[72px] max-w-sm items-stretch justify-around px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {tabs.map((tab) => {
          const { href, label } = tab
          const NavIcon = tab.logo ? null : tab.Icon
          const active =
            href === '/home'
              ? pathname === '/home'
              : pathname === href || pathname.startsWith(`${href}/`)
          const inactiveClass = 'text-[#8A8680]'
          const activeClass = 'text-[#2A2A2A]'
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] font-medium transition-colors',
                active ? activeClass : inactiveClass
              )}
            >
              {NavIcon == null ? (
                <img
                  src="/logo.svg"
                  alt="StyleMyLook"
                  className={cn(
                    'h-6 w-auto',
                    active ? 'opacity-100' : 'opacity-55'
                  )}
                  aria-hidden
                />
              ) : (
                <div className="relative flex items-center justify-center">
                  <NavIcon
                    className="size-6 shrink-0 stroke-[1.75]"
                    aria-hidden
                  />
                  {tab.href === '/profile' && showUpgradeNudge ? (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                  ) : null}
                </div>
              )}
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

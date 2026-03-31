'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Home, Shirt, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const tabs: ReadonlyArray<
  | { href: string; label: string; type: 'home' }
  | { href: string; label: string; type: 'wardrobe' | 'saved'; Icon: LucideIcon }
  | { href: string; label: string; type: 'profile' }
> = [
  { href: '/home', label: 'Home', type: 'home' },
  { href: '/wardrobe', label: 'Wardrobe', type: 'wardrobe', Icon: Shirt },
  { href: '/saved', label: 'Fav Looks', type: 'saved', Icon: Bookmark },
  { href: '/profile', label: 'Profile', type: 'profile' },
]

type BottomNavProps = {
  showUpgradeNudge?: boolean
  avatarUrl?: string | null
  profileName?: string | null
  profileEmail?: string | null
}

function initialsFromProfile(
  profileName?: string | null,
  profileEmail?: string | null
) {
  const source = profileName || profileEmail || ''
  const trimmed = source.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

export function BottomNav({
  showUpgradeNudge = false,
  avatarUrl,
  profileName,
  profileEmail,
}: BottomNavProps) {
  const pathname = usePathname()
  const initials = initialsFromProfile(profileName, profileEmail)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E3DDCF] bg-[#F5F3EC] md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex min-h-[72px] max-w-sm items-stretch justify-around px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {tabs.map((tab) => {
          const { href, label } = tab
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
              {tab.type === 'home' ? (
                <Home className="size-6 shrink-0 stroke-[1.75]" aria-hidden />
              ) : tab.type === 'profile' ? (
                <div className="relative flex items-center justify-center">
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-[#E3DDCF] bg-[#2A2A2A]">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={label}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-[11px] font-semibold text-white">
                        {initials}
                      </span>
                    )}
                  </div>
                  {showUpgradeNudge ? (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                  ) : null}
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <tab.Icon
                    className="size-6 shrink-0 stroke-[1.75]"
                    aria-hidden
                  />
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

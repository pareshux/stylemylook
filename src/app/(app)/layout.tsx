'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { BottomNav } from '@/components/app/bottom-nav'
import { TopNav } from '@/components/app/top-nav'
import { cn } from '@/lib/utils'

const HIDE_NAV_PREFIXES = ['/onboarding', '/wardrobe/upload']

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideNav = HIDE_NAV_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  return (
    <div
      className={cn(
        'min-h-screen bg-[#F5F3EC]',
        !hideNav &&
          'pb-[calc(72px+max(0.5rem,env(safe-area-inset-bottom)))] md:pb-0',
        !hideNav && 'md:pt-16'
      )}
    >
      {!hideNav ? <TopNav /> : null}
      {children}
      {!hideNav ? <BottomNav /> : null}
    </div>
  )
}

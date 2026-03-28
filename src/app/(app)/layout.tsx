'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { BottomNav } from '@/components/app/bottom-nav'

const HIDE_NAV_PREFIXES = ['/onboarding', '/suggestions', '/wardrobe/upload']

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideNav = HIDE_NAV_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  return (
    <div
      className={
        hideNav
          ? 'min-h-screen bg-[#FAF7F2]'
          : 'min-h-screen bg-[#FAF7F2] pb-[calc(4.5rem+env(safe-area-inset-bottom))]'
      }
    >
      {children}
      {!hideNav ? <BottomNav /> : null}
    </div>
  )
}

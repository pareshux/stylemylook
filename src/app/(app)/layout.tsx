'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import { BottomNav } from '@/components/app/bottom-nav'
import { TopNav } from '@/components/app/top-nav'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const HIDE_NAV_PREFIXES = ['/onboarding', '/wardrobe/upload']

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideNav = HIDE_NAV_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  const [showUpgradeNudge, setShowUpgradeNudge] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, suggestions_count, wardrobe_count')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile) return

      const suggestionsUsedPercent =
        ((profile.suggestions_count ?? 0) / 10) * 100
      const wardrobeUsedPercent = ((profile.wardrobe_count ?? 0) / 50) * 100
      const shouldNudge =
        profile.plan === 'free' &&
        (suggestionsUsedPercent >= 80 || wardrobeUsedPercent >= 80)

      setShowUpgradeNudge(shouldNudge)
    }

    void load()
  }, [])

  return (
    <div
      className={cn(
        'min-h-screen bg-[#F5F3EC]',
        !hideNav &&
          'pb-[calc(72px+max(0.5rem,env(safe-area-inset-bottom)))] md:pb-0',
        !hideNav && 'md:pt-16'
      )}
    >
      {!hideNav ? <TopNav showUpgradeNudge={showUpgradeNudge} /> : null}
      {children}
      {!hideNav ? <BottomNav showUpgradeNudge={showUpgradeNudge} /> : null}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/button'
import { AppMaxWidth } from '@/components/app/app-max-width'

function ProgressBar({
  value,
  max,
}: {
  value: number
  max: number
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="space-y-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8724A]/15">
        <div
          className="h-2 rounded-full bg-[#E8724A]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState<string | null>(null)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [wardrobeCount, setWardrobeCount] = useState<number>(0)
  const [suggestionsCount, setSuggestionsCount] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (cancelled) return

      setEmail(user?.email ?? null)
      if (!user) return

      const [{ data: profile }, { count }] = await Promise.all([
        supabase
          .from('profiles')
          .select('plan, suggestions_count')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('wardrobe_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ])

      const p = (profile?.plan ?? 'free') as 'free' | 'pro'
      setPlan(p)
      setSuggestionsCount(profile?.suggestions_count ?? 0)
      setWardrobeCount(count ?? 0)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-4"
    >
      <header className="border-b border-[#1C1C1C]/[0.06] px-4 py-4">
        <h1 className="text-lg font-bold tracking-tight text-[#1C1C1C]">
          Profile 👤
        </h1>
      </header>
      <AppMaxWidth className="space-y-6 py-8">
        <div className="rounded-2xl border border-[#1C1C1C]/[0.08] bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1C1C1C]/45">
            Signed in as
          </p>
          <p className="mt-1 text-sm font-medium text-[#1C1C1C]">{email ?? '…'}</p>
        </div>

        <div className="rounded-2xl border border-[#1C1C1C]/[0.08] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#1C1C1C]">
              Your plan:{' '}
              <span className="text-[#E8724A]">{plan === 'pro' ? 'Pro' : 'Free'}</span>
            </p>

            {plan === 'free' ? (
              <Link
                href="/pricing"
                className="text-xs font-semibold text-[#E8724A] hover:underline"
              >
                Upgrade
              </Link>
            ) : null}
          </div>

          {plan === 'pro' ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-[#1C1C1C]/70">
                Wardrobe: Unlimited
              </p>
              <p className="text-sm font-semibold text-[#1C1C1C]/70">
                Suggestions: Unlimited
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#1C1C1C]/70">
                  Wardrobe: {wardrobeCount}/50 items
                </p>
                <ProgressBar value={wardrobeCount} max={50} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#1C1C1C]/70">
                  Suggestions: {suggestionsCount}/10 used
                </p>
                <ProgressBar value={suggestionsCount} max={10} />
              </div>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-[#1C1C1C]/15"
          onClick={signOut}
        >
          Log out
        </Button>
      </AppMaxWidth>
    </motion.div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import { createClient } from '@/lib/supabase/client'
import { PricingCards } from '@/components/app/pricing/pricing-cards'

export default function PricingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [toast, setToast] = useState<string | null>(null)

  const toastKey = useMemo(() => String(toast), [toast])

  function goBack() {
    // Try to return to the previous page (home, wardrobe, suggestions, etc).
    // If history is empty, fall back to home.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/home')
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle()

      const p = (data?.plan ?? 'free') as 'free' | 'pro'
      if (!cancelled) setPlan(p)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [supabase])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(t)
  }, [toast])

  return (
    <div className="min-h-screen pb-10">
      {toast ? (
        <div
          key={toastKey}
          className="fixed bottom-24 left-0 right-0 z-[100] flex justify-center px-4"
        >
          <div className="rounded-xl bg-[#1C1C1C]/90 px-4 py-3 text-sm font-semibold text-white shadow-lg">
            {toast}
          </div>
        </div>
      ) : null}

      {/* Modal overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
        onClick={() => goBack()}
      >
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl border border-[#1C1C1C]/[0.08] bg-[#FAF7F2] p-5 shadow-2xl">
            <div className="relative">
              <h1 className="text-center text-lg font-bold tracking-tight text-[#1C1C1C]">
                Pricing
              </h1>
              <button
                type="button"
                onClick={() => goBack()}
                className="absolute right-0 top-0 flex size-10 items-center justify-center rounded-full text-[#1C1C1C]/60 transition-colors hover:bg-white/70 hover:text-[#1C1C1C]"
                aria-label="Close pricing"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              <PricingCards
                plan={plan}
                onUpgradePro={() => setToast('Coming soon')}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}


'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { RazorpayCheckout } from '@/components/app/RazorpayCheckout'

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    let cancelled = false
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      const email = session?.user?.email ?? ''
      setUserEmail(email)
      if (email) setUserName(email.split('@')[0])
    }
    void loadUser()
    return () => {
      cancelled = true
    }
  }, [supabase])

  const faqs = [
    {
      q: "What's the difference between Pro and Premium?",
      a: 'Pro is perfect for most users — 150 wardrobe items and 30 suggestions a month covers everything. Premium is for serious fashion lovers who want unlimited everything, plus the Shopping Scanner and curated brand picks when they launch.',
    },
    {
      q: 'How does the yearly discount work?',
      a: 'Pay annually and save 20% vs monthly. Pro yearly is ₹1,910 (₹159/month) and Premium yearly is ₹3,830 (₹319/month). Yearly plans are billed once upfront.',
    },
    {
      q: 'Why is it priced in rupees?',
      a: 'StyleMyLook is built in India, for India. We price in INR, support UPI and Indian cards, and we understand what feels affordable for our audience. No dollar conversions, no surprises.',
    },
    {
      q: 'How do Google Shopping suggestions work?',
      a: "After each outfit suggestion, our AI identifies what's missing from your wardrobe to complete the look — things like shoes, a bag, or jewellery. We then generate direct Google Shopping links so you can find and buy exactly what you need. Free users get 2 suggestions per outfit, Pro users get 4.",
    },
    {
      q: 'What happens when I reach the free limit?',
      a: "You'll still be able to view your saved outfits and wardrobe. To generate new suggestions or add more clothes, you'll need to upgrade to Pro.",
    },
    {
      q: 'Can I cancel my Pro subscription?',
      a: "Yes, anytime. There are no cancellation fees and you'll keep Pro access until the end of your billing period.",
    },
    {
      q: 'Is my wardrobe data safe?',
      a: 'Absolutely. Your photos are stored securely on Supabase (AWS infrastructure) and protected by row-level security. Only you can access your wardrobe. We never share or sell your data.',
    },
    {
      q: 'How does the AI work?',
      a: 'We use Claude by Anthropic — one of the most advanced AI models available. It looks at your actual clothing photos, understands the fabrics, colours and styles, then puts together outfit combinations suited to your event.',
    },
    {
      q: 'Will there be more features added to Pro?',
      a: "Yes! Pro members get new features first. We're working on product recommendations, outfit sharing with friends, and seasonal wardrobe audits.",
    },
    {
      q: 'Do you offer a student or annual discount?',
      a: "We're working on annual pricing (save 2 months) and a student plan. Join our Instagram @stylemylookai to be the first to know.",
    },
  ]

  return (
    <main className="min-h-screen bg-[#F5F3EC]">
      {toast ? (
        <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4">
          <div className="rounded-xl bg-[#1C1C1C]/90 px-4 py-3 text-sm font-semibold text-white shadow-lg">
            {toast}
          </div>
        </div>
      ) : null}

      <nav className="sticky top-0 z-40 border-b border-[#E3DDCF] bg-[#F5F3EC]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6 md:px-12">
          <Link href="/home" className="flex items-center gap-3">
            <img
              src="https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/stylemylook_logo.svg"
              alt="StyleMyLook"
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/home"
            className="text-sm text-[#4E4E4E] transition-colors hover:text-[#2A2A2A]"
          >
            ← Back
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <section className="pt-16 text-center">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-[#8A8680]">
            SIMPLE PRICING
          </p>
          <h1 className="text-[48px] font-bold leading-tight text-[#2A2A2A] md:text-[56px]">
            Three plans. One goal.
          </h1>
          <p className="mt-3 text-[18px] text-[#4E4E4E]">
            Three plans. One goal — dress better every day. Start free, upgrade
            when you&apos;re ready.
          </p>
        </section>

        <section className="mt-8">
          <div className="mb-12 flex flex-col items-center gap-3">
            <div className="inline-flex rounded-full bg-[#E3DDCF] p-1">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  billing === 'monthly'
                    ? 'bg-white text-[#2A2A2A] shadow-sm'
                    : 'text-[#8A8680]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling('yearly')}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  billing === 'yearly'
                    ? 'bg-white text-[#2A2A2A] shadow-sm'
                    : 'text-[#8A8680]'
                }`}
              >
                Yearly
              </button>
            </div>

            {billing === 'yearly' ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#EAF3DE] px-3 py-1.5 text-xs font-bold text-[#27500A]">
                  🎉 Save 20% with yearly billing
                </span>
              </div>
            ) : (
              <p className="text-xs text-[#8A8680]">Switch to yearly and save 20% →</p>
            )}
          </div>
        </section>

        <section className="mb-10 mt-10">
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
            <div className="flex-1 rounded-2xl border border-[#E3DDCF] bg-white p-7">
              <span className="mb-4 inline-flex rounded-full bg-[#F5F3EC] px-3 py-1 text-xs text-[#4E4E4E]">
                Closet Starter
              </span>
              <h2 className="text-[28px] font-bold text-[#2A2A2A]">Free</h2>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-[48px] font-bold leading-none text-[#2A2A2A]">
                  ₹0
                </span>
                <span className="text-[16px] text-[#8A8680]">/forever</span>
              </div>
              <p className="mb-6 mt-1 text-[13px] text-[#8A8680]">
                Perfect to get started
              </p>
              <div className="my-6 border-t border-[#E3DDCF]" />
              <ul className="space-y-3 text-sm">
                {[
                  'Upload up to 30 wardrobe items',
                  '5 outfit suggestions/month',
                  'Save your favourite looks',
                  'AI-powered styling',
                  '2 Google Shopping suggestions per outfit',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[#2A2A2A]">
                    <Check className="h-4 w-4" />
                    {item}
                  </li>
                ))}
                <p className="ml-6 -mt-2 text-xs text-[#8A8680]">
                  Pro gets 4 suggestions per outfit
                </p>
                <li className="flex items-center gap-2 text-[#8A8680] line-through">
                  <X className="h-4 w-4" />
                  Unlimited suggestions
                </li>
                <li className="flex items-center gap-2 text-[#8A8680] line-through">
                  <X className="h-4 w-4" />
                  Unlimited wardrobe
                </li>
                <li className="flex items-center gap-2 text-[#8A8680] line-through">
                  <X className="h-4 w-4" />
                  Shopping Scanner
                </li>
              </ul>
              <button
                type="button"
                className="mt-6 w-full rounded-full border border-[#E3DDCF] py-3 text-[#8A8680] transition-colors hover:border-[#2A2A2A] hover:text-[#2A2A2A]"
              >
                Get started free
              </button>
            </div>

            <div className="relative flex-1 rounded-2xl border-2 border-[#2A2A2A] bg-[#2A2A2A] p-7 md:-my-2 md:scale-105">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#E3DDCF] px-4 py-1.5 text-xs font-bold text-[#2A2A2A]">
              Most popular
            </span>
            <span className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              Style Bestie
            </span>
            <h2 className="text-[28px] font-bold text-white">Pro</h2>
            <div className="mb-6 mt-3">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">
                  ₹{billing === 'monthly' ? '199' : '159'}
                </span>
                <span className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  /month
                </span>
              </div>
              {billing === 'yearly' ? (
                <p className="mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  ₹1,910 billed yearly
                </p>
              ) : (
                <p className="mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Billed monthly · Cancel anytime
                </p>
              )}
              <p
                className="mb-6 mt-1 text-sm font-medium"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                Less than your last Zomato order 🍕
              </p>
            </div>
            <div className="my-6 border-t border-white/10" />
            <ul className="space-y-3 text-sm text-white">
              {[
                'Everything in Free',
                'Upload up to 150 wardrobe items',
                '30 outfit suggestions/month',
                'Save unlimited looks',
                '4 Google Shopping suggestions per outfit',
                'New features first',
                'Priority support',
                'Unlimited everything',
              ].map((item) => (
                <li
                  key={item}
                  className={`flex items-center gap-2 ${
                    item === 'Unlimited everything'
                      ? 'text-white/40 line-through'
                      : ''
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {item}
                </li>
              ))}
            </ul>
            <div
              className="mb-5 mt-4 rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 text-2xl">🛍️</span>
                <div>
                  <p className="mb-1 text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                    Shop what&apos;s missing from your look
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    After every outfit, AI tells you exactly what accessories
                    would complete it — with direct Google Shopping links. Pro
                    gets 4 suggestions per outfit vs 2 on Free.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <RazorpayCheckout
                plan="pro"
                billing={billing}
                userEmail={userEmail}
                userName={userName}
              />
            </div>
            <p
              className="mt-3 text-center text-xs"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              🔒 Secure payment · Cancel anytime
            </p>
            </div>

            <div className="relative flex-1 rounded-2xl border border-[#E3DDCF] bg-white p-7">
              <span className="mb-4 inline-flex rounded-full bg-[#F5F3EC] px-3 py-1 text-xs text-[#4E4E4E]">
                Wardrobe Goals
              </span>
              <h2 className="text-[28px] font-bold text-[#2A2A2A]">Premium</h2>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-[48px] font-bold leading-none text-[#2A2A2A]">
                  {billing === 'monthly' ? '₹399' : '₹319'}
                </span>
                <span className="text-[16px] text-[#8A8680]">/month</span>
              </div>
              {billing === 'yearly' ? (
                <p className="mt-1 text-[12px] text-[#8A8680]">₹3,830 billed yearly</p>
              ) : null}
              <p className="mb-6 mt-1 text-[13px] text-[#8A8680]">
                For the true fashion lover
              </p>
              <p className="text-[11px] text-[#8A8680]">Less than one impulse buy 🛍️</p>
              <div className="mb-6 mt-6 border-t border-[#E3DDCF]" />
              <ul className="space-y-3 text-sm">
                {[
                  'Everything in Pro',
                  'Unlimited wardrobe items',
                  'Unlimited outfit suggestions',
                  'Shopping Scanner (coming soon) 🛍️',
                  'Curated brand picks (coming soon)',
                  'Annual wardrobe audit',
                  'Early access to all features',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[#2A2A2A]">
                    <Check className="h-4 w-4" />
                    {item.includes('coming soon') ? (
                      <>
                        {item.replace(' (coming soon)', '')}
                        <span className="ml-1 rounded-full bg-[#F5F3EC] px-2 py-0.5 text-[10px] text-[#8A8680]">
                          Coming soon
                        </span>
                      </>
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <RazorpayCheckout
                  plan="premium"
                  billing={billing}
                  userEmail={userEmail}
                  userName={userName}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 py-12">
          <h2 className="mb-8 text-center text-[32px] font-bold text-[#2A2A2A]">
            What&apos;s included
          </h2>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="w-full overflow-hidden rounded-2xl border border-[#E3DDCF] bg-white">
                <div className="grid grid-cols-[1fr_120px_120px_120px] border-b border-[#E3DDCF] bg-[#F5F3EC] px-6 py-4 md:grid-cols-[1fr_160px_160px_160px] md:px-10">
                <div className="text-sm font-semibold text-[#8A8680]">Feature</div>
                <div className="text-center text-sm font-bold text-[#2A2A2A]">
                  Free
                </div>
                <div className="text-center text-sm font-bold text-[#2A2A2A]">
                  Pro ✨
                </div>
                <div className="text-center text-sm font-bold text-[#2A2A2A]">
                  Premium
                </div>
              </div>
              {[
                { feature: 'Wardrobe items', free: '30 items', pro: '150 items', premium: 'Unlimited' },
                { feature: 'Suggestions/month', free: '5', pro: '30', premium: 'Unlimited' },
                { feature: 'AI styling', free: true, pro: true, premium: true },
                { feature: 'Save favourite looks', free: true, pro: true, premium: true },
                {
                  feature: 'Google Shopping links',
                  free: '2/outfit',
                  pro: '4/outfit',
                  premium: '4/outfit',
                },
                {
                  feature: 'Shopping Scanner',
                  free: false,
                  pro: false,
                  premium: 'Coming soon',
                },
                {
                  feature: 'Curated brand picks',
                  free: false,
                  pro: false,
                  premium: 'Coming soon',
                },
                { feature: 'New features first', free: false, pro: true, premium: true },
                { feature: 'Priority support', free: false, pro: true, premium: true },
                { feature: 'Annual wardrobe audit', free: false, pro: false, premium: 'Coming soon' },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_120px_120px_120px] border-b border-[#E3DDCF] px-6 py-4 last:border-0 md:grid-cols-[1fr_160px_160px_160px] md:px-10 ${
                    i % 2 === 0 ? '' : 'bg-[#FAFAF8]'
                  }`}
                >
                  <div className="text-sm font-medium text-[#2A2A2A]">
                    {row.feature}
                  </div>
                  <div className="text-center">
                    {row.free === true && (
                      <span className="font-bold text-green-600">✓</span>
                    )}
                    {row.free === false && <span className="text-[#8A8680]">—</span>}
                    {typeof row.free === 'string' && (
                      <span className="text-sm text-[#4E4E4E]">{row.free}</span>
                    )}
                  </div>
                  <div className="text-center">
                    {row.pro === true && (
                      <span className="font-bold text-green-600">✓</span>
                    )}
                    {row.pro === false && <span className="text-[#8A8680]">—</span>}
                    {typeof row.pro === 'string' && (
                      <span className="text-sm font-semibold text-[#2A2A2A]">
                        {row.pro}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    {row.premium === true && (
                      <span className="font-bold text-green-600">✓</span>
                    )}
                    {row.premium === false && <span className="text-[#8A8680]">—</span>}
                    {typeof row.premium === 'string' && (
                      <span className="text-sm font-semibold text-[#2A2A2A]">
                        {row.premium}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </section>

        <section className="py-12">
          <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
            <div className="flex flex-col items-center">
              <span className="text-[32px]">🔒</span>
              <p className="mt-2 text-[15px] font-semibold text-[#2A2A2A]">
                Secure &amp; private
              </p>
              <p className="mt-1 text-[13px] text-[#4E4E4E]">
                Your wardrobe photos are encrypted and never shared
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[32px]">💳</span>
              <p className="mt-2 text-[15px] font-semibold text-[#2A2A2A]">
                Cancel anytime
              </p>
              <p className="mt-1 text-[13px] text-[#4E4E4E]">
                No lock-in. Cancel your subscription in one click
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[32px]">🇮🇳</span>
              <p className="mt-2 text-[15px] font-semibold text-[#2A2A2A]">
                Made in India
              </p>
              <p className="mt-1 text-[13px] text-[#4E4E4E]">
                Built for Indian fashion lovers, priced for India
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 py-12">
          <div className="w-full rounded-2xl border border-[#E3DDCF] bg-white p-8 md:p-12">
            <h2 className="mb-10 text-center text-3xl font-bold text-[#2A2A2A]">
              Frequently asked questions
            </h2>
            <div className="mx-auto max-w-3xl">
              {faqs.map((faq, i) => (
                <div key={faq.q} className="border-b border-[#E3DDCF]">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="flex w-full items-center justify-between py-5 text-left"
                  >
                    <span className="pr-4 text-base font-semibold text-[#2A2A2A]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-[#8A8680] transition-transform ${
                        openIndex === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openIndex === i ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pb-5"
                      >
                        <p className="text-base leading-relaxed text-[#4E4E4E]">
                          {faq.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 mt-10 py-12">
          <div className="w-full rounded-2xl border border-[#E3DDCF] bg-white p-8 text-center md:p-12">
            <p className="mb-4 text-4xl">💬</p>
            <h3 className="text-[24px] font-bold text-[#2A2A2A]">
              Still have questions?
            </h3>
            <p className="mb-6 mt-2 text-[16px] text-[#4E4E4E]">
              We&apos;re a small team and we actually reply. Reach out anytime.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:hello@stylemylook.xyz"
                className="rounded-full bg-[#2A2A2A] px-6 py-3 font-medium text-white"
              >
                Email us
              </a>
              <a
                href="https://www.instagram.com/stylemylookai"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#2A2A2A] px-6 py-3 font-medium text-[#2A2A2A] transition-colors hover:bg-[#2A2A2A] hover:text-white"
              >
                Follow on Instagram
              </a>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#E3DDCF] py-6 text-center text-sm text-[#8A8680]">
        © 2025 StyleMyLook ·{' '}
        <Link href="/privacy" className="hover:text-[#2A2A2A]">
          Privacy Policy
        </Link>{' '}
        ·{' '}
        <a
          href="https://www.instagram.com/stylemylookai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#2A2A2A]"
        >
          Instagram
        </a>
      </footer>
    </main>
  )
}


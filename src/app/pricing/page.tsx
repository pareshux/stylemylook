'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, X } from 'lucide-react'

export default function PricingPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(t)
  }, [toast])

  const faqs = [
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
    <div className="min-h-screen bg-[#F5F3EC]">
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
        <section className="pb-12 pt-16 text-center">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-[#8A8680]">
            SIMPLE PRICING
          </p>
          <h1 className="text-[48px] font-bold leading-tight text-[#2A2A2A] md:text-[56px]">
            One plan. Unlimited style.
          </h1>
          <p className="mt-3 text-[18px] text-[#4E4E4E]">
            Start free, upgrade when you&apos;re ready. No hidden fees. Cancel anytime.
          </p>
        </section>

        <section className="mx-auto grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E3DDCF] bg-white p-8">
            <h2 className="text-[28px] font-bold text-[#2A2A2A]">Free</h2>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[48px] font-bold leading-none text-[#2A2A2A]">
                ₹0
              </span>
              <span className="text-[16px] text-[#8A8680]">/forever</span>
            </div>
            <div className="my-6 border-t border-[#E3DDCF]" />
            <ul className="space-y-3 text-sm">
              {[
                'Upload up to 50 wardrobe items',
                '10 outfit suggestions',
                'Save your favourite looks',
                'AI-powered styling',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-[#2A2A2A]">
                  <Check className="h-4 w-4" />
                  {item}
                </li>
              ))}
              <li className="flex items-center gap-2 text-[#8A8680] line-through">
                <X className="h-4 w-4" />
                Unlimited suggestions
              </li>
              <li className="flex items-center gap-2 text-[#8A8680] line-through">
                <X className="h-4 w-4" />
                Unlimited wardrobe
              </li>
            </ul>
            <button
              type="button"
              className="mt-6 w-full cursor-default rounded-full border border-[#E3DDCF] py-3 text-[#8A8680]"
            >
              Current plan
            </button>
          </div>

          <div className="relative rounded-2xl border-2 border-[#2A2A2A] bg-[#2A2A2A] p-8">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#E3DDCF] px-4 py-1.5 text-xs font-bold text-[#2A2A2A]">
              Most popular
            </span>
            <h2 className="text-[28px] font-bold text-white">Pro</h2>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[48px] font-bold leading-none text-white">
                ₹299
              </span>
              <span className="text-[16px] text-[#8A8680]">/month</span>
            </div>
            <p className="mt-1 text-[13px] text-[#8A8680]">
              Billed monthly. Cancel anytime.
            </p>
            <div className="my-6 border-t border-white/10" />
            <ul className="space-y-3 text-sm text-white">
              {[
                'Everything in Free',
                'Unlimited wardrobe items',
                'Unlimited outfit suggestions',
                'Save unlimited looks',
                'New features first',
                'Priority support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                setToast(
                  "Coming soon! We'll notify you when payments are live."
                )
              }
              className="mt-6 w-full rounded-full bg-white py-4 text-base font-bold text-[#2A2A2A] transition-colors hover:bg-[#E3DDCF]"
            >
              Upgrade to Pro →
            </button>
            <p className="mt-3 text-center text-[12px] text-[#8A8680]">
              🔒 Secure payment · Cancel anytime
            </p>
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

        <section className="mx-auto max-w-2xl py-12">
          <h2 className="mb-8 text-center text-[32px] font-bold text-[#2A2A2A]">
            Frequently asked questions
          </h2>
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
        </section>

        <section className="mb-8 py-12">
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#E3DDCF] bg-white p-8 text-center md:p-12">
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
    </div>
  )
}


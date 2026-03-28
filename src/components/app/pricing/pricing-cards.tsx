'use client'

import { Button } from '@/components/button'

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
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
  )
}

export function PricingCards({
  plan,
  onUpgradePro,
}: {
  plan: 'free' | 'pro'
  onUpgradePro: () => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <section className="rounded-2xl border border-[#1C1C1C]/[0.08] bg-white/90 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-[#1C1C1C]">Free</h2>
        <p className="mt-2 text-sm font-semibold text-[#1C1C1C]/60">
          ₹0 / forever
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 text-[#1C1C1C]" />
            <p className="text-sm text-[#1C1C1C]/70">
              Up to 50 wardrobe items
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 text-[#1C1C1C]" />
            <p className="text-sm text-[#1C1C1C]/70">10 outfit suggestions</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 text-[#1C1C1C]" />
            <p className="text-sm text-[#1C1C1C]/70">Save outfits</p>
          </div>
          <div className="flex items-start gap-2 opacity-60">
            <XIcon className="mt-0.5 text-[#1C1C1C]/40" />
            <p className="text-sm text-[#1C1C1C]/60 line-through">
              Unlimited suggestions
            </p>
          </div>
          <div className="flex items-start gap-2 opacity-60">
            <XIcon className="mt-0.5 text-[#1C1C1C]/40" />
            <p className="text-sm text-[#1C1C1C]/60 line-through">
              Unlimited wardrobe
            </p>
          </div>
        </div>

        <Button
          type="button"
          disabled={plan === 'free'}
          variant="outline"
          className="mt-6 w-full rounded-xl border-[#1C1C1C]/15 text-[#1C1C1C]"
          onClick={() => onUpgradePro()}
        >
          {plan === 'free' ? 'Current plan' : 'Upgrade to Pro →'}
        </Button>
      </section>

      <section className="relative rounded-2xl border-2 border-[#E8724A] bg-white/90 p-5 shadow-sm">
        <div className="absolute left-1/2 -top-3 -translate-x-1/2 rounded-full bg-[#E8724A] px-4 py-1 text-xs font-bold text-white shadow-sm">
          Most popular
        </div>

        <h2 className="text-xl font-bold text-[#1C1C1C]">Pro</h2>
        <p className="mt-2 text-sm font-semibold text-[#1C1C1C]/60">
          ₹299 / month
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 text-[#1C1C1C]" />
            <p className="text-sm text-[#1C1C1C]/70">
              Unlimited wardrobe items
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 text-[#1C1C1C]" />
            <p className="text-sm text-[#1C1C1C]/70">Unlimited suggestions</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 text-[#1C1C1C]" />
            <p className="text-sm text-[#1C1C1C]/70">Save outfits</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 text-[#1C1C1C]" />
            <p className="text-sm text-[#1C1C1C]/70">Priority support</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 text-[#1C1C1C]" />
            <p className="text-sm text-[#1C1C1C]/70">New features first</p>
          </div>
        </div>

        <Button
          type="button"
          className="mt-6 w-full rounded-xl bg-[#E8724A] text-white shadow-md hover:bg-[#d4633e]"
          onClick={() => onUpgradePro()}
        >
          Upgrade to Pro →
        </Button>

        {plan === 'pro' ? (
          <p className="mt-3 text-center text-xs font-semibold text-[#1C1C1C]/55">
            You’re on Pro already.
          </p>
        ) : null}
      </section>
    </div>
  )
}


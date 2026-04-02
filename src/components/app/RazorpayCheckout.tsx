'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RazorpayCheckoutProps {
  plan: 'pro' | 'premium'
  billing: 'monthly' | 'yearly'
  userEmail: string
  userName?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayCheckout({
  plan,
  billing,
  userEmail,
  userName,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null)

  const prices: Record<string, number> = {
    'pro-monthly': 199,
    'pro-yearly': 1910,
    'premium-monthly': 399,
    'premium-yearly': 3830,
  }

  const price =
    prices[`${plan}-${billing}` as keyof typeof prices] ?? 0

  const planLabel = plan === 'pro' ? 'Style Bestie' : 'Wardrobe Goals'

  useEffect(() => {
    // Optional: if we already have a Razorpay key in memory, keep using it.
    // (The actual key is provided by the server when creating subscription.)
    if (razorpayKeyId) return
  }, [razorpayKeyId])

  async function ensureRazorpayLoaded() {
    if (typeof window === 'undefined') return
    if (window.Razorpay) return

    await new Promise<void>((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      document.body.appendChild(script)
    })
  }

  async function handleCheckout() {
    setLoading(true)
    try {
      if (!userEmail) {
        alert('Please log in to upgrade your plan.')
        return
      }

      await ensureRazorpayLoaded()
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load')
      }

      // Create subscription
      const res = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) {
        throw new Error(json.error ?? 'Failed to create subscription')
      }

      const { subscription_id, key_id } = json as {
        subscription_id: string
        key_id: string
      }

      setRazorpayKeyId(key_id)

      const rzp = new window.Razorpay({
        key: key_id,
        subscription_id,
        name: 'StyleMyLook',
        description: `${planLabel} — ${billing === 'yearly' ? 'Yearly' : 'Monthly'} Plan`,
        image: '/logo.svg',
        prefill: {
          email: userEmail,
          name: userName ?? '',
        },
        theme: {
          color: '#2A2A2A',
        },
        handler: function () {
          router.push('/profile?upgraded=true')
          router.refresh()
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      })

      rzp.open()
    } catch (err: any) {
      console.error('Checkout error:', err)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || !userEmail}
      className="w-full rounded-full bg-white py-4 font-bold text-base text-[#2A2A2A] transition-colors hover:bg-[#E3DDCF] disabled:opacity-60 disabled:hover:bg-white"
    >
      {loading
        ? 'Opening payment…'
        : `Upgrade to ${planLabel} — ₹${price.toLocaleString('en-IN')}${billing === 'monthly' ? '/mo' : '/yr'} →`}
    </button>
  )
}


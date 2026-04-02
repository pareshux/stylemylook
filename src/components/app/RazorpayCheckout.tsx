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

  const prices: Record<string, number> = {
    'pro-monthly': 199,
    'pro-yearly': 1910,
    'premium-monthly': 399,
    'premium-yearly': 3830,
  }

  const price =
    prices[`${plan}-${billing}` as keyof typeof prices] ?? 0

  const planLabels: Record<string, string> = {
    pro: 'Style Bestie',
    premium: 'Wardrobe Goals',
  }
  const planLabel = planLabels[plan] ?? plan

  useEffect(() => {
    console.log('RazorpayCheckout mounted:', {
      plan,
      billing,
      userEmailPresent: Boolean(userEmail),
      userName,
    })
  }, [plan, billing, userEmail, userName])

  async function handleCheckout() {
    console.log('Checkout clicked:', { plan, billing, userEmail, userName })
    if (!userEmail) console.log('No email — proceeding to API auth')

    setLoading(true)

    try {
      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () =>
            reject(new Error('Failed to load Razorpay checkout script'))
          document.body.appendChild(script)
        })
      }

      // Create subscription
      const res = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing }),
      })

      const data = await res.json()
      const { subscription_id, key_id, error } = data as {
        subscription_id?: string
        key_id?: string
        error?: string
      }

      if (error) throw new Error(error)
      if (!subscription_id || !key_id) {
        throw new Error('Missing Razorpay subscription/key id')
      }

      const rzp = new window.Razorpay({
        key: key_id,
        subscription_id,
        name: 'StyleMyLook',
        description: `${planLabel} — ${billing === 'yearly' ? 'Yearly' : 'Monthly'} Plan`,
        image: '/logo.svg',
        prefill: {
          email: userEmail,
          name: userName || '',
        },
        theme: {
          color: '#2A2A2A',
        },
        handler: function () {
          // Webhook will update DB; we refresh UI after returning.
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
      alert('Something went wrong: ' + (err?.message ?? 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const buttonClass =
    plan === 'pro'
      ? 'w-full bg-white text-[#2A2A2A] rounded-full py-4 font-bold text-base hover:bg-[#E3DDCF] transition-colors disabled:opacity-60'
      : 'w-full bg-[#2A2A2A] text-white rounded-full py-3 font-bold text-base hover:bg-[#404040] transition-colors disabled:opacity-60'

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={buttonClass}
    >
      {loading
        ? 'Opening payment...'
        : `Upgrade to ${planLabel} — ₹${price.toLocaleString('en-IN')}${billing === 'monthly' ? '/mo' : '/yr'} →`}
    </button>
  )
}


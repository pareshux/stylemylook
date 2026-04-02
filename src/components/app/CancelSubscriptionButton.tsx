'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CancelSubscriptionButton() {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/cancel', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (data.success) {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="mb-1 text-sm font-medium text-red-700">
          Cancel your subscription?
        </p>
        <p className="mb-3 text-xs text-red-600">
          You'll keep access until your current billing period ends. No refunds for
          partial months.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 rounded-full bg-red-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Cancelling…' : 'Yes, cancel'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="flex-1 rounded-full border border-[#E3DDCF] py-2 text-sm font-medium text-[#2A2A2A]"
          >
            Keep plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="w-full py-2 text-sm font-medium text-[#8A8680] underline underline-offset-2 transition-colors hover:text-red-500"
    >
      Cancel subscription
    </button>
  )
}


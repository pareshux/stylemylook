'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Reading your wardrobe...',
  'Analysing colours and styles...',
  'Matching pieces together...',
  'Adding finishing touches...',
  'Almost ready...',
] as const

const STRIP = [
  '👗',
  '👠',
  '👜',
  '🧥',
  '💍',
  '👒',
  '🧣',
  '👔',
  '👟',
  '💎',
] as const

export function AILoadingState({ event }: { event: string }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const msgTimer = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 1800)
    const dotTimer = window.setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`))
    }, 400)
    return () => {
      window.clearInterval(msgTimer)
      window.clearInterval(dotTimer)
    }
  }, [])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="relative mb-8 h-24 w-24">
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-[#E3DDCF]"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute inset-2 animate-spin rounded-full border-2 border-[#2A2A2A]/10"
          style={{ animationDuration: '4s', animationDirection: 'reverse' }}
        />
        <div className="absolute inset-4 flex animate-pulse items-center justify-center rounded-full bg-[#2A2A2A]">
          <span className="text-xl text-white">✨</span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[#2A2A2A]">
          Styling your {event} look
        </h2>
        <div className="flex h-6 items-center justify-center">
          <p className="text-base text-[#4E4E4E] transition-all duration-500">
            {MESSAGES[messageIndex]}
            {dots}
          </p>
        </div>
      </div>

      <div className="mt-10 w-full max-w-sm overflow-hidden">
        <div className="animate-marquee flex w-max gap-2">
          {[...STRIP, ...STRIP].map((emoji, i) => (
            <div
              key={`${emoji}-${i}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E3DDCF] text-xl"
              style={{ animationDelay: `${(i % STRIP.length) * 0.1}s` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-[#8A8680]">This usually takes 10–15 seconds</p>
    </div>
  )
}

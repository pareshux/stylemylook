'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Reading your wardrobe',
  'Analysing colours and styles',
  'Matching pieces together',
  'Adding the finishing touches',
  'Almost ready',
] as const

export function AILoadingState({ event }: { event: string }) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="relative mb-10 h-32 w-32">
        <style>
          {`
          @keyframes siri-blob-1 {
            0%, 100% { transform: scale(1) translate(0, 0); }
            33% { transform: scale(1.15) translate(8px, -8px); }
            66% { transform: scale(0.9) translate(-6px, 6px); }
          }
          @keyframes siri-blob-2 {
            0%, 100% { transform: scale(1) translate(0, 0); }
            33% { transform: scale(0.9) translate(-8px, 8px); }
            66% { transform: scale(1.1) translate(6px, -4px); }
          }
          @keyframes siri-blob-3 {
            0%, 100% { transform: scale(1) translate(0, 0); }
            33% { transform: scale(1.1) translate(4px, 6px); }
            66% { transform: scale(0.95) translate(-4px, -8px); }
          }
          @keyframes siri-pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
        `}
        </style>

        <div
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background:
              'radial-gradient(circle at 40% 40%, #C4B8A8, #8A8680)',
            animation: 'siri-blob-1 3s ease-in-out infinite',
            filter: 'blur(2px)',
          }}
        />
        <div
          className="absolute inset-2 rounded-full opacity-50"
          style={{
            background:
              'radial-gradient(circle at 60% 30%, #E3DDCF, #A8A49E)',
            animation: 'siri-blob-2 3.5s ease-in-out infinite 0.5s',
            filter: 'blur(3px)',
          }}
        />
        <div
          className="absolute inset-4 rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(circle at 50% 60%, #2A2A2A, #4E4E4E)',
            animation: 'siri-blob-3 2.8s ease-in-out infinite 1s',
            filter: 'blur(1px)',
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: 'siri-pulse 2s ease-in-out infinite' }}
        >
          <span className="text-2xl">✨</span>
        </div>
      </div>

      <div className="mb-10 text-center">
        <h2 className="mb-3 text-2xl font-bold text-[#2A2A2A] md:text-3xl">
          Styling your {event} look
        </h2>
        <div className="h-7 overflow-hidden">
          <p
            key={messageIndex}
            className="text-base text-[#4E4E4E]"
            style={{ animation: 'fadeInUp 0.4s ease-out' }}
          >
            {MESSAGES[messageIndex]}...
          </p>
        </div>
      </div>

      <div className="relative w-full max-w-xs overflow-hidden">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12"
          style={{ background: 'linear-gradient(to right, #F5F3EC, transparent)' }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12"
          style={{ background: 'linear-gradient(to left, #F5F3EC, transparent)' }}
        />
        <div className="animate-marquee flex gap-3 py-1">
          {[
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
            '🥿',
            '👛',
            '🌂',
            '⌚',
            '🕶️',
            '👗',
            '👠',
            '👜',
            '🧥',
            '💍',
          ].map((emoji, i) => (
            <div
              key={`${emoji}-${i}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3DDCF] text-lg shadow-sm"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-[#8A8680]">Usually takes 10–15 seconds</p>
    </div>
  )
}


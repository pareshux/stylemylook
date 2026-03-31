'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LiveCounter } from '@/components/ui/LiveCounter'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  Camera,
  Check,
  Heart,
  MapPin,
  ShoppingBag,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
  viewport: { once: true, margin: '-40px' },
}

const STYLEMYLOOK_LOGO_URL =
  'https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/stylemylook_logo.svg'

const INSTAGRAM_URL = 'https://www.instagram.com/stylemylookai'

const sectionPx = 'px-4 md:px-8'

type WaitlistResponseJson = {
  success?: boolean
  error?: string
  message?: string
}

function requestWaitlistConfirm(email: string) {
  void fetch('/api/waitlist-confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).catch((err) => console.error('waitlist-confirm:', err))
}

async function postWaitlist(
  email: string
): Promise<{ ok: true; message?: string } | { ok: false; error: string }> {
  const res = await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  let data: WaitlistResponseJson = {}
  try {
    data = (await res.json()) as WaitlistResponseJson
  } catch (parseErr) {
    console.error('Waitlist JSON parse error:', parseErr)
  }

  console.log('Waitlist response:', res.status, data)

  if (!res.ok) {
    console.error('Waitlist request failed:', res.status, data)
    const msg =
      typeof data.error === 'string'
        ? data.error
        : `Request failed (${res.status})`
    return { ok: false, error: msg }
  }

  if (data.success === false) {
    console.error('Waitlist rejected:', data)
    return {
      ok: false,
      error: data.error ?? 'Something went wrong. Try again.',
    }
  }

  if (data.success === true) {
    return {
      ok: true,
      message: typeof data.message === 'string' ? data.message : undefined,
    }
  }

  return { ok: false, error: 'Unexpected response from server' }
}

function WaitlistSuccessView({ email }: { email: string }) {
  return (
    <div className="flex w-full max-w-full flex-col items-center text-center md:max-w-[700px]">
      <p className="mb-4 text-5xl leading-none" aria-hidden>
        🎉
      </p>
      <h3 className="mb-3 text-[26px] font-semibold leading-tight text-text-primary md:text-3xl">
        You&apos;re on the list!
      </h3>
      <p className="mb-6 max-w-lg text-[17px] font-normal leading-relaxed text-text-primary md:text-lg">
        We&apos;ll email you at{' '}
        <span className="font-medium break-all">{email}</span> when early
        access opens. Keep an eye on your inbox!
      </p>
      <p className="mb-4 text-sm text-[#5A5A5A]">
        P.S. Follow us on Instagram for sneak peeks 👀
      </p>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[15px] font-medium text-text-primary underline underline-offset-4 hover:text-[#1a1a1a]"
      >
        Follow us on Instagram
      </a>
    </div>
  )
}

function HeroWaitlistForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [signedUpEmail, setSignedUpEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const submitted = email.trim()
    try {
      const result = await postWaitlist(submitted)
      if (!result.ok) {
        setError(result.error)
        return
      }
      requestWaitlistConfirm(submitted.toLowerCase())
      setSignedUpEmail(submitted)
      setDone(true)
    } catch (err) {
      console.error('Waitlist fetch error:', err)
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return <WaitlistSuccessView email={signedUpEmail} />
  }

  return (
    <div className="flex w-full max-w-full flex-col items-center md:max-w-[700px]">
      <form onSubmit={onSubmit} className="w-full">
        <div
          className={
            'flex w-full max-w-full flex-col gap-2 rounded-[20px] border border-[rgba(42,42,42,0.12)] bg-white p-3 sm:h-20 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-0 sm:pl-0 md:max-w-[700px]'
          }
        >
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[52px] w-full flex-1 border-0 border-b border-[rgba(42,42,42,0.1)] bg-transparent px-4 text-[18px] text-text-primary placeholder:text-[#9A9A9A] focus:outline-none sm:h-20 sm:border-b-0 sm:pl-8 sm:pr-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#2A2A2A] px-7 text-base font-semibold text-white transition-colors hover:bg-[#404040] disabled:opacity-60 sm:mr-2 sm:mt-0 sm:mb-0 sm:h-[68px] sm:w-auto"
          >
            {loading ? 'Joining...' : 'Get early access →'}
          </button>
        </div>
      </form>
      {error ? (
        <p className="mt-2 text-center text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  )
}

function CtaWaitlistForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [signedUpEmail, setSignedUpEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const submitted = email.trim()
    try {
      const result = await postWaitlist(submitted)
      if (!result.ok) {
        setError(result.error)
        return
      }
      requestWaitlistConfirm(submitted.toLowerCase())
      setSignedUpEmail(submitted)
      setDone(true)
    } catch (err) {
      console.error('Waitlist fetch error:', err)
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return <WaitlistSuccessView email={signedUpEmail} />
  }

  return (
    <div className="flex w-full max-w-full flex-col items-center md:max-w-[700px]">
      <form onSubmit={onSubmit} className="w-full">
        <div className="flex w-full max-w-full flex-col gap-2 rounded-[20px] border border-[rgba(42,42,42,0.12)] bg-white p-3 sm:h-[72px] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-0 sm:pl-0 md:max-w-[700px]">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[52px] w-full flex-1 border-0 border-b border-[rgba(42,42,42,0.1)] bg-transparent px-4 text-[18px] text-text-primary placeholder:text-[#9A9A9A] focus:outline-none sm:h-[72px] sm:border-b-0 sm:pl-8 sm:pr-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#2A2A2A] px-7 text-base font-semibold text-white transition-colors hover:bg-[#404040] disabled:opacity-60 sm:mb-0 sm:mr-2 sm:mt-0 sm:w-auto"
          >
            {loading ? 'Joining...' : 'Get early access →'}
          </button>
        </div>
      </form>
      {error ? (
        <p className="mt-2 text-center text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  )
}

function HeroVideo() {
  const [playing, setPlaying] = useState(false)

  const shellClass =
    'relative mt-[36px] h-[220px] w-full max-w-[1280px] overflow-hidden rounded-[24px] bg-[#C8C4BC] md:h-[560px]'

  if (playing) {
    return (
      <div className={shellClass}>
        <iframe
          title="Style My Look demo"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={`${shellClass} flex cursor-pointer flex-col items-center justify-center text-center transition-opacity hover:opacity-95`}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2A2A2A]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path d="M8 5v14l11-7L8 5z" fill="white" />
        </svg>
      </span>
      <p className="mt-4 px-4 text-center text-[24px] font-medium leading-[32px] text-text-primary">
        Watch StyleMyLook style a
        <br />
        party outfit in 30 seconds →
      </p>
    </button>
  )
}

const mockupShell =
  'overflow-hidden rounded-2xl border border-[#E3DDCF] bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg'

type StickyStepProps = {
  index: number
  title: string
  body: string
  tags: React.ReactNode
  mockup: React.ReactNode
}

const accessoryChips = {
  'Boho Festival': ['Ankle boots', 'Woven bag'],
  'Playful Coquette': ['Ballet flats', 'Pearl necklace'],
  'Clean Minimal': ['White sneakers', 'Minimal watch'],
} as const

const clothingItems = [
  {
    url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=80',
    label: 'Jacket',
  },
  {
    url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=200&q=80',
    label: 'Shirt',
  },
  {
    url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=200&q=80',
    label: 'Dress',
  },
  {
    url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80',
    label: 'Jeans',
  },
  {
    url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&q=80',
    label: 'Sneakers',
  },
  {
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80',
    label: 'Bag',
  },
]

const outfitCards = [
  {
    name: 'Boho Festival',
    match: '● 94% match',
    matchClass: 'text-green-600',
    topPick: true,
    images: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=150&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=150&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=150&q=80',
      null,
    ],
  },
  {
    name: 'Playful Coquette',
    match: '● 89% match',
    matchClass: 'text-amber-600',
    topPick: false,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=150&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=150&q=80',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&q=80',
      null,
    ],
  },
  {
    name: 'Clean Minimal',
    match: '● 84% match',
    matchClass: 'text-amber-600',
    topPick: false,
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=150&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=150&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=150&q=80',
      null,
    ],
  },
] as const

function AnimatedUploadMockup() {
  const [phase, setPhase] = useState(0)
  const [visibleItems, setVisibleItems] = useState(0)

  useEffect(() => {
    let cancelled = false

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), ms)
      })

    const sequence = async () => {
      setPhase(0)
      setVisibleItems(0)
      await delay(800)
      if (cancelled) return
      setPhase(1)
      await delay(800)
      if (cancelled) return
      setPhase(2)
      for (let i = 1; i <= 6; i += 1) {
        await delay(300)
        if (cancelled) return
        setVisibleItems(i)
      }
      await delay(600)
      if (cancelled) return
      setPhase(3)
      await delay(1500)
    }

    void sequence()
    const loop = setInterval(() => {
      void sequence()
    }, 7000)

    return () => {
      cancelled = true
      clearInterval(loop)
    }
  }, [])

  return (
    <div className={`${mockupShell} relative`}>
      <div className="flex items-center justify-between bg-[#F5F3EC] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
          <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
          <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
        </div>
        <span className="text-[10px] font-bold tracking-widest text-[#8A8680]">
          MY WARDROBE
        </span>
        <span className="text-[11px] text-[#8A8680]">
          {visibleItems} items
        </span>
      </div>

      {phase === 3 ? (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="absolute right-2 top-2 z-10 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white"
        >
          ✓ 6 items added
        </motion.div>
      ) : null}

      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {clothingItems.map((item, i) => {
            const isVisible = visibleItems >= i + 1
            return (
              <div
                key={item.label}
                className="relative aspect-square overflow-hidden rounded-xl"
              >
                {isVisible ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    src={item.url}
                    alt={item.label}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full animate-pulse bg-[#E3DDCF]" />
                )}
              </div>
            )
          })}
        </div>
        <div
          className={`mt-3 flex items-center justify-center rounded-xl border-2 border-dashed py-3 text-center transition-all ${
            phase === 1
              ? 'scale-[1.02] border-[#2A2A2A] bg-[#F5F3EC]'
              : 'border-[#E3DDCF] bg-transparent'
          }`}
        >
          <Upload className="size-4 text-[#8A8680]" aria-hidden />
          <span className="ml-2 text-[12px] text-[#8A8680]">Add more photos</span>
        </div>
      </div>
    </div>
  )
}

function AnimatedOutfitMockup() {
  const [phase, setPhase] = useState(0)
  const [visibleCards, setVisibleCards] = useState(0)

  useEffect(() => {
    let cancelled = false
    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), ms)
      })

    const sequence = async () => {
      setPhase(0)
      setVisibleCards(0)
      await delay(1500)
      if (cancelled) return
      setPhase(1)
      setVisibleCards(1)
      await delay(150)
      if (cancelled) return
      setVisibleCards(2)
      await delay(150)
      if (cancelled) return
      setVisibleCards(3)
      await delay(2200)
      if (cancelled) return
      setPhase(2)
      await delay(3000)
      if (cancelled) return
      setPhase(3)
      await delay(1000)
    }

    void sequence()
    const loop = setInterval(() => {
      void sequence()
    }, 8000)

    return () => {
      cancelled = true
      clearInterval(loop)
    }
  }, [])

  return (
    <div className={mockupShell}>
      <div className="flex items-center justify-between bg-[#F5F3EC] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
          <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
          <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
        </div>
        <span className="text-[10px] font-bold tracking-widest text-[#8A8680]">
          YOUR OUTFITS
        </span>
        <span className="w-8" aria-hidden />
      </div>

      <div className="p-4">
        {phase === 0 ? (
          <>
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#F5F3EC] p-3 text-[11px] text-[#4E4E4E]">
              <span className="size-2 rounded-full bg-[#2A2A2A] animate-pulse" />
              ✦ AI is styling...
            </div>
            <div className="flex flex-row gap-3 overflow-hidden">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="min-w-0 flex-1 rounded-xl border border-[#E3DDCF] bg-white p-3"
                >
                  <div className="grid grid-cols-2 gap-1.5">
                    {[0, 1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="aspect-square animate-pulse rounded-lg bg-[#E3DDCF]"
                      />
                    ))}
                  </div>
                  <div className="mt-2 h-2 w-3/4 animate-pulse rounded bg-[#E3DDCF]" />
                  <div className="mt-1 h-2 w-1/2 animate-pulse rounded bg-[#E3DDCF]" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-row gap-3 overflow-hidden">
              {outfitCards.map((card, i) =>
                visibleCards >= i + 1 ? (
                  <motion.div
                    key={card.name}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                      delay: i * 0.15,
                    }}
                    className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-[#E3DDCF] bg-white p-3"
                  >
                    {card.topPick ? (
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-[#2A2A2A] px-2 py-0.5 text-[9px] text-white">
                        TOP PICK
                      </span>
                    ) : null}
                    <div className="grid grid-cols-2 gap-1.5">
                      {card.images.map((img, idx) =>
                        img ? (
                          <img
                            key={`${card.name}-${idx}`}
                            src={img}
                            alt=""
                            className="aspect-square w-full rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            key={`${card.name}-${idx}`}
                            className="aspect-square rounded-lg bg-[#E3DDCF]"
                          />
                        )
                      )}
                    </div>
                    <p className="mt-2 truncate text-[11px] font-semibold text-[#2A2A2A]">
                      {card.name}
                    </p>
                    <p className={`text-[10px] ${card.matchClass}`}>{card.match}</p>
                    <div className="mt-2 border-t border-[#E3DDCF] pt-2">
                      <p className="mb-1.5 text-[8px] uppercase tracking-wider text-[#8A8680]">
                        COMPLETE THE LOOK
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(accessoryChips[card.name as keyof typeof accessoryChips] ?? []).map(
                          (chip) => (
                            <a
                              key={chip}
                              href="#"
                              className="flex items-center gap-1 rounded-full border border-[#E3DDCF] bg-[#F5F3EC] px-2 py-1 text-[9px] text-[#4E4E4E] transition-colors hover:border-[#2A2A2A]"
                            >
                              <ShoppingBag size={8} className="text-[#8A8680]" />
                              {chip}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div key={card.name} className="min-w-0 flex-1" />
                )
              )}
            </div>
            <button
              type="button"
              className={`mt-3 rounded-full border border-[#2A2A2A] px-4 py-2 text-[12px] font-medium text-[#2A2A2A] transition hover:bg-[#2A2A2A] hover:text-white ${
                phase === 3 ? 'animate-pulse' : ''
              }`}
            >
              ↻ Suggest new looks
            </button>
            <p className="mt-1.5 flex items-center justify-center gap-1 text-center text-[10px] text-[#8A8680]">
              <span>✨</span> Includes Google Shopping links to complete your look
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function StickyStep({ index, title, body, tags, mockup }: StickyStepProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [40, 0, 0, -40])
  const mockupY = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [80, 0, 0, -40]
  )
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.94, 1, 1, 0.94]
  )

  return (
    <div
      ref={ref}
      className="relative flex min-h-[50vh] items-center py-8 md:min-h-[60vh] md:py-10"
    >
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-start gap-16 px-6 md:grid-cols-2 md:px-12">
        <motion.div
          style={{ opacity, y: textY }}
          className="space-y-6 md:sticky md:top-32"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]">
            <span className="text-sm font-bold text-white">
              {String(index).padStart(2, '0')}
            </span>
          </div>
          <h3 className="text-[32px] font-bold leading-[1.1] text-[#2A2A2A] md:text-[40px]">
            {title}
          </h3>
          <p className="text-[18px] leading-[1.7] text-[#4E4E4E] md:text-[20px]">
            {body}
          </p>
          <div className="flex flex-wrap gap-2">{tags}</div>
        </motion.div>

        <motion.div style={{ opacity, y: mockupY, scale }}>{mockup}</motion.div>
      </div>
    </div>
  )
}

function HowItWorksProgressDots({
  activeIndex,
}: {
  activeIndex: number
}) {
  return (
    <div className="pointer-events-none fixed right-8 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
      {[0, 1, 2].map((i) => {
        const active = i === activeIndex
        return (
          <div
            key={i}
            className={
              active
                ? 'h-6 w-2 rounded-full bg-[#2A2A2A] transition-all duration-300'
                : 'h-2 w-2 rounded-full bg-[#E3DDCF] transition-all duration-300'
            }
          />
        )
      })}
    </div>
  )
}

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const [activeIndex, setActiveIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const clamped = Math.max(0, Math.min(1, value))
    const index = Math.round(clamped * 2)
    setActiveIndex(index)
  })

  const stepOneMockup = <AnimatedUploadMockup />

  const stepTwoMockup = (
    <div className={mockupShell}>
      <div className="flex items-center justify-between bg-[#F5F3EC] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
          <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
          <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
        </div>
        <span className="text-[10px] font-bold tracking-widest text-[#8A8680]">
          WHERE TO?
        </span>
        <span className="w-8" aria-hidden />
      </div>
      <div className="space-y-2 p-4">
        {[
          {
            emoji: '☕',
            circle: 'bg-[#E8F2EB]',
            title: 'Casual Day Out',
            sub: 'Brunch, errands, coffee',
            selected: false,
          },
          {
            emoji: '💼',
            circle: 'bg-[#F5E6D8]',
            title: 'Work / Business',
            sub: 'Office, meetings',
            selected: true,
          },
          {
            emoji: '🌙',
            circle: 'bg-[#F7E8ED]',
            title: 'Date Night',
            sub: 'Dinner, drinks',
            selected: false,
          },
          {
            emoji: '✈️',
            circle: 'bg-[#E5EFF7]',
            title: 'Travel',
            sub: 'Airport, vacation',
            selected: false,
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
              card.selected
                ? 'border-[#2A2A2A] bg-[#F5F3EC] animate-selected-pulse'
                : 'border-[#E3DDCF] bg-white hover:border-[#2A2A2A]/30 hover:bg-[#F5F3EC]'
            } transition-colors`}
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-base ${card.circle}`}
            >
              {card.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#2A2A2A]">
                {card.title}
              </p>
              <p className="text-[11px] text-[#8A8680]">{card.sub}</p>
            </div>
            {card.selected ? (
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2A2A2A]">
                <Check
                  className="size-3.5 text-white"
                  strokeWidth={3}
                  aria-hidden
                />
              </div>
            ) : (
              <span className="size-6 shrink-0" aria-hidden />
            )}
          </div>
        ))}
        <div className="mt-3">
          <p className="mb-2 text-[11px] text-[#8A8680]">Refine your vibe</p>
          <div className="flex flex-wrap gap-2">
            {['Smart Casual', 'Formal', 'Minimalist', 'Bold'].map((pill, i) => (
              <span
                key={pill}
                className={`rounded-full border border-[#E3DDCF] px-3 py-1 text-[12px] ${
                  i === 0
                    ? 'bg-[#2A2A2A] text-white'
                    : 'bg-white text-[#4E4E4E]'
                }`}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const stepThreeMockup = <AnimatedOutfitMockup />

  const steps: StickyStepProps[] = [
    {
      index: 1,
      title: 'Upload your wardrobe',
      body:
        'Snap or upload photos of everything you own — tops, bottoms, dresses, shoes, bags, accessories. Takes about 10 minutes once. AI reads each item automatically.',
      tags: (
        <>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
            <Camera className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
            Camera ready
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
            <Zap className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
            Auto-tagged by AI
          </span>
        </>
      ),
      mockup: stepOneMockup,
    },
    {
      index: 2,
      title: "Tell us where you're going",
      body:
        'Party? Work meeting? Dinner date? Festival? Just tap your event and the AI takes it from there — no lengthy questionnaires, no style quizzes.',
      tags: (
        <>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
            <MapPin className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
            Context-aware
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
            <Heart className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
            Vibe matching
          </span>
        </>
      ),
      mockup: stepTwoMockup,
    },
    {
      index: 3,
      title: 'Get 3 complete looks — instantly',
      body:
        "AI builds outfits from clothes you already own, then tells you exactly what to add to complete the look — with direct links to shop it on Google.",
      tags: (
        <>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
            <Sparkles
              className="size-3.5 shrink-0 text-[#4E4E4E]"
              aria-hidden
            />
            AI-powered styling
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
            <ShoppingBag
              className="size-3.5 shrink-0 text-[#4E4E4E]"
              aria-hidden
            />
            Shop what&apos;s missing
          </span>
        </>
      ),
      mockup: stepThreeMockup,
    },
  ]

  return (
    <section ref={sectionRef} className="bg-[#F5F3EC] pt-10 pb-12 md:pt-14 md:pb-16">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <header className="pb-4 text-center md:pb-6">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[3px] text-[#8A8680]">
            HOW IT WORKS
          </p>
          <h2
            className="mb-3 text-[32px] font-bold leading-tight text-[#2A2A2A] md:text-[40px] lg:text-[48px]"
            style={{ maxWidth: '640px', margin: '0 auto 12px' }}
          >
            From wardrobe to outfit in
            <br />
            3 easy steps
          </h2>
          <p className="text-lg text-[#4E4E4E] mb-12 md:mb-16 md:text-xl md:whitespace-nowrap">
            AI styles you from clothes you own — then finds what&apos;s missing
            on Google Shopping.
          </p>
        </header>
      </div>

      <div>
        {steps.map((step, idx) => (
          <React.Fragment key={step.index}>
            <StickyStep {...step} />
            {idx < steps.length - 1 ? (
              <div className="mx-auto h-4 w-px bg-[#E3DDCF]" aria-hidden />
            ) : null}
          </React.Fragment>
        ))}
      </div>

      <HowItWorksProgressDots activeIndex={activeIndex} />
    </section>
  )
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-brand-bg text-text-primary">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-[#E3DDCF] bg-white shadow-sm'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div
          className={`relative mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between ${sectionPx}`}
        >
          <img
            src={STYLEMYLOOK_LOGO_URL}
            alt="Style My Look"
            className="relative z-10 h-8 w-auto shrink-0"
          />
          <p className="pointer-events-none absolute left-1/2 top-1/2 hidden max-w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 px-16 text-center text-base font-medium italic text-text-primary md:block">
            ✨ Early access is open, limited spots left
          </p>
          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#4E4E4E] transition-colors hover:text-[#2A2A2A]"
              aria-label="Instagram"
            >
              <span className="hidden md:inline">Stay updated. Follow us on</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </motion.header>

      <main className="pt-14">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`mx-auto flex max-w-[1280px] flex-col items-center pb-12 pt-[60px] text-center ${sectionPx}`}
        >
          <h1 className="mb-6 max-w-[20ch] text-center text-[48px] font-bold leading-[1.05] text-text-primary md:max-w-none md:text-[78px] md:leading-[88px]">
            Outfit crisis? Ab nahi.
          </h1>
          <div className="mb-12 space-y-2 text-center text-[22px] font-normal leading-[30px] text-text-primary md:space-y-0 md:text-[40px] md:leading-[60px]">
            <p>
              Upload your wardrobe, pick your vibe, and let AI do the rest.
            </p>
            <p className="italic">
              Kyunki looking good shouldn&apos;t be this hard.
            </p>
          </div>
          <p className="body-lg mb-6 max-w-[40rem] text-center">
            When we launch publicly, Pro will be ₹299/month. Early access members
            lock in their free months.
          </p>
          <HeroWaitlistForm />
          <div className="mt-3 w-full">
            <LiveCounter />
          </div>
          <HeroVideo />
        </motion.section>

        <HowItWorksSection />

        <motion.section
          {...fadeUp}
          className="mx-auto mb-6 mt-4 w-full max-w-[1280px]"
        >
          <section
            style={{ backgroundColor: 'rgba(176, 173, 166, 0.3)' }}
            className="mx-4 flex min-h-0 flex-col items-center justify-center rounded-3xl border border-[#E3DDCF] px-6 py-16 text-center md:mx-8 md:min-h-[680px] md:px-12 md:py-20"
          >
            <h2 className="mb-6 text-[36px] font-bold leading-tight text-text-primary md:text-[52px] md:leading-[1.15]">
              Join now and get
              <br />
              3 months of Pro free.
            </h2>
            <p className="mb-10 max-w-3xl text-[22px] font-normal leading-[32px] text-text-primary md:mb-16 md:text-[32px] md:leading-[44px]">
              When we launch publicly, Pro will be ₹299/month. Early access
              members lock in their free months. No catch. No auto-charge. Just
              first-mover love.
            </p>
            <CtaWaitlistForm />
          </section>
        </motion.section>
      </main>

      <motion.footer
        {...fadeUp}
        className="border-t border-[rgba(42,42,42,0.1)] bg-brand-bg"
      >
        <div
          className={`mx-auto flex w-full min-w-0 max-w-[1280px] flex-col items-center gap-4 py-8 text-sm text-text-muted md:h-14 md:flex-row md:items-center md:justify-between md:gap-0 md:py-0 md:leading-none ${sectionPx}`}
        >
          <img
            src={STYLEMYLOOK_LOGO_URL}
            alt="Style My Look"
            className="h-8 w-auto shrink-0"
          />
          <p className="min-w-0 flex-1 px-3 text-center md:px-3">
            Made with ❤️ and way too much AI in India 🇮🇳
          </p>
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-1 md:justify-end">
            <Link
              href="/privacy"
              className="hover:text-[#2A2A2A] transition-colors"
            >
              Privacy Policy
            </Link>
            <span aria-hidden> · </span>
            <a href="#" className="hover:text-text-primary">
              Contact Us
            </a>
            <span aria-hidden> · </span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary"
            >
              Instagram
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

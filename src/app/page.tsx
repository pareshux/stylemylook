'use client'

import { LiveCounter } from '@/components/ui/LiveCounter'
import { motion } from 'framer-motion'
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
import { useState } from 'react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
  viewport: { once: true, margin: '-40px' },
}

const STYLEMYLOOK_LOGO_URL =
  'https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/stylemylook_logo.svg'

const INSTAGRAM_URL = 'https://instagram.com'

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

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
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

const stepReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: 'easeOut' },
} as const

const mockupShell =
  'overflow-hidden rounded-2xl border border-[#E3DDCF] bg-white shadow-sm'

function StepConnector() {
  return <div className="mx-auto my-2 h-16 w-px bg-[#E3DDCF]" aria-hidden />
}

function HowItWorksSection() {
  return (
    <section className="bg-[#F5F3EC] py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <header className="mb-20 text-center">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[3px] text-[#8A8680]">
            HOW IT WORKS
          </p>
          <h2 className="mb-4 text-[36px] font-bold leading-[1.15] text-[#2A2A2A] md:text-[52px]">
            From wardrobe to outfit in 3 steps
          </h2>
          <p className="mx-auto max-w-lg text-center text-[18px] font-normal text-[#4E4E4E]">
            No stylist needed. No guesswork. Just AI that actually knows your
            clothes.
          </p>
        </header>

        <motion.div {...stepReveal} className="py-[60px]">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-20">
            <div className="min-w-0">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A] text-[14px] font-bold text-white">
                01
              </div>
              <h3 className="mb-4 text-[36px] font-bold leading-[1.2] text-[#2A2A2A]">
                Upload your wardrobe
              </h3>
              <p className="mb-6 text-[18px] font-normal leading-[1.7] text-[#4E4E4E]">
                Snap or upload photos of everything you own — tops, bottoms,
                dresses, shoes, bags, accessories. Takes about 10 minutes
                once. AI reads each item automatically.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
                  <Camera className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
                  Camera ready
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
                  <Zap className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
                  Auto-tagged by AI
                </span>
              </div>
            </div>
            <div className={mockupShell}>
              <div className="flex items-center justify-between bg-[#F5F3EC] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
                  <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
                  <span className="size-2.5 rounded-full bg-[#E3DDCF]" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-[#8A8680]">
                  MY WARDROBE
                </span>
                <span className="text-[11px] text-[#8A8680]">14 items</span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { bg: '#2D3748', emoji: '🧥' },
                    { bg: '#F7F7F5', emoji: '👔', border: true },
                    { bg: '#D4956A', emoji: '👕' },
                    { bg: '#3B5998', emoji: '👖' },
                    { bg: '#D2B48C', emoji: '👟' },
                    { bg: '#1A1A1A', emoji: '👞' },
                  ].map((cell, i) => (
                    <div
                      key={i}
                      className={`flex aspect-square items-center justify-center rounded-xl text-2xl ${
                        cell.border ? 'border border-[#E3DDCF]' : ''
                      }`}
                      style={{ backgroundColor: cell.bg }}
                    >
                      {cell.emoji}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-center rounded-xl border-2 border-dashed border-[#E3DDCF] py-3 text-center">
                  <Upload className="size-4 text-[#8A8680]" aria-hidden />
                  <span className="ml-2 text-[12px] text-[#8A8680]">
                    Add more photos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <StepConnector />

        <motion.div
          {...stepReveal}
          className="border-t border-[#E3DDCF] py-[60px]"
        >
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-20">
            <div
              className={`${mockupShell} order-2 md:order-1`}
            >
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
                        ? 'border-[#2A2A2A] bg-[#F5F3EC]'
                        : 'border-[#E3DDCF] bg-white'
                    }`}
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
                        <Check className="size-3.5 text-white" strokeWidth={3} aria-hidden />
                      </div>
                    ) : (
                      <span className="size-6 shrink-0" aria-hidden />
                    )}
                  </div>
                ))}
                <div className="mt-3">
                  <p className="mb-2 text-[11px] text-[#8A8680]">
                    Refine your vibe
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Smart Casual', 'Formal', 'Minimalist', 'Bold'].map(
                      (pill, i) => (
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
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-0 order-1 md:order-2">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A] text-[14px] font-bold text-white">
                02
              </div>
              <h3 className="mb-4 text-[36px] font-bold leading-[1.2] text-[#2A2A2A]">
                Tell us where you&apos;re going
              </h3>
              <p className="mb-6 text-[18px] font-normal leading-[1.7] text-[#4E4E4E]">
                Party? Work meeting? Dinner date? Festival? Just tap your event
                and the AI takes it from there — no lengthy questionnaires, no
                style quizzes.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
                  <MapPin className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
                  Context-aware
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
                  <Heart className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
                  Vibe matching
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <StepConnector />

        <motion.div
          {...stepReveal}
          className="border-t border-[#E3DDCF] py-[60px]"
        >
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-20">
            <div className="min-w-0">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A] text-[14px] font-bold text-white">
                03
              </div>
              <h3 className="mb-4 text-[36px] font-bold leading-[1.2] text-[#2A2A2A]">
                Get 3 outfits instantly
              </h3>
              <p className="mb-6 text-[18px] font-normal leading-[1.7] text-[#4E4E4E]">
                AI looks at your actual clothes, reads the occasion, and puts
                together 3 complete outfit combinations — with styling tips and
                accessories to complete the look.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
                  <Sparkles className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
                  AI-powered
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E3DDCF] bg-white px-4 py-2 text-[13px] font-medium text-[#4E4E4E]">
                  <ShoppingBag className="size-3.5 shrink-0 text-[#4E4E4E]" aria-hidden />
                  From your closet
                </span>
              </div>
            </div>
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
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#F5F3EC] p-3">
                  <span className="text-sm text-amber-600" aria-hidden>
                    ✦
                  </span>
                  <div>
                    <p className="text-[12px] font-medium text-[#2A2A2A]">
                      Styled for Work / Business
                    </p>
                    <p className="text-[11px] text-[#8A8680]">
                      3 outfits from your wardrobe
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-[#E3DDCF]">
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-[#2A2A2A] px-2 py-0.5 text-[9px] font-bold text-white">
                    TOP PICK
                  </span>
                  <div className="flex gap-1.5 bg-[#F8F6F3] p-3">
                    {[
                      { e: '🧥', bg: '#2D3748' },
                      { e: '👔', bg: '#F7F7F5' },
                      { e: '👖', bg: '#3B5998' },
                      { e: '👞', bg: '#1A1A1A' },
                    ].map((sq, i) => (
                      <div
                        key={i}
                        className="flex size-8 items-center justify-center rounded-lg text-base"
                        style={{ backgroundColor: sq.bg }}
                      >
                        {sq.e}
                      </div>
                    ))}
                  </div>
                  <div className="p-2">
                    <p className="text-[12px] font-semibold text-[#2A2A2A]">
                      Power Classic
                    </p>
                    <p className="text-[10px] text-green-600">● 96% match</p>
                  </div>
                </div>

                <div className="relative mt-2 overflow-hidden rounded-xl border border-[#E3DDCF]">
                  <div className="flex gap-1.5 bg-[#F8F6F3] p-3">
                    {[
                      { e: '👕', bg: '#D4956A' },
                      { e: '👖', bg: '#3B5998' },
                      { e: '👟', bg: '#D2B48C' },
                    ].map((sq, i) => (
                      <div
                        key={i}
                        className="flex size-8 items-center justify-center rounded-lg text-base"
                        style={{ backgroundColor: sq.bg }}
                      >
                        {sq.e}
                      </div>
                    ))}
                  </div>
                  <div className="p-2">
                    <p className="text-[12px] font-semibold text-[#2A2A2A]">
                      Warm &amp; Easy
                    </p>
                    <p className="text-[10px] text-amber-600">● 88% match</p>
                  </div>
                </div>

                <div className="relative mt-2 overflow-hidden rounded-xl border border-[#E3DDCF]">
                  <div className="flex items-center gap-1.5 bg-[#F8F6F3] p-2">
                    {[
                      { e: '👔', bg: '#F7F7F5' },
                      { e: '👖', bg: '#3B5998' },
                      { e: '👟', bg: '#D2B48C' },
                      { e: '⌚', bg: '#E3DDCF' },
                    ].map((sq, i) => (
                      <div
                        key={i}
                        className="flex size-7 items-center justify-center rounded-lg text-sm"
                        style={{ backgroundColor: sq.bg }}
                      >
                        {sq.e}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <p className="text-[12px] font-semibold text-[#2A2A2A]">
                      Clean Minimal
                    </p>
                    <p className="text-[10px] text-[#4E4E4E]">● 84% match</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-bg text-text-primary">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-[rgba(42,42,42,0.1)] bg-brand-bg"
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
            <span className="hidden text-base font-normal text-text-primary md:inline">
              Stay updated. Follow us on
            </span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary"
              aria-label="Instagram"
            >
              <InstagramGlyph className="h-5 w-5 shrink-0 text-text-primary" />
            </a>
          </div>
        </div>
      </motion.header>

      <main>
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
          className={`mx-auto mb-5 mt-10 max-w-[1280px] ${sectionPx}`}
        >
          <div className="flex min-h-0 w-full flex-col items-center justify-center rounded-[24px] bg-brand-surface p-8 text-center md:min-h-[680px] md:p-16">
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
          </div>
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
            <a href="#" className="hover:text-text-primary">
              Privacy Policy
            </a>
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

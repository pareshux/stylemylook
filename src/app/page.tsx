'use client'

import { LiveCounter } from '@/components/ui/LiveCounter'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

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
      <h3 className="mb-3 text-[26px] font-semibold leading-tight text-[#2A2A2A] md:text-3xl">
        You&apos;re on the list!
      </h3>
      <p className="mb-6 max-w-lg text-[17px] font-normal leading-relaxed text-[#2A2A2A] md:text-lg">
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
        className="text-[15px] font-medium text-[#2A2A2A] underline underline-offset-4 hover:text-[#1a1a1a]"
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
            className="h-[52px] w-full flex-1 border-0 border-b border-[rgba(42,42,42,0.1)] bg-transparent px-4 text-[18px] text-[#2A2A2A] placeholder:text-[#9A9A9A] focus:outline-none sm:h-20 sm:border-b-0 sm:pl-8 sm:pr-2"
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
            className="h-[52px] w-full flex-1 border-0 border-b border-[rgba(42,42,42,0.1)] bg-transparent px-4 text-[18px] text-[#2A2A2A] placeholder:text-[#9A9A9A] focus:outline-none sm:h-[72px] sm:border-b-0 sm:pl-8 sm:pr-2"
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
      <p className="mt-4 px-4 text-center text-[24px] font-medium leading-[32px] text-[#2A2A2A]">
        Watch StyleMyLook style a
        <br />
        party outfit in 30 seconds →
      </p>
    </button>
  )
}

function HowWeSolvedItSection() {
  const stackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ['start start', 'end end'],
  })

  const scale1 = useTransform(scrollYProgress, [0.12, 0.38], [1, 0.97])
  const scale2 = useTransform(scrollYProgress, [0.36, 0.64], [1, 0.97])
  const scale3 = useTransform(scrollYProgress, [0, 1], [1, 1])

  const cardShell =
    'w-full max-w-[1280px] rounded-[24px] bg-white p-6 shadow-[0_4px_40px_rgba(0,0,0,0.06)] md:p-16'
  const rowLayout =
    'flex min-h-0 flex-col items-center gap-8 md:min-h-[520px] md:flex-row md:gap-20'
  const textCol =
    'order-2 flex w-full flex-1 flex-col justify-center gap-4 md:order-1 md:gap-6'
  const textTitle =
    'text-[24px] font-semibold leading-[32px] text-[#2A2A2A] md:text-[32px] md:leading-[44px]'
  const textBody =
    'text-[18px] font-normal leading-[28px] text-[#2A2A2A] md:text-[32px] md:leading-[44px]'
  const illustrationCol =
    'order-1 flex w-full shrink-0 items-center justify-center md:order-2 md:w-[680px] md:max-w-full'
  const illustrationImg =
    'h-auto max-h-[200px] w-full object-contain md:max-h-[460px]'

  return (
    <motion.section
      {...fadeUp}
      className={`mx-auto max-w-[1280px] pb-[60px] pt-[60px] ${sectionPx}`}
    >
      <h2 className="mb-10 text-center text-[36px] font-bold leading-tight text-[#2A2A2A] md:mb-16 md:text-[60px] md:leading-[88px]">
        How we solved it
      </h2>

      <div ref={stackRef} className="relative min-h-[250vh]">
        <div className="relative min-h-[85vh]">
          <motion.div
            className="sticky top-[72px] z-10 w-full md:top-20"
            style={{
              scale: scale1,
              transformOrigin: '50% 0%',
            }}
          >
            <div className={cardShell}>
              <div className={rowLayout}>
                <div className={textCol}>
                  <p className={textTitle}>Upload your wardrobe</p>
                  <p className={textBody}>
                    Open the app and snap photos of everything you own — tops,
                    bottoms, dresses, shoes, jewellery, bags, all of it. Takes
                    about 10 minutes once. Done forever.
                  </p>
                </div>
                <div className={illustrationCol}>
                  <img
                    data-placeholder="how-1"
                    src="https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/illustration_1.png"
                    alt="Upload your wardrobe in the app"
                    className={illustrationImg}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative min-h-[85vh]">
          <motion.div
            className="sticky top-[72px] z-20 w-full md:top-20"
            style={{
              scale: scale2,
              transformOrigin: '50% 0%',
            }}
          >
            <div className={cardShell}>
              <div className={rowLayout}>
                <div className={textCol}>
                  <p className={textTitle}>Tell us where you&apos;re going</p>
                  <p className={textBody}>
                    Party? Work meeting? Dinner date? Festival? Gym? Just tap
                    your event and we&apos;ll take it from here.
                  </p>
                </div>
                <div className={illustrationCol}>
                  <img
                    data-placeholder="how-2"
                    src="https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/illustration_2.png"
                    alt="Choose your event or occasion"
                    className={illustrationImg}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative min-h-[80vh]">
          <motion.div
            className="sticky top-[72px] z-30 w-full md:top-20"
            style={{
              scale: scale3,
              transformOrigin: '50% 0%',
            }}
          >
            <div className={cardShell}>
              <div className={rowLayout}>
                <div className={textCol}>
                  <p className={textTitle}>
                    Get 3 outfit suggestions instantly
                  </p>
                  <p className={textBody}>
                    Our AI looks at your actual clothes and puts together 3
                    complete looks, with styling tips, and even tells you what
                    accessories would make the outfit pop.
                  </p>
                </div>
                <div className={illustrationCol}>
                  <img
                    data-placeholder="how-3"
                    src="https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/illustration_3.png"
                    alt="Three AI outfit suggestions with styling tips"
                    className={illustrationImg}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#EDEAE4] text-[#1C1C1C]">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-[rgba(42,42,42,0.1)] bg-[#EDEAE4]"
      >
        <div
          className={`relative mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between ${sectionPx}`}
        >
          <img
            src={STYLEMYLOOK_LOGO_URL}
            alt="Style My Look"
            className="relative z-10 h-8 w-auto shrink-0"
          />
          <p className="pointer-events-none absolute left-1/2 top-1/2 hidden max-w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 px-16 text-center text-base font-medium italic text-[#2A2A2A] md:block">
            ✨ Early access is open, limited spots left
          </p>
          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <span className="hidden text-base font-normal text-[#2A2A2A] md:inline">
              Stay updated. Follow us on
            </span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2A2A2A]"
              aria-label="Instagram"
            >
              <InstagramGlyph className="h-5 w-5 shrink-0 text-[#2A2A2A]" />
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
          <h1 className="mb-6 max-w-[20ch] text-center text-[48px] font-bold leading-[1.05] text-[#2A2A2A] md:max-w-none md:text-[78px] md:leading-[88px]">
            Outfit crisis? Ab nahi.
          </h1>
          <div className="mb-12 space-y-2 text-center text-[22px] font-normal leading-[30px] text-[#2A2A2A] md:space-y-0 md:text-[40px] md:leading-[60px]">
            <p>
              Upload your wardrobe, pick your vibe, and let AI do the rest.
            </p>
            <p className="italic">
              Kyunki looking good shouldn&apos;t be this hard.
            </p>
          </div>
          <HeroWaitlistForm />
          <div className="mt-3 w-full">
            <LiveCounter />
          </div>
          <HeroVideo />
        </motion.section>

        <motion.section
          {...fadeUp}
          className={`mx-auto max-w-[1280px] pb-[60px] pt-[60px] ${sectionPx}`}
        >
          <h2 className="mb-10 text-center text-[36px] font-bold leading-tight text-[#2A2A2A] md:mb-16 md:text-[60px] md:leading-[88px]">
            Struggle we all have
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            <div className="flex w-full flex-col items-center text-center">
              <img
                data-placeholder="struggle-1"
                src="https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/icon_1.png"
                alt="Last moment panic illustration"
                className="mb-5 h-auto max-h-[220px] w-full max-w-[330px] object-contain md:max-h-[250px]"
              />
              <h3 className="mb-4 text-center text-[32px] font-medium leading-[44px] text-[#2A2A2A]">
                Last moment panic
              </h3>
              <p className="max-w-[320px] text-center text-[20px] font-normal leading-[28px] text-[#2A2A2A]">
                You&apos;re late. You&apos;ve tried on 4 outfits. You hate all
                of them. You go with the black top. Again.
              </p>
            </div>
            <div className="flex w-full flex-col items-center text-center">
              <img
                data-placeholder="struggle-2"
                src="https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/icon_2.png"
                alt="Full wardrobe illustration"
                className="mb-5 h-auto max-h-[220px] w-full max-w-[330px] object-contain md:max-h-[250px]"
              />
              <h3 className="mb-4 text-center text-[32px] font-medium leading-[44px] text-[#2A2A2A]">
                The full-wardrobe
              </h3>
              <p className="max-w-[320px] text-center text-[20px] font-normal leading-[28px] text-[#2A2A2A]">
                You own so many clothes but somehow feel like you have nothing
                to wear. Your wardrobe is basically a storage unit.
              </p>
            </div>
            <div className="flex w-full flex-col items-center text-center">
              <img
                data-placeholder="struggle-3"
                src="https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/icon_3.png"
                alt="Shopping trap illustration"
                className="mb-5 h-auto max-h-[220px] w-full max-w-[330px] object-contain md:max-h-[250px]"
              />
              <h3 className="mb-4 text-center text-[32px] font-medium leading-[44px] text-[#2A2A2A]">
                The shopping trap
              </h3>
              <p className="max-w-[320px] text-center text-[20px] font-normal leading-[28px] text-[#2A2A2A]">
                You keep buying new things hoping it&apos;ll fix it. But real
                problem is you don&apos;t know what you already have.
              </p>
            </div>
          </div>
        </motion.section>

        <HowWeSolvedItSection />

        <motion.section
          {...fadeUp}
          className={`mx-auto mb-5 mt-10 max-w-[1280px] ${sectionPx}`}
        >
          <div className="flex min-h-0 w-full flex-col items-center justify-center rounded-[24px] bg-[#D0CDC7] p-8 text-center md:min-h-[680px] md:p-16">
            <h2 className="mb-6 text-[36px] font-bold leading-tight text-[#2A2A2A] md:text-[52px] md:leading-[1.15]">
              Join now and get
              <br />
              3 months of Pro free.
            </h2>
            <p className="mb-10 max-w-3xl text-[22px] font-normal leading-[32px] text-[#2A2A2A] md:mb-16 md:text-[32px] md:leading-[44px]">
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
        className="border-t border-[rgba(42,42,42,0.1)] bg-[#EDEAE4]"
      >
        <div
          className={`mx-auto flex w-full min-w-0 max-w-[1280px] flex-col items-center gap-4 py-8 text-sm text-[#8A8680] md:h-14 md:flex-row md:items-center md:justify-between md:gap-0 md:py-0 md:leading-none ${sectionPx}`}
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
            <a href="#" className="hover:text-[#1C1C1C]">
              Privacy Policy
            </a>
            <span aria-hidden> · </span>
            <a href="#" className="hover:text-[#1C1C1C]">
              Contact Us
            </a>
            <span aria-hidden> · </span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1C1C1C]"
            >
              Instagram
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

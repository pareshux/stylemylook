'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatAuthError } from '@/lib/auth-errors'
import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { Button } from '@/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const callbackUrl = () =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : ''

function ConfirmContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const supabase = createClient()
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    if (!email) {
      setError('Missing email. Go back to sign up and try again.')
      return
    }
    setError(null)
    setResendMsg(null)
    setResending(true)
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: callbackUrl(),
      },
    })
    setResending(false)
    if (resendError) {
      setError(formatAuthError(resendError))
      return
    }
    setResendMsg('We sent another confirmation email.')
  }

  return (
    <Card className="w-full max-w-sm border-[#1C1C1C]/[0.06] bg-white/90 shadow-[0_8px_30px_rgba(28,28,28,0.06)]">
      <CardHeader className="space-y-4 text-center">
        <div
          className="mx-auto flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#E8724A]/15 via-[#FAF7F2] to-[#C4A574]/20 shadow-inner ring-1 ring-[#1C1C1C]/[0.06]"
          aria-hidden
        >
          <span className="text-5xl">📧</span>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-[0.9375rem] leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-[#1C1C1C]/80">
              {email || 'your inbox'}
            </span>
            . Click it to activate your account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <p className="text-center text-xs leading-relaxed text-[#1C1C1C]/50">
          Didn&apos;t get it? Check your spam folder or resend the email below.
        </p>
        {error ? (
          <p
            className="rounded-xl bg-[#E8724A]/10 px-3 py-2 text-center text-sm text-[#1C1C1C]"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {resendMsg ? (
          <p className="text-center text-sm font-medium text-[#1C1C1C]/70">
            {resendMsg}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-[#1C1C1C]/12 font-semibold"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? 'Sending…' : 'Resend confirmation email'}
        </Button>
        <p className="text-center text-sm text-[#1C1C1C]/55">
          <Link href="/login" className="font-semibold text-[#E8724A] hover:underline">
            Back to log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

function ConfirmFallback() {
  return (
    <Card className="w-full max-w-sm border-[#1C1C1C]/[0.06] bg-white/90 p-10 text-center text-sm text-[#1C1C1C]/50">
      Loading…
    </Card>
  )
}

export default function AuthConfirmPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<ConfirmFallback />}>
        <ConfirmContent />
      </Suspense>
    </AuthPageShell>
  )
}

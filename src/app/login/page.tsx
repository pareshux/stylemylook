'use client'

import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatAuthError } from '@/lib/auth-errors'
import { AuthPageShell } from '@/components/auth/auth-page-shell'
import { FacebookIcon, GoogleIcon } from '@/components/auth/oauth-icons'
import { PasswordField } from '@/components/auth/password-field'
import { Button } from '@/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const callbackUrl = () =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : ''

export default function LoginPage() {
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(
    null
  )
  const [forgotSent, setForgotSent] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'auth') {
      setError('Could not complete sign in. Please try again.')
    }
  }, [])

  async function signInWithOAuth(provider: 'google' | 'facebook') {
    setError(null)
    setOauthLoading(provider)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl() },
    })
    setOauthLoading(null)
    if (oauthError) setError(formatAuthError(oauthError))
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (signError) {
      setError(formatAuthError(signError))
      return
    }
    window.location.href = '/home'
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: callbackUrl() }
    )
    setLoading(false)
    if (resetError) {
      setError(formatAuthError(resetError))
      return
    }
    setForgotSent(true)
  }

  const busy = loading || oauthLoading !== null

  return (
    <AuthPageShell>
      <Card className="w-full max-w-sm border-[#1C1C1C]/[0.06] bg-white/90 shadow-[0_8px_30px_rgba(28,28,28,0.06)]">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-1 text-4xl" aria-hidden>
            👗
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Reset password'}
          </CardTitle>
          <CardDescription className="text-[0.9375rem]">
            {mode === 'login'
              ? 'Sign in to StyleAI to continue styling your wardrobe.'
              : 'Enter your email and we’ll send you a reset link.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
          {mode === 'login' && !forgotSent ? (
            <>
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl border-[#1C1C1C]/12 bg-white font-semibold"
                  disabled={busy}
                  onClick={() => signInWithOAuth('google')}
                >
                  <GoogleIcon />
                  {oauthLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl border-[#1C1C1C]/12 bg-white font-semibold"
                  disabled={busy}
                  onClick={() => signInWithOAuth('facebook')}
                >
                  <FacebookIcon />
                  {oauthLoading === 'facebook'
                    ? 'Connecting…'
                    : 'Continue with Facebook'}
                </Button>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1C1C1C]/40">
                <span className="h-px flex-1 bg-[#1C1C1C]/10" />
                or continue with email
                <span className="h-px flex-1 bg-[#1C1C1C]/10" />
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                {error ? (
                  <p
                    className="rounded-xl bg-[#E8724A]/10 px-3 py-2 text-center text-sm text-[#1C1C1C]"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                    disabled={busy}
                    className="h-11 rounded-xl"
                  />
                </div>
                <PasswordField
                  id="login-password"
                  label="Password"
                  labelRight={
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot')
                        setError(null)
                      }}
                      className="text-xs font-medium text-[#E8724A] hover:underline"
                    >
                      Forgot password?
                    </button>
                  }
                  autoComplete="current-password"
                  value={password}
                  onChange={setPassword}
                  disabled={busy}
                />
                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl"
                  disabled={busy}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <p className="text-center text-sm text-[#1C1C1C]/55">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-[#E8724A] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </>
          ) : mode === 'forgot' && !forgotSent ? (
            <>
              <form onSubmit={handleForgot} className="space-y-4">
                {error ? (
                  <p
                    className="rounded-xl bg-[#E8724A]/10 px-3 py-2 text-center text-sm text-[#1C1C1C]"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                    disabled={busy}
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl"
                  disabled={busy}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className="w-full text-center text-sm font-medium text-[#1C1C1C]/55 hover:text-[#1C1C1C]"
              >
                ← Back to sign in
              </button>
            </>
          ) : (
            <div className="space-y-3 text-center">
              <div className="text-3xl" aria-hidden>
                📬
              </div>
              <p className="font-medium text-[#1C1C1C]">Check your email</p>
              <p className="text-sm text-[#1C1C1C]/60">
                If an account exists for <strong>{email}</strong>, you’ll get a
                link to reset your password.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForgotSent(false)
                  setMode('login')
                }}
                className="text-sm font-semibold text-[#E8724A] hover:underline"
              >
                Back to sign in
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}

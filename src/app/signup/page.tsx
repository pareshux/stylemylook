'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(
    null
  )

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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl(),
      },
    })
    setLoading(false)

    if (signError) {
      setError(formatAuthError(signError))
      return
    }

    router.push(`/auth/confirm?email=${encodeURIComponent(email)}`)
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
            Create your account
          </CardTitle>
          <CardDescription className="text-[0.9375rem]">
            Join StyleAI and get outfits tailored to your real wardrobe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
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
            or sign up with email
            <span className="h-px flex-1 bg-[#1C1C1C]/10" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error ? (
              <p
                className="rounded-xl bg-[#E8724A]/10 px-3 py-2 text-center text-sm text-[#1C1C1C]"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={busy}
                className="h-11 rounded-xl"
              />
            </div>
            <PasswordField
              id="signup-password"
              label="Password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              disabled={busy}
              minLength={8}
              placeholder="At least 8 characters"
            />
            <PasswordField
              id="signup-confirm"
              label="Confirm password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              disabled={busy}
              minLength={8}
            />
            <Button
              type="submit"
              className="h-11 w-full rounded-xl"
              disabled={busy}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#1C1C1C]/55">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#E8724A] hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}

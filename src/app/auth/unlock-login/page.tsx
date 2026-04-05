'use client'

import Link from 'next/link'
import { useState } from 'react'

import { AuthPageShell } from '@/components/auth/auth-page-shell'
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

export default function UnlockLoginPage() {
  const [email, setEmail] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/unlock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secret }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Could not unlock')
        return
      }
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell>
      <Card className="w-full max-w-sm border-brand-border/60 bg-white shadow-[0_8px_30px_rgba(28,28,28,0.06)]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Unlock sign in
          </CardTitle>
          <CardDescription className="text-[0.9375rem]">
            For team accounts listed in{' '}
            <code className="text-xs">INVITE_LOGIN_BYPASS_EMAILS</code>. Sets a long-lived
            cookie so you can open <Link href="/login">/login</Link> while invite-only mode
            is on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <p
                className="rounded-xl bg-[#E8724A]/10 px-3 py-2 text-center text-sm text-text-primary"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="unlock-email">Your email</Label>
              <Input
                id="unlock-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unlock-secret">Admin secret</Label>
              <Input
                id="unlock-secret"
                type="password"
                autoComplete="current-password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl"
                placeholder="Same as INVITE_ADMIN_SECRET"
              />
            </div>
            <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
              {loading ? 'Unlocking…' : 'Continue to log in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}

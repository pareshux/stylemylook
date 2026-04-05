'use client'

import { useCallback, useEffect, useState } from 'react'

type WaitlistRow = {
  id: string
  email: string
  created_at: string
  source: string | null
  invited?: boolean | null
  invited_at?: string | null
}

export default function AdminWaitlistPage() {
  const [sessionOk, setSessionOk] = useState<boolean | null>(null)
  const [secret, setSecret] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)
  const [rows, setRows] = useState<WaitlistRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(false)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [sendMessage, setSendMessage] = useState<Record<string, string>>({})

  const refreshSession = useCallback(async () => {
    const res = await fetch('/api/admin/session')
    if (!res.ok) {
      setSessionOk(false)
      return
    }
    const data = (await res.json()) as { ok?: boolean }
    setSessionOk(Boolean(data.ok))
  }, [])

  const loadWaitlist = useCallback(async () => {
    setLoadingList(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/admin/waitlist')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoadError((data as { error?: string }).error ?? 'Failed to load waitlist')
        setRows([])
        return
      }
      setRows((data as { rows?: WaitlistRow[] }).rows ?? [])
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  useEffect(() => {
    if (sessionOk === true) void loadWaitlist()
  }, [sessionOk, loadWaitlist])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoggingIn(true)
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoginError((data as { error?: string }).error ?? 'Invalid secret')
        return
      }
      setSecret('')
      setSessionOk(true)
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' })
    setSessionOk(false)
    setRows([])
    setSendMessage({})
  }

  async function sendInvite(email: string) {
    setSendingEmail(email)
    setSendMessage((m) => ({ ...m, [email]: '' }))
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSendMessage((m) => ({
          ...m,
          [email]: (data as { error?: string }).error ?? 'Send failed',
        }))
        return
      }
      setSendMessage((m) => ({ ...m, [email]: 'Invite sent ✓' }))
    } finally {
      setSendingEmail(null)
    }
  }

  if (sessionOk === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[#8A8680]">
        Checking session…
      </div>
    )
  }

  if (!sessionOk) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-[#2A2A2A]">Early access — admin</h1>
        <p className="mt-2 text-sm text-[#4E4E4E]">
          Enter the same secret you use for{' '}
          <code className="rounded bg-[#E3DDCF] px-1.5 py-0.5 text-xs">INVITE_ADMIN_SECRET</code>{' '}
          (Bearer / header for <code className="text-xs">/api/invites/send</code>).
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          {loginError ? (
            <p className="rounded-xl bg-[#E8724A]/10 px-3 py-2 text-sm text-[#2A2A2A]" role="alert">
              {loginError}
            </p>
          ) : null}
          <label className="block text-sm font-medium text-[#2A2A2A]">
            Admin secret
            <input
              type="password"
              autoComplete="current-password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E3DDCF] bg-white px-3 py-2.5 text-[#2A2A2A] outline-none focus:border-[#2A2A2A]"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full rounded-full bg-[#2A2A2A] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#404040] disabled:opacity-50"
          >
            {loggingIn ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2A2A2A]">Early access waitlist</h1>
          <p className="mt-1 text-sm text-[#4E4E4E]">
            Send invite emails (same flow as <code className="text-xs">/api/invites/send</code>).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadWaitlist()}
            disabled={loadingList}
            className="rounded-full border border-[#E3DDCF] bg-white px-5 py-2.5 text-sm font-semibold text-[#2A2A2A] hover:bg-[#F5F3EC] disabled:opacity-50"
          >
            {loadingList ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-full border border-[#E3DDCF] px-5 py-2.5 text-sm font-medium text-[#8A8680] hover:text-[#2A2A2A]"
          >
            Log out
          </button>
        </div>
      </div>

      {loadError ? (
        <p className="mb-4 rounded-xl bg-[#E8724A]/10 px-3 py-2 text-sm text-[#2A2A2A]">{loadError}</p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#E3DDCF] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E3DDCF] bg-[#F5F3EC]/80 text-xs font-semibold uppercase tracking-wide text-[#8A8680]">
              <th className="px-4 py-3">Email</th>
              <th className="hidden px-4 py-3 sm:table-cell">Source</th>
              <th className="hidden px-4 py-3 md:table-cell">Signed up</th>
              <th className="hidden px-4 py-3 lg:table-cell">Invited</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loadingList ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#8A8680]">
                  No rows yet.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-[#E3DDCF]/80 last:border-0">
                <td className="px-4 py-3 font-medium text-[#2A2A2A]">{row.email}</td>
                <td className="hidden px-4 py-3 text-[#4E4E4E] sm:table-cell">
                  {row.source ?? '—'}
                </td>
                <td className="hidden px-4 py-3 text-[#4E4E4E] md:table-cell">
                  {row.created_at
                    ? new Date(row.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : '—'}
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  {row.invited === true ? (
                    <span className="text-emerald-700">Yes</span>
                  ) : row.invited === false ? (
                    <span className="text-[#8A8680]">No</span>
                  ) : (
                    <span className="text-[#8A8680]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      disabled={sendingEmail === row.email}
                      onClick={() => void sendInvite(row.email)}
                      className="rounded-full bg-[#2A2A2A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#404040] disabled:opacity-50"
                    >
                      {sendingEmail === row.email ? 'Sending…' : 'Send invite'}
                    </button>
                    {sendMessage[row.email] ? (
                      <span
                        className={
                          sendMessage[row.email]!.includes('failed') ||
                          sendMessage[row.email]!.includes('Send failed')
                            ? 'text-xs text-red-600'
                            : 'text-xs text-emerald-700'
                        }
                      >
                        {sendMessage[row.email]}
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

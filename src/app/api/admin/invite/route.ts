import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { verifyWaitlistAdminCookie, WAITLIST_ADMIN_COOKIE } from '@/lib/admin-waitlist-auth'
import { sendAuthInviteEmail } from '@/lib/send-auth-invite-email'

function siteUrlFromEnv(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  return ''
}

export async function POST(request: Request) {
  const adminSecret = process.env.INVITE_ADMIN_SECRET?.trim()
  if (!adminSecret) {
    return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 500 })
  }

  const cookieStore = await cookies()
  const raw = cookieStore.get(WAITLIST_ADMIN_COOKIE)?.value ?? ''
  if (!(await verifyWaitlistAdminCookie(raw, adminSecret))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const siteUrl = siteUrlFromEnv()
  if (!siteUrl) {
    return NextResponse.json(
      { ok: false, error: 'NEXT_PUBLIC_SITE_URL is not set' },
      { status: 500 }
    )
  }

  let body: { email?: unknown; expiresInDays?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json({ ok: false, error: 'email is required' }, { status: 400 })
  }

  const expiresInDays =
    typeof body.expiresInDays === 'number' && Number.isFinite(body.expiresInDays)
      ? body.expiresInDays
      : undefined

  const result = await sendAuthInviteEmail({ email, expiresInDays, siteUrl })
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json(result)
}

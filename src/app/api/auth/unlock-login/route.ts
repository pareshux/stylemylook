import { NextResponse } from 'next/server'

import {
  computeLoginBypassCookieValue,
  LOGIN_BYPASS_COOKIE,
  parseLoginBypassAllowlist,
} from '@/lib/login-bypass-auth'

export async function POST(request: Request) {
  const adminSecret = process.env.INVITE_ADMIN_SECRET?.trim()
  const allowlist = parseLoginBypassAllowlist(process.env.INVITE_LOGIN_BYPASS_EMAILS)

  if (!adminSecret) {
    return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 500 })
  }
  if (allowlist.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'INVITE_LOGIN_BYPASS_EMAILS is not set' },
      { status: 503 }
    )
  }

  let body: { email?: unknown; secret?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const provided = typeof body.secret === 'string' ? body.secret.trim() : ''

  if (!email || !provided) {
    return NextResponse.json({ ok: false, error: 'email and secret required' }, { status: 400 })
  }
  if (provided !== adminSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (!allowlist.includes(email)) {
    return NextResponse.json({ ok: false, error: 'Email not allowed' }, { status: 403 })
  }

  const val = await computeLoginBypassCookieValue(adminSecret, email)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(LOGIN_BYPASS_COOKIE, val, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 400,
  })
  return res
}

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import {
  computeWaitlistAdminCookieValue,
  verifyWaitlistAdminCookie,
  WAITLIST_ADMIN_COOKIE,
} from '@/lib/admin-waitlist-auth'

export async function GET() {
  const adminSecret = process.env.INVITE_ADMIN_SECRET?.trim()
  if (!adminSecret) {
    return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 500 })
  }
  const cookieStore = await cookies()
  const raw = cookieStore.get(WAITLIST_ADMIN_COOKIE)?.value ?? ''
  const ok = await verifyWaitlistAdminCookie(raw, adminSecret)
  return NextResponse.json({ ok })
}

export async function POST(request: Request) {
  const adminSecret = process.env.INVITE_ADMIN_SECRET?.trim()
  if (!adminSecret) {
    return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 500 })
  }

  let body: { secret?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const provided = typeof body.secret === 'string' ? body.secret.trim() : ''
  if (!provided || provided !== adminSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const val = await computeWaitlistAdminCookieValue(adminSecret)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(WAITLIST_ADMIN_COOKIE, val, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(WAITLIST_ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}

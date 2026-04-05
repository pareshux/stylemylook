import { NextResponse } from 'next/server'

import { sendAuthInviteEmail } from '@/lib/send-auth-invite-email'

type Body = {
  email?: unknown
  expiresInDays?: unknown
}

// Run in Supabase SQL editor:
//
// create table if not exists public.auth_invites (
//   id uuid default gen_random_uuid() primary key,
//   email text not null,
//   token_hash text not null unique,
//   expires_at timestamptz not null,
//   used_at timestamptz,
//   created_at timestamptz default now()
// );
// create unique index if not exists auth_invites_email_key on public.auth_invites (email);

function getSiteUrl(request: Request): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  return new URL(request.url).origin
}

function isAuthorized(request: Request): boolean {
  const adminSecret = process.env.INVITE_ADMIN_SECRET?.trim()
  if (!adminSecret) return false

  const headerVal = request.headers.get('x-invite-admin')?.trim() ?? ''
  if (headerVal && headerVal === adminSecret) return true

  const authHeader = request.headers.get('authorization') ?? ''
  if (authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice('Bearer '.length).trim()
    return bearer === adminSecret
  }
  return false
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const emailRaw = body.email
  const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json({ ok: false, error: 'email is required' }, { status: 400 })
  }

  const expiresDaysRaw = body.expiresInDays
  const expiresInDays =
    typeof expiresDaysRaw === 'number' && Number.isFinite(expiresDaysRaw)
      ? Math.max(1, Math.min(30, Math.floor(expiresDaysRaw)))
      : undefined

  const siteUrl = getSiteUrl(request)
  const result = await sendAuthInviteEmail({ email, expiresInDays, siteUrl })

  if (!result.ok) {
    console.error('invite send error:', result.error)
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    email: result.email,
    expiresAt: result.expiresAt,
  })
}

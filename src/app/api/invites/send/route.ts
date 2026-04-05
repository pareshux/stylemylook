import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

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
      : 7

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: 'Supabase service role env is missing' },
      { status: 500 }
    )
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json(
      { ok: false, error: 'RESEND_API_KEY is missing' },
      { status: 500 }
    )
  }

  const token = crypto.randomBytes(32).toString('base64url')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { error: upsertError } = await supabase.from('auth_invites').upsert(
    {
      email,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      used_at: null,
    },
    { onConflict: 'email' }
  )
  if (upsertError) {
    console.error('invite send upsert error:', upsertError)
    return NextResponse.json(
      { ok: false, error: upsertError.message },
      { status: 500 }
    )
  }

  const siteUrl = getSiteUrl(request)
  const inviteLink = `${siteUrl}/auth/invite?token=${encodeURIComponent(token)}`
  const loginLink = `${siteUrl}/login`
  const resend = new Resend(resendApiKey)
  const { error: sendError } = await resend.emails.send({
    from: 'StyleMyLook <hello@stylemylook.xyz>',
    to: email,
    subject: 'Your StyleMyLook invite is ready ✨',
    html: `
      <p>Hi there,</p>
      <p>You’re invited to StyleMyLook early access.</p>
      <p><strong>Step 1 — Open your invite</strong><br />
      <a href="${inviteLink}">Accept invite and continue</a></p>
      <p><strong>Step 2 — Sign up or log in</strong><br />
      After the invite opens, you can use <strong>Continue with Google</strong>, <strong>Continue with Facebook</strong>,
      or email and password on the sign-up screen.</p>
      <p>Already have an account? After accepting the invite (so your browser can reach the app), use:<br />
      <a href="${loginLink}">Log in to StyleMyLook</a></p>
      <p style="font-size:13px;color:#666;">Your invite link expires in ${expiresInDays} day(s) and can only be used once.</p>
    `,
  })
  if (sendError) {
    console.error('invite send email error:', sendError)
    return NextResponse.json(
      { ok: false, error: sendError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, email, expiresAt: expiresAt.toISOString() })
}

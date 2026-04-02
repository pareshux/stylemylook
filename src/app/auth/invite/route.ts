import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { AUTH_ACCESS_COOKIE, computeAccessCookieValue } from '@/lib/auth-invite'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')?.trim() ?? ''
  if (!token) {
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const cookieSecret = process.env.AUTH_INVITE_COOKIE_SECRET?.trim()
  if (!supabaseUrl || !serviceRoleKey || !cookieSecret) {
    console.error('auth/invite: missing env config')
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: invite, error } = await supabase
    .from('auth_invites')
    .select('id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (error || !invite) {
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  if (invite.used_at || Date.now() > new Date(invite.expires_at).getTime()) {
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  await supabase
    .from('auth_invites')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invite.id)

  const cookieValue = await computeAccessCookieValue(cookieSecret)
  const redirectUrl = new URL('/signup?invited=1', requestUrl.origin)
  const res = NextResponse.redirect(redirectUrl)
  res.cookies.set(AUTH_ACCESS_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  })
  return res
}

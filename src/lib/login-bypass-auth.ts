/**
 * Lets specific emails reach /login and /signup under invite-only mode,
 * after POST /api/auth/unlock-login with INVITE_ADMIN_SECRET.
 */

import { timingSafeEqualString } from '@/lib/auth-invite'

export const LOGIN_BYPASS_COOKIE = 'smx_login_bypass'
const HMAC_PREFIX = 'stylemylook-login-bypass-v1|'

function uint8ToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function parseLoginBypassAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function computeLoginBypassCookieValue(
  secret: string,
  email: string
): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const msg = HMAC_PREFIX + email.trim().toLowerCase()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
  return uint8ToBase64Url(new Uint8Array(sig))
}

export async function verifyLoginBypassCookie(
  cookieValue: string,
  secret: string,
  allowlist: string[]
): Promise<boolean> {
  if (!cookieValue || !secret || allowlist.length === 0) return false
  for (const email of allowlist) {
    const expected = await computeLoginBypassCookieValue(secret, email)
    if (timingSafeEqualString(cookieValue, expected)) return true
  }
  return false
}

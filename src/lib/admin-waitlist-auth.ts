/**
 * HttpOnly session for /admin/waitlist — same secret as INVITE_ADMIN_SECRET.
 */

import { timingSafeEqualString } from '@/lib/auth-invite'

export const WAITLIST_ADMIN_COOKIE = 'smx_waitlist_admin'
const HMAC_LABEL = 'stylemylook-waitlist-admin-v1'

function uint8ToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function computeWaitlistAdminCookieValue(secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(HMAC_LABEL))
  return uint8ToBase64Url(new Uint8Array(sig))
}

export async function verifyWaitlistAdminCookie(
  cookieValue: string,
  secret: string
): Promise<boolean> {
  if (!cookieValue || !secret) return false
  const expected = await computeWaitlistAdminCookieValue(secret)
  return timingSafeEqualString(cookieValue, expected)
}
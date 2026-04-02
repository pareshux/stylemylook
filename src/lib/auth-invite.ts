/**
 * Invite-only access for /login and /signup when AUTH_INVITE_SECRET is set.
 * Invited users open e.g. /signup?invite=<secret> once; we set an httpOnly cookie
 * so OAuth and email flows keep working on return.
 */

export const AUTH_INVITE_COOKIE = 'smx_auth_invite'
const HMAC_LABEL = 'stylemylook-auth-invite-v1'

function uint8ToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function computeInviteCookieValue(secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(HMAC_LABEL)
  )
  return uint8ToBase64Url(new Uint8Array(sig))
}

export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const enc = new TextEncoder()
  const bufA = enc.encode(a)
  const bufB = enc.encode(b)
  if (bufA.length !== bufB.length) return false
  let diff = 0
  for (let i = 0; i < bufA.length; i += 1) {
    diff |= bufA[i]! ^ bufB[i]!
  }
  return diff === 0
}

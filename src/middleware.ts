import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { verifyWaitlistAdminCookie, WAITLIST_ADMIN_COOKIE } from '@/lib/admin-waitlist-auth'
import {
  AUTH_ACCESS_COOKIE,
  computeAccessCookieValue,
  timingSafeEqualString,
} from '@/lib/auth-invite'
import {
  LOGIN_BYPASS_COOKIE,
  parseLoginBypassAllowlist,
  verifyLoginBypassCookie,
} from '@/lib/login-bypass-auth'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const inviteOnlyMode = process.env.INVITE_ONLY_MODE === 'true'

  if (pathname === '/login' || pathname === '/signup') {
    if (!inviteOnlyMode) {
      return NextResponse.next()
    }

    let allowed = false

    const authInviteSecret = process.env.AUTH_INVITE_COOKIE_SECRET?.trim()
    if (authInviteSecret) {
      const expectedCookie = await computeAccessCookieValue(authInviteSecret)
      const cookieVal = request.cookies.get(AUTH_ACCESS_COOKIE)?.value ?? ''
      if (
        cookieVal.length > 0 &&
        timingSafeEqualString(cookieVal, expectedCookie)
      ) {
        allowed = true
      }
    }

    const inviteAdminSecret = process.env.INVITE_ADMIN_SECRET?.trim()
    if (!allowed && inviteAdminSecret) {
      const adminCookie = request.cookies.get(WAITLIST_ADMIN_COOKIE)?.value ?? ''
      if (await verifyWaitlistAdminCookie(adminCookie, inviteAdminSecret)) {
        allowed = true
      }
    }

    if (!allowed && inviteAdminSecret) {
      const allowlist = parseLoginBypassAllowlist(
        process.env.INVITE_LOGIN_BYPASS_EMAILS
      )
      if (allowlist.length > 0) {
        const bypassVal = request.cookies.get(LOGIN_BYPASS_COOKIE)?.value ?? ''
        if (await verifyLoginBypassCookie(bypassVal, inviteAdminSecret, allowlist)) {
          allowed = true
        }
      }
    }

    if (allowed) {
      return NextResponse.next()
    }

    if (!authInviteSecret) {
      console.error('Invite-only mode is enabled but AUTH_INVITE_COOKIE_SECRET is missing')
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.redirect(new URL('/', request.url))
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  /**
   * Protected app routes: redirect unauthenticated users to /login.
   * In invite-only mode, users need invite access cookie before /login is reachable.
   */
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/home/:path*',
    '/wardrobe/:path*',
    '/style-me/:path*',
    '/saved/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/suggestions/:path*',
  ],
}

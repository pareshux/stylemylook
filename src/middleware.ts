import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import {
  AUTH_INVITE_COOKIE,
  computeInviteCookieValue,
  timingSafeEqualString,
} from '@/lib/auth-invite'

async function enforceAuthInviteGate(request: NextRequest): Promise<NextResponse | null> {
  const secret = process.env.AUTH_INVITE_SECRET?.trim()
  if (!secret) {
    return null
  }

  const cookieVal = request.cookies.get(AUTH_INVITE_COOKIE)?.value ?? ''
  const expectedToken = await computeInviteCookieValue(secret)
  const hasValidCookie =
    cookieVal.length > 0 && timingSafeEqualString(cookieVal, expectedToken)

  const inviteParam = request.nextUrl.searchParams.get('invite') ?? ''
  const hasValidInviteParam =
    inviteParam.length > 0 && timingSafeEqualString(inviteParam, secret)

  if (hasValidInviteParam) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.searchParams.delete('invite')
    const res = NextResponse.redirect(redirectUrl)
    res.cookies.set(AUTH_INVITE_COOKIE, expectedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 60,
    })
    return res
  }

  if (!hasValidCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === '/login' || pathname === '/signup') {
    const inviteResponse = await enforceAuthInviteGate(request)
    if (inviteResponse) {
      return inviteResponse
    }
    return NextResponse.next()
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
   * When AUTH_INVITE_SECRET is set, /login itself requires a prior invite cookie
   * or ?invite= on first visit, so users without access end up on the homepage.
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

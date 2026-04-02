import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import {
  AUTH_ACCESS_COOKIE,
  computeAccessCookieValue,
  timingSafeEqualString,
} from '@/lib/auth-invite'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const inviteOnlyMode = process.env.INVITE_ONLY_MODE === 'true'

  if (pathname === '/login' || pathname === '/signup') {
    if (!inviteOnlyMode) {
      return NextResponse.next()
    }

    const cookieSecret = process.env.AUTH_INVITE_COOKIE_SECRET?.trim()
    if (!cookieSecret) {
      console.error('Invite-only mode is enabled but AUTH_INVITE_COOKIE_SECRET is missing')
      return NextResponse.redirect(new URL('/', request.url))
    }

    const expectedCookie = await computeAccessCookieValue(cookieSecret)
    const cookieVal = request.cookies.get(AUTH_ACCESS_COOKIE)?.value ?? ''
    const hasInviteAccess =
      cookieVal.length > 0 && timingSafeEqualString(cookieVal, expectedCookie)

    if (!hasInviteAccess) {
      return NextResponse.redirect(new URL('/', request.url))
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

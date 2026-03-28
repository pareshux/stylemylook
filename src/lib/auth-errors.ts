import type { AuthError } from '@supabase/supabase-js'

export function formatAuthError(error: AuthError | null | undefined): string {
  if (!error?.message) return 'Something went wrong. Please try again.'

  const msg = error.message.toLowerCase()

  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid_credentials')
  ) {
    return 'Wrong email or password. Check your details and try again.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.'
  }
  if (msg.includes('user not found') || msg.includes('user does not exist')) {
    return 'No account found with this email.'
  }
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in.'
  }
  if (msg.includes('password') && msg.includes('least')) {
    return 'Password does not meet requirements.'
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (msg.includes('network')) {
    return 'Network error. Check your connection and try again.'
  }
  if (
    msg.includes('provider is not enabled') ||
    msg.includes('unsupported provider') ||
    msg.includes('validation_failed')
  ) {
    return 'Google or Facebook sign-in is not enabled for this app yet. In Supabase: Authentication → Providers, turn on Google and/or Facebook and add OAuth credentials. You can use email and password until then.'
  }

  return error.message
}

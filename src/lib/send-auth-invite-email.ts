import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export type SendAuthInviteResult =
  | { ok: true; email: string; expiresAt: string }
  | { ok: false; error: string }

export async function sendAuthInviteEmail(options: {
  email: string
  expiresInDays?: number
  siteUrl: string
}): Promise<SendAuthInviteResult> {
  const email = options.email.trim().toLowerCase()
  const expiresInDays =
    typeof options.expiresInDays === 'number' && Number.isFinite(options.expiresInDays)
      ? Math.max(1, Math.min(30, Math.floor(options.expiresInDays)))
      : 7

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, error: 'Supabase service role env is missing' }
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return { ok: false, error: 'RESEND_API_KEY is missing' }
  }

  const token = crypto.randomBytes(32).toString('base64url')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const row = {
    email,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    used_at: null as string | null,
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from('auth_invites')
    .update({
      token_hash: row.token_hash,
      expires_at: row.expires_at,
      used_at: row.used_at,
    })
    .eq('email', email)
    .select('id')

  if (updateError) {
    return { ok: false, error: updateError.message }
  }

  if (!updatedRows?.length) {
    const { error: insertError } = await supabase.from('auth_invites').insert(row)
    if (insertError) {
      return { ok: false, error: insertError.message }
    }
  }

  const siteUrl = options.siteUrl.replace(/\/+$/, '')
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
    return { ok: false, error: sendError.message }
  }

  return { ok: true, email, expiresAt: expiresAt.toISOString() }
}

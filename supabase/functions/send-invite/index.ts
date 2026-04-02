/**
 * Sends a one-time auth invite when `waitlist.invited` flips from false → true.
 *
 * To deploy this function run:
 * npx supabase functions deploy send-invite --project-ref eqwqddsgvxrpksvptlmx
 *
 * Then set the secrets:
 * npx supabase secrets set RESEND_API_KEY=your_key --project-ref eqwqddsgvxrpksvptlmx
 * npx supabase secrets set NEXT_PUBLIC_SITE_URL=https://stylemylook.xyz --project-ref eqwqddsgvxrpksvptlmx
 *
 * After deploying the edge function, set up a Database Webhook in Supabase:
 * 1. Go to Supabase Dashboard → Database → Webhooks
 * 2. Click "Create a new hook"
 * 3. Name: send-invite-on-update
 * 4. Table: waitlist
 * 5. Events: UPDATE
 * 6. Type: Supabase Edge Function
 * 7. Edge Function: send-invite
 * 8. HTTP Headers: add Authorization: Bearer YOUR_SUPABASE_ANON_KEY
 *
 * SQL (run in SQL Editor if not already applied):
 * alter table public.waitlist
 *   add column if not exists invited boolean default false,
 *   add column if not exists invited_at timestamptz;
 *
 * create unique index if not exists auth_invites_email_key
 *   on public.auth_invites (email);
 */

import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type WaitlistRow = {
  email?: string
  invited?: boolean
}

type WebhookPayload = {
  record?: WaitlistRow
  old_record?: WaitlistRow
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function handleInviteRequest(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 })
  }

  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return new Response('invalid json', { status: 400 })
  }

  const record = payload.record
  const old_record = payload.old_record

  if (!record?.invited || old_record?.invited === true) {
    return new Response('skipped', { status: 200 })
  }

  const email = record.email?.trim().toLowerCase() ?? ''
  if (!email) {
    return new Response('no email', { status: 200 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return new Response('server misconfigured', { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey)

  const token =
    crypto.randomUUID().replace(/-/g, '') +
    crypto.randomUUID().replace(/-/g, '')

  const tokenHash = toHex(
    await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(token),
    ),
  )

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { error: upsertError } = await supabaseAdmin
    .from('auth_invites')
    .upsert(
      {
        email,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        used_at: null,
      },
      { onConflict: 'email' },
    )

  if (upsertError) {
    console.error('auth_invites upsert error:', upsertError)
    return new Response('db error', { status: 500 })
  }

  const { error: waitlistError } = await supabaseAdmin
    .from('waitlist')
    .update({ invited_at: new Date().toISOString() })
    .eq('email', email)

  if (waitlistError) {
    console.error('waitlist update error:', waitlistError)
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.error('RESEND_API_KEY missing')
    return new Response('email misconfigured', { status: 500 })
  }

  const siteUrl =
    Deno.env.get('NEXT_PUBLIC_SITE_URL')?.replace(/\/+$/, '') ||
    'https://stylemylook.xyz'
  const inviteUrl = `${siteUrl}/auth/invite?token=${encodeURIComponent(token)}`

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'StyleMyLook <hello@stylemylook.xyz>',
      to: email,
      subject: "You're in! Your StyleMyLook invite is here 👗",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #F5F3EC; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; border: 1px solid #E3DDCF;">
            
            <div style="background: #2A2A2A; padding: 32px; text-align: center;">
              <p style="color: white; font-size: 28px; font-weight: 700; margin: 0;">StyleMyLook 👗</p>
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 8px 0 0;">Your AI personal stylist</p>
            </div>

            <div style="padding: 40px 32px;">
              <h1 style="font-size: 28px; font-weight: 700; color: #2A2A2A; margin: 0 0 12px;">
                You're in! 🎉
              </h1>
              <p style="font-size: 16px; color: #4E4E4E; line-height: 1.6; margin: 0 0 24px;">
                Your early access to StyleMyLook is ready. Upload your wardrobe, pick an event, and let AI style you — in seconds.
              </p>

              <div style="background: #F5F3EC; border-radius: 16px; padding: 20px; margin: 0 0 28px;">
                <p style="font-size: 13px; font-weight: 600; color: #8A8680; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">What you get</p>
                <p style="font-size: 14px; color: #2A2A2A; margin: 6px 0;">✓ Upload your entire wardrobe</p>
                <p style="font-size: 14px; color: #2A2A2A; margin: 6px 0;">✓ AI outfit suggestions for any event</p>
                <p style="font-size: 14px; color: #2A2A2A; margin: 6px 0;">✓ 3 months of Pro — free</p>
              </div>

              <a href="${inviteUrl}" 
                 style="display: block; background: #2A2A2A; color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 100px; font-size: 16px; font-weight: 700; margin: 0 0 16px;">
                Create my account →
              </a>

              <p style="font-size: 12px; color: #8A8680; text-align: center; margin: 0;">
                This invite expires in 7 days and can only be used once.
              </p>
            </div>

            <div style="padding: 20px 32px; border-top: 1px solid #E3DDCF; text-align: center;">
              <p style="font-size: 12px; color: #8A8680; margin: 0;">
                © 2025 StyleMyLook · Made with ❤️ in India 🇮🇳
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
  })

  if (!emailRes.ok) {
    console.error('Resend error:', await emailRes.text())
    return new Response('email error', { status: 500 })
  }

  return new Response('invited', { status: 200 })
}

serve({
  '/': async (req, _conn, _params) => handleInviteRequest(req),
  '/send-invite': async (req, _conn, _params) => handleInviteRequest(req),
})

import { Resend } from 'resend'
import { NextResponse } from 'next/server'

type Body = {
  email?: unknown
}

const CONFIRM_HTML = `
<p>Hi there!</p>
<p>You're officially on the StyleMyLook early access waitlist. 🎉</p>
<p>We're putting the finishing touches on your AI stylist. When we're ready,
you'll be among the first to get access — plus 3 months of Pro free.</p>
<p>In the meantime, follow us on Instagram for sneak peeks.</p>
<p>Can't wait to style you,<br />Team StyleMyLook 👗</p>
`

export async function POST(request: Request) {
  try {
    let body: Body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const emailRaw = body.email
    const email =
      typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : ''
    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'email is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn(
        'waitlist-confirm: RESEND_API_KEY not set; skipping confirmation email'
      )
      return NextResponse.json({ ok: true, skipped: true })
    }

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: 'StyleMyLook <hello@stylemylook.xyz>',
      to: email,
      subject: "You're on the list! 👗",
      html: CONFIRM_HTML,
    })

    if (error) {
      console.error('waitlist-confirm Resend error:', error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('waitlist-confirm:', e)
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

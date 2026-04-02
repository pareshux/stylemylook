import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            /* ignore */
          }
        },
      },
    }
  )

  const { data: dataUser } = await supabase.auth.getUser()
  const user = dataUser.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('razorpay_subscription_id, plan_expires_at')
    .eq('id', user.id)
    .maybeSingle()

  const subscriptionId = profile?.razorpay_subscription_id as string | null
  const expiresAt = profile?.plan_expires_at as string | null

  if (!subscriptionId) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
  if (!razorpayKeyId || !razorpayKeySecret) {
    return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 })
  }

  const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  })

  try {
    // Cancel at end of billing period (cancel_at_cycle_end = 1)
    await razorpay.subscriptions.cancel(subscriptionId, 1)

    // Mark as cancelling (keeps access until expiry)
    await supabase.from('profiles')
      .update({ plan: 'cancelling' })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      expires_at: expiresAt,
    })
  } catch (error: any) {
    console.error('Razorpay cancel error:', error)
    return NextResponse.json(
      { error: error?.message ?? 'Razorpay cancel failed' },
      { status: 500 }
    )
  }
}


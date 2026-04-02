import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type Billing = 'monthly' | 'yearly'
type Plan = 'pro' | 'premium'

const PLAN_IDS: Record<string, string | undefined> = {
  'pro-monthly': process.env.RAZORPAY_PLAN_PRO_MONTHLY,
  'pro-yearly': process.env.RAZORPAY_PLAN_PRO_YEARLY,
  'premium-monthly': process.env.RAZORPAY_PLAN_PREMIUM_MONTHLY,
  'premium-yearly': process.env.RAZORPAY_PLAN_PREMIUM_YEARLY,
}

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

  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.email) {
    return NextResponse.json(
      { error: 'User email is required for Razorpay checkout' },
      { status: 400 }
    )
  }

  const body = (await req.json()) as {
    plan?: Plan
    billing?: Billing
  }

  const plan = body.plan
  const billing = body.billing

  if (!plan || !billing) {
    return NextResponse.json({ error: 'plan and billing are required' }, { status: 400 })
  }

  const planKey = `${plan}-${billing}`
  const planId = PLAN_IDS[planKey]

  if (!planId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
  // Razorpay Checkout needs the public key; in our env it's safe to reuse RAZORPAY_KEY_ID
  // when NEXT_PUBLIC_RAZORPAY_KEY_ID is missing.
  const publicRazorpayKeyId =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID

  if (!razorpayKeyId || !razorpayKeySecret || !publicRazorpayKeyId) {
    return NextResponse.json(
      { error: 'Razorpay is not configured (missing env vars)' },
      { status: 500 }
    )
  }

  const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  })

  try {
    // Get or create Razorpay customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('razorpay_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    let customerId = profile?.razorpay_customer_id as string | null

    if (!customerId) {
      const customer = await razorpay.customers.create({
        email: user.email,
        name: user.email.split('@')[0],
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ razorpay_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: billing === 'yearly' ? 1 : 12,
      quantity: 1,
    })

    return NextResponse.json({
      subscription_id: subscription.id,
      key_id: publicRazorpayKeyId,
    })
  } catch (error: any) {
    console.error('Razorpay error:', error)
    return NextResponse.json({ error: error?.message ?? 'Razorpay error' }, { status: 500 })
  }
}


import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type Billing = 'monthly' | 'yearly'

function getPlanId(billing: Billing) {
  // Prefer explicit pro plan ids; fall back to a single plan id if provided.
  if (billing === 'yearly') {
    return process.env.RAZORPAY_PLAN_PRO_YEARLY ?? process.env.RAZORPAY_PLAN_ID_PRO
  }
  return process.env.RAZORPAY_PLAN_PRO_MONTHLY ?? process.env.RAZORPAY_PLAN_ID_PRO
}

export async function POST(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as {
    billing?: Billing
    userId?: string
    email?: string
    name?: string
  }

  const billing: Billing = body.billing === 'yearly' ? 'yearly' : 'monthly'
  const planId = getPlanId(billing)
  if (!planId) {
    return NextResponse.json({ error: 'Pro plan id not configured' }, { status: 400 })
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })

  if (!user.email) {
    return NextResponse.json({ error: 'User email is required' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('razorpay_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  const existingCustomerId = profile?.razorpay_customer_id as string | null

  let customerId = existingCustomerId
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

  // Razorpay Subscriptions: create subscription tied to an existing customer.
  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: billing === 'yearly' ? 1 : 12,
    quantity: 1,
    notes: {
      user_id: user.id,
      email: user.email,
      name: body.name ?? user.email.split('@')[0],
    },
  })

  return NextResponse.json({
    subscriptionId: subscription.id,
    keyId,
  })
}


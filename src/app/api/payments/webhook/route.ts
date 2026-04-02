// After deploying, add this webhook URL in Razorpay Dashboard → Settings → Webhooks:
// https://stylemylook.xyz/api/payments/webhook
// Events to subscribe: subscription.activated, subscription.cancelled, subscription.completed
// Add RAZORPAY_WEBHOOK_SECRET to env vars (from Razorpay webhook settings)

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

type PlanName = 'pro' | 'premium'
type Billing = 'monthly' | 'yearly'

function getPlanAndBilling(subscriptionPlanId: string): { plan: PlanName; billing: Billing } | null {
  const proMonthly = process.env.RAZORPAY_PLAN_PRO_MONTHLY
  const proYearly = process.env.RAZORPAY_PLAN_PRO_YEARLY
  const premiumMonthly = process.env.RAZORPAY_PLAN_PREMIUM_MONTHLY
  const premiumYearly = process.env.RAZORPAY_PLAN_PREMIUM_YEARLY

  if (subscriptionPlanId === proMonthly) return { plan: 'pro', billing: 'monthly' }
  if (subscriptionPlanId === proYearly) return { plan: 'pro', billing: 'yearly' }
  if (subscriptionPlanId === premiumMonthly) return { plan: 'premium', billing: 'monthly' }
  if (subscriptionPlanId === premiumYearly) return { plan: 'premium', billing: 'yearly' }

  return null
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'RAZORPAY_WEBHOOK_SECRET is not set' }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 })
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body) as {
    event?: string
    payload?: any
  }

  const eventType = event.event
  const payload = event.payload
  if (!eventType || !payload) {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
  }

  // Admin Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase admin is not configured' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  try {
    if (eventType === 'subscription.activated') {
      const subscription = payload.subscription?.entity
      const customerId = subscription?.customer_id
      const subscriptionPlanId = subscription?.plan_id
      const subscriptionId = subscription?.id

      if (!customerId || !subscriptionPlanId || !subscriptionId) {
        return NextResponse.json({ error: 'Missing subscription fields' }, { status: 400 })
      }

      const planAndBilling = getPlanAndBilling(subscriptionPlanId)
      if (!planAndBilling) {
        return NextResponse.json({ error: 'Unknown plan_id' }, { status: 400 })
      }

      // Find user by razorpay_customer_id
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('razorpay_customer_id', customerId)

      if (profiles?.[0]) {
        const { plan, billing } = planAndBilling
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + (billing === 'yearly' ? 12 : 1))

        await supabaseAdmin.from('profiles').update({
          plan,
          razorpay_subscription_id: subscriptionId,
          plan_expires_at: expiresAt.toISOString(),
          billing_cycle: billing,
        }).eq('id', profiles[0].id)
      }
    }

    if (
      eventType === 'subscription.cancelled' ||
      eventType === 'subscription.completed'
    ) {
      const subscription = payload.subscription?.entity
      const customerId = subscription?.customer_id
      if (!customerId) {
        return NextResponse.json({ error: 'Missing customer_id' }, { status: 400 })
      }

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('razorpay_customer_id', customerId)

      if (profiles?.[0]) {
        await supabaseAdmin.from('profiles').update({
          plan: 'free',
          razorpay_subscription_id: null,
          plan_expires_at: null,
          billing_cycle: null,
        }).eq('id', profiles[0].id)
      }
    }
  } catch (err) {
    console.error('Razorpay webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}


import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    razorpay_payment_id?: string
    razorpay_subscription_id?: string
    razorpay_signature?: string
    userId?: string
  }

  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
    userId,
  } = body

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing verification fields' }, { status: 400 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 401 })
  }

  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
  }

  // Signature verification for the payload we receive from Razorpay Checkout.
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex')

  if (generatedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'pro',
      razorpay_subscription_id,
      plan_updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }

  return NextResponse.json({ success: true, plan: 'pro' })
}


import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { verifyWaitlistAdminCookie, WAITLIST_ADMIN_COOKIE } from '@/lib/admin-waitlist-auth'

export async function GET() {
  const adminSecret = process.env.INVITE_ADMIN_SECRET?.trim()
  if (!adminSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const cookieStore = await cookies()
  const raw = cookieStore.get(WAITLIST_ADMIN_COOKIE)?.value ?? ''
  if (!(await verifyWaitlistAdminCookie(raw, adminSecret))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rows: data ?? [] })
}

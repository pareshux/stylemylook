import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Run in Supabase SQL editor (table + RLS + realtime):
//
// create table if not exists public.waitlist (
//   id uuid default gen_random_uuid() primary key,
//   email text unique not null,
//   created_at timestamptz default now(),
//   source text default 'homepage'
// );
// alter table public.waitlist enable row level security;
// create policy "Anyone can join waitlist" on public.waitlist
//   for insert with check (true);
// create policy "Service role reads waitlist" on public.waitlist
//   for select using (true);
//
// alter publication supabase_realtime add table public.waitlist;

type Body = {
  email?: unknown
}

export async function POST(request: Request) {
  try {
    let body: Body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const emailRaw = body.email
    const email =
      typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : ''
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        'Waitlist error: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
      )
      return NextResponse.json(
        {
          success: false,
          error:
            'Server not configured for waitlist (add SUPABASE_SERVICE_ROLE_KEY to .env.local)',
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { error } = await supabase
      .from('waitlist')
      .insert({ email, source: 'homepage' })

    if (error) {
      console.error('Waitlist error:', error)
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Already on the list!',
        })
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Waitlist error:', e)
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

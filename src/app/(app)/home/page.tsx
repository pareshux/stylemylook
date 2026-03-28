import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { HomeClient } from './home-client'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count } = await supabase
    .from('wardrobe_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) === 0) redirect('/onboarding')

  const meta = user.user_metadata as { full_name?: string } | undefined
  const displayName =
    meta?.full_name ?? user.email?.split('@')[0] ?? 'there'

  return <HomeClient displayName={displayName} />
}

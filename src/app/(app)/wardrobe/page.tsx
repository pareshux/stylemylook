'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

type WardrobeItem = {
  id: string
  image_url: string
  user_notes: string | null
}

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [debug, setDebug] = useState('')

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setDebug('No session found')
        setLoading(false)
        return
      }

      setDebug(`User: ${session.user.id.slice(0, 8)}`)

      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      console.log('Items:', data?.length, 'Error:', error)
      setDebug(
        `User: ${session.user.id.slice(0, 8)} | Items: ${data?.length ?? 0} | Error: ${error?.message || 'none'}`
      )
      setItems((data as WardrobeItem[]) || [])
      setLoading(false)
    }

    void load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3EC]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A2A] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F3EC]">
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
        {/* Temporary debug bar - remove after fixing */}
        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-100 p-3 font-mono text-xs">
          {debug}
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2A2A2A] md:text-4xl">
              My Wardrobe 👗
            </h1>
            <p className="mt-1 text-[#4E4E4E]">{items.length} items</p>
          </div>
          <Link
            href="/wardrobe/upload"
            className="flex items-center gap-2 rounded-full bg-[#2A2A2A] px-5 py-3 text-sm font-medium text-white"
          >
            + Add items
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mb-4 text-6xl">👗</div>
            <h2 className="mb-2 text-2xl font-bold text-[#2A2A2A]">
              Your wardrobe is empty
            </h2>
            <p className="mb-8 text-[#4E4E4E]">
              Add photos of your clothes to get started
            </p>
            <Link
              href="/wardrobe/upload"
              className="rounded-full bg-[#2A2A2A] px-8 py-3 font-medium text-white"
            >
              Add your first item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-2xl bg-[#E3DDCF]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt={item.user_notes || 'Item'}
                  className="h-full w-full object-cover"
                  onError={(e) => console.error('Image error:', item.image_url)}
                />
                {item.user_notes ? (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                    <p className="truncate text-xs text-white">{item.user_notes}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

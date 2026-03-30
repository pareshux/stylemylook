'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/button'
import { WardrobeUploadForm } from '@/components/app/wardrobe-upload-form'

type WardrobeItem = {
  id: string
  image_url: string
  user_notes: string | null
  storage_path: string
}

export default function WardrobePage() {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    const { data: itemsData, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    console.log('Wardrobe items:', itemsData, 'Error:', error)
    setItems((itemsData as WardrobeItem[]) || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  return (
    <div className="min-h-screen bg-brand-bg pb-12">
      <WardrobeUploadForm
        heading="Add your wardrobe 👗"
        subtext="Upload photos of your clothes — tops, bottoms, dresses, shoes, accessories, everything"
        completeLabel="Done, let's style →"
        floatingComplete
        onComplete={() => {
          void fetchItems()
          router.refresh()
          router.push('/home')
        }}
      />

      <div className="mx-auto mt-8 w-full max-w-[1280px] px-6 md:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-text-primary">
            Your uploaded items
          </h2>
          <Button type="button" variant="outline" onClick={() => void fetchItems()}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <p className="py-8 text-sm text-text-muted">Loading wardrobe…</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-sm text-text-muted">
            No items yet. Upload photos above to start building your wardrobe.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-brand-border/70 bg-white"
              >
                <div className="relative aspect-square bg-brand-surface">
                  <Image
                    src={item.image_url}
                    alt={item.user_notes || 'Wardrobe item'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 48vw, (max-width: 1280px) 30vw, 22vw"
                  />
                </div>
                <p className="truncate px-3 py-2 text-sm text-text-secondary">
                  {item.user_notes?.trim() || 'Untitled item'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { createClient } from '@/lib/supabase/client'
import { WARDROBE_BUCKET } from '@/lib/storage'
import { Button } from '@/components/button'
import { AppMaxWidth } from '@/components/app/app-max-width'
import { WardrobeUploadForm } from '@/components/app/wardrobe-upload-form'

type Item = {
  id: string
  image_url: string
  user_notes: string | null
  storage_path: string
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

export default function WardrobePage() {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetKey, setSheetKey] = useState(0)

  const loadItems = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('id, image_url, user_notes, storage_path')
      .order('created_at', { ascending: false })
    if (!error && data) setItems(data as Item[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    if (sheetOpen) setSheetKey((k) => k + 1)
  }, [sheetOpen])

  async function removeItem(item: Item) {
    await supabase.storage.from(WARDROBE_BUCKET).remove([item.storage_path])
    await supabase.from('wardrobe_items').delete().eq('id', item.id)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <header className="flex items-center justify-between border-b border-brand-border/60 px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight text-text-primary">
          My Wardrobe 👗
        </h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => loadItems()}
            className="flex size-10 items-center justify-center rounded-full text-text-primary/60 transition-colors hover:bg-brand-surface"
            aria-label="Refresh wardrobe"
          >
            <RefreshIcon />
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex size-10 items-center justify-center rounded-full bg-[#E8724A] text-lg font-bold text-white shadow-sm transition-transform active:scale-95"
            aria-label="Add items"
          >
            +
          </button>
        </div>
      </header>

      <AppMaxWidth className="py-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-text-primary/50">
            Loading…
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-brand-border/70 bg-white px-6 py-12 text-center">
            <p className="text-sm text-text-primary/65">
              Your wardrobe is empty — add your first item! 👗
            </p>
            <Button
              className="mt-6 rounded-xl"
              type="button"
              onClick={() => setSheetOpen(true)}
            >
              Add photos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-brand-surface">
                  <Image
                    src={item.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
                    aria-label="Delete item"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <p className="truncate px-2 py-2 text-center text-xs font-medium text-text-primary/75">
                  {item.user_notes?.trim() || 'Unnamed item'}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length > 0 ? (
          <p className="mt-6 text-center">
            <Link
              href="/wardrobe/upload"
              className="text-sm font-semibold text-[#E8724A] hover:underline"
            >
              Bulk add on full screen →
            </Link>
          </p>
        ) : null}
      </AppMaxWidth>

      <AnimatePresence>
        {sheetOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="max-h-[88vh] overflow-y-auto rounded-t-3xl bg-brand-bg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[#1C1C1C]/15" />
              <WardrobeUploadForm
                key={sheetKey}
                subtext="Photos upload automatically. Add a label if you like."
                completeLabel="Done adding"
                floatingComplete={false}
                onComplete={() => {
                  setSheetOpen(false)
                  loadItems()
                  router.refresh()
                }}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

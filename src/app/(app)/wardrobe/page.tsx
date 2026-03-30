'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Eye, X, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { WARDROBE_BUCKET } from '@/lib/storage'

interface WardrobeItem {
  id: string
  image_url: string
  user_notes: string | null
  created_at: string
  storage_path: string | null
}

async function getSupabase() {
  const { createBrowserClient } = await import('@supabase/ssr')
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewItem, setPreviewItem] = useState<WardrobeItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const isSelectionMode = selectedIds.size > 0

  const load = useCallback(async () => {
    try {
      const supabase = await getSupabase()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('wardrobe_items')
        .select('id, image_url, user_notes, created_at, storage_path')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setItems((data as WardrobeItem[]) || [])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewItem(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSingle = async (item: WardrobeItem) => {
    if (!confirm('Delete this item from your wardrobe?')) return
    const supabase = await getSupabase()
    if (item.storage_path) {
      await supabase.storage.from(WARDROBE_BUCKET).remove([item.storage_path])
    }
    await supabase.from('wardrobe_items').delete().eq('id', item.id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const deleteSelected = async () => {
    if (
      !confirm(
        `Delete ${selectedIds.size} items? This cannot be undone.`
      )
    )
      return
    setDeleting(true)
    try {
      const supabase = await getSupabase()
      const ids = Array.from(selectedIds)
      const paths = items
        .filter((i) => selectedIds.has(i.id) && i.storage_path)
        .map((i) => i.storage_path!)
      if (paths.length > 0) {
        await supabase.storage.from(WARDROBE_BUCKET).remove(paths)
      }
      await supabase.from('wardrobe_items').delete().in('id', ids)
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)))
      setSelectedIds(new Set())
    } finally {
      setDeleting(false)
    }
  }

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
        <div className="mb-8 flex h-14 items-center justify-between">
          <AnimatePresence mode="wait">
            {isSelectionMode ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex w-full items-center justify-between"
              >
                <span className="text-lg font-semibold text-[#2A2A2A]">
                  {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''}{' '}
                  selected
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="rounded-full border border-[#2A2A2A] px-5 py-2.5 text-sm font-medium text-[#2A2A2A] transition-colors hover:bg-[#E3DDCF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteSelected()}
                    disabled={deleting}
                    className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : `Delete ${selectedIds.size} items`}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="normal"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex w-full items-center justify-between"
              >
                <div>
                  <h1 className="text-3xl font-bold text-[#2A2A2A] md:text-4xl">
                    My Wardrobe 👗
                  </h1>
                  <p className="mt-1 text-sm text-[#4E4E4E]">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/wardrobe/upload')}
                  className="flex items-center gap-2 rounded-full bg-[#2A2A2A] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#404040]"
                >
                  <Plus className="h-4 w-4" />
                  Add items
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-6xl">👗</div>
            <h2 className="mb-3 text-2xl font-bold text-[#2A2A2A]">
              Your wardrobe is empty
            </h2>
            <p className="mb-8 max-w-sm text-[#4E4E4E]">
              Add photos of your clothes to get AI outfit suggestions
            </p>
            <button
              type="button"
              onClick={() => router.push('/wardrobe/upload')}
              className="rounded-full bg-[#2A2A2A] px-8 py-3 font-medium text-white"
            >
              Add your first item
            </button>
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => {
              const isSelected = selectedIds.has(item.id)
              return (
                <div
                  key={item.id}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-[#E3DDCF] transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-[#2A2A2A] ring-offset-1 ring-offset-[#F5F3EC]'
                      : ''
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.user_notes || 'Wardrobe item'}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  <div
                    className={`absolute inset-0 transition-opacity duration-200 ${
                      isSelected ? 'bg-black/20' : 'bg-black/30'
                    } ${
                      isSelected || isSelectionMode
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />

                  <button
                    type="button"
                    aria-label={isSelected ? 'Deselect item' : 'Select item'}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSelect(item.id)
                    }}
                    className={`absolute left-2.5 top-2.5 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border-2 shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-150 ${
                      isSelected
                        ? 'border-[#2A2A2A] bg-[#2A2A2A] opacity-100'
                        : 'border-white bg-white opacity-0 group-hover:opacity-100'
                    } ${isSelectionMode ? '!opacity-100' : ''} `}
                  >
                    {isSelected ? (
                      <svg
                        width="12"
                        height="10"
                        viewBox="0 0 12 10"
                        fill="none"
                        aria-hidden
                      >
                        <polyline
                          points="1,5 4.5,8.5 11,1"
                          stroke="white"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    aria-label="View full size"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewItem(item)
                    }}
                    className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-white group-hover:opacity-100"
                  >
                    <Eye className="h-4 w-4 text-[#2A2A2A]" />
                  </button>

                  <button
                    type="button"
                    aria-label="Delete item"
                    onClick={(e) => {
                      e.stopPropagation()
                      void deleteSingle(item)
                    }}
                    className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 opacity-0 backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-white group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>

                  {item.user_notes ? (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                      <p className="truncate text-xs font-medium text-white">
                        {item.user_notes}
                      </p>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {previewItem ? (
          <motion.div
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setPreviewItem(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Image preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl"
            >
              <button
                type="button"
                aria-label="Close preview"
                onClick={() => setPreviewItem(null)}
                className="fixed right-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-[#E3DDCF] md:right-8 md:top-8"
              >
                <X className="h-5 w-5 text-[#2A2A2A]" />
              </button>

              <div className="overflow-hidden rounded-2xl bg-[#E3DDCF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewItem.image_url}
                  alt={previewItem.user_notes || 'Wardrobe item'}
                  className="max-h-[85vh] w-full object-contain"
                />
              </div>

              {previewItem.user_notes ? (
                <p className="mt-4 text-center font-medium text-white">
                  {previewItem.user_notes}
                </p>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

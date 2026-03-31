'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type OutfitRecord = {
  id: string
  name?: string
  event_type?: string
  styling_tips?: string
  items?: Array<string | { wardrobe_item_id?: string }>
  itemImages?: Array<{ id: string; image_url: string }>
}

export default function SavedPage() {
  const [outfits, setOutfits] = useState<OutfitRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hasWardrobe, setHasWardrobe] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const { createBrowserClient } = await import('@supabase/ssr')
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/login')
          return
        }

        const { count: wardrobeCount } = await supabase
          .from('wardrobe_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)

        setHasWardrobe((wardrobeCount || 0) > 0)

        const { data } = await supabase
          .from('outfit_suggestions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_saved', true)
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          const outfitsWithImages = await Promise.all(
            data.map(async (outfit) => {
              const itemIds =
                outfit.items
                  ?.map((i: string | { wardrobe_item_id?: string }) =>
                    typeof i === 'string' ? i : i.wardrobe_item_id
                  )
                  .filter(Boolean) || []

              if (itemIds.length === 0)
                return { ...outfit, itemImages: [] as OutfitRecord['itemImages'] }

              const { data: items } = await supabase
                .from('wardrobe_items')
                .select('id, image_url')
                .in('id', itemIds)

              return { ...outfit, itemImages: items || [] }
            })
          )
          setOutfits(outfitsWithImages as OutfitRecord[])
        } else {
          setOutfits([])
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [router])

  async function deleteOutfit(id: string) {
    setDeletingId(id)
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.from('outfit_suggestions').update({ is_saved: false }).eq('id', id)
    setOutfits((prev) => prev.filter((o) => o.id !== id))
    setDeletingId(null)
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3EC]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A2A] border-t-transparent" />
      </div>
    )

  return (
    <div className="min-h-screen bg-[#F5F3EC]">
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-10">
          <h1 className="mb-2 text-3xl font-bold text-[#2A2A2A] md:text-4xl">
            Fav Looks 🤍
          </h1>
          <p className="text-base text-[#4E4E4E] md:text-lg">
            {outfits.length > 0
              ? `${outfits.length} saved look${outfits.length !== 1 ? 's' : ''}`
              : 'Your favourite outfits will appear here'}
          </p>
        </div>

        {outfits.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <div className="w-full max-w-lg rounded-3xl border border-[#E3DDCF] bg-white p-10 text-center md:p-16">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5F3EC]">
                <Bookmark className="h-9 w-9 text-[#8A8680]" />
              </div>

              <h2 className="mb-3 text-2xl font-bold text-[#2A2A2A] md:text-3xl">
                No saved looks yet
              </h2>

              <p className="mx-auto mb-8 max-w-sm text-base leading-relaxed text-[#4E4E4E] md:text-lg">
                {hasWardrobe
                  ? "Pick an event on the home screen and save outfits you love — they'll all live here."
                  : 'Add your clothes to your wardrobe first, then generate outfit suggestions and save the ones you love.'}
              </p>

              {hasWardrobe ? (
                <button
                  onClick={() => router.push('/home')}
                  className="rounded-full bg-[#2A2A2A] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#404040]"
                >
                  Generate your first look →
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/wardrobe/upload')}
                    className="w-full rounded-full bg-[#2A2A2A] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#404040] md:w-auto"
                  >
                    Add items to wardrobe →
                  </button>
                  <p className="text-sm text-[#8A8680]">
                    You need at least 1 item to generate outfits
                  </p>
                </div>
              )}

              <div className="mt-10 border-t border-[#E3DDCF] pt-8">
                <p className="text-sm text-[#8A8680]">
                  💡 Tip: On the suggestions page, tap &quot;Save outfit&quot; on
                  any look to save it here
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {outfits.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {outfits.map((outfit, index) => (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group overflow-hidden rounded-2xl border border-[#E3DDCF] bg-white transition-shadow duration-300 hover:shadow-md"
                >
                  <div className="p-4 pb-0">
                    {outfit.itemImages && outfit.itemImages.length > 0 ? (
                      <div
                        className={`grid gap-1.5 ${
                          outfit.itemImages.length === 1
                            ? 'grid-cols-1'
                            : outfit.itemImages.length === 2
                              ? 'grid-cols-2'
                              : 'grid-cols-2'
                        }`}
                      >
                        {outfit.itemImages.slice(0, 4).map((item, i) => (
                          <div
                            key={item.id}
                            className={`overflow-hidden rounded-xl bg-[#E3DDCF] ${
                              outfit.itemImages && outfit.itemImages.length === 3 && i === 0
                                ? 'row-span-2'
                                : ''
                            }`}
                            style={{ aspectRatio: '1' }}
                          >
                            <img
                              src={item.image_url}
                              alt="Outfit item"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-xl bg-[#F5F3EC]">
                        <span className="text-4xl">👗</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="mb-1 truncate text-base font-semibold text-[#2A2A2A]">
                      {outfit.name || 'Saved Look'}
                    </h3>

                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full border border-[#E3DDCF] bg-[#F5F3EC] px-3 py-1 text-xs capitalize text-[#4E4E4E]">
                        {outfit.event_type || 'Outfit'}
                      </span>
                    </div>

                    {outfit.styling_tips && (
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#4E4E4E]">
                        {outfit.styling_tips}
                      </p>
                    )}

                    <div className="flex items-center gap-2 border-t border-[#E3DDCF] pt-3">
                      <button
                        onClick={() => router.push(`/home`)}
                        className="flex-1 rounded-full border border-[#E3DDCF] py-2 text-center text-sm font-medium text-[#2A2A2A] transition-colors hover:bg-[#F5F3EC]"
                      >
                        Style again
                      </button>
                      <button
                        onClick={() => deleteOutfit(outfit.id)}
                        disabled={deletingId === outfit.id}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#E3DDCF] transition-colors hover:border-red-300 hover:bg-red-50"
                      >
                        {deletingId === outfit.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-[#8A8680] group-hover:text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {outfits.length > 0 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => router.push('/home')}
              className="rounded-full border border-[#2A2A2A] px-8 py-3 text-sm font-medium text-[#2A2A2A] transition-colors hover:bg-[#2A2A2A] hover:text-white"
            >
              Generate more looks →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

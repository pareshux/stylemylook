'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

import { createClient } from '@/lib/supabase/client'
import { eventLabel } from '@/lib/events'
import type { OutfitSuggestion } from '@/lib/outfit-schema'
import { Button } from '@/components/button'
import { AppMaxWidth } from '@/components/app/app-max-width'

type WardrobeRow = {
  id: string
  image_url: string
  user_notes: string | null
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#1C1C1C]/[0.06] bg-white/80 p-4">
      <div className="h-5 w-2/3 rounded-lg bg-[#1C1C1C]/10" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-[#1C1C1C]/10"
          />
        ))}
      </div>
      <div className="mt-4 h-12 w-full rounded-lg bg-[#1C1C1C]/8" />
    </div>
  )
}

export function SuggestionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventType = searchParams.get('event') ?? ''
  const supabase = createClient()

  const [wardrobe, setWardrobe] = useState<WardrobeRow[]>([])
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emptyWardrobe, setEmptyWardrobe] = useState(false)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKeys, setSavedKeys] = useState<string[]>([])
  const [suggestionLimitReached, setSuggestionLimitReached] = useState(false)

  const loadWardrobe = useCallback(async () => {
    const { data } = await supabase
      .from('wardrobe_items')
      .select('id, image_url, user_notes')
      .order('created_at', { ascending: false })
    setWardrobe(data ?? [])
    return data?.length ?? 0
  }, [supabase])

  const fetchSuggestions = useCallback(async () => {
    if (!eventType) return
    setError(null)
    setEmptyWardrobe(false)
    setSuggestionLimitReached(false)
    setLoading(true)
    setOutfits([])
    setSavedKeys([])
    setSavingKey(null)

    const n = await loadWardrobe()
    if (n === 0) {
      setEmptyWardrobe(true)
      setLoading(false)
      return
    }

    const res = await fetch('/api/suggest-outfit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType }),
    })

    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      if (json.code === 'EMPTY_WARDROBE') {
        setEmptyWardrobe(true)
        setLoading(false)
        return
      }

      if (res.status === 403 && json.error === 'suggestion_limit_reached') {
        setSuggestionLimitReached(true)
        setOutfits([])
        setLoading(false)
        return
      } else {
        setError(json.error ?? 'Could not load suggestions')
      }
      setLoading(false)
      return
    }

    setOutfits(json.outfits ?? [])
    setLoading(false)
  }, [eventType, loadWardrobe])

  useEffect(() => {
    if (!eventType) {
      router.replace('/home')
      return
    }
    fetchSuggestions()
  }, [eventType, router, fetchSuggestions])

  const itemById = Object.fromEntries(wardrobe.map((w) => [w.id, w]))

  async function saveOutfit(o: OutfitSuggestion) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const key = o.name + o.items.join(',')

    setSavingKey(key)
    setError(null)

    let lastSupabaseError:
      | { message?: string | null }
      | null = null

    try {
      const tryInsert = async (payload: Record<string, unknown>) => {
        const { error } = await supabase
          .from('outfit_suggestions')
          .insert(payload)
        return error
      }

      // 1) Spec columns (items + styling_tips + is_saved)
      let err = await tryInsert({
        user_id: user.id,
        event_type: eventType,
        items: o.items,
        styling_tips: o.styling_tip,
        accessories_needed: o.accessories_needed ?? [],
        is_saved: true,
        name: o.name,
      })

      // 2) items + styling_tip (singular) + is_saved
      if (err) {
        lastSupabaseError = err
        console.error('saveOutfit: insert (items/styling_tips) failed', err)

        err = await tryInsert({
          user_id: user.id,
          event_type: eventType,
          items: o.items,
          styling_tip: o.styling_tip,
          accessories_needed: o.accessories_needed ?? [],
          is_saved: true,
          name: o.name,
        })
      }

      // 3) items + styling_tips (no is_saved)
      if (err) {
        lastSupabaseError = err
        console.error('saveOutfit: insert (items/styling_tip) failed', err)

        err = await tryInsert({
          user_id: user.id,
          event_type: eventType,
          items: o.items,
          styling_tips: o.styling_tip,
          accessories_needed: o.accessories_needed ?? [],
          name: o.name,
        })
      }

      // 4) items + styling_tip (no is_saved)
      if (err) {
        lastSupabaseError = err
        console.error('saveOutfit: insert (items no is_saved, styling_tip fallback) failed', err)

        err = await tryInsert({
          user_id: user.id,
          event_type: eventType,
          items: o.items,
          styling_tip: o.styling_tip,
          accessories_needed: o.accessories_needed ?? [],
          name: o.name,
        })
      }

      if (err) {
        lastSupabaseError = err
        console.error('saveOutfit: all insert attempts failed', err)
        throw err
      }

      setSavedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
    } catch (e) {
      setError(
        `Could not save outfit. ${lastSupabaseError?.message ?? 'Please try again.'}`
      )
    } finally {
      setSavingKey(null)
    }
  }

  const title = eventLabel(eventType)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-8"
    >
      <header className="flex items-center gap-2 border-b border-[#1C1C1C]/[0.06] px-2 py-3">
        <Button variant="ghost" size="sm" className="shrink-0" asChild>
          <Link href="/home">← Back</Link>
        </Button>
      </header>

      <AppMaxWidth className="space-y-6 py-6">
        <h1 className="text-center text-xl font-bold tracking-tight text-[#1C1C1C]">
          Outfits for {title} ✨
        </h1>

        {suggestionLimitReached ? (
          <div className="rounded-2xl border border-[#1C1C1C]/[0.08] bg-white/80 p-8 text-center">
            <p className="text-4xl" aria-hidden>
              ✨
            </p>
            <h2 className="mt-3 text-base font-bold text-[#1C1C1C]">
              You've used all 10 free suggestions
            </h2>
            <p className="mt-2 text-sm text-[#1C1C1C]/70">
              Upgrade to Pro for unlimited outfit suggestions and more.
            </p>
            <div className="mt-6 space-y-3">
              <Button
                type="button"
                className="w-full rounded-xl bg-[#E8724A] text-white hover:bg-[#d4633e]"
                asChild
              >
                <Link href="/pricing">Upgrade to Pro →</Link>
              </Button>
              <div>
                <Link
                  href="/saved"
                  className="text-xs font-semibold text-[#1C1C1C]/55 hover:underline"
                >
                  View your saved outfits
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {!suggestionLimitReached && emptyWardrobe ? (
          <div className="rounded-2xl border border-[#1C1C1C]/[0.08] bg-white/80 p-8 text-center">
            <p className="text-4xl" aria-hidden>
              👗
            </p>
            <p className="mt-3 text-sm text-[#1C1C1C]/65">
              Add some clothes first so we can style you.
            </p>
            <Button className="mt-6 rounded-xl" asChild>
              <Link href="/wardrobe">Add some clothes first! →</Link>
            </Button>
          </div>
        ) : null}

        {!suggestionLimitReached && error ? (
          <p className="rounded-xl bg-[#E8724A]/10 px-3 py-2 text-center text-sm text-[#1C1C1C]">
            {error}
          </p>
        ) : null}

        {!suggestionLimitReached && loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : null}

        {!suggestionLimitReached && !loading && !emptyWardrobe && outfits.length > 0 ? (
          <div className="space-y-5">
            {outfits.map((o, idx) => {
              const visibleIds = o.items.filter((id) => itemById[id])
              const saveKey = o.name + o.items.join(',')
              const isSaved = savedKeys.includes(saveKey)
              return (
                <motion.article
                  key={`${o.name}-${idx}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="rounded-2xl border border-[#1C1C1C]/[0.08] bg-white/90 p-4 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-[#1C1C1C]">{o.name}</h2>
                  {visibleIds.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {visibleIds.map((id) => {
                        const item = itemById[id]!
                        return (
                          <div
                            key={id}
                            className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F0E8]"
                          >
                            <Image
                              src={item.image_url}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-[#1C1C1C]/70">
                    {o.styling_tip}
                  </p>
                  {o.accessories_needed?.length ? (
                    <div className="mt-3 rounded-xl bg-[#FAF7F2] px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1C1C1C]/45">
                        Accessories to add
                      </p>
                      <p className="mt-1 text-sm text-[#1C1C1C]/75">
                        {o.accessories_needed.join(' · ')}
                      </p>
                    </div>
                  ) : null}
                  <Button
                    type="button"
                    variant={isSaved ? 'default' : 'outline'}
                    className={
                      isSaved
                        ? 'mt-4 w-full rounded-xl bg-green-600 hover:bg-green-600'
                        : 'mt-4 w-full rounded-xl'
                    }
                    disabled={isSaved || savingKey === saveKey}
                    onClick={() => void saveOutfit(o)}
                  >
                    {isSaved ? '✓ Saved' : savingKey === saveKey ? 'Saving…' : 'Save outfit'}
                  </Button>
                </motion.article>
              )
            })}
          </div>
        ) : null}

        {!suggestionLimitReached && !loading && !emptyWardrobe && outfits.length === 0 && !error ? (
          <p className="text-center text-sm text-[#1C1C1C]/55">
            No suggestions yet. Try refresh.
          </p>
        ) : null}

        {!suggestionLimitReached && !loading && !emptyWardrobe ? (
          <Button
            type="button"
            className="w-full rounded-xl"
            onClick={() => fetchSuggestions()}
          >
            Refresh suggestions 🔄
          </Button>
        ) : null}
      </AppMaxWidth>
    </motion.div>
  )
}

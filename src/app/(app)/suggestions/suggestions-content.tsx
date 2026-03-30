'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ExternalLink, RefreshCw, ShoppingBag } from 'lucide-react'

import { AILoadingState } from '@/components/app/ai-loading-state'
import { createClient } from '@/lib/supabase/client'
import { eventLabel } from '@/lib/events'
import type { OutfitSuggestion } from '@/lib/outfit-schema'
import { Button } from '@/components/button'
import { cn } from '@/lib/utils'

type WardrobeRow = {
  id: string
  image_url: string
  user_notes: string | null
}

function AccessoriesBlock({ accessories }: { accessories: string[] }) {
  const [showAll, setShowAll] = useState(false)
  if (!accessories.length) return null

  const visibleAccessories = showAll ? accessories : accessories.slice(0, 2)
  const remaining = accessories.length - visibleAccessories.length

  return (
    <div className="mt-3">
      <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-[#8A8680]">
        Complete the look
      </p>
      <div className="space-y-2">
        {visibleAccessories.map((accessory, i) => (
          <a
            key={`${accessory}-${i}`}
            href={`https://www.google.com/search?q=${encodeURIComponent(
              accessory
            )}&tbm=shop`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[#E3DDCF] bg-[#F5F3EC] p-3 transition-all hover:border-[#2A2A2A] hover:bg-[#E3DDCF] group"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#E3DDCF] transition-colors group-hover:bg-[#D5CEBC]">
              <ShoppingBag className="h-5 w-5 text-[#8A8680]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium capitalize text-[#2A2A2A]">
                {accessory}
              </p>
              <p className="mt-0.5 text-[11px] text-[#8A8680]">
                Shop on Google →
              </p>
            </div>
            <ExternalLink
              className="h-3.5 w-3.5 flex-shrink-0 text-[#8A8680] transition-colors group-hover:text-[#2A2A2A]"
              aria-hidden
            />
          </a>
        ))}
      </div>
      {remaining > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-2 text-[13px] text-[#4E4E4E] underline"
        >
          {showAll
            ? 'Show less'
            : `Show ${remaining} more accessor${remaining === 1 ? 'y' : 'ies'}`}
        </button>
      ) : null}
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

  const eventName = eventLabel(eventType)

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
      }
      setError(json.error ?? 'Could not load suggestions')
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
    void fetchSuggestions()
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

    let lastSupabaseError: { message?: string | null } | null = null

    try {
      const tryInsert = async (payload: Record<string, unknown>) => {
        const { error: insertError } = await supabase
          .from('outfit_suggestions')
          .insert(payload)
        return insertError
      }

      let err = await tryInsert({
        user_id: user.id,
        event_type: eventType,
        items: o.items,
        styling_tips: o.styling_tip,
        accessories_needed: o.accessories_needed ?? [],
        is_saved: true,
        name: o.name,
      })

      if (err) {
        lastSupabaseError = err
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

      if (err) {
        lastSupabaseError = err
        err = await tryInsert({
          user_id: user.id,
          event_type: eventType,
          items: o.items,
          styling_tips: o.styling_tip,
          accessories_needed: o.accessories_needed ?? [],
          name: o.name,
        })
      }

      if (err) {
        lastSupabaseError = err
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
        throw err
      }

      setSavedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
    } catch {
      setError(
        `Could not save outfit. ${lastSupabaseError?.message ?? 'Please try again.'}`
      )
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-8"
    >
      <div className="mx-auto max-w-[1280px] px-6 pb-8 pt-4 md:px-8 md:pt-6">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Link
              href="/home"
              className="mt-1.5 shrink-0 rounded-full border border-[#2A2A2A] px-3 py-2 text-[14px] font-medium text-[#2A2A2A] transition-colors hover:bg-[#E3DDCF] md:hidden"
            >
              ← Back
            </Link>
            <h1 className="min-w-0 flex-1 text-[28px] font-bold leading-tight text-[#2A2A2A] md:text-[40px]">
              Outfits for {eventName} <span aria-hidden>✨</span>
            </h1>
          </div>
          {!suggestionLimitReached && !emptyWardrobe ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void fetchSuggestions()}
              className={cn(
                'inline-flex shrink-0 items-center self-end rounded-full border border-[#2A2A2A] bg-transparent px-5 py-2.5 text-[14px] font-medium text-[#2A2A2A] transition-colors hover:bg-[#E3DDCF] disabled:pointer-events-none disabled:opacity-50 md:self-start'
              )}
            >
              <RefreshCw
                className={cn('mr-2 h-3.5 w-3.5 shrink-0', loading && 'animate-spin')}
                aria-hidden
              />
              Suggest new looks
            </button>
          ) : null}
        </header>

        {suggestionLimitReached ? (
          <div className="rounded-3xl border border-[#E3DDCF] bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-4xl" aria-hidden>
              ✨
            </p>
            <h2 className="mt-3 text-base font-bold text-[#2A2A2A]">
              You&apos;ve used all 10 free suggestions
            </h2>
            <p className="mt-2 text-sm text-[#4E4E4E]">
              Upgrade to Pro for unlimited outfit suggestions and more.
            </p>
            <div className="mt-6 space-y-3">
              <Button type="button" className="w-full rounded-full bg-[#2A2A2A]" asChild>
                <Link href="/pricing">Upgrade to Pro →</Link>
              </Button>
              <div>
                <Link
                  href="/saved"
                  className="text-xs font-semibold text-[#8A8680] hover:underline"
                >
                  View your saved outfits
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {!suggestionLimitReached && emptyWardrobe ? (
          <div className="rounded-3xl border border-[#E3DDCF] bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-4xl" aria-hidden>
              👗
            </p>
            <p className="mt-3 text-sm text-[#4E4E4E]">
              Add some clothes first so we can style you.
            </p>
            <Button type="button" className="mt-6 rounded-full" asChild>
              <Link href="/wardrobe">Add some clothes first! →</Link>
            </Button>
          </div>
        ) : null}

        {!suggestionLimitReached && error ? (
          <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm text-[#2A2A2A]">
            {error}
          </p>
        ) : null}

        {!suggestionLimitReached && loading ? (
          <AILoadingState event={eventName} />
        ) : null}

        {!suggestionLimitReached &&
        !loading &&
        !emptyWardrobe &&
        outfits.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {outfits.map((o, idx) => {
              const visibleIds = o.items.filter((id) => itemById[id])
              const saveKey = o.name + o.items.join(',')
              const isSaved = savedKeys.includes(saveKey)
              const items = visibleIds.map((id) => itemById[id]!)
              return (
                <motion.article
                  key={`${o.name}-${idx}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="rounded-[24px] border border-[#E3DDCF] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                >
                  <h2 className="mb-3 text-[20px] font-semibold text-[#2A2A2A]">
                    {o.name}
                  </h2>
                  {items.length === 1 && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#E3DDCF]">
                      <Image
                        src={items[0].image_url}
                        alt={items[0].user_notes || ''}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
                      />
                    </div>
                  )}
                  {items.length === 2 && (
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="relative aspect-square overflow-hidden rounded-xl bg-[#E3DDCF]"
                        >
                          <Image
                            src={item.image_url}
                            alt={item.user_notes || ''}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 40vw, 30vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {items.length === 3 && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#E3DDCF]">
                          <Image
                            src={items[0].image_url}
                            alt={items[0].user_notes || ''}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 66vw, (max-width: 1024px) 60vw, 40vw"
                          />
                        </div>
                      </div>
                      <div className="col-span-1 flex flex-col gap-2">
                        {items.slice(1).map((item) => (
                          <div
                            key={item.id}
                            className="relative flex-1 overflow-hidden rounded-xl bg-[#E3DDCF]"
                          >
                            <Image
                              src={item.image_url}
                              alt={item.user_notes || ''}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 33vw, (max-width: 1024px) 30vw, 20vw"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {items.length >= 4 && (
                    <div className="grid grid-cols-2 gap-2">
                      {items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="relative aspect-square overflow-hidden rounded-xl bg-[#E3DDCF]"
                        >
                          <Image
                            src={item.image_url}
                            alt={item.user_notes || ''}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 40vw, 30vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-[14px] leading-[1.6] text-[#4E4E4E]">
                    {o.styling_tip}
                  </p>
                  <AccessoriesBlock accessories={o.accessories_needed ?? []} />
                  <button
                    type="button"
                    className={cn(
                      'mt-4 flex h-11 w-full items-center justify-center rounded-full text-[14px] font-medium transition-colors',
                      isSaved
                        ? 'bg-green-600 text-white hover:bg-green-600'
                        : 'bg-[#2A2A2A] text-white hover:bg-[#404040]'
                    )}
                    disabled={isSaved || savingKey === saveKey}
                    onClick={() => void saveOutfit(o)}
                  >
                    {isSaved
                      ? '✓ Saved'
                      : savingKey === saveKey
                        ? 'Saving…'
                        : 'Save outfit'}
                  </button>
                </motion.article>
              )
            })}
          </div>
        ) : null}

        {!suggestionLimitReached &&
        !loading &&
        !emptyWardrobe &&
        outfits.length === 0 &&
        !error ? (
          <p className="text-center text-sm text-[#8A8680]">
            No suggestions yet. Try &quot;Suggest new looks&quot;.
          </p>
        ) : null}
      </div>
    </motion.div>
  )
}

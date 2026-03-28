import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { eventLabel } from '@/lib/events'
import { createClient } from '@/lib/supabase/server'
import { AppMaxWidth } from '@/components/app/app-max-width'
import { Button } from '@/components/button'
import { UnsaveOutfitButton } from './unsave-outfit-button'

export default async function SavedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  function normalizeStringArray(value: unknown): string[] {
    if (!value) return []
    if (Array.isArray(value)) {
      return value.filter((v): v is string => typeof v === 'string')
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          return parsed.filter((v: unknown): v is string => typeof v === 'string')
        }
      } catch {
        // ignore
      }
    }
    return []
  }

  function normalizeText(value: unknown): string | null {
    if (typeof value === 'string') return value
    return null
  }

  type Attempt = {
    itemsCol: 'items' | 'item_ids'
    stylingCol: 'styling_tips' | 'styling_tip'
    withIsSavedFilter: boolean
  }

  const attempts: Attempt[] = [
    { itemsCol: 'items', stylingCol: 'styling_tips', withIsSavedFilter: true },
    { itemsCol: 'items', stylingCol: 'styling_tip', withIsSavedFilter: true },
    { itemsCol: 'item_ids', stylingCol: 'styling_tips', withIsSavedFilter: true },
    { itemsCol: 'item_ids', stylingCol: 'styling_tip', withIsSavedFilter: true },
    { itemsCol: 'items', stylingCol: 'styling_tips', withIsSavedFilter: false },
    { itemsCol: 'items', stylingCol: 'styling_tip', withIsSavedFilter: false },
    { itemsCol: 'item_ids', stylingCol: 'styling_tips', withIsSavedFilter: false },
    { itemsCol: 'item_ids', stylingCol: 'styling_tip', withIsSavedFilter: false },
  ]

  let selectedItemsCol: Attempt['itemsCol'] = 'items'
  let selectedStylingCol: Attempt['stylingCol'] = 'styling_tips'
  let rows: any[] = []

  for (const a of attempts) {
    const select = `id, name, event_type, ${a.itemsCol}, ${a.stylingCol}, accessories_needed, created_at${
      a.withIsSavedFilter ? ', is_saved' : ''
    }`

    const query = supabase
      .from('outfit_suggestions')
      .select(select)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    try {
      const maybeQuery = a.withIsSavedFilter ? query.eq('is_saved', true) : query
      const { data, error } = await maybeQuery
      if (error) continue
      rows = data ?? []
      selectedItemsCol = a.itemsCol
      selectedStylingCol = a.stylingCol
      break
    } catch {
      continue
    }
  }

  const normalizedOutfits = rows.map((r) => {
    const itemIds = normalizeStringArray(r[selectedItemsCol])
    const accessoriesResolved = normalizeStringArray(r.accessories_needed)
    const stylingResolved =
      selectedStylingCol === 'styling_tips'
        ? normalizeText(r.styling_tips) ?? normalizeText(r.styling_tip)
        : normalizeText(r.styling_tip) ?? normalizeText(r.styling_tips)

    return {
      id: r.id as string,
      name: (r.name as string | null) ?? null,
      event_type: (r.event_type as string | null) ?? null,
      itemIds,
      accessoriesResolved,
      stylingResolved,
    }
  })

  const allItemIds = Array.from(
    new Set(normalizedOutfits.flatMap((o) => o.itemIds).filter(Boolean))
  )

  const wardrobeItemsById =
    allItemIds.length > 0
      ? (
          await supabase
            .from('wardrobe_items')
            .select('id, image_url')
            .in('id', allItemIds)
        ).data
      : []

  const itemById = Object.fromEntries(
    (wardrobeItemsById ?? []).map((i: { id: string; image_url: string }) => [
      i.id,
      i,
    ])
  ) as Record<string, { id: string; image_url: string }>

  return (
    <div className="min-h-screen pb-4">
      <header className="border-b border-[#1C1C1C]/[0.06] px-4 py-4">
        <h1 className="text-lg font-bold tracking-tight text-[#1C1C1C]">
          Saved ♥
        </h1>
      </header>
      <AppMaxWidth className="space-y-3 py-4">
        {!normalizedOutfits.length ? (
          <div className="rounded-2xl border border-[#1C1C1C]/[0.08] bg-white/80 px-6 py-12 text-center">
            <p className="text-sm text-[#1C1C1C]/60">
              No saved outfits yet — go get styled! ✨
            </p>
            <Button
              asChild
              className="mt-4 inline-flex rounded-xl bg-[#E8724A] text-white"
            >
              <Link href="/home">Go to Home →</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {normalizedOutfits.map((r) => {
              const photoItemIds = r.itemIds
                .slice(0, 4)
                .filter((id) => Boolean(itemById[id]?.image_url))

              return (
                <article
                  key={r.id}
                  className="relative rounded-2xl border border-[#1C1C1C]/[0.08] bg-white/90 p-4 shadow-sm"
                >
                  <div className="absolute right-3 top-3">
                    <UnsaveOutfitButton suggestionId={r.id} />
                  </div>

                  <h2 className="font-bold text-[#1C1C1C]">
                    {r.name ?? 'Untitled'}
                  </h2>

                  {r.event_type ? (
                    <div className="mt-2">
                      <span className="inline-flex rounded-full bg-[#E8724A]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#E8724A]">
                        {eventLabel(r.event_type)}
                      </span>
                    </div>
                  ) : null}

                  {photoItemIds.length ? (
                    <div className="mt-3 grid grid-cols-2 grid-rows-2 gap-2">
                      {photoItemIds.map((id) => (
                        <div
                          key={id}
                          className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F0E8]"
                        >
                          <Image
                            src={itemById[id].image_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="150px"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {r.stylingResolved ? (
                    <p className="mt-3 text-sm leading-relaxed text-[#1C1C1C]/70">
                      {r.stylingResolved}
                    </p>
                  ) : null}

                  {r.accessoriesResolved.length ? (
                    <p className="mt-2 text-xs text-[#1C1C1C]/55">
                      <span className="font-semibold">Accessories: </span>
                      {r.accessoriesResolved.join(' · ')}
                    </p>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </AppMaxWidth>
    </div>
  )
}

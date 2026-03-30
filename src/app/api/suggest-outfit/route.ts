import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages'

import { eventLabel } from '@/lib/events'
import {
  type SuggestOutfitResponse,
  suggestOutfitResponseSchema,
} from '@/lib/outfit-schema'

const model =
  process.env.ANTHROPIC_MODEL || 'claude-opus-4-5-20251101'

const MAX_WARDROBE_ITEMS = 15
const IMAGE_FETCH_TIMEOUT_MS = 20_000

function extractJsonObject(text: string): unknown {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

function guessMediaTypeFromUrl(
  url: string
): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  const u = url.split('?')[0]?.toLowerCase() ?? ''
  if (u.endsWith('.png')) return 'image/png'
  if (u.endsWith('.webp')) return 'image/webp'
  if (u.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

function normalizeMediaType(
  header: string | null,
  url: string
): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  const h = header?.toLowerCase() ?? ''
  if (h.includes('png')) return 'image/png'
  if (h.includes('webp')) return 'image/webp'
  if (h.includes('gif')) return 'image/gif'
  if (h.includes('jpeg') || h.includes('jpg')) return 'image/jpeg'
  return guessMediaTypeFromUrl(url)
}

async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ data: string; media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' } | null> {
  try {
    const res = await fetch(imageUrl, {
      signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
      headers: { Accept: 'image/*' },
    })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length > 5 * 1024 * 1024) return null
    const media_type = normalizeMediaType(res.headers.get('content-type'), imageUrl)
    return { data: buf.toString('base64'), media_type }
  } catch {
    return null
  }
}

async function visionBlocksForItem(item: {
  id: string
  image_url: string
  user_notes: string | null
}): Promise<ContentBlockParam[]> {
  const label = item.user_notes?.trim() || 'unlabelled'
  const textBlock: ContentBlockParam = {
    type: 'text',
    text: `Item ID: ${item.id}. Label: ${label}`,
  }

  const b64 = await fetchImageAsBase64(item.image_url)
  if (b64) {
    return [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: b64.media_type,
          data: b64.data,
        },
      },
      textBlock,
    ]
  }

  return [
    {
      type: 'image',
      source: { type: 'url', url: item.image_url },
    },
    textBlock,
  ]
}

function sanitizeOutfits(
  parsed: SuggestOutfitResponse,
  validIds: Set<string>
): SuggestOutfitResponse {
  const outfits = parsed.outfits
    .slice(0, 3)
    .map((o) => ({
      ...o,
      items: o.items
        .filter((id) => validIds.has(id))
        .slice(0, 4),
      accessories_needed: o.accessories_needed.slice(0, 8),
    }))
    .filter((o) => o.items.length > 0)

  return { outfits }
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set')
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  const client = new Anthropic({
    apiKey,
  })

  let body: { eventType?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const eventType = body.eventType?.trim()
  if (!eventType) {
    return NextResponse.json({ error: 'eventType is required' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            /* ignore */
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Freemium suggestion limit enforcement (Free: max 10 suggestions total)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, suggestions_count')
    .eq('id', user.id)
    .maybeSingle()

  const plan = profile?.plan ?? 'free'
  const suggestionsCount = profile?.suggestions_count ?? 0

  if (plan === 'free' && suggestionsCount >= 10) {
    return NextResponse.json(
      { error: 'suggestion_limit_reached' },
      { status: 403 }
    )
  }

  const { data: items, error: itemsError } = await supabase
    .from('wardrobe_items')
    .select('id, user_notes, image_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(MAX_WARDROBE_ITEMS)

  if (itemsError) {
    return NextResponse.json(
      { error: 'Could not load wardrobe' },
      { status: 500 }
    )
  }

  if (!items || items.length === 0) {
    return NextResponse.json(
      { error: 'No wardrobe items found' },
      { status: 400 }
    )
  }

  const validIds = new Set(items.map((i) => i.id))

  const imageContents = await Promise.all(
    items.map((item) => visionBlocksForItem(item))
  )

  const content: ContentBlockParam[] = [
    ...imageContents.flat(),
    {
      type: 'text',
      text: `You are a professional fashion stylist. You can see all the clothing items above (each image is followed by its Item ID and label).

Event: ${eventLabel(eventType)} (id: ${eventType})

Create up to 3 outfit suggestions using ONLY the items shown in the images above (use the Item IDs given).

Rules:
- Only reference items you can actually see in the images
- Describe each piece accurately based on what you see (color, style, garment type)
- Each outfit needs 2–4 items that work together; if only 2–3 items fit the event, use that many — do not invent extra pieces
- Use fewer items when appropriate; the JSON "items" array length should match how many garments are in the outfit (2, 3, or 4)
- Make suggestions genuinely appropriate for the event

Return ONLY valid JSON (no markdown):
{
  "outfits": [
    {
      "name": "outfit name",
      "items": ["item_id_1", "item_id_2"],
      "styling_tip": "describe what you see and why it works together",
      "accessories_needed": ["specific accessory suggestions not in wardrobe"]
    }
  ]
}`,
    },
  ]

  let textOut = ''
  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 8192,
      messages: [{ role: 'user', content }],
    })
    const block = msg.content.find((b) => b.type === 'text')
    textOut = block && block.type === 'text' ? block.text : ''
  } catch (error: any) {
    console.error('Anthropic API error:', {
      message: error?.message,
      status: error?.status,
      error: error?.error,
    })
    return NextResponse.json(
      { error: `AI request failed: ${error?.message ?? 'Unknown error'}` },
      { status: 500 }
    )
  }

  const raw = extractJsonObject(textOut)
  const parsed = suggestOutfitResponseSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Could not parse outfit suggestions' },
      { status: 502 }
    )
  }

  const sanitized = sanitizeOutfits(parsed.data, validIds)
  if (sanitized.outfits.length === 0) {
    return NextResponse.json(
      { error: 'No valid outfits produced' },
      { status: 502 }
    )
  }

  // Increment suggestion usage after successful suggestion generation.
  // (For Pro this also keeps the counter consistent for display/debug.)
  await supabase
    .from('profiles')
    .update({ suggestions_count: suggestionsCount + 1 })
    .eq('id', user.id)

  return NextResponse.json(sanitized)
}

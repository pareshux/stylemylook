'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'

import { createClient } from '@/lib/supabase/client'
import { WARDROBE_BUCKET } from '@/lib/storage'
import { Button } from '@/components/button'
import { Input } from '@/components/ui/input'
import { AppMaxWidth } from '@/components/app/app-max-width'

type Row = {
  key: string
  file: File
  preview: string
  /** uploading → storage in flight; done = storage succeeded (DB may still be syncing); error = storage failed */
  status: 'uploading' | 'done' | 'error'
  label: string
  itemId?: string
  storagePath?: string
  imageUrl?: string
  /** Set when storage worked but wardrobe_items insert failed (e.g. missing profiles row) */
  dbError?: string | null
}

function extForFile(file: File) {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

export function WardrobeUploadForm({
  heading,
  subtext,
  completeLabel,
  onComplete,
  floatingComplete = true,
}: {
  heading?: string
  subtext?: string
  completeLabel: string
  onComplete: () => void
  floatingComplete?: boolean
}) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rowsRef = useRef<Row[]>([])
  const [rows, setRows] = useState<Row[]>([])
  rowsRef.current = rows

  /** User can continue once files are in Storage (home/onboarding flow), even if DB row failed */
  const doneCount = rows.filter((r) => r.storagePath).length

  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [limitChecking, setLimitChecking] = useState(false)

  const ensureProfileRow = useCallback(
    async (userId: string) => {
      const { error } = await supabase.from('profiles').upsert(
        { id: userId },
        { onConflict: 'id' }
      )
      if (error && process.env.NODE_ENV === 'development') {
        console.warn('[wardrobe upload] profiles upsert:', error.message)
      }
    },
    [supabase]
  )

  const insertWardrobeRow = useCallback(
    async (args: {
      userId: string
      path: string
      publicUrl: string
      notes: string | null
    }) => {
      await ensureProfileRow(args.userId)

      const { data, error } = await supabase
        .from('wardrobe_items')
        .insert({
          user_id: args.userId,
          storage_path: args.path,
          image_url: args.publicUrl,
          user_notes: args.notes,
        })
        .select('id')

      const id = data?.[0]?.id
      if (!error && id) {
        return { itemId: id, error: null as string | null }
      }

      const msg = error?.message ?? 'Insert failed'
      if (process.env.NODE_ENV === 'development') {
        console.warn('[wardrobe upload] wardrobe_items insert:', msg, error)
      }

      return { itemId: undefined, error: msg }
    },
    [supabase, ensureProfileRow]
  )

  const openFilePicker = useCallback(async () => {
    if (limitChecking) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If not signed in, keep current behavior (upload will likely fail anyway).
    if (!user) {
      fileInputRef.current?.click()
      return
    }

    setLimitChecking(true)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle()

      const { count } = await supabase
        .from('wardrobe_items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const plan = profile?.plan ?? 'free'
      const wardrobeCount = count ?? 0

      if (plan === 'free' && wardrobeCount >= 50) {
        setLimitModalOpen(true)
        return
      }

      fileInputRef.current?.click()
    } finally {
      setLimitChecking(false)
    }
  }, [supabase, limitChecking])

  const uploadOne = useCallback(
    async (row: Row) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setRows((prev) =>
          prev.map((r) =>
            r.key === row.key ? { ...r, status: 'error' as const } : r
          )
        )
        return
      }

      const ext = extForFile(row.file)
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from(WARDROBE_BUCKET)
        .upload(path, row.file, {
          contentType: row.file.type || 'image/jpeg',
          upsert: false,
        })

      if (upErr) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[wardrobe upload] storage:', upErr.message)
        }
        setRows((prev) =>
          prev.map((r) =>
            r.key === row.key ? { ...r, status: 'error' as const } : r
          )
        )
        return
      }

      const { data: pub } = supabase.storage
        .from(WARDROBE_BUCKET)
        .getPublicUrl(path)

      const publicUrl = pub.publicUrl

      const { itemId, error: dbMsg } = await insertWardrobeRow({
        userId: user.id,
        path,
        publicUrl,
        notes: row.label.trim() || null,
      })

      setRows((prev) =>
        prev.map((r) =>
          r.key === row.key
            ? {
                ...r,
                status: 'done',
                storagePath: path,
                imageUrl: publicUrl,
                itemId,
                dbError: dbMsg,
              }
            : r
        )
      )
    },
    [supabase, insertWardrobeRow]
  )

  const onFiles = useCallback(
    async (list: FileList | null) => {
      if (!list?.length) return
      const files = Array.from(list).filter((f) => f.type.startsWith('image/'))
      const newRows: Row[] = files.map((file) => ({
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: 'uploading',
        label: '',
      }))

      setRows((prev) => [...prev, ...newRows])

      for (const row of newRows) {
        await uploadOne(row)
      }
    },
    [uploadOne]
  )

  useEffect(() => {
    return () => {
      rowsRef.current.forEach((r) => URL.revokeObjectURL(r.preview))
    }
  }, [])

  async function updateLabel(rowKey: string, label: string, itemId?: string) {
    setRows((prev) =>
      prev.map((r) => (r.key === rowKey ? { ...r, label } : r))
    )
    if (!itemId) return
    await supabase
      .from('wardrobe_items')
      .update({ user_notes: label.trim() || null })
      .eq('id', itemId)
  }

  return (
    <div className="pb-28">
      <AppMaxWidth className="space-y-6 pt-6">
        {heading ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold tracking-tight text-[#1C1C1C]">
              {heading}
            </h1>
            {subtext ? (
              <p className="mt-2 text-sm leading-relaxed text-[#1C1C1C]/60">
                {subtext}
              </p>
            ) : null}
          </motion.div>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files)
            e.target.value = ''
          }}
        />

        <button
          type="button"
          onClick={() => void openFilePicker()}
          disabled={limitChecking}
          className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1C1C1C]/15 bg-white/60 px-4 py-12 text-center transition-colors hover:border-[#E8724A]/40 hover:bg-white/90 disabled:opacity-60 disabled:hover:border-[#1C1C1C]/15 disabled:hover:bg-white/60"
        >
          <span className="text-3xl" aria-hidden>
            📷
          </span>
          <span className="mt-3 text-sm font-semibold text-[#1C1C1C]">
            Tap to add photos
          </span>
          <span className="mt-1 text-xs text-[#1C1C1C]/50">
            Camera or gallery · select many at once
          </span>
        </button>

        {rows.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {rows.map((row) => (
              <motion.div
                layout
                key={row.key}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="overflow-hidden rounded-2xl border border-[#1C1C1C]/[0.08] bg-white/90 shadow-sm"
              >
                <div className="relative aspect-square bg-[#F5F0E8]">
                  <Image
                    src={row.preview}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized
                  />
                  <span
                    className="absolute right-2 top-2 max-w-[min(100%,8rem)] rounded-full bg-black/55 px-2 py-0.5 text-center text-[10px] font-semibold leading-tight text-white backdrop-blur-sm"
                    data-status={row.status}
                    title={row.dbError ?? undefined}
                  >
                    {row.status === 'uploading'
                      ? 'Uploading...'
                      : row.status === 'error'
                        ? 'Error'
                        : row.storagePath
                          ? '✓ Added'
                          : 'Error'}
                  </span>
                </div>
                <div className="p-2">
                  {row.dbError ? (
                    <p
                      className="mb-2 text-[10px] leading-snug text-amber-800/90"
                      title={row.dbError}
                    >
                      Uploaded to storage, but saving to your closet failed
                      (check profiles / RLS). You can still tap Done.
                    </p>
                  ) : null}
                  <Input
                    placeholder="Label (optional)"
                    value={row.label}
                    onChange={(e) =>
                      updateLabel(row.key, e.target.value, row.itemId)
                    }
                    disabled={row.status === 'uploading' && !row.storagePath}
                    className="h-9 rounded-lg text-xs"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </AppMaxWidth>

      {!floatingComplete && doneCount > 0 ? (
        <AppMaxWidth className="mt-8 pb-4">
          <Button
            type="button"
            className="h-12 w-full rounded-xl text-base shadow-md"
            onClick={onComplete}
          >
            {completeLabel}
          </Button>
        </AppMaxWidth>
      ) : null}

      {floatingComplete && doneCount > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1C1C1C]/[0.06] bg-[#FAF7F2]/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
          <AppMaxWidth>
            <Button
              type="button"
              className="h-12 w-full rounded-xl text-base shadow-md"
              onClick={onComplete}
            >
              {completeLabel}
            </Button>
          </AppMaxWidth>
        </div>
      ) : null}

      {limitModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#1C1C1C]/[0.08] bg-[#FAF7F2] p-5 shadow-xl">
            <h2 className="text-lg font-bold tracking-tight text-[#1C1C1C]">
              You've reached your limit 👗
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#1C1C1C]/70">
              Free plan includes up to 50 wardrobe items. Upgrade to Pro for
              unlimited uploads.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-[#1C1C1C]/15 bg-white/70"
                onClick={() => setLimitModalOpen(false)}
              >
                Maybe later
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-[#E8724A] text-white hover:bg-[#d4633e]"
                onClick={() => {
                  setLimitModalOpen(false)
                  router.push('/pricing')
                }}
              >
                Upgrade to Pro →
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

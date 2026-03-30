'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Camera, ImagePlus, Loader2, X } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { WARDROBE_BUCKET } from '@/lib/storage'
import { Button } from '@/components/button'
import { Input } from '@/components/ui/input'

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
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

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

  function removeQueuedRow(rowKey: string) {
    const row = rowsRef.current.find((r) => r.key === rowKey)
    if (!row) return
    URL.revokeObjectURL(row.preview)
    setRows((prev) => prev.filter((r) => r.key !== rowKey))
  }

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

  const totalCount = rows.length
  const uploadingCount = rows.filter((r) => r.status === 'uploading').length
  const finishedCount = totalCount - uploadingCount
  const progressPct =
    totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-brand-bg pb-28">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-10 md:px-12 md:py-14">
        {heading ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-3 text-center text-[36px] font-bold leading-[1.2] text-text-primary md:text-[48px]">
              {heading}
            </h1>
            {subtext ? (
              <p className="mx-auto mb-12 max-w-4xl text-center text-[20px] font-normal leading-[1.45] text-text-secondary">
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
        <input
          ref={cameraInputRef}
          id="camera-upload-input"
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <input
          ref={galleryInputRef}
          id="gallery-upload-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files)
            e.target.value = ''
          }}
        />

        <div
          className="mx-auto flex w-full max-w-[860px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#E3DDCF] bg-white px-5 py-6 transition-colors hover:border-text-primary hover:bg-brand-bg md:min-h-[320px] md:px-8 md:py-8"
          onClick={() => void openFilePicker()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              void openFilePicker()
            }
          }}
        >
          <div className="flex w-full max-w-[760px] flex-col items-stretch gap-4 md:flex-row md:items-center">
            <label
              htmlFor="camera-upload-input"
              className="group relative flex flex-1 cursor-pointer flex-col items-center rounded-2xl bg-brand-bg p-8 text-center transition-colors hover:bg-brand-surface"
              onClick={(e) => {
                e.stopPropagation()
                cameraInputRef.current?.click()
              }}
            >
              <Camera className="mb-4 h-12 w-12 text-text-primary" />
              <p className="text-[22px] font-semibold text-text-primary">
                Take a photo
              </p>
              <p className="mt-1 text-sm text-text-secondary">Use your camera</p>
            </label>

            <div className="hidden items-center justify-center md:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-medium text-text-muted">
                or
              </span>
            </div>

            <label
              htmlFor="gallery-upload-input"
              className="group relative flex flex-1 cursor-pointer flex-col items-center rounded-2xl bg-brand-bg p-8 text-center transition-colors hover:bg-brand-surface"
              onClick={(e) => {
                e.stopPropagation()
                galleryInputRef.current?.click()
              }}
            >
              <ImagePlus className="mb-4 h-12 w-12 text-text-primary" />
              <p className="text-[22px] font-semibold text-text-primary">
                Upload from gallery
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Select multiple at once
              </p>
            </label>
          </div>
        </div>

        {uploadingCount > 0 ? (
          <div className="mx-auto mt-4 w-full max-w-[860px]">
            <p className="mb-2 text-sm text-text-secondary">
              Uploading {finishedCount} of {totalCount} photos...
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-border">
              <div
                className="h-full rounded-full bg-text-primary transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : null}

        {rows.length === 0 ? (
          <p className="mt-4 text-center text-[14px] text-text-muted">
            💡 Tip: You can select all your clothes at once from your gallery
          </p>
        ) : null}

        {rows.length > 0 ? (
          <div className="mx-auto mt-8 grid max-w-[960px] grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {rows.map((row) => (
              <motion.div
                layout
                key={row.key}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-brand-surface">
                  <Image
                    src={row.preview}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 45vw, (max-width: 1280px) 30vw, 22vw"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeQueuedRow(row.key)}
                    className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span
                    className="absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"
                    title={row.dbError ?? undefined}
                  >
                    {row.status === 'uploading' ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading...
                      </span>
                    ) : row.status === 'error' ? (
                      <span className="rounded-full bg-red-500/90 px-2 py-0.5">
                        Error
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-600/90 px-2 py-0.5">
                        ✓ Added
                      </span>
                    )}
                  </span>
                </div>
                <div className="p-2">
                  {row.dbError ? (
                    <p
                      className="mb-2 text-[10px] leading-snug text-amber-800/90"
                      title={row.dbError}
                    >
                      Uploaded to storage, but saving to your closet failed.
                    </p>
                  ) : null}
                  {row.status === 'done' ? (
                    <Input
                      placeholder="Label (optional)"
                      value={row.label}
                      onChange={(e) =>
                        updateLabel(row.key, e.target.value, row.itemId)
                      }
                      className="h-9 rounded-lg bg-white/80 text-[13px] backdrop-blur-sm"
                    />
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}

        {doneCount > 0 ? (
          <>
            <div className="mx-auto mt-8 hidden w-full max-w-[860px] justify-center md:flex">
              <Button
                type="button"
                className="rounded-full px-12 py-4 text-[18px] font-semibold"
                onClick={onComplete}
              >
                {completeLabel}
              </Button>
            </div>

            <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
              <Button
                type="button"
                className="w-full rounded-full px-12 py-4 text-[18px] font-semibold shadow-lg"
                onClick={onComplete}
              >
                {completeLabel}
              </Button>
            </div>
          </>
        ) : null}
      </div>

      {limitModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-brand-border/70 bg-brand-bg p-5 shadow-xl">
            <h2 className="text-lg font-bold tracking-tight text-text-primary">
              You've reached your limit 👗
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-primary/70">
              Free plan includes up to 50 wardrobe items. Upgrade to Pro for
              unlimited uploads.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-brand-border/70 bg-white"
                onClick={() => setLimitModalOpen(false)}
              >
                Maybe later
              </Button>
              <Button
                type="button"
                className="rounded-xl"
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

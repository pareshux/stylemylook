'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Loader2, Upload, X } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { WARDROBE_BUCKET } from '@/lib/storage'
import { Button } from '@/components/button'
import { Input } from '@/components/ui/input'

type Row = {
  key: string
  file: File
  preview: string
  status: 'uploading' | 'done' | 'error'
  label: string
  itemId?: string
  storagePath?: string
  imageUrl?: string
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
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [limitChecking, setLimitChecking] = useState(false)

  rowsRef.current = rows

  const doneCount = rows.filter((r) => r.storagePath).length
  const totalCount = rows.length
  const uploadingCount = rows.filter((r) => r.status === 'uploading').length
  const finishedCount = totalCount - uploadingCount
  const progressPct =
    totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0

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
        setRows((prev) =>
          prev.map((r) =>
            r.key === row.key ? { ...r, status: 'error' as const } : r
          )
        )
        return
      }

      const { data: pub } = supabase.storage.from(WARDROBE_BUCKET).getPublicUrl(path)
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

  const handleFilesSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files
      const newFiles = Array.from(list || []).filter((f) =>
        f.type.startsWith('image/')
      )
      if (!newFiles.length || limitChecking) {
        e.target.value = ''
        return
      }

      setLimitChecking(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .maybeSingle()

        const { count } = await supabase
          .from('wardrobe_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if ((profile?.plan ?? 'free') === 'free' && (count ?? 0) >= 50) {
          setLimitModalOpen(true)
          setLimitChecking(false)
          e.target.value = ''
          return
        }
      }

      setPendingFiles((prev) => [...prev, ...newFiles])

      const newRows: Row[] = newFiles.map((file) => ({
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: 'uploading',
        label: '',
      }))

      setRows((prev) => [...prev, ...newRows])
      e.target.value = ''
      setLimitChecking(false)

      await Promise.all(newRows.map((row) => uploadOne(row)))
    },
    [supabase, uploadOne, limitChecking]
  )

  function openPicker() {
    if (!limitChecking) fileInputRef.current?.click()
  }

  useEffect(() => {
    return () => {
      rowsRef.current.forEach((r) => URL.revokeObjectURL(r.preview))
    }
  }, [])

  function removeQueuedRow(rowKey: string) {
    const row = rowsRef.current.find((r) => r.key === rowKey)
    if (!row || row.storagePath) return
    URL.revokeObjectURL(row.preview)
    setRows((prev) => prev.filter((r) => r.key !== rowKey))
    setPendingFiles((prev) => {
      const idx = rowsRef.current.findIndex((r) => r.key === rowKey)
      if (idx < 0 || idx >= prev.length) return prev
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function retryUpload(rowKey: string) {
    const row = rowsRef.current.find((r) => r.key === rowKey)
    if (!row) return
    setRows((prev) =>
      prev.map((r) => (r.key === rowKey ? { ...r, status: 'uploading' } : r))
    )
    await uploadOne(row)
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
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            void handleFilesSelected(e)
          }}
        />

        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openPicker()
            }
          }}
          className="mx-auto flex min-h-[280px] w-full max-w-[860px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#E3DDCF] bg-white px-6 py-10 text-center transition-colors hover:border-text-primary hover:bg-brand-bg"
        >
          <Upload className="mb-4 h-14 w-14 text-text-primary" />
          <h2 className="text-[24px] font-bold text-text-primary">
            Upload wardrobe items
          </h2>
          <p className="mt-2 max-w-xl text-[16px] text-text-secondary">
            Add photos of your clothes, shoes, bags and accessories
          </p>
          <Button
            type="button"
            className="mt-6 rounded-full px-8 py-3"
            onClick={(e) => {
              e.stopPropagation()
              openPicker()
            }}
          >
            Choose photos
          </Button>
        </div>

        {rows.length === 0 ? (
          <p className="mt-3 text-center text-[14px] text-text-muted">
            💡 Tip: You can select all your photos at once from your library
          </p>
        ) : null}

        {rows.length > 0 ? (
          <>
            <div className="mx-auto mt-8 grid max-w-[960px] grid-cols-3 gap-3 md:grid-cols-4">
              {rows.map((row) => (
                <motion.div
                  layout
                  key={row.key}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="overflow-hidden rounded-2xl border border-brand-border/70 bg-white"
                >
                  <div className="relative aspect-square bg-brand-surface">
                    <Image
                      src={row.preview}
                      alt=""
                      fill
                      className="h-full w-full object-cover"
                      unoptimized
                    />

                    {!row.storagePath ? (
                      <button
                        type="button"
                        onClick={() => removeQueuedRow(row.key)}
                        className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
                        aria-label="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}

                    <div className="absolute right-2 top-2">
                      {row.status === 'uploading' ? (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading...
                        </span>
                      ) : row.status === 'done' ? (
                        <span className="rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                          ✓ Added
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Error
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2">
                    {row.status === 'error' ? (
                      <button
                        type="button"
                        onClick={() => void retryUpload(row.key)}
                        className="mb-2 text-[11px] font-medium text-red-600 underline"
                      >
                        Retry upload
                      </button>
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

            <div className="mx-auto mt-5 flex max-w-[960px] justify-center">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-[#2A2A2A] text-[#2A2A2A]"
                onClick={openPicker}
              >
                + Add more photos
              </Button>
            </div>

            {uploadingCount > 0 ? (
              <div className="mx-auto mt-4 w-full max-w-[960px]">
                <p className="mb-2 text-sm text-text-secondary">
                  Uploading {finishedCount} of {totalCount} photos...
                </p>
                <div className="h-1 w-full overflow-hidden rounded bg-brand-border">
                  <div
                    className="h-full rounded bg-text-primary transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {doneCount > 0 ? (
          <>
            <div className="mx-auto mt-8 hidden w-full max-w-[860px] justify-center md:flex">
              <Button
                type="button"
                className="h-14 rounded-full px-12 text-[18px] font-semibold"
                onClick={onComplete}
              >
                {completeLabel}
              </Button>
            </div>

            <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
              <Button
                type="button"
                className="h-14 w-full rounded-full text-[18px] font-semibold shadow-lg"
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

      {/* keep state referenced for explicit multi-select queue semantics */}
      <span className="hidden" aria-hidden>
        {pendingFiles.length}
      </span>
    </div>
  )
}

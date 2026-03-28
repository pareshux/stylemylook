'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

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

export function UnsaveOutfitButton({ suggestionId }: { suggestionId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [working, setWorking] = useState(false)

  async function unsave() {
    if (working) return
    setWorking(true)
    try {
      // Preferred: toggle is_saved false.
      const { error: updateError } = await supabase
        .from('outfit_suggestions')
        .update({ is_saved: false })
        .eq('id', suggestionId)

      // Fallback: delete the row (helps when is_saved column is missing).
      if (updateError) {
        const { error: deleteError } = await supabase
          .from('outfit_suggestions')
          .delete()
          .eq('id', suggestionId)

        if (deleteError) throw deleteError
      }
    } catch {
      // Swallow errors: UI will revalidate either way.
    } finally {
      setWorking(false)
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      onClick={() => void unsave()}
      disabled={working}
      className="flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/65 disabled:pointer-events-none disabled:opacity-70"
      aria-label="Remove from saved outfits"
      title="Remove from saved"
    >
      <TrashIcon />
    </button>
  )
}


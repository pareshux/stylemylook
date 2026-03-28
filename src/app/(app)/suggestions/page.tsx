import { Suspense } from 'react'

import { SuggestionsContent } from './suggestions-content'

function SuggestionsFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] text-sm text-[#1C1C1C]/50">
      Loading…
    </div>
  )
}

export default function SuggestionsPage() {
  return (
    <Suspense fallback={<SuggestionsFallback />}>
      <SuggestionsContent />
    </Suspense>
  )
}

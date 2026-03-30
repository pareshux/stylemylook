import { Suspense } from 'react'

import { SuggestionsContent } from './suggestions-content'

function SuggestionsFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F3EC] text-sm text-[#8A8680]">
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

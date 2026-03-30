'use client'

export function AILoadingState({ event }: { event: string }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-[#E3DDCF]" />
          <div className="h-4 w-32 animate-pulse rounded bg-[#E3DDCF]" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-full bg-[#E3DDCF]" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E3DDCF] bg-white p-6"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="mb-4 h-5 w-40 animate-pulse rounded bg-[#E3DDCF]" />

            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="col-span-2 aspect-square animate-pulse rounded-xl bg-[#E3DDCF]" />
              <div className="col-span-1 flex flex-col gap-2">
                <div className="flex-1 animate-pulse rounded-xl bg-[#E3DDCF]" />
                <div className="flex-1 animate-pulse rounded-xl bg-[#E3DDCF]" />
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <div className="h-3 animate-pulse rounded bg-[#E3DDCF]" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-[#E3DDCF]" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-[#E3DDCF]" />
            </div>

            <div className="mb-3 h-3 w-28 animate-pulse rounded bg-[#E3DDCF]" />
            <div className="mb-4 flex gap-2">
              <div className="h-10 w-full animate-pulse rounded-xl bg-[#E3DDCF]" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-[#E3DDCF]" />
            </div>

            <div className="h-11 animate-pulse rounded-full bg-[#E3DDCF]" />
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 w-full max-w-xs overflow-hidden">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-10"
          style={{ background: 'linear-gradient(to right, #F5F3EC, transparent)' }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-10"
          style={{ background: 'linear-gradient(to left, #F5F3EC, transparent)' }}
        />
        <div className="flex gap-3 animate-marquee py-1">
          {[
            '👗',
            '👠',
            '👜',
            '🧥',
            '💍',
            '👒',
            '🧣',
            '👔',
            '👟',
            '💎',
            '🥿',
            '👛',
            '🌂',
            '⌚',
            '🕶️',
            '👗',
            '👠',
            '👜',
            '🧥',
            '💍',
          ].map((emoji, i) => (
            <div
              key={i}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3DDCF] text-base animate-pulse"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-[#8A8680]">
        Styling your {event} look...
      </p>
    </div>
  )
}


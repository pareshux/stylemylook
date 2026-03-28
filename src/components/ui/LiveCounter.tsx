'use client'

export function LiveCounter() {
  return (
    <p className="text-center text-[16px] font-normal text-[#4E4E4E]">
      <span className="relative mr-1.5 inline-flex h-2 w-2 align-middle">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      612 people already on the waitlist!
      Join them now! No spam, promised.
    </p>
  )
}

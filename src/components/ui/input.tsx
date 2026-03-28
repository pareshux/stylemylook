import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-[#1C1C1C]/12 bg-white px-3 py-2 text-sm text-[#1C1C1C] transition-colors placeholder:text-[#1C1C1C]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8724A]/30 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }

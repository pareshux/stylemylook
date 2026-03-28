import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8724A]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7F2] disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[#E8724A] text-white shadow-sm hover:bg-[#d4633e]',
        outline:
          'border border-[#1C1C1C]/18 bg-transparent text-[#1C1C1C] hover:bg-[#1C1C1C]/[0.06]',
        ghost: 'text-[#1C1C1C] hover:bg-[#1C1C1C]/[0.06]',
        secondary: 'bg-[#1C1C1C] text-[#FAF7F2] hover:bg-[#2d2d2d]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-full px-4 text-[0.8125rem]',
        lg: 'h-12 rounded-full px-8 text-base',
        icon: 'size-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

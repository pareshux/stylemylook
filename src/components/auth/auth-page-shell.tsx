'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center bg-brand-bg p-4 text-text-primary"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

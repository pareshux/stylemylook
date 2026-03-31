import type { NextConfig } from 'next'

let supabaseHost = 'localhost'
try {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (u) supabaseHost = new URL(u).hostname
} catch {
  /* ignore */
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig

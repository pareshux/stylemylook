'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const links = [
  { href: '/home', label: 'Home' },
  { href: '/wardrobe', label: 'Wardrobe' },
  { href: '/saved', label: 'Fav Looks' },
] as const

function linkActive(pathname: string, href: string) {
  if (href === '/home') return pathname === '/home'
  return pathname === href || pathname.startsWith(`${href}/`)
}

type TopNavProps = {
  showUpgradeNudge?: boolean
  usagePercent?: number
  avatarUrl?: string | null
  profileName?: string | null
  profileEmail?: string | null
}

function initialsFromProfile(
  profileName?: string | null,
  profileEmail?: string | null
) {
  const source = profileName || profileEmail || ''
  const trimmed = source.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

export function TopNav({
  showUpgradeNudge = false,
  usagePercent = 0,
  avatarUrl,
  profileName,
  profileEmail,
}: TopNavProps) {
  const pathname = usePathname()
  const clampedUsage = Math.max(0, Math.min(100, usagePercent))
  const radius = 12
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset =
    circumference - (clampedUsage / 100) * circumference
  const initials = initialsFromProfile(profileName ?? undefined, profileEmail)

  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 hidden h-16 border-b border-[#E3DDCF] bg-[#F5F3EC] md:block"
      role="banner"
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center px-8">
        <Link href="/home" className="shrink-0">
          <img
            src="https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/stylemylook_logo.svg"
            alt="StyleMyLook"
            className="h-8 w-auto"
          />
        </Link>
        <nav
          className="flex flex-1 items-center justify-center gap-1"
          aria-label="Main navigation"
        >
          {links.map(({ href, label }) => {
            const active = linkActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#2A2A2A] text-white'
                    : 'text-[#4E4E4E] hover:bg-[#E3DDCF]'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="flex-shrink-0"
            title={`${clampedUsage}% credits used`}
            aria-label="Credits used"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              aria-hidden
            >
              <circle
                cx="16"
                cy="16"
                r={radius}
                fill="none"
                stroke="#E3DDCF"
                strokeWidth="3"
              />
              <circle
                cx="16"
                cy="16"
                r={radius}
                fill="none"
                stroke="#2A2A2A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 16 16)"
              />
              <text
                x="16"
                y="20"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#2A2A2A"
              >
                {clampedUsage}%
              </text>
            </svg>
          </Link>
          {showUpgradeNudge ? (
            <Link
              href="/pricing"
              className="hidden rounded-full bg-[#2A2A2A] px-4 py-1.5 text-[13px] font-medium text-white md:inline-flex"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            >
              Upgrade ✨
            </Link>
          ) : null}
          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#E3DDCF] bg-[#2A2A2A]"
            aria-label="Profile"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profileName || profileEmail || 'Profile'}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-white">
                {initials}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

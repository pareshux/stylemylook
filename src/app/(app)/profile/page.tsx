'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import { createClient } from '@/lib/supabase/client'

type Profile = {
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'pro'
  wardrobe_count: number | null
  suggestions_count: number | null
}

function ProgressBar({
  value,
  max,
}: {
  value: number
  max: number
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const over = pct >= 80
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E3DDCF]">
        <div
          className={`h-2 rounded-full transition-all ${
            over ? 'bg-red-500' : 'bg-[#2A2A2A]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingEmail, setChangingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailMessage, setEmailMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      if (cancelled) return

      setEmail(user.email ?? null)

      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, plan, wardrobe_count, suggestions_count')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled) return

      const merged: Profile = {
        full_name: data?.full_name ?? '',
        avatar_url: data?.avatar_url ?? null,
        plan: (data?.plan as 'free' | 'pro') ?? 'free',
        wardrobe_count: data?.wardrobe_count ?? 0,
        suggestions_count: data?.suggestions_count ?? 0,
      }
      setProfile(merged)

      const fullName = merged.full_name ?? ''
      const parts = fullName.trim().split(/\s+/)
      setFirstName(parts[0] ?? '')
      setLastName(parts.slice(1).join(' '))
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [router, supabase])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const full_name = `${firstName} ${lastName}`.trim() || null
    const { error } = await supabase
      .from('profiles')
      .update({ full_name })
      .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
    if (!error) {
      setProfile((prev) => (prev ? { ...prev, full_name } : prev))
    }
    setSaving(false)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const path = `avatars/${user.id}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (error) return
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const avatar_url = data.publicUrl
    await supabase
      .from('profiles')
      .update({ avatar_url })
      .eq('id', user.id)
    setProfile((prev) => (prev ? { ...prev, avatar_url } : prev))
  }

  async function handleChangeEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailMessage(null)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) {
      setEmailMessage(error.message)
      return
    }
    setEmailMessage(
      `Confirmation email sent to ${newEmail}. Click the link to confirm your new email.`
    )
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const firstLetter =
    (profile?.full_name || email || '')
      .trim()
      .charAt(0)
      .toUpperCase() || '?'

  const wardrobeCount = profile?.wardrobe_count ?? 0
  const suggestionsCount = profile?.suggestions_count ?? 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F5F3EC]"
    >
      <div className="mx-auto max-w-[720px] px-4 py-10 md:px-0 md:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-[#2A2A2A] md:text-3xl">
            Profile
          </h1>
          <p className="mt-1 text-sm text-[#4E4E4E]">
            Manage your account details, plan, and usage.
          </p>
        </header>

        {/* Profile header */}
        <section className="mb-8 rounded-3xl border border-[#E3DDCF] bg-white p-6 md:p-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
            <div className="flex flex-col items-center gap-2 md:items-start">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#2A2A2A] text-2xl font-semibold text-white">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || email || 'Profile avatar'}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{firstLetter}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-[#4E4E4E] underline underline-offset-2"
              >
                Change photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#8A8680]">
                Signed in as
              </p>
              <p className="mt-1 text-base font-medium text-[#2A2A2A]">
                {email ?? '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Edit profile form */}
        <section className="mb-8 rounded-3xl border border-[#E3DDCF] bg-white p-6 md:p-8">
          <h2 className="mb-4 text-lg font-semibold text-[#2A2A2A]">
            Edit profile
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8A8680]">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E3DDCF] bg-[#F5F3EC] px-3 text-sm text-[#2A2A2A]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#8A8680]">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E3DDCF] bg-[#F5F3EC] px-3 text-sm text-[#2A2A2A]"
              />
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8A8680]">
              Email address
            </label>
            <p className="text-sm text-[#2A2A2A]">{email ?? '—'}</p>
            <button
              type="button"
              onClick={() => setChangingEmail((v) => !v)}
              className="text-sm text-[#4E4E4E] underline underline-offset-2"
            >
              Change email
            </button>
          </div>

          {changingEmail ? (
            <form onSubmit={handleChangeEmailSubmit} className="mt-4 space-y-2">
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new-email@example.com"
                className="h-10 w-full rounded-xl border border-[#E3DDCF] bg-[#F5F3EC] px-3 text-sm text-[#2A2A2A]"
              />
              <button
                type="submit"
                className="rounded-full bg-[#2A2A2A] px-5 py-2 text-xs font-semibold text-white"
              >
                Send confirmation
              </button>
              {emailMessage ? (
                <p className="text-xs text-[#4E4E4E]">{emailMessage}</p>
              ) : null}
            </form>
          ) : null}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-[#2A2A2A] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#404040]"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </section>

        {/* Plan & usage */}
        <section className="mb-8 rounded-3xl border border-[#E3DDCF] bg-white p-6 md:p-8">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8680]">
                Your plan
              </p>
              <p className="mt-1 text-base font-semibold text-[#2A2A2A]">
                {profile?.plan === 'pro' ? 'Pro' : 'Free'}
              </p>
            </div>
            {profile?.plan === 'free' ? (
              <button
                type="button"
                onClick={() => router.push('/pricing')}
                className="w-full rounded-full bg-[#2A2A2A] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#404040] md:w-auto"
              >
                Upgrade to Pro →
              </button>
            ) : null}
          </div>

          {profile?.plan === 'pro' ? (
            <p className="text-sm text-[#4E4E4E]">
              You&apos;re on Pro — enjoy unlimited wardrobe items and outfit
              suggestions.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#4E4E4E]">
                  <span>Wardrobe</span>
                  <span>
                    {wardrobeCount}/50 items
                  </span>
                </div>
                <ProgressBar value={wardrobeCount} max={50} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#4E4E4E]">
                  <span>Suggestions</span>
                  <span>
                    {suggestionsCount}/10 used
                  </span>
                </div>
                <ProgressBar value={suggestionsCount} max={10} />
              </div>
            </div>
          )}

          {/* 
          -- Suggested DB columns in Supabase (run once in SQL editor):
          -- alter table public.profiles add column if not exists full_name text;
          -- alter table public.profiles add column if not exists avatar_url text;
          */}
        </section>

        {/* Danger zone */}
        <section className="mb-4 rounded-3xl border border-[#E3DDCF] bg-white p-6 md:p-8">
          <h2 className="mb-3 text-lg font-semibold text-[#2A2A2A]">
            Danger zone
          </h2>
          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-full border border-[#E3DDCF] px-6 py-3 text-sm font-medium text-[#4E4E4E] transition-colors hover:border-red-300 hover:text-red-500"
          >
            Log out
          </button>
        </section>
      </div>
    </motion.div>
  )
}

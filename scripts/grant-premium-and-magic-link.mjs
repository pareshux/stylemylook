/**
 * One-off admin: set Premium on a profile by auth email + print magic login link.
 * Usage: node scripts/grant-premium-and-magic-link.mjs
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * and NEXT_PUBLIC_SITE_URL (for redirect in magic link).
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, '.env.local')

const EMAIL = 'designsbyparesh@gmail.com'

function loadEnvLocal(file) {
  if (!fs.existsSync(file)) {
    console.error('Missing .env.local')
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env) || process.env[key] === '') {
      process.env[key] = val
    }
  }
}

loadEnvLocal(envPath)

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')

if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const target = EMAIL.toLowerCase()
let userId = null
let page = 1
const perPage = 1000

while (!userId && page <= 50) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
  if (error) {
    console.error('listUsers:', error.message)
    process.exit(1)
  }
  const found = data.users.find((u) => (u.email || '').toLowerCase() === target)
  if (found) {
    userId = found.id
    break
  }
  if (data.users.length < perPage) break
  page += 1
}

if (!userId) {
  console.error(`No auth user found for ${EMAIL}`)
  process.exit(1)
}

const { error: upErr } = await supabase
  .from('profiles')
  .update({ plan: 'premium' })
  .eq('id', userId)

if (upErr) {
  console.error('profiles update:', upErr.message)
  process.exit(1)
}

console.log(`Updated profiles.plan=premium for ${EMAIL} (user id ${userId})`)

if (!siteUrl) {
  console.warn(
    'NEXT_PUBLIC_SITE_URL is not set; skipping magic link. Use /login on your deployed site or set the env var and re-run.'
  )
  process.exit(0)
}

const redirectTo = `${siteUrl}/auth/callback`
const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: EMAIL,
  options: { redirectTo },
})

if (linkErr) {
  console.error('generateLink:', linkErr.message)
  process.exit(1)
}

const actionLink = linkData?.properties?.action_link
if (!actionLink) {
  console.error('No action_link in generateLink response')
  process.exit(1)
}

console.log('\nMagic login link (single-use, do not share publicly):')
console.log(actionLink)

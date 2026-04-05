/**
 * POST /api/invites/send for one email (uses INVITE_ADMIN_SECRET from .env.local).
 * Usage: node scripts/send-invite.mjs you@example.com
 */
import fs from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')

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

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error('Usage: node scripts/send-invite.mjs <email>')
  process.exit(1)
}

const secret = process.env.INVITE_ADMIN_SECRET?.trim()
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
if (!secret || !siteUrl) {
  console.error('Need INVITE_ADMIN_SECRET and NEXT_PUBLIC_SITE_URL in .env.local')
  process.exit(1)
}

const res = await fetch(`${siteUrl}/api/invites/send`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${secret}`,
  },
  body: JSON.stringify({ email }),
})

const text = await res.text()
console.log(res.status, text)
if (!res.ok) process.exit(1)

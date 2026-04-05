-- Run in Supabase SQL Editor (Dashboard → SQL) to grant Premium by email.
-- Idempotent: safe to re-run for the same user.

update public.profiles p
set plan = 'premium'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('designsbyparesh@gmail.com');

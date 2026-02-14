# Supabase Hardening Checklist

Use this checklist to close abuse vectors for visitor counters and guestbook.
Concrete migration included:
- `supabase/migrations/20260214_guestbook_and_counter_hardening.sql`

## 1. RLS Baseline

- Enable RLS on `public.page_views` and `public.guestbook_messages`.
- `anon` role:
  - `SELECT` allowed on both tables.
  - direct `INSERT/UPDATE/DELETE` denied on both tables.

## 2. Replace Direct Writes with RPC

- Keep direct table writes blocked.
- Expose only controlled RPC functions:
  - `increment_page_view(page_slug text)`
  - `submit_guestbook_message(name text, message text, honeypot text default '')`

Each RPC should validate:

- input length limits
- required fields
- URL/link spam patterns (for guestbook)
- cooldown/rate limit per client identity

## 3. Rate Limits

- Create a `request_limits` table keyed by `(bucket, client_id)`.
- Derive `client_id` from request headers (`x-forwarded-for`) plus coarse UA hash.
- Enforce:
  - visitor counter: e.g. 1 increment per `page_slug` per client per day
  - guestbook submit: e.g. 1 submit every 30s, plus hourly cap

## 4. Data Integrity

- On `page_views.slug`, enforce unique index.
- Add check constraints for length:
  - `guestbook_messages.name <= 50`
  - `guestbook_messages.message <= 500`

## 5. Monitoring

- Log RPC failures and rejects.
- Alert on bursts from one IP range / UA.
- Periodically purge stale rate-limit rows.

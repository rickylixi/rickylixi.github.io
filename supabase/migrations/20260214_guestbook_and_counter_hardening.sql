-- Harden visitor counter and guestbook against abuse.
-- Safe to run multiple times.

begin;

-- 1) Basic integrity constraints.
alter table if exists public.page_views
  add constraint page_views_slug_not_empty check (length(trim(slug)) > 0) not valid;
alter table if exists public.page_views validate constraint page_views_slug_not_empty;

create unique index if not exists page_views_slug_key on public.page_views (slug);

alter table if exists public.guestbook_messages
  add constraint guestbook_name_length check (char_length(name) between 1 and 50) not valid;
alter table if exists public.guestbook_messages validate constraint guestbook_name_length;

alter table if exists public.guestbook_messages
  add constraint guestbook_message_length check (char_length(message) between 2 and 500) not valid;
alter table if exists public.guestbook_messages validate constraint guestbook_message_length;

-- 2) Simple rate-limit bucket table.
create table if not exists public.request_limits (
  bucket text not null,
  client_id text not null,
  last_seen timestamptz not null default now(),
  hits integer not null default 1,
  primary key (bucket, client_id)
);

-- 3) Utility helpers.
create or replace function public.extract_client_id()
returns text
language plpgsql
stable
as $$
declare
  headers jsonb;
  forwarded_for text;
  user_agent text;
  ip text;
begin
  headers := coalesce(current_setting('request.headers', true), '{}')::jsonb;
  forwarded_for := coalesce(headers ->> 'x-forwarded-for', '');
  user_agent := coalesce(headers ->> 'user-agent', '');
  ip := split_part(forwarded_for, ',', 1);
  ip := trim(ip);
  if ip = '' then
    ip := 'unknown-ip';
  end if;
  return md5(ip || '|' || left(user_agent, 160));
end;
$$;

create or replace function public.take_rate_limit(
  p_bucket text,
  p_window interval,
  p_max_hits integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id text;
  v_now timestamptz;
  v_last timestamptz;
  v_hits integer;
begin
  v_client_id := public.extract_client_id();
  v_now := now();

  insert into public.request_limits (bucket, client_id, last_seen, hits)
  values (p_bucket, v_client_id, v_now, 1)
  on conflict (bucket, client_id)
  do update set
    hits = case
      when public.request_limits.last_seen < (v_now - p_window) then 1
      else public.request_limits.hits + 1
    end,
    last_seen = v_now
  returning last_seen, hits into v_last, v_hits;

  return v_hits <= p_max_hits;
end;
$$;

grant execute on function public.extract_client_id() to anon, authenticated;
grant execute on function public.take_rate_limit(text, interval, integer) to anon, authenticated;

-- 4) RPC: increment page view.
create or replace function public.increment_page_view(page_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_ok boolean;
begin
  v_slug := trim(coalesce(page_slug, ''));
  if char_length(v_slug) = 0 or char_length(v_slug) > 240 then
    raise exception 'invalid page_slug';
  end if;

  -- 1 increment per slug/day/client.
  v_ok := public.take_rate_limit('view:' || v_slug, interval '1 day', 1);
  if not v_ok then
    return;
  end if;

  insert into public.page_views (slug, view_count)
  values (v_slug, 1)
  on conflict (slug)
  do update set view_count = public.page_views.view_count + 1;
end;
$$;

grant execute on function public.increment_page_view(text) to anon, authenticated;

-- 5) RPC: submit guestbook message.
create or replace function public.submit_guestbook_message(
  p_name text,
  p_message text,
  p_honeypot text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_message text;
  v_ok boolean;
begin
  -- Honey pot is expected to stay empty.
  if coalesce(trim(p_honeypot), '') <> '' then
    raise exception 'blocked';
  end if;

  v_name := left(trim(coalesce(p_name, 'Anonymous')), 50);
  if v_name = '' then
    v_name := 'Anonymous';
  end if;

  v_message := trim(coalesce(p_message, ''));
  if char_length(v_message) < 2 or char_length(v_message) > 500 then
    raise exception 'invalid message length';
  end if;

  -- Basic anti-link filter.
  if position('http://' in lower(v_message)) > 0
     or position('https://' in lower(v_message)) > 0
     or position('[url]' in lower(v_message)) > 0 then
    raise exception 'links are not allowed';
  end if;

  -- Cooldown and burst caps.
  v_ok := public.take_rate_limit('guestbook:30s', interval '30 seconds', 1);
  if not v_ok then
    raise exception 'rate limited';
  end if;
  v_ok := public.take_rate_limit('guestbook:1h', interval '1 hour', 8);
  if not v_ok then
    raise exception 'hourly limit reached';
  end if;

  insert into public.guestbook_messages (name, message)
  values (v_name, v_message);
end;
$$;

grant execute on function public.submit_guestbook_message(text, text, text) to anon, authenticated;

-- 6) RLS policies.
alter table if exists public.page_views enable row level security;
alter table if exists public.guestbook_messages enable row level security;
alter table if exists public.request_limits enable row level security;

drop policy if exists page_views_read_anon on public.page_views;
create policy page_views_read_anon
  on public.page_views
  for select
  to anon, authenticated
  using (true);

drop policy if exists page_views_no_direct_write on public.page_views;
create policy page_views_no_direct_write
  on public.page_views
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists guestbook_read_anon on public.guestbook_messages;
create policy guestbook_read_anon
  on public.guestbook_messages
  for select
  to anon, authenticated
  using (true);

drop policy if exists guestbook_no_direct_write on public.guestbook_messages;
create policy guestbook_no_direct_write
  on public.guestbook_messages
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists request_limits_block_client on public.request_limits;
create policy request_limits_block_client
  on public.request_limits
  for all
  to anon, authenticated
  using (false)
  with check (false);

commit;

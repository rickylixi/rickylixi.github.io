-- increment_page_view now returns the current view count so the client can
-- render the number without a follow-up SELECT round-trip.
--
-- Backward compatible: clients that ignore the return value keep working,
-- and legacy clients that call a void function are unaffected because
-- PostgREST simply omits the JSON body either way.
--
-- Safe to run multiple times.

create or replace function public.increment_page_view(page_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_ok boolean;
  v_count integer := 0;
begin
  v_slug := trim(coalesce(page_slug, ''));
  if char_length(v_slug) = 0 or char_length(v_slug) > 240 then
    raise exception 'invalid page_slug';
  end if;

  -- 1 increment per slug/day/client.
  v_ok := public.take_rate_limit('view:' || v_slug, interval '1 day', 1);
  if v_ok then
    insert into public.page_views (slug, view_count)
    values (v_slug, 1)
    on conflict (slug)
    do update set view_count = public.page_views.view_count + 1
    returning view_count into v_count;
  else
    -- Already counted for this client today; report the current total.
    select view_count into v_count
    from public.page_views
    where slug = v_slug;
    if not found then
      v_count := 0;
    end if;
  end if;

  return v_count;
end;
$$;

grant execute on function public.increment_page_view(text) to anon, authenticated;

-- The browser must call only the two public RPC entry points.  These helpers
-- are SECURITY DEFINER implementation details; exposing take_rate_limit lets
-- an anonymous caller create arbitrary buckets in request_limits.
begin;

revoke execute on function public.extract_client_id() from public, anon, authenticated;
revoke execute on function public.take_rate_limit(text, interval, integer) from public, anon, authenticated;

-- Keep the intended browser-facing functions explicit after the revocation.
grant execute on function public.increment_page_view(text) to anon, authenticated;
grant execute on function public.submit_guestbook_message(text, text, text) to anon, authenticated;

commit;

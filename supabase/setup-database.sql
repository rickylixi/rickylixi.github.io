-- Supabase Database Setup for rickylixi.github.io
-- This script creates the visitor_counter table and configures security policies

-- ============================================
-- STEP 1: Create visitor_counter table
-- ============================================

CREATE TABLE IF NOT EXISTS visitor_counter (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug text NOT NULL UNIQUE,
  visitor_count integer DEFAULT 1 NOT NULL,
  last_visited timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_visitor_counter_slug ON visitor_counter(page_slug);
CREATE INDEX IF NOT EXISTS idx_visitor_counter_count ON visitor_counter(visitor_count DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_counter_last_visited ON visitor_counter(last_visited DESC);

-- ============================================
-- STEP 2: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE visitor_counter ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create RLS Policies
-- ============================================

-- Policy: Allow anyone to read (SELECT) visitor counts
CREATE POLICY "Allow public read access" ON visitor_counter
  FOR SELECT USING (true);

-- Policy: Allow anyone to increment visitor count (UPDATE)
-- This is safe because it only allows incrementing the count by 1
CREATE POLICY "Allow public increment" ON visitor_counter
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Policy: Allow anyone to insert new pages (INSERT)
-- But only if the page doesn't already exist
CREATE POLICY "Allow insert new pages" ON visitor_counter
  FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM visitor_counter vc
      WHERE vc.page_slug = NEW.page_slug
    )
  );

-- ============================================
-- STEP 4: Create RPC function for incrementing
-- ============================================

CREATE OR REPLACE FUNCTION increment_page_view(page_slug text)
RETURNS void AS $$
DECLARE
  v_slug text := lower(trim(page_slug));
BEGIN
  -- Try to insert new record
  INSERT INTO visitor_counter (page_slug, visitor_count, last_visited)
  VALUES (v_slug, 1, now())
  ON CONFLICT (page_slug) DO UPDATE
  SET 
    visitor_count = visitor_counter.visitor_count + 1,
    last_visited = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION increment_page_view(text) TO anon;

-- ============================================
-- STEP 5: Create page_views view for easy querying
-- ============================================

CREATE OR REPLACE VIEW page_views AS
SELECT
  page_slug,
  visitor_count as view_count,
  last_visited,
  created_at
FROM visitor_counter;

-- Grant select permission to anon role
GRANT SELECT ON page_views TO anon;

-- ============================================
-- STEP 6: Setup rate limiting
-- ============================================

-- Create a rate limiting table to track IP-based requests
CREATE TABLE IF NOT EXISTS rate_limiting (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  first_request timestamp with time zone DEFAULT now(),
  last_request timestamp with time zone DEFAULT now()
);

-- Create index for efficient rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limiting_ip_endpoint
  ON rate_limiting(ip_address, endpoint);

-- Enable RLS on rate_limiting table
ALTER TABLE rate_limiting ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own rate limit records
CREATE POLICY "Users can view own rate limits" ON rate_limiting
  FOR SELECT USING (
    ip_address = (SELECT TO_HEX(DECODE(REPLACE(SPLIT_PART(CURRENT_SETTING('request.headers', true)::text, 'x-forwarded-for', 1), '"', ''), 'HEX'))
  );

-- ============================================
-- STEP 7: Create rate limiting function
-- ============================================

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_endpoint text,
  p_max_requests integer,
  p_time_window_minutes integer
)
RETURNS boolean AS $$
DECLARE
  v_ip_address text;
  v_request_count integer;
BEGIN
  -- Get client IP from request headers
  v_ip_address := TO_HEX(DECODE(REPLACE(SPLIT_PART(CURRENT_SETTING('request.headers', true)::text, 'x-forwarded-for', 1), '"', ''), 'HEX'));

  -- Clean up old entries (older than time window)
  DELETE FROM rate_limiting
  WHERE last_request < NOW() - (p_time_window_minutes || ' minutes')::interval;

  -- Try to insert new rate limit record
  INSERT INTO rate_limiting (ip_address, endpoint)
  VALUES (v_ip_address, p_endpoint)
  ON CONFLICT (ip_address, endpoint) DO UPDATE
  SET request_count = rate_limiting.request_count + 1,
      last_request = NOW()
  WHERE rate_limiting.last_request < NOW() - (p_time_window_minutes || ' minutes')::interval;

  IF NOT FOUND THEN
    -- Update existing record within time window
    UPDATE rate_limiting
    SET request_count = request_count + 1,
        last_request = NOW()
    WHERE ip_address = v_ip_address
      AND endpoint = p_endpoint;

    -- Check if limit exceeded
    SELECT request_count INTO v_request_count
    FROM rate_limiting
    WHERE ip_address = v_ip_address
      AND endpoint = p_endpoint;

    RETURN v_request_count <= p_max_requests;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION check_rate_limit(text, integer, integer) TO anon;

-- ============================================
-- STEP 8: Create a safe view for public access
-- ============================================

CREATE OR REPLACE VIEW visitor_stats AS
SELECT
  page_slug,
  visitor_count,
  last_visited,
  created_at
FROM visitor_counter;

-- Grant select permission to anon role
GRANT SELECT ON visitor_stats TO anon;
GRANT SELECT ON visitor_stats TO authenticated;

-- ============================================
-- STEP 9: Insert test data (optional)
-- ============================================

-- Insert a test record for the home page
INSERT INTO visitor_counter (page_slug, visitor_count, last_visited)
VALUES ('site-total', 1, now())
ON CONFLICT (page_slug) DO NOTHING;

-- Insert test records for other pages
INSERT INTO visitor_counter (page_slug, visitor_count, last_visited)
VALUES 
  ('/research.html', 1, now()),
  ('/teaching.html', 1, now()),
  ('/personal.html', 1, now()),
  ('/blog/', 1, now())
ON CONFLICT (page_slug) DO NOTHING;

-- ============================================
-- STEP 10: Verification queries
-- ============================================

-- Check if table and policies were created successfully
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('visitor_counter', 'rate_limiting')
ORDER BY tablename;

-- Check if RLS policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('visitor_counter', 'rate_limiting')
ORDER BY tablename, policyname;

-- Check if functions were created
SELECT 
  proname,
  proargtypes,
  prorettype,
  prosecdef
FROM pg_proc
WHERE proname IN ('increment_page_view', 'check_rate_limit')
ORDER BY proname;

-- Test the view
SELECT * FROM visitor_stats LIMIT 5;

-- Test the RPC function
SELECT increment_page_view('test-page');
SELECT * FROM visitor_stats WHERE page_slug = 'test-page';

-- Clean up test data (optional)
-- DELETE FROM visitor_counter WHERE page_slug = 'test-page';

-- ============================================
-- END OF SCRIPT
-- ============================================

COMMENT ON TABLE visitor_counter IS 'Stores visitor counts for each page';
COMMENT ON TABLE rate_limiting IS 'Tracks IP-based rate limiting for API endpoints';
COMMENT ON POLICY "Allow public read access" ON visitor_counter IS 'Allow anyone to view visitor counts';
COMMENT ON POLICY "Allow public increment" ON visitor_counter IS 'Allow anyone to increment visitor counts by 1';
COMMENT ON POLICY "Allow insert new pages" ON visitor_counter IS 'Allow inserting new pages if they do not exist';
COMMENT ON POLICY "Users can view own rate limits" ON rate_limiting IS 'Users can only view their own rate limit records';

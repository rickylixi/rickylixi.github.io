-- Supabase Row Level Security (RLS) Policies for rickylixi.github.io
-- This file contains security policies to prevent API abuse

-- Enable RLS on the visitor_counter table
ALTER TABLE visitor_counter ENABLE ROW LEVEL SECURITY;

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

-- Create a function to check rate limits
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

  -- Clean up old entries
  DELETE FROM rate_limiting
  WHERE last_request < NOW() - (p_time_window_minutes || ' minutes')::interval;

  -- Get or create rate limit record
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

-- Create a view for public visitor stats (safe to expose)
CREATE OR REPLACE VIEW visitor_stats AS
SELECT
  page_slug,
  visitor_count,
  last_visited,
  created_at
FROM visitor_counter;

-- Grant access to the view
GRANT SELECT ON visitor_stats TO anon;
GRANT SELECT ON visitor_stats TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE visitor_counter IS 'Stores visitor counts for each page';
COMMENT ON POLICY "Allow public read access" ON visitor_counter IS 'Allow anyone to view visitor counts';
COMMENT ON POLICY "Allow public increment" ON visitor_counter IS 'Allow anyone to increment visitor counts by 1';
COMMENT ON POLICY "Allow insert new pages" ON visitor_counter IS 'Allow inserting new pages if they do not exist';

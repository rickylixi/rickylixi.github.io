#!/usr/bin/env node
/**
 * Supabase Database Setup Script
 * Automatically creates tables, RLS policies, and functions
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://dtiivkyoieucoqkivfha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aWl2a3lvaWV1Y29xa2l2ZmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjAzMjAsImV4cCI6MjA4MTI5NjMyMH0.KbmvXU1aUft7adEAhVNPEDp8dVdY-4QwkrK8vHyLfII';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Optional, for admin operations

// SQL Commands
const SQL_COMMANDS = [
  // Create visitor_counter table
  `CREATE TABLE IF NOT EXISTS visitor_counter (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    page_slug text NOT NULL UNIQUE,
    visitor_count integer DEFAULT 1 NOT NULL,
    last_visited timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_visitor_counter_slug ON visitor_counter(page_slug);`,
  `CREATE INDEX IF NOT EXISTS idx_visitor_counter_count ON visitor_counter(visitor_count DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_visitor_counter_last_visited ON visitor_counter(last_visited DESC);`,

  // Enable RLS
  `ALTER TABLE visitor_counter ENABLE ROW LEVEL SECURITY;`,

  // Create RLS policies
  `CREATE POLICY "Allow public read access" ON visitor_counter
    FOR SELECT USING (true);`,

  `CREATE POLICY "Allow public increment" ON visitor_counter
    FOR UPDATE USING (true)
    WITH CHECK (true);`,

  `CREATE POLICY "Allow insert new pages" ON visitor_counter
    FOR INSERT WITH CHECK (
      NOT EXISTS (
        SELECT 1 FROM visitor_counter vc
        WHERE vc.page_slug = NEW.page_slug
      )
    );`,

  // Create RPC function
  `CREATE OR REPLACE FUNCTION increment_page_view(page_slug text)
  RETURNS void AS $$
  DECLARE
    v_slug text := lower(trim(page_slug));
  BEGIN
    INSERT INTO visitor_counter (page_slug, visitor_count, last_visited)
    VALUES (v_slug, 1, now())
    ON CONFLICT (page_slug) DO UPDATE
    SET 
      visitor_count = visitor_counter.visitor_count + 1,
      last_visited = now();
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;`,

  `GRANT EXECUTE ON FUNCTION increment_page_view(text) TO anon;`,

  // Create page_views view
  `CREATE OR REPLACE VIEW page_views AS
  SELECT
    page_slug,
    visitor_count as view_count,
    last_visited,
    created_at
  FROM visitor_counter;`,

  `GRANT SELECT ON page_views TO anon;`,

  // Create rate_limiting table
  `CREATE TABLE IF NOT EXISTS rate_limiting (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address text NOT NULL,
    endpoint text NOT NULL,
    request_count integer DEFAULT 1,
    first_request timestamp with time zone DEFAULT now(),
    last_request timestamp with time zone DEFAULT now()
  );`,

  `CREATE INDEX IF NOT EXISTS idx_rate_limiting_ip_endpoint ON rate_limiting(ip_address, endpoint);`,

  `ALTER TABLE rate_limiting ENABLE ROW LEVEL SECURITY;`,

  `CREATE POLICY "Users can view own rate limits" ON rate_limiting
    FOR SELECT USING (
      ip_address = (SELECT TO_HEX(DECODE(REPLACE(SPLIT_PART(CURRENT_SETTING('request.headers', true)::text, 'x-forwarded-for', 1), '"', ''), 'HEX'))
    );`,

  // Create rate limiting function
  `CREATE OR REPLACE FUNCTION check_rate_limit(
    p_endpoint text,
    p_max_requests integer,
    p_time_window_minutes integer
  )
  RETURNS boolean AS $$
  DECLARE
    v_ip_address text;
    v_request_count integer;
  BEGIN
    v_ip_address := TO_HEX(DECODE(REPLACE(SPLIT_PART(CURRENT_SETTING('request.headers', true)::text, 'x-forwarded-for', 1), '"', ''), 'HEX'));

    DELETE FROM rate_limiting
    WHERE last_request < NOW() - (p_time_window_minutes || ' minutes')::interval;

    INSERT INTO rate_limiting (ip_address, endpoint)
    VALUES (v_ip_address, p_endpoint)
    ON CONFLICT (ip_address, endpoint) DO UPDATE
    SET request_count = rate_limiting.request_count + 1,
        last_request = NOW()
    WHERE rate_limiting.last_request < NOW() - (p_time_window_minutes || ' minutes')::interval;

    IF NOT FOUND THEN
      UPDATE rate_limiting
      SET request_count = request_count + 1,
          last_request = NOW()
      WHERE ip_address = v_ip_address
        AND endpoint = p_endpoint;

      SELECT request_count INTO v_request_count
      FROM rate_limiting
      WHERE ip_address = v_ip_address
        AND endpoint = p_endpoint;

      RETURN v_request_count <= p_max_requests;
    END IF;

    RETURN true;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;`,

  `GRANT EXECUTE ON FUNCTION check_rate_limit(text, integer, integer) TO anon;`,

  // Create visitor_stats view
  `CREATE OR REPLACE VIEW visitor_stats AS
  SELECT
    page_slug,
    visitor_count,
    last_visited,
    created_at
  FROM visitor_counter;`,

  `GRANT SELECT ON visitor_stats TO anon;`,
  `GRANT SELECT ON visitor_stats TO authenticated;`,

  // Insert test data
  `INSERT INTO visitor_counter (page_slug, visitor_count, last_visited)
  VALUES ('site-total', 1, now())
  ON CONFLICT (page_slug) DO NOTHING;`,
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupSupabase() {
  log('\n🚀 Starting Supabase Database Setup', 'cyan');
  log('=====================================', 'cyan');

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test connection first
    log('\n📡 Testing connection...', 'blue');
    const { data: testData, error: testError } = await supabase.rpc('increment_page_view', { page_slug: 'test' });
    
    if (testError && testError.code !== '42883') { // 42883 = function does not exist (expected)
      log('❌ Connection failed:', 'red');
      log(testError.message, 'red');
      return false;
    }
    
    log('✅ Connection successful!', 'green');

    // Execute SQL commands
    log('\n🔧 Executing setup commands...', 'blue');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < SQL_COMMANDS.length; i++) {
      const sql = SQL_COMMANDS[i];
      const commandName = sql.substring(0, 50).replace(/\n/g, ' ') + '...';
      
      try {
        // Use the raw SQL execution endpoint
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        });

        if (response.ok || response.status === 200 || response.status === 201) {
          log(`✅ Command ${i + 1}/${SQL_COMMANDS.length}: Success`, 'green');
          successCount++;
        } else {
          const errorData = await response.text().catch(() => 'Unknown error');
          // Ignore "already exists" errors
          if (errorData.includes('already exists') || errorData.includes('duplicate')) {
            log(`⚠️  Command ${i + 1}/${SQL_COMMANDS.length}: Already exists (skipped)`, 'yellow');
            successCount++;
          } else {
            log(`❌ Command ${i + 1}/${SQL_COMMANDS.length}: Failed`, 'red');
            log(`   Error: ${errorData}`, 'red');
            errorCount++;
          }
        }
      } catch (error) {
        log(`❌ Command ${i + 1}/${SQL_COMMANDS.length}: Exception`, 'red');
        log(`   ${error.message}`, 'red');
        errorCount++;
      }
    }

    log('\n' + '='.repeat(50), 'cyan');
    log('📊 Setup Summary:', 'cyan');
    log(`   ✅ Successful: ${successCount}`, 'green');
    log(`   ❌ Failed: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    log(`   📋 Total: ${SQL_COMMANDS.length}`, 'blue');
    log('='.repeat(50), 'cyan');

    if (errorCount === 0) {
      log('\n🎉 Setup completed successfully!', 'green');
      log('\n🔍 Verification steps:', 'blue');
      log('   1. Visit your website and check visitor counter');
      log('   2. Check Supabase Console > Database > Tables');
      log('   3. Verify RLS policies are enabled');
      log('\n📖 Next steps:', 'yellow');
      log('   - Update _config.yml with new ANON KEY if needed');
      log('   - Run: npm install to install dependencies');
      log('   - Run: npm run build to build the site');
      return true;
    } else {
      log('\n⚠️  Setup completed with some errors', 'yellow');
      log('   Check the errors above and try again', 'yellow');
      return false;
    }

  } catch (error) {
    log('\n❌ Setup failed with exception:', 'red');
    log(error.message, 'red');
    if (error.stack) {
      log('\nStack trace:', 'red');
      log(error.stack, 'red');
    }
    return false;
  }
}

// Run setup
if (require.main === module) {
  setupSupabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { setupSupabase, SQL_COMMANDS };

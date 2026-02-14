/**
 * Visitor counter with defensive networking and client-side deduplication.
 * Note: real abuse prevention must be enforced in database RLS / RPC logic.
 */

const RPC_INCREMENT_PATH = '/rest/v1/rpc/increment_page_view';
const SELECT_VIEW_PATH = '/rest/v1/page_views';
const REQUEST_TIMEOUT_MS = 8000;

function getSupabaseConfig() {
  const configEl = document.getElementById('supabase-config');
  if (configEl) {
    try {
      const cfg = JSON.parse(configEl.textContent || '{}');
      if (cfg.supabaseUrl && cfg.supabaseAnonKey) return cfg;
    } catch (e) {
      // Ignore parse failure.
    }
  }
  return null;
}

function buildHeaders(apiKey) {
  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
}

async function fetchWithTimeout(url, options, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function getSessionDedupKey(slug) {
  const day = new Date().toISOString().slice(0, 10);
  return `vc:incremented:${slug}:${day}`;
}

function shouldIncrement(slug) {
  const key = getSessionDedupKey(slug);
  try {
    if (sessionStorage.getItem(key) === '1') return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch (e) {
    // If storage is unavailable, still proceed once per page load.
    return true;
  }
}

async function incrementPageView(config, slug) {
  if (!shouldIncrement(slug)) return;
  const headers = buildHeaders(config.supabaseAnonKey);
  const response = await fetchWithTimeout(
    `${config.supabaseUrl}${RPC_INCREMENT_PATH}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ page_slug: slug })
    }
  );
  if (!response.ok) {
    throw new Error(`Increment failed: HTTP ${response.status}`);
  }
}

async function fetchViewCount(config, slug) {
  const headers = {
    apikey: config.supabaseAnonKey,
    Authorization: `Bearer ${config.supabaseAnonKey}`
  };
  const url = `${config.supabaseUrl}${SELECT_VIEW_PATH}?slug=eq.${encodeURIComponent(slug)}&select=view_count`;
  const response = await fetchWithTimeout(url, { headers });
  if (!response.ok) {
    throw new Error(`Fetch count failed: HTTP ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data) || !data[0] || typeof data[0].view_count !== 'number') {
    return null;
  }
  return data[0].view_count;
}

function renderCount(counterEl, count) {
  if (count === null) return;
  if (counterEl.id === 'visitor-count') {
    counterEl.innerText = count.toLocaleString();
    counterEl.style.opacity = '1';
  } else {
    counterEl.innerText = `${count} views`;
  }
}

function handleCounterFailure(counterEl) {
  if (!counterEl) return;
  if (counterEl.id === 'page-views') {
    counterEl.style.display = 'none';
    return;
  }
  counterEl.innerText = '--';
  counterEl.style.opacity = '1';
}

async function processCounter(counterEl, config) {
  if (!counterEl) return;
  const slug = counterEl.getAttribute('data-slug') || window.location.pathname;
  try {
    await incrementPageView(config, slug);
    const count = await fetchViewCount(config, slug);
    renderCount(counterEl, count);
  } catch (e) {
    console.error('View counter error for', counterEl.id || slug, e);
    handleCounterFailure(counterEl);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const config = getSupabaseConfig();
  const counters = [
    document.getElementById('visitor-count'),
    document.getElementById('page-views')
  ].filter(Boolean);

  if (!config) {
    counters.forEach(handleCounterFailure);
    return;
  }

  for (const counterEl of counters) {
    await processCounter(counterEl, config);
  }
});

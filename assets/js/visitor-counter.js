/**
 * Visitor counter with defensive networking, rate limiting, and client-side deduplication.
 * Enhanced with exponential backoff retry and comprehensive error handling.
 */

const RPC_INCREMENT_PATH = "/rest/v1/rpc/increment_page_view";
const SELECT_VIEW_PATH = "/rest/v1/page_views";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 3;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const DEBUG_VISITOR_COUNTER = (() => {
  try {
    return localStorage.getItem("visitor-counter:debug") === "1";
  } catch (e) {
    return false;
  }
})();

function debugWarn(...args) {
  if (DEBUG_VISITOR_COUNTER) console.warn(...args);
}

function debugError(...args) {
  if (DEBUG_VISITOR_COUNTER) console.error(...args);
}

function trackingAllowed() {
  const localHosts = ["localhost", "127.0.0.1", "::1"];
  return !(
    localHosts.includes(window.location.hostname) ||
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1" ||
    navigator.globalPrivacyControl === true
  );
}

// Client-side rate limiter
class RateLimiter {
  constructor(maxRequests = MAX_REQUESTS_PER_WINDOW, windowMs = RATE_LIMIT_WINDOW_MS) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // Remove requests outside the window
    this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);
    return this.requests.length < this.maxRequests;
  }

  recordRequest() {
    this.requests.push(Date.now());
  }
}

const rateLimiter = new RateLimiter();

function getSupabaseConfig() {
  const configEl = document.getElementById("supabase-config");
  if (configEl) {
    try {
      const cfg = JSON.parse(configEl.textContent || "{}");
      if (cfg.supabaseUrl && cfg.supabaseAnonKey) return cfg;
    } catch (e) {
      debugError("Failed to parse Supabase config:", e);
    }
  }
  return null;
}

function buildHeaders(apiKey) {
  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Client-Info": `visitor-counter-js/1.0`,
  };
}

async function fetchWithTimeout(url, options, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url, options, maxRetries = MAX_RETRIES) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Exponential backoff between retries: 100ms, 400ms
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, i * i * 100));
      }
      return await fetchWithTimeout(url, options);
    } catch (error) {
      lastError = error;
      // Don't retry on abort errors or client errors (4xx)
      if (error.name === 'AbortError' || (error.response && error.response.status >= 400 && error.response.status < 500)) {
        throw error;
      }
      debugWarn(`Request failed (attempt ${i + 1}/${maxRetries}):`, error);
    }
  }
  throw lastError;
}

function getSessionDedupKey(slug) {
  const day = new Date().toISOString().slice(0, 10);
  return `vc:incremented:${slug}:${day}`;
}

function shouldIncrement(slug) {
  const key = getSessionDedupKey(slug);
  try {
    return localStorage.getItem(key) !== "1";
  } catch (e) {
    // If storage is unavailable, still proceed once per page load.
    return true;
  }
}

function markAsIncremented(slug) {
  const key = getSessionDedupKey(slug);
  try {
    localStorage.setItem(key, "1");
  } catch (e) {
    // Ignore storage errors (private mode, quota, etc.)
  }
}

async function incrementPageView(config, slug) {
  if (!shouldIncrement(slug)) return null;

  // Check rate limit
  if (!rateLimiter.canMakeRequest()) {
    debugWarn("Rate limit exceeded for incrementPageView");
    throw new Error("Rate limit exceeded. Please try again later.");
  }
  rateLimiter.recordRequest();

  const headers = buildHeaders(config.supabaseAnonKey);
  let response;
  let count = null;

  try {
    response = await fetchWithRetry(
      `${config.supabaseUrl}${RPC_INCREMENT_PATH}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ page_slug: slug }),
      },
    );
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("Request timeout. Please check your connection.");
    }
    throw error;
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read error response');
    debugError(`Increment failed: HTTP ${response.status}`, errorBody);

    // Handle specific error cases
    if (response.status === 429) {
      throw new Error("Too many requests. Please try again later.");
    } else if (response.status >= 400 && response.status < 500) {
      throw new Error(`Client error: ${response.status}. Please check your configuration.`);
    } else if (response.status >= 500) {
      throw new Error(`Server error: ${response.status}. Please try again later.`);
    }

    throw new Error(`Increment failed: HTTP ${response.status}`);
  }

  // Mark as successfully incremented in client storage
  markAsIncremented(slug);

  // Newer RPC returns the updated count directly (saves a SELECT round-trip).
  // Legacy void-returning RPC yields no JSON body, leaving count as null.
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    await response.json().then((value) => {
      if (typeof value === 'number' && value >= 0) count = value;
    }).catch(() => {
      // Ignore JSON parse errors for empty responses
    });
  }

  return count;
}

async function fetchViewCount(config, slug) {
  // Check rate limit
  if (!rateLimiter.canMakeRequest()) {
    debugWarn("Rate limit exceeded for fetchViewCount");
    throw new Error("Rate limit exceeded. Please try again later.");
  }
  rateLimiter.recordRequest();

  const headers = buildHeaders(config.supabaseAnonKey);
  const url = `${config.supabaseUrl}${SELECT_VIEW_PATH}?slug=eq.${encodeURIComponent(slug)}&select=view_count`;

  let response;
  try {
    response = await fetchWithRetry(url, { headers });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("Request timeout. Please check your connection.");
    }
    throw error;
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read error response');
    debugError(`Fetch count failed: HTTP ${response.status}`, errorBody);

    if (response.status === 404) {
      // Page not found in database, return 0
      return 0;
    } else if (response.status === 429) {
      throw new Error("Too many requests. Please try again later.");
    }

    throw new Error(`Fetch count failed: HTTP ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    debugError("Failed to parse JSON response:", error);
    throw new Error("Invalid response format from server");
  }

  if (
    !Array.isArray(data) ||
    !data[0] ||
    typeof data[0].view_count !== "number"
  ) {
    // Return 0 if data structure is invalid (page might not exist yet)
    return 0;
  }
  return data[0].view_count;
}

function renderCount(counterEl, count) {
  if (count === null) return;

  // Remove loading state and reveal the counter (it starts hidden so that
  // users without JavaScript never see a stale "Loading views..." label).
  counterEl.classList.remove('loading');
  counterEl.hidden = false;

  if (counterEl.id === "visitor-count") {
    counterEl.innerText = count.toLocaleString();
    counterEl.style.opacity = "1";
  } else {
    const wrapper = document.getElementById("page-views-wrapper");
    if (wrapper) wrapper.hidden = false;
    counterEl.innerText = `${count} views`;
  }
}

function handleCounterFailure(counterEl) {
  if (!counterEl) return;

  counterEl.classList.remove('loading');

  if (counterEl.id === "page-views") {
    const wrapper = document.getElementById("page-views-wrapper");
    if (wrapper) wrapper.style.display = "none";
    counterEl.style.display = "none";
    return;
  }

  const badge = counterEl.closest(".visitor-badge");
  if (badge) {
    badge.style.display = "none";
  } else {
    counterEl.style.display = "none";
  }
}

function showLoadingState(counterEl) {
  if (!counterEl) return;
  counterEl.classList.add('loading');
  counterEl.style.opacity = "0.7";
}

async function processCounter(counterEl, config) {
  if (!counterEl) return;

  const slug = counterEl.getAttribute("data-slug") || window.location.pathname;

  // Show loading state
  showLoadingState(counterEl);

  try {
    // Increment view count. Returns the new total when the RPC supports it,
    // null otherwise (legacy function or already-counted session).
    const counted = await incrementPageView(config, slug);

    let count;
    if (typeof counted === 'number' && counted >= 0) {
      count = counted;
    } else {
      // Fall back to a separate fetch (also covers deduplicated sessions).
      count = await fetchViewCount(config, slug);
    }

    // Render the count
    renderCount(counterEl, count);
  } catch (error) {
    debugError("View counter error for", counterEl.id || slug, error);
    handleCounterFailure(counterEl);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const config = getSupabaseConfig();
  const counters = [
    document.getElementById("visitor-count"),
    document.getElementById("page-views"),
  ].filter(Boolean);

  if (!trackingAllowed()) {
    counters.forEach(handleCounterFailure);
    return;
  }

  if (!config) {
    debugWarn("Supabase config not found. Visitor counter disabled.");
    counters.forEach(handleCounterFailure);
    return;
  }

  // Process counters sequentially to avoid overwhelming the API
  for (const counterEl of counters) {
    try {
      await processCounter(counterEl, config);
    } catch (error) {
      debugError(`Failed to process counter ${counterEl.id}:`, error);
    }
  }
});

/**
 * Shared Visitor Counter Script
 * Handles page view incrementing and displaying counts via Supabase REST API.
 * 
 * Usage:
 * <span id="view-count" data-slug="/some-page">...</span>
 * <script src="/assets/js/visitor-counter.js" defer></script>
 */

document.addEventListener("DOMContentLoaded", async function() {
  const counterEl = document.getElementById('visitor-count') || document.getElementById('page-views');
  
  // If no counter element exists, do nothing
  if (!counterEl) return;

  try {
    // Determine page slug: priority to data-slug attribute, fallback to current pathname
    // For site-total, default.html passes 'site-total' via data-slug (we need to add this)
    // For posts, post.html passes pathname
    const pageSlug = counterEl.getAttribute('data-slug') || window.location.pathname;

    const headers = {
      'apikey': window.SUPABASE_KEY,
      'Content-Type': 'application/json'
    };

    // 1. Increment usage via RPC
    await fetch(window.SUPABASE_URL + '/rest/v1/rpc/increment_page_view', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ page_slug: pageSlug })
    });

    // 2. Fetch updated count
    const res = await fetch(
      window.SUPABASE_URL + '/rest/v1/page_views?slug=eq.' + encodeURIComponent(pageSlug) + '&select=view_count',
      { headers: { 'apikey': window.SUPABASE_KEY } }
    );
    const data = await res.json();

    if (data && data[0] && data[0].view_count) {
      if (counterEl.id === 'visitor-count') {
          // Footer total style
          counterEl.innerText = data[0].view_count.toLocaleString();
          counterEl.style.opacity = 1;
      } else {
          // Post page style
          counterEl.innerText = data[0].view_count + ' views';
      }
    }
  } catch (e) {
    console.error('View counter error:', e);
    // Graceful degradation - leave loading state or hide
    if (counterEl.id === 'page-views') {
        counterEl.style.display = 'none';
    }
  }
});

---
---
const ASSET_MANIFEST = {{ site.data['asset-manifest'] | jsonify }};
const CACHE_VERSION = (ASSET_MANIFEST && ASSET_MANIFEST.hash) ? ASSET_MANIFEST.hash : 'v5';
const STATIC_CACHE = `rickylixi-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rickylixi-runtime-${CACHE_VERSION}`;
const PAGE_CACHE = `rickylixi-pages-${CACHE_VERSION}`;
const DEBUG_SERVICE_WORKER = false;

// Keep the runtime cache bounded so large files (e.g. teaching PDFs) cannot
// grow it without limit. Oldest entries are evicted first.
const MAX_RUNTIME_CACHE_ENTRIES = 30;
const MAX_PAGE_CACHE_ENTRIES = 10;

// Core static assets - critical for offline functionality
const CORE_STATIC_URLS = [
  '/',
  '/stylesheets/styles.min.css',
  '/assets/js/theme.js',
  '/assets/js/privacy-consent.js',
  '/image/x-logo-192.png',
  '/manifest.json',
  '/offline.html',
  '/404.html'
];

// Extended static assets - nice to have but not critical
const EXTENDED_STATIC_URLS = [
  '/assets/js/visitor-counter.js',
  '/javascripts/accordion.js',
  '/image/optimized/ai-xi.avif',
  '/image/optimized/turing-machine1.avif',
  '/assets/asset-manifest.json',
  '/favicon.ico',
  '/assets/fonts/inter-latin.woff2',
  '/assets/fonts/inter-latin-ext.woff2',
  '/image/x-logo-32.png',
  '/image/x-logo-512.png',
  '/image/apple-touch-icon.png'
];

const STATIC_URLS = [...CORE_STATIC_URLS, ...EXTENDED_STATIC_URLS];

// Logging utility
function log(message, type = 'info') {
  if (!DEBUG_SERVICE_WORKER) return;

  const prefix = '[Service Worker]';
  const timestamp = new Date().toISOString().substring(11, 19);
  
  switch(type) {
    case 'error':
      console.error(`${prefix} [${timestamp}] ❌ ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} [${timestamp}] ⚠️ ${message}`);
      break;
    case 'success':
    case 'green':
    case 'cyan':
    case 'blue':
    case 'yellow':
      console.log(`${prefix} [${timestamp}] ${message}`);
      break;
    default:
      console.log(`${prefix} [${timestamp}] ℹ️ ${message}`);
  }
}

function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin;
}

function isNavigationalRequest(request) {
  return request.mode === 'navigate';
}

function isStaticAssetRequest(requestUrl) {
  return (
    requestUrl.pathname.startsWith('/stylesheets/') ||
    requestUrl.pathname.startsWith('/assets/') ||
    requestUrl.pathname.startsWith('/image/') ||
    requestUrl.pathname.startsWith('/javascripts/')
  );
}

// Evict oldest entries once the runtime cache exceeds maxEntries.
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await cache.delete(keys[0]);
  return trimCache(cacheName, maxEntries);
}

function cacheResponse(request, response, cacheName, maxEntries, event) {
  if (!response || !response.ok) return;
  const copy = response.clone();
  const write = caches.open(cacheName)
    .then(cache => cache.put(request, copy))
    .then(() => trimCache(cacheName, maxEntries))
    .catch(() => undefined);
  event.waitUntil(write);
}

function networkFirst(request, event) {
  return fetch(request)
    .then(response => {
      cacheResponse(request, response, PAGE_CACHE, MAX_PAGE_CACHE_ENTRIES, event);
      return response;
    })
    .catch(() =>
      caches.match(request).then(cached =>
        cached || caches.match('/').then(home =>
          home || caches.match('/offline.html')
        )
      )
    );
}

function cacheFirst(request, event) {
  return caches.match(request).then(cached => {
    if (cached) return cached;

    return fetch(request)
      .then(response => {
        cacheResponse(request, response, RUNTIME_CACHE, MAX_RUNTIME_CACHE_ENTRIES, event);
        return response;
      })
      .catch(() =>
        // Network failed and nothing cached: serve the offline fallback
        // instead of letting respondWith() reject into a browser error page.
        caches.match('/offline.html').then(offline => offline || Response.error())
      );
  });
}

function staleWhileRevalidate(request, event) {
  return caches.match(request).then(cached => {
    const networkPromise = fetch(request)
      .then(response => {
        cacheResponse(request, response, RUNTIME_CACHE, MAX_RUNTIME_CACHE_ENTRIES, event);
        return response;
      })
      .catch(() => null);

    if (cached) {
      event.waitUntil(networkPromise);
      return cached;
    }
    return networkPromise;
  });
}

self.addEventListener('install', event => {
  log('Service Worker installing...', 'cyan');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      let successCount = 0;
      let failCount = 0;
      
      // First, cache core assets (critical for offline)
      log('Caching core assets...', 'blue');
      for (const url of CORE_STATIC_URLS) {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response && response.ok) {
            await cache.put(url, response.clone());
            successCount++;
          } else {
            log(`⚠️ Failed to cache (status ${response.status}): ${url}`, 'yellow');
            failCount++;
          }
        } catch (e) {
          log(`⚠️ Failed to cache (network error): ${url}`, 'yellow');
          failCount++;
        }
      }
      
      // Then, cache extended assets (non-critical)
      log('Caching extended assets...', 'blue');
      for (const url of EXTENDED_STATIC_URLS) {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response && response.ok) {
            await cache.put(url, response.clone());
            successCount++;
          }
        } catch (e) {
          // Non-critical assets can fail silently
        }
      }
      
      log(`✅ Cached ${successCount} assets, ${failCount} failed`, successCount > 0 ? 'green' : 'yellow');
    })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  log('Service Worker activating...', 'cyan');
  
  event.waitUntil(
    caches.keys().then(async names => {
      const deletePromises = names.map(name => {
        const isOldCache = name.startsWith('rickylixi-') && 
                          name !== STATIC_CACHE && 
                           name !== RUNTIME_CACHE &&
                           name !== PAGE_CACHE;
        
        if (isOldCache) {
          log(`🗑️ Deleting old cache: ${name}`, 'yellow');
          return caches.delete(name);
        }
        return Promise.resolve();
      });
      
      await Promise.all(deletePromises);
      log('✅ Cache cleanup complete', 'green');
      await self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || !isSameOrigin(url)) {
    log(`Skipping ${request.method} request to ${url.origin}`, 'warn');
    return;
  }

  // Handle navigation requests (pages).
  // networkFirst() already falls back to cache → offline.html internally.
  if (isNavigationalRequest(request)) {
    log(`Navigational request: ${url.pathname}`, 'cyan');
    event.respondWith(networkFirst(request, event));
    return;
  }

  // Handle static asset requests
  if (isStaticAssetRequest(url)) {
    log(`Static asset: ${url.pathname}`, 'info');
    event.respondWith(staleWhileRevalidate(request, event));
    return;
  }

  // Default: cache first for other same-origin requests
  log(`Other request: ${url.pathname}`, 'info');
  event.respondWith(cacheFirst(request, event));
});

---
  ---
// Enhanced Service Worker with versioning and cache strategies
const ASSET_MANIFEST = {{ site.data['asset-manifest'] | jsonify }};
const STYLESHEET_PATH = (ASSET_MANIFEST && ASSET_MANIFEST.styles) ? ASSET_MANIFEST.styles : '/stylesheets/styles.min.css';
const CACHE_VERSION = 'v4';
const CACHE_NAME = `rickylixi-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  STYLESHEET_PATH,
  '/javascripts/accordion.js',
  '/image/turing-machine1.png',
  '/image/optimized/ai-xi.webp',
  '/manifest.json',
  '/assets/asset-manifest.json'
];

// Install event - cache resources with network-first fallback
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url)
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
                throw new Error(`Failed to cache: ${url}`);
              })
              .catch(error => {
                console.warn(`Could not cache ${url}:`, error);
              });
          })
        );
      })
  );
});

// Fetch event - cache-first with network fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          // Update cache in background
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => { }); // Silent fail for background update
          return cachedResponse;
        }

        // Fetch from network if not in cache
        return fetch(event.request)
          .then(networkResponse => {
            // Cache successful responses
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('rickylixi-')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

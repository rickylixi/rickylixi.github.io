---
---
const ASSET_MANIFEST = {{ site.data['asset-manifest'] | jsonify }};
const CACHE_VERSION = (ASSET_MANIFEST && ASSET_MANIFEST.hash) ? ASSET_MANIFEST.hash : 'v5';
const STATIC_CACHE = `rickylixi-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rickylixi-runtime-${CACHE_VERSION}`;

const STATIC_URLS = [
  '/',
  '/stylesheets/styles.min.css',
  '/assets/js/theme.js',
  '/assets/js/visitor-counter.js',
  '/javascripts/accordion.js',
  '/image/x-logo.png',
  '/image/optimized/ai-xi.avif',
  '/image/optimized/turing-machine1.avif',
  '/manifest.json',
  '/assets/asset-manifest.json'
];

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

function networkFirst(request) {
  return fetch(request)
    .then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => caches.match(request).then(cached => cached || caches.match('/')));
}

function staleWhileRevalidate(request) {
  return caches.match(request).then(cached => {
    const networkPromise = fetch(request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => null);

    return cached || networkPromise;
  });
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      for (const url of STATIC_URLS) {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response && response.ok) {
            await cache.put(url, response.clone());
          }
        } catch (e) {
          // Ignore cache warm-up failures; runtime strategies will handle misses.
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.map(name => {
        const isOldRickylixiCache = name.startsWith('rickylixi-') && name !== STATIC_CACHE && name !== RUNTIME_CACHE;
        if (isOldRickylixiCache) return caches.delete(name);
        return Promise.resolve();
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !isSameOrigin(url)) return;

  if (url.pathname.startsWith('/rest/v1/') || url.pathname.startsWith('/auth/v1/')) {
    return;
  }

  if (isNavigationalRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAssetRequest(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

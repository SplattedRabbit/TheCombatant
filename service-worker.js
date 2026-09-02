const CACHE_NAME = 'dnd-combatsheet-v6.0.0-cache-v156';
const ASSETS = [
  './dist/assets/app-core-BecE9DFb.css',
  './dist/assets/app-core-CZAnBFtJ.js',
  './dist/assets/BaseDialogs-DxH0phdZ.js',
  './dist/assets/data-registry-D2LrqZgJ.js',
  './dist/assets/icon-192-BiJXAwPn.png',
  './dist/assets/main-rg9-kysa.js',
  './dist/assets/react-vendor-B7Y6DWK4.js',
  './dist/assets/state-core-C1C6_sLn.js',
  './dist/assets/supabase-vendor-D2FXGQ6J.js',
  './dist/assets/vendor-Cgi6DKmr.js',
  './dist/data/spells-ca.json',
  './dist/data/spells-cs.json',
  './dist/data/spells-phb.json',
  './dist/data/spells-phb2.json',
  './dist/icon-192.png',
  './dist/icon-512.png',
  './dist/index.html',
  './dist/manifest.json'
];


// Install event - caching assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching all modular assets for offline capability');
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Asset caching warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - cleaning old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network-First (Network falling back to cache)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(networkResponse => {
      // If network response is valid and successful, cache it and return
      if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.url.includes('googleapis.com') || networkResponse.url.includes('gstatic.com'))) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      // If network fails (e.g. offline), fall back to cache
      return caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        console.log('Fetch failed and no cache found, offline mode active.');
        return new Response('Offline and resource not cached', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      });
    })
  );
});

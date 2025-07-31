const CACHE_NAME = 'david-aghayan-v3';
const urlsToCache = [
  '/',
  '/static/fonts/inter.css',
  '/static/fonts/inter-variable.woff2', 
  '/static/fonts/inter-variable-latin-ext.woff2',
  '/static/js/vendor/gsap.min.js',
  '/static/js/vendor/ScrollTrigger.min.js',
  '/static/js/vendor/ScrollToPlugin.min.js',
  '/static/js/vendor/three.module.min.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Update cache when new version is available
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
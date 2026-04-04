const CACHE_NAME = 'digiprompts-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/herramientas.html',
  '/blog.html',
  '/canales.html',
  '/chatbot.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Cache HTML pages, serve stale-while-revalidate
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          const fresh = fetch(e.request).then(res => {
            cache.put(e.request, res.clone());
            return res;
          });
          return cached || fresh;
        })
      )
    );
  }
});

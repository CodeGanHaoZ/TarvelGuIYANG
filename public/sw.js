// Opt-in, device-local cache. No background uploads or cloud synchronization.
const CACHE = 'qianlv-resources-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((k) => k.startsWith('qianlv-resources-') && k !== CACHE)
              .map((k) => caches.delete(k)),
          ),
        ),
    ]),
  );
});
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS') return;
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        const urls = event.data.urls.filter(
          (url) =>
            new URL(url, self.location.origin).origin === self.location.origin,
        );
        await Promise.all(
          urls.map(async (url) => {
            const response = await fetch(url, { credentials: 'same-origin' });
            if (!response.ok) throw new Error('Resource failed');
            await cache.put(url, response);
          }),
        );
        event.ports[0]?.postMessage({ ok: true });
      } catch {
        event.ports[0]?.postMessage({ ok: false });
      }
    })(),
  );
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/__') ||
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('_rsc')
  )
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request);
        if (
          response.ok &&
          (request.mode === 'navigate' ||
            /\.(js|css|png|jpg|svg|woff2?)(\?|$)/.test(url.pathname))
        )
          await cache.put(request, response.clone());
        return response;
      } catch {
        const hit =
          (await cache.match(request)) ||
          (request.mode === 'navigate' ? await cache.match('/') : null);
        return (
          hit ||
          new Response('离线资源未缓存，请联网后重新准备离线访问。', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        );
      }
    })(),
  );
});

// Offline support for the installed game. Network first, so every visit gets the newest build; when the
// network is gone, the last copy of each file is served from the cache. The scripts listed in index.html are
// cached at install, everything else (images, fonts) as it is first loaded. Online services (Supabase, GitHub)
// are never cached.
const CACHE = 'aodai-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const html = await (await fetch('./index.html', { cache: 'no-cache' })).text();
    const files = ['./', './index.html', './manifest.webmanifest'].concat([...html.matchAll(/src="(js\/[^"]+)"/g)].map((m) => './' + m[1]));
    await Promise.all(files.map((f) => c.add(new Request(f, { cache: 'no-cache' })).catch(() => {})));
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin && !/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(r);
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)); }
      return res;
    } catch (err) {
      const hit = await caches.match(r, { ignoreSearch: r.mode === 'navigate' });
      if (hit) return hit;
      if (r.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});

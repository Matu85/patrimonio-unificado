/* Service Worker · Patrimonio Unificado
   Hace que la app funcione offline y se instale como aplicación nativa.
   Estrategia pensada para una app financiera:
   - Navegación (el HTML): RED PRIMERO, con copia en caché como respaldo offline.
     Así siempre se ve la última versión cuando hay internet, y abre aunque no haya.
   - Estáticos propios (iconos, manifest, config): stale-while-revalidate (rápido y se refresca solo).
   - Tipografías de Google: cache-first (no cambian).
   - Precios y Firebase (otros dominios): NUNCA se cachean → nunca se muestran datos viejos. */

const VERSION = 'pu-v3';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

/* App shell: lo mínimo para arrancar sin red */
const SHELL_ASSETS = [
  './',
  './index.html',
  './firebase-config.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './favicon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL)
      .then((c) => c.addAll(SHELL_ASSETS).catch(() => {}))  /* si falla algún asset, no rompe la instalación */
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();   /* permite actualizar al instante */
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                    /* solo GET */
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  /* Datos en vivo y Firebase: dejar pasar a la red sin tocar (nunca cachear precios) */
  if (!sameOrigin) {
    const host = url.hostname;
    if (host.includes('fonts.googleapis.com') || host.includes('fonts.gstatic.com')) {
      event.respondWith(cacheFirst(req));              /* tipografías: cache-first */
    }
    return;                                            /* resto cross-origin (APIs, Firebase): sin SW */
  }

  /* Navegación (abrir la app): red primero, respaldo a caché → funciona offline */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { cachePut(SHELL, req, res.clone()); return res; })
        .catch(() => caches.match('./index.html').then((m) => m || caches.match('./')))
    );
    return;
  }

  /* Estáticos propios: responde de caché y refresca en segundo plano */
  event.respondWith(staleWhileRevalidate(req));
});

function cachePut(cacheName, req, res) {
  if (res && res.ok) caches.open(cacheName).then((c) => c.put(req, res));
}
function cacheFirst(req) {
  return caches.match(req).then((hit) => hit || fetch(req).then((res) => { cachePut(RUNTIME, req, res.clone()); return res; }).catch(() => hit));
}
function staleWhileRevalidate(req) {
  return caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => { cachePut(RUNTIME, req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  });
}

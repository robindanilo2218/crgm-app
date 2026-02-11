/**
 * CRGM-API Service Worker
 * Estrategia: Network-First con Cache Fallback
 * Sin pre-caching para evitar errores de inicialización
 * Versión 3: Auth fixes + PWA integrity check
 */

const CACHE_NAME = 'crgm-api-v3';
const VERSION = '3.0.0';

// Instalación - Sin pre-cache
self.addEventListener('install', event => {
  console.log(`[SW] Instalando Service Worker v${VERSION}...`);
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

// Activación - Limpiar caches antiguos
self.addEventListener('activate', event => {
  console.log(`[SW] Activando Service Worker v${VERSION}...`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Eliminando cache antiguo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] ✓ Service Worker activado');
      return self.clients.claim();
    })
  );
});

// Fetch - Network-First, Cache Fallback
self.addEventListener('fetch', event => {
  // Ignorar requests que no sean GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es exitosa, cachearla
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(error => {
        // Si falla la red, buscar en cache
        console.log('[SW] Network failed, trying cache:', event.request.url);

        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('[SW] ✓ Serving from cache:', event.request.url);
            return cachedResponse;
          }

          // Si es navegación y no hay cache, devolver index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }

          // Si no hay nada, lanzar el error
          throw error;
        });
      })
  );
});

// Mensaje desde la app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }).then(() => {
        console.log('[SW] ✓ Cache limpiado');
      })
    );
  }
});

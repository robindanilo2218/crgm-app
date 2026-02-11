const CACHE_NAME = 'crgm-os-v1';
const ASSETS = [
    './',
    './index.html',
    './css/industrial.css',
    './js/app.js',
    './js/database.js',
    './js/modules/scanner.js',
    './js/modules/loto.js',
    './js/modules/diagrams.js',
    './js/modules/backup.js',
    'https://unpkg.com/html5-qrcode', // Cachear librerías externas
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});
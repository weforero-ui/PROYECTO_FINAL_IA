/**
 * Service Worker para SignosSemáforo
 * Soporte 100% Offline (PWA) compatible con GitHub Pages
 */

const CACHE_NAME = 'signos-semaforo-v6';
const ASSETS_TO_CACHE = [
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './img/buho-uniboyaca.png',
  './img/logo-uniboyaca-oficial-recortado.png',
  './img/nurse-hero.svg',
  './img/tensio-pa.svg',
  './img/cardio-fc.svg',
  './img/pulmon-fr.svg',
  './img/termo-temp.svg',
  './img/oximetro-spo2.svg',
  './img/kardex-report.svg',
  './img/triage-semaforo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

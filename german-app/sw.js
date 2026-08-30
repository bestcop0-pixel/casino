const CACHE_NAME = 'deutsch-lernen-v3';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/ui.js',
  './js/progress.js',
  './js/exercises.js',
  './js/speech.js',
  './js/spaced-repetition.js',
  './js/data-words-a1.js',
  './js/data-words-a2.js',
  './js/data-words-b1.js',
  './js/data-words-b2.js',
  './js/data-dialogs.js',
  './js/data-grammar.js',
  './js/data-reading.js',
  './js/data-writing.js',
  './js/data-speaking.js',
  './js/data-handbook.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Сеть в приоритете (чтобы всегда видеть свежую версию при наличии интернета),
// а кэш — только как запасной вариант для офлайн-режима.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(res => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
      return res;
    }).catch(() => caches.match(event.request))
  );
});

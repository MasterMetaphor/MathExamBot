const CACHE_NAME = 'math-bot-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './quiz.html',
  './topics.html',
  './static/styles.css',
  './static/script.js',
  './static/question-bank.js',
  './static/manifest.json',
  './static/icon-192.png',
  './static/icon-512.png',
  './static/mascot_idle_1.png',
  './static/mascot_idle_2.png',
  './static/mascot_correct_1.png',
  './static/mascot_correct_2.png',
  './static/mascot_correct_3.png',
  './static/mascot_correct_4.png',
  './static/mascot_incorrect_1.png',
  './static/mascot_incorrect_2.png',
  './static/mascot_incorrect_3.png',
  './static/mascot_incorrect_4.png',
  './static/alien.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response as it's a stream and can only be consumed once
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      }).catch(function() {
        // If both fetch and cache fail, show a generic fallback:
        return caches.match('./index.html');
      })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
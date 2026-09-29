/*
 * ORGANIZE service worker — offline after first load.
 * Strategy: precache the whole app on install; network-first for same-origin
 * GETs (so edits to content.js show up when online), falling back to cache
 * when offline. No third-party requests exist.
 * Bump VERSION when files are added or renamed.
 */
var VERSION = 'organize-v1.1.0-1';
var ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/content.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];
var TIMEOUT_MS = 2500;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function fromCache(request) {
  return caches.open(VERSION).then(function (cache) {
    return cache.match(request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (request.mode === 'navigate') return cache.match('./index.html');
      return undefined;
    });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(new Promise(function (resolve) {
    var settled = false;
    function settle(res) { if (!settled && res) { settled = true; resolve(res); } }

    var timer = setTimeout(function () {
      fromCache(req).then(settle);
    }, TIMEOUT_MS);

    fetch(req).then(function (res) {
      clearTimeout(timer);
      if (res && res.ok && res.type === 'basic') {
        var copy = res.clone();
        caches.open(VERSION).then(function (cache) { cache.put(req, copy); });
      }
      settle(res);
    }).catch(function () {
      clearTimeout(timer);
      fromCache(req).then(function (hit) {
        settle(hit || new Response('Offline', { status: 503, statusText: 'Offline' }));
      });
    });
  }));
});

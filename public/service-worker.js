const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  './index.html',
  './css/styles.css',
  './js/index.js',
  './js/idb.js',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
];

self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url);
  // intercepts http response in order to sent resources to the service-worker
  e.respondWith(
    // caches.match() method is used to match the request with the same resource that is within the cache IF it exists.
    caches.match(e.request).then((request) => {
      if (request) {
        // if cache is available, respond with cache
        console.log('responding with cache : ' + e.request.url);
        return request;
      } else {
        // if there are no cache, try fetching request
        console.log('file is not cached, fetching :' + e.request.url);
        return fetch(e.request);
      }
    })
  );
});

// Using self instead of window because the service-worker loads before the window
self.addEventListener('install', function (e) {
  // waitUntil will wait until the enclosing code is finished executing
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('installing cache : ' + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    // caches.keys() method will return a promise with an array of the cache keys
    caches.keys().then((keyList) => {
      let cacheKeeplist = keyList.filter(function (key) {
        // any key that has an index value that === APP_PREFIX will be used to be inserted into the KeepList
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map((key, i) => {
          // will only return a value of '-1' if this item is not found in the keeplist
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log('deleting cache :' + keyList[i]);
            // if this key isn't found in the keyList, delete it from the cache.
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

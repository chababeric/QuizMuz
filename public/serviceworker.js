const CACHE_NAME = "version-2";
const urlsToCache = [ '/', 'offline.html' ] ;

const self = this;

// Install SW
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');

            return cache.addAll(urlsToCache);
        })
    )
});


// Listen for requests
self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    // Built assets have hashed file names and never change: serve them from the cache first
    if (url.origin === self.location.origin && url.pathname.startsWith('/build/assets/')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) =>
                cache.match(request).then((cached) =>
                    cached || fetch(request).then((response) => {
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    })
                )
            )
        );
        return;
    }

    // Page loads: go to the network, show the offline page if it is unreachable
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('offline.html'))
        );
    }

    // Everything else (API calls, audio, Inertia requests) goes straight to the network
});

// Activate the SW
self.addEventListener('activate', (event) => {
    const cacheWhiteList = [];
    cacheWhiteList.push(CACHE_NAME);

    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if(!cacheWhiteList.includes(cacheName)) {
                    return caches.delete(cacheName);
                }
            })
        ))
    )
});

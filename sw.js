// =========================================================================
// SERVICE WORKER - Mein Schulplaner
// =========================================================================
// Cache-Strategie: "Cache First, Network Fallback"
// Alle App-Dateien werden beim ersten Aufruf gespeichert und danach
// IMMER aus dem Cache geladen -> volle Offline-Funktion.
//
// WICHTIG BEI UPDATES:
// Wenn du index.html, manifest.json oder andere Dateien änderst,
// erhöhe CACHE_VERSION (z.B. 'v1' -> 'v2'). Sonst lädt die App
// weiterhin die alte, zwischengespeicherte Version!
// =========================================================================

const CACHE_VERSION = 'v3';
const CACHE_NAME = `schulplaner-cache-${CACHE_VERSION}`;

// Alle Dateien, die für den Offline-Betrieb nötig sind.
// Pfade sind relativ zum Service-Worker-Standort.
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './css/tailwind.css',
    './js/vue.global.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png'
];

// =========================================================================
// INSTALL: Alle Assets in den Cache laden
// =========================================================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // addAll bricht ab, wenn EINE Datei fehlt - daher einzeln mit
                // Fehlerbehandlung, damit ein fehlendes Icon nicht die ganze
                // Installation blockiert.
                return Promise.all(
                    ASSETS_TO_CACHE.map((url) =>
                        cache.add(url).catch((err) => {
                            console.warn('Service Worker: Konnte nicht cachen:', url, err);
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

// =========================================================================
// ACTIVATE: Alte Cache-Versionen aufräumen
// =========================================================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('schulplaner-cache-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// =========================================================================
// FETCH: Cache First, Network Fallback
// =========================================================================
self.addEventListener('fetch', (event) => {
    // Nur GET-Requests behandeln (POST/PUT etc. durchreichen)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // Nicht im Cache -> versuche Netzwerk, und cache das Ergebnis
            // für nächstes Mal (z.B. falls externe Fonts erst online geladen werden)
            return fetch(event.request).then((networkResponse) => {
                // Nur erfolgreiche, "basic"-Antworten cachen (keine Fehlerseiten,
                // keine opaken Cross-Origin-Antworten von Drittseiten)
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Komplett offline und nicht im Cache:
                // Bei Navigationsanfragen (Seitenaufruf) die index.html als Fallback liefern
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                // Sonst: Fehler durchreichen
                return new Response('Offline - Datei nicht im Cache verfügbar.', {
                    status: 503,
                    statusText: 'Offline'
                });
            });
        })
    );
});

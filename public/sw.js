/**
 * VENUE — Progressive Web App Service Worker
 *
 * Designed specifically for the VENUE academic platform:
 * - Caches only the minimum static application shell and safe static assets.
 * - Enforces Network-First for navigation to ensure live academic and student content.
 * - NEVER intercepts or caches requests to /api/, Firebase domains, Google auth,
 *   telemetry, student records, grades, private materials, or AI responses.
 * - Safely cleans up only obsolete 'venue-shell-*' caches without touching
 *   user storage, IndexedDB, Firestore, or localStorage.
 */

const CACHE_NAME = 'venue-shell-v2';

// Minimum safe static application shell assets
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
];

// 1. Install event — precache static shell and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('VENUE PWA: Precache failed, continuing installation:', err);
      })
  );
});

// 2. Activate event — remove only obsolete VENUE shell caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            // Delete only obsolete caches created by this VENUE service worker
            if (name.startsWith('venue-shell-') && name !== CACHE_NAME) {
              return caches.delete(name);
            }
            return Promise.resolve(false);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Fetch event — strict filtering to protect student data and APIs
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET') {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (!url.protocol.startsWith('http')) {
    return;
  }

  // RULE 1: Never intercept or cache external domains (Firebase, Google Auth, cloud APIs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // RULE 2: Never intercept or cache internal API routes (/api/*)
  // This guarantees student profiles, results, AI tutor chats, materials, and auth are never cached by SW
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // RULE 3: Navigation requests — Network-first with offline fallback to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.headers.get('content-type') || '').includes('text/html')
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline or network unavailable, fall back to cached application shell
          const cachedShell =
            (await caches.match(request)) ||
            (await caches.match('/index.html')) ||
            (await caches.match('/'));
          if (cachedShell) {
            return cachedShell;
          }
          return new Response(
            '<!doctype html><html><body style="font-family:sans-serif;background:#070b14;color:#f1f5f9;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;padding:24px;"><h2>VENUE Offline</h2><p>Please check your internet connection to continue.</p></div></body></html>',
            {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
              status: 503,
              statusText: 'Service Unavailable',
            }
          );
        })
    );
    return;
  }

  // RULE 4: Safe versioned static assets (JS, CSS, static images, fonts) — Stale-While-Revalidate / Cache-First
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            // Never cache an HTML page served in place of a JS/CSS/image file
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              !(networkResponse.headers.get('content-type') || '').includes('text/html')
            ) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return empty or fail gracefully if network fails and not in cache
            return new Response('', { status: 408, statusText: 'Request Timed Out' });
          });
      })
    );
    return;
  }

  // All other same-origin requests bypass the service worker
});

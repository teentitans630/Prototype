// Smart Referral System - Enhanced Offline Service Worker
const STATIC_CACHE_NAME = 'smart-referral-static-v2';
const DATA_CACHE_NAME = 'smart-referral-patient-data-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
];

// 1. Install Event: Pre-cache static UI shell and icons
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Message Event: Direct sync for Patient Referral & QR Pass Data
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  if (type === 'CACHE_PATIENT_REFERRAL_DATA' && payload) {
    try {
      const dataCache = await caches.open(DATA_CACHE_NAME);
      const serialized = JSON.stringify(payload);
      
      const response = new Response(serialized, {
        headers: {
          'Content-Type': 'application/json',
          'X-Smart-Referral-Offline': 'true',
          'X-Cache-Time': payload.lastUpdated || new Date().toISOString(),
        },
      });

      // Cache under standard offline API endpoints
      await dataCache.put('/api/patient-referrals', response.clone());
      await dataCache.put('/api/offline-data', response.clone());

      if (payload.activePatientId) {
        await dataCache.put(`/api/patient/${payload.activePatientId}/referral`, response.clone());
      }

      // Notify clients of successful offline sync
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'PATIENT_DATA_CACHED_CONFIRMATION',
          timestamp: payload.lastUpdated || new Date().toISOString(),
          statusCount: payload.referrals?.length || 0,
        });
      });
    } catch (err) {
      console.error('Service Worker: Failed to cache patient referral data', err);
    }
  }

  if (type === 'GET_CACHED_PATIENT_DATA') {
    try {
      const dataCache = await caches.open(DATA_CACHE_NAME);
      const cached = await dataCache.match('/api/patient-referrals');
      if (cached && event.source) {
        const data = await cached.json();
        event.source.postMessage({
          type: 'CACHED_PATIENT_DATA_RESPONSE',
          data,
        });
      }
    } catch (err) {
      console.error('Service Worker: Failed to retrieve cached patient data', err);
    }
  }

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch Event: Handle Navigation, Data Requests, and Static Assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  // A. Intercept offline data API endpoints (/api/*)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If network succeeds, clone and update data cache
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline or network fails, serve from data cache
          const dataCache = await caches.open(DATA_CACHE_NAME);
          const cachedData = await dataCache.match(request);
          if (cachedData) return cachedData;

          // Fallback to primary patient-referrals cache
          const defaultData = await dataCache.match('/api/patient-referrals');
          if (defaultData) return defaultData;

          return new Response(JSON.stringify({ error: 'Offline - No cached data available' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // B. Handle SPA Navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // C. Handle Static UI Assets (Cache-first with dynamic caching)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and fetch in background to update cache (stale-while-revalidate for assets)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Offline - ignore network error for cached asset
          });
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If HTML / Page request fails offline, fallback to index.html
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
    })
  );
});

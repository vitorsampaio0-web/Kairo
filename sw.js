const CACHE_NAME = "kairo-v3";
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./index-en.html",
  "./app.html",
  "./app-en.html",
  "./landing.html",
  "./landing-en.html",
  "./manifest.json",
  "./logo-kairo.png",
  "./onboarding.css",
  "./onboarding.js",
  "./onboarding-en.js",
  "./guide.html",
  "./termos.html",
  "./privacidade.html",
  "./terms.html",
  "./privacy.html",
];

const API_BLACKLIST = [
  "google-analytics", "googletagmanager",
  "firebaseinstallations", "firebaseremoteconfig", "firestore.googleapis",
  "identitytoolkit", "securetoken", /* analytics */
];

const SCRIPT_WHITELIST = [
  /* CDNs that rarely change — okay to cache briefly */
];

const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isApiOrTracking(url) {
  const h = url.hostname.toLowerCase();
  const p = url.pathname.toLowerCase();
  return API_BLACKLIST.some(k => h.includes(k) || p.includes(k))
    || url.protocol === "chrome-extension:"
    || url.protocol === "chrome:";
}

/* ===== INSTALL ===== */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).catch(() => {
      /* individual promises may fail; still complete install */
    })
  );
  self.skipWaiting();
});

/* ===== ACTIVATE: clean old caches ===== */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

/* ===== FETCH ===== */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* Never cache analytics / tracking / API */
  if (isApiOrTracking(url)) return;

  /* Navigation: CacheFirst with fallback to index.html */
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  /* Image / font / css / js: Stale-while-revalidate */
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (
            response &&
            response.status === 200 &&
            response.type !== "opaque" &&
            request.url.startsWith("http")
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            // periodic eviction
            evictOldEntries(CACHE_NAME);
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

/* ===== Periodic cache eviction (LRU-ish by age) ===== */
async function evictOldEntries(cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const now = Date.now();
    for (const req of keys) {
      const resp = await cache.match(req);
      if (!resp) continue;
      const dateHeader = resp.headers.get("date");
      if (dateHeader) {
        const age = now - new Date(dateHeader).getTime();
        if (age > MAX_CACHE_AGE_MS) {
          await cache.delete(req);
        }
      }
    }
  } catch (_) {
    /* ignore */
  }
}

/* ===== Background Sync (for future use) ===== */
self.addEventListener("sync", (event) => {
  if (event.tag === "kairo-sync") {
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "SYNC" }));
      })
    );
  }
});

/* ===== Message handler (skipWaiting trigger) ===== */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

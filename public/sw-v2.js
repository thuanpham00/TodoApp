// Service Worker cho PWA - cache shell để offline + mở app nhanh
const CACHE_VERSION = "v3";
const CACHE_NAME = `personal-tracker-${CACHE_VERSION}`;
const SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/cube.png",
  "/icons/todo.png",
  "/icons/bell.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          SHELL_URLS.map((url) =>
            fetch(url, { cache: "no-cache" })
              .then((res) => (res && res.ok ? cache.put(url, res) : null))
              .catch(() => null),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                k !== CACHE_NAME &&
                (k.startsWith("personal-tracker") ||
                  k === "personal-tracker-v1" ||
                  k === "personal-tracker-v2"),
            )
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first cho HTML, cache fallback cho assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bỏ qua Supabase / API / Google fonts runtime - không cache
  if (
    url.hostname.includes("supabase") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("gstatic")
  ) {
    return;
  }

  // Bỏ qua non-GET
  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    // Network-first cho navigation, fallback cache "/" hoặc "/index.html"
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache lại bản HTML mới
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/", clone));
          }
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(request)) ||
            (await caches.match("/")) ||
            (await caches.match("/index.html"));
          return (
            cached ||
            new Response("Offline", {
              status: 503,
              statusText: "Offline",
            })
          );
        }),
    );
    return;
  }

  // Cache-first cho assets (js, css, images, fonts)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
    }),
  );
});

const CACHE_NAME = "gemini-cache-v1";
const ASSETS_TO_CACHE = [
  "/", // Root path
  "/index.html", // Main HTML file
  "/css/styles.css", // CSS file
  "/js/scripts.js", // Main JS file
  "/manifest.json", // Manifest file
  "/icon512_maskable.png", // Maskable icon
  "/icon512_rounded.png", // Rounded icon
  "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css", // External CSS
  "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css", // External CSS
  "https://cdn.jsdelivr.net/npm/marked/marked.min.js", // External JS
  "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/highlight.min.js" // External JS
];

// Install event: Cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate the service worker immediately
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients immediately
});

// Fetch event: Serve cached assets and fallback for offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Serve cached response if available, otherwise fetch from network
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // Fallback for offline
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        })
      );
    })
  );
});
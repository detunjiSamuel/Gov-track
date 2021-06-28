console.log("Registered");
// Cache Version
let version = "v1";

//Cache Files
let cacheFiles = [
  "/static/js/main.chunk.js",
  "/static/js/1.chunk.js",
  "/static/js/0.chunk.js",
  "/static/js/bundle.js",
  "/static/css/main.chunk.css",
  "/favicon.ico",
  "/logo192.png",
  "https://fonts.googleapis.com/css2?family=Asap:wght@700&display=swap",
  "/manifest.json",
  "/main.27b72685aca2de913a63.hot-update.js",
  "/main.ed443818213ff9be9ec9.hot-update.js",
  "/index.html",
  "/",
  "https://opentdb.com/api.php?amount=5&category=10&difficulty=easy&type=multiple",
];

// Install Service Woker
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(version).then((cache) => {
      return cache.addAll(cacheFiles);
    })
  );
});

// Activate Service Worker
self.addEventListener("activate", function (e) {
  console.log("[ServiceWorker] Activate");
});


        const options = {
          ignoreSearch: true,
          ignoreMethod: true,
          ignoreVary: true
        };
        // Fetch Service Worker
self.addEventListener("fetch", (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches
        .match(event.request, options)
        .then((response) => {
          if (response) {
            console.log(response);
            return response;
          } else {
            return fetch(event.request)
              .then((response) => {
                if (
                  !response ||
                  response.status !== 200 ||
                  response.type !== "basic"
                ) {
                  console.log(response);
                  return response;
                }
                var responseToCache = response.clone();

                caches.open(version).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                console.log(response);
                return response;
              })
              .catch((err) => {
                console.log("err", err);
              });
          }
        })
        .catch((err) => {
          console.log("err", err);
        })
    );
  }
});

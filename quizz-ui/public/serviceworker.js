// Cache Version
let version = "v1";

//Cache Files
let cacheFiles = [
  "static/css/2.d9ad5f5c.chunk.css",
  "static/css/main.8c2756c4.chunk.css",
  "static/js/2.98fbc302.chunk.js",
  "static/js/main.4e533173.chunk.js",
  "/index.html",
  "/",
  "https://opentdb.com/api.php?amount=5&category=10&difficulty=easy&type=multiple",
];

// Install Service Woker
self.addEventListener("install", (e) => {
  // self.skipWaiting();
  e.waitUntil(
    caches.open(version).then((cache) => {
      console.log("adding Caches")
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

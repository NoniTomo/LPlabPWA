self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open("")
      .then((cache) =>
        cache.addAll([
          "/",
          "/index.html",
          "/index.js",
          "/style.css",
          "/reset.css",
          "/public/key.svg",
          "/public/refresh.svg",
          "/public/rounded-x.svg",
          "/public/pencil.svg",
          "/public/plus.svg",
        ])
      )
  );
});

self.addEventListener("fetch", (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open("passman")
      .then((cache) =>
        cache.addAll([
          "/passman/",
          "/passman/index.html",
          "/passman/index.js",
          "/passman/style.css",
          "/passman/reset.css",
          "/passman/public/key.svg",
          "/passman/public/refresh.svg",
          "/passman/public/rounded-x.svg",
          "/passman/public/pencil.svg",
          "/passman/public/plus.svg",
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

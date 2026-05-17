"use strict";

const CACHE_NAME = "shengyu-v19";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./game.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  const isAudio = url.pathname.startsWith("/assets/audio/");

  if (isAudio) {
    event.respondWith(handleAudioRequest(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        if (!url.pathname.startsWith("/developer/")) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        if (event.request.mode === "navigate") {
          const cachedIndex = await caches.match("./index.html");
          if (cachedIndex) {
            return cachedIndex;
          }
        }

        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) {
          return cachedResponse;
        }

        if (url.pathname === "/developer" || url.pathname.endsWith("/index.html") || url.pathname === "/") {
          return caches.match("./index.html");
        }

        return Response.error();
      })
  );
});

async function handleAudioRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    const contentType = response.headers.get("Content-Type") || "";
    if (response.ok && contentType.startsWith("audio/")) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request, { ignoreSearch: true });
    if (cachedResponse) {
      return cachedResponse;
    }
    return Response.error();
  }
}

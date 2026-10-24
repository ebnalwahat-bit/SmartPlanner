const CACHE_NAME = "mudhakira-v1"
const PRECACHE_URLS = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png", "/apple-icon.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => undefined),
        ),
      )
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request)
        if (fresh && fresh.ok && fresh.type === "basic") {
          const cache = await caches.open(CACHE_NAME)
          cache.put(request, fresh.clone()).catch(() => undefined)
        }
        return fresh
      } catch {
        const cached = await caches.match(request, {
          ignoreSearch: request.mode === "navigate",
        })
        if (cached) return cached
        if (request.mode === "navigate") {
          const root = await caches.match("/")
          if (root) return root
        }
        return new Response("Offline", {
          status: 503,
          statusText: "Offline",
          headers: { "Content-Type": "text/plain" },
        })
      }
    })(),
  )
})

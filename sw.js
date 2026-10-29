const CACHE = "simulador-ggal-61bd48e287";
const ARCHIVOS = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const propio = url.origin === location.origin, fuente = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!propio && !fuente) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const guardada = await c.match(req, { ignoreSearch: propio });
    if (guardada) return guardada;
    try {
      const resp = await fetch(req);
      if (resp.ok || resp.type === "opaque") c.put(req, resp.clone());
      return resp;
    } catch (err) {
      return req.mode === "navigate" ? c.match("index.html") : Response.error();
    }
  }));
});

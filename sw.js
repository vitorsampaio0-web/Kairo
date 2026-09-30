// Kairo — versão destrutiva: apaga todos os caches antigos e remove o SW.
// Garante que todos os browsers recebem a versão atual do site a partir da rede.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) { /* ignore */ }
      try {
        await self.registration.unregister();
      } catch (e) { /* ignore */ }
      try {
        const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        clients.forEach((c) => c.navigate(c.url));
      } catch (e) { /* ignore */ }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  // Não intercetar nada: deixa a rede tratar de todos os pedidos.
  return;
});

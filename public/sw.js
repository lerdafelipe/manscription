self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}

  const options = {
    body: data.body || "Tienes un pago próximo",
    icon: "/icon-192.jpg",
    badge: "/icon-192.jpg",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(data.title || "SubsManager", options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow(event.notification.data.url))
})

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})

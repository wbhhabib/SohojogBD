self.addEventListener('push', (event) => {
    if (!event.data) return

    const payload = event.data.json()

    event.waitUntil(
        self.registration.showNotification(payload.title || 'SohojogBD', {
            body: payload.body || '',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url: payload.url || '/' },
        })
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const targetUrl = event.notification.data?.url || '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus()
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl)
            }
        })
    )
})
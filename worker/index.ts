/* eslint-disable */
// Compiled by next-pwa as a service worker — DOM types don't apply here.
// @ts-nocheck

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "93 HABITS";
  const body = data.body ?? "Time to log your habits.";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});

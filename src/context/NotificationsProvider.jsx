import { useCallback, useEffect, useMemo, useState } from 'react';

import { notificationsApi } from '../api';
import { NotificationsContext, NOTIFICATION_EVENT } from './notifications-context';

// Same base the fetch client uses. In dev this is '/api' (proxied to the
// backend), so EventSource is same-origin and the httpOnly auth cookie is sent
// automatically.
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const MAX_ITEMS = 50;

// Loads recent admin notifications and keeps them live over a Server-Sent
// Events connection. Mount inside the admin area (the user is already an admin
// there). EventSource reconnects automatically if the connection drops.
export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  // Initial load of recent notifications for the bell.
  useEffect(() => {
    let active = true;
    notificationsApi
      .list()
      .then((data) => active && setNotifications(Array.isArray(data) ? data : []))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Live stream. New notifications are prepended (de-duped by id) and also
  // re-broadcast as a window event for pages that want to update in place.
  useEffect(() => {
    const es = new EventSource(`${API_BASE}/notifications/stream`, {
      withCredentials: true,
    });

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.addEventListener('notification', (e) => {
      let payload;
      try {
        payload = JSON.parse(e.data);
      } catch {
        return;
      }
      setNotifications((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload, ...prev].slice(0, MAX_ITEMS);
      });
      window.dispatchEvent(
        new CustomEvent(NOTIFICATION_EVENT, { detail: payload }),
      );
    });

    return () => es.close();
  }, []);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await notificationsApi.markRead(id).catch(() => undefined);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationsApi.markAllRead().catch(() => undefined);
  }, []);

  const unreadCount = useMemo(
    () => notifications.reduce((n, item) => (item.read ? n : n + 1), 0),
    [notifications],
  );

  const value = useMemo(
    () => ({ notifications, unreadCount, connected, markRead, markAllRead }),
    [notifications, unreadCount, connected, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

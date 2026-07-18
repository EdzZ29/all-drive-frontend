import { createContext, useContext } from 'react';

// Shared admin-notifications context. Consumed via useNotifications() below.
export const NotificationsContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a <NotificationsProvider>',
    );
  }
  return ctx;
}

// Window event fired whenever a live notification arrives, so pages (e.g. the
// Bookings list) can react in real time without coupling to this context.
export const NOTIFICATION_EVENT = 'alldrive:notification';

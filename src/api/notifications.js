import { api } from './client';

// Admin notification endpoints. The live stream is a Server-Sent Events
// connection opened directly with EventSource (see NotificationsProvider),
// not through this fetch wrapper.
export const notificationsApi = {
  // Recent notifications, newest first.
  list: () => api.get('/notifications'),

  unreadCount: () => api.get('/notifications/unread-count'),

  markRead: (id) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.patch('/notifications/read-all'),
};

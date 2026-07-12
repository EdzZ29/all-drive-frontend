import { api } from './client';

// Booking endpoints. Reserving requires a logged-in CLIENT; the backend
// rejects guests with 401 and other roles with 403.
export const bookingsApi = {
  // Reserve a vehicle. payload: { vehicleId, startDate, endDate }.
  create: (payload) => api.post('/bookings', payload),

  // The current client's own bookings.
  listMine: () => api.get('/bookings/me'),

  cancel: (id) => api.patch(`/bookings/${id}/cancel`),

  // Admin-only: every booking in the system.
  listAll: () => api.get('/bookings'),
};

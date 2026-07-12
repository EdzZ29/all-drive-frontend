import { api } from './client';

// Vehicle endpoints. Browsing is public (guests allowed); mutations are
// admin-only and rejected by the backend for non-admins.
export const vehiclesApi = {
  list: () => api.get('/vehicles'),

  getOne: (id) => api.get(`/vehicles/${id}`),

  // Admin-only.
  create: (payload) => api.post('/vehicles/create', payload),
  update: (id, payload) => api.put(`/vehicles/${id}`, payload),
  remove: (id) => api.delete(`/vehicles/${id}`),
};

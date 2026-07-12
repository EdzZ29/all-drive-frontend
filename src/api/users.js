import { api } from './client';

// User directory. Admin-only on the backend.
export const usersApi = {
  list: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
};

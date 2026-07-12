import { api } from './client';

// Auth endpoints. login/register set the httpOnly cookie server-side; the
// returned { accessToken, user } is also available if you prefer header auth.
export const authApi = {
  // Guest self-registration -> creates a CLIENT account.
  register: (payload) => api.post('/auth/register', payload),

  login: (credentials) => api.post('/auth/login', credentials),

  logout: () => api.post('/auth/logout'),

  // Current authenticated user (relies on the cookie). Throws 401 if guest.
  me: () => api.get('/auth/me'),

  // Admin-only: provision a new admin/staff account.
  createAdmin: (payload) => api.post('/auth/admins', payload),
};

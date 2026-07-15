import { api } from './client';

export const uploadsApi = {
  // Uploads an image file (admin-only). Returns { url, filename }.
  image: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/uploads/image', form);
  },

  // Uploads a booking document (any logged-in user). Image or PDF.
  // Returns { url, filename }.
  document: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/uploads/document', form);
  },
};

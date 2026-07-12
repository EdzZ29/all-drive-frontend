import { api } from './client';

export const uploadsApi = {
  // Uploads an image file (admin-only). Returns { url, filename }.
  image: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/uploads/image', form);
  },
};

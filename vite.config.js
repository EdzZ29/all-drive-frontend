import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// The dev server proxies /api to the NestJS backend so the browser treats API
// calls as same-origin. This makes the httpOnly auth cookie "just work" in
// development without CORS or SameSite headaches.
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Uploaded vehicle images are served by the backend at /uploads/*.
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

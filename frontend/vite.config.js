import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    port: 5186,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/policies': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/recommendations': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/user_policies': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})

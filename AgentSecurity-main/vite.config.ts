import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all network addresses, enabling access via localhost, 127.0.0.1, or LAN IP
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://agent-security-4.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: 'https://agent-security-4.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    proxy: {
      '/api': {
        target: 'https://agent-security-4.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: 'https://agent-security-4.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

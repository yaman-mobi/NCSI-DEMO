import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
 base: '/ncsi_demo/',
  server: {
    headers: {
      'Content-Security-Policy': 'frame-ancestors *',
    },
  },
  preview: {
    headers: {
      'Content-Security-Policy': 'frame-ancestors *',
    },
  },
}));

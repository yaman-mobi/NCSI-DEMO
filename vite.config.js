import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig((env) => {
  // env هنا يحتوي على command و mode
  const isProd = env.mode === 'production' // بدل command

  return {
    plugins: [react()],
    base: isProd ? '/ncsi_demo/' : '/',
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
  }
})
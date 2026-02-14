import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      // Exact path only — do NOT use '/node' or it matches /node_modules and breaks the app
      '/node/json_rpc': {
        target: 'http://localhost:18081',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/node/, ''),
      },
    },
  },
})

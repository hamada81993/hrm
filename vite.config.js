import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: {
      clientPort: 3000
    },
    fs: {
      strict: false
    },
    cors: true,
    allowedHosts: [
      '3000-iwlce8p737t7pg6jdzo2p-ff4ea9dd.manus.computer'
    ]
  }
})


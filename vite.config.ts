import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        short_name: 'notes',
        name: 'notes',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: '/icon-512.png',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
        display: 'standalone',
        theme_color: '#090807',
        background_color: '#353433',
      },
    }),
  ],
})
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '근무시간 계산기',
        short_name: 'WkTimer',
        description: '근무시간 계산 도구',
        theme_color: '#4f7cff',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'ko',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          // maskable: 안드로이드 어댑티브 아이콘용
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 앱 셸(JS/CSS/HTML) → 캐시 우선
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Supabase API 요청 → 네트워크 우선 (데이터 신선도 유지)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'bhumibol_hospital_emblem.jpg',
          'Official_emblem_of_Bhumibol_Adulyadej_Hospital.jpg',
        ],
        manifest: {
          id: '/',
          name: 'HA First Psychiatric Assessment - รพ.ภูมิพลอดุลยเดช',
          short_name: 'Psych BAH',
          description: 'ระบบบันทึกแบบประเมินแรกรับผู้ป่วยจิตเวช กองจิตเวชและประสาทวิทยา โรงพยาบาลภูมิพลอดุลยเดช',
          theme_color: '#0f172a', // slate-900 matching the titlebar
          background_color: '#f8fafc', // slate-50 background matching the workspace
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/apple-touch-icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg,jpeg}'],
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MiB
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    esbuild: {
      pure: ['console.log', 'console.debug', 'console.info', 'console.trace'],
    },
    build: {
      target: ['chrome80', 'es2015'],
      minify: 'esbuild',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        treeshake: {
          moduleSideEffects: (id) => {
            // Keep CSS files from being tree-shaken as side-effects
            if (id.endsWith('.css') || id.endsWith('.scss') || id.includes('inline-css')) {
              return true;
            }
            return false;
          },
          propertyReadSideEffects: false,
        },
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('html2canvas')) {
                return 'vendor-html2canvas';
              }
              if (id.includes('jspdf')) {
                return 'vendor-jspdf';
              }
              if (id.includes('dompurify')) {
                return 'vendor-dompurify';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

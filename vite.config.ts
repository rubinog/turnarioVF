import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

let commitHash = process.env.VITE_APP_VERSION || 'unknown'
if (commitHash === 'unknown') {
  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim()
  } catch (e) {
    console.warn('Could not get commit hash', e)
  }
} else if (commitHash.length > 7) {
  // Se è un hash completo (40 caratteri), prendi solo i primi 7
  commitHash = commitHash.substring(0, 7)
}

// https://vite.dev/config/
export default defineConfig({
  base: '/turnarioVF/',
  define: {
    __APP_VERSION__: JSON.stringify(commitHash),
    'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_API_KEY),
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID),
  },
  plugins: [
    react(),
    UnoCSS(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Turnario VV.F.',
        short_name: 'Turnario VVF',
        description: 'Gestione turni personale Vigili del Fuoco',
        theme_color: '#a90708',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

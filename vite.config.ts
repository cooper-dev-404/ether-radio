import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    proxy: {
      '/proxy/cnr': {
        target: 'http://ngcdn001.cnr.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/cnr\/ngcdn\d+/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const match = req.url?.match(/^\/proxy\/cnr\/(ngcdn\d+)(.*)/)
            if (match) {
              proxyReq.host = `${match[1]}.cnr.cn`
              proxyReq.path = match[2]
            }
          })
        }
      },
      '/proxy/xmcdn': {
        target: 'http://live.xmcdn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/xmcdn/, ''),
      },
    },
    headers: {
      'Content-Security-Policy':
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    }
  }
})

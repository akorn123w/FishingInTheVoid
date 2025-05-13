import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      electron({
        entry: 'electron/main.js',
      }),
    ],
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Ensure source maps are only generated in development
      sourcemap: mode === 'development',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Define environment variables that will be available in the client
    define: {
      __DEV__: mode === 'development',
    },
    server: {
      proxy: {
        '/supabase': {
          target: 'https://nmlaibujcnlvztengkwa.supabase.co',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/supabase/, ''),
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    }
  }
})

import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../../static',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: 'src/js/main.js',
        threeScene: 'src/js/three-scene.js',
        style: 'src/css/style.css'
      },
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash][extname]'
          }
          if (assetInfo.name.match(/\.(png|jpe?g|gif|svg|ico|webp)$/)) {
            return 'images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },
    sourcemap: false,
    target: 'es2015'
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  css: {
    postcss: {
      plugins: []
    }
  }
})
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
  base: '/static/', // Set base path for all assets
  build: {
    outDir: '../../static',
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      external: ['three'],
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
        },
        manualChunks: (id) => {
          // Separate vendor libraries for better caching
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Group animation utilities together
          if (id.includes('animations.js')) {
            return 'animations';
          }
          // Keep core functionality together
          if (id.includes('navigation.js') || id.includes('utils.js')) {
            return 'core';
          }
          // Heavy effects in separate chunk
          if (id.includes('effects.js')) {
            return 'effects';
          }
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        dead_code: true,
        unused: true,
        arrows: true,
        arguments: true,
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        computed_props: true,
        conditionals: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        loops: true,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        typeofs: true,
        // More aggressive compression
        passes: 2,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false,
        ecma: 2020
      }
    },
    sourcemap: false,
    target: 'es2020', // More modern target for better optimization
    reportCompressedSize: false // Disable for faster builds
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': 'http://localhost:8081'
    }
  },
  css: {
    postcss: {
      plugins: []
    },
    // Enable CSS code splitting for better caching
    devSourcemap: false
  },
  
  // Preload optimization
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__prependToBase("${filename}")` }
      }
    }
  }
})
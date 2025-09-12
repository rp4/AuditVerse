import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  root: 'src',
  base: '/',
  
  server: {
    port: 5173,
    open: false,
    cors: true,
    host: '0.0.0.0',
    strictPort: false,
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'd3': ['d3'],
        },
      },
    },
  },

  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@viz': resolve(__dirname, './src/visualization'),
      '@ui': resolve(__dirname, './src/ui'),
      '@data': resolve(__dirname, './src/data'),
      '@api': resolve(__dirname, './src/api'),
      '@utils': resolve(__dirname, './src/core/utils'),
    },
  },

  optimizeDeps: {
    include: ['d3'],
  },

  preview: {
    port: 3001,
    open: true,
  },
});
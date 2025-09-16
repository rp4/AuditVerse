import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  root: 'src',
  base: '/',
  
  server: {
    port: 5173,
    open: false,
    cors: true,
    host: 'localhost', // Changed from 0.0.0.0 for security
    strictPort: false,
  },

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
      output: {
        manualChunks: {
          'd3': ['d3'],
        },
      },
    },
    // Copy static files
    copyPublicDir: false,
  },

  publicDir: resolve(__dirname, 'src/static'),

  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    {
      name: 'copy-static-files',
      closeBundle() {
        try {
          // Copy data files
          mkdirSync(resolve(__dirname, 'dist/data'), { recursive: true });

          const dataFile = resolve(__dirname, 'src/data/comprehensiveSampleData.json');
          if (existsSync(dataFile)) {
            copyFileSync(dataFile, resolve(__dirname, 'dist/data/comprehensiveSampleData.json'));
            console.log('Data files copied to dist');
          }
        } catch (err) {
          console.error('Failed to copy data files:', err);
        }
      }
    }
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
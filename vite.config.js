import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import { copyFileSync, mkdirSync } from 'fs';

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
    outDir: '../dist', // Adjusted path since root is 'src'
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production', // Disable sourcemaps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Only drop console in production
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
  },

  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    {
      name: 'copy-data-files',
      closeBundle() {
        // Copy data files to dist
        try {
          mkdirSync(resolve(__dirname, 'dist/data'), { recursive: true });
          copyFileSync(
            resolve(__dirname, 'src/data/sampleData.json'),
            resolve(__dirname, 'dist/data/sampleData.json')
          );
          copyFileSync(
            resolve(__dirname, 'src/data/comprehensiveSampleData.json'),
            resolve(__dirname, 'dist/data/comprehensiveSampleData.json')
          );
          console.log('Data files copied to dist');
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
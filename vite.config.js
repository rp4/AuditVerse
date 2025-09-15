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
    outDir: resolve(__dirname, 'dist'), // Use absolute path resolution
    emptyOutDir: true, // Explicitly allow emptying outDir
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

          // Only copy files that exist
          const dataFiles = [
            'comprehensiveSampleData.json'
          ];

          dataFiles.forEach(file => {
            const srcPath = resolve(__dirname, 'src/data', file);
            const distPath = resolve(__dirname, 'dist/data', file);

            if (existsSync(srcPath)) {
              copyFileSync(srcPath, distPath);
              console.log(`Copied ${file} to dist`);
            } else {
              console.warn(`Data file ${file} not found, skipping`);
            }
          });

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
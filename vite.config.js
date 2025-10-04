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
    host: true, // Allow external connections (needed for WSL)
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
        drop_console: false,  // Keep console logs for debugging
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

          const dataFile = resolve(__dirname, 'public/data/comprehensiveSampleData.json');
          if (existsSync(dataFile)) {
            copyFileSync(dataFile, resolve(__dirname, 'dist/data/comprehensiveSampleData.json'));
            console.log('comprehensiveSampleData.json copied to dist');
          }

          // Copy public assets (including Auditverse.png)
          const publicAssetsDir = resolve(__dirname, 'public/assets');
          const distAssetsDir = resolve(__dirname, 'dist/assets');

          if (existsSync(publicAssetsDir)) {
            // Ensure the dist/assets directory exists
            if (!existsSync(distAssetsDir)) {
              mkdirSync(distAssetsDir, { recursive: true });
            }

            // Copy Auditverse.png specifically
            const auditverseImg = resolve(publicAssetsDir, 'Auditverse.png');
            if (existsSync(auditverseImg)) {
              copyFileSync(auditverseImg, resolve(distAssetsDir, 'Auditverse.png'));
              console.log('Auditverse.png copied to dist/assets');
            }
          }
        } catch (err) {
          console.error('Failed to copy static files:', err);
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
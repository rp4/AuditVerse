import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import legacy from '@vitejs/plugin-legacy';
import { copyFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'fs';

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
        // Copy data and styles files to dist
        try {
          // Copy data files
          mkdirSync(resolve(__dirname, 'dist/data'), { recursive: true });

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

          // Copy styles directory
          const copyRecursiveSync = (src, dest) => {
            const exists = existsSync(src);
            const stats = exists && statSync(src);
            const isDirectory = exists && stats.isDirectory();

            if (isDirectory) {
              mkdirSync(dest, { recursive: true });
              readdirSync(src).forEach(childItem => {
                copyRecursiveSync(
                  join(src, childItem),
                  join(dest, childItem)
                );
              });
            } else {
              copyFileSync(src, dest);
            }
          };

          const stylesSource = resolve(__dirname, 'src/styles');
          const stylesDest = resolve(__dirname, 'dist/styles');

          if (existsSync(stylesSource)) {
            copyRecursiveSync(stylesSource, stylesDest);
            console.log('Styles directory copied to dist');
          }

          console.log('Build assets copied successfully');
        } catch (err) {
          console.error('Failed to copy build assets:', err);
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
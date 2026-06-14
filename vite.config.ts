/**
 * @module    vite.config
 * @summary   Vite-Bundler-Konfiguration für die React+TS-Migration der CombatApp.
 * @notHere   Domain-Logik → js/ | Tests → Tests/ | Vanilla-App-Entry → index.html
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  // Vite sucht index-react.html im Root
  root: '.',

  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index-react.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('/js/state/') || id.includes('/js/models/') || id.includes('/js/rules/')) {
            return 'state-core';
          }
        }
      }
    },
  },

  resolve: {
    alias: {
      // @core → ./js/  (die bestehende, verifizierte Domain-Logik)
      '@core': path.resolve(__dirname, 'js'),
    },
  },

  server: {
    port: 5173,
    open: '/index-react.html',
  },
});

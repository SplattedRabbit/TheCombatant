/**
 * @module    vite.config
 * @summary   Vite-Bundler-Konfiguration für die React+TS-Migration der CombatApp.
 * @notHere   Domain-Logik → js/ | Tests → Tests/
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin: Kopiert statische Assets nach dist/ die Vite nicht automatisch bundelt
function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const copies: [string, string][] = [
        [path.resolve(__dirname, 'data/spells-phb.json'), path.join(distDir, 'data/spells-phb.json')],
        [path.resolve(__dirname, 'data/spells-phb2.json'), path.join(distDir, 'data/spells-phb2.json')],
        [path.resolve(__dirname, 'data/spells-ca.json'), path.join(distDir, 'data/spells-ca.json')],
        [path.resolve(__dirname, 'data/spells-cs.json'), path.join(distDir, 'data/spells-cs.json')],
        // PWA-Assets
        [path.resolve(__dirname, 'manifest.json'), path.join(distDir, 'manifest.json')],
        [path.resolve(__dirname, 'icon-192.png'), path.join(distDir, 'icon-192.png')],
        [path.resolve(__dirname, 'icon-512.png'), path.join(distDir, 'icon-512.png')],
      ];

      for (const [src, dest] of copies) {
        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
          console.log(`[copy-static-assets] ${path.basename(src)} → dist/`);
        } else {
          console.warn(`[copy-static-assets] Nicht gefunden: ${src}`);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyStaticAssets()],
  base: './',

  root: '.',

  build: {
    outDir: 'dist',
    target: 'es2022',
    cssMinify: true,
    minify: 'esbuild',
    modulePreload: {
      polyfill: false,
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');

          // 1. Third-Party Vendor Chunks
          if (normalized.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }
          if (
            normalized.includes('node_modules/react') ||
            normalized.includes('node_modules/react-dom') ||
            normalized.includes('node_modules/scheduler')
          ) {
            return 'react-vendor';
          }
          if (normalized.includes('node_modules')) {
            return 'vendor';
          }

          // 2. Core Domain Logic & Static Registries
          if (
            normalized.includes('/js/state/') ||
            normalized.includes('/js/models/') ||
            normalized.includes('/js/rules/')
          ) {
            return 'state-core';
          }
          if (normalized.includes('/js/data/')) {
            return 'data-registry';
          }

          // 3. Application Domain (Components, Services, Context, State Hooks)
          if (normalized.includes('/src/')) {
            return 'app-core';
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

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', '@supabase/supabase-js'],
  },

  server: {
    port: 5173,
    open: '/index.html',
    watch: {
      // WSL2 + Windows-Mount (/mnt/c/...): inotify erkennt Dateiänderungen nicht zuverlässig,
      // daher HMR-Updates per Polling statt Filesystem-Events.
      usePolling: true,
      interval: 300,
    },
  },
});

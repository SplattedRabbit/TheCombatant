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
        // PeerJS: globales Script, nicht über Vite gebundelt (window.Peer API)
        [path.resolve(__dirname, 'js/peerjs.min.js'), path.join(distDir, 'peerjs.min.js')],
        // Zauber-Datenbank: zu groß für Bundle, wird zur Laufzeit geladen
        [path.resolve(__dirname, 'data/spells_de.json'), path.join(distDir, 'data/spells_de.json')],
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
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
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
    open: '/index.html',
  },
});

/**
 * @module    update_sw
 * @summary   Post-Build-Skript: Schreibt einen vollständigen Service Worker nach dist/service-worker.js
 *            mit allen dist/-Assets und bumpt die Cache-Version automatisch.
 * @notHere   Vite-Build-Logik → vite.config.ts | SW-Fetch-Logik → dist/service-worker.js (generiert)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const swSourcePath = path.join(rootDir, 'service-worker.js'); // Root-SW als Template für Cache-Version
const swOutputPath = path.join(distDir, 'service-worker.js'); // Output: IN dist/

// 1. Scan dist directory recursively — gibt dist/-relative Pfade zurück
function walkDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    // service-worker.js selbst nicht in ASSETS aufnehmen
    if (file === 'service-worker.js') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else {
      // dist/-relative Pfade: './' prefix
      const relative = '.' + fullPath.slice(distDir.length).replace(/\\/g, '/');
      results.push(relative);
    }
  });
  return results;
}

// Copy index-react.html to index.html in dist for GitHub Pages root resolution
const indexReactPath = path.join(distDir, 'index-react.html');
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexReactPath)) {
  fs.copyFileSync(indexReactPath, indexHtmlPath);
  console.log('SW: index-react.html -> index.html kopiert für GitHub Pages');
}

const distAssets = walkDir(distDir);

// 2. Root-SW lesen um aktuelle Cache-Version zu extrahieren
let swContent = fs.readFileSync(swSourcePath, 'utf8');

// 3. Cache-Version bumpen
const cacheNameRegex = /const CACHE_NAME = 'dnd-combatsheet-(v\d+\.\d+\.\d+)-cache-v(\d+)';/;
const versionMatch = swContent.match(cacheNameRegex);
let newCacheName = 'dnd-combatsheet-v4.0.0-cache-v1';
if (versionMatch) {
  const version = versionMatch[1];
  const cacheVersion = parseInt(versionMatch[2]) + 1;
  newCacheName = `dnd-combatsheet-${version}-cache-v${cacheVersion}`;
  console.log(`SW: Cache-Version → ${newCacheName}`);
}

// 4. Frischen SW-Inhalt für dist/ generieren (dist/-relative Pfade, kein Root-Verweis)
const assetsStr = 'const ASSETS = [\n  ' + distAssets.map(a => `'${a}'`).join(',\n  ') + '\n];';

const swOutputContent = `const CACHE_NAME = '${newCacheName}';
${assetsStr}

// Install: alle Assets cachen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching assets for offline use');
      return cache.addAll(ASSETS).catch(err => {
        console.warn('[SW] Asset caching warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network-First, Fallback auf Cache (Offline-Modus)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(networkResponse => {
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
      }
      return networkResponse;
    }).catch(() =>
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return new Response('Offline – Ressource nicht gecacht', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      })
    )
  );
});
`;

// 5. dist/service-worker.js schreiben
fs.writeFileSync(swOutputPath, swOutputContent, 'utf8');
console.log(`SW: dist/service-worker.js geschrieben (${distAssets.length} Assets gecacht).`);

// 6. Root-SW ebenfalls aktualisieren (Cache-Version synchron halten)
const updatedRootSW = swContent
  .replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = '${newCacheName}';`)
  .replace(/const ASSETS = \[\s*[\s\S]*?\];/s, assetsStr.replace(/\.\//g, './dist/'));
fs.writeFileSync(swSourcePath, updatedRootSW, 'utf8');
console.log('SW: Root service-worker.js (Dev-Modus) aktualisiert.');

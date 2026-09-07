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



const distAssets = walkDir(distDir);

// 2. Read package.json version & Root-SW to extract/update Cache-Version
let swContent = fs.readFileSync(swSourcePath, 'utf8');

const pkgPath = path.join(rootDir, 'package.json');
let pkgVersion = '6.0.0';
if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.version) pkgVersion = pkg.version;
  } catch {}
}

// 3. Cache-Version bumpen
const cacheNameRegex = /const CACHE_NAME = 'dnd-combatsheet-(v\d+\.\d+\.\d+)-cache-v(\d+)';/;
const versionMatch = swContent.match(cacheNameRegex);
let newCacheName = `dnd-combatsheet-v${pkgVersion}-cache-v1`;

if (versionMatch) {
  const currentVersion = versionMatch[1]; // e.g. 'v4.5.0' or 'v6.0.0'
  const targetVersion = `v${pkgVersion}`;
  if (currentVersion === targetVersion) {
    const cacheCounter = parseInt(versionMatch[2], 10) + 1;
    newCacheName = `dnd-combatsheet-${targetVersion}-cache-v${cacheCounter}`;
  } else {
    newCacheName = `dnd-combatsheet-${targetVersion}-cache-v1`;
  }
}
console.log(`SW: Cache-Version → ${newCacheName}`);

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

// Fetch: Cache-First for static assets (JS, CSS, JSON, Fonts, Images), Network-First for navigation HTML
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // 1. HTML Navigations -> Network-First (with offline cache fallback)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // 2. Static Assets & Data -> Cache-First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch(() => {
        return new Response('Offline – Resource not cached', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      });
    })
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

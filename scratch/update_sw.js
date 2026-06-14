import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const swPath = path.join(rootDir, 'service-worker.js');
const distDir = path.join(rootDir, 'dist');

// 1. Scan dist directory recursively
function walkDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else {
      const relative = '.' + fullPath.slice(rootDir.length).replace(/\\/g, '/');
      results.push(relative);
    }
  });
  return results;
}

const distAssets = walkDir(distDir);

// 2. Define static assets
const staticAssets = [
  './',
  './index.html',
  './index-react.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/peerjs.min.js',
  './data/spells_de.json'
];

const allAssets = Array.from(new Set([...staticAssets, ...distAssets]));

// 3. Read current service-worker.js
let swContent = fs.readFileSync(swPath, 'utf8');

// 4. Update Cache Name to bump the version
const cacheNameRegex = /const CACHE_NAME = 'dnd-combatsheet-(v\d+\.\d+\.\d+)-cache-v(\d+)';/;
const versionMatch = swContent.match(cacheNameRegex);
if (versionMatch) {
  const version = versionMatch[1];
  const cacheVersion = parseInt(versionMatch[2]) + 1;
  const newCacheName = `const CACHE_NAME = 'dnd-combatsheet-${version}-cache-v${cacheVersion}';`;
  swContent = swContent.replace(/const CACHE_NAME = '[^']+';/, newCacheName);
  console.log(`SW: Bumped cache version to v${cacheVersion}`);
}

// 5. Replace ASSETS array
const assetsStr = 'const ASSETS = [\n  ' + allAssets.map(a => `'${a}'`).join(',\n  ') + '\n];';
swContent = swContent.replace(/const ASSETS = \[\s*[\s\S]*?\];/s, assetsStr);

fs.writeFileSync(swPath, swContent, 'utf8');
console.log('SW: service-worker.js assets updated successfully.');

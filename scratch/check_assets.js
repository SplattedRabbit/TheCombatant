import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('service-worker.js', 'utf8');
const match = content.match(/const ASSETS = \[\s*([\s\S]*?)\s*\];/);

if (match) {
  // Parse array using regex for quoted strings to avoid splitting on commas inside URLs
  const rawAssets = [];
  const regex = /['"](.*?)['"]/g;
  let m;
  while ((m = regex.exec(match[1])) !== null) {
    rawAssets.push(m[1]);
  }

  const localAssets = rawAssets.filter(s => s && !s.startsWith('http'));
  const externalAssets = rawAssets.filter(s => s && s.startsWith('http'));

  console.log(`Parsed ${rawAssets.length} total assets (${localAssets.length} local, ${externalAssets.length} external).`);
  let missing = 0;
  
  for (const asset of localAssets) {
    let relativePath = asset;
    if (relativePath.startsWith('./')) {
      relativePath = relativePath.substring(2);
    }
    if (relativePath === '') {
      relativePath = 'index.html';
    }
    
    const fullPath = path.resolve(relativePath);
    if (!fs.existsSync(fullPath)) {
      console.log('MISSING ASSET:', relativePath, 'at', fullPath);
      missing++;
    }
  }
  
  if (missing === 0) {
    console.log('All local assets exist in the filesystem!');
  } else {
    console.log(`${missing} assets are missing!`);
  }
} else {
  console.log('ASSETS array not found');
}

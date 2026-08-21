import fs from 'fs';
import path from 'path';

const query = process.argv.slice(2).join(' ').toLowerCase();
if (!query) {
  console.log("Usage: node scratch/search_dmg.js <search query>");
  process.exit(0);
}

console.log(`Searching DMG for: "${query}"...`);

const dmgDir = 'data/dmg';
if (!fs.existsSync(dmgDir)) {
  console.error("Error: DMG pages directory data/dmg does not exist. Please run slice_dmg.js first.");
  process.exit(1);
}

const files = fs.readdirSync(dmgDir);
const results = [];

files.forEach(file => {
  if (!file.endsWith('.txt')) return;
  const filePath = path.join(dmgDir, file);
  const text = fs.readFileSync(filePath, 'utf8');
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes(query)) {
    const index = lowerText.indexOf(query);
    const start = Math.max(0, index - 250);
    const end = Math.min(text.length, index + query.length + 250);
    const snippet = text.slice(start, end).replace(/\n/g, ' ').trim();
    const pageNum = file.match(/\d+/)[0];
    results.push({ pageNum, file, snippet });
  }
});

console.log(`Found ${results.length} matches.\n`);

results.slice(0, 10).forEach(res => {
  console.log(`[Page ${res.pageNum}] (${res.file}):`);
  console.log(`... ${res.snippet} ...`);
  console.log('-'.repeat(40));
});

if (results.length > 10) {
  console.log(`(Showing first 10 matches of ${results.length}. Refine search query if needed.)`);
}

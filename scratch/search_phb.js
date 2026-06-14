import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phbDir = path.join(__dirname, '..', 'data', 'phb');

let args = process.argv.slice(2);
let chapterFilter = null;
let query = '';

if (args[0] === '--ch' || args[0] === '-ch') {
  chapterFilter = args[1];
  query = args.slice(2).join(' ');
} else {
  query = args.join(' ');
}

if (!query) {
  console.log("Usage: node scratch/search_phb.js [--ch <num|name>] <query>");
  console.log("Example: node scratch/search_phb.js grapple");
  console.log("Example: node scratch/search_phb.js --ch 8 grapple");
  process.exit(0);
}

if (!fs.existsSync(phbDir)) {
  console.error(`Error: PHB directory not found at ${phbDir}`);
  process.exit(1);
}

try {
  let files = fs.readdirSync(phbDir).filter(f => f.endsWith('.txt'));
  
  if (chapterFilter) {
    const chPattern = new RegExp(`ch${chapterFilter}_|intro`, 'i');
    files = files.filter(f => chPattern.test(f) || f.includes(chapterFilter));
    console.log(`Filtering search to files matching: "${chapterFilter}" (${files.join(', ')})`);
  }

  console.log(`Searching for: "${query}"...`);
  let totalMatches = 0;
  const maxMatchesToDisplay = 15;
  const matches = [];

  files.forEach(file => {
    const filePath = path.join(phbDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(query.toLowerCase())) {
        matches.push({
          file,
          lineNum: idx + 1,
          lineContent: line.trim(),
          context: lines.slice(Math.max(0, idx - 4), Math.min(lines.length, idx + 15))
        });
        totalMatches++;
      }
    });
  });

  console.log(`Found ${totalMatches} total match(es).`);

  matches.slice(0, maxMatchesToDisplay).forEach((match, index) => {
    console.log(`\n------------------------------------------------------------`);
    console.log(`MATCH ${index + 1}: [${match.file}] Line ${match.lineNum}`);
    console.log(`------------------------------------------------------------`);
    match.context.forEach((cLine, cIdx) => {
      const actualLineNum = match.lineNum - 4 + cIdx;
      const prefix = actualLineNum === match.lineNum ? '>>> ' : '    ';
      console.log(`${prefix}${actualLineNum}: ${cLine}`);
    });
  });

  if (totalMatches > maxMatchesToDisplay) {
    console.log(`\n... and ${totalMatches - maxMatchesToDisplay} more matches. Use a more specific query or filter by chapter.`);
  }
} catch (err) {
  console.error("Error searching rules:", err);
}

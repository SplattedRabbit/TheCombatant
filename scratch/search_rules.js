import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rulesPath = path.join(__dirname, '..', 'playershandbook_35e.txt');

const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log("Usage: node search_rules.js <search query>");
  process.exit(0);
}

console.log(`Searching rules for query: "${query}"...`);

if (!fs.existsSync(rulesPath)) {
  console.error(`Error: Rules text file not found at ${rulesPath}`);
  console.error("Please run: node extract_full_pdf.js first to extract the text from the PDF.");
  process.exit(1);
}

try {
  const text = fs.readFileSync(rulesPath, 'utf8');
  const lines = text.split('\n');
  console.log(`Total lines in rules database: ${lines.length}`);
  
  let matches = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(query.toLowerCase())) {
      matches.push(i);
    }
  }
  
  console.log(`Found ${matches.length} matches.`);
  
  // Show up to 10 matches
  const limit = 10;
  matches.slice(0, limit).forEach((matchIdx, index) => {
    console.log(`\n=================== MATCH ${index + 1} (Line ${matchIdx + 1}) ===================`);
    const start = Math.max(0, matchIdx - 5);
    const end = Math.min(lines.length, matchIdx + 25);
    for (let j = start; j < end; j++) {
      const prefix = j === matchIdx ? '>>> ' : '    ';
      console.log(`${prefix}${j + 1}: ${lines[j]}`);
    }
  });
  
  if (matches.length > limit) {
    console.log(`\n... and ${matches.length - limit} more matches. Narrow down your query if needed.`);
  }
} catch (err) {
  console.error("Error reading or parsing rules text file:", err);
}

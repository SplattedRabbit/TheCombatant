import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phbPath = path.join(__dirname, '..', 'PlayersHandbookI.txt');

if (!fs.existsSync(phbPath)) {
  console.error("PlayersHandbookI.txt not found!");
  process.exit(1);
}

const text = fs.readFileSync(phbPath, 'utf8');
const lines = text.split('\n');

console.log("Analyzing file for Chapter titles...");

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (/^CHAPTER\s+\d+/i.test(line)) {
    console.log(`Line ${i + 1}: ${line} -> ${lines[i+1]?.trim()} -> ${lines[i+2]?.trim()}`);
  }
}

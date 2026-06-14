import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phbPath = path.join(__dirname, '..', 'PlayersHandbookI.txt');
const text = fs.readFileSync(phbPath, 'utf8');
const lines = text.split('\n');

const chapterFirstSeen = {};

// Skip first 500 lines to avoid the Table of Contents
for (let i = 500; i < lines.length; i++) {
  const line = lines[i].trim();
  const match = line.match(/^CHAPTER\s+(\d+):/); // exact uppercase match
  if (match) {
    const chNum = parseInt(match[1]);
    if (chapterFirstSeen[chNum] === undefined) {
      chapterFirstSeen[chNum] = {
        line: i + 1,
        content: line + " " + (lines[i+1]?.trim() || "")
      };
    }
  }
}

console.log("Chapter First Occurrences (skip TOC):");
console.log(JSON.stringify(chapterFirstSeen, null, 2));

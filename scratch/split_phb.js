import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phbPath = path.join(__dirname, '..', 'PlayersHandbookI.txt');
const outputDir = path.join(__dirname, '..', 'data', 'phb');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(phbPath)) {
  console.error("PlayersHandbookI.txt not found!");
  process.exit(1);
}

const text = fs.readFileSync(phbPath, 'utf8');
const lines = text.split('\n');

const splits = [
  { name: 'phb_intro.txt', start: 1, end: 866 },
  { name: 'phb_ch1_abilities.txt', start: 867, end: 1347 },
  { name: 'phb_ch2_races.txt', start: 1348, end: 2608 },
  { name: 'phb_ch3_classes.txt', start: 2609, end: 7900 },
  { name: 'phb_ch4_skills.txt', start: 7901, end: 11516 },
  { name: 'phb_ch5_feats.txt', start: 11517, end: 13647 },
  { name: 'phb_ch6_description.txt', start: 13648, end: 14765 },
  { name: 'phb_ch7_equipment.txt', start: 14766, end: 17351 },
  { name: 'phb_ch8_combat.txt', start: 17352, end: 20636 },
  { name: 'phb_ch9_adventuring.txt', start: 20637, end: 21669 },
  { name: 'phb_ch10_magic.txt', start: 21670, end: 23333 },
  { name: 'phb_ch11_spells.txt', start: 23334, end: lines.length }
];

console.log("Splitting PlayersHandbookI.txt into chapter files...");

splits.forEach(split => {
  const contentLines = lines.slice(split.start - 1, split.end);
  const outPath = path.join(outputDir, split.name);
  fs.writeFileSync(outPath, contentLines.join('\n'), 'utf8');
  console.log(`Wrote ${split.name} (${contentLines.length} lines, lines ${split.start} to ${split.end})`);
});

console.log("Splitting completed successfully!");

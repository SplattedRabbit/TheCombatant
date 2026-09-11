import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Line ranges determined by locating the first occurrence of each chapter's
// running-header marker in the raw pdf-parse text (after skipping the table
// of contents). Same technique used originally for data/phb/ (see find_first_chapters.js).
const BOOKS = {
  phb2: {
    rawText: path.join(__dirname, '..', 'data', '_raw', 'phb2.txt'),
    outputDir: path.join(__dirname, '..', 'data', 'phb2'),
    prefix: 'phb2',
    splits: [
      { name: 'phb2_intro.txt', start: 1, end: 517 },
      { name: 'phb2_ch1_new_classes.txt', start: 518, end: 3155 },
      { name: 'phb2_ch2_expanded_classes.txt', start: 3156, end: 7689 },
      { name: 'phb2_ch3_new_feats.txt', start: 7690, end: 10055 },
      { name: 'phb2_ch4_new_spells.txt', start: 10056, end: 14347 },
      { name: 'phb2_ch5_building_identity.txt', start: 14348, end: 16191 },
      { name: 'phb2_ch6_adventuring_group.txt', start: 16192, end: 17687 },
      { name: 'phb2_ch7_affiliations.txt', start: 17688, end: 20714 },
      { name: 'phb2_ch8_rebuilding_character.txt', start: 20715, end: null },
    ],
  },
  ca: {
    // Hinweis: Complete Adventurer enthielt im Quell-PDF 89 byte-identische
    // doppelte Seiten (siehe combatant_rulebook_expansion.md). data/_raw/ca.txt
    // wurde mit scratch/extract_pdf_text.js (Seiten-Dedupe) neu erzeugt,
    // daher unterscheiden sich diese Zeilenbereiche von einer naiven Extraktion.
    rawText: path.join(__dirname, '..', 'data', '_raw', 'ca.txt'),
    outputDir: path.join(__dirname, '..', 'data', 'ca'),
    prefix: 'ca',
    splits: [
      { name: 'ca_intro.txt', start: 1, end: 1209 },
      { name: 'ca_ch1_classes.txt', start: 1210, end: 3531 },
      { name: 'ca_ch2_prestige_classes.txt', start: 3532, end: 14343 },
      { name: 'ca_ch3_skills_feats.txt', start: 14344, end: 16989 },
      { name: 'ca_ch4_equipment.txt', start: 16990, end: 19865 },
      { name: 'ca_ch5_spells.txt', start: 19866, end: 23240 },
      { name: 'ca_ch6_organizations.txt', start: 23241, end: null },
    ],
  },
  cs: {
    rawText: path.join(__dirname, '..', 'data', '_raw', 'cs.txt'),
    outputDir: path.join(__dirname, '..', 'data', 'cs'),
    prefix: 'cs',
    splits: [
      { name: 'cs_intro.txt', start: 1, end: 666 },
      { name: 'cs_ch1_scoundrels.txt', start: 667, end: 2474 },
      { name: 'cs_ch2_prestige_classes.txt', start: 2475, end: 7765 },
      { name: 'cs_ch3_feats_skilltricks.txt', start: 7766, end: 9516 },
      { name: 'cs_ch4_spells.txt', start: 9517, end: 11249 },
      { name: 'cs_ch5_equipment.txt', start: 11250, end: 12798 },
      { name: 'cs_ch6_adventures.txt', start: 12799, end: null },
    ],
  },
};

const bookKey = process.argv[2];
const book = BOOKS[bookKey];

if (!book) {
  console.error(`Usage: node scratch/split_book.js <${Object.keys(BOOKS).join('|')}>`);
  process.exit(1);
}

if (!fs.existsSync(book.rawText)) {
  console.error(`Raw text not found: ${book.rawText}`);
  process.exit(1);
}

fs.mkdirSync(book.outputDir, { recursive: true });

const text = fs.readFileSync(book.rawText, 'utf8');
const lines = text.split('\n');

console.log(`Splitting ${bookKey} (${lines.length} lines) into chapter files...`);

book.splits.forEach(split => {
  const end = split.end ?? lines.length;
  const contentLines = lines.slice(split.start - 1, end);
  const outPath = path.join(book.outputDir, split.name);
  fs.writeFileSync(outPath, contentLines.join('\n'), 'utf8');
  console.log(`Wrote ${split.name} (${contentLines.length} lines, lines ${split.start}-${end})`);
});

console.log('Splitting completed successfully!');

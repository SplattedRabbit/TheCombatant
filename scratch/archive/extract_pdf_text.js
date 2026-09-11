import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('../node_modules/pdf-parse/lib/pdf-parse.js');

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node scratch/extract_pdf_text.js <input.pdf> <output.txt>');
  process.exit(1);
}

// Manche gescannten/zusammengefügten PDFs enthalten Seiten, die byte-identisch
// doppelt im Dokument liegen (z.B. Complete Adventurer: Seite 4 == Seite 5).
// Um verdoppelten Text in der Ausgabe zu vermeiden, wird jede Seite übersprungen,
// deren Textinhalt exakt mit der unmittelbar vorherigen Seite übereinstimmt.
let previousPageHash = null;
let skippedPages = 0;
const pageTexts = [];

function pagerender(pageData) {
  return pageData.getTextContent().then(function (textContent) {
    let text = '';
    for (const item of textContent.items) {
      text += item.str + '\n';
    }
    const hash = crypto.createHash('md5').update(text.trim()).digest('hex');
    if (hash === previousPageHash) {
      skippedPages++;
      previousPageHash = hash;
      return '';
    }
    previousPageHash = hash;
    pageTexts.push(text);
    return text;
  });
}

console.log(`Extracting text from "${inputPath}"...`);
const dataBuffer = fs.readFileSync(inputPath);

pdf(dataBuffer, { pagerender }).then(function (data) {
  const text = pageTexts.join('\n\n');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, text, 'utf8');
  console.log(`Wrote ${outputPath} (${text.length} characters, ${data.numpages} PDF-Seiten, ${skippedPages} als Duplikat übersprungen).`);
}).catch(err => {
  console.error('Error parsing PDF:', err);
  process.exit(1);
});

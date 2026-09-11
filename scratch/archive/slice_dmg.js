import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('../node_modules/pdf-parse/lib/pdf-parse.js');

console.log("Starting PDF extraction of DungeonMastersGuide.pdf...");
const dataBuffer = fs.readFileSync('data/DungeonMastersGuide.pdf');

// Custom page render to append a form-feed character at the end of each page
function customPageRender(pageData) {
  return pageData.getTextContent({
    normalizeWhitespace: false,
    disableCombineTextItems: false
  }).then(function(textContent) {
    let lastY, text = '';
    for (let item of textContent.items) {
      if (lastY === item.transform[5] || !lastY) {
        text += item.str;
      } else {
        text += '\n' + item.str;
      }
      lastY = item.transform[5];
    }
    return text + '\f'; // Append form feed to mark page boundary
  });
}

pdf(dataBuffer, { pagerender: customPageRender }).then(function(data) {
  // Now we can split by form feed
  const pages = data.text.split('\f');
  // Note: the last element of pages might be empty due to trailing \f
  if (pages.length > 0 && pages[pages.length - 1].trim() === '') {
    pages.pop();
  }
  
  console.log(`Extracted ${pages.length} pages.`);
  
  const outputDir = 'data/dmg';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  } else {
    // Clear old files from output directory first to start clean
    const oldFiles = fs.readdirSync(outputDir);
    oldFiles.forEach(file => {
      fs.unlinkSync(`${outputDir}/${file}`);
    });
  }
  
  pages.forEach((pageText, index) => {
    const pageNum = index + 1;
    fs.writeFileSync(`${outputDir}/page_${pageNum}.txt`, pageText.trim(), 'utf8');
  });
  
  console.log(`Successfully sliced DMG into ${pages.length} page files in data/dmg/`);
}).catch(err => {
  console.error("Error parsing PDF:", err);
});


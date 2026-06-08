const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:\\Users\\styles\\PRIVATE\\CombatApp\\playershandbook_35e.pdf';

console.log("Reading rules PDF...");
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  const text = data.text;
  const lines = text.split('\n');
  
  console.log("Extracting lines 3800 to 4960 of parsed text (Monk features)...");
  console.log("------------------------------------------------------------------------");
  for (let i = 3800; i < 4960; i++) {
    if (i < lines.length) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
  console.log("------------------------------------------------------------------------");
}).catch(err => {
  console.error("Error reading PDF:", err);
});

const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:\\Users\\styles\\PRIVATE\\CombatApp\\playershandbook_35e.pdf';

console.log("Reading rules PDF...");
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  const text = data.text;
  const lines = text.split('\n');
  
  console.log("Extracting lines 4950 to 5350 of parsed text (Monk features details)...");
  console.log("------------------------------------------------------------------------");
  for (let i = 4950; i < 5350; i++) {
    if (i < lines.length) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
  console.log("------------------------------------------------------------------------");
}).catch(err => {
  console.error("Error reading PDF:", err);
});

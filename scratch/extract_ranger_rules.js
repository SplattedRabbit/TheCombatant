const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:\\Users\\styles\\PRIVATE\\CombatApp\\playershandbook_35e.pdf';

console.log("Reading rules PDF...");
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  const text = data.text;
  const lines = text.split('\n');
  
  const startIndex = 5700;
  const endIndex = 6200;
  
  const rangerText = lines.slice(startIndex, endIndex).map((line, idx) => `${startIndex + idx}: ${line}`).join('\n');
  fs.writeFileSync('c:\\Users\\styles\\PRIVATE\\CombatApp\\scratch\\ranger_rules.txt', rangerText);
  console.log("Ranger rules written to scratch/ranger_rules.txt");
}).catch(err => {
  console.error("Error reading PDF:", err);
});

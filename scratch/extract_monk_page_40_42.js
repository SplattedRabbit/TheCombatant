const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:\\Users\\styles\\PRIVATE\\CombatApp\\playershandbook_35e.pdf';

console.log("Reading rules PDF...");
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  const text = data.text;
  const lines = text.split('\n');
  
  let output = [];
  const start = 4940;
  const end = 5220;
  for (let i = start; i < end; i++) {
    if (i < lines.length) {
      output.push(`${i + 1}: ${lines[i]}`);
    }
  }
  
  fs.writeFileSync('scratch/monk_rules.txt', output.join('\n'));
  console.log("Written scratch/monk_rules.txt successfully!");
}).catch(err => {
  console.error("Error reading PDF:", err);
});

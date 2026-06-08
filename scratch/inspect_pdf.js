const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:\\Users\\styles\\PRIVATE\\CombatApp\\playershandbook_35e.pdf';

console.log("Reading rules PDF...");
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  const text = data.text;
  console.log(`PDF parsed successfully. Total characters: ${text.length}`);
  console.log("=================== FIRST 2000 CHARACTERS ===================");
  console.log(text.substring(0, 2000));
  console.log("=============================================================");
}).catch(err => {
  console.error("Error reading PDF:", err);
});

const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:\\Users\\styles\\PRIVATE\\CombatApp\\playershandbook_35e.pdf';
const outputPath = 'c:\\Users\\styles\\PRIVATE\\CombatApp\\playershandbook_35e.txt';

console.log("Reading rules PDF: " + pdfPath);
try {
  const dataBuffer = fs.readFileSync(pdfPath);
  console.log("Starting PDF extraction (this might take a few seconds)...");
  
  pdf(dataBuffer).then(function(data) {
    const text = data.text;
    console.log(`PDF parsed successfully. Total characters extracted: ${text.length}`);
    
    // Normalize newlines to \n
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText.split('\n');
    console.log(`Total lines: ${lines.length}`);
    
    fs.writeFileSync(outputPath, normalizedText, 'utf8');
    console.log(`Successfully wrote extracted text to: ${outputPath}`);
  }).catch(err => {
    console.error("Error during PDF parsing:", err);
  });
} catch (err) {
  console.error("Error reading file:", err);
}

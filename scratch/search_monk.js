const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:\\Users\\styles\\PRIVATE\\CombatApp\\playershandbook_35e.pdf';

console.log("Reading rules PDF...");
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  const text = data.text;
  const lines = text.split('\n');
  console.log(`PDF parsed successfully. Total lines: ${lines.length}. Searching for Monk terms...`);

  const terms = [
    { name: "Flurry of Blows", query: "Flurry of Blows" },
    { name: "Abundant Step", query: "Abundant Step" },
    { name: "Quivering Palm", query: "Quivering Palm" },
    { name: "Purity of Body", query: "Purity of Body" },
    { name: "Empty Body", query: "Empty Body" }
  ];

  terms.forEach(term => {
    console.log(`\n=========================================`);
    console.log(`SEARCHING FOR: ${term.name} (Query: "${term.query}")`);
    console.log(`=========================================`);
    
    let matches = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(term.query.toLowerCase())) {
        matches.push(i);
      }
    }
    
    console.log(`Found ${matches.length} matches.`);
    // Take matches and print the text context surrounding them (+/- 15 lines)
    matches.slice(0, 3).forEach((matchIdx, index) => {
      console.log(`\n--- Match ${index + 1} (Line ${matchIdx + 1}) ---`);
      const start = Math.max(0, matchIdx - 5);
      const end = Math.min(lines.length, matchIdx + 25);
      for (let j = start; j < end; j++) {
        console.log(`${j + 1}: ${lines[j]}`);
      }
    });
  });

}).catch(err => {
  console.error("Error reading PDF:", err);
});

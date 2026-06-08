const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:\\Users\\styles\\PRIVATE\\CombatApp\\playershandbook_35e.pdf';

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  const text = data.text;
  const lines = text.split('\n');

  const sections = [
    { name: "Flurry of Blows", startPattern: "Flurry of Blows (Ex):", endPattern: "unarmed strike" },
    { name: "Still Mind", startPattern: "Still Mind (Ex):", endPattern: "AC Bonus" },
    { name: "Purity of Body", startPattern: "Purity of Body (Ex):", endPattern: "AC Bonus" },
    { name: "Abundant Step", startPattern: "Abundant Step (Sp):", endPattern: "AC Bonus" },
    { name: "Quivering Palm", startPattern: "Quivering Palm (Sp):", endPattern: "AC Bonus" },
    { name: "Empty Body", startPattern: "Empty Body (Su):", endPattern: "AC Bonus" }
  ];

  sections.forEach(sec => {
    console.log(`\n=========================================`);
    console.log(`SECTION: ${sec.name}`);
    console.log(`=========================================`);
    let foundIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(sec.startPattern)) {
        foundIdx = i;
        break;
      }
    }
    
    if (foundIdx === -1) {
      // Try a looser match
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(sec.name.toLowerCase()) && lines[i].includes('(E') || lines[i].includes('(S')) {
          foundIdx = i;
          break;
        }
      }
    }

    if (foundIdx !== -1) {
      // Print 20 lines starting from foundIdx
      for (let j = foundIdx; j < foundIdx + 30; j++) {
        if (j < lines.length) {
          console.log(`${j+1}: ${lines[j]}`);
        }
      }
    } else {
      console.log(`Could not find start pattern for ${sec.name}`);
    }
  });

}).catch(err => {
  console.error("Error:", err);
});

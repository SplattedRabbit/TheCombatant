import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('../node_modules/pdf-parse/lib/pdf-parse.js');

console.log("Starting PDF extraction of PlayersHandbookI.pdf...");
const dataBuffer = fs.readFileSync('./PlayersHandbookI.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('./PlayersHandbookI.txt', data.text, 'utf8');
    console.log("PDF parsed successfully! Text written to PlayersHandbookI.txt");
    console.log("Extracted text length:", data.text.length, "characters.");
}).catch(err => {
    console.error("Error parsing PDF:", err);
});


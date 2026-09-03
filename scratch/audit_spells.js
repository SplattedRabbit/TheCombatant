import fs from 'fs';

const phb = JSON.parse(fs.readFileSync('./data/spells-phb.json', 'utf8'));
const phb2 = JSON.parse(fs.readFileSync('./data/spells-phb2.json', 'utf8'));
const ca = JSON.parse(fs.readFileSync('./data/spells-ca.json', 'utf8'));
const cs = JSON.parse(fs.readFileSync('./data/spells-cs.json', 'utf8'));

console.log('Total PHB spells in json:', Object.keys(phb).length);
console.log('Total PHB2 spells in json:', Object.keys(phb2).length);
console.log('Total CA spells in json:', Object.keys(ca).length);
console.log('Total CS spells in json:', Object.keys(cs).length);

// Check if description ends with another spell title + school
const suspicious = [];
for (const [key, s] of Object.entries(phb)) {
  const d = s.description || '';
  const match = d.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation|Universal)/);
  if (match) {
    suspicious.push({ key, spell: s.nameEn, tail: match[0], match: match[1] });
  }
}

console.log('\nSuspicious descriptions (likely swallowed spell headers):', suspicious.length);
suspicious.forEach(s => console.log(`- In "${s.key}" (${s.spell}): found tail "${s.tail}"`));

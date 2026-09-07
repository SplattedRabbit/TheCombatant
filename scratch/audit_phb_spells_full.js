import fs from 'fs';

const phb = JSON.parse(fs.readFileSync('./data/spells-phb.json', 'utf8'));

// Check for corrupted keys or concatenated entries
const allKeys = Object.keys(phb);
console.log('Total keys currently in spells-phb.json:', allKeys.length);

const malformedKeys = allKeys.filter(k => k.includes('__') || k.length > 35 || k.endsWith('_'));
console.log('Malformed / suspicious keys:', malformedKeys);

// Check all spells with tails
let countWithTails = 0;
for (const [key, s] of Object.entries(phb)) {
  const d = s.description || '';
  if (/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation|Universal)/.test(d)) {
    countWithTails++;
  }
}
console.log('Spells with swallowed tail headers:', countWithTails);

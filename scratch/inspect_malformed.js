import fs from 'fs';

const phb = JSON.parse(fs.readFileSync('./data/spells-phb.json', 'utf8'));

const malformedKeys = [
  'enchantment_compulsion_',
  'enchantment_compulsion_mind_',
  'enchantment_compulsion_fear_mind_',
  'enchantment_compulsion_language_',
  'illusion_phantasm_mind_affecting_',
  'enchantment_compulsion_death_'
];

for (const k of malformedKeys) {
  console.log(`\n=== Key: ${k} ===`);
  console.log(JSON.stringify(phb[k], null, 2));
}

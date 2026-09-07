import fs from 'fs';

const books = ['phb', 'phb2', 'ca', 'cs'];
let totalSpells = 0;
let issues = [];

for (const book of books) {
  const filePath = `./data/spells-${book}.json`;
  if (!fs.existsSync(filePath)) {
    issues.push(`File missing: ${filePath}`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const count = Object.keys(data).length;
  totalSpells += count;
  console.log(`Checking spells-${book}.json (${count} spells)...`);

  for (const [key, spell] of Object.entries(data)) {
    // 1. Check names
    if (!spell.nameEn || spell.nameEn.trim() === '' || spell.nameEn === key) {
      issues.push(`[${book}] Key "${key}": missing or raw nameEn ("${spell.nameEn}")`);
    }
    if (!spell.nameDe || spell.nameDe.trim() === '') {
      issues.push(`[${book}] Key "${key}": missing nameDe`);
    }

    // 2. Check school
    if (!spell.school || spell.school.trim() === '') {
      issues.push(`[${book}] Key "${key}": missing school`);
    }

    // 3. Check level
    if (typeof spell.level !== 'number') {
      issues.push(`[${book}] Key "${key}": invalid level (${spell.level})`);
    }

    // 4. Check description
    if (!spell.description || spell.description.trim() === '' || spell.description.length < 15) {
      issues.push(`[${book}] Key "${key}": missing or very short description ("${spell.description}")`);
    }

    // 5. Check formatting artifacts
    if (spell.nameEn && spell.nameEn.includes('_')) {
      issues.push(`[${book}] Key "${key}": nameEn has underscore ("${spell.nameEn}")`);
    }
  }
}

console.log(`\n=== Spell Health Summary ===`);
console.log(`Total Spells Checked: ${totalSpells}`);
console.log(`Issues Found: ${issues.length}`);
if (issues.length > 0) {
  console.log('\nTop 20 Issues:');
  issues.slice(0, 20).forEach(i => console.log(' - ' + i));
} else {
  console.log('✓ All spells across all books have complete names, schools, levels, and descriptions!');
}

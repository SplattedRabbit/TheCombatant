import { execSync } from 'child_process';
import fs from 'fs';

function main() {
  const output = execSync('git status --porcelain', { encoding: 'utf-8' });
  const modifiedFiles = output.split('\n')
    .map(line => line.substring(3).trim())
    .filter(file => file.endsWith('.js') && !file.startsWith('Tests/'));

  console.log(`Checking ${modifiedFiles.length} modified JS files...`);
  let missing = 0;

  for (const file of modifiedFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('@module')) {
      console.log(`❌ Missing @module header in: ${file}`);
      missing++;
    } else {
      console.log(`✅ Has @module header: ${file}`);
    }
  }

  console.log(`Done. Missing: ${missing}`);
}

main();

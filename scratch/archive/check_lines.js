import fs from 'fs';
import path from 'path';

function getJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        getJsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getJsFiles('.');
const results = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n').length;
  results.push({ file, lines });
}

results.sort((a, b) => b.lines - a.lines);
console.log('Top 30 files by line count:');
results.slice(0, 30).forEach(r => {
  console.log(`${r.lines.toString().padStart(5)} lines: ${r.file}`);
});

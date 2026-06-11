import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\Juls\\.gemini\\antigravity\\brain\\d133dd27-9b7f-4d31-a8c3-740d000c9771\\.system_generated\\logs\\transcript.jsonl';

async function main() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const steps = [1747, 1759, 1773, 2233, 2237];
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (steps.includes(obj.step_index)) {
        console.log(`\n=========================================`);
        console.log(`Step ${obj.step_index} (${obj.source} / ${obj.type})`);
        console.log(`=========================================`);
        console.log(obj.content);
      }
    } catch (e) {
      // ignore
    }
  }
}

main().catch(console.error);

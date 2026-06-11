import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\Juls\\.gemini\\antigravity\\brain\\d133dd27-9b7f-4d31-a8c3-740d000c9771\\.system_generated\\logs\\transcript.jsonl';

async function main() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 1747) {
        console.log(JSON.stringify(obj, null, 2));
        break;
      }
    } catch (e) {
      // ignore
    }
  }
}

main().catch(console.error);

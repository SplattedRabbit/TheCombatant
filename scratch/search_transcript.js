import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\Juls\\.gemini\\antigravity\\brain\\d133dd27-9b7f-4d31-a8c3-740d000c9771\\.system_generated\\logs\\transcript.jsonl';

async function main() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const history = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.step_index >= 1746 && obj.step_index < 2667) {
        history.push({
          step: obj.step_index,
          source: obj.source,
          type: obj.type,
          content: obj.content || ''
        });
      }
    } catch (e) {
      // ignore
    }
  }

  // Find all user inputs
  const userInputs = history.filter(h => h.type === 'USER_INPUT');
  console.log(`Total user inputs in range: ${userInputs.length}`);

  for (const ui of userInputs) {
    console.log(`\n--- [Step ${ui.step}] USER ---`);
    console.log(ui.content);

    // Also find the model response immediately following this user input
    const nextModel = history.find(h => h.step > ui.step && h.source === 'MODEL' && h.type === 'PLANNER_RESPONSE');
    if (nextModel) {
      console.log(`\n--- [Step ${nextModel.step}] MODEL RESPONSE ---`);
      console.log(nextModel.content.slice(0, 1000) + (nextModel.content.length > 1000 ? '...' : ''));
    }
  }
}

main().catch(console.error);

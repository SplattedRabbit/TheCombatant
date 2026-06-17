/**
 * @module    run_agent_tests
 * @summary   Token-optimized Node.js test runner for AI agents. Intercepts and filters output.
 */

import { spawn } from 'child_process';

const args = ['--import', './Tests/setup.js', '--test'];
const userArgs = process.argv.slice(2);

if (userArgs.length > 0) {
  args.push(...userArgs);
} else {
  args.push('Tests/**/*.test.js');
}

const child = spawn('node', args, {
  env: { ...process.env, NODE_ENV: 'test' }
});

let stdoutBuffer = '';
let stderrBuffer = '';

child.stdout.on('data', (data) => {
  stdoutBuffer += data.toString();
});

child.stderr.on('data', (data) => {
  stderrBuffer += data.toString();
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✔ Test suite completed successfully!');
    // Extrahiere nur Zusammenfassungzeilen
    const lines = stdoutBuffer.split('\n');
    const summary = lines.filter(line => 
      line.startsWith('ℹ tests') || 
      line.startsWith('ℹ suites') || 
      line.startsWith('ℹ pass') || 
      line.startsWith('ℹ fail') || 
      line.startsWith('ℹ cancelled') || 
      line.startsWith('ℹ skipped') || 
      line.startsWith('ℹ duration_ms')
    ).map(l => l.trim()).join(' | ');
    if (summary) {
      console.log(summary);
    } else {
      console.log('All tests passed.');
    }
  } else {
    console.error(`❌ Test suite failed with exit code ${code}\n`);
    
    // Filter out successful test names and print only error details
    const lines = stdoutBuffer.split('\n');
    const errors = [];
    let isStack = false;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (line.includes('✖') || line.includes('Error:') || line.includes('AssertionError')) {
        errors.push(line);
        isStack = true;
      } else if (isStack && line.startsWith('    at ')) {
        errors.push(line);
      } else if (trimmed === '') {
        isStack = false;
      }
    });
    
    if (errors.length > 0) {
      console.error('--- Failure Details ---');
      console.error(errors.join('\n'));
    } else {
      // Fallback: Wenn wir den Fehler nicht parsen konnten, gib die letzten 50 Zeilen aus
      console.error('--- Full stdout (Tail 50 lines) ---');
      console.error(lines.slice(-50).join('\n'));
    }
    
    if (stderrBuffer.trim().length > 0) {
      console.error('\n--- Stderr ---');
      console.error(stderrBuffer);
    }
  }
});

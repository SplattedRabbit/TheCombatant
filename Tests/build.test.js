import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Production Build Verification', () => {
  it('should compile and build the entire application without errors', () => {
    try {
      const rootDir = path.resolve(__dirname, '..');
      // Run the full production build pipeline to verify compiling + post-build scripts
      execSync('npm run build', { cwd: rootDir, stdio: 'ignore' });
      assert.ok(true, 'Build pipeline completed successfully');
    } catch (error) {
      assert.fail(`Vite compilation or post-build pipeline failed: ${error.message}`);
    }
  });
});

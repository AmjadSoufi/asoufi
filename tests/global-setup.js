const { execFileSync } = require('node:child_process');
const path = require('node:path');

// Also runs for direct `npx playwright test` and the interactive test UI.
module.exports = () => {
  execFileSync('npm', ['run', 'build'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });
};

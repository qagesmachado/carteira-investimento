const fs = require('node:fs');
const path = require('node:path');

function resolveBackendPython() {
  const backendDir = path.join(__dirname, '..', 'backend');
  const winVenv = path.join(backendDir, '.venv', 'Scripts', 'python.exe');
  if (process.platform === 'win32' && fs.existsSync(winVenv)) {
    return winVenv;
  }
  const unixVenv = path.join(backendDir, '.venv', 'bin', 'python');
  if (fs.existsSync(unixVenv)) {
    return unixVenv;
  }
  return 'python';
}

module.exports = { resolveBackendPython };

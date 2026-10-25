const fs = require('fs');
const path = require('path');
const os = require('os');

/** arm64 headless shell when Playwright resolves mac-x64 in this environment */
function chromiumLaunchOptions() {
  const root =
    process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), 'Library/Caches/ms-playwright');
  const arm64 = path.join(
    root,
    'chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  );
  if (fs.existsSync(arm64)) {
    return { executablePath: arm64, args: ['--no-sandbox', '--disable-dev-shm-usage'] };
  }
  return {};
}

module.exports = { chromiumLaunchOptions };

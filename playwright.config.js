// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  /* CI: serial only (parallel races SW/origin). Slim smoke/security match ≪60m.
     Full suite: `npm run test:e2e` locally. */
  retries: process.env.CI ? 0 : 0,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: process.env.CI ? 'off' : 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      ...(process.env.CI
        ? {
            /* Gate: unlock, a11y, XSS/export, lockout, KDF wrap, network-off, viewport HIG. */
            testMatch: [
              /smoke\.spec\.js/,
              /a11y\.spec\.js/,
              /export-security\.spec\.js/,
              /lockout\.spec\.js/,
              /vault-kdf-wrap\.spec\.js/,
              /network-default-off\.spec\.js/,
              /viewport\.spec\.js/,
            ],
          }
        : {
            testIgnore: [/webkit-safari\.spec\.js/],
          }),
    },
    {
      name: 'webkit-iphone',
      testMatch: /webkit-safari\.spec\.js/,
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: 'python3 -m http.server 8765',
    url: 'http://127.0.0.1:8765',
    reuseExistingServer: true,
    timeout: 120000,
  },
});

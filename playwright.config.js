// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  /* CI gate ~67 tests serial — parallel workers race VaultCap's SW/origin (PIN vs pgHome).
     Full suite stays local (`npm run test:e2e`). */
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      /* Heavy sweeps / volume suites stay local/verify — gate keeps smoke+security+nav core. */
      testIgnore: process.env.CI
        ? [
            /webkit-safari\.spec\.js/,
            /screenshots\.spec\.js/,
            /gallery-v3\.spec\.mjs/,
            /device-matrix\.spec\.js/,
            /banks-logo-shot\.spec\.js/,
            /click-all\.spec\.js/,
            /full-navigation\.spec\.js/,
            /forms-coverage\.spec\.js/,
            /settings-tabs\.spec\.js/,
            /crud-roundtrip\.spec\.js/,
          ]
        : [/webkit-safari\.spec\.js/],
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

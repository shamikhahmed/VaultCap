// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  /* CI: one retry only; parallelize — serial 150+ tests still blew 60m after gallery skip. */
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      /* Gallery/screenshot/click-all sweeps stay local/verify — too heavy for gate CI. */
      testIgnore: process.env.CI
        ? [
            /webkit-safari\.spec\.js/,
            /screenshots\.spec\.js/,
            /gallery-v3\.spec\.mjs/,
            /device-matrix\.spec\.js/,
            /banks-logo-shot\.spec\.js/,
            /click-all\.spec\.js/,
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

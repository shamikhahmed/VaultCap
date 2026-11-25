// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/* VAULTCAP_PORT lets parallel checkouts (worktrees) test side by side without reusing each other's server. */
const PORT = process.env.VAULTCAP_PORT || '8765';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  /* Serial only — parallel workers race SW/origin (PIN vs pgHome).
     Slim gate when VAULTCAP_CI_GATE=1 (quality job). Full suite: `npm run test:e2e`.
     Do NOT key match on CI=true — finish-matrix job also has CI and needs its own file. */
  retries: process.env.VAULTCAP_CI_GATE ? 0 : (process.env.CI ? 1 : 0),
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: process.env.VAULTCAP_CI_GATE ? 'off' : 'on-first-retry',
    /* Block SW so prior tests cannot leave a controlling worker that skips lock UI. */
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'chromium',
      ...(process.env.VAULTCAP_CI_GATE
        ? {
            /* Gate: unlock, a11y, XSS/export, lockout, KDF wrap, network-off, viewport HIG, HIG 6 design. */
            testMatch: [
              /smoke\.spec\.js/,
              /a11y\.spec\.js/,
              /export-security\.spec\.js/,
              /lockout\.spec\.js/,
              /vault-kdf-wrap\.spec\.js/,
              /network-default-off\.spec\.js/,
              /viewport\.spec\.js/,
              /hig-design\.spec\.js/,
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
    /* Node static server — python http.server BrokenPipe under SW precache storms. */
    command: `node scripts/pw-static.mjs`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 120000,
    env: { ...process.env, VAULTCAP_PORT: PORT, PORT },
  },
});

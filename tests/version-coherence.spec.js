// @ts-check
/** VERSION.json ↔ SW CACHE ↔ package.json ↔ boot-ver (no browser needed beyond Playwright harness). */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

test.describe('version coherence', () => {
  test('VERSION.json swCache matches sw-v51.js CACHE and package/boot versions', () => {
    const ver = JSON.parse(fs.readFileSync(path.join(root, 'VERSION.json'), 'utf8'));
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const sw = fs.readFileSync(path.join(root, 'sw-v51.js'), 'utf8');
    const boot = fs.readFileSync(path.join(root, 'js/boot-ver.js'), 'utf8');
    const cache = sw.match(/const\s+CACHE\s*=\s*'([^']+)'/);
    expect(cache, 'sw CACHE constant').toBeTruthy();
    expect(cache[1]).toBe(ver.swCache);
    expect(pkg.version).toBe(ver.version);
    expect(boot).toMatch(new RegExp(`window\\.VER\\s*=\\s*'${ver.version.replace(/\./g, '\\.')}'`));
    expect(boot).toMatch(new RegExp(`window\\.APP_VERSION\\s*=\\s*'${ver.version.replace(/\./g, '\\.')}'`));
  });
});

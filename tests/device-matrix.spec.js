// @ts-check
/**
 * Device matrix visual QA — set DEVICE_MATRIX=1 to capture.
 * Out: qa/device-matrix/{family}/{device-id}/{screen}.png + meta.json
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { fastGalleryUnlock, prepareGalleryShot, dismissOverlays } = require('./demo-unlock');
const { ALL_DEVICES, MAJOR_SCREENS, applyDeviceChrome, probeLayout } = require('./device-matrix');

const OUT = path.join(__dirname, '..', 'qa', 'device-matrix');
const RUN = process.env.DEVICE_MATRIX === '1';

test.describe('Device matrix visual QA', () => {
  test.skip(!RUN, 'Set DEVICE_MATRIX=1 to capture');

  test('capture major screens across iPhone / iPad / browser', async ({ page }) => {
    test.setTimeout(45 * 60 * 1000);
    fs.mkdirSync(OUT, { recursive: true });
    /** @type {object[]} */
    const meta = [];

    await fastGalleryUnlock(page);
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      try { localStorage.setItem('vos_theme', 'dark'); } catch (e) {}
    });

    for (const device of ALL_DEVICES) {
      const dir = path.join(OUT, device.family, device.id);
      fs.mkdirSync(dir, { recursive: true });
      await applyDeviceChrome(page, device);
      await page.waitForTimeout(100);

      for (const screen of MAJOR_SCREENS) {
        await dismissOverlays(page);
        await applyDeviceChrome(page, device);

        if (screen.kind === 'lock') {
          // Visual-only: do not call R.lock() (would wipe session mid-matrix)
          await page.evaluate(() => {
            document.body.classList.add('on-lock');
            const tw = document.getElementById('toastWrap');
            if (tw) tw.innerHTML = '';
            const app = document.getElementById('app');
            if (app) app.style.display = 'none';
            ['pgHome', 'pgOnboard', 'pgProfilePicker'].forEach((id) => {
              const el = document.getElementById(id);
              if (el) el.style.display = 'none';
            });
            const lock = document.getElementById('pgLock');
            if (lock) lock.style.display = 'flex';
          });
          await page.waitForTimeout(200);
          await prepareGalleryShot(page, { preserveOverlays: true });
        } else if (screen.kind === 'overlay') {
          await page.evaluate(() => {
            if (typeof R !== 'undefined') R.goto('dashboard');
          });
          await page.waitForTimeout(200);
          await page.evaluate(() => {
            if (typeof openMore === 'function') openMore();
            else if (typeof FAB !== 'undefined' && FAB.open) FAB.open();
            else {
              const more = document.getElementById('moreSheet');
              if (more) more.style.display = 'block';
            }
          });
          await page.waitForTimeout(280);
          await prepareGalleryShot(page, { preserveOverlays: true });
        } else {
          await page.evaluate((route) => {
            if (typeof R !== 'undefined') R.goto(route);
          }, screen.route);
          await page.waitForTimeout(280);
          if (screen.route === 'settings') {
            await page.evaluate(() => {
              if (typeof SettingsNav !== 'undefined') SettingsNav.show('profile');
            });
            await page.waitForTimeout(120);
          }
          await prepareGalleryShot(page);
        }

        const probe = await probeLayout(page);
        const file = path.join(dir, `${screen.id}.png`);
        await page.screenshot({ path: file, fullPage: false });

        meta.push({
          family: device.family,
          deviceId: device.id,
          label: device.label,
          width: device.width,
          height: device.height,
          chrome: device.chrome,
          safeTop: device.safeTop,
          safeBottom: device.safeBottom,
          screen: screen.id,
          screenLabel: screen.label,
          ...probe,
          file: path.relative(path.join(__dirname, '..'), file),
        });

        // Restore vault UI after lock shot
        if (screen.kind === 'lock') {
          await page.evaluate(() => {
            document.body.classList.remove('on-lock');
            const lock = document.getElementById('pgLock');
            if (lock) lock.style.display = 'none';
            const app = document.getElementById('app');
            if (app) app.style.display = 'flex';
          });
          await page.waitForTimeout(100);
        }
      }
    }

    fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));

    // Sanity: every device produced dashboard shot
    for (const d of ALL_DEVICES) {
      expect(fs.existsSync(path.join(OUT, d.family, d.id, 'dashboard.png'))).toBe(true);
    }
  });
});

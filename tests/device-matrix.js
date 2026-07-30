// @ts-check
/** Shared device matrix for visual QA — see Cap-Device-Matrix-QA-MASTER-PROMPT.md */

/** @typedef {{ id: string, label: string, width: number, height: number, chrome: string, safeTop: number, safeBottom: number, family: 'iphone'|'ipad'|'browser' }} DeviceDef */

/** @type {DeviceDef[]} */
const IPHONE = [
  { id: 'iphone-se', label: 'iPhone SE (home button)', width: 375, height: 667, chrome: 'home-button', safeTop: 20, safeBottom: 0, family: 'iphone' },
  { id: 'iphone-13-mini', label: 'iPhone 13 mini (notch)', width: 375, height: 812, chrome: 'notch', safeTop: 50, safeBottom: 34, family: 'iphone' },
  { id: 'iphone-14', label: 'iPhone 14 (notch)', width: 390, height: 844, chrome: 'notch', safeTop: 47, safeBottom: 34, family: 'iphone' },
  { id: 'iphone-14-pro', label: 'iPhone 14/15 Pro (Dynamic Island)', width: 393, height: 852, chrome: 'dynamic-island', safeTop: 59, safeBottom: 34, family: 'iphone' },
  { id: 'iphone-15-pro-max', label: 'iPhone 15 Pro Max (Dynamic Island)', width: 430, height: 932, chrome: 'dynamic-island', safeTop: 59, safeBottom: 34, family: 'iphone' },
  { id: 'iphone-16-pro-max', label: 'iPhone 16 Pro Max (Dynamic Island)', width: 440, height: 956, chrome: 'dynamic-island', safeTop: 62, safeBottom: 34, family: 'iphone' },
];

/** @type {DeviceDef[]} */
const IPAD = [
  { id: 'ipad-mini', label: 'iPad mini', width: 744, height: 1133, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
  { id: 'ipad-air-11', label: 'iPad Air 11"', width: 820, height: 1180, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
  { id: 'ipad-pro-11', label: 'iPad Pro 11"', width: 834, height: 1194, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
  { id: 'ipad-pro-13', label: 'iPad Pro 13" portrait', width: 1024, height: 1366, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
  { id: 'ipad-pro-13-land', label: 'iPad Pro 13" landscape', width: 1366, height: 1024, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
];

/** @type {DeviceDef[]} */
const BROWSER = [
  { id: 'browser-phone-360', label: 'Mobile browser 360', width: 360, height: 740, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
  { id: 'browser-sm-laptop', label: 'Laptop 1280×800', width: 1280, height: 800, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
  { id: 'browser-hd', label: 'Desktop 1440×900', width: 1440, height: 900, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
  { id: 'browser-fhd', label: 'Desktop 1920×1080', width: 1920, height: 1080, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
  { id: 'browser-ultrawide', label: 'Ultrawide 2560×1080', width: 2560, height: 1080, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
];

/** @type {DeviceDef[]} */
const ALL_DEVICES = [...IPHONE, ...IPAD, ...BROWSER];

/** Major VaultCap screens for matrix QA */
const MAJOR_SCREENS = [
  { id: 'lock', label: 'Lock / PIN', kind: 'lock' },
  { id: 'dashboard', label: 'Dashboard', kind: 'page', route: 'dashboard' },
  { id: 'banks', label: 'Banks (dense list)', kind: 'page', route: 'banks' },
  { id: 'family', label: 'Family vault', kind: 'page', route: 'family' },
  { id: 'settings', label: 'Settings', kind: 'page', route: 'settings' },
  { id: 'documents', label: 'Documents', kind: 'page', route: 'documents' },
  { id: 'more-sheet', label: 'More / overlay', kind: 'overlay' },
];

/**
 * Inject safe-area simulation for Chromium (env() is usually 0).
 * @param {import('@playwright/test').Page} page
 * @param {DeviceDef} device
 */
async function applyDeviceChrome(page, device) {
  await page.setViewportSize({ width: device.width, height: device.height });
  await page.evaluate(({ safeTop, safeBottom, chrome }) => {
    const root = document.documentElement;
    root.style.setProperty('--st', `${safeTop}px`);
    root.style.setProperty('--sb', `${safeBottom}px`);
    root.style.setProperty('--cap-safe-t', `${safeTop}px`);
    root.style.setProperty('--cap-safe-b', `${safeBottom}px`);
    // tab height token often uses env(); force when we know content height
    const tabContent = getComputedStyle(root).getPropertyValue('--tab-content-h').trim() || '56px';
    root.style.setProperty('--tabh', `calc(${tabContent} + ${safeBottom}px)`);
    root.dataset.qaChrome = chrome;
    root.dataset.qaSafeTop = String(safeTop);
    root.dataset.qaSafeBottom = String(safeBottom);

    let tag = document.getElementById('qa-device-safe');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'qa-device-safe';
      document.head.appendChild(tag);
    }
    // Patch common VaultCap / Capricorn fixed chrome that hardcodes env()
    tag.textContent = `
      .ph { padding-top: calc(${safeTop}px + 10px) !important; }
      .btabs {
        padding-bottom: ${safeBottom}px !important;
        height: calc(var(--tab-content-h, 56px) + ${safeBottom}px) !important;
      }
      #app { padding-bottom: 0; }
      .page.on, .pg.on, [id^="pg"].on {
        /* content clearance handled by existing --tabh where wired */
      }
      .fab, .fab-btn, #fabBtn, button.fab {
        bottom: calc(${safeBottom}px + 72px) !important;
      }
      .sheet, .bottom-sheet, .modal-sheet, #moreSheet {
        padding-bottom: max(16px, ${safeBottom}px) !important;
      }
      #pgLock, .lock-screen, #pgHome {
        padding-top: ${safeTop}px !important;
        padding-bottom: ${safeBottom}px !important;
        box-sizing: border-box;
      }
    `;
  }, { safeTop: device.safeTop, safeBottom: device.safeBottom, chrome: device.chrome });
  await page.waitForTimeout(80);
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function probeLayout(page) {
  return page.evaluate(() => {
    const tabs = document.querySelector('.btabs');
    const sidebar = document.querySelector('#sidebar, .sidebar');
    const tabsVisible = !!(tabs && getComputedStyle(tabs).display !== 'none' && tabs.getBoundingClientRect().height > 0);
    const sideVisible = !!(sidebar && getComputedStyle(sidebar).display !== 'none' && sidebar.getBoundingClientRect().width > 0);
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    const tabRect = tabsVisible ? tabs.getBoundingClientRect() : null;
    const bodyPad = document.getElementById('app')
      ? getComputedStyle(document.getElementById('app')).paddingBottom
      : '';
    let layout = 'unknown';
    if (tabsVisible && !sideVisible) layout = 'mobile-tabs';
    else if (sideVisible && !tabsVisible) layout = 'sidebar';
    else if (sideVisible && tabsVisible) layout = 'hybrid-both';
    else layout = 'neither';
    return {
      layout,
      tabsVisible,
      sideVisible,
      overflow,
      tabBottom: tabRect ? tabRect.bottom : null,
      viewportH: window.innerHeight,
      bodyPad,
    };
  });
}

module.exports = {
  IPHONE,
  IPAD,
  BROWSER,
  ALL_DEVICES,
  MAJOR_SCREENS,
  applyDeviceChrome,
  probeLayout,
};

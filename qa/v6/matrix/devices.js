// @ts-check
/** Exact-viewport device list for the WebKit layout matrix (CSS points). */

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
const IPAD_UA = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

/** @typedef {{id:string,family:string,label:string,models:string,w:number,h:number,st:number,sb:number,dpr:number,ua:string}} Dev */

/** @type {Dev[]} */
const PHONES = [
  ['se1', 'iPhone SE 1st gen', 'SE (2016)', 320, 568, 20, 0, 2],
  ['8', 'iPhone 8 class', '6s / 7 / 8 / SE 2nd / SE 3rd', 375, 667, 20, 0, 2],
  ['8plus', 'iPhone 8 Plus class', '6s Plus / 7 Plus / 8 Plus', 414, 736, 20, 0, 3],
  ['x', 'iPhone X class', 'X / XS / 11 Pro', 375, 812, 44, 34, 3],
  ['xr', 'iPhone XR class', 'XR / 11', 414, 896, 48, 34, 2],
  ['xsmax', 'iPhone XS Max class', 'XS Max / 11 Pro Max', 414, 896, 44, 34, 3],
  ['mini', 'iPhone 13 mini class', '12 mini / 13 mini', 375, 812, 50, 34, 3],
  ['14', 'iPhone 14 class', '12 / 12 Pro / 13 / 13 Pro / 14 / 16e / 17e', 390, 844, 47, 34, 3],
  ['14plus', 'iPhone 14 Plus class', '12 Pro Max / 13 Pro Max / 14 Plus', 428, 926, 47, 34, 3],
  ['15', 'iPhone 15 class', '14 Pro / 15 / 15 Pro / 16', 393, 852, 59, 34, 3],
  ['15pm', 'iPhone 15 Pro Max class', '14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus', 430, 932, 59, 34, 3],
  ['17pro', 'iPhone 17 Pro class', '16 Pro / 17 / 17 Pro / 18 Pro', 402, 874, 62, 34, 3],
  ['17pm', 'iPhone 17 Pro Max class', '16 Pro Max / 17 Pro Max / 18 Pro Max', 440, 956, 62, 34, 3],
  ['air', 'iPhone Air', 'iPhone Air', 420, 912, 68, 34, 3],
  ['duo-open', 'iPhone Duo unfolded', 'Duo (foldable, open)', 466, 678, 24, 20, 3],
  ['duo-fold', 'iPhone Duo folded', 'Duo (foldable, closed, narrow)', 360, 780, 47, 34, 3],
].map(([id, label, models, w, h, st, sb, dpr]) => ({
  id: `iphone-${id}`, family: 'iphone', label: String(label), models: String(models),
  w: Number(w), h: Number(h), st: Number(st), sb: Number(sb), dpr: Number(dpr), ua: IPHONE_UA,
}));

const IPAD_SIZES = [
  ['768x1024', 'iPad 768×1024', 'mini 4 / mini 5 / Pro 9.7 / Air 2', 768, 1024],
  ['744x1133', 'iPad mini 6', 'mini 6 / mini A17 Pro', 744, 1133],
  ['810x1080', 'iPad 9th', 'iPad 7th/8th/9th', 810, 1080],
  ['820x1180', 'iPad 10th / Air 11', 'iPad 10th / A16 / Air 11 (M2/M3)', 820, 1180],
  ['834x1112', 'iPad Pro 10.5', 'Pro 10.5 / Air 3', 834, 1112],
  ['834x1194', 'iPad Pro 11', 'Pro 11 (1st–4th gen)', 834, 1194],
  ['834x1210', 'iPad Pro 11 M4', 'Pro 11 M4 / M5', 834, 1210],
  ['1024x1366', 'iPad 12.9/13', 'Pro 12.9 / Air 13', 1024, 1366],
  ['1032x1376', 'iPad Pro 13 M4', 'Pro 13 M4 / M5', 1032, 1376],
];

/** @type {Dev[]} */
const IPADS = [];
for (const [id, label, models, w, h] of IPAD_SIZES) {
  IPADS.push({ id: `ipad-${id}-p`, family: 'ipad-portrait', label: `${label} portrait`, models: String(models), w: Number(w), h: Number(h), st: 24, sb: 20, dpr: 2, ua: IPAD_UA });
}
for (const [id, label, models, w, h] of IPAD_SIZES) {
  IPADS.push({ id: `ipad-${id}-l`, family: 'ipad-landscape', label: `${label} landscape`, models: String(models), w: Number(h), h: Number(w), st: 24, sb: 20, dpr: 2, ua: IPAD_UA });
}

/** @type {Dev[]} */
const SPLIT = [320, 375, 507, 678].map((w) => ({
  id: `split-${w}`, family: 'ipad-split', label: `iPad Split/Slide Over ${w}`, models: `multitasking ${w}×1024`,
  w, h: 1024, st: 24, sb: 20, dpr: 2, ua: IPAD_UA,
}));

/** Desktop / MacBook CSS viewports (v6). No mobile safe-area; st/sb = 0. */
const DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

/** @type {Dev[]} */
const DESKTOPS = [
  ['mb-air13', 'MacBook Air 13', 'default 1470×956', 1470, 956],
  ['mb-pro14', 'MacBook Pro 14', '1512×982', 1512, 982],
  ['mb-air15', 'MacBook Air 15', '1710×1107', 1710, 1107],
  ['mb-pro16', 'MacBook Pro 16', '1728×1117', 1728, 1117],
  ['desk-1280', 'Desktop 1280', '1280×800', 1280, 800],
  ['desk-1440', 'Desktop 1440', '1440×900', 1440, 900],
  ['desk-1080', 'Desktop 1080p', '1920×1080', 1920, 1080],
  ['desk-1440q', 'Desktop QHD', '2560×1440', 2560, 1440],
].map(([id, label, models, w, h]) => ({
  id: `mac-${id}`, family: 'desktop', label: String(label), models: String(models),
  w: Number(w), h: Number(h), st: 0, sb: 0, dpr: 2, ua: DESKTOP_UA,
}));

const ALL = [...PHONES, ...IPADS, ...SPLIT, ...DESKTOPS];

module.exports = { PHONES, IPADS, SPLIT, DESKTOPS, ALL };

'use strict';
/* VaultCap icon system — monochrome stroke SVGs (SF Symbol–style) */

const VC_ICON_PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z',
  wallet: ['M21 12V7H5a2 2 0 0 1 0-4h14v4', 'M3 5v14a2 2 0 0 0 2 2h16v-5', 'M18 12a2 2 0 1 0 0 4h4v-4h-4Z'],
  package: ['M16.5 9.4 7.55 4.24', 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z', 'M3.3 7 12 12l8.7-5', 'M12 22V12'],
  'id-card': ['M16 10h2', 'M16 14h2', 'M6 18h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z', 'M6 10h6', 'M6 14h4'],
  more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  chart: ['M3 3v18h18', 'M7 16l4-4 4 4 5-6'],
  bank: ['M3 21h18', 'M3 10h18', 'M5 10V7l7-4 7 4v3', 'M9 21v-4', 'M15 21v-4'],
  card: ['M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z', 'M2 10h20'],
  banknote: ['M4 10h16', 'M4 14h16', 'M12 6v12', 'M8 10a2 2 0 1 0 0 4', 'M16 10a2 2 0 1 1 0 4'],
  handshake: ['M11 12h2a2 2 0 1 0 0-4h-1.5', 'M7 10V8a2 2 0 0 1 2-2h1', 'M14 10V8a2 2 0 0 0-2-2h-1', 'M7 14l-2 3v3h14v-3l-2-3', 'M12 14v6'],
  ticket: ['M2 9a3 3 0 0 1 3-3h14a1 1 0 0 1 1 1v4a1 1 0 0 0 0 2v4a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3V9Z'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  gauge: ['M12 14a2 2 0 1 0 0-4', 'M12 2v2', 'M4.93 4.93l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M19.07 4.93l-1.41 1.41', 'M12 22a10 10 0 0 1-8.66-5'],
  moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z',
  sun: ['M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M19.07 4.93l-1.41 1.41', 'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z', 'M17.66 17.66l1.41 1.41', 'M6.34 6.34 4.93 4.93', 'M17.66 6.34l1.41-1.41', 'M6.34 17.66l-1.41 1.41'],
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  pencil: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 16.5-12.5z'],
  pin: ['M12 17v5', 'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a3 3 0 0 0-6 0v3.76z'],
  archive: ['M21 8v13H3V8', 'M1 3h22v5H1z', 'M10 12h4'],
  'arrow-right': ['M5 12h14', 'M12 5l7 7-7 7'],
  undo: ['M3 7v6h6', 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13'],
  target: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z', 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  receipt: ['M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z', 'M8 10h8', 'M8 14h5'],
  arrows: ['M7 16V4', 'M3 8l4-4 4 4', 'M17 8v12', 'M21 12l-4 4-4-4'],
  house: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  smartphone: ['M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z', 'M12 18h.01'],
  mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M22 6 12 13 2 6'],
  briefcase: ['M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', 'M2 8h20v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  calendar: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  trash: ['M3 6h18', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'],
  cross: ['M12 2v20', 'M2 12h20'],
  book: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z'],
  settings: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z'],
  sync: ['M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5', 'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16', 'M16 16h5v5'],
  lock: ['M7 11V7a5 5 0 0 1 10 0v4', 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z'],
  'eye-off': ['M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94', 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19', 'M1 1l22 22', 'M14.12 14.12a3 3 0 1 1-4.24-4.24'],
  eye: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  share: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M16 6l-4-4-4 4', 'M12 2v13'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'M21 21l-4.3-4.3'],
  command: ['M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12'],
  plus: ['M12 5v14', 'M5 12h14'],
  sparkles: ['M9.94 2.94 11 6l2.06.06L13 8.06 12.94 10.12 11 11l-1.94-.06L8.06 10.12 8 8.06 9.06 6.06 9.94 2.94Z', 'M19 8l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  copy: ['M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z'],
  vault: ['M7 11V7a5 5 0 0 1 10 0v4', 'M5 11h14v10H5V11Z', 'M12 15v2'],
};

const VC = {
  icon(name, size = 20, extraClass = '') {
    const paths = VC_ICON_PATHS[name];
    if (!paths) {
      return `<span class="vc-icon vc-icon--missing ${extraClass}" aria-hidden="true" style="width:${size}px;height:${size}px"></span>`;
    }
    const body = (Array.isArray(paths) ? paths : [paths])
      .map((d) => `<path d="${d}"/>`)
      .join('');
    return `<svg class="vc-icon ${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  },

  modIcon(mod, size = 18) {
    const key = typeof mod === 'string' ? mod : mod?.ic;
    return this.icon(key || 'list', size);
  },

  setBtnIcon(el, name, size = 18) {
    if (!el) return;
    el.innerHTML = this.icon(name, size);
  },

  refreshShellIcons() {
    this.setBtnIcon(document.getElementById('privBtn'), S?.privacyMode ? 'eye' : 'eye-off', 18);
    document.querySelectorAll('[data-vc-icon]').forEach((el) => {
      this.setBtnIcon(el, el.dataset.vcIcon, parseInt(el.dataset.vcSize || '18', 10));
    });
    const cmdBtn = document.querySelector('.sb-bot .btn-full');
    if (cmdBtn && !cmdBtn.querySelector('.vc-icon')) {
      cmdBtn.innerHTML = `${this.icon('search', 16)}<span style="color:var(--text3);font-size:11px">Search everything</span><span class="kbd" style="margin-left:auto">⌘K</span>`;
    }
  },
};

window.VC = VC;

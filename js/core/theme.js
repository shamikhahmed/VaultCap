'use strict';

const THEMES = [
  { id: 'dark',  n: 'Dark',   g: 'dark',  bg: VCBrand.h_000000, ac: VCBrand.h_000000, gl: 'rgba(255,255,255,.14)', cls: '' },
  { id: 'light', n: 'Light',  g: 'light', bg: VCBrand.h_ffffff, ac: VCBrand.h_ffffff, gl: 'rgba(0,0,0,.10)', cls: 'light' },
  { id: 'auto',  n: 'System', g: 'dark',  bg: VCBrand.h_000000, ac: 'linear-gradient(135deg,'+VCBrand.h_000000+' 50%,'+VCBrand.h_ffffff+' 50%)', gl: 'rgba(255,255,255,.14)', cls: '' },
];

function normalizeVaultTheme(id) {
  if (id === 'light' || id === 'auto') return id;
  return 'dark';
}

const ThemeEngine = {
  _mqListener: null,
  apply(id) {
    id = normalizeVaultTheme(id);
    if (id === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = prefersDark ? 'dark' : 'light';
      const t = THEMES.find(x => x.id === resolved) || THEMES[0];
      this._setThemeClass(t);
      S.user.theme = 'auto';
      document.getElementById('themeColorMeta').content = t.ac;
      this._syncStatusBar(t);
      Store.save();
      this.renderDots();
      if (!this._mqListener) {
        this._mqListener = () => { if (S.user.theme === 'auto') ThemeEngine.apply('auto'); };
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this._mqListener);
      }
      return;
    }
    const t = THEMES.find(x => x.id === id) || THEMES[0];
    this._setThemeClass(t);
    S.user.theme = id;
    document.getElementById('themeColorMeta').content = t.ac;
    this._syncStatusBar(t);
    Store.save();
    this.renderDots();
  },
  /** Swap only theme classes — wiping body.className dropped demo-banner-active, hide-btabs, on-lock… */
  _setThemeClass(t) {
    THEMES.forEach(x => { if (x.cls) document.body.classList.remove(...String(x.cls).split(/\s+/).filter(Boolean)); });
    if (t && t.cls) document.body.classList.add(...String(t.cls).split(/\s+/).filter(Boolean));
  },
  /** iOS app: status-bar text must contrast the app theme, not the system appearance. */
  _syncStatusBar(t) {
    try {
      if (!window.VaultNative || !VaultNative.setStatusBarTheme) return;
      const light = /\blight\b/.test((t && t.cls) || '') || document.body.classList.contains('light');
      VaultNative.setStatusBarTheme(light ? 'light' : 'dark');
    } catch (e) {}
  },
  renderDots() {
    const e = document.getElementById('homeThemes');
    if (!e) return;
    // HIG segmented control — inline styles because #pgHome paints before the deferred CSS arrives
    e.setAttribute('role', 'group');
    e.setAttribute('aria-label', 'Appearance');
    e.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px;padding:2px;border-radius:10px;background:var(--fill)';
    e.innerHTML = THEMES.map(t => {
      const active = t.id === S.user.theme;
      return `<button type="button" aria-pressed="${active}" data-act="ThemeEngine.apply('${t.id}')" style="min-height:36px;border:0;border-radius:8px;cursor:pointer;touch-action:manipulation;font:inherit;font-size:0.9375rem;font-weight:${active ? '600' : '500'};color:var(--label);background:${active ? 'var(--surface-elevated)' : 'transparent'};box-shadow:${active ? '0 3px 8px rgba(0,0,0,.12),0 0 0 .5px rgba(0,0,0,.04)' : 'none'}">${t.n}</button>`;
    }).join('');
  },
  openPicker() {
    const options = [
      { id: 'dark', label: 'Dark', icon: 'moon', preview: VCBrand.h_000000, accent: VCBrand.h_ffffff },
      { id: 'light', label: 'Light', icon: 'sun', preview: VCBrand.h_ffffff, accent: VCBrand.h_000000 },
      { id: 'auto', label: 'System', icon: 'settings', preview: 'linear-gradient(135deg,'+VCBrand.h_000000+' 50%,'+VCBrand.h_ffffff+' 50%)', accent: VCBrand.h_ffffff },
    ];
    document.getElementById('themePicker').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr;gap:10px">
        ${options.map(o => `
          <div data-act="ThemeEngine.apply('${o.id}');ThemeEngine.closePicker()" style="cursor:pointer;touch-action:manipulation;border-radius:14px;overflow:hidden;border:2px solid ${o.id === S.user.theme ? 'var(--accent)' : 'var(--border)'};display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--glass)">
            <div style="width:40px;height:40px;border-radius:12px;background:${o.preview};border:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center">
              <div style="width:12px;height:12px;border-radius:50%;background:${o.accent}"></div>
            </div>
            <div style="font-size:0.875rem;font-weight:600;color:var(--text);display:flex;align-items:center;gap:8px">${typeof VC!=='undefined'?VC.icon(o.icon,16):''}${o.label}</div>
          </div>`).join('')}
      </div>`;
    const ov = document.getElementById('themeOv');
    ov.classList.add('on');
    ov.setAttribute('aria-hidden', 'false');
    if (typeof ScrollLock !== 'undefined') ScrollLock.sync();
    if (typeof FocusTrap !== 'undefined') FocusTrap.trap(ov, () => ThemeEngine.closePicker());
  },
  closePicker() {
    if (typeof FocusTrap !== 'undefined') FocusTrap.release();
    const ov = document.getElementById('themeOv');
    if (!ov) return;
    ov.classList.remove('on');
    ov.setAttribute('aria-hidden', 'true');
    if (typeof ScrollLock !== 'undefined') ScrollLock.sync();
  },
};

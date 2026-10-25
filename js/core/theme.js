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
    const cur = (S.user && S.user.theme) || 'dark';
    const items = THEMES.map((t) => ({ value: t.id, label: t.n }));
    const actFor = (id) => "ThemeEngine.apply('" + id + "')";
    // UIKit may still be loading on #pgHome; emit the same ui-segmented markup either way.
    // Critical CSS for .ui-segmented lives in index.html so this paints before deferred sheets.
    e.removeAttribute('role');
    e.removeAttribute('aria-label');
    e.style.cssText = '';
    e.innerHTML = (typeof UIKit !== 'undefined')
      ? UIKit.segmented(items, cur, actFor, 'Appearance')
      : '<div class="ui-segmented" role="group" aria-label="Appearance">' +
        items.map((it) =>
          '<button type="button" aria-pressed="' + (it.value === cur) + '" data-act="' + actFor(it.value) + '">' + it.label + '</button>'
        ).join('') +
        '</div>';
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

'use strict';

const THEMES = [
  { id: 'dark',  n: 'Dark',   g: 'dark',  bg: '#000000', ac: '#000000', gl: 'rgba(255,255,255,.14)', cls: '' },
  { id: 'light', n: 'Light',  g: 'light', bg: '#ffffff', ac: '#ffffff', gl: 'rgba(0,0,0,.10)', cls: 'light' },
  { id: 'auto',  n: 'System', g: 'dark',  bg: '#000000', ac: 'linear-gradient(135deg,#000000 50%,#ffffff 50%)', gl: 'rgba(255,255,255,.14)', cls: '' },
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
      const extra = (document.body.className.match(/\b(fs-\w+|hc)\b/g) || []).join(' ');
      document.body.className = [t.cls || '', extra].filter(Boolean).join(' ');
      S.user.theme = 'auto';
      document.getElementById('themeColorMeta').content = t.ac;
      Store.save();
      this.renderDots();
      if (!this._mqListener) {
        this._mqListener = () => { if (S.user.theme === 'auto') ThemeEngine.apply('auto'); };
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this._mqListener);
      }
      return;
    }
    const t = THEMES.find(x => x.id === id) || THEMES[0];
    const extra = (document.body.className.match(/\b(fs-\w+|hc)\b/g) || []).join(' ');
    document.body.className = [t.cls || '', extra].filter(Boolean).join(' ');
    S.user.theme = id;
    document.getElementById('themeColorMeta').content = t.ac;
    Store.save();
    this.renderDots();
  },
  renderDots() {
    const e = document.getElementById('homeThemes');
    if (!e) return;
    const icons = { dark: 'moon', light: 'sun', auto: 'settings' };
    e.innerHTML = THEMES.map(t => {
      const active = t.id === S.user.theme;
      const ic = (typeof VC !== 'undefined' && VC.icon) ? VC.icon(icons[t.id], 16) : '';
      return `<button type="button" data-act="ThemeEngine.apply('${t.id}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:14px;border:1.5px solid ${active ? 'var(--accent)' : 'var(--border)'};background:${active ? 'var(--glass2)' : 'var(--glass)'};cursor:pointer;touch-action:manipulation;transition:all .2s;font-family:var(--font)">
        <div style="width:36px;height:36px;border-radius:10px;background:${t.bg};border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text2)">${ic}</div>
        <span style="font-size:11px;font-weight:${active ? '700' : '500'};color:${active ? 'var(--accent)' : 'var(--text3)'}">${t.n}</span>
      </button>`;
    }).join('');
  },
  openPicker() {
    const options = [
      { id: 'dark', label: 'Dark', icon: 'moon', preview: '#000000', accent: '#ffffff' },
      { id: 'light', label: 'Light', icon: 'sun', preview: '#ffffff', accent: '#000000' },
      { id: 'auto', label: 'System', icon: 'settings', preview: 'linear-gradient(135deg,#000000 50%,#ffffff 50%)', accent: '#ffffff' },
    ];
    document.getElementById('themePicker').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr;gap:10px">
        ${options.map(o => `
          <div data-act="ThemeEngine.apply('${o.id}');ThemeEngine.closePicker()" style="cursor:pointer;touch-action:manipulation;border-radius:14px;overflow:hidden;border:2px solid ${o.id === S.user.theme ? 'var(--accent)' : 'var(--border)'};display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--glass)">
            <div style="width:40px;height:40px;border-radius:12px;background:${o.preview};border:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center">
              <div style="width:12px;height:12px;border-radius:50%;background:${o.accent}"></div>
            </div>
            <div style="font-size:14px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:8px">${typeof VC!=='undefined'?VC.icon(o.icon,16):''}${o.label}</div>
          </div>`).join('')}
      </div>`;
    document.getElementById('themeOv').classList.add('on');
  },
  closePicker() { document.getElementById('themeOv').classList.remove('on'); },
};

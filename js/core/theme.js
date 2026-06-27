'use strict';

const THEMES = [
  { id: 'dark',  n: 'Dark',   g: 'dark',  bg: '#080808', ac: '#5b8dee', gl: 'rgba(91,141,238,.18)', cls: '' },
  { id: 'light', n: 'Light',  g: 'light', bg: '#ffffff', ac: '#2563eb', gl: 'rgba(37,99,235,.12)', cls: 'light' },
  { id: 'auto',  n: 'System', g: 'dark',  bg: '#080808', ac: 'linear-gradient(135deg,#080808 50%,#ffffff 50%)', gl: 'rgba(91,141,238,.18)', cls: '' },
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
    ['homeThemes'].forEach(elId => {
      const e = document.getElementById(elId);
      if (e) e.innerHTML = THEMES.map(t =>
        `<div class="tdot${t.id === S.user.theme ? ' on' : ''}" style="background:${t.ac}" title="${t.n}" onclick="ThemeEngine.apply('${t.id}')"></div>`
      ).join('');
    });
  },
  openPicker() {
    const options = [
      { id: 'dark', label: '🌙 Dark', preview: '#080808', accent: '#5b8dee' },
      { id: 'light', label: '☀️ Light', preview: '#ffffff', accent: '#2563eb' },
      { id: 'auto', label: '⚙️ System', preview: 'linear-gradient(135deg,#080808 50%,#ffffff 50%)', accent: '#5b8dee' },
    ];
    document.getElementById('themePicker').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr;gap:10px">
        ${options.map(o => `
          <div onclick="ThemeEngine.apply('${o.id}');ThemeEngine.closePicker()" style="cursor:pointer;touch-action:manipulation;border-radius:14px;overflow:hidden;border:2px solid ${o.id === S.user.theme ? 'var(--accent)' : 'var(--border)'};display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--glass)">
            <div style="width:40px;height:40px;border-radius:12px;background:${o.preview};border:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center">
              <div style="width:12px;height:12px;border-radius:50%;background:${o.accent}"></div>
            </div>
            <div style="font-size:14px;font-weight:600;color:var(--text)">${o.label}</div>
          </div>`).join('')}
      </div>`;
    document.getElementById('themeOv').classList.add('on');
  },
  closePicker() { document.getElementById('themeOv').classList.remove('on'); },
};

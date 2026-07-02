'use strict';
// ===================== VAULT PROFILES =====================
const VaultProfiles = {
  DEMO_PIN: '123456',
  PROFILES: [
    { id:'personal', label:'My Vault', ic:'vault', desc:'Your private encrypted vault' },
  ],
  DEMO: { id:'demo', label:'Guided Demo', ic:'sparkles', desc:'Sample data with a short tour · PIN 123456' },
  TEST: { id:'test', label:'Test Sandbox', ic:'gauge', desc:'Developer-only isolated vault' },
  active() {
    return localStorage.getItem('vo_active_profile') || 'personal';
  },
  isDemo() { return this.active() === 'demo'; },
  isDevMode() { return localStorage.getItem('vo_dev_mode') === '1'; },
  dbName() {
    const p = this.active();
    return p === 'personal' ? 'VaultCap' : 'VaultCap_' + p;
  },
  switch(profileId) {
    if (typeof Modal !== 'undefined') Modal.close();
    localStorage.setItem('vo_active_profile', profileId);
    location.reload();
  },
  demoUrl() {
    const host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      return 'https://vaultcap.app/?demo=1';
    }
    const u = new URL(location.href);
    u.searchParams.set('demo', '1');
    return u.toString();
  },
  startDemo() {
    if (this.active() === 'personal' && S.unlocked && _vaultEntityCount(Store._data()) > 0) {
      Modal.open('Demo vault',
        '<div style="font-size:13px;color:var(--text2);line-height:1.6">Opens a <strong>separate sandbox</strong> with fictional data. Your real vault is not changed.</div>',
        `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="Modal.close();VaultProfiles._enterDemo()">Open demo vault →</button>`
      );
      return;
    }
    this._enterDemo();
  },
  _enterDemo() {
    localStorage.setItem('vo_used_demo', '1');
    localStorage.setItem('vo_demo_guide_pending', '1');
    this.switch('demo');
  },
  exitDemo() {
    localStorage.removeItem('vo_demo_guide_pending');
    this.switch('personal');
  },
  showDemoGuide() {
    Modal.open('Guided Demo',
      '<div style="font-size:13px;color:var(--text2);line-height:1.65;margin-bottom:14px">This is a <strong>sample vault</strong> with fictional data — safe to explore and show others.</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--text2);line-height:1.55">' +
      '<div>① Dashboard — net worth, health score, expiry alerts</div>' +
      '<div>② Banks & Cards — tap any module in the nav</div>' +
      '<div>③ Settings → Exit Demo when you want your real vault</div>' +
      '</div>' +
      '<div style="margin-top:14px;padding:12px;background:rgba(123,95,255,.1);border:1px solid rgba(123,95,255,.25);border-radius:12px;font-size:12px;color:var(--text3)">Demo PIN: <strong style="color:var(--text)">123456</strong> · No real data is stored here</div>',
      '<button type="button" class="btn btn-p btn-full" onclick="Modal.close()">Start exploring →</button>'
    );
  },
  pickerProfiles() {
    const list = [...this.PROFILES, this.DEMO];
    if (this.isDevMode()) list.push(this.TEST);
    return list;
  },
  showSwitcher() {
    const active = this.active();
    Modal.open('Vault Profiles',
      '<div style="font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.5">Each profile is completely isolated. Your real vault is <strong>My Vault</strong>. Demo is for tours only.</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px">' +
      VaultProfiles.pickerProfiles().map(p =>
        '<div onclick="VaultProfiles.switch(\'' + p.id + '\')" style="display:flex;align-items:center;gap:12px;padding:14px;background:' + (p.id===active?'rgba(123,95,255,.12)':'var(--glass)') + ';border:1px solid ' + (p.id===active?'rgba(123,95,255,.4)':'var(--border)') + ';border-radius:14px;cursor:pointer;touch-action:manipulation">' +
        '<div style="font-size:28px;display:flex;align-items:center">' + (typeof VC !== 'undefined' ? VC.icon(p.ic || 'vault', 24) : '') + '</div>' +
        '<div style="flex:1"><div style="font-size:14px;font-weight:700;color:var(--text)">' + p.label + (p.id===active?' <span style="font-size:11px;color:var(--accent)">● Active</span>':'') + '</div>' +
        '<div style="font-size:12px;color:var(--text3)">' + p.desc + '</div></div>' +
        '<div style="font-size:16px;color:var(--text3)">›</div>' +
        '</div>'
      ).join('') +
      (active === 'demo' ? '<button type="button" class="btn btn-g btn-full btn-sm" style="margin-top:4px" onclick="VaultProfiles.exitDemo()">← Back to My Vault</button>' : '') +
      '</div>',
      '<button type="button" class="btn btn-g btn-full" onclick="Modal.close()">Close</button>'
    );
  }
};
window.VaultProfiles = VaultProfiles;

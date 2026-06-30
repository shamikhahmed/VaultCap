// VaultCap — state + persistence engine (extracted from app.js)
// Depends: VaultDB, VaultHealth, VaultMeta, Toast (runtime), SCHEMA_VERSION (app.js)

let S = {
  unlocked: false, decoy: false,
  user: { name:'', avatar:'💼', theme:'dark', currency:'GBP', netWorth:0, nwHistory:[], email:'', phone:'', homeAddr:'', workAddr:'', dob:'', lastBackup:'' },
  pin: '123456', decoyPin: '', noPin: false,
  modules: { banks:true, cards:true, investments:true, cash:true, loans:true, sims:true, friends:true, assets:true, expenses:true, credit:true, zakat:true, tax:true, currency:true, gold:true, emails:true, gadgets:true, digital:true, documents:true, search:true, import:true, timeline:true, security:true, backup:true, recovery:true, workspace:true, vehicles:true, reminders:true, emergency:true, bc:true, bonds:true, family:true },
  banks:[], cards:[], investments:[], cash:[], loans:[], friends:[], sims:[], assets:[], expenses:[], emails:[], gadgets:[], digital:[], documents:[], vehicles:[], bc:[], bonds:[], activity:[], tags:[], trash:[],
  family: { head: null, members: [] },
  familyMembers: [],
  vaultMeta: { creditScore: {}, zakatState: {}, zakatCalc: {}, taxCalc: {} },
  emergency: { enabled: false, name: '', phone: '', bloodType: '', allergies: '', emergencyNote: '', showOnLockscreen: false },
  importedFiles:[], _pendingLinks:[],
  loanF:'all',
  wallet:[],
  fails:0, lockedUntil:0, autoLock:true, lockMins:10, clipSecs:30, privacyMode:false, workspace:'default', panicEnabled:true, fontScale:'md', highContrast:false, largeText:false, reduceMotion:false,
  bF:'all', cF:'all', invF:'all', simF:'all', aF:'all', expF:'all', gF:'all',
  _timer:null, _clockTimer:null,
};

const Store = {
  loadRaw() { try { return JSON.parse(localStorage.getItem('vos3')); } catch(e) {} return null; },

  _data() {
    return {
      schemaVersion: typeof SCHEMA_VERSION !== 'undefined' ? SCHEMA_VERSION : 13,
      user: S.user, noPin: S.noPin, decoyPin: S.decoyPin || '',
      modules: S.modules,
      banks: S.banks, cards: S.cards, investments: S.investments, cash: S.cash, loans: S.loans, friends: S.friends, sims: S.sims,
      assets: S.assets, expenses: S.expenses, emails: S.emails, gadgets: S.gadgets,
      digital: S.digital, vehicles: S.vehicles, activity: S.activity.slice(0, 80), tags: S.tags, wallet: S.wallet, trash: S.trash,
      documents: S.documents || [], bc: S.bc || [], bonds: S.bonds || [], emergency: S.emergency || {},
      family: S.family || { head: null, members: [] },
      familyMembers: S.familyMembers || [],
      vaultMeta: S.vaultMeta || { creditScore: {}, zakatState: {}, zakatCalc: {}, taxCalc: {} },
      importedFiles: S.importedFiles || [], _pendingLinks: S._pendingLinks || [],
      fails: S.fails, lockedUntil: S.lockedUntil,
      autoLock: S.autoLock, lockMins: S.lockMins, clipSecs: S.clipSecs,
      privacyMode: S.privacyMode, largeText: S.largeText, reduceMotion: S.reduceMotion
    };
  },

  _savePrefs() {
    try {
      localStorage.setItem('vos_prefs', JSON.stringify({
        theme: S.user.theme, fontScale: S.fontScale, highContrast: S.highContrast,
        name: S.user.name, hasVault: true, reduceMotion: S.reduceMotion, largeText: S.largeText
      }));
    } catch(e) {}
  },

  loadPrefs() { try { return JSON.parse(localStorage.getItem('vos_prefs')); } catch(e) {} return null; },

  _saveCount: 0,
  _pendingSave: null,

  checkQuota() {
    try {
      let total = 0;
      for (const key of Object.keys(localStorage)) {
        total += (localStorage.getItem(key) || '').length * 2;
      }
      const MB = total / (1024 * 1024);
      if (MB > 4 && typeof Toast !== 'undefined') {
        Toast.show(`Storage is ${MB.toFixed(1)}MB — consider removing old photos or exporting a backup.`, 'warn', 8000);
      }
      return MB;
    } catch(e) { return 0; }
  },

  save() {
    const data = this._data();
    this._savePrefs();
    if (VaultDB.sessionKey) {
      this._pendingSave = VaultDB.save(data).catch(e => {
        console.warn('[VaultDB] save error:', e);
        try {
          const fails = JSON.parse(localStorage.getItem('vos_failed_ops') || '[]');
          fails.unshift({ op: 'save', at: new Date().toISOString(), err: String(e).slice(0, 100) });
          localStorage.setItem('vos_failed_ops', JSON.stringify(fails.slice(0, 20)));
        } catch(_) {}
      });
    } else {
      this._pendingSave = Promise.resolve();
    }
    this._saveWidgetSnapshot();
    this._saveCount++;
    if (this._saveCount % 10 === 0) this.checkQuota();
    if (typeof Family !== 'undefined' && Family._activeId !== null && document.getElementById('pg-family')?.classList.contains('on')) {
      setTimeout(() => Family.render(), 30);
    }
    try {
      const lastClean = localStorage.getItem('vos_last_clean');
      const monthAgo = Date.now() - 30*24*60*60*1000;
      if (!lastClean || parseInt(lastClean) < monthAgo) {
        if (S.activity && S.activity.length > 500) S.activity = S.activity.slice(0, 200);
        if (S.trash && S.trash.length > 100) S.trash = S.trash.slice(0, 50);
        localStorage.setItem('vos_last_clean', Date.now().toString());
      }
    } catch(_) {}
  },

  _saveWidgetSnapshot() {
    try {
      const now = Date.now();
      const in30 = now + 30 * 24 * 60 * 60 * 1000;
      const expiringCount = [
        ...(S.documents || []).filter(d => d.expiry && new Date(d.expiry) > now && new Date(d.expiry) < in30),
        ...(S.cards || []).filter(c => {
          if (!c.expiry) return false;
          const [m, y] = c.expiry.split('/');
          const exp = new Date(2000 + parseInt(y), parseInt(m) - 1, 1);
          return exp > now && exp < in30;
        }),
      ].length;

      localStorage.setItem('VaultCap_widget', JSON.stringify({
        locked: !S.unlocked,
        bankCount: (S.banks || []).length,
        cardCount: (S.cards || []).length,
        documentCount: (S.documents || []).length,
        investmentCount: (S.investments || []).length,
        loanCount: (S.loans || []).length,
        vaultHealth: typeof VaultHealth !== 'undefined' ? VaultHealth.score() : 0,
        expiringCount,
        lastBackup: S.user?.lastBackup || null,
        updatedAt: new Date().toISOString(),
        banks: (S.banks || []).length,
        cards: (S.cards || []).length,
        updated: new Date().toISOString(),
      }));
    } catch(e) {}
  },

  flush() {
    return this._pendingSave || Promise.resolve();
  },

  async load() {
    try {
      const d = await VaultDB.load();
      if (d) {
        Object.assign(S, d);
        if (typeof VaultMeta !== 'undefined') VaultMeta.migrateFromLocalStorage();
        return true;
      }
    } catch(e) {}
    return false;
  },

  async clear() {
    try { await VaultDB.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}
    try {
      ['vos3', 'vos_prefs'].forEach(k => localStorage.removeItem(k));
    } catch(e) {}
    S.banks=[]; S.cards=[]; S.investments=[]; S.cash=[]; S.loans=[]; S.friends=[]; S.sims=[]; S.assets=[];
    S.expenses=[]; S.emails=[]; S.gadgets=[]; S.digital=[]; S.documents=[]; S.vehicles=[];
    S.activity=[]; S.tags=[]; S.wallet=[]; S.trash=[];
    S.family = { head: null, members: [] };
    S.familyMembers = [];
    S.user = { name:'', avatar:'💼', theme:'dark', currency:'USD', netWorth:0, nwHistory:[], email:'', phone:'', homeAddr:'', workAddr:'', dob:'', lastBackup:null };
    S.pin=''; S.decoyPin=''; S.fails=0; S.unlocked=false; S.decoy=false;
  }
};

window.S = S;
window.Store = Store;

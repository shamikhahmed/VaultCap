'use strict';
/* WorkspaceManager, PanicLock, applyDecoyUnlock, loadDecoyData */

const WorkspaceManager = {
  render() {
    const el = document.getElementById('workspaceBody');
    if (!el) return;
    const presets = Object.entries(WORKSPACE_PRESETS);
    const current = S.workspace || 'default';
    el.innerHTML = `<div style="font-size:11px;color:var(--text3);padding:0 0 12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Switch between pre-configured module layouts</div>` +
      presets.map(([id, p]) => `
        <div class="entry" style="${current===id?'border-left:3px solid var(--accent)':''}" onclick="WorkspaceManager.apply('${id}')">
          <div class="entry-main">
            <div class="entry-ic">${VC.icon(p.ic, 18)}</div>
            <div class="entry-body">
              <div class="entry-name">${p.name}</div>
              <div class="entry-sub">${p.desc}</div>
            </div>
            ${current===id?'<span class="badge b-ok">Active</span>':''}
          </div>
        </div>`).join('');
  },
  apply(id) {
    const preset = WORKSPACE_PRESETS[id];
    if (!preset) return;
    S.workspace = id;
    Object.assign(S.modules, preset.modules);
    Store.save();
    buildNav();
    this.render();
    Toast.show(`Workspace: ${preset.name}`, 'success');
  },
};

const PanicLock = {
  trigger() {
    if (!window.__vos_confirm('PANIC LOCK: This will immediately lock the vault and clear the screen. Continue?')) return;
    document.querySelectorAll('.sens').forEach(el => el.textContent = '••••');
    R.lock();
    Toast.show('Vault panic-locked', 'warning', 2000);
    Activity.log('Panic lock triggered');
  }
};

(function() {
  const btn = document.createElement('button');
  btn.className = 'panic-btn'; btn.title = 'Panic Lock';
  btn.innerHTML = ''; if (typeof VC !== 'undefined') VC.setBtnIcon(btn, 'cross', 18); btn.onclick = () => PanicLock.trigger();
  btn.id = 'panicBtn'; document.body.appendChild(btn);
})();

// ===================== DECOY MODE =====================
function applyDecoyUnlock(decoyData) {
  S.fails = 0;
  S.lockedUntil = 0;
  try { LockoutStore.clear(); } catch(e) {}
  const hasCustomVault = decoyData && !decoyData._decoy &&
    ((decoyData.banks && decoyData.banks.length) || (decoyData.cards && decoyData.cards.length) ||
     (decoyData.documents && decoyData.documents.length));
  if (hasCustomVault) {
    _applyDecoySnapshot(decoyData);
    Activity.log('Vault unlocked (decoy)');
    R.unlock({ decoy: true });
    return;
  }
  loadDecoyData();
  R.unlock({ decoy: true });
}

function _applyDecoySnapshot(data) {
  _clearDecoySensitiveState();
  Object.assign(S, data);
  S.decoy = true;
  S.documents = [];
  S.familyMembers = [];
  S.bc = [];
  S.bonds = [];
  S.trash = [];
  S.importedFiles = [];
}

function _clearDecoySensitiveState() {
  S.banks = []; S.cards = []; S.investments = []; S.cash = []; S.loans = [];
  S.friends = []; S.sims = []; S.assets = []; S.expenses = []; S.emails = [];
  S.gadgets = []; S.digital = []; S.documents = []; S.vehicles = []; S.bc = [];
  S.bonds = []; S.activity = []; S.wallet = []; S.trash = []; S.familyMembers = [];
  S.importedFiles = []; S._pendingLinks = [];
}

function loadDecoyData() {
  _clearDecoySensitiveState();
  const id = U.id, ts = () => new Date().toISOString();
  const names = ['Ali Hassan','Sara Ahmed','Omar Khan','Fatima Malik'];
  const dName = names[Math.floor(Math.random() * names.length)];
  const dFirst = dName.split(' ')[0];
  const rl4 = () => String(1000 + Math.floor(Math.random() * 8999));
  // 2 random PK commercial banks
  const pkBanks = BANKS_DB.filter(b => b.c === 'PK' && (b.t === 'commercial' || b.t === 'islamic'));
  const shuffled = [...pkBanks].sort(() => Math.random() - 0.5);
  const selBanks = shuffled.slice(0, 2);
  selBanks.forEach((b, i) => {
    S.banks.push({ id:id(), bankName:b.n, country:'PK', bankType:b.t, accountType:i===0?'Current':'Savings', currency:'PKR', last4:rl4(), holderName:dName, tags:[i===0?'Primary':'Secondary'], favorite:i===0, createdAt:ts() });
  });
  // 1 random debit card
  const selCard = CARDS_DB.filter(c => c.cat === 'Debit')[Math.floor(Math.random() * CARDS_DB.filter(c => c.cat === 'Debit').length)];
  const expYr = (new Date().getFullYear() - 2000 + 3);
  const expMo = String(Math.floor(Math.random() * 12) + 1).padStart(2,'0');
  S.cards.push({ id:id(), cardName:selCard.n, network:selCard.net, cardType:'Debit', category:'Standard', country:'PK', last4:rl4(), expiry:`${expMo}/${expYr}`, holderName:dName.toUpperCase(), issuer:selCard.n.split(' ')[0], tags:['Primary'], createdAt:ts() });
  // Jazz SIM
  S.sims.push({ id:id(), network:'Jazz', country:'PK', simType:'Physical', status:'Active', phone:`+92 300 ${Math.floor(1000000 + Math.random() * 8999999)}`, dataPlan:10, createdAt:ts() });
  // Small cash amount
  const cashAmt = Math.floor(2000 + Math.random() * 13000);
  S.cash.push({ id:id(), label:'Wallet', amount:cashAmt, currency:'PKR', location:'Wallet', createdAt:ts() });
  // 1 PSX stock
  const stocks = [
    {name:'Engro Corporation',ticker:'ENGRO',inv:150000,cur:163500},
    {name:'Lucky Cement',ticker:'LUCK',inv:90000,cur:97200},
    {name:'HBL',ticker:'HBL',inv:120000,cur:128400},
    {name:'MCB Bank',ticker:'MCB',inv:80000,cur:86400},
    {name:'Pakistan Petroleum',ticker:'PPL',inv:60000,cur:64800},
  ];
  const st = stocks[Math.floor(Math.random() * stocks.length)];
  S.investments.push({ id:id(), investmentName:st.name, broker:'Arif Habib Limited', type:'Stocks', ticker:st.ticker, country:'PK', currency:'PKR', amountInvested:st.inv, currentValue:st.cur, riskLevel:'Medium', ownership:'personal', tags:['PSX'], createdAt:ts() });
  S.user.name = dName;
  S.user.netWorth = cashAmt + st.cur;
  S.user.currency = 'PKR';
  S.decoy = true;
  Activity.log('Vault unlocked (decoy)');
}

// ===================== DEMO PROFILES =====================

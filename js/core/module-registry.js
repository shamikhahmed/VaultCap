// VaultCap — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Module registry — wealth-aware IA (Banking vs Wealth vs Cashflow)

/** True when module enabled in Settings. */
function isModOn(id) {
  if (!id) return true;
  if (typeof S === 'undefined' || !S.modules) return true;
  return !!S.modules[id];
}

/** Parent module for alias pages (vehicles/gadgets/gold → assets). */
const MOD_PARENT = { vehicles: 'assets', gadgets: 'assets', gold: 'assets' };

function isPageModOn(pg) {
  if (!pg) return true;
  const always = new Set([
    'dashboard', 'settings', 'search', 'help', 'backup', 'security', 'trash',
    'timeline', 'reminders', 'alerts', 'import', 'sync', 'emergency',
    'recovery', 'recovery-center', 'workspace', 'family',
  ]);
  if (always.has(pg)) return true;
  if (pg === 'finance-home') return ['banks', 'cards', 'cash', 'loans', 'expenses', 'bc'].some(isModOn);
  if (pg === 'assets-home') return ['investments', 'bonds', 'assets'].some(isModOn);
  if (pg === 'vault-home') return ['documents', 'sims', 'emails', 'digital', 'friends'].some(isModOn);
  const parent = MOD_PARENT[pg] || pg;
  const known = typeof ALL_MODULES !== 'undefined' && ALL_MODULES.some(m => m.id === parent);
  if (!known) return true;
  return isModOn(parent);
}

const ALL_MODULES=[
  // Banking — accounts & payment rails (liquid money you operate with)
  {id:'banks',  n:'Banks',       ic:'bank', desc:'Accounts, IBAN, login details',      group:'Banking'},
  {id:'cards',  n:'Cards',       ic:'card', desc:'Debit, credit, crypto & BNPL',       group:'Banking'},
  {id:'cash',    n:'Cash',        ic:'banknote', desc:'Physical cash by location',          group:'Banking'},
  // Wealth — holdings that store / grow value (yes: investments & bonds are assets)
  {id:'investments',n:'Investments',ic:'trending-up',desc:'Stocks, funds, crypto, securities', group:'Wealth'},
  {id:'bonds',   n:'Prize Bonds & Savings', ic:'ticket', desc:'Prize bonds, NSS, govt securities', group:'Wealth'},
  {id:'assets', n:'Property',    ic:'layers', desc:'Property, vehicles, electronics, metals', group:'Wealth'},
  // Cashflow — money moving in/out & obligations
  {id:'loans',   n:'Loans',       ic:'handshake', desc:'Money lent & borrowed',              group:'Cashflow'},
  {id:'expenses',n:'Expenses',   ic:'repeat', desc:'Subscriptions & recurring bills',    group:'Cashflow'},
  {id:'bc',      n:'Committee (BC)', ic:'refresh-cw', desc:'Rotating savings committees',    group:'Cashflow'},
  // Family — under dashboard
  {id:'family',        n:'Family Vault',    ic:'users', desc:'Family financial overview',                    group:'Family'},
  // Identity
  {id:'friends', n:'Contacts',    ic:'user', desc:'Contacts & people',                  group:'Identity'},
  {id:'sims',   n:'SIM Cards',   ic:'smartphone', desc:'Mobile numbers & networks',          group:'Identity'},
  {id:'documents',n:'Documents',ic:'id-card', desc:'IDs, passports, visas, contracts',   group:'Identity'},
  {id:'emails', n:'Emails',      ic:'mail', desc:'All email identities & security',    group:'Identity'},
  {id:'digital',n:'Digital',     ic:'key', desc:'Logins, wallets, social media',      group:'Identity'},
  // Planning — calculators & compliance (not holdings)
  {id:'credit',  n:'Credit Score',ic:'gauge', desc:'Credit score tracker',              group:'Planning'},
  {id:'zakat',   n:'Zakat',       ic:'moon', desc:'Annual zakat calculator',           group:'Planning'},
  {id:'tax',     n:'Tax',         ic:'receipt', desc:'Income tax calculator',             group:'Planning'},
  {id:'currency',n:'Currency',    ic:'arrows', desc:'Live exchange rates',               group:'Planning'},
  // Tools
  {id:'alerts',     n:'Alerts',     ic:'bell', desc:'Expiry & urgent alerts',             group:'Tools'},
  {id:'timeline',   n:'Timeline',   ic:'calendar', desc:'Activity history',                   group:'Tools'},
  {id:'reminders',  n:'Reminders',  ic:'clock', desc:'Expiry alerts & upcoming dues',      group:'Tools'},
  {id:'import',  n:'Smart Import',  ic:'download', desc:'Paste text — Smart Parser + optional LLM', group:'Tools'},
  {id:'trash',      n:'Trash',      ic:'trash', desc:'Deleted items — restore or purge',    group:'Tools'},
  {id:'emergency',     n:'Emergency',       ic:'cross', desc:'Emergency access info for first responders', group:'Tools'},
  {id:'recovery-center',n:'Recovery Center',ic:'shield', desc:'Backup health, restore guide, verification',  group:'Tools'},
  {id:'help',          n:'Help & Guide',    ic:'book', desc:'How to use VaultCap',                           group:'Tools'},
];

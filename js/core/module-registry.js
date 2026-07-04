// VaultCap — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Module registry — extracted from app.js (refactor 4.4.0)

const ALL_MODULES=[
  // Money — accounts & cashflow
  {id:'banks',  n:'Banks',       ic:'bank', desc:'Accounts, IBAN, login details',      group:'Finance'},
  {id:'cards',  n:'Cards',       ic:'card', desc:'Debit, credit, crypto & BNPL',       group:'Finance'},
  {id:'investments',n:'Investments',ic:'trending-up',desc:'Stocks, funds, bonds, crypto',      group:'Finance'},
  {id:'cash',    n:'Cash',        ic:'banknote', desc:'Physical cash by location',          group:'Finance'},
  {id:'loans',   n:'Loans',       ic:'handshake', desc:'Money lent & borrowed',              group:'Finance'},
  {id:'bc',      n:'Committee (BC)', ic:'refresh-cw', desc:'Rotating savings committees',    group:'Finance'},
  {id:'bonds',   n:'Prize Bonds & Savings', ic:'ticket', desc:'Prize bonds, NSS, govt securities', group:'Finance'},
  {id:'expenses',n:'Expenses',   ic:'repeat', desc:'Subscriptions & recurring bills',    group:'Finance'},
  // Family — under dashboard in nav
  {id:'family',        n:'Family Vault',    ic:'users', desc:'Family financial overview',                    group:'Family'},
  // Assets
  {id:'assets', n:'Assets',      ic:'layers', desc:'Property, vehicles, electronics, metals & valuables', group:'Assets'},
  // Identity
  {id:'friends', n:'Contacts',    ic:'user', desc:'Contacts & people',                  group:'Identity'},
  {id:'sims',   n:'SIM Cards',   ic:'smartphone', desc:'Mobile numbers & networks',          group:'Identity'},
  {id:'documents',n:'Documents',ic:'id-card', desc:'IDs, passports, visas, contracts',   group:'Identity'},
  {id:'emails', n:'Emails',      ic:'mail', desc:'All email identities & security',    group:'Identity'},
  {id:'digital',n:'Digital',     ic:'key', desc:'Logins, wallets, social media',      group:'Identity'},
  // Planning — tax, zakat, credit, FX (not money accounts)
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

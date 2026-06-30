// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Centralised constants — future migration target from app.js

const VAULT_VERSION = 7;
const VER = window.VER || '4.9.2';
const APP_VERSION = VER;
window.VER = VER;
const MAX_STORAGE_MB = 5;
const BACKUP_REMINDER_DAYS = 30;
const MAX_AUDIT_ENTRIES = 10;
const MAX_SEARCH_RESULTS = 50;
const PIN_MIN_LENGTH = 6;
const PIN_MAX_ATTEMPTS = 5;
const PBKDF2_ITERATIONS = 310000;

const COUNTRY_CUR = { PK:'PKR', GB:'GBP', AE:'AED', US:'USD', CA:'CAD', AU:'AUD', SA:'SAR', QA:'QAR', IN:'INR', SG:'SGD', OTHER:'USD' };
window.COUNTRY_CUR = COUNTRY_CUR;

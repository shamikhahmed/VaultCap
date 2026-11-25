'use strict';
// VaultCap — soft checks for identity and tax numbers worldwide. © 2026 Shamikh Ahmed.
/* Every check is advisory: a failure shows "looks unusual — save anyway?" and never blocks.
   Algorithms are the public ones (research: docs/research/worldwide-features.md §3); items
   marked (community) come from open-source validators, not the issuing government. */
const IdCheck = (() => {
  const digits = s => String(s || '').replace(/\D/g, '');
  const clean = s => String(s || '').toUpperCase().replace(/[\s\-./]/g, '');

  function luhn(s) {
    let sum = 0, alt = false;
    for (let i = s.length - 1; i >= 0; i--) { let n = +s[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; }
    return sum % 10 === 0;
  }
  const vD = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
  const vP = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
  const verhoeff = s => [...s].reverse().reduce((c, d, i) => vD[c][vP[i % 8][+d]], 0) === 0;

  /** ICAO 9303 7-3-1 check digit over an MRZ field. */
  function mrzDigit(s) {
    return [...String(s).toUpperCase()].reduce((t, c, i) => {
      const v = c === '<' ? 0 : /\d/.test(c) ? +c : /[A-Z]/.test(c) ? c.charCodeAt(0) - 55 : 0;
      return t + v * [7, 3, 1][i % 3];
    }, 0) % 10;
  }
  function cpf(s) {
    s = digits(s); if (!/^\d{11}$/.test(s) || /^(\d)\1+$/.test(s)) return false;
    const dv = n => { let t = 0; for (let i = 0; i < n; i++) t += +s[i] * (n + 1 - i); const r = (t * 10) % 11; return r === 10 ? 0 : r; };
    return dv(9) === +s[9] && dv(10) === +s[10];
  }
  function tckn(s) {
    if (!/^[1-9]\d{10}$/.test(s)) return false;
    const d = [...s].map(Number);
    const d10 = ((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10;
    return ((d10 + 10) % 10) === d[9] && d.slice(0, 10).reduce((a, b) => a + b) % 10 === d[10];
  }
  function nric(s) {
    const m = /^([STFGM])(\d{7})([A-Z])$/.exec(s); if (!m) return false;
    if (m[1] === 'M') return true; // M-series check table not public — format only
    const t = [2, 7, 6, 5, 4, 3, 2].reduce((a, w, i) => a + w * +m[2][i], 0) + (/[TG]/.test(m[1]) ? 4 : 0);
    return ((/[ST]/.test(m[1]) ? 'JZIHGFEDCBA' : 'XWUTRQPNMLK')[t % 11]) === m[3];
  }
  function esId(s) {
    const m = /^([XYZ]?)(\d{7,8})([A-Z])$/.exec(s); if (!m) return false;
    const num = +((m[1] ? 'XYZ'.indexOf(m[1]) : '') + m[2]);
    return 'TRWAGMYFPDXBNJZSQVHLCKE'[num % 23] === m[3];
  }
  function cnId(s) {
    if (!/^\d{17}[\dX]$/.test(s)) return false;
    const W = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    return '10X98765432'[W.reduce((a, w, i) => a + w * +s[i], 0) % 11] === s[17];
  }
  function myNumber(s) {
    if (!/^\d{12}$/.test(s)) return false;
    let t = 0; for (let n = 1; n <= 11; n++) { const p = +s[11 - n]; const q = n <= 6 ? n + 1 : n - 5; t += p * q; }
    const r = t % 11; return (r <= 1 ? 0 : 11 - r) === +s[11];
  }
  const tfn = s => /^\d{9}$/.test(s) && [1, 4, 3, 7, 5, 8, 6, 9, 10].reduce((a, w, i) => a + w * +s[i], 0) % 11 === 0;
  function cuit(s) {
    if (!/^\d{11}$/.test(s)) return false;
    const r = 11 - [5, 4, 3, 2, 7, 6, 5, 4, 3, 2].reduce((a, w, i) => a + w * +s[i], 0) % 11;
    return (r === 11 ? 0 : r === 10 ? 9 : r) === +s[10];
  }
  function ssn(s) {
    const m = /^(\d{3})(\d{2})(\d{4})$/.exec(s); if (!m) return false;
    return m[1] !== '000' && m[1] !== '666' && m[1][0] !== '9' && m[2] !== '00' && m[3] !== '0000';
  }
  function niNumber(s) {
    if (!/^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/.test(s)) return false;
    return !['BG', 'GB', 'NK', 'KN', 'TN', 'NT', 'ZZ'].includes(s.slice(0, 2));
  }
  function zaId(s) {
    if (!/^\d{13}$/.test(s)) return false;
    const mm = +s.slice(2, 4), dd = +s.slice(4, 6);
    return mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && luhn(s);
  }

  /* [label, test(clean value) → bool, hint on failure, (community) flag] */
  const NATIONAL = {
    IN: ['Aadhaar', s => /^[2-9]\d{11}$/.test(digits(s)) && verhoeff(digits(s)), '12 digits, first 2–9, with a Verhoeff check digit'],
    PK: ['CNIC / NICOP', s => /^\d{13}$/.test(digits(s)), '13 digits: 99999-9999999-9'],
    BD: ['NID', s => [10, 13, 17].includes(digits(s).length), '10, 13 or 17 digits'],
    NG: ['NIN', s => /^\d{11}$/.test(digits(s)), '11 digits'],
    KE: ['National ID', s => /^\d{7,9}$/.test(digits(s)), '7–9 digits'],
    ZA: ['ID number', s => zaId(digits(s)), '13 digits (YYMMDD…) with a Luhn check digit'],
    BR: ['CPF / CIN', s => cpf(s), '11 digits with two check digits'],
    AR: ['DNI', s => /^\d{7,8}$/.test(digits(s)), '7–8 digits'],
    MX: ['CURP', s => /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z\d]\d$/.test(clean(s)), '18 characters: 4 letters, birth date, sex, state…'],
    CN: ['Resident ID', s => cnId(clean(s)), '18 characters ending in a digit or X (ISO 7064 check)'],
    JP: ['My Number', s => myNumber(digits(s)), '12 digits with a check digit'],
    KR: ['Resident registration no.', s => /^\d{13}$/.test(digits(s)), '13 digits: YYMMDD-GNNNNNN'],
    ID: ['NIK (KTP)', s => /^\d{16}$/.test(digits(s)), '16 digits'],
    PH: ['PhilSys number', s => [12, 16].includes(digits(s).length), '12-digit PSN or 16-digit card number'],
    MY: ['MyKad', s => /^\d{12}$/.test(digits(s)), '12 digits: YYMMDD-PB-###G'],
    SG: ['NRIC / FIN', s => nric(clean(s)), 'Letter, 7 digits, check letter'],
    AE: ['Emirates ID', s => /^784\d{12}$/.test(digits(s)) && luhn(digits(s)), '15 digits: 784-YYYY-NNNNNNN-C', true],
    SA: ['National ID / Iqama', s => /^[12]\d{9}$/.test(digits(s)) && luhn(digits(s)), '10 digits starting 1 (citizen) or 2 (resident)', true],
    EG: ['National ID', s => /^[23]\d{13}$/.test(digits(s)), '14 digits starting 2 or 3'],
    TR: ['TC Kimlik', s => tckn(digits(s)), '11 digits with two check digits'],
    ES: ['DNI / NIE', s => esId(clean(s)), '8 digits + letter, or X/Y/Z + 7 digits + letter'],
    IT: ['Codice fiscale', s => /^[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]$/.test(clean(s)), '16 characters'],
    CA: ['SIN', s => /^\d{9}$/.test(digits(s)) && luhn(digits(s)), '9 digits with a Luhn check'],
  };
  const TAX = {
    IN: ['PAN', s => /^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$/.test(clean(s)), 'AAAAA9999A — 4th letter is the holder type'],
    US: ['SSN / ITIN', s => ssn(digits(s)), '9 digits: AAA-GG-SSSS (no 000, 666 or 9xx area)'],
    GB: ['National Insurance no.', s => niNumber(clean(s)), 'Two letters, six digits, A–D (e.g. QQ 12 34 56 C)'],
    CA: ['SIN', s => /^\d{9}$/.test(digits(s)) && luhn(digits(s)), '9 digits with a Luhn check'],
    AU: ['TFN', s => tfn(digits(s)), '9 digits with a weighted check'],
    BR: ['CPF', s => cpf(s), '11 digits with two check digits'],
    AR: ['CUIL / CUIT', s => cuit(digits(s)), '11 digits: XX-DNI-C'],
    MX: ['RFC', s => /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/.test(clean(s)), '12 (company) or 13 (person) characters'],
    PK: ['NTN', s => /^\d{7,8}$/.test(digits(s)) || /^\d{13}$/.test(digits(s)), '7-digit NTN or your 13-digit CNIC'],
    ES: ['NIF', s => esId(clean(s)), '8 digits + letter'],
    IT: ['Codice fiscale', s => /^[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]$/.test(clean(s)), '16 characters'],
    TR: ['Tax ID (TC Kimlik)', s => tckn(digits(s)), '11 digits'],
    ZA: ['Tax reference', s => /^[0-39]\d{9}$/.test(digits(s)), '10 digits'],
  };

  /** Resolve free-text country ("United Kingdom", "uk", "PK") → ISO code. */
  function resolveCountry(text) {
    const t = String(text || '').trim();
    if (!t) return (typeof U !== 'undefined' && U.homeCC) ? U.homeCC() : '';
    if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase() === 'UK' ? 'GB' : t.toUpperCase();
    const low = t.toLowerCase();
    const alias = { 'uk': 'GB', 'great britain': 'GB', 'england': 'GB', 'usa': 'US', 'america': 'US', 'uae': 'AE', 'emirates': 'AE', 'ksa': 'SA' };
    if (alias[low]) return alias[low];
    const list = typeof COUNTRIES !== 'undefined' ? COUNTRIES : [];
    const hit = list.find(c => c.n.toLowerCase() === low) || list.find(c => c.n.toLowerCase().startsWith(low));
    return hit ? hit.c : '';
  }

  /**
   * @param {string} cc ISO country
   * @param {string} kind 'nic' | 'tax' | 'passport' | 'cpf' | 'mrz'
   * @returns {{ok:boolean|null, label?:string, msg?:string}} ok null = nothing to check
   */
  function check(cc, kind, value) {
    const v = String(value || '').trim();
    if (!v) return { ok: null };
    if (kind === 'cpf') kind = 'nic', cc = 'BR';
    if (kind === 'passport') {
      const c = clean(v);
      if (!/^[A-Z0-9]{5,10}$/.test(c)) return { ok: false, label: 'Passport number', msg: 'Passport numbers are usually 6–9 letters and digits' };
      return { ok: true, label: 'Passport number', msg: '' };
    }
    if (kind === 'mrz') {
      const c = v.toUpperCase().replace(/\s/g, '');
      const m = /^([A-Z0-9<]{9})(\d)/.exec(c);
      if (!m) return { ok: null };
      const ok = mrzDigit(m[1]) === +m[2];
      return { ok, label: 'MRZ', msg: ok ? '' : 'The MRZ check digit does not match — check for a typo' };
    }
    const table = kind === 'tax' ? TAX : NATIONAL;
    const rule = table[cc];
    if (!rule) return { ok: null };
    const ok = !!rule[1](v);
    return { ok, label: rule[0], msg: ok ? '' : rule[0] + ' looks unusual — expected ' + rule[2] + '. You can still save it.', community: !!rule[3] };
  }

  return { check, resolveCountry, luhn, verhoeff, mrzDigit, cpf, tckn, nric, esId, cnId, myNumber, tfn, cuit, ssn, niNumber, zaId, NATIONAL, TAX };
})();
window.IdCheck = IdCheck;

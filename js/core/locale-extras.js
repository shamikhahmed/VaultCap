'use strict';
// VaultCap — second calendar + persistent storage. © 2026 Shamikh Ahmed.
/* Dates are always stored as ISO Gregorian; a second calendar is display-only, via
   Intl.DateTimeFormat (-u-ca-). Research: docs/research/worldwide-features.md §5, §8. */
const WorldCal = (() => {
  const CALENDARS = [
    ['', 'None'],
    ['islamic-umalqura', 'Hijri (Umm al-Qura)'],
    ['islamic-civil', 'Hijri (tabular / civil)'],
    ['persian', 'Persian (Solar Hijri)'],
    ['hebrew', 'Hebrew'],
    ['buddhist', 'Buddhist (Thai)'],
    ['indian', 'Indian national (Saka)'],
    ['chinese', 'Chinese (lunisolar)'],
    ['dangi', 'Korean (Dangi)'],
    ['japanese', 'Japanese (era)'],
    ['roc', 'Minguo (Taiwan)'],
    ['ethiopic', 'Ethiopian'],
    ['coptic', 'Coptic'],
  ];
  /* Sensible suggestion only — the user chooses; nothing is switched on by country. */
  const SUGGEST = { SA: 'islamic-umalqura', AE: 'islamic-umalqura', QA: 'islamic-umalqura', KW: 'islamic-umalqura', BH: 'islamic-umalqura', OM: 'islamic-umalqura', YE: 'islamic-umalqura',
    PK: 'islamic-civil', EG: 'islamic-civil', JO: 'islamic-civil', MY: 'islamic-civil', ID: 'islamic-civil', BD: 'islamic-civil', AF: 'persian', IR: 'persian', IL: 'hebrew', TH: 'buddhist',
    IN: 'indian', CN: 'chinese', TW: 'roc', KR: 'dangi', JP: 'japanese', ET: 'ethiopic' };

  let _supported = null;
  function supported() {
    if (_supported) return _supported;
    let list = null;
    try { if (Intl.supportedValuesOf) list = Intl.supportedValuesOf('calendar'); } catch (e) {}
    _supported = CALENDARS.filter(([id]) => {
      if (!id) return true;
      if (list) return list.includes(id) || (id === 'ethiopic' && list.includes('ethioaa'));
      try { return new Intl.DateTimeFormat('en-u-ca-' + id).resolvedOptions().calendar === id; } catch (e) { return false; }
    });
    return _supported;
  }
  const cal = () => (typeof S !== 'undefined' && S.user && S.user.altCalendar) || '';
  const offset = () => { const n = +((typeof S !== 'undefined' && S.user && S.user.hijriOffset) || 0); return Math.max(-2, Math.min(2, isNaN(n) ? 0 : n)); };
  const locale = () => (typeof navigator !== 'undefined' && navigator.language) || 'en';

  /** Formatted date in the chosen second calendar, or '' when none / unsupported. */
  function fmt(date, opts) {
    const c = (opts && opts.calendar) || cal();
    if (!c) return '';
    const d = date instanceof Date ? new Date(date.getTime()) : new Date(date);
    if (isNaN(d)) return '';
    if (/^islamic/.test(c)) d.setDate(d.getDate() + offset());
    try {
      const f = new Intl.DateTimeFormat(locale() + '-u-ca-' + c, { day: 'numeric', month: 'long', year: 'numeric' });
      if (f.resolvedOptions().calendar.replace('ethioaa', 'ethiopic') !== c) return '';
      return f.format(d);
    } catch (e) { return ''; }
  }

  function suggestion() {
    const home = (typeof U !== 'undefined' && U.homeCC) ? U.homeCC() : '';
    const s = SUGGEST[home];
    return s && supported().some(([id]) => id === s) ? s : '';
  }

  function label() {
    const c = cal();
    const hit = CALENDARS.find(([id]) => id === c);
    return c && hit ? hit[1] + (/^islamic/.test(c) && offset() ? ' (' + (offset() > 0 ? '+' : '') + offset() + ' day' + (Math.abs(offset()) === 1 ? '' : 's') + ')' : '') : 'None';
  }

  function openSettings() {
    const sug = suggestion();
    const cur = cal();
    const opts = supported().map(([id, n]) => `<option value="${id}"${id === cur ? ' selected' : ''}>${escHtml(n)}${id && id === sug ? ' — common where you live' : ''}</option>`).join('');
    Modal.open('Second calendar',
      `<p class="vc-ix-67">Show dates in a second calendar next to the Gregorian date on reminders and the timeline. Your data is always stored as Gregorian dates.</p>
       <div class="fg"><label class="fl" for="wc-cal">Calendar</label><select class="inp" id="wc-cal" data-act-change="WorldCal._preview()">${opts}</select></div>
       <div class="fg" id="wc-offset-row"><label class="fl" for="wc-offset">Hijri adjustment (local moon sighting)</label>
         <select class="inp" id="wc-offset" data-act-change="WorldCal._preview()">${[-2, -1, 0, 1, 2].map(n => `<option value="${n}"${n === offset() ? ' selected' : ''}>${n > 0 ? '+' : ''}${n} day${Math.abs(n) === 1 ? '' : 's'}</option>`).join('')}</select></div>
       <div class="vc-ix-221" id="wc-preview" aria-live="polite"></div>`,
      `<button type="button" class="btn btn-g" data-act="Modal.close()">Cancel</button><button type="button" class="btn btn-p" id="wc-save" data-act="WorldCal._save()">Save</button>`);
    setTimeout(() => WorldCal._preview(), 0);
  }
  function _preview() {
    const c = (document.getElementById('wc-cal') || {}).value || '';
    const o = +((document.getElementById('wc-offset') || {}).value || 0);
    const row = document.getElementById('wc-offset-row');
    if (row) row.style.display = /^islamic/.test(c) ? '' : 'none';
    const p = document.getElementById('wc-preview');
    if (!p) return;
    if (!c) { p.textContent = ''; return; }
    const d = new Date(); if (/^islamic/.test(c)) d.setDate(d.getDate() + o);
    p.textContent = 'Today: ' + fmt(d, { calendar: c });
  }
  function _save() {
    const c = (document.getElementById('wc-cal') || {}).value || '';
    const o = +((document.getElementById('wc-offset') || {}).value || 0);
    S.user.altCalendar = c;
    S.user.hijriOffset = /^islamic/.test(c) ? o : 0;
    Store.save();
    Modal.close();
    if (typeof Settings !== 'undefined' && Settings.render) Settings.render();
    Toast.show(c ? 'Second calendar on' : 'Second calendar off', 'success');
  }

  return { CALENDARS, supported, fmt, label, suggestion, openSettings, _preview, _save, cal, offset };
})();

/* Ask the browser not to evict the vault under storage pressure. Safari can clear script
   storage for sites not added to the Home Screen after 7 days without a visit. */
const VaultStorage = (() => {
  let _state = null;
  async function status() {
    try {
      if (!navigator.storage || !navigator.storage.persisted) return { supported: false };
      const persisted = await navigator.storage.persisted();
      const est = navigator.storage.estimate ? await navigator.storage.estimate() : {};
      _state = { supported: true, persisted, usage: est.usage || 0, quota: est.quota || 0 };
      return _state;
    } catch (e) { return { supported: false }; }
  }
  async function request() {
    try {
      if (!navigator.storage || !navigator.storage.persist) { Toast.show('This browser decides storage itself — keep regular backups', 'info'); return false; }
      const ok = await navigator.storage.persist();
      Toast.show(ok ? 'Storage is now persistent' : 'The browser declined — install VaultCap to your Home Screen, and keep backups', ok ? 'success' : 'warn', 5000);
      await status();
      if (typeof Settings !== 'undefined' && Settings.render) Settings.render();
      return ok;
    } catch (e) { return false; }
  }
  function desc() {
    if (!_state) return 'Checking…';
    if (!_state.supported) return 'Managed by the browser — keep backups';
    const mb = n => (n / 1048576).toFixed(n > 10485760 ? 0 : 1) + ' MB';
    return (_state.persisted ? 'Persistent — the browser will not clear it' : 'Not persistent — the browser may clear it under pressure') + (_state.usage ? ' · ' + mb(_state.usage) + ' used' : '');
  }
  /** Fill the Settings row after an async check, without re-rendering the page. */
  function hydrate() {
    status().then(() => {
      const el = document.getElementById('vs-desc'); if (el) el.textContent = desc();
      const b = document.getElementById('vs-btn'); if (b) b.style.display = _state && _state.supported && !_state.persisted ? '' : 'none';
    });
  }
  return { status, request, desc, hydrate, get state() { return _state; } };
})();

window.WorldCal = WorldCal;
window.VaultStorage = VaultStorage;

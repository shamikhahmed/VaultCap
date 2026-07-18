'use strict';
/* BackupVerify — dry-run .vos decrypt preview (never writes to S) */

const BackupVerify = (() => {
  let _fileEnc = null;

  function _esc(s) {
    return typeof escHtml === 'function' ? escHtml(s) : String(s ?? '');
  }

  function _countSummary(data) {
    const rows = [
      ['Banks', (data.banks || []).length],
      ['Cards', (data.cards || []).length],
      ['Investments', (data.investments || []).length],
      ['Cash', (data.cash || []).length],
      ['Loans', (data.loans || []).length],
      ['Assets', (data.assets || []).length],
      ['Expenses', (data.expenses || []).length],
      ['SIMs', (data.sims || []).length],
      ['Emails', (data.emails || []).length],
      ['Gadgets', (data.gadgets || []).length],
      ['Digital', (data.digital || []).length],
      ['Documents', (data.documents || []).length],
      ['Family members', (data.familyMembers || []).length],
      ['BC holdings', (data.bc || []).length],
      ['Bonds', (data.bonds || []).length],
    ];
    return rows.filter(([, n]) => n > 0);
  }

  function _showResult(data, keyLabel) {
    const counts = _countSummary(data);
    const exported = data._exportedAt || data.exported || 'Unknown date';
    const ver = data._appVersion || data.ver || '—';
    const schema = data._vaultVersion || data.schemaVersion || '—';
    const owner = (data.user && data.user.name) ? _esc(data.user.name) : '—';

    const rows = counts.length
      ? counts.map(([k, n]) => '<div class="si" style="pointer-events:none"><div class="sil"><div class="name">' + _esc(k) + '</div><div class="desc">' + n + ' entr' + (n === 1 ? 'y' : 'ies') + '</div></div><span class="badge b-ok">' + n + '</span></div>').join('')
      : '<div class="empty-ios"><div class="ei-title">Empty vault file</div><div class="ei-sub">Decrypted successfully but no module arrays found.</div></div>';

    const body = '<div style="background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.25);border-radius:12px;padding:12px;margin-bottom:14px">'
      + '<div style="font-size:13px;font-weight:700;color:var(--ok);margin-bottom:4px">Backup verified — dry run only</div>'
      + '<div style="font-size:12px;color:var(--text2);line-height:1.5">Nothing was imported. Your live vault is unchanged.</div></div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;font-size:12px">'
      + '<div><span style="color:var(--text3)">Owner</span><br><strong>' + owner + '</strong></div>'
      + '<div><span style="color:var(--text3)">Exported</span><br><strong>' + _esc(String(exported).slice(0, 19)) + '</strong></div>'
      + '<div><span style="color:var(--text3)">App version</span><br><strong>' + _esc(String(ver)) + '</strong></div>'
      + '<div><span style="color:var(--text3)">Schema</span><br><strong>' + _esc(String(schema)) + '</strong></div>'
      + '</div>'
      + '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Contents</div>'
      + rows;

    if (typeof Modal !== 'undefined') {
      Modal.open('Backup verified', body,
        '<button type="button" class="btn btn-p btn-full" data-act="Modal.close();BackupVerify._clear()">Done</button>');
    }
    _fileEnc = null;
    if (typeof Activity !== 'undefined') Activity.log('Verified backup', keyLabel || 'dry-run');
  }

  async function _decryptWithKey(key) {
    if (!_fileEnc || typeof Crypto === 'undefined') return;
    const errEl = document.getElementById('bv-err');
    const attempts = [key, key + '_vos4_' + ((typeof S !== 'undefined' && S.user && S.user.name) || '')];
    for (let i = 0; i < attempts.length; i++) {
      try {
        const plain = await Crypto.decrypt(_fileEnc, attempts[i]);
        const data = JSON.parse(plain);
        if (typeof Modal !== 'undefined') Modal.close();
        _showResult(data, 'backup key');
        return;
      } catch (e) { /* try next */ }
    }
    if (errEl) errEl.textContent = 'Wrong backup key or corrupted file';
  }

  function _onFile(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      let raw = e.target.result;
      if (typeof raw !== 'string') {
        if (typeof Toast !== 'undefined') Toast.show('Could not read file', 'error');
        return;
      }
      if (raw.startsWith('VAULTOS_AES256::')) {
        if (!Crypto.available()) {
          if (typeof Toast !== 'undefined') Toast.show('Web Crypto unavailable', 'error');
          return;
        }
        _fileEnc = raw.replace('VAULTOS_AES256::', '');
        if (typeof Modal !== 'undefined') {
          Modal.open('Verify backup',
            '<p style="font-size:12px;color:var(--text2);line-height:1.55;margin-bottom:12px">Enter the backup key from when this <strong>.vos</strong> was exported. Preview only — nothing is written to your vault.</p>'
            + '<div class="fg"><label class="fl">Backup key</label><input class="inp" id="bv-key" type="password" autocomplete="off" placeholder="Backup key"></div>'
            + '<div class="ferr" id="bv-err"></div>',
            '<button type="button" class="btn btn-g" data-act="Modal.close();BackupVerify._clear()">Cancel</button>'
            + '<button type="button" class="btn btn-p" data-act="BackupVerify._submitKey()">Verify</button>');
          setTimeout(() => document.getElementById('bv-key')?.focus(), 80);
        }
        return;
      }
      if (raw.startsWith('VAULTOS4_ENC::')) raw = atob(raw.replace('VAULTOS4_ENC::', ''));
      try {
        const data = JSON.parse(raw);
        _showResult(data, 'plain');
      } catch (err) {
        if (typeof Toast !== 'undefined') Toast.show('Invalid vault file', 'error');
      }
    };
    reader.readAsText(file);
    ev.target.value = '';
  }

  return {
    open() {
      let inp = document.getElementById('backupVerifyInput');
      if (!inp) {
        inp = document.createElement('input');
        inp.type = 'file';
        inp.id = 'backupVerifyInput';
        inp.accept = '.vos,.json,application/octet-stream';
        inp.style.display = 'none';
        inp.addEventListener('change', _onFile);
        document.body.appendChild(inp);
      }
      inp.click();
    },

    _submitKey() {
      const key = document.getElementById('bv-key')?.value || '';
      if (!key || key.length < 4) {
        const err = document.getElementById('bv-err');
        if (err) err.textContent = 'Enter backup key';
        return;
      }
      _decryptWithKey(key);
    },

    _clear() {
      _fileEnc = null;
    },
  };
})();

window.BackupVerify = BackupVerify;

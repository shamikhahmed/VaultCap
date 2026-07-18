'use strict';
/* SmartHelp — rules-based help assistant (offline, no LLM) */

const SmartHelp = (() => {
  const QUICK_CHIPS = [
    'How do I unlock?',
    'Recovery key',
    'Backup .vos file',
    'Decoy PIN',
    'Is my data private?',
    'Free forever?',
  ];

  const KB = [
    {
      keys: ['pin', 'unlock', 'lock', 'passcode', 'password', 'open vault', 'forgot pin'],
      title: 'PIN & unlock',
      html: '<p>Your <strong>6-digit PIN</strong> unlocks the vault on this device. It never leaves your phone or browser.</p><p>After 5 wrong attempts you get a short lockout; after 10, recovery options appear. Use your <strong>master recovery key</strong> or a <strong>.vos backup</strong> if you forget the PIN.</p><p>Change PIN anytime in <strong>Settings → Security</strong>.</p>',
    },
    {
      keys: ['recovery', 'master key', 'master', 'reset pin', 'forgot'],
      title: 'Recovery key',
      html: '<p>The <strong>master recovery key</strong> is shown once during setup. Store it offline — Capricorn Systems cannot see or reset it.</p><p>Use it on the lock screen (<em>Forgot PIN?</em>) or in Settings to regain access and set a new PIN. It does <strong>not</strong> replace your encrypted backup file.</p>',
    },
    {
      keys: ['backup', '.vos', 'vos', 'export', 'restore', 'backup key'],
      title: 'Backup (.vos + backup key)',
      html: '<p>Export an encrypted <strong>.vos</strong> file from Settings → Backup. VaultCap generates a separate <strong>backup key</strong> — save it with the file.</p><p>The backup key is <em>not</em> your PIN. You need both the file and the key to restore on any device. Prefer .vos over plain JSON export.</p>',
    },
    {
      keys: ['decoy', 'duress', 'fake', 'coercion', 'plausible'],
      title: 'Decoy PIN',
      html: '<p>A <strong>decoy PIN</strong> opens a convincing but separate vault with harmless sample data — useful under coercion.</p><p>Set it in <strong>Settings → Security → Decoy PIN</strong>. Use a different 6-digit code from your real PIN. Real and decoy slots are padded to look similar on disk.</p>',
    },
    {
      keys: ['bank', 'banks', 'card', 'cards', 'account', 'balance'],
      title: 'Banks & cards',
      html: '<p>Add banks and cards from the sidebar modules. Link cards to banks, track balances in your home currency, and get expiry reminders.</p><p>All entries stay encrypted in your vault. Use <strong>Smart Add</strong> to pre-fill from plain text like "Chase USD 12,500".</p>',
    },
    {
      keys: ['import', 'export', 'transfer', 'merge', 'csv'],
      title: 'Export & import',
      html: '<p><strong>Encrypted .vos</strong> — best for full vault backup (backup key required).</p><p><strong>JSON/CSV</strong> — partial exports for spreadsheets; JSON import merges by ID.</p><p>Use <strong>Verify backup</strong> to preview a .vos file without changing your vault.</p>',
    },
    {
      keys: ['privacy', 'private', 'cloud', 'server', 'tracking', 'telemetry', 'zero knowledge'],
      title: 'Privacy',
      html: '<p>VaultCap is <strong>zero-knowledge</strong>: no account, no cloud vault, no ads. Data is encrypted on your device with AES-256-GCM.</p><p>Optional online features (exchange rates, bundled logo proxy) fetch public data only — never your vault contents.</p>',
    },
    {
      keys: ['rate', 'rates', 'fx', 'exchange', 'gold', 'silver', 'offline', 'currency'],
      title: 'Rates & offline',
      html: '<p>Exchange and precious-metal rates update when you are online; cached values are used offline.</p><p>Net worth and conversions use the last known rates — totals may drift until you reconnect. You can refresh rates from the Rates module.</p>',
    },
    {
      keys: ['encrypt', 'encryption', 'aes', 'security', 'kdf', 'pbkdf2'],
      title: 'How encryption works',
      html: '<p>Your PIN derives an AES-256 key via <strong>PBKDF2</strong> (600k iterations). Vault data is stored encrypted in IndexedDB.</p><p>Portable .vos files use AES-256-GCM with their own salt and backup-key derivation. Session keys live in memory only and clear on lock.</p>',
    },
    {
      keys: ['free', 'cost', 'price', 'subscription', 'pay', 'premium'],
      title: 'Free forever',
      html: '<p>VaultCap is a <strong>100% free</strong> consumer app — no paywall, no premium tier, no account required.</p><p>Built by Capricorn Systems as a private life OS for expats and families. Optional Smart Parser / LLM assist is off by default and never required.</p>',
    },
    {
      keys: ['help', 'smart help', 'assistant', 'chat', 'support'],
      title: 'Smart Help',
      html: '<p>This panel is a <strong>rules-based Smart Assistant</strong> — keyword matching only, no cloud AI, works fully offline.</p><p>Ask about PIN, backups, privacy, or modules. For account recovery issues, use lock-screen recovery or email support with your Vault ID (not a password).</p>',
    },
  ];

  let _messages = [];
  let _panelEl = null;
  let _useModal = false;

  function _esc(str) {
    return typeof escHtml === 'function'
      ? escHtml(str)
      : String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function _tokenize(q) {
    return String(q || '').toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  }

  function _scoreEntry(entry, tokens, rawQ) {
    const q = String(rawQ || '').toLowerCase();
    let score = 0;
    entry.keys.forEach(k => {
      const kl = k.toLowerCase();
      if (q.includes(kl)) score += 12;
      tokens.forEach(t => {
        if (kl.includes(t) || t.includes(kl)) score += 4;
        if (kl.split(/\s+/).some(w => w.startsWith(t) || t.startsWith(w))) score += 2;
      });
    });
    if (entry.title.toLowerCase().includes(q)) score += 8;
    return score;
  }

  function _match(q) {
    const tokens = _tokenize(q);
    if (!tokens.length) return null;
    let best = null;
    let bestScore = 0;
    KB.forEach(entry => {
      const s = _scoreEntry(entry, tokens, q);
      if (s > bestScore) { bestScore = s; best = entry; }
    });
    if (best && bestScore >= 4) return best;
    return null;
  }

  function _fallback(q) {
    const suggestions = KB.slice(0, 4).map(e => e.title).join(', ');
    return {
      title: 'Not sure about that',
      html: '<p>I could not find a exact match for <strong>' + _esc(q) + '</strong>.</p>'
        + '<p>Try one of the quick topics below, or ask about: ' + _esc(suggestions) + '.</p>'
        + '<p style="font-size:12px;color:var(--text3)">Smart Help uses offline keyword rules — not AI.</p>',
    };
  }

  function _bubble(role, html, plain) {
    const isUser = role === 'user';
    const align = isUser ? 'flex-end' : 'flex-start';
    const bg = isUser ? 'rgba(0,122,255,.15)' : 'var(--glass)';
    const border = isUser ? 'rgba(0,122,255,.25)' : 'var(--border)';
    const body = isUser ? _esc(plain || html) : html;
    return '<div style="display:flex;justify-content:' + align + ';margin-bottom:10px">'
      + '<div style="max-width:88%;padding:10px 12px;border-radius:14px;background:' + bg + ';border:1px solid ' + border + ';font-size:13px;line-height:1.55;color:var(--text)">' + body + '</div></div>';
  }

  function _chipsHtml() {
    return '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">'
      + QUICK_CHIPS.map(c => '<button type="button" class="chip" style="cursor:pointer" onclick="SmartHelp.ask(' + JSON.stringify(c) + ')"><span class="chip-ic">' + (typeof VC !== 'undefined' ? VC.icon('sparkles', 12) : '') + '</span>' + _esc(c) + '</button>').join('')
      + '</div>';
  }

  function _chatBodyHtml() {
    const intro = _bubble('bot',
      '<p><strong>Smart Help</strong> — offline rules assistant (not AI).</p><p>Pick a topic or type a question about PIN, backup, privacy, and more.</p>');
    const msgs = _messages.map(m => _bubble(m.role, m.html, m.text)).join('');
    return _chipsHtml() + '<div id="shChatLog" style="max-height:min(52vh,420px);overflow-y:auto;padding-right:4px">' + intro + msgs + '</div>'
      + '<div style="display:flex;gap:8px;margin-top:12px">'
      + '<input class="inp" id="shInput" type="text" placeholder="Ask about PIN, backup, privacy…" autocomplete="off" style="flex:1" onkeydown="if(event.key===\'Enter\'){event.preventDefault();SmartHelp._send()}">'
      + '<button type="button" class="btn btn-p" onclick="SmartHelp._send()">Send</button></div>';
  }

  function _scrollChat() {
    const log = document.getElementById('shChatLog');
    if (log) log.scrollTop = log.scrollHeight;
  }

  function render() {
    const html = _chatBodyHtml();
    if (_useModal && typeof Modal !== 'undefined') {
      Modal.open('Smart Help', html, '<button type="button" class="btn btn-g btn-full" onclick="Modal.close()">Close</button>');
    } else if (_panelEl) {
      _panelEl.innerHTML = '<div style="padding:14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">'
        + '<div style="font-weight:800;font-size:15px">Smart Help</div>'
        + '<button type="button" class="btn btn-g btn-sm" onclick="SmartHelp.close()">×</button></div>'
        + '<div style="padding:14px">' + html + '</div>';
    }
    setTimeout(() => { document.getElementById('shInput')?.focus(); _scrollChat(); }, 80);
  }

  function _ensurePanel() {
    if (document.getElementById('smartHelpPanel')) {
      _panelEl = document.getElementById('smartHelpPanel');
      return;
    }
    const el = document.createElement('div');
    el.id = 'smartHelpPanel';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Smart Help');
    el.style.cssText = 'position:fixed;bottom:16px;right:16px;width:min(420px,calc(100vw - 32px));max-height:min(90vh,640px);overflow:auto;z-index:9500;background:var(--bg2);border:1px solid var(--border);border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.45);display:none';
    document.body.appendChild(el);
    _panelEl = el;
  }

  return {
    open() {
      _useModal = typeof Modal !== 'undefined';
      if (!_useModal) {
        _ensurePanel();
        if (_panelEl) _panelEl.style.display = 'block';
      }
      this.render();
    },

    close() {
      if (_panelEl) _panelEl.style.display = 'none';
      if (typeof Modal !== 'undefined') Modal.close();
    },

    render,

    ask(q) {
      const question = String(q || '').trim();
      if (!question) return;
      const hit = _match(question) || _fallback(question);
      _messages.push({ role: 'user', text: question, html: '' });
      _messages.push({ role: 'bot', html: '<div style="font-weight:700;margin-bottom:6px">' + _esc(hit.title) + '</div>' + hit.html, text: '' });
      if (_messages.length > 40) _messages = _messages.slice(-40);
      this.render();
    },

    _send() {
      const inp = document.getElementById('shInput');
      const v = inp?.value?.trim();
      if (!v) return;
      if (inp) inp.value = '';
      this.ask(v);
    },
  };
})();

window.SmartHelp = SmartHelp;

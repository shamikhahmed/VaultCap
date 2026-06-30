'use strict';
// VaultOS Credit Score Tracker — © 2026 Shamikh Ahmed
const CreditScore = {
  _KEY: 'vo_credit_score',

  get() {
    return typeof VaultMeta !== 'undefined' ? VaultMeta.get('creditScore') : {};
  },

  save(d) {
    if (typeof VaultMeta !== 'undefined') VaultMeta.set('creditScore', d);
  },

  render() {
    const body = document.getElementById('pg-credit-body');
    if (!body) return;
    const d = this.get();
    const score = d.score || null;
    const history = d.history || [];

    const scoreColor = !score ? 'var(--text3)'
      : score >= 800 ? 'var(--ok)'
      : score >= 700 ? '#34c759'
      : score >= 600 ? 'var(--warn)'
      : score >= 500 ? '#ff9f0a'
      : 'var(--err)';

    const scoreLabel = !score ? 'Not set'
      : score >= 800 ? 'Excellent'
      : score >= 700 ? 'Good'
      : score >= 600 ? 'Fair'
      : score >= 500 ? 'Poor'
      : 'Very Poor';

    const agencies = [
      { name: 'Experian', min: 0, max: 999, good: 881, fair: 721 },
      { name: 'Equifax', min: 0, max: 700, good: 420, fair: 380 },
      { name: 'TransUnion', min: 0, max: 710, good: 628, fair: 566 },
      { name: 'ECIB (PK)', min: 0, max: 999, good: 750, fair: 600 },
    ];

    body.innerHTML =
      '<div style="padding:16px;display:flex;flex-direction:column;gap:14px">' +

      // Score hero
      '<div style="background:linear-gradient(135deg,rgba(255,255,255,.15),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:24px;text-align:center">' +
        '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:12px">Credit Score</div>' +
        '<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px">' +
          '<svg width="160" height="160" viewBox="0 0 160 160">' +
            '<circle cx="80" cy="80" r="66" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>' +
            (score ? '<circle cx="80" cy="80" r="66" fill="none" stroke="' + scoreColor + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + Math.round((score / 999) * 414) + ' 414" transform="rotate(-90 80 80)" opacity="0.9"/>' : '') +
          '</svg>' +
          '<div style="position:absolute;text-align:center">' +
            '<div style="font-size:' + (score ? '42' : '28') + 'px;font-weight:900;color:' + scoreColor + ';letter-spacing:-2px;line-height:1">' + (score || '—') + '</div>' +
            '<div style="font-size:13px;font-weight:700;color:' + scoreColor + ';margin-top:4px">' + scoreLabel + '</div>' +
          '</div>' +
        '</div>' +
        (d.agency ? '<div style="font-size:12px;color:var(--text3);margin-bottom:4px">Reported by ' + d.agency + '</div>' : '') +
        (d.lastChecked ? '<div style="font-size:11px;color:var(--text3)">Last checked: ' + new Date(d.lastChecked).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) + '</div>' : '') +
      '</div>' +

      '<button type="button" class="btn btn-p" style="width:100%" onclick="CreditScore.openUpdate()">📊 Update Score</button>' +

      // Score breakdown tips
      '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:12px">What affects your score</div>' +
        [
          ['💳', 'Payment History', '35%', 'Always pay on time — biggest factor'],
          ['📊', 'Credit Utilisation', '30%', 'Keep card balances below 30% of limit'],
          ['📅', 'Credit Age', '15%', 'Older accounts help — avoid closing old cards'],
          ['🔍', 'New Credit', '10%', 'Avoid multiple applications in short periods'],
          ['🏦', 'Credit Mix', '10%', 'Mix of cards, loans, and mortgage helps'],
        ].map(function(f) {
          return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">' +
            '<div style="font-size:18px;flex-shrink:0">' + f[0] + '</div>' +
            '<div style="flex:1">' +
              '<div style="display:flex;align-items:center;justify-content:space-between">' +
                '<div style="font-size:13px;color:var(--text);font-weight:600">' + f[1] + '</div>' +
                '<div style="font-size:12px;font-weight:800;color:var(--accent)">' + f[2] + '</div>' +
              '</div>' +
              '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + f[3] + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +

      // Score history
      (history.length > 1 ? (
        '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
          '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:10px">Score History</div>' +
          history.slice(-8).reverse().map(function(h) {
            const hColor = h.score >= 800 ? 'var(--ok)' : h.score >= 700 ? '#34c759' : h.score >= 600 ? 'var(--warn)' : 'var(--err)';
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">' +
              '<div style="font-size:12px;color:var(--text2)">' + new Date(h.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'2-digit' }) + '</div>' +
              '<div style="font-size:14px;font-weight:800;color:' + hColor + '">' + h.score + '</div>' +
            '</div>';
          }).join('') +
        '</div>'
      ) : '') +

      // Agency ranges reference
      '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:10px">Score Ranges by Agency</div>' +
        agencies.map(function(a) {
          return '<div style="margin-bottom:10px">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
              '<div style="font-size:12px;font-weight:700;color:var(--text)">' + a.name + '</div>' +
              '<div style="font-size:11px;color:var(--text3)">' + a.min + ' – ' + a.max + '</div>' +
            '</div>' +
            '<div style="height:6px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden;display:flex">' +
              '<div style="flex:' + a.fair + ';background:var(--err);border-radius:999px 0 0 999px"></div>' +
              '<div style="flex:' + (a.good - a.fair) + ';background:var(--warn)"></div>' +
              '<div style="flex:' + (a.max - a.good) + ';background:var(--ok);border-radius:0 999px 999px 0"></div>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:3px">' +
              '<span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +

      // Check credit links
      '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:10px">Check Your Credit Report</div>' +
        [
          ['🇬🇧', 'Experian UK', 'https://www.experian.co.uk', 'Free monthly score'],
          ['🇬🇧', 'ClearScore (Equifax)', 'https://www.clearscore.com', 'Free, updated weekly'],
          ['🇬🇧', 'Credit Karma (TransUnion)', 'https://www.creditkarma.co.uk', 'Free TransUnion score'],
          ['🇵🇰', 'ECIB Pakistan', 'https://www.sbp.org.pk/ecib', 'State Bank credit registry'],
          ['🇦🇪', 'AECB UAE', 'https://www.aecb.gov.ae', 'Al Etihad Credit Bureau'],
        ].map(function(l) {
          return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">' +
            '<div>' +
              '<div style="font-size:13px;color:var(--text);font-weight:600">' + l[0] + ' ' + l[1] + '</div>' +
              '<div style="font-size:11px;color:var(--text3)">' + l[3] + '</div>' +
            '</div>' +
            '<button type="button" onclick="window.open(\'' + l[2] + '\',\'_blank\')" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:6px 12px;color:var(--accent);font-size:12px;cursor:pointer;white-space:nowrap">Visit →</button>' +
          '</div>';
        }).join('') +
      '</div>' +

      '</div>';
  },

  openUpdate() {
    const d = this.get();
    const agencies = ['Experian', 'Equifax', 'TransUnion', 'ECIB (PK)', 'AECB (AE)', 'Other'];
    Modal.open('📊 Update Credit Score',
      '<div class="fg"><label class="fl">Your Credit Score</label>' +
        '<input class="inp" type="text" inputmode="numeric" id="cs-score" pattern="[0-9]*" maxlength="3" value="' + (d.score || '') + '" placeholder="e.g. 750" oninput="CreditScore._preview(this.value)"></div>' +
      '<div id="cs-preview" style="text-align:center;padding:10px;font-size:24px;font-weight:900;color:var(--text3)"></div>' +
      '<div class="fg"><label class="fl">Reporting Agency</label>' +
        '<select class="inp" id="cs-agency">' +
          agencies.map(function(a) { return '<option value="' + a + '"' + (d.agency === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') +
        '</select></div>' +
      '<div class="fg"><label class="fl">Date Checked</label>' +
        '<input class="inp" type="date" id="cs-date" value="' + (d.lastChecked ? d.lastChecked.split('T')[0] : new Date().toISOString().split('T')[0]) + '"></div>' +
      '<div class="fg"><label class="fl">Notes (optional)</label>' +
        '<textarea class="inp" id="cs-notes" rows="2">' + (d.notes || '') + '</textarea></div>',
      '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
      '<button type="button" class="btn btn-p" onclick="CreditScore.saveScore()">Save</button>'
    );
    if (d.score) this._preview(d.score);
  },

  _preview(val) {
    const score = parseInt(val) || 0;
    const el = document.getElementById('cs-preview');
    if (!el || !score) return;
    const color = score >= 800 ? 'var(--ok)' : score >= 700 ? '#34c759' : score >= 600 ? 'var(--warn)' : score >= 500 ? '#ff9f0a' : 'var(--err)';
    const label = score >= 800 ? 'Excellent 🌟' : score >= 700 ? 'Good ✓' : score >= 600 ? 'Fair' : score >= 500 ? 'Poor' : 'Very Poor';
    el.style.color = color;
    el.textContent = score + ' — ' + label;
  },

  saveScore() {
    const score = parseInt((document.getElementById('cs-score') || {}).value) || 0;
    if (!score || score < 1 || score > 999) { Toast.show('Enter a valid score (1-999)', 'error'); return; }
    const d = this.get();
    const history = d.history || [];
    const today = new Date().toISOString();
    history.push({ score, date: today, agency: (document.getElementById('cs-agency') || {}).value || '' });
    this.save({
      score,
      agency: (document.getElementById('cs-agency') || {}).value || '',
      lastChecked: (document.getElementById('cs-date') || {}).value || today,
      notes: ((document.getElementById('cs-notes') || {}).value || '').trim(),
      history: history.slice(-24),
    });
    Modal.close();
    this.render();
    Toast.show('Credit score updated', 'success');
  },
};
window.CreditScore = CreditScore;

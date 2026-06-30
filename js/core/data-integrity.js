// VaultCap — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Duplicate detection, audit log, data integrity — extracted from app.js (refactor 4.4.0)

// ===================== DATA INTEGRITY =====================
const DataIntegrity = {
  // BANK duplicate detection — entity-aware
  // HIGH confidence: same bankName + (accountNumber OR iban)
  // POSSIBLE: same bankName + accountType (different accounts at same bank)
  findDuplicateBanks() {
    const banks = S.banks || [];
    const dupes = [];
    for (let i = 0; i < banks.length; i++) {
      for (let j = i + 1; j < banks.length; j++) {
        const a = banks[i], b = banks[j];
        const sameName = (a.bankName || '').toLowerCase() === (b.bankName || '').toLowerCase();
        if (!sameName) continue;
        // HIGH: same unique identifier
        const aNum = (a.accountNumber || a.iban || '').replace(/\s/g,'').toLowerCase();
        const bNum = (b.accountNumber || b.iban || '').replace(/\s/g,'').toLowerCase();
        if (aNum && bNum && aNum === bNum) {
          dupes.push({ a, b, confidence: 'HIGH', reason: 'Same bank name and account number/IBAN' });
          continue;
        }
        // POSSIBLE: same name + same account type (but different/missing numbers — could be different accounts)
        if ((a.accountType || '') === (b.accountType || '') && a.accountType) {
          dupes.push({ a, b, confidence: 'POSSIBLE', reason: 'Same bank and account type — verify if different accounts' });
        }
      }
    }
    return dupes;
  },

  // CARD duplicate detection — entity-aware
  // HIGH: same last4 + same network
  // POSSIBLE: same card type + same linked bank (could be different cards)
  findDuplicateCards() {
    const cards = S.cards || [];
    const dupes = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i], b = cards[j];
        const aLast4 = (a.last4 || a.cardNumber || '').slice(-4);
        const bLast4 = (b.last4 || b.cardNumber || '').slice(-4);
        const aNet = (a.network || a.cardType || '').toLowerCase();
        const bNet = (b.network || b.cardType || '').toLowerCase();
        // HIGH: same last 4 + same network
        if (aLast4 && bLast4 && aLast4 === bLast4 && aNet && aNet === bNet) {
          dupes.push({ a, b, confidence: 'HIGH', reason: 'Same last 4 digits and card network' });
          continue;
        }
        // POSSIBLE: same card type + same linked bank
        if (aNet && aNet === bNet && (a.linkedBank || '') === (b.linkedBank || '') && a.linkedBank) {
          dupes.push({ a, b, confidence: 'POSSIBLE', reason: 'Same card type and linked bank — verify if different cards' });
        }
      }
    }
    return dupes;
  },

  // DOCUMENT duplicate detection
  findDuplicateDocuments() {
    const docs = S.documents || [];
    const dupes = [];
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const a = docs[i], b = docs[j];
        const sameType = (a.docType || a.type || '').toLowerCase() === (b.docType || b.type || '').toLowerCase();
        const aNum = (a.number || a.docNumber || '').replace(/\s/g,'').toLowerCase();
        const bNum = (b.number || b.docNumber || '').replace(/\s/g,'').toLowerCase();
        if (sameType && aNum && bNum && aNum === bNum) {
          dupes.push({ a, b, confidence: 'HIGH', reason: 'Same document type and number' });
        }
      }
    }
    return dupes;
  },

  check() {
    const dupBanks = this.findDuplicateBanks();
    const dupCards = this.findDuplicateCards();
    const dupDocs  = this.findDuplicateDocuments();
    const highCount = [...dupBanks, ...dupCards, ...dupDocs].filter(d => d.confidence === 'HIGH').length;
    const posCount  = [...dupBanks, ...dupCards, ...dupDocs].filter(d => d.confidence === 'POSSIBLE').length;
    return { dupBanks, dupCards, dupDocs, highCount, posCount };
  },

  run() {
    const r = this.check();
    const total = r.highCount + r.posCount;
    const hasDups = total > 0;
    Modal.open(
      '🔍 Data Integrity Check',
      `<div style="font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.6">
        Scanned ${(S.banks||[]).length} banks, ${(S.cards||[]).length} cards, ${(S.documents||[]).length} documents.
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
        ${r.highCount > 0 ? `<div style="padding:10px;background:rgba(255,59,48,.08);border:1px solid rgba(255,59,48,.2);border-radius:10px;font-size:13px;color:var(--err)">🔴 ${r.highCount} HIGH confidence duplicate${r.highCount>1?'s':''} — likely same record entered twice</div>` : '<div style="font-size:13px;color:var(--ok)">✅ No high-confidence duplicates</div>'}
        ${r.posCount > 0 ? `<div style="padding:10px;background:rgba(255,152,0,.08);border:1px solid rgba(255,152,0,.2);border-radius:10px;font-size:13px;color:var(--warn)">🟡 ${r.posCount} POSSIBLE duplicate${r.posCount>1?'s':''} — review recommended</div>` : ''}
        ${!hasDups ? '<div style="font-size:13px;color:var(--ok)">✅ No duplicates detected</div>' : ''}
      </div>
      <div style="font-size:11px;color:var(--text3);line-height:1.5">Note: Duplicate detection uses unique identifiers (account numbers, last 4 digits, document numbers) — two accounts at the same bank are NOT flagged as duplicates unless they share the same identifier.</div>`,
      `${hasDups ? '<button type="button" class="btn btn-g" onclick="Modal.close();DataIntegrity.showDuplicates()">Review →</button>' : ''}<button type="button" class="btn btn-p" onclick="Modal.close()">Done</button>`
    );
  },

  showDuplicates() {
    const r = this.check();
    const allDupes = [...r.dupBanks, ...r.dupCards, ...r.dupDocs];
    if (!allDupes.length) { Toast.show('No duplicates found', 'success'); return; }

    const renderDupe = (d, idx) => {
      const confColor = d.confidence === 'HIGH' ? 'var(--err)' : 'var(--warn)';
      const confBg    = d.confidence === 'HIGH' ? 'rgba(255,59,48,.08)' : 'rgba(255,152,0,.08)';
      const nameA = d.a.bankName || d.a.cardType || d.a.type || d.a.name || 'Record A';
      const nameB = d.b.bankName || d.b.cardType || d.b.type || d.b.name || 'Record B';
      const subA  = d.a.accountNumber || d.a.last4 || d.a.docNumber || d.a.number || d.a.accountType || '';
      const subB  = d.b.accountNumber || d.b.last4 || d.b.docNumber || d.b.number || d.b.accountType || '';
      return `<div style="background:${confBg};border:1px solid ${confColor}44;border-radius:12px;padding:12px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:11px;font-weight:700;color:${confColor}">${d.confidence} CONFIDENCE</span>
          <span style="font-size:11px;color:var(--text3)">${d.reason}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <div style="background:var(--glass);border-radius:8px;padding:8px">
            <div style="font-size:12px;font-weight:700;color:var(--text)">${escHtml(nameA)}</div>
            ${subA ? `<div style="font-size:11px;color:var(--text3)">${escHtml(subA)}</div>` : ''}
          </div>
          <div style="background:var(--glass);border-radius:8px;padding:8px">
            <div style="font-size:12px;font-weight:700;color:var(--text)">${escHtml(nameB)}</div>
            ${subB ? `<div style="font-size:11px;color:var(--text3)">${escHtml(subB)}</div>` : ''}
          </div>
        </div>
        ${d.confidence === 'HIGH' ? `<div style="font-size:11px;color:var(--text3)">These appear to be the same record. Review both before deleting.</div>` : `<div style="font-size:11px;color:var(--text3)">These may be different records at the same institution. No action required if they are distinct accounts.</div>`}
      </div>`;
    };

    Modal.open(
      '⚠️ Duplicate Review',
      `<div style="font-size:12px;color:var(--text3);margin-bottom:12px">Review these entries. Only delete if you are certain they are the same record. Never auto-merge without your confirmation.</div>` +
      allDupes.map(renderDupe).join(''),
      `<button type="button" class="btn btn-p" onclick="Modal.close()">Done</button>`
    );
  }
};

// ===================== AUDIT LOG =====================
const Audit = {
  log(item, action, changes = {}) {
    if (!item) return;
    if (!item._audit) item._audit = [];
    item._audit.unshift({ action, at: new Date().toISOString(), changes });
    item._audit = item._audit.slice(0, 10);
    item.updatedAt = new Date().toISOString();
  },
  render(item) {
    if (!item?._audit?.length) return '<div style="font-size:12px;color:var(--text3);padding:8px 0">No edit history yet</div>';
    return `<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3)">Edit History</div>
      ${item._audit.map(a => `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
          <div style="width:6px;height:6px;border-radius:50%;background:var(--accent,var(--purple,#7b5fff));flex-shrink:0;margin-top:5px"></div>
          <div>
            <div style="font-size:12px;font-weight:600;color:var(--text)">${a.action}</div>
            <div style="font-size:10px;color:var(--text3)">${new Date(a.at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        </div>`).join('')}
    </div>`;
  },
};

// ===================== DUPLICATE CHECKER (alias-aware) =====================
const _BANK_ALIAS_GROUPS = [
  // PK commercial
  ['hbl','habib bank limited','habib bank','hbl konnect','hbl islamic','hbl pay'],
  ['ubl','united bank','united bank limited','ubl ameen'],
  ['mcb bank','mcb','muslim commercial bank','mcb islamic','nib bank'],
  ['bank alfalah','alfalah','bankalfalah','alfalah islamic','bank alfalah islamic'],
  ['allied bank','abl','allied bank limited','allied islamic','allied bank islamic'],
  ['askari bank','acbl','askari'],
  ['bank al habib','bahl','al habib bank'],
  ['habib metro bank','habib metropolitan','habib metro'],
  ['standard chartered pk','standard chartered pakistan','stanchart pk','sc pakistan'],
  ['deutsche bank pk','deutsche bank pakistan'],
  ['bank of china pk','bank of china pakistan','boc pakistan'],
  ['icbc pakistan','industrial and commercial bank of china pk','icbc pk'],
  ['samba bank','samba pk','samba financial group pk'],
  ['silkbank','silk bank','silk'],
  ['soneri bank','soneri'],
  ['summit bank','summit'],
  ['js bank','jsb'],
  // PK islamic
  ['meezan bank','meezan','al meezan bank'],
  ['bank islami','bankislami','kasb bank','bipl'],
  ['dubai islamic bank pk','dib pakistan','dib pk'],
  ['al baraka bank pk','al baraka pakistan','albaraka bank pk'],
  ['faysal bank','faysal','fbl','faysal bank islamic'],
  // PK microfinance/digital
  ['sadapay','sada pay'],
  ['nayapay','naya pay'],
  ['zindigi','jazz zindigi'],
  ['jazzcash','jazz cash','jazz mobile money'],
  ['easypaisa','easy paisa','telenor microfinance'],
  ['upaisa','u paisa','ufone wallet'],
  ['finja','simsim','finja simsim'],
  ['hbl pay','hbl mobile wallet'],
  ['mcb lite','mcb mobile','mcb lite prepaid'],
  // PK government
  ['nbp','national bank of pakistan','national bank'],
  ['bank of punjab','bop'],
  ['zarai taraqiati bank','ztbl','agricultural bank pk','adbp'],
  ['sme bank','sme bank pakistan'],
  ['hbfc','house building finance company','house building finance corporation'],
  // PK foreign
  ['hsbc pakistan','hsbc pk'],
  ['citibank pk','citi pakistan','citibank pakistan','citi pk'],
  // UK traditional
  ['barclays','barclays bank','barclaycard','barclays international'],
  ['hsbc uk','hsbc','hsbc holdings','hsbc kinetic'],
  ['natwest','national westminster bank','national westminster'],
  ['lloyds bank','lloyds','lloyds banking group','lloyds international'],
  ['santander uk','santander','abbey national'],
  ['halifax','halifax bank','halifax building society'],
  ['nationwide','nationwide building society'],
  ['metro bank','metro bank uk'],
  ['tsb','tsb bank'],
  ['bank of scotland','bos scotland','bos'],
  ['royal bank of scotland','rbs','rbs group'],
  ['ulster bank','ulster bank ni'],
  ['clydesdale bank','clydesdale'],
  ['virgin money','virgin money uk','virgin bank uk'],
  ['co-operative bank','co-op bank','the co-operative bank','cooperative bank'],
  ['yorkshire bank','yorkshire','clydesdale yorkshire'],
  // UK digital
  ['monzo','monzo bank'],
  ['starling bank','starling'],
  ['revolut','revolut bank'],
  ['wise','transferwise','wise bank'],
  ['chase uk','chase bank uk','jpmorgan chase uk'],
  ['first direct','firstdirect'],
  ['atom bank','atom'],
  ['tandem bank','tandem'],
  ['cashplus','zempler bank','cashplus bank'],
  ['anna money','anna business'],
  ['tide','tide business','tide bank'],
  ['oaknorth bank','oaknorth'],
  ['zopa bank','zopa'],
  ['paysend','dozens','paysend uk'],
  // UK islamic
  ['al rayan bank','islamic bank of britain','al rayan'],
  ['gatehouse bank','gatehouse'],
  // UK international
  ['citibank uk','citi uk'],
  ['jp morgan uk','jpmorgan uk','j.p. morgan uk'],
  ['goldman sachs uk','marcus uk','marcus by goldman sachs'],
  // UAE commercial
  ['emirates nbd','enbd','emirates nbd bank','emirates national bank of dubai'],
  ['fab','first abu dhabi bank','nbad','national bank of abu dhabi'],
  ['adcb','abu dhabi commercial bank'],
  ['mashreq bank','mashreq','mashreq neo'],
  ['rakbank','national bank of ras al-khaimah','nrak'],
  ['commercial bank of dubai','cbd','cbd dubai'],
  ['united arab bank','uab','uab uae'],
  ['national bank of fujairah','nbf','nbf uae'],
  ['national bank of umm al qaiwain','nbq','nbq uae'],
  // UAE islamic
  ['adib','abu dhabi islamic bank'],
  ['dubai islamic bank','dib','dib uae'],
  ['emirates islamic','ei bank','emirates islamic bank','eib'],
  ['sharjah islamic bank','sib','sib uae'],
  // UAE digital
  ['wio bank','wio'],
  ['liv.','liv bank','emirates nbd liv','liv by emirates nbd'],
  ['yap','yap uae'],
  ['now money','now money uae'],
  ['zand bank','zand'],
  ['nomo bank','nomo'],
  // UAE international
  ['citibank uae','citi uae','citibank dubai'],
  ['hsbc uae','hsbc dubai','hsbc abu dhabi'],
  ['standard chartered uae','stanchart uae','standard chartered dubai'],
  // US
  ['chase','jpmorgan chase','jp morgan'],
  ['citibank','citi','citigroup'],
];

function checkDuplicate(type, data) {
  const n = s => (s||'').toLowerCase().trim();
  if (type === 'bank') {
    const nm = n(data.bankName);
    const grp = _BANK_ALIAS_GROUPS.find(g => g.some(a => a === nm || nm.includes(a) || a.includes(nm)));
    const ex = (S.banks||[]).find(b => {
      const bn = n(b.bankName);
      if (bn === nm) return true;
      if (grp && grp.some(a => a === bn)) return true;
      return false;
    });
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: "${ex.bankName}" already exists. Save anyway?` };
  }
  if (type === 'card') {
    const ex = (S.cards||[]).find(c => n(c.cardName) === n(data.cardName) && (c.last4||'') === (data.last4||''));
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: "${ex.cardName}"${ex.last4?' ****'+ex.last4:''} already exists. Save anyway?` };
  }
  if (type === 'sim') {
    const ph = s => (s||'').replace(/\D/g,'').slice(-7);
    const ex = (S.sims||[]).find(s => n(s.network) === n(data.network) && ph(s.phone) && ph(data.phone) && ph(s.phone) === ph(data.phone));
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: ${ex.network} ${ex.phone} already exists. Save anyway?` };
  }
  if (type === 'email') {
    const ex = (S.emails||[]).find(e => n(e.email) === n(data.email));
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: "${ex.email}" already exists. Save anyway?` };
  }
  if (type === 'investment') {
    const nm = n(data.investmentName);
    const ex = (S.investments||[]).find(i => {
      const iv = n(i.investmentName);
      return iv === nm || (nm && iv && (nm.includes(iv) || iv.includes(nm)));
    });
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: "${ex.investmentName}" already exists. Save anyway?` };
  }
  return { isDuplicate:false };
}

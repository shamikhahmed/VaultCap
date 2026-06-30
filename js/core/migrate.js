// VaultCap — schema migration (extracted from app.js; requires Store)

// ===================== SCHEMA MIGRATION =====================
const SCHEMA_VERSION = 13;

const Migrate = {
  run() {
    const stored = Store.loadRaw();
    if (!stored) return;
    const sv = stored.schemaVersion || 1;
    if (sv >= SCHEMA_VERSION) return;
    console.log(`VaultCap: migrating schema v${sv} → v${SCHEMA_VERSION}`);
    if (sv < 2 && !stored.modules) {
      stored.modules = { banks:true, cards:true, investments:true, sims:true, assets:true, expenses:true, emails:true, gadgets:true, digital:true, import:true, timeline:true, security:true };
    }
    if (sv < 3 && !stored.wallet) stored.wallet = [];
    if (sv < 4) {
      if (!stored.tags)     stored.tags = [];
      if (!stored.emails)   stored.emails = [];
      if (!stored.gadgets)  stored.gadgets = [];
      if (!stored.digital)  stored.digital = [];
      if (!stored.expenses) stored.expenses = [];
      if (!stored.activity) stored.activity = [];
      if (stored.assets)  stored.assets  = stored.assets.map(a => ({ ...a, assetType: a.assetType || 'other' }));
      if (stored.cards)   stored.cards   = stored.cards.map(c => ({ ...c, issuer: c.issuer || (c.cardName || '').split(' ')[0] }));
    }
    if (sv < 5) {
      const newMods = ['credit','zakat','tax','currency','gold'];
      if (stored.modules) newMods.forEach(id => { if (stored.modules[id] === undefined) stored.modules[id] = true; });
    }
    if (sv < 6) {
      const backfill = (arr, type) => (arr || []).map(item => ({
        id: item.id || Math.random().toString(36).slice(2),
        type: item.type || type,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        tags: item.tags || [],
        linkedEntities: item.linkedEntities || [],
        archived: item.archived || false,
        favorite: item.favorite || false,
        ...item,
      }));
      stored.banks        = backfill(stored.banks,        'bank');
      stored.cards        = backfill(stored.cards,        'card');
      stored.documents    = backfill(stored.documents,    'document');
      stored.investments  = backfill(stored.investments,  'investment');
      stored.cash         = backfill(stored.cash,         'cash');
      stored.loans        = backfill(stored.loans,        'loan');
      stored.vehicles     = backfill(stored.vehicles,     'vehicle');
      stored.assets       = backfill(stored.assets,       'asset');
      stored.friends      = backfill(stored.friends,      'contact');
      stored.sims         = backfill(stored.sims,         'sim');
      stored.emails       = backfill(stored.emails,       'email');
      stored.gadgets      = backfill(stored.gadgets,      'gadget');
      stored.digital      = backfill(stored.digital,      'digital');
      stored.expenses     = backfill(stored.expenses,     'expense');
    }
    if (sv < 7) {
      if (stored.modules && stored.modules.emergency === undefined) stored.modules.emergency = true;
      if (!stored.emergency) stored.emergency = { enabled: false, name: '', phone: '', bloodType: '', allergies: '', emergencyNote: '', showOnLockscreen: false };
    }
    if (sv < 8) {
      if (!stored.bc) stored.bc = [];
      if (!stored.bonds) stored.bonds = [];
      if (stored.modules) {
        if (stored.modules.bc === undefined) stored.modules.bc = true;
        if (stored.modules.bonds === undefined) stored.modules.bonds = true;
      }
      stored.schemaVersion = 8;
    }
    if (sv < 9) {
      const _now9 = new Date().toISOString();
      const _dc9 = (stored.user && stored.user.country) || 'PK';
      ['banks','cards','investments','cash','loans','friends','sims','assets','expenses','emails','gadgets','digital','vehicles','documents','bc','bonds'].forEach(k => {
        if (!Array.isArray(stored[k])) return;
        stored[k] = stored[k].map(item => ({ ownerId: item.ownerId || 'self', country: item.country || _dc9, ...item }));
      });
    }
    if (sv < 10) {
      const _now10 = new Date().toISOString();
      const existingAssetIds = new Set((stored.assets || []).map(a => a.id));
      // Migrate S.vehicles → S.assets with assetType:'vehicle'
      (stored.vehicles || []).forEach(v => {
        if (existingAssetIds.has(v.id)) return;
        stored.assets = stored.assets || [];
        stored.assets.push({
          ...v,
          assetType: 'vehicle',
          name: v.name || ((v.year ? v.year + ' ' : '') + (v.make || '') + ' ' + (v.model || '')).trim() || 'Vehicle',
          ownerId: v.ownerId || 'self',
          country: v.country || (stored.user && stored.user.country) || 'PK',
          tags: v.tags || [],
          createdAt: v.createdAt || _now10,
          updatedAt: _now10,
          _migratedFrom: 'vehicles'
        });
      });
      // Migrate S.gadgets → S.assets with assetType:'electronics'
      (stored.gadgets || []).forEach(g => {
        if (existingAssetIds.has(g.id)) return;
        stored.assets = stored.assets || [];
        stored.assets.push({
          ...g,
          assetType: 'electronics',
          name: g.name || g.brand || 'Device',
          currentValue: g.resaleValue || g.purchasePrice || 0,
          ownerId: g.ownerId || 'self',
          country: g.country || (stored.user && stored.user.country) || 'PK',
          tags: g.tags || [],
          createdAt: g.createdAt || _now10,
          updatedAt: _now10,
          _migratedFrom: 'gadgets'
        });
      });
      // Migrate vo_gold (localStorage) → S.assets with assetType:'precious_metals'
      try {
        const goldItems = JSON.parse(localStorage.getItem('vo_gold') || '[]');
        goldItems.forEach(g => {
          if (existingAssetIds.has(g.id)) return;
          stored.assets = stored.assets || [];
          stored.assets.push({
            ...g,
            assetType: 'precious_metals',
            name: g.label || g.name || ((g.metal === 'silver' ? 'Silver' : 'Gold') + (g.weight ? ' ' + g.weight + (g.unit || 'g') : '')),
            currentValue: 0,
            currency: (stored.user && stored.user.currency) || 'PKR',
            ownerId: 'self',
            country: (stored.user && stored.user.country) || 'PK',
            tags: [],
            createdAt: g.createdAt || _now10,
            updatedAt: _now10,
            _migratedFrom: 'gold'
          });
        });
        localStorage.setItem('vo_gold_migrated', '1');
      } catch(e) {}
      stored.schemaVersion = 10;
      console.log('[VaultCap] Migrated schema v9 → v10: vehicles/gadgets/gold consolidated into assets');
    }
    if (sv < 11) {
      try {
        const fam = JSON.parse(localStorage.getItem('vo_family') || '{"head":null,"members":[]}');
        if (!stored.family) stored.family = { head: null, members: [] };
        if (!stored.family.head && fam.head) stored.family.head = fam.head;
        if ((!stored.family.members || !stored.family.members.length) && fam.members && fam.members.length) {
          stored.family.members = fam.members;
        }
        const now11 = new Date().toISOString();
        if (stored.family.members) {
          stored.family.members = stored.family.members.map(m => ({
            ...m,
            id: m.id || Math.random().toString(36).slice(2),
            banks: (m.banks||[]).map(b => ({ ownerId: m.id||'member', country: b.country||(stored.user&&stored.user.country)||'PK', tags: b.tags||[], createdAt: b.createdAt||now11, updatedAt: now11, ...b })),
            cards: (m.cards||[]).map(c => ({ ownerId: m.id||'member', country: c.country||(stored.user&&stored.user.country)||'PK', tags: c.tags||[], createdAt: c.createdAt||now11, updatedAt: now11, ...c })),
            docs:  (m.docs||[]).map(d => ({ ownerId: m.id||'member', country: d.country||(stored.user&&stored.user.country)||'PK', tags: d.tags||[], createdAt: d.createdAt||now11, updatedAt: now11, ...d })),
          }));
        }
        localStorage.setItem('vo_family_migrated', '1');
        console.log('[VaultCap] Migrated family data v10 → v11');
      } catch(e) {}
      stored.schemaVersion = 11;
    }
    if (sv < 12) {
      const _entityArrays12 = ['banks','cards','investments','cash','loans','documents','assets','friends','sims','emails','gadgets','digital','bc','bonds','expenses'];
      _entityArrays12.forEach(key => {
        if (!Array.isArray(stored[key])) return;
        stored[key] = stored[key].map(item => ({
          ...item,
          owners: item.owners || (item.ownerId ? [item.ownerId] : ['self']),
        }));
      });
      stored.schemaVersion = 12;
      console.log('[VaultCap] Migrated schema v11 → v12: owners array backfilled');
    }
    if (sv < 13) {
      const _now13 = new Date().toISOString();
      const _uc13 = (stored.user && stored.user.country) || 'PK';
      const _cur13 = _uc13 === 'GB' ? 'GBP' : _uc13 === 'AE' ? 'AED' : _uc13 === 'US' ? 'USD' : 'PKR';
      const _fam13 = stored.family || { head: null, members: [] };
      const _familyMembers13 = [];
      const _mkId13 = () => 'fm_' + Math.random().toString(36).slice(2, 10);

      const _migrateEntities13 = (person, memberId) => {
        // Banks (may be string names or full objects)
        if (Array.isArray(person.banks)) {
          person.banks.forEach(b => {
            if (typeof b === 'string') {
              stored.banks = stored.banks || [];
              stored.banks.push({ id: _mkId13(), bankName: b, ownerId: memberId, owners: [memberId], country: _uc13, currency: _cur13, balance: 0, accountType: 'Current', bankType: 'commercial', tags: [], createdAt: _now13, updatedAt: _now13 });
            } else if (b && typeof b === 'object') {
              const exists = (stored.banks || []).some(x => x.id && x.id === b.id);
              if (!exists) {
                stored.banks = stored.banks || [];
                const entry = { id: b.id || _mkId13(), bankName: b.bankName || b.name || 'Bank', ownerId: memberId, owners: [memberId], country: b.country || _uc13, currency: b.currency || _cur13, balance: b.balance || 0, accountType: b.accountType || 'Current', bankType: b.bankType || 'commercial', tags: b.tags || [], createdAt: b.createdAt || _now13, updatedAt: _now13, ...b };
                entry.ownerId = memberId; entry.owners = [memberId];
                stored.banks.push(entry);
              }
            }
          });
        }
        // Cards
        if (Array.isArray(person.cards)) {
          person.cards.forEach(c => {
            if (c && typeof c === 'object') {
              const exists = (stored.cards || []).some(x => x.id && x.id === c.id);
              if (!exists) {
                stored.cards = stored.cards || [];
                const entry = { id: c.id || _mkId13(), cardName: c.name || c.cardName || 'Card', last4: c.last4 || '', network: c.network || '', cardType: c.cardType || 'Debit', ownerId: memberId, owners: [memberId], country: _uc13, currency: _cur13, tags: [], createdAt: c.createdAt || _now13, updatedAt: _now13, ...c };
                entry.ownerId = memberId; entry.owners = [memberId];
                stored.cards.push(entry);
              }
            }
          });
        }
        // Docs (may be {type, number, expiry} or full objects)
        if (Array.isArray(person.docs)) {
          person.docs.forEach(d => {
            if (d && typeof d === 'object') {
              const exists = (stored.documents || []).some(x => x.id && x.id === d.id);
              if (!exists) {
                const _dtMap = { 'CNIC':'nic','NIC':'nic','Passport':'passport','passport':'passport','NTN':'tax','Driving License':'driving_license','Emirates ID':'nic','Iqama':'nic','Birth Certificate':'certificate','Other':'other' };
                const docType = d.docType || _dtMap[d.type] || 'other';
                stored.documents = stored.documents || [];
                const entry = { id: d.id || _mkId13(), docType, holderName: person.name || '', docNumber: d.number || d.docNumber || '', expiryDate: d.expiry || d.expiryDate || '', issuingCountry: d.issuingCountry || _uc13, ownerId: memberId, owners: [memberId], country: _uc13, tags: [], createdAt: d.createdAt || _now13, updatedAt: _now13, ...d };
                entry.ownerId = memberId; entry.owners = [memberId];
                stored.documents.push(entry);
              }
            }
          });
        }
        // Cash
        if (Array.isArray(person.cash)) {
          person.cash.forEach(c => {
            if (c && typeof c === 'object') {
              const exists = (stored.cash || []).some(x => x.id && x.id === c.id);
              if (!exists) {
                stored.cash = stored.cash || [];
                stored.cash.push({ id: c.id || _mkId13(), location: c.label || c.location || 'Other', amount: c.amount || 0, currency: c.currency || _cur13, notes: c.notes || '', ownerId: memberId, owners: [memberId], country: _uc13, tags: [], createdAt: c.createdAt || _now13, updatedAt: _now13 });
              }
            }
          });
        }
      };

      // Process head
      if (_fam13.head && _fam13.head.name) {
        const headId = _fam13.head.id || _mkId13();
        _familyMembers13.push({ id: headId, name: _fam13.head.name, avatar: _fam13.head.avatar || '👤', relation: 'Head of Family', isHead: true, dob: _fam13.head.dob || '', phone: _fam13.head.phone || '', email: _fam13.head.email || '', notes: _fam13.head.notes || '', createdAt: _fam13.head.createdAt || _now13, updatedAt: _now13 });
        _migrateEntities13(_fam13.head, headId);
      }
      // Process members
      (_fam13.members || []).forEach(m => {
        if (!m || !m.name) return;
        const memberId = m.id || _mkId13();
        _familyMembers13.push({ id: memberId, name: m.name, avatar: m.avatar || '👤', relation: m.relation || '', isHead: false, dob: m.dob || '', phone: m.phone || '', email: m.email || '', notes: m.notes || '', createdAt: m.createdAt || _now13, updatedAt: _now13 });
        _migrateEntities13(m, memberId);
      });

      stored.familyMembers = _familyMembers13;
      // Keep S.family but empty entity arrays to prevent double reads
      if (stored.family) {
        if (stored.family.head) stored.family.head = { ...stored.family.head, banks: [], cards: [], docs: [], cash: [] };
        if (stored.family.members) stored.family.members = stored.family.members.map(m => ({ ...m, banks: [], cards: [], docs: [], cash: [] }));
      }
      stored.schemaVersion = 13;
      console.log('[VaultCap] Migrated schema v12 → v13: family members flattened into S.familyMembers');
    }
    if (stored.cards) {
      stored.cards = stored.cards.map(c => {
        if (c.creditLimit && !c.limit) return { ...c, limit: c.creditLimit };
        return c;
      });
    }
    stored.schemaVersion = SCHEMA_VERSION;
    // Write back to localStorage only during migration phase (before VaultDB is active)
    try { localStorage.setItem('vos3', JSON.stringify(stored)); } catch(e) {}
  },

  // Run family v13 migration on live S state (called after VaultDB load if needed)
  _runFamilyV13(store) {
    const _now = new Date().toISOString();
    const _uc = (store.user && store.user.country) || 'PK';
    const _cur = _uc === 'GB' ? 'GBP' : _uc === 'AE' ? 'AED' : _uc === 'US' ? 'USD' : 'PKR';
    const _fam = store.family || { head: null, members: [] };
    const _mkId = () => 'fm_' + Math.random().toString(36).slice(2, 10);
    const newMembers = [];

    const _migrate = (person, memberId) => {
      if (Array.isArray(person.banks)) {
        person.banks.forEach(b => {
          if (typeof b === 'string') {
            store.banks = store.banks || [];
            store.banks.push({ id: _mkId(), bankName: b, ownerId: memberId, owners: [memberId], country: _uc, currency: _cur, balance: 0, accountType: 'Current', bankType: 'commercial', tags: [], createdAt: _now, updatedAt: _now });
          } else if (b && typeof b === 'object') {
            const exists = (store.banks || []).some(x => x.id && x.id === b.id);
            if (!exists) {
              store.banks = store.banks || [];
              const entry = { ...b, id: b.id || _mkId(), ownerId: memberId, owners: [memberId] };
              store.banks.push(entry);
            }
          }
        });
      }
      if (Array.isArray(person.cards)) {
        person.cards.forEach(c => {
          if (c && typeof c === 'object') {
            const exists = (store.cards || []).some(x => x.id && x.id === c.id);
            if (!exists) {
              store.cards = store.cards || [];
              store.cards.push({ id: c.id || _mkId(), cardName: c.name || c.cardName || 'Card', last4: c.last4 || '', network: c.network || '', cardType: c.cardType || 'Debit', ownerId: memberId, owners: [memberId], country: _uc, currency: _cur, tags: [], createdAt: _now, updatedAt: _now, ...c, ownerId: memberId, owners: [memberId] });
            }
          }
        });
      }
      if (Array.isArray(person.docs)) {
        person.docs.forEach(d => {
          if (d && typeof d === 'object') {
            const exists = (store.documents || []).some(x => x.id && x.id === d.id);
            if (!exists) {
              const _dtMap = { 'CNIC':'nic','NIC':'nic','Passport':'passport','NTN':'tax','Driving License':'driving_license','Emirates ID':'nic','Birth Certificate':'certificate','Other':'other' };
              const docType = d.docType || _dtMap[d.type] || 'other';
              store.documents = store.documents || [];
              store.documents.push({ id: d.id || _mkId(), docType, holderName: person.name || '', docNumber: d.number || d.docNumber || '', expiryDate: d.expiry || d.expiryDate || '', issuingCountry: _uc, ownerId: memberId, owners: [memberId], country: _uc, tags: [], createdAt: _now, updatedAt: _now, ...d, ownerId: memberId, owners: [memberId] });
            }
          }
        });
      }
      if (Array.isArray(person.cash)) {
        person.cash.forEach(c => {
          if (c && typeof c === 'object') {
            const exists = (store.cash || []).some(x => x.id && x.id === c.id);
            if (!exists) {
              store.cash = store.cash || [];
              store.cash.push({ id: c.id || _mkId(), location: c.label || c.location || 'Other', amount: c.amount || 0, currency: c.currency || _cur, notes: c.notes || '', ownerId: memberId, owners: [memberId], country: _uc, tags: [], createdAt: _now, updatedAt: _now });
            }
          }
        });
      }
    };

    if (_fam.head && _fam.head.name) {
      const headId = _fam.head.id || _mkId();
      newMembers.push({ id: headId, name: _fam.head.name, avatar: _fam.head.avatar || '👤', relation: 'Head of Family', isHead: true, dob: _fam.head.dob || '', phone: _fam.head.phone || '', email: _fam.head.email || '', notes: _fam.head.notes || '', createdAt: _now, updatedAt: _now });
      _migrate(_fam.head, headId);
    }
    (_fam.members || []).forEach(m => {
      if (!m || !m.name) return;
      const memberId = m.id || _mkId();
      newMembers.push({ id: memberId, name: m.name, avatar: m.avatar || '👤', relation: m.relation || '', isHead: false, dob: m.dob || '', phone: m.phone || '', email: m.email || '', notes: m.notes || '', createdAt: _now, updatedAt: _now });
      _migrate(m, memberId);
    });

    store.familyMembers = newMembers;
    if (store.family) {
      if (store.family.head) store.family.head = { ...store.family.head, banks: [], cards: [], docs: [], cash: [] };
      if (store.family.members) store.family.members = store.family.members.map(m => ({ ...m, banks: [], cards: [], docs: [], cash: [] }));
    }
    console.log('[VaultCap] Live migration: family → familyMembers (' + newMembers.length + ' members)');
  }
};

window.SCHEMA_VERSION = SCHEMA_VERSION;
window.Migrate = Migrate;

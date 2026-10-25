'use strict';
/**
 * Record id policy — ids must match /^[A-Za-z0-9_-]{1,64}$/.
 * Enforce on every path data enters S; reject unsafe ids in Act strings.
 */

const IdPolicy = {
  RE: /^[A-Za-z0-9_-]{1,64}$/,

  ENTITY_KEYS: [
    'banks', 'cards', 'investments', 'cash', 'loans', 'friends', 'sims', 'assets',
    'expenses', 'bills', 'emails', 'gadgets', 'digital', 'documents', 'vehicles',
    'bc', 'bonds', 'trash', 'familyMembers', 'activity',
  ],

  REF_KEYS: ['ownerId', 'linkedBankId', 'friendId', 'fromId'],

  isSafe(id) {
    return this.RE.test(String(id ?? ''));
  },

  /** Act / data-act string helper — rejects anything outside the policy. */
  actId(id) {
    const s = String(id ?? '');
    return this.RE.test(s) ? s : '';
  },

  newId() {
    return 'i' + Date.now() + Math.random().toString(36).slice(2, 5);
  },

  /**
   * Sanitize a vault-shaped object in place. Non-conforming ids are regenerated;
   * cross-references (ownerId, linkedBankId, wallet, …) stay consistent via a shared map.
   * @returns {{ remapped: number }}
   */
  sanitizeVault(data) {
    if (!data || typeof data !== 'object') return { remapped: 0 };
    const map = new Map();
    const used = new Set();
    const self = this;

    function mapId(id) {
      if (id == null || id === '') return id;
      const s = String(id);
      if (self.RE.test(s)) {
        used.add(s);
        // Keep the original value and type: legacy records use numeric ids (Date.now()) and
        // lookups compare with ===, so stringifying a valid id would break them.
        return id;
      }
      if (map.has(s)) return map.get(s);
      let neu;
      do {
        neu = self.newId();
      } while (used.has(neu) || [...map.values()].includes(neu));
      used.add(neu);
      map.set(s, neu);
      return neu;
    }

    function touchEntity(item) {
      if (!item || typeof item !== 'object') return;
      if (Object.prototype.hasOwnProperty.call(item, 'id')) item.id = mapId(item.id);
      for (let i = 0; i < self.REF_KEYS.length; i++) {
        const k = self.REF_KEYS[i];
        if (item[k] != null && item[k] !== '') item[k] = mapId(item[k]);
      }
      if (Array.isArray(item.owners)) {
        item.owners = item.owners.map(function (o) { return mapId(o); });
      }
      if (Array.isArray(item.linkedEntities)) {
        item.linkedEntities = item.linkedEntities.map(function (le) {
          if (typeof le === 'string') return mapId(le);
          if (le && typeof le === 'object' && le.id != null) le.id = mapId(le.id);
          return le;
        });
      }
    }

    for (let i = 0; i < this.ENTITY_KEYS.length; i++) {
      const key = this.ENTITY_KEYS[i];
      if (!Array.isArray(data[key])) continue;
      if (key === 'trash') {
        data[key].forEach(function (t) {
          if (!t || typeof t !== 'object') return;
          if (Object.prototype.hasOwnProperty.call(t, 'id')) t.id = mapId(t.id);
          if (t.data) touchEntity(t.data);
        });
        continue;
      }
      data[key].forEach(touchEntity);
    }

    if (data.family && typeof data.family === 'object') {
      if (data.family.head) touchEntity(data.family.head);
      if (Array.isArray(data.family.members)) data.family.members.forEach(touchEntity);
    }

    if (Array.isArray(data.wallet)) {
      data.wallet = data.wallet.map(function (w) { return mapId(w); });
    }

    return { remapped: map.size };
  },
};

window.IdPolicy = IdPolicy;

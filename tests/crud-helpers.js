// @ts-check

/** Purge trash entries created during CRUD tests by matching name field. */
function purgeTrashByName(name) {
  S.trash = (S.trash || []).filter((t) => {
    const d = t.data || {};
    const n = d.bankName || d.name || d.network || d.person || d.serviceName || d.investmentName || d.cardName || d.email || '';
    return !String(n).includes(name);
  });
}

/**
 * Generic create → update → delete via real module save() + DOM fields.
 * @param {object} opts
 */
function runCrudRoundTrip(opts) {
  window.__vos_confirm = () => true;
  const tag = opts.tagPrefix + ' ' + Date.now();
  const updated = tag + ' Updated';

  opts.openAdd();
  opts.fillCreate(tag);
  opts.save();
  if (typeof Modal !== 'undefined' && document.querySelector('.modal-overlay.on')) Modal.close();

  let item = opts.findByName(tag);
  if (!item) return { ok: false, step: 'create', tag };

  const id = item.id;
  opts.edit(id);
  opts.fillUpdate(updated);
  opts.save(id);
  if (typeof Modal !== 'undefined' && document.querySelector('.modal-overlay.on')) Modal.close();

  item = opts.findById(id);
  if (!item || opts.getName(item) !== updated) return { ok: false, step: 'update', tag };

  opts.del(id, true);
  if (opts.findById(id)) return { ok: false, step: 'delete', tag };

  purgeTrashByName(tag);
  purgeTrashByName(updated);
  return { ok: true, tag };
}

module.exports = { runCrudRoundTrip };

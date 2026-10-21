'use strict';
/* VaultCap — ComboPicker
 * iOS WKWebView renders <input list="…"> as keyboard QuickType suggestions only (no drop-down),
 * so long lists (banks, document types, account types, networks…) were hard to pick from.
 * Every input[list] is upgraded automatically into a searchable drop-down:
 *  - tap the field or its chevron → full list; type → filtered (prefix matches first)
 *  - options are read live from the original <datalist>, so code that rewrites a datalist
 *    (e.g. banks per country) keeps working
 *  - picking dispatches `input` + `change`, so existing data-act-input handlers (autofill) still run
 *  - free text is still allowed (datalist semantics)
 */
const ComboPicker = (() => {
  const MAX_ROWS = 80;
  let open = null; // { input, panel, items, active }

  function optionsFor(input) {
    const dl = document.getElementById(input.dataset.vcList || '');
    if (!dl) return [];
    const seen = new Set();
    const out = [];
    dl.querySelectorAll('option').forEach((o) => {
      const v = (o.value || o.textContent || '').trim();
      if (!v || seen.has(v.toLowerCase())) return;
      seen.add(v.toLowerCase());
      const label = (o.label && o.label !== v) ? o.label : '';
      out.push({ value: v, label });
    });
    return out;
  }

  function filter(list, q) {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    const starts = [], contains = [];
    list.forEach((o) => {
      const v = o.value.toLowerCase(), l = o.label.toLowerCase();
      if (v.startsWith(s) || l.startsWith(s)) starts.push(o);
      else if (v.includes(s) || l.includes(s)) contains.push(o);
    });
    return starts.concat(contains);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function render() {
    if (!open) return;
    const { input, panel } = open;
    const all = optionsFor(input);
    const q = input.dataset.vcShowAll === '1' ? '' : input.value;
    const items = filter(all, q).slice(0, MAX_ROWS);
    open.items = items;
    open.active = -1;
    if (!items.length) {
      panel.innerHTML = all.length
        ? '<div class="vc-combo-empty">No match — your text will be saved as typed</div>'
        : '';
      panel.hidden = !all.length;
      return;
    }
    panel.hidden = false;
    const cur = input.value.trim().toLowerCase();
    panel.innerHTML = items.map((o, i) =>
      `<div class="vc-combo-opt${o.value.toLowerCase() === cur ? ' is-sel' : ''}" role="option" id="${input.id || 'vcc'}-opt-${i}" data-i="${i}" aria-selected="${o.value.toLowerCase() === cur}">` +
      `<span class="vc-combo-v">${esc(o.value)}</span>${o.label ? `<span class="vc-combo-l">${esc(o.label)}</span>` : ''}</div>`
    ).join('');
  }

  function show(input, showAll) {
    if (open && open.input !== input) hide();
    if (!open) {
      const panel = document.createElement('div');
      panel.className = 'vc-combo-panel';
      panel.setAttribute('role', 'listbox');
      panel.id = (input.id || 'vcc') + '-listbox';
      input.setAttribute('aria-controls', panel.id);
      (input.closest('.vc-combo') || input).insertAdjacentElement('afterend', panel);
      // pointerdown keeps focus in the input (no keyboard flicker) and selects before blur
      panel.addEventListener('pointerdown', (e) => {
        const row = e.target.closest('.vc-combo-opt');
        if (!row) return;
        e.preventDefault();
        pick(Number(row.dataset.i));
      });
      open = { input, panel, items: [], active: -1 };
      input.setAttribute('aria-expanded', 'true');
      input.closest('.fg, .fr, label, div')?.classList.add('vc-combo-open');
    }
    input.dataset.vcShowAll = showAll ? '1' : '';
    render();
    // keep the list visible above the iOS keyboard
    setTimeout(() => { try { open && open.panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }, 60);
  }

  function hide() {
    if (!open) return;
    open.input.setAttribute('aria-expanded', 'false');
    open.input.removeAttribute('aria-activedescendant');
    open.input.closest('.vc-combo-open')?.classList.remove('vc-combo-open');
    open.panel.remove();
    open = null;
  }

  function pick(i) {
    if (!open) return;
    const o = open.items[i];
    if (!o) return;
    const input = open.input;
    input.value = o.value;
    input.dataset.vcShowAll = '';
    hide();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    try { if (typeof Haptic !== 'undefined' && Haptic.tap) Haptic.tap(); } catch (e) {}
  }

  function move(d) {
    if (!open || !open.items.length) return;
    open.active = (open.active + d + open.items.length) % open.items.length;
    open.panel.querySelectorAll('.vc-combo-opt').forEach((el, i) => el.classList.toggle('is-active', i === open.active));
    const el = open.panel.querySelector('.is-active');
    if (el) { el.scrollIntoView({ block: 'nearest' }); open.input.setAttribute('aria-activedescendant', el.id); }
  }

  function enhance(input) {
    if (!input || input.dataset.vcCombo) return;
    const id = input.getAttribute('list');
    if (!id) return;
    input.dataset.vcCombo = '1';
    input.dataset.vcList = id;
    input.removeAttribute('list'); // stop iOS QuickType-only suggestions duplicating the list
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('spellcheck', 'false');
    input.classList.add('vc-combo-input');
    const wrap = document.createElement('span');
    wrap.className = 'vc-combo';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vc-combo-btn';
    btn.tabIndex = -1;
    btn.setAttribute('aria-label', 'Show all options');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (open && open.input === input) { hide(); return; }
      input.focus({ preventScroll: true });
      show(input, true);
    });
    wrap.appendChild(btn);
    input.addEventListener('focus', () => show(input, !input.value));
    input.addEventListener('click', () => { if (!open) show(input, !input.value); });
    input.addEventListener('input', (e) => {
      if (!e.isTrusted) return; // our own dispatch after pick
      input.dataset.vcShowAll = '';
      if (open && open.input === input) render(); else show(input, false);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) show(input, true); else move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' && open && open.active >= 0) { e.preventDefault(); pick(open.active); }
      else if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); hide(); }
    });
    input.addEventListener('blur', () => setTimeout(() => { if (open && open.input === input && document.activeElement !== input) hide(); }, 120));
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.matches && root.matches('input[list]')) enhance(root);
    root.querySelectorAll('input[list]').forEach(enhance);
  }

  function init() {
    scan(document.body);
    new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => { if (n.nodeType === 1) scan(n); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { enhance, hide, scan };
})();

window.ComboPicker = ComboPicker;

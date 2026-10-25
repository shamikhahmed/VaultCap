'use strict';
/* UIKit — vanilla HTML-string kit over css/design/system.css (`ui-*` primitives).
 * Port of ScentCap 3.0 `src/components/kit` for VaultCap's string-rendered screens.
 * Every helper returns trusted markup: pass user data through UIKit.esc() first. Docs: DESIGN.md. */

const UIKit = {
  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  _icon(name, size) {
    return name && typeof VC !== 'undefined' ? VC.icon(name, size || 20) : '';
  },

  /** Large-title header (top-level screens). */
  header({ eyebrow = '', title = '', subtitle = '', trailing = '' } = {}) {
    return '<header class="ui-header"><div style="min-width:0">' +
      (eyebrow ? '<p class="ui-eyebrow">' + eyebrow + '</p>' : '') +
      '<h1 class="ui-largetitle">' + title + '</h1>' +
      (subtitle ? '<p class="ui-secondary" style="margin-top:4px;font-size:var(--t-subhead)">' + subtitle + '</p>' : '') +
      '</div>' + (trailing ? '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;padding-bottom:4px">' + trailing + '</div>' : '') +
      '</header>';
  },

  /** Section with title + optional trailing link ({label, act}). */
  section({ title = '', action = null, id = '' } = {}, body = '') {
    const head = (title || action)
      ? '<div class="ui-section-head">' +
        (title ? '<h2 class="ui-section-title"' + (id ? ' id="' + id + '"' : '') + '>' + title + '</h2>' : '') +
        (action ? '<button type="button" class="ui-section-link ui-btn--plain" style="background:none;border:0;cursor:pointer;font:inherit;font-size:var(--t-subhead)" data-act="' + action.act + '">' + action.label + this._icon('chevron-right', 16) + '</button>' : '') +
        '</div>'
      : '';
    return '<section class="ui-section"' + (id ? ' aria-labelledby="' + id + '"' : '') + '>' + head + body + '</section>';
  },

  /** Inset grouped list. rows: array of row() strings. */
  list(rows, { header = '', footer = '', label = '' } = {}) {
    return (header ? '<p class="ui-list-header">' + header + '</p>' : '') +
      '<div class="ui-list"' + (label ? ' role="list" aria-label="' + this.esc(label) + '"' : '') + '>' + rows.join('') + '</div>' +
      (footer ? '<p class="ui-list-footer">' + footer + '</p>' : '');
  },

  /** List row. Tappable when act is set (renders a <button>). */
  row({ icon = '', iconColor = '', title = '', sub = '', value = '', valueClass = '', act = '', chevron = !!act, aria = '' } = {}) {
    const ic = icon
      ? '<span class="ui-row__icon" aria-hidden="true"' + (iconColor ? ' style="color:' + iconColor + '"' : '') + '>' + this._icon(icon, 20) + '</span>'
      : '';
    const inner = ic +
      '<span class="ui-row__main"><span class="ui-row__title" style="display:block">' + title + '</span>' +
      (sub ? '<span class="ui-row__sub" style="display:block">' + sub + '</span>' : '') + '</span>' +
      (value !== '' ? '<span class="ui-row__value ' + valueClass + '">' + value + '</span>' : '') +
      (chevron ? '<span class="ui-chevron" aria-hidden="true">' + this._icon('chevron-right', 16) + '</span>' : '');
    const cls = 'ui-row' + (icon ? ' ui-row--icon' : '');
    return act
      ? '<button type="button" class="' + cls + '" data-act="' + act + '"' + (aria ? ' aria-label="' + this.esc(aria) + '"' : '') + '>' + inner + '</button>'
      : '<div class="' + cls + '" role="listitem">' + inner + '</div>';
  },

  /** Dashboard tile. */
  widget({ icon = '', label = '', value = '', unit = '', act = '', sub = '', sens = false } = {}) {
    const body = '<span class="ui-widget__label">' + this._icon(icon, 16) + label + '</span>' +
      '<span class="ui-widget__value' + (sens ? ' sens' : '') + '">' + value + (unit ? '<span class="ui-widget__unit">' + unit + '</span>' : '') + '</span>' +
      (sub ? '<span class="ui-footnote">' + sub + '</span>' : '');
    return act
      ? '<button type="button" class="ui-widget" data-act="' + act + '" style="border:0;font:inherit;text-align:left;cursor:pointer">' + body + '</button>'
      : '<div class="ui-widget">' + body + '</div>';
  },

  meter(pct, color) {
    const v = Math.max(0, Math.min(100, Number(pct) || 0));
    return '<span class="ui-meter" role="presentation"><span style="width:' + v + '%' + (color ? ';background:' + color : '') + '"></span></span>';
  },

  /** Segmented control. items: [{value,label}]; actFor(value) → data-act string. */
  segmented(items, current, actFor, label = '') {
    return '<div class="ui-segmented" role="group"' + (label ? ' aria-label="' + this.esc(label) + '"' : '') + '>' +
      items.map((it) => '<button type="button" aria-pressed="' + (it.value === current) + '" data-act="' + actFor(it.value) + '">' + it.label + '</button>').join('') +
      '</div>';
  },
};

window.UIKit = UIKit;

'use strict';
/* NetWorthHistory — daily net-worth snapshots + sparkline widget */

const NetWorthHistory = (() => {
  const MAX_ENTRIES = 365;

  function _today() {
    return new Date().toISOString().slice(0, 10);
  }

  function _normalizeEntry(h) {
    if (!h) return null;
    const date = h.d || h.date;
    const value = typeof h.v === 'number' ? h.v : (typeof h.value === 'number' ? h.value : NaN);
    if (!date || isNaN(value)) return null;
    return { d: date, v: value, base: h.base || 'PKR' };
  }

  function _history() {
    if (!S.user) S.user = {};
    if (!Array.isArray(S.user.nwHistory)) S.user.nwHistory = [];
    return S.user.nwHistory;
  }

  function _currentValue() {
    try {
      if (typeof CurrencyEngine !== 'undefined' && CurrencyEngine.computeNetWorthPKR) {
        return CurrencyEngine.computeNetWorthPKR().nwPKR;
      }
    } catch (e) { /* fall through */ }
    return Number(S.user?.netWorth) || 0;
  }

  function record() {
    if (typeof S === 'undefined' || !S.unlocked) return null;
    const hist = _history();
    const today = _today();
    const value = _currentValue();
    const last = hist.length ? _normalizeEntry(hist[hist.length - 1]) : null;

    if (last && last.d === today) {
      hist[hist.length - 1] = { v: value, d: today, base: 'PKR' };
    } else {
      hist.push({ v: value, d: today, base: 'PKR' });
    }

    while (hist.length > MAX_ENTRIES) hist.shift();

    if (typeof Store !== 'undefined') Store.save();
    return { date: today, value };
  }

  function onUnlock() {
    try { record(); } catch (e) { console.warn('[NetWorthHistory] onUnlock', e); }
  }

  function _sortedPoints() {
    return _history()
      .map(_normalizeEntry)
      .filter(Boolean)
      .sort((a, b) => a.d.localeCompare(b.d));
  }

  function chartHtml(width) {
    const w = Math.max(120, Number(width) || 280);
    const h = 56;
    const pad = 4;
    const pts = _sortedPoints();
    if (pts.length < 2) {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">'
        + '<line x1="' + pad + '" y1="' + (h / 2) + '" x2="' + (w - pad) + '" y2="' + (h / 2) + '" stroke="var(--border)" stroke-width="1" stroke-dasharray="4 4"/>'
        + '</svg>';
    }

    const vals = pts.map(p => p.v);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;

    const coords = pts.map((p, i) => {
      const x = pad + (pts.length === 1 ? innerW / 2 : (i / (pts.length - 1)) * innerW);
      const y = pad + innerH - ((p.v - min) / range) * innerH;
      return x.toFixed(1) + ',' + y.toFixed(1);
    });

    const last = pts[pts.length - 1];
    const first = pts[0];
    const trendUp = last.v >= first.v;
    const stroke = trendUp ? 'var(--ok)' : 'var(--err)';
    const fill = trendUp ? 'rgba(0,255,136,.12)' : 'rgba(255,64,96,.12)';
    const poly = coords.join(' ');
    const area = pad + ',' + (h - pad) + ' ' + poly + ' ' + (w - pad) + ',' + (h - pad);

    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Net worth trend">'
      + '<polygon points="' + area + '" fill="' + fill + '"/>'
      + '<polyline points="' + poly + '" fill="none" stroke="' + stroke + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      + '</svg>';
  }

  function renderWidget() {
    const pts = _sortedPoints();
    const cur = _currentValue();
    const dispCur = (S.user && S.user.currency) || 'PKR';
    const fmt = typeof U !== 'undefined' && U.fmtCur
      ? U.fmtCur(cur, dispCur)
      : String(Math.round(cur));

    let deltaHtml = '';
    if (pts.length >= 2) {
      const first = pts[0].v;
      const diff = cur - first;
      const pct = first ? ((diff / Math.abs(first)) * 100) : 0;
      const sign = diff >= 0 ? '+' : '';
      const col = diff >= 0 ? 'var(--ok)' : 'var(--err)';
      deltaHtml = '<div style="font-size:11px;color:' + col + ';margin-top:4px">' + sign
        + (typeof U !== 'undefined' ? U.fmtCur(Math.abs(diff), dispCur) : Math.abs(diff).toLocaleString())
        + ' (' + sign + pct.toFixed(1) + '%) over ' + pts.length + 'd</div>';
    }

    return '<div class="widget" id="nwHistoryWidget">'
      + '<div class="wh"><span class="vc-icon-wrap">' + (typeof VC !== 'undefined' ? VC.icon('chart', 16) : '') + '</span>Net Worth Trend</div>'
      + '<div style="padding:12px 14px 14px;display:flex;gap:14px;align-items:center">'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em">Today</div>'
      + '<div style="font-size:22px;font-weight:900;color:var(--accent)" class="sens">' + fmt + '</div>'
      + deltaHtml
      + '</div>'
      + '<div style="flex-shrink:0">' + chartHtml(140) + '</div>'
      + '</div></div>';
  }

  return {
    record,
    onUnlock,
    chartHtml,
    renderWidget,
    MAX_ENTRIES,
  };
})();

window.NetWorthHistory = NetWorthHistory;

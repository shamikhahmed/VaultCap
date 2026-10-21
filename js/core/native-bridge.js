// VaultCap — © 2026 Capricorn Systems. Source-available. See LICENSE.
// Native bridge: one small API over the Capacitor iOS plugins, with web fallbacks.
// The bundle cannot import @capacitor/* ESM, so plugins are reached through the
// globals the native shell injects (Capacitor.Plugins.X, or Capacitor.registerPlugin
// when @capacitor/core is present). Never log file contents or clipboard text.
(function () {
  'use strict';

  var pluginCache = {};
  var clipboardTimer = null;

  function cap() {
    return window.Capacitor || null;
  }

  function isNative() {
    return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
  }

  function plugin(name) {
    if (pluginCache[name]) return pluginCache[name];
    var c = cap();
    if (!c) return null;
    var p = null;
    try {
      if (typeof c.registerPlugin === 'function') p = c.registerPlugin(name);
    } catch (e) {
      p = null;
    }
    if (!p && c.Plugins && c.Plugins[name]) p = c.Plugins[name];
    if (p) pluginCache[name] = p;
    return p;
  }

  function errText(e) {
    if (!e) return 'Unknown error';
    if (typeof e === 'string') return e;
    return String(e.message || e.errorMessage || e.code || 'Unknown error');
  }

  function isCancel(e) {
    return /cancel/i.test(errText(e));
  }

  function safeFilename(name) {
    var s = String(name || '').replace(/[\/\\:\u0000-\u001f]/g, '_').trim();
    return s || 'VaultCap-export';
  }

  function bytesToBase64(bytes) {
    var bin = '';
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }

  // Filesystem.writeFile takes utf8 text, or base64 when no encoding is passed.
  async function toWritePayload(data) {
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      return { data: bytesToBase64(new Uint8Array(await data.arrayBuffer())) };
    }
    if (data instanceof ArrayBuffer) return { data: bytesToBase64(new Uint8Array(data)) };
    if (ArrayBuffer.isView(data)) {
      return { data: bytesToBase64(new Uint8Array(data.buffer, data.byteOffset, data.byteLength)) };
    }
    return { data: data == null ? '' : String(data), encoding: 'utf8' };
  }

  function webDownload(filename, mime, data) {
    var b = data instanceof Blob ? data : new Blob([data == null ? '' : data], { type: mime || 'application/octet-stream' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /**
   * Save a file and hand it to the user.
   * Native: write to Caches, open the iOS share sheet (Save to Files, AirDrop…), delete the temp file.
   * Web: blob + <a download>.
   * @returns {Promise<{ok:true, shared:boolean} | {ok:false, cancelled:true} | {ok:false, error:string}>}
   */
  async function saveAndShare(opts) {
    var o = opts || {};
    var filename = safeFilename(o.filename);
    if (!isNative()) {
      try {
        webDownload(filename, o.mime, o.data);
        return { ok: true, shared: false };
      } catch (e) {
        return { ok: false, error: errText(e) };
      }
    }
    var fs = plugin('Filesystem');
    var share = plugin('Share');
    if (!fs || !share) return { ok: false, error: 'File sharing is unavailable' };
    var written = false;
    try {
      var payload = await toWritePayload(o.data);
      var req = { path: filename, directory: 'CACHE', data: payload.data, recursive: true };
      if (payload.encoding) req.encoding = payload.encoding;
      var res = await fs.writeFile(req);
      written = true;
      var uri = res && res.uri;
      if (!uri) uri = (await fs.getUri({ path: filename, directory: 'CACHE' })).uri;
      await share.share({ title: filename, files: [uri] });
      return { ok: true, shared: true };
    } catch (e) {
      if (isCancel(e)) return { ok: false, cancelled: true };
      return { ok: false, error: errText(e) };
    } finally {
      if (written) {
        try { await fs.deleteFile({ path: filename, directory: 'CACHE' }); } catch (e) { /* temp file; ignore */ }
      }
    }
  }

  /**
   * Print an HTML document.
   * Native: UIPrintInteractionController (AirPrint / Save to PDF via share in the print sheet).
   * Web: new window + print(); completion is unknown there (completed: null).
   * @returns {Promise<{ok:true, completed:boolean|null} | {ok:false, error:string}>}
   */
  async function printHTML(opts) {
    var o = opts || {};
    var html = o.html == null ? '' : String(o.html);
    var jobName = String(o.jobName || 'VaultCap');
    if (isNative()) {
      var vn = plugin('VaultNative');
      if (!vn) return { ok: false, error: 'Printing is unavailable' };
      try {
        var r = await vn.printHTML({ html: html, jobName: jobName });
        return { ok: !!(r && r.ok), completed: !!(r && r.completed) };
      } catch (e) {
        return { ok: false, error: errText(e) };
      }
    }
    try {
      var w = window.open('', '_blank');
      if (!w) return { ok: false, error: 'Pop-up blocked' };
      w.document.open();
      w.document.write(html);
      w.document.close();
      try { w.document.title = jobName; } catch (e) { /* cross-origin guard */ }
      await new Promise(function (resolve) {
        if (w.document.readyState === 'complete') return setTimeout(resolve, 50);
        w.addEventListener('load', function () { resolve(); }, { once: true });
        setTimeout(resolve, 1500);
      });
      w.focus();
      w.print();
      return { ok: true, completed: null };
    } catch (e) {
      return { ok: false, error: errText(e) };
    }
  }

  function webCopyFallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  async function webWriteClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) { /* fall through */ }
    }
    return webCopyFallback(text);
  }

  /**
   * Copy a secret that must not linger.
   * Native: UIPasteboard item marked localOnly (no Universal Clipboard) that expires after `seconds`.
   * Web: clipboard write, then the clipboard is cleared after `seconds`.
   * @returns {Promise<{ok:true} | {ok:false, error:string}>}
   */
  async function copySecure(opts) {
    var o = opts || {};
    var text = o.text == null ? '' : String(o.text);
    var seconds = Number(o.seconds);
    if (!isFinite(seconds) || seconds <= 0) seconds = 30;
    if (isNative()) {
      var vn = plugin('VaultNative');
      if (vn) {
        try {
          var r = await vn.copySecure({ text: text, seconds: seconds });
          return { ok: !!(r && r.ok) };
        } catch (e) {
          return { ok: false, error: errText(e) };
        }
      }
    }
    try {
      var ok = await webWriteClipboard(text);
      if (!ok) return { ok: false, error: 'Clipboard is unavailable' };
      if (clipboardTimer) clearTimeout(clipboardTimer);
      clipboardTimer = setTimeout(function () {
        clipboardTimer = null;
        webWriteClipboard('').catch(function () { /* best effort */ });
      }, seconds * 1000);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errText(e) };
    }
  }

  /**
   * Match status-bar text to the app theme. 'light' theme → dark text (Style.Light);
   * anything else → light text for dark backgrounds (Style.Dark). Web: no-op.
   * @returns {Promise<{ok:boolean, error?:string}>}
   */
  async function setStatusBarTheme(theme) {
    if (!isNative()) return { ok: true };
    var sb = plugin('StatusBar');
    if (!sb) return { ok: false, error: 'Status bar is unavailable' };
    try {
      await sb.setStyle({ style: theme === 'light' ? 'LIGHT' : 'DARK' });
      await sb.setOverlaysWebView({ overlay: true });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errText(e) };
    }
  }

  /**
   * Open a link outside the vault.
   * Native: http(s) in an in-app Safari sheet; mailto:/tel:/sms: handed to iOS. Web: new tab.
   * @returns {Promise<{ok:boolean, error?:string}>}
   */
  async function openExternal(url) {
    var href = String(url || '').trim();
    var scheme = (/^([a-z][a-z0-9+.-]*):/i.exec(href) || [])[1];
    scheme = scheme ? scheme.toLowerCase() : '';
    var web = scheme === 'http' || scheme === 'https';
    var handoff = scheme === 'mailto' || scheme === 'tel' || scheme === 'sms';
    if (!web && !handoff) return { ok: false, error: 'Unsupported link' };
    try {
      if (isNative()) {
        if (handoff) {
          window.location.href = href;
          return { ok: true };
        }
        var br = plugin('Browser');
        if (!br) return { ok: false, error: 'Browser is unavailable' };
        await br.open({ url: href });
        return { ok: true };
      }
      window.open(href, '_blank', 'noopener');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errText(e) };
    }
  }

  window.VaultNative = Object.freeze({
    isNative: isNative,
    saveAndShare: saveAndShare,
    printHTML: printHTML,
    copySecure: copySecure,
    setStatusBarTheme: setStatusBarTheme,
    openExternal: openExternal
  });
})();

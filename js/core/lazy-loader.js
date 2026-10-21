'use strict';

/** Lazy-load same-origin vendor scripts and optional VaultCap modules on first use. */
const VaultLazy = (() => {
  const _loaded = new Set();
  let _appPromise = null;

  function loadLocal(src) {
    if (_loaded.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => { _loaded.add(src); resolve(); };
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  return {
    xlsx() { return loadLocal('vendor/xlsx.full.min.js'); },
    qrcode() { return loadLocal('vendor/qrcode.min.js'); },
    jsqr() { return loadLocal('vendor/jsQR.min.js'); },
    mammoth() { return loadLocal('vendor/mammoth.browser.min.js'); },
    tesseract() { return loadLocal('vendor/tesseract.min.js'); },
    /** Post-unlock shell: dashboard UI + feature modules (not first-load). */
    app() {
      if (typeof Dash !== 'undefined') return Promise.resolve();
      if (_appPromise) return _appPromise;
      _appPromise = loadLocal('dist/vaultcap.app.js?v=5.3.1').catch((err) => {
        _appPromise = null;
        throw err;
      });
      return _appPromise;
    },
    async smartDb() { return loadLocal('js/core/smart-db.js'); },
    async tax() { await this.app(); return loadLocal('js/modules/tax.js'); },
    async zakat() { await this.app(); return loadLocal('js/modules/zakat.js'); },
    async family() { await this.app(); return loadLocal('js/modules/family.js'); },
    async documents() { await this.app(); return loadLocal('js/modules/documents.js'); },
    async importMod() {
      await this.app();
      return loadLocal('js/modules/ai-import.js');
    },
    async llmStack() {
      await loadLocal('js/config/llm-bundled.js');
      await loadLocal('js/modules/llm-assist.js');
      await loadLocal('js/modules/ai-import.js');
    },
    ensure(kind) {
      const map = {
        xlsx: () => this.xlsx(),
        qrcode: () => this.qrcode(),
        jsqr: () => this.jsqr(),
        mammoth: () => this.mammoth(),
        tesseract: () => this.tesseract(),
        llm: () => this.llmStack(),
        app: () => this.app(),
        smartDb: () => this.smartDb(),
        tax: () => this.tax(),
        zakat: () => this.zakat(),
        family: () => this.family(),
        documents: () => this.documents(),
        import: () => this.importMod(),
      };
      return map[kind] ? map[kind]() : Promise.resolve();
    },
  };
})();

window.VaultLazy = VaultLazy;

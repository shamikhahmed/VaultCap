'use strict';

/** Lazy-load same-origin vendor scripts and optional VaultCap modules on first use. */
const VaultLazy = (() => {
  const _loaded = new Set();

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
    async smartDb() { return loadLocal('js/core/smart-db.js'); },
    tax() { return loadLocal('js/modules/tax.js'); },
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
        smartDb: () => this.smartDb(),
        tax: () => this.tax(),
      };
      return map[kind] ? map[kind]() : Promise.resolve();
    },
  };
})();

window.VaultLazy = VaultLazy;

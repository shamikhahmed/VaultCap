'use strict';

/** Lazy-load heavy CDN and optional VaultCap modules on first use. */
const VaultLazy = (() => {
  const _loaded = new Set();

  function loadScript(src, opts = {}) {
    if (_loaded.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      if (opts.integrity) s.integrity = opts.integrity;
      if (opts.crossOrigin) s.crossOrigin = opts.crossOrigin;
      s.onload = () => { _loaded.add(src); resolve(); };
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

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
    xlsx() {
      return loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
        { integrity: 'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw', crossOrigin: 'anonymous' }
      );
    },
    qrcode() {
      return loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
        { integrity: 'sha384-3zSEDfvllQohrq0PHL1fOXJuC/jSOO34H46t6UQfobFOmxE5BpjjaIJY5F2/bMnU', crossOrigin: 'anonymous' }
      );
    },
    jsqr() {
      return loadScript(
        'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
        { integrity: 'sha384-9Q0jWoineiIq95JeIyBsNV90KKLfDsbkj29k/YFxf76a2JwkHDYkMuSbNGN6XJfV', crossOrigin: 'anonymous' }
      );
    },
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

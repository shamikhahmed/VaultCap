'use strict';
// Smart Import / Smart Add — bundled LLM (included) with Smart Parser fallback.
// Bundled key in js/config/llm-bundled.js. Optional user override in Settings.

const LlmAssist = {
  _bundled() {
    return (typeof window !== 'undefined' && window.VaultOSBundledLlm) ? window.VaultOSBundledLlm : {};
  },

  getConfig() {
    const u = (typeof S !== 'undefined' && S.user) ? S.user : {};
    const b = this._bundled();
    const userKey = (u.llmApiKey || '').trim();
    const key = userKey || (b.apiKey || '').trim();
    const userOff = u.llmEnabled === false;
    const userOn = u.llmEnabled === true;
    const enabled = !userOff && (userOn || b.enabled !== false) && !!key;
    return {
      enabled,
      apiKey: key,
      provider: u.llmProvider || b.provider || 'proxy',
      model: u.llmModel || b.model || 'claude-3-5-haiku-latest',
      proxyUrl: (u.llmProxyUrl || b.proxyUrl || '').trim(),
      bundled: !userKey && !!b.apiKey,
    };
  },

  saveConfig({ enabled, apiKey, provider, model, proxyUrl }) {
    if (typeof S === 'undefined') return;
    if (enabled !== undefined) S.user.llmEnabled = !!enabled;
    if (apiKey !== undefined) S.user.llmApiKey = String(apiKey).trim();
    if (provider !== undefined) S.user.llmProvider = provider;
    if (model !== undefined) S.user.llmModel = model;
    if (proxyUrl !== undefined) S.user.llmProxyUrl = String(proxyUrl).trim();
    if (typeof Store !== 'undefined') Store.save();
  },

  clearKey() {
    this.saveConfig({ apiKey: '', enabled: true });
  },

  async checkProxyHealth() {
    const cfg = this.getConfig();
    const url = (cfg.proxyUrl || '').replace(/\/$/, '');
    if (!url) return { status: 'none', message: 'Smart Parser only — optional assistant in Settings' };
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(`${url}/health`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return { status: 'error', message: `Worker unreachable (HTTP ${res.status})` };
      const body = await res.json().catch(() => ({}));
      return body.ok
        ? { status: 'ok', message: 'Smart Assistant available — enhanced parsing optional' }
        : { status: 'error', message: 'Worker responded but health check failed' };
    } catch (e) {
      const msg = e.name === 'AbortError'
        ? 'Smart Assistant timeout — Smart Parser will be used instead'
        : 'Smart Assistant unreachable — Smart Parser will be used instead';
      return { status: 'error', message: msg };
    }
  },

  renderHealthEl(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const cfg = this.getConfig();
    if (!cfg.proxyUrl) {
      el.style.display = 'none';
      el.textContent = '';
      return;
    }
    el.style.display = '';
    el.textContent = 'Checking Smart Assistant…';
    el.style.color = 'var(--text3)';
    this.checkProxyHealth().then(h => {
      if (!document.getElementById(id)) return;
      if (h.status === 'error') {
        el.textContent = h.message;
        el.style.color = 'var(--warn)';
        return;
      }
      el.textContent = h.message;
      el.style.color = h.status === 'ok' ? 'var(--ok)' : 'var(--text3)';
    });
  },

  async parseText(text) {
    const cfg = this.getConfig();
    if (!cfg.enabled || !cfg.apiKey) return null;
    if (cfg.proxyUrl) {
      const health = await this.checkProxyHealth();
      if (health.status === 'error') {
        const err = new Error('LLM_PROXY_DOWN');
        err.healthMessage = health.message;
        throw err;
      }
    }
    try {
      const raw = await this._call(cfg, text);
      return this._normalize(raw);
    } catch (e) {
      if (e.message === 'LLM_PROXY_DOWN') throw e;
      if (typeof Toast !== 'undefined') Toast.show('Enhanced parsing unavailable — using Smart Parser', 'warning', 3500);
      return null;
    }
  },

  async parseOne(text) {
    const items = await this.parseText(text);
    if (!items || !items.length) return null;
    const best = items[0];
    return { module: best.type === 'expense' ? 'expense' : best.type, fields: best.data || {} };
  },

  async _call(cfg, text) {
    if (cfg.proxyUrl) {
      const res = await fetch(cfg.proxyUrl.replace(/\/$/, '') + '/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + cfg.apiKey,
        },
        body: JSON.stringify({ text, model: cfg.model }),
      });
      if (!res.ok) throw new Error('proxy ' + res.status);
      const j = await res.json();
      if (j.items) return JSON.stringify(j.items);
      throw new Error('proxy empty');
    }
    const sys = 'Extract financial records from user text. Return ONLY valid JSON array. Each item: {"type":"bank|card|loan|document|cash|investment|gold|bc|bond|expense|sim|email","confidence":0-1,"data":{...}}. Use snake_case field names matching: bankName,balance,iban,cardName,last4,expiry,person,amount,dueDate,network,phone,label,investmentName,broker,name. If nothing found return [].';
    if (cfg.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.apiKey },
        body: JSON.stringify({
          model: cfg.model || 'gpt-4o-mini',
          messages: [{ role: 'system', content: sys }, { role: 'user', content: text }],
          temperature: 0.1,
        }),
      });
      if (!res.ok) throw new Error('openai ' + res.status);
      const j = await res.json();
      return j.choices?.[0]?.message?.content || '[]';
    }
    // Anthropic direct (browser) — works with sk-ant-* keys only
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': cfg.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 2048,
        system: sys,
        messages: [{ role: 'user', content: text }],
      }),
    });
    if (!res.ok) throw new Error('anthropic ' + res.status);
    const j = await res.json();
    const block = (j.content || []).find((b) => b.type === 'text');
    return block?.text || '[]';
  },

  _normalize(raw) {
    let parsed;
    try {
      const m = String(raw).match(/\[[\s\S]*\]/);
      parsed = JSON.parse(m ? m[0] : raw);
    } catch (e) {
      return null;
    }
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((x) => x && x.type && x.data)
      .map((x) => ({
        type: x.type,
        confidence: typeof x.confidence === 'number' ? x.confidence : 0.85,
        data: x.data,
      }));
  },
};

window.LlmAssist = LlmAssist;

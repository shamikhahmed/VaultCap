'use strict';
// Optional LLM assist — user supplies API key in Settings. Never hardcoded.
// Falls back to SmartParser when no key or on error.

const LlmAssist = {
  getConfig() {
    const u = (typeof S !== 'undefined' && S.user) ? S.user : {};
    return {
      enabled: !!u.llmEnabled && !!u.llmApiKey,
      apiKey: (u.llmApiKey || '').trim(),
      provider: u.llmProvider || 'anthropic',
      model: u.llmModel || 'claude-sonnet-4-20250514',
    };
  },

  saveConfig({ enabled, apiKey, provider, model }) {
    if (typeof S === 'undefined') return;
    if (enabled !== undefined) S.user.llmEnabled = !!enabled;
    if (apiKey !== undefined) S.user.llmApiKey = String(apiKey).trim();
    if (provider !== undefined) S.user.llmProvider = provider;
    if (model !== undefined) S.user.llmModel = model;
    if (typeof Store !== 'undefined') Store.save();
  },

  clearKey() {
    this.saveConfig({ apiKey: '', enabled: false });
  },

  async parseText(text) {
    const cfg = this.getConfig();
    if (!cfg.enabled || !cfg.apiKey) return null;
    try {
      const raw = await this._call(cfg, text);
      return this._normalize(raw);
    } catch (e) {
      if (typeof Toast !== 'undefined') Toast.show('LLM unavailable — using Smart Parser', 'warning', 3500);
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

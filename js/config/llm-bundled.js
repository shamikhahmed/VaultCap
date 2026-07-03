'use strict';
// Optional LLM proxy — no client API key. Add your key in Settings → Smart Import.
window.VaultOSBundledLlm = {
  enabled: false,
  apiKey: '',
  provider: 'proxy',
  proxyUrl: 'https://vaultos-llm-proxy.shamikhahmed.workers.dev',
  model: 'claude-3-5-haiku-latest',
};

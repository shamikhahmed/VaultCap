'use strict';
// Bundled LLM credentials — included with VaultOS so users need not supply a key.
// SECURITY: Anyone can extract this from a public PWA. Rotate if exposed; prefer worker proxy for production.
window.VaultOSBundledLlm = {
  enabled: true,
  apiKey: 'crsr_e34b48bfc902a67a92f968b82bbdaea10ca6a34726e8f3eb72a1c7d3a806e038',
  provider: 'proxy',
  // Deploy VaultOS/worker/llm-proxy.js then set your workers.dev URL here (or in Settings).
  proxyUrl: 'https://vaultos-llm-proxy.shamikhahmed.workers.dev',
  model: 'claude-3-5-haiku-latest',
};

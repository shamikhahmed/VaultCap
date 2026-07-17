/**
 * VaultOS Privacy Proxy — Cloudflare Worker
 * - POST /parse  — LLM parse (auth required)
 * - GET  /logo?domain=hbl.com&sz=128 — bank logo proxy (no auth)
 *   Server fetches Google/DDG/Clearbit; client never contacts those hosts.
 *
 * Deploy: cd worker && npx wrangler deploy
 * Secret: wrangler secret put LLM_API_KEY
 */
const SYS = `Extract financial records from user text. Return ONLY a valid JSON array, no markdown.
Each item: {"type":"bank|card|loan|document|cash|investment|gold|bc|bond|expense|sim|email","confidence":0.0-1.0,"data":{...}}
Use snake_case: bankName,balance,iban,cardName,last4,expiry,person,amount,dueDate,network,phone,label,investmentName,broker,name.
If nothing found return [].`;

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export default {
  async fetch(request, env, ctx) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return json({ ok: true, service: 'vaultos-privacy-proxy', logo: true, parse: true }, cors);
    }

    if (request.method === 'GET' && url.pathname === '/logo') {
      return handleLogo(url, cors, env, ctx);
    }

    if (request.method !== 'POST' || url.pathname !== '/parse') {
      return json({ error: 'GET /logo or POST /parse' }, cors, 404);
    }

    const auth = request.headers.get('Authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    if (!env.LLM_API_KEY || token !== env.LLM_API_KEY) {
      return json({ error: 'Unauthorized' }, cors, 401);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, cors, 400);
    }
    const text = (body.text || '').trim();
    if (!text) return json({ error: 'text required' }, cors, 400);

    try {
      const model = body.model || '@cf/meta/llama-3.1-8b-instruct';
      const prompt = `${SYS}\n\n---\nUser text:\n${text}\n\nJSON array:`;
      const result = await env.AI.run(model, {
        prompt,
        max_tokens: 2048,
        temperature: 0.1,
      });
      const raw = result?.response || result?.text || String(result || '[]');
      const m = String(raw).match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(m ? m[0] : '[]');
      return json({ items: Array.isArray(parsed) ? parsed : [] }, cors);
    } catch (e) {
      return json({ error: e.message || 'parse failed' }, cors, 500);
    }
  },
};

async function handleLogo(url, cors, env, ctx) {
  const domain = (url.searchParams.get('domain') || '').trim().toLowerCase();
  const sz = Math.min(256, Math.max(16, parseInt(url.searchParams.get('sz') || '128', 10) || 128));
  if (!domain || domain.length > 200 || !DOMAIN_RE.test(domain)) {
    return json({ error: 'invalid domain' }, cors, 400);
  }

  const cacheKey = new Request(`https://logo-cache.vaultcap.internal/${domain}?sz=${sz}`);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) {
    const h = new Headers(cached.headers);
    h.set('Access-Control-Allow-Origin', '*');
    h.set('X-Logo-Cache', 'HIT');
    return new Response(cached.body, { status: cached.status, headers: h });
  }

  const sources = [
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${sz}`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
    `https://logo.clearbit.com/${encodeURIComponent(domain)}`,
  ];

  for (const src of sources) {
    try {
      const res = await fetch(src, {
        cf: { cacheTtl: 86400 * 7, cacheEverything: true },
        headers: { 'User-Agent': 'VaultCap-LogoProxy/1.0' },
      });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (!buf || buf.byteLength < 64 || buf.byteLength > 2_000_000) continue;
      const ct = res.headers.get('content-type') || 'image/png';
      const out = new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': ct.includes('image') ? ct : 'image/png',
          'Cache-Control': 'public, max-age=604800, immutable',
          'Access-Control-Allow-Origin': '*',
          'X-Logo-Cache': 'MISS',
          'X-Logo-Source': new URL(src).hostname,
        },
      });
      ctx.waitUntil(cache.put(cacheKey, out.clone()));
      return out;
    } catch {
      /* try next */
    }
  }
  return json({ error: 'logo not found' }, cors, 404);
}

function json(data, cors, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

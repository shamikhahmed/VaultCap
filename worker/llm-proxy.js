/**
 * VaultOS LLM Parse Proxy — Cloudflare Worker + Workers AI
 * Deploy: cd worker && npx wrangler deploy
 * Secret: wrangler secret put LLM_API_KEY  (your crsr_ or shared VaultOS key)
 *
 * POST /parse  Authorization: Bearer <LLM_API_KEY>
 * Body: { text, model? }
 */
const SYS = `Extract financial records from user text. Return ONLY a valid JSON array, no markdown.
Each item: {"type":"bank|card|loan|document|cash|investment|gold|bc|bond|expense|sim|email","confidence":0.0-1.0,"data":{...}}
Use snake_case: bankName,balance,iban,cardName,last4,expiry,person,amount,dueDate,network,phone,label,investmentName,broker,name.
If nothing found return [].`;

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ ok: true, service: 'vaultos-llm-proxy' }, cors);

    if (request.method !== 'POST' || url.pathname !== '/parse') {
      return json({ error: 'POST /parse only' }, cors, 404);
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

function json(data, cors, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

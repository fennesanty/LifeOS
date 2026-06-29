// ============================================================
// POST /api/nova-proxy
// Body: { key, messages: [{role, content}] }
// Relays a bring-your-own-key NVIDIA NIM chat request server-side.
// NVIDIA's API does not allow direct browser CORS requests, so
// nova-lite.html and gym.html's client-stored key is forwarded
// through here instead of calling integrate.api.nvidia.com directly.
// The key is never stored or logged — just passed through per request.
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const body = req.body || {};
  const key = process.env.NVIDIA_API_KEY || body.key;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!key) return res.status(400).json({ error: 'NVIDIA API key required' });
  if (!messages.length) return res.status(400).json({ error: 'messages required' });

  try {
    const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + key,
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2.6',
        max_tokens: 1024,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    const json = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: (json.error && json.error.message) || 'NVIDIA API error' });
    }
    const text = (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || '';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: 'request to NVIDIA failed: ' + (e && e.message ? e.message : String(e)) });
  }
}

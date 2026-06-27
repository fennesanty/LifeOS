// ============================================================
// POST /api/nova
// Body: { messages: [{role, content}], finance: {...} }
// Calls NVIDIA's OpenAI-compatible NIM API server-side (raw fetch,
// no SDK) using NVIDIA_API_KEY from the environment, so the key
// never reaches the browser. Model: moonshotai/kimi-k2.6. Returns { text }.
// ============================================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'NVIDIA_API_KEY is not configured on the server' });

  const body = req.body || {};
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const finance = body.finance || {};
  if (!messages.length) return res.status(400).json({ error: 'messages required' });

  const system =
    "You are Nova, a warm, concise personal-finance coach living inside the user's finance dashboard. " +
    "You can see a snapshot of their real finances below (net worth by category, subscriptions, incoming orders, wishlist). " +
    "Always ground your answers in this data — quote their actual figures (amounts, names, currency) instead of speaking in generalities. " +
    "Never invent numbers, accounts, or transactions that aren't in the data; if something isn't there, say you don't see it. " +
    "Give general guidance and education, not regulated financial, tax, or legal advice — and don't claim to be a licensed advisor. " +
    "Keep replies short and conversational, like a smart friend, not a report. " +
    "Reply with the final answer only — no preamble, no '<thinking>', no restating the question.\n\n" +
    "Finance snapshot as JSON:\n" + JSON.stringify(finance);

  try {
    const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2.6',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: system },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
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

// ============================================================
// POST /api/receipt
// Body: { image: base64, mediaType: "image/jpeg" | ... }
// Calls NVIDIA NIM's vision model (moonshotai/kimi-k2.6) with FORCED
// tool use so it always returns clean structured JSON describing the
// financial image (a balance screen, a receipt, an invoice, a
// transaction list…). NVIDIA_API_KEY stays server-side only.
// ============================================================

const TOOLS = [{
  type: 'function',
  function: {
    name: 'read_finance_image',
    description: 'Report the financial data extracted from an image — a receipt, bill, invoice, bank/fintech app screenshot, account balance, statement, or transaction list.',
    parameters: {
      type: 'object',
      properties: {
        readable: {
          type: 'boolean',
          description: 'false ONLY if there is no monetary amount anywhere in the image. True for any image with a discernible amount, even a screenshot.'
        },
        kind: {
          type: 'string',
          enum: ['balance', 'expense', 'income', 'other'],
          description: 'balance = a bank/fintech app balance screen or statement; expense = a receipt, bill, or purchase; income = an incoming payment or payslip; other = anything else with a number.'
        },
        source: {
          type: 'string',
          description: 'The bank/app name for a balance (e.g. "Revolut", "Wise", "N26"), or the merchant name for a purchase (e.g. "Migros"). Best guess if unclear.'
        },
        currency: {
          type: 'string',
          description: 'ISO 4217 currency code, inferred from symbols/abbreviations (Fr or CHF -> CHF, $ -> USD, EUR or € -> EUR, £ -> GBP). Default to CHF if it cannot be determined.'
        },
        amount: {
          type: 'number',
          description: 'The single headline figure as a plain positive number, no currency symbols or thousands separators (e.g. "Fr 199.54" -> 199.54). The balance on a banking screen, or the total on a receipt.'
        },
        date: {
          type: 'string',
          description: 'The date on the document as YYYY-MM-DD, or "" if not present/unclear.'
        },
        items: {
          type: 'array',
          description: 'Best-effort line items / transactions found in the image, if any.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              amount: { type: 'number' }
            },
            required: ['name', 'amount']
          }
        }
      },
      required: ['readable', 'kind', 'source', 'currency', 'amount', 'date', 'items']
    }
  }
}];

const SYSTEM =
  'You read images of receipts, bills, invoices, bank or fintech app screenshots, account balances, ' +
  'statements, and transaction lists, and report what you find by calling the read_finance_image tool. ' +
  "Do NOT refuse just because the image isn't a paper receipt — bank app screens, balance screens, and " +
  'transfer confirmations are all valid and readable. ' +
  'Set readable=false ONLY if there is no monetary amount anywhere in the image. ' +
  'Report amounts as plain numbers: no currency symbols, no thousands separators, period as the decimal ' +
  'point (e.g. read "Fr 199.54" as amount 199.54, currency "CHF"). ' +
  'Infer the ISO 4217 currency from symbols/abbreviations (Fr or CHF -> CHF, $ -> USD, € or EUR -> EUR, ' +
  '£ or GBP -> GBP); default to CHF if you cannot tell. ' +
  'For a banking/fintech screenshot, kind is "balance" and amount is the headline balance; source is the ' +
  'bank/app name. For a receipt or bill, kind is "expense" and amount is the total; source is the merchant. ' +
  'For an incoming payment or payslip, kind is "income". Use "other" only when none of these fit. ' +
  'Always answer via the read_finance_image tool, never as plain text.';

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'NVIDIA_API_KEY is not configured on the server' });

  const body = req.body || {};
  const image = body.image;
  const mediaType = body.mediaType || 'image/jpeg';
  if (!image) return res.status(400).json({ error: 'image (base64) required' });

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
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: 'data:' + mediaType + ';base64,' + image } },
              { type: 'text', text: 'Extract the financial data from this image and report it with the read_finance_image tool.' }
            ]
          }
        ],
        tools: TOOLS,
        tool_choice: { type: 'function', function: { name: 'read_finance_image' } },
      }),
    });
    const json = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: (json.error && json.error.message) || 'NVIDIA API error' });
    }
    const message = json.choices && json.choices[0] && json.choices[0].message;
    const toolCall = message && message.tool_calls && message.tool_calls.find(t => t.function && t.function.name === 'read_finance_image');
    if (!toolCall) return res.status(502).json({ error: 'Model did not return structured data' });
    let parsed;
    try { parsed = JSON.parse(toolCall.function.arguments); } catch (e) { return res.status(502).json({ error: 'Model returned invalid JSON' }); }
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: 'request to NVIDIA failed: ' + (e && e.message ? e.message : String(e)) });
  }
}

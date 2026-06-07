/**
 * FLASH-JOUR — /api/orders/create.js
 * Proxy sécurisé : Frontend → Vercel → n8n → CJdropshipping
 * NE PAS appeler CJ directement depuis le frontend (clé API exposée).
 *
 * Variables d'env :
 *   N8N_WEBHOOK_URL_ORDER → https://smconsulting.app.n8n.cloud/webhook/VOTRE_ID
 *   N8N_API_KEY           → même clé que stripe.js
 *   ALLOWED_ORIGIN        → https://www.flash-jour.com
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://www.flash-jour.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { stripe_session_id, items, shipping } = req.body;

  // 1. Validation des champs obligatoires
  if (!stripe_session_id || !items?.length || !shipping?.address) {
    return res.status(400).json({ error: 'Champs manquants : stripe_session_id, items, shipping requis' });
  }

  // 2. Sanitisation basique
  const sanitizedPayload = {
    source: 'frontend_order',
    stripe_session_id: String(stripe_session_id).trim(),
    items: items.map(item => ({
      cj_product_id: String(item.cj_product_id || '').trim(),
      quantity:      Math.max(1, parseInt(item.quantity) || 1),
    })).filter(item => item.cj_product_id),
    shipping: {
      name:    String(shipping.name || '').trim().substring(0, 100),
      address: String(shipping.address || '').trim().substring(0, 200),
      city:    String(shipping.city || '').trim().substring(0, 100),
      zip:     String(shipping.zip || '').trim().substring(0, 20),
      country: String(shipping.country || 'FR').trim().substring(0, 2).toUpperCase(),
    },
    timestamp: new Date().toISOString(),
  };

  // 3. Relai vers n8n
  try {
    const n8nRes = await fetch(process.env.N8N_WEBHOOK_URL_ORDER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.N8N_API_KEY,
      },
      body: JSON.stringify(sanitizedPayload),
      signal: AbortSignal.timeout(10000),
    });

    if (!n8nRes.ok) {
      throw new Error(`n8n responded ${n8nRes.status}`);
    }

    const n8nData = await n8nRes.json();
    return res.status(200).json({ success: true, order_id: n8nData.cj_order_id || null });

  } catch (err) {
    console.error('[Order] n8n relay error:', err.message);
    return res.status(502).json({ error: 'Erreur lors de la création de la commande. Réessaie dans quelques instants.' });
  }
}

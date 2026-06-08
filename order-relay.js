/**
 * FLASH-JOUR — /api/order-relay.js
 * Relay sécurisé : Frontend → Vercel → n8n → CJdropshipping
 * Variables d'env Vercel :
 *   N8N_API_KEY            → clé partagée (header X-API-KEY)
 *   N8N_ORDERS_WEBHOOK_URL → https://smconsulting.app.n8n.cloud/webhook/VOTRE_ID
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderData } = req.body;
  const N8N_API_KEY = process.env.N8N_API_KEY;

  // Auth standard
  const incomingKey = req.headers['x-api-key'];
  if (!incomingKey || incomingKey !== N8N_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!orderData?.email || !orderData?.total) {
    return res.status(400).json({ error: 'Données commande incomplètes' });
  }

  try {
    const response = await fetch(process.env.N8N_ORDERS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': N8N_API_KEY
      },
      body: JSON.stringify(orderData),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) throw new Error(`n8n responded ${response.status}`);

    return res.status(200).json({ success: true, message: 'Commande transmise.' });
  } catch (error) {
    console.error('[Order Relay]', error.message);
    return res.status(500).json({ error: 'Erreur traitement commande.' });
  }
}

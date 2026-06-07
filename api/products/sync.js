/**
 * FLASH-JOUR — /api/products/sync.js
 * Déclenche manuellement ou via cron la sync des produits CJ → base de données.
 * Protégé par CRON_SECRET pour usage Vercel Cron Jobs.
 *
 * Variables d'env :
 *   N8N_WEBHOOK_URL_SYNC → https://smconsulting.app.n8n.cloud/webhook/VOTRE_ID
 *   N8N_API_KEY          → même clé partagée
 *   CRON_SECRET          → secret pour les appels Vercel Cron (génère : openssl rand -hex 16)
 *
 * Vercel Cron (dans vercel.json) :
 *   { "crons": [{ "path": "/api/products/sync", "schedule": "0 6 * * *" }] }
 */

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth : soit CRON_SECRET (Vercel Cron), soit N8N_API_KEY (appel manuel)
  const authHeader = req.headers['authorization'] || req.headers['x-api-key'] || '';
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManualCall = authHeader === process.env.N8N_API_KEY;

  if (!isVercelCron && !isManualCall) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = {
    source: isVercelCron ? 'vercel_cron' : 'manual_trigger',
    action: 'sync_products',
    timestamp: new Date().toISOString(),
  };

  try {
    const n8nRes = await fetch(process.env.N8N_WEBHOOK_URL_SYNC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.N8N_API_KEY,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    if (!n8nRes.ok) throw new Error(`n8n responded ${n8nRes.status}`);

    console.log('[Sync] Déclenchée à', payload.timestamp);
    return res.status(200).json({ success: true, triggered_at: payload.timestamp });

  } catch (err) {
    console.error('[Sync] Error:', err.message);
    return res.status(502).json({ error: 'Sync trigger failed', detail: err.message });
  }
}

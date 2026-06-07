/**
 * FLASH-JOUR — /api/webhook/stripe.js
 * Reçoit les événements Stripe et relaie vers n8n de façon sécurisée.
 * URL à configurer dans Stripe Dashboard > Webhooks :
 *   https://www.flash-jour.com/api/webhook/stripe
 *
 * Variables d'env Vercel à configurer :
 *   STRIPE_SECRET_KEY      → sk_live_XXXX
 *   STRIPE_WEBHOOK_SECRET  → whsec_XXXX (depuis Stripe Dashboard > Webhooks)
 *   N8N_WEBHOOK_URL_STRIPE → https://smconsulting.app.n8n.cloud/webhook/VOTRE_ID
 *   N8N_API_KEY            → clé secrète partagée (génère avec : openssl rand -hex 32)
 */

import Stripe from 'stripe';

// IMPORTANT : bodyParser désactivé — Stripe a besoin du raw body pour valider la signature
export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  let event;

  // 1. Vérification signature Stripe (bloque toute requête non-Stripe)
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe] Signature invalide:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // 2. On ne traite que les paiements réellement confirmés
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, processed: false });
  }

  const session = event.data.object;

  // 3. Payload normalisé pour n8n (pas de données sensibles inutiles)
  const n8nPayload = {
    source: 'stripe_webhook',
    event_type: event.type,
    order: {
      stripe_session_id:     session.id,
      stripe_payment_intent: session.payment_intent,
      amount_total:          session.amount_total,
      currency:              session.currency,
      customer_email:        session.customer_details?.email || null,
      customer_name:         session.customer_details?.name || null,
      shipping_address:      session.shipping_details?.address || null,
      metadata:              session.metadata || {},
    },
    timestamp: new Date().toISOString(),
  };

  // 4. Relai sécurisé vers n8n
  try {
    const n8nRes = await fetch(process.env.N8N_WEBHOOK_URL_STRIPE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.N8N_API_KEY,
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nRes.ok) {
      console.error('[n8n] Erreur relai:', n8nRes.status, await n8nRes.text());
      return res.status(200).json({ received: true, n8n_error: true });
    }

    console.log('[Stripe→n8n] Commande relayée:', session.id);
    return res.status(200).json({ received: true, processed: true });

  } catch (err) {
    console.error('[n8n] Fetch failed:', err.message);
    return res.status(200).json({ received: true, n8n_error: true });
  }
}

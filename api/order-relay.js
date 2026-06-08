/**
 * Relay API for Flash-Jour Orders (Secure Stripe Webhook Handler)
 * Purpose: Handle incoming Stripe webhooks and forward to n8n securely.
 */

import { buffer } from 'micro';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Forward to n8n
    try {
      const N8N_WEBHOOK_URL = process.env.N8N_ORDERS_WEBHOOK_URL;
      const N8N_API_KEY = process.env.N8N_WEBHOOK_API_KEY;

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': N8N_API_KEY
        },
        body: JSON.stringify({
          order_id: session.id,
          email: session.customer_details.email,
          amount: session.amount_total / 100,
          currency: session.currency,
          customer_name: session.customer_details.name,
          shipping_address: session.shipping_details,
          // Mapping SKU par défaut pour le produit actif
          sku: 'CJJD274007001AZ',
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('n8n forwarding failed');

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Relay Error:', error);
      return res.status(500).json({ error: 'Internal server error forwarding to n8n' });
    }
  }

  res.json({ received: true });
}

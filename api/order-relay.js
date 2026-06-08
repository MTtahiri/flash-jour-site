/**
 * Relay API for Flash-Jour Orders
 * Purpose: Securely forward order data from the frontend to n8n.
 * Security: Validates an internal API key and uses server-side environment variables.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderData, apiKey } = req.body;

  // 1. Validate the internal API key to prevent unauthorized access to the relay
  const INTERNAL_API_KEY = process.env.INTERNAL_RELAY_KEY;
  if (!apiKey || apiKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid relay key' });
  }

  // 2. Validate mandatory order data
  if (!orderData || !orderData.email || !orderData.total) {
    return res.status(400).json({ error: 'Missing mandatory order data' });
  }

  try {
    // 3. Forward the data to the secret n8n webhook URL
    const N8N_WEBHOOK_URL = process.env.N8N_ORDERS_WEBHOOK_URL;

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RELAY-AUTH': INTERNAL_API_KEY // Extra layer for n8n to verify source
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Order successfully transmitted to automation pipeline.'
    });

  } catch (error) {
    console.error('Order Relay Error:', error);
    return res.status(500).json({ error: 'Internal server error during order processing.' });
  }
}

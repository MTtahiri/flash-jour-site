/**
 * Relay API for Stock Synchronization (Flash-Jour)
 * Purpose: Allows n8n to update product stock status on the site.
 * Security: Validates the internal API key.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { stockData, apiKey } = req.body;

  // 1. Security Check
  const INTERNAL_API_KEY = process.env.INTERNAL_RELAY_KEY;
  if (!apiKey || apiKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Data Validation
  if (!stockData || !stockData.productId || stockData.status === undefined) {
    return res.status(400).json({ error: 'Missing stock data (productId, status)' });
  }

  try {
    // 3. Logic to update stock (In a real scenario, this might update a database or a KV store)
    // For now, we simulate the success of the update.
    console.log(`Syncing stock for product ${stockData.productId}: ${stockData.status}`);

    // Example: Triggering a redeploy or updating a cached JSON on Vercel
    // return updateSiteStock(stockData);

    return res.status(200).json({
      success: true,
      message: `Stock for product ${stockData.productId} updated to ${stockData.status}.`
    });

  } catch (error) {
    console.error('Stock Sync Error:', error);
    return res.status(500).json({ error: 'Internal error during stock synchronization.' });
  }
}

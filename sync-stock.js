/**
 * FLASH-JOUR — /api/sync-stock.js
 * Relay sécurisé : n8n → Vercel → mise à jour stock produit
 * Appelé par n8n après interrogation CJdropshipping
 *
 * Variables d'env Vercel :
 *   N8N_API_KEY → clé partagée (header X-API-KEY, standard unifié)
 *
 * Logique de mise à jour : écrit un fichier JSON dans /public/data/stock.json
 * que le frontend lit pour afficher la disponibilité en temps réel.
 */
import { writeFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth standard — header X-API-KEY
  const incomingKey = req.headers['x-api-key'];
  if (!incomingKey || incomingKey !== process.env.N8N_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { stockData } = req.body;

  if (!stockData?.productId || stockData.status === undefined) {
    return res.status(400).json({ error: 'Champs requis: productId, status' });
  }

  // Validation du statut
  const validStatuses = ['in_stock', 'out_of_stock', 'low_stock'];
  if (!validStatuses.includes(stockData.status)) {
    return res.status(400).json({ error: `status invalide. Valeurs: ${validStatuses.join(', ')}` });
  }

  try {
    // Mise à jour du fichier stock JSON (lu par le frontend Next.js)
    const stockFilePath = path.join(process.cwd(), 'public', 'data', 'stock.json');
    
    let currentStock = {};
    try {
      const { readFile } = await import('fs/promises');
      const existing = await readFile(stockFilePath, 'utf-8');
      currentStock = JSON.parse(existing);
    } catch {
      // Fichier inexistant → on crée
    }

    // Mise à jour du produit
    currentStock[stockData.productId] = {
      status:      stockData.status,
      quantity:    stockData.quantity || null,
      lastSync:    new Date().toISOString(),
      productName: stockData.productName || ''
    };

    await writeFile(stockFilePath, JSON.stringify(currentStock, null, 2));

    console.log(`[Stock Sync] Produit ${stockData.productId} → ${stockData.status}`);
    return res.status(200).json({
      success: true,
      message: `Stock produit ${stockData.productId} mis à jour : ${stockData.status}`
    });

  } catch (error) {
    console.error('[Stock Sync Error]', error.message);
    return res.status(500).json({ error: 'Erreur synchronisation stock.' });
  }
}

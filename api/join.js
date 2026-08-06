/**
 * FLASH-JOUR — /api/join.js
 * Reçoit les candidatures du formulaire "Rejoindre" (FR/EN/AR) et les
 * envoie dans Airtable — base "Leads B2B Flash-Jour".
 *
 * Variable d'env requise :
 *   AIRTABLE_TOKEN → Personal Access Token Airtable (scope data.records:write
 *                    sur la base appiLlBnOJEtYxIA4)
 */

const AIRTABLE_BASE_ID = 'appiLlBnOJEtYxIA4';
const AIRTABLE_TABLE_ID = 'tblcEdzxY5tRNxvF6';

const ROLE_MAP = {
  acheteur: 'Acheteur',
  buyer: 'Acheteur',
  producteur: 'Producteur',
  producer: 'Producteur',
};

const LANG_MAP = { fr: 'FR', en: 'EN', ar: 'AR' };

function clean(str, max = 2000) {
  return String(str || '').trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.AIRTABLE_TOKEN) {
    console.error('[Join] AIRTABLE_TOKEN manquant');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const body = req.body || {};

  // Honeypot anti-spam (champ caché "website", laissé vide par un humain)
  if (clean(body.website)) {
    return res.status(200).json({ success: true });
  }

  const nom = clean(body.nom);
  const email = clean(body.email);
  const entreprise = clean(body.entreprise);

  if (!nom || !email || !entreprise) {
    return res.status(400).json({ error: 'Champs requis manquants (nom, email, entreprise)' });
  }

  const produits = clean(body.produits);
  const message = clean(body.message, 5000);
  const fullMessage = produits ? `Produits : ${produits}\n\n${message}` : message;

  const fields = {
    'Nom': nom,
    'Email': email,
    'Société': entreprise,
    'Pays': clean(body.pays),
    'Téléphone': clean(body.whatsapp),
    'Message': fullMessage,
    'Statut': 'Nouveau',
    'Source': clean(body.source) || 'flash-jour.com/rejoindre',
    'Date inscription': new Date().toISOString(),
  };

  const role = ROLE_MAP[String(body.type_membre || '').toLowerCase()];
  if (role) fields['Rôle'] = role;

  const langue = LANG_MAP[String(body.langue || '').toLowerCase()];
  if (langue) fields['Langue'] = langue;

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields }] }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!airtableRes.ok) {
      const detail = await airtableRes.text();
      console.error('[Join] Airtable error:', airtableRes.status, detail);
      return res.status(502).json({ error: 'Airtable submission failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Join] Error:', err.message);
    return res.status(502).json({ error: 'Submission failed', detail: err.message });
  }
}

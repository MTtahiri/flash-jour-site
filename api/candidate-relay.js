/**
 * Relay API for Rh-prospects.fr (Candidates & IA Audits)
 * Purpose: Securely forward candidate data and IA Audit results to n8n.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, type } = req.body; // type: 'candidate' or 'ia_audit'
  const N8N_API_KEY = process.env.N8N_WEBHOOK_API_KEY;

  if (!data || !data.email) {
    return res.status(400).json({ error: 'Missing mandatory data' });
  }

  try {
    const N8N_URL = type === 'ia_audit'
      ? process.env.N8N_AUDIT_WEBHOOK_URL
      : process.env.N8N_CANDIDATES_WEBHOOK_URL;

    const response = await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      },
      body: JSON.stringify({
        ...data,
        source: 'rh-prospects.fr',
        submission_type: type,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) throw new Error('n8n submission failed');

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Candidate Relay Error:', error);
    return res.status(500).json({ error: 'Failed to process submission' });
  }
}

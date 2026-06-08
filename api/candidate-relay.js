/**
 * Relay API for Rh-prospects.fr Candidate Submissions
 * Purpose: Ensure GDPR compliance and secure transmission of candidate PII to n8n.
 * Security: Filters sensitive data and validates the source.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { candidateData, apiKey } = req.body;

  // 1. Security Check
  const INTERNAL_API_KEY = process.env.INTERNAL_RELAY_KEY;
  if (!apiKey || apiKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. GDPR & Data Validation
  if (!candidateData || !candidateData.email || !candidateData.lastName) {
    return res.status(400).json({ error: 'Incomplete candidate data' });
  }

  // Sanitization: Ensure only allowed fields are forwarded to prevent PII leakage
  const sanitizedData = {
    firstName: candidateData.firstName,
    lastName: candidateData.lastName,
    email: candidateData.email,
    phone: candidateData.phone,
    cvUrl: candidateData.cvUrl, // Usually a link to a temporary upload
    message: candidateData.message,
    source: 'rh-prospects.fr',
    timestamp: new Date().toISOString()
  };

  try {
    const N8N_CANDIDATE_WEBHOOK_URL = process.env.N8N_CANDIDATES_WEBHOOK_URL;

    const response = await fetch(N8N_CANDIDATE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RELAY-AUTH': INTERNAL_API_KEY
      },
      body: JSON.stringify(sanitizedData),
    });

    if (!response.ok) {
      throw new Error('Automation pipeline failure');
    }

    return res.status(200).json({
      success: true,
      message: 'Application received and secured.'
    });

  } catch (error) {
    console.error('Candidate Relay Error:', error);
    return res.status(500).json({ error: 'Failed to process application securely.' });
  }
}

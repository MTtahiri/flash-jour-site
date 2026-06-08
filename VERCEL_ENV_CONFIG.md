# Configuration des Variables d'Environnement (Vercel)

Pour faire fonctionner les relais API de manière sécurisée, vous devez ajouter les variables suivantes dans votre tableau de bord Vercel (Settings > Environment Variables) :

## Variables Communes
- `INTERNAL_RELAY_KEY` : Une clé secrète complexe (ex: un UUID ou une chaîne aléatoire) que vous utiliserez dans vos appels `fetch` côté frontend pour autoriser le relais.

## Variables pour Flash-Jour.com
- `N8N_ORDERS_WEBHOOK_URL` : L'URL complète de votre webhook n8n dédié aux commandes (ex: `https://smconsulting.app.n8n.cloud/webhook/stripe-order-relay`).

## Variables pour Rh-prospects.fr
- `N8N_CANDIDATES_WEBHOOK_URL` : L'URL complète de votre webhook n8n dédié aux candidatures (ex: `https://smconsulting.app.n8n.cloud/webhook/candidate-submission`).

---
*Note : Ces variables sont strictement confidentielles et ne seront jamais exposées au client grâce à l'architecture serverless.*

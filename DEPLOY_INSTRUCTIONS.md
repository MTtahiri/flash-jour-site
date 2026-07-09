# Guide de Déploiement et Test - Phase 2

Ce guide détaille les étapes pour activer et vérifier les automatisations Flash-Jour et RH-Prospects.

## 1. Configuration des Environnements

### Sur Vercel (Flash-Jour & RH-Prospects)
**Installation des dépendances :**
Assurez-vous d'avoir installé les packages nécessaires dans votre projet Vercel :
`npm install stripe micro`

**Variables d'environnement :**
Assurez-vous que les variables suivantes sont présentes dans vos *Environment Variables* :
- `STRIPE_WEBHOOK_SECRET` : Secret récupéré sur le dashboard Stripe.
- `STRIPE_SECRET_KEY` : Clé secrète API Stripe.
- `N8N_WEBHOOK_API_KEY` : Une clé forte (ex: `uuid`) partagée entre Vercel et n8n.
- `N8N_ORDERS_WEBHOOK_URL` : URL du webhook n8n pour les commandes.
- `N8N_AUDIT_WEBHOOK_URL` : URL du webhook n8n pour les audits IA.
- `N8N_CANDIDATES_WEBHOOK_URL` : URL du webhook n8n pour les candidatures.

### Sur n8n
Configurez les *Credentials* suivants :
- **CJ Access Token** : Votre token API CJdropshipping.
- **Airtable API** : Jeton d'accès personnel avec droits sur votre Base.
- **Slack OAuth** : Pour les notifications de leads.

## 2. Test des Relais Vercel

### Tester le Relais de Commandes (Simulation Stripe)
Exécutez cette commande `curl` (en remplaçant par vos URLs) :
```bash
curl -X POST https://votre-site.vercel.app/api/order-relay \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test_session_123",
    "customer_details": { "email": "test@example.com", "name": "Jean Test" },
    "amount_total": 3490,
    "currency": "eur",
    "shipping_details": { "address": { "line1": "123 Rue de Test", "city": "Paris", "country": "FR", "postal_code": "75001" } }
  }'
```

### Tester le Relais RH-Prospects (Audit IA)
```bash
curl -X POST https://rh-prospects.fr/api/candidate-relay \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ia_audit",
    "data": {
      "email": "lead@prospect.com",
      "lastName": "Durand",
      "ia_score": 85,
      "message": "Besoin d'automatisation RH"
    }
  }'
```

## 3. Vérification Airtable
1. Ouvrez votre table **Commandes** : une ligne doit apparaître avec le SKU `CJJD274007001AZ`.
2. Ouvrez votre table **Leads** : le lead Durand doit être présent avec un score de 85.
3. Vérifiez Slack : une notification doit être reçue pour le score > 80.

---
*Fin du Guide de Déploiement.*

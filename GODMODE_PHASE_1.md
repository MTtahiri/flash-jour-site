# GodMode Phase 1 : Analyse & Planification Stratégique

## 1. CRITIQUE DE L'ARCHITECTURE

### Sécurité & Étanchéité des Données
- **Exposition des API Keys :** Actuellement, le risque d'exposition des clés Stripe/PayPal et CJdropshipping est élevé si les appels sont faits depuis le frontend.
- **Relais Vercel (Recommandation) :** Implémentation systématique de Serverless Functions pour agir comme proxy sécurisé.
- **Protection des Webhooks :** Les endpoints n8n doivent être protégés par un Header `X-API-KEY` ou une validation de signature HMAC pour éviter les injections de données malveillantes.

### Conformité RGPD (Rh-prospects.fr)
- **Traitement des PII :** Les données candidats (CV, coordonnées) sont sensibles. Le flux doit être chiffré de bout en bout.
- **Droit à l'oubli :** L'automatisation doit inclure un mécanisme de purge ou d'anonymisation après une période définie dans le CRM.

### Performance & Résilience
- **Gestion des Échecs (Flash-jour) :** Utilisation des Webhooks Stripe pour garantir que la commande n'est passée à CJdropshipping qu'après succès du paiement (asynchronisme).
- **Consommation API :** Optimisation des appels CJ pour éviter les limites de débit (Rate Limiting).

---

## 2. FEUILLE DE ROUTE DE L'AUTOMATISATION

### Flux A : Visibility & Authority Machine (Priorité 1 - ROI)
- **Objectif :** Transformer les news RH/IA en autorité sur LinkedIn pour Rh-prospects.
- **Nodes :** RSS Feed -> Anthropic (Analyse) -> LinkedIn/X API.

### Flux B : Sales Machine (Priorité 2 - Lead Gen)
- **Objectif :** Convertir les audits IA en opportunités commerciales.
- **Nodes :** Webhook Vercel -> CRM (HubSpot) -> Slack Notification (si > 5k€ potentiel).

### Flux C : E-commerce Sync (Priorité 3 - Opérationnel)
- **Objectif :** Automatiser Flash-Jour vers CJdropshipping.
- **Nodes :** Stripe Webhook -> Logic Node (Mapping SKU) -> CJ API Fulfillment.

---

## 3. ANALYSE DE FAISABILITÉ : PRÉREQUIS

1. **CJdropshipping :** Clé API et AccessToken requis.
2. **CRM :** Confirmation de HubSpot ou Airtable.
3. **Produits :** Table de correspondance SKU <-> VariantID CJ.
4. **Secrets :** Variables d'environnement `STRIPE_WEBHOOK_SECRET`, `CJ_API_KEY`, `N8N_API_KEY` à configurer sur Vercel.

---
*Document généré par Jules (GodMode).*

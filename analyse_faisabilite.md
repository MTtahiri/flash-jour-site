# Phase 1 : Analyse de Faisabilité (GodMode)

## 3. Informations Techniques Requises

Pour passer à la Phase 2 (Génération des fichiers JSON n8n et scripts), nous devons confirmer les éléments suivants :

### Infrastructure & API
- **Routes n8n :** Confirmation des URLs de production pour les Webhooks (actuellement `smconsulting.app.n8n.cloud`).
- **Variables d'environnement Vercel :**
    - `N8N_WEBHOOK_URL`
    - `N8N_API_KEY` (pour la sécurité)
    - `STRIPE_WEBHOOK_SECRET` (pour valider les signatures)

### Mapping Produits (SKU CJdropshipping)
Nous avons besoin des `variantId` ou `SKU` précis de CJdropshipping pour les produits suivants :
- Ventilateur de Cou Sans Lame
- Alarme Personnelle SOS
- (Eventuels futurs produits)

### Rh-prospects.fr
- **Champs Formulaires :** Liste exacte des IDs (`name`) des inputs pour le mapping automatique.
- **Identifiants CRM :** Si Airtable ou HubSpot, l'ID de la table ou de l'objet cible.

### Sécurité
- **Authentification :** Méthode préférée pour sécuriser les appels Vercel -> n8n (Header `Authorization: Bearer XXX` recommandée).

---
**En validant ce plan, vous m'autorisez à préparer les structures de données basées sur ces prérequis.**

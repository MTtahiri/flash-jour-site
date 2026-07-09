# Phase 1 : Feuille de Route de l'Automatisation (GodMode)

## 2. Feuille de Route Détaillée

### Flux 1 : Rh-prospects.fr (Candidatures & Audits IA)
**Objectif :** Centraliser les demandes et automatiser le tri.

1.  **Déclencheur (Trigger) :** Webhook entrant (POST) depuis Vercel.
    *   *Note :* Utiliser une Function Vercel comme relais pour ajouter une couche de sécurité (Basic Auth).
2.  **Traitement (Nœuds Code/IA) :**
    *   **Nœud Code (Normalisation) :** Parsing du JSON, nettoyage des caractères spéciaux, formatage des numéros de téléphone.
    *   **Nœud IA (Scoring) :** Envoi du résumé du CV/Audit à OpenAI pour extraire les mots-clés et attribuer un score de pertinence (0-100).
3.  **Intégration (Actions) :**
    *   **CRM/Database :** Insertion dans Airtable ou HubSpot avec le score IA.
    *   **Alerte :** Envoi d'un message Slack ou Telegram si le score dépasse un seuil défini.

### Flux 2 : Flash-Jour.com (E-commerce & Logistique)
**Objectif :** Automatiser la commande fournisseur et le suivi client.

1.  **Déclencheur (Trigger) :** Webhook Stripe (`checkout.session.completed`) ou PayPal Webhook.
2.  **Traitement (Nœuds Code) :**
    *   **Nœud Code (Mapping CJ) :** Traduction des données Stripe vers le schéma API CJdropshipping.
        *   Récupération du SKU (à partir du nom du produit ou des métadonnées Stripe).
        *   Formatage de l'adresse de livraison (obligatoire pour CJ).
    *   **Nœud Switch :** Distinction entre les modes de paiement et les types de produits.
3.  **Intégration (Actions) :**
    *   **CJdropshipping API :** Création automatique de la commande (`POST /orders`).
    *   **Emailing (Brevo/SendGrid) :** Envoi d'un email de confirmation personnalisé au client.
    *   **Monitoring :** Mise à jour d'un Google Sheet "Suivi Commandes" pour une vision globale des stocks et des marges.

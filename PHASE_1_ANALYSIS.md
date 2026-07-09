# Phase 1 : Analyse et Planification (GodMode)

## 1. Critique de l'Architecture

L'architecture actuelle présente plusieurs points de friction critiques qui pourraient compromettre la sécurité, la conformité RGPD et l'évolutivité de vos automatisations :

### Sécurité des Clés API et Secrets
*   **Problème :** L'intégration directe d'identifiants (Stripe, PayPal) ou l'exposition potentielle de clés API CJdropshipping dans le code frontend est une faille de sécurité majeure.
*   **Solution :** Toutes les interactions avec des APIs tierces doivent être encapsulées dans des **Vercel Serverless Functions** (API Routes). Ces fonctions agissent comme un proxy sécurisé, utilisant des variables d'environnement Vercel pour stocker les secrets.

### Conformité RGPD (Rh-prospects.fr)
*   **Problème :** Le traitement des CV et des données candidats (PII) nécessite une isolation stricte. Faire transiter ces données via des webhooks n8n publics sans authentification est risqué.
*   **Solution :** Utiliser des relais Vercel pour valider et "nettoyer" les données avant de les envoyer à n8n. n8n doit traiter ces données via des flux chiffrés vers votre CRM.

### Gestion des Webhooks n8n
*   **Problème :** Les URLs de webhooks n8n sont actuellement exposées. Une attaque par déni de service (DoS) ou l'injection de fausses données pourrait polluer vos bases de données.
*   **Solution :** Implémenter une authentification par Header (ex: `X-API-KEY`) transmise par le relais Vercel à n8n.

### Fiabilité des flux E-commerce (Flash-Jour)
*   **Problème :** Si n8n est sollicité uniquement par le frontend, un échec réseau post-paiement pourrait empêcher la création de la commande chez CJ.
*   **Solution :** Utiliser les webhooks natifs de Stripe (`checkout.session.completed`) comme déclencheur principal pour garantir que l'automatisation ne démarre qu'après confirmation réelle du paiement.

---

## 2. Feuille de Route de l'Automatisation

### Étape 1 : Sécurisation du Pont (Vercel -> n8n)
*   Configuration des variables d'environnement sur Vercel.
*   Création d'API Routes Node.js sur Vercel agissant comme relais sécurisés.

### Étape 2 : Automatisation RH-Prospects
*   **Trigger :** Soumission de formulaire -> Appel API Route Vercel.
*   **Workflow n8n :** Normalisation des données candidats -> Extraction des métadonnées CV (via IA/Parser) -> Insertion CRM.
*   **Action :** Notification Slack/Email pour les profils à haut potentiel.

### Étape 3 : Automatisation Flash-Jour
*   **Trigger :** Webhook Stripe/PayPal -> n8n.
*   **Workflow n8n :** Mapping des données Stripe vers le schéma API CJdropshipping -> Création commande CJ.
*   **Sync Stock :** Script périodique interrogeant CJ pour mettre à jour les stocks sur Flash-Jour.

---

## 3. Analyse de Faisabilité : Informations Requises

Avant de passer à la Phase 2 (Génération), les informations suivantes sont nécessaires :

1.  **CJdropshipping :** Confirmation de la possession d'une `API Key` et d'un `AccessToken` valides.
2.  **CRM (RH) :** Identification du CRM cible (ex: HubSpot, Airtable, Notion) et accès à sa documentation API.
3.  **Mapping Produits :** Liste des `Variant IDs` CJdropshipping correspondant aux produits actuels (ex: Ventilateur de cou, Alarme SOS).
4.  **Accès GitHub :** Confirmation de l'autorisation de créer des dossiers `/api` sur les deux dépôts.

---
*Analyse préparée par Jules, Architecte Logiciel.*

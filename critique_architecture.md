# Phase 1 : Analyse et Critique de l'Architecture (GodMode)

## 1. Critique de l'Architecture Actuelle

### Sécurité des Webhooks n8n
L'analyse du fichier `commande.html` et `success.html` révèle l'utilisation directe de l'URL `https://smconsulting.app.n8n.cloud/webhook/produit-du-jour`.
- **Friction Majeure :** L'URL du webhook est exposée en clair dans le code client. Sans protection (Header secret, Basic Auth ou validation d'IP), n'importe qui peut saturer votre instance n8n ou fausser les données envoyées.
- **Risque :** Injection de données malveillantes ou déni de service (DoS) sur votre instance n8n.

### Gestion des Clés API CJdropshipping
- **Observation :** Bien que les clés ne soient pas présentes dans le frontend (ce qui est une bonne pratique), l'automatisation via n8n nécessite que ces clés soient stockées de manière sécurisée.
- **Recommandation :** Utiliser exclusivement le système de "Credentials" de n8n. Aucun script "Code" ne doit contenir de clé en dur. L'API de CJdropshipping utilise un système de Token qui doit être rafraîchi ou géré via des variables d'environnement.

### Traitement des données RGPD (Rh-prospects.fr)
Le traitement de CV et de profils B2B sur Vercel/n8n présente des défis :
- **Stockage :** Les CV ne doivent pas stagner sur le serveur n8n ou dans les logs de Vercel.
- **Sécurité :** Le transfert de données sensibles (coordonnées, parcours professionnel) doit être chiffré. n8n doit agir comme un simple "passerelle" vers une base de données sécurisée ou un CRM, avec une purge automatique des données traitées.
- **Information :** La politique de confidentialité doit être mise à jour pour inclure n8n comme sous-traitant technique.

### Intégration E-commerce (Flash-Jour.com)
L'utilisation de liens Stripe (`buy.stripe.com`) simplifie le paiement mais déconnecte le frontend du flux de données complexe.
- **Point de Friction :** La remontée vers CJdropshipping dépend entièrement du Webhook Stripe. Si le Webhook échoue, il n'y a pas de trace automatique du "manqué" dans le frontend actuel pour alerter l'utilisateur ou l'admin instantanément.

# Prérequis Techniques : Machine à Visibilité (n8n)

Pour faire fonctionner le Flux A, vous devez configurer les accréditations suivantes dans votre interface n8n :

## 1. Google Drive & YouTube (via Google Cloud Console)
*Ces deux services utilisent le même projet Google Cloud.*
- **Action :** Allez sur [Google Cloud Console](https://console.cloud.google.com/).
- **API à activer :** `Google Drive API` et `YouTube Data API v3`.
- **Accréditations n8n :**
  - Créez un `OAuth2 Client ID`.
  - Ajoutez l'URL de redirection fournie par n8n dans la configuration de l'ID client.
  - **Scopes nécessaires :** `https://www.googleapis.com/auth/drive.readonly` et `https://www.googleapis.com/auth/youtube.upload`.

## 2. Anthropic (Claude AI)
- **Action :** Allez sur [Anthropic Console](https://console.anthropic.com/).
- **Accréditations n8n :**
  - Créez une `API Key`.
  - Dans n8n, utilisez le nœud `Anthropic Chat Model` (ou `Anthropic` selon votre version) et collez la clé.

## 3. X (Twitter)
- **Action :** Allez sur [X Developer Portal](https://developer.twitter.com/).
- **Configuration :**
  - Créez une App avec les accès `Read and Write`.
  - Configurez le `User authentication settings` en choisissant `OAuth 1.0a`.
- **Accréditations n8n :**
  - Vous aurez besoin du `API Key`, `API Key Secret`, `Access Token` et `Access Token Secret`.

## 4. Dossier Source (Google Drive)
- **Action :** Identifiez l'ID du dossier Google Drive où vous déposerez vos fichiers.
- **n8n :** Remplacez `VOTRE_FOLDER_ID_DRIVE` dans le nœud "Google Drive Trigger" par cet ID.

---
*Note : Assurez-vous que votre instance n8n a une adresse IP publique fixe si vous utilisez OAuth2, pour que les redirections Google/X fonctionnent correctement.*

# Architecture : "La Machine à Visibilité" (n8n)

## 1. Structure Logique du Workflow n8n

### Flux A : Distribution Multi-Canal (Drive to All)
1.  **Trigger :** `Google Drive Node` (Watch for new files in `/Uploads/Bruts`).
2.  **Logic :** `If/Else` - Distinguer Vidéo (Shorts/TikTok) vs Texte (Article).
3.  **IA Transformation (OpenAI GPT-4o / Claude 3.5) :**
    *   **Node X (Twitter) :** Génère un Thread de 5-7 tweets + 1 tweet d'accroche viral.
    *   **Node YouTube :** Génère Titre (Hook) + Description SEO + Hashtags.
    *   **Node TikTok :** Génère Description courte + Hook psychologique.
4.  **Publication :**
    *   `YouTube Node` : Upload direct.
    *   `X Node` : Publication du Thread.
    *   `TikTok Node` : Envoi vers l'API de publication.

### Flux B : Veille Rh-prospects.fr (Authority Machine)
1.  **Trigger :** `RSS Feed` (TechCrunch, HR Tech, OpenAI Blog) + `Google News`.
2.  **Filter :** `IA Node` - Sélectionne uniquement les news stratégiques pour le recrutement.
3.  **Content Gen :** `IA Node` - Rédige un post LinkedIn "Expert" et un tweet "Trends".
4.  **Publication :** `LinkedIn Node` + `X Node`.

### Flux C : Mass-Content Flash-jour.com (Sales Machine)
1.  **Trigger :** `HTTP Request` API CJdropshipping (Top Trending Products).
2.  **Video Prep :** `IA Node` génère un script de voix off à partir de la description produit.
3.  **Audio Gen :** `OpenAI TTS Node` crée le fichier audio .mp3.
4.  **Scheduling :** `n8n Schedule` pour publier 3 fois par jour.

---

## 2. Prompts Système Exacts

### Prompt X (Twitter Expert - Rh-prospects)
```text
Tu es un Growth Hacker spécialisé en IA et Recrutement B2B.
TACHE : Transforme l'article fourni en un Thread X de 5 tweets.
STYLE : Direct, informatif, un peu provocateur. Utilise des listes à puces.
CONTRAINTE : Pas d'emojis excessifs. Termine par un CTA vers rh-prospects.fr.
```

### Prompt TikTok/Shorts (Flash-jour)
```text
Tu es un expert en e-commerce viral.
TACHE : Rédige une description TikTok pour ce produit.
STYLE : Utilise un "Hook" psychologique immédiat (ex: "Arrête tout...", "Le secret pour...").
CONTRAINTE : Max 150 caractères. Inclure 3 hashtags (#canicule #gadget #summer).
```

### Prompt LinkedIn (Rh-prospects)
```text
Tu es un consultant en stratégie RH.
TACHE : Analyse cette actualité et explique son impact sur le marché de l'emploi en 3 points clés.
TON : Professionnel, visionnaire.
```

---

## 3. Plan de Démarrage 30 Jours

| Phase | Objectif | Actions Clés |
| :--- | :--- | :--- |
| **Semaine 1** | Fondation | Connexion API X, YouTube, Drive. Test du flux "Source-to-All". |
| **Semaine 2** | Volume B2C | Automatisation Flash-Jour. 3 publications/jour sur TikTok. |
| **Semaine 3** | Autorité B2B | Lancement de la veille RH. 1 post LinkedIn/X par jour. |
| **Semaine 4** | Optimisation | Analyse des taux de clic (CTR). Ajustement des prompts. |

---
*Document conçu en mode GodMode par Jules.*

# Directives Projet FullRemote.Jobs

## 1. Déploiement & Routage Cloudflare Workers
- **Domaine Personnalisé & Wrangler** : Le fichier [wrangler.jsonc](file:///var/www/edounze/fullremote-jobs/wrangler.jsonc) DOIT TOUJOURS déclarer la route du domaine personnalisé :
  ```json
  "routes": [
    {
      "pattern": "remote-jobs.app",
      "custom_domain": true
    }
  ]
  ```
  *Sans cette directive, `wrangler deploy` ne met à jour que `workers.dev`, laissant `remote-jobs.app` sur d'anciennes versions en cache.*
- **Cache CDN Edge** : Le cache HTTP de production est configuré à `Cache-Control: public, max-age=60, s-maxage=900, stale-while-revalidate=86400`.

## 2. Emails Transactionnels & Domaine Expéditeur
- **Domaine Vérifié Resend** : Tous les emails d'alertes et de digest doivent être émis depuis le domaine vérifié DKIM/SPF :
  `FullRemote Jobs <alerts@hey.edounze.com>` (configuré dans [src/email.js](file:///var/www/edounze/fullremote-jobs/src/email.js) et le secret `RESEND_FROM_EMAIL`).

## 3. Génération de Code Client (JS-in-JS SSR)
- **Échappement des Variables Template** : Tout identifiant client généré dans un template literal serveur (`renderHTML`) DOIT être échappé : `\${variable}` et non `${variable}`.
- **Gestion des Apostrophes & Retours Chariot** :
  - Utiliser des guillemets doubles `"` pour les dictionnaires i18n et chaînes contenant des apostrophes.
  - Utiliser `[...].join(String.fromCharCode(10))` plutôt que `\n` brut dans les chaînes JS générées.
- **Validation VM Pré-déploiement** : Toujours valider la syntaxe du code client injecté via `node:vm` (`new vm.Script(...)`) avant tout déploiement.

## 4. Nettoyage HTML & Scraping
- Les descriptions brutes scrapées doivent être nettoyées avec `stripHtml()` multi-passes (décodage des entités HTML puis suppression des balises `<[^>]+>`) avant stockage dans Cloudflare D1.
- Côté client, utiliser `document.createElement('div')` avec `textContent` comme fallback de nettoyage DOM robuste.

## 5. UI/UX & SEO
- **Command Search Bar Sticky** : La barre de recherche unifiée reste ancrée (`position: sticky; top: 56px; z-index: 80;`).
- **Bilinguisme (i18n)** : Détection auto (`navigator.language` / `localStorage`) + sélecteur manuel (`#langToggleBtn`) + attributs `data-i18n`.
- **Schema.org JobPosting** : Lier explicitement `url` et `mainEntityOfPage` à `https://remote-jobs.edounze.com/jobs/:id` avec `jobLocationType: "TELECOMMUTE"` et `directApply: true`.

## 6. Politique Anti-Spam & Fréquence Notifications
- **Emails (Resend)** : **STRICT MAXIMUM 1 email par jour / par 24h** pour le digest d'annonces (`isAlertEligibleForEmail()`). Ne jamais envoyer plus d'un digest quotidien, même lors de rafraîchissements manuels ou d'exécutions répétées du scraper. Capé aux 10 meilleures opportunités.
- **Web Push Navigateur** : Diffusion en temps réel autorisée dès la détection de nouvelles offres.

## 7. Normalisation Stack Technique (Top 50 TIOBE & Frameworks)
- **Extraction Sémantique Multi-Flux** : Utiliser `extractTechStack(title, desc, rawTags)` basée sur `TIOBE_TECH_PATTERNS` pour indexer précisément les technologies (Top 50 TIOBE + High-Demand Remote : Elixir, Solidity, Rust, Go, etc.).
- **Liaison Hiérarchique** : Les frameworks doivent automatiquement hériter de leur langage parent (`Laravel`/`Symfony`/`WordPress` -> `PHP`, `FastAPI`/`Django` -> `Python`, `Flutter` -> `Dart`, `Phoenix` -> `Elixir`, `PL/SQL`/`T-SQL` -> `SQL`).
- **Purge de Fraîcheur 30 Jours** : Seules les offres publiées il y a moins de 30 jours doivent être persistées dans Cloudflare D1.

## 8. Programmatic SEO & Outils 10x Candidats
- **Pages d'Atterrissage Dédiées** : Maintenir le dictionnaire `PROGRAMMATIC_PAGES` dans [src/seo.js](file:///var/www/edounze/fullremote-jobs/src/seo.js) pour les routes dédiées par technologie et par région (`/remote-laravel-jobs`, `/remote-python-jobs`, etc.) et les référencer dans `generateSitemap()`.
- **Direct-to-DM Pitch & Geo-Arbitrage** : Intégrer systématiquement le générateur de pitch IA et le radar de pouvoir d'achat sur les pages `/jobs/:id` et dans la modal interactive de la page d'accueil.


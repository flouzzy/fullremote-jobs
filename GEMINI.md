# Directives Projet FullRemote.Jobs

## 1. Déploiement & Routage Cloudflare Workers
- **Domaine Personnalisé & Wrangler** : Le fichier [wrangler.jsonc](file:///var/www/edounze/fullremote-jobs/wrangler.jsonc) DOIT TOUJOURS déclarer la route du domaine personnalisé :
  ```json
  "routes": [
    {
      "pattern": "remote-jobs.edounze.com",
      "custom_domain": true
    }
  ]
  ```
  *Sans cette directive, `wrangler deploy` ne met à jour que `workers.dev`, laissant `remote-jobs.edounze.com` sur d'anciennes versions en cache.*
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

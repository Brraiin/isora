# Sécurité Isora

## État au 8 octobre 2026

Une faille critique d'administration est encore présente sur la production
contrôlée. Les corrections de ce dépôt sont locales et n'ont pas encore été
publiées par le chat d'audit. Ne pas publier une ancienne copie qui contient
le mot de passe codé en dur ou le secret de signature de secours.

Rapport complet et preuves nettoyées :
`/Users/skynn/Documents/Codex/Isora/Securite/README.md`.

## Configuration obligatoire avant publication du correctif

- `ISORA_ADMIN_PASSWORD_HASH` : format scrypt produit par le script ci-dessous.
- `ISORA_ADMIN_SECRET` : nouveau secret aléatoire de 32 octets encodé en hexadécimal.
- Variables Vercel de type Secret, pour Production ; aucun préfixe `VITE_`.
- Utiliser des valeurs distinctes en Preview si l'administration y est activée.

```bash
node scripts/create-admin-credentials.mjs /private/tmp/isora-admin-credentials
```

Le script refuse un dossier existant, crée le dossier en mode 0700 et écrit
les trois fichiers en mode 0600 sans afficher leurs valeurs. Conserver le
nouveau mot de passe dans un gestionnaire. Transmettre à Vercel le contenu des
fichiers de hash et de secret via son interface ou sa CLI, sans le copier dans
une conversation, un commit ou un log. Retirer les fichiers temporaires après
configuration. Ne jamais réutiliser les secrets historiques publiés.

Sans les deux variables valides, l'API ferme volontairement l'administration.
Les sessions utilisent un cookie HttpOnly, Secure, SameSite Strict, préfixé
`__Host-`, et expirent après huit heures. Une rotation du secret invalide les
sessions existantes. Les helpers internes se trouvent dans `server/`.

## Vérification

```bash
npm run security:check
npm run security:test
npm audit --audit-level=high
npm run claims:check
npm run seo
npm run build
node scripts/check-security.mjs --dist
```

Après un déploiement autorisé, vérifier la nouvelle connexion, le refus des
anciens accès, les en-têtes CSP et cache, les formulaires publics et les erreurs
runtime. Vérifier aussi les anciens déploiements encore accessibles. Les tests
API simulent GitHub et les notifications ; ils n'établissent pas la délivrance
d'un email réel. Le scanner local reconnaît des catégories de secrets et des
emails, mais ne remplace pas une revue manuelle et Gitleaks.

## Confidentialité et limites restantes

- Les contributions et statistiques sont stockées dans des issues du dépôt
  public `Brraiin/isora`. Une connexion au tableau de bord ne les rend pas
  privées. Choisir un stockage privé avant de promettre leur confidentialité.
- Le correctif n'enregistre plus les termes bruts de recherche par défaut.
  Ne pas activer `ISORA_STORE_SEARCH_ANALYTICS=true` tant que le stockage est
  public. Les données déjà publiées ne sont pas effacées par ce changement.
- Des adresses personnelles existent dans l'ancien historique public Git.
  Utiliser une adresse GitHub noreply pour les nouveaux commits ; ce réglage
  n'efface pas les précédents. Ne pas réécrire l'historique sans coordination.
- Les limites de requêtes dans `server/security.js` ne couvrent qu'une
  instance active. Préparer des limites partagées Vercel WAF sur les POST des
  trois API, observer en log, puis vérifier avant blocage.
- Activer et contrôler les protections de branche, Dependabot, MFA/passkeys,
  permissions minimales des tokens, alertes d'usage et moyens de récupération.
  Ces réglages de compte ne sont pas certifiés par les tests du dépôt.
- SPF est en softfail et DMARC en observation. Inventorier les expéditeurs
  légitimes et leurs signatures avant tout durcissement DNS.

Les contributions ne donnent pas d'accès à l'écriture des articles, des fiches
ou de Vercel. La publication du contenu passe par Git et le build. La protection
contre leur modification dépend aussi de la sécurité des comptes et de la
chaîne de publication.

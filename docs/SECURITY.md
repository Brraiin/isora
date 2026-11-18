# Sécurité Isora

## Reprise de publication — 18 novembre 2026

GitHub a retiré le 18 novembre l’avis
[GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
qui bloquait le lot éditorial du 17 novembre. Le mainteneur conteste la
qualification de vulnérabilité dans la
[discussion du projet](https://github.com/micromatch/picomatch/pull/235).
Le contrôle `npm audit --json` du 18 novembre retourne zéro vulnérabilité
avec les mêmes versions verrouillées, dont `picomatch@4.0.7`. Il s’agit d’un
retrait de l’avis, pas de l’installation d’un correctif. Aucun avis n’a été
masqué et aucune exception d’audit ajoutée. Le blocage constaté le 17 novembre
est donc levé. Sur le lot final du 18 novembre, l’installation verrouillée,
le classement des 114 fiches, le SEO (184 pages), le build et les 39 tests
passent, ainsi que les scans de secrets des sources et de `dist`. Les articles,
leurs liens vers les fiches, le classement, la recherche exacte et avec faute,
les filtres, la remise à zéro et l’affichage mobile ont été contrôlés dans
l’aperçu local. Un audit sans alerte ne garantit pas l’absence de toute
vulnérabilité.

## Historique de l’audit — 17 novembre 2026

L’installation verrouillée signale cinq entrées de gravité élevée liées à un
même avis : [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
(CVE-2026-112366), réévalué le 17 novembre. La chaîne actuelle est
`vite@8.1.6` → `picomatch@4.0.7`, aussi via `tinyglobby@0.2.17` et `fdir@6.5.0`.
Les autres entrées de l’audit sont des remontées de cette dépendance, notamment
vers `@vitejs/plugin-react` ; ce ne sont pas cinq failles distinctes.

L’avis indique qu’aucune version corrigée n’est publiée au moment du contrôle.
Le registre donne encore `4.0.7` comme dernière version de picomatch. Aucun
`npm audit fix --force`, changement majeur de Vite ou override non vérifié n’a
été appliqué. L’avis concerne un déni de service par des motifs glob malveillants.
Aucun import de picomatch/tinyglobby/fdir ni entrée de motifs glob n’a été trouvé
dans les handlers API, le serveur applicatif ou le code client d’Isora ; le seul
import direct de Vite du projet est dans sa configuration de build. Ce constat
limité ne constitue pas une preuve générale de non-exploitabilité de la chaîne.

La veille du 17 novembre a été conservée en local, sans commit, push ni
déploiement ce jour-là, en raison de cet échec de l’audit requis. Le classement,
le SEO, le build, les 39 tests et les scans de secrets passaient sur le lot
préparé. Le retrait de l’avis et la reprise du 18 novembre sont documentés
ci-dessus ; cet historique ne constitue plus un blocage actif.

## État au 12 octobre 2026

Le correctif d'administration a été publié avec autorisation d’Eve : commit
`5ef3cf223f92f04a3deff78af4c6577d775ebb07`, déploiement Production READY
`dpl_EMEU82QEQ4cJ6SsxJ4LqRj1fhWqi`. Les deux nouveaux secrets ont été
configurés en Production. La nouvelle connexion, le refus de l’ancien mot de
passe et d’une session historique signée avec l’ancien secret ont été vérifiés.
Ne pas publier ni rétablir une ancienne copie contenant les accès historiques.

L’ancienne URL du dernier déploiement est protégée par le SSO Vercel ; toutes
les anciennes URLs n’ont pas été auditées. Le correctif ne résout pas les limites
de stockage public et de contrôle des comptes décrites ci-dessous.

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

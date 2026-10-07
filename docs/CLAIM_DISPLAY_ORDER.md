# Ordre de présentation des fiches

Décision éditoriale d’Eve du 7 octobre 2026 : présenter d’abord les sujets ayant
la portée sociale la plus large, puis les sujets plus ciblés, en conservant
l’alternance hommes/femmes tant que les deux listes contiennent des fiches.
La première fiche est l’espérance de vie et la mortalité masculine en France.

L’ordre est centralisé dans `src/data/claim-display-order.json`. L’accueil
interactif, ses filtres sans recherche, ses exemples HTML initiaux et l’index
statique par domaine utilisent cette priorité. La recherche garde son classement
par correspondance à la requête ; la priorité éditoriale départage les égalités.
Les données et les dates de vérification des fiches ne changent pas.

Critères qualitatifs, à considérer ensemble :

- Nombre et étendue des personnes concernées.
- Gravité des conséquences : décès, violences, santé, privation de droits.
- Ampleur de l’écart documenté et solidité des données.
- Effets durables sur le travail, les revenus, l’éducation et la famille.
- Portée actuelle ; les cas locaux, sous-populations étroites, débats de perception
  et repères historiques viennent généralement après les grands enjeux actuels.

Il s’agit d’un choix éditorial de navigation, pas d’un score scientifique de gravité.
Les pourcentages, ratios, effectifs et restrictions juridiques n’ont pas tous le
même dénominateur et ne se comparent pas automatiquement. Une forte proportion
sur quelques centaines de cas, comme le mpox, ne passe pas devant la mortalité
générale. La fiche mpox reste accessible et arrive en dernier dans le filtre hommes.

## Obligation à chaque veille et à chaque ajout de fiche

Cette règle s’applique au job `JOB Veille quotidienne Isora`, aux veilles
manuelles, aux intakes sociaux et à toute autre création ou modification de fiche.
La récence d’une publication ou l’ordre des objets dans `claims.ts` ne détermine
jamais sa place dans le référentiel. Un article de veille peut traiter un sujet
étroit sans que sa fiche doive devenir prioritaire sur l’accueil.

À chaque exécution de veille :

1. Lire ce document, le classement courant et les fiches avant de choisir le sujet.
2. Examiner la pertinence des nouvelles fiches et des fiches actualisées par
   rapport à l’ensemble du référentiel : population concernée, gravité,
   ampleur de l’écart documenté, effets sociaux durables et solidité des preuves.
   Réexaminer la cohérence d’ensemble, notamment les premières et dernières
   fiches. Un ratio élevé, une date récente ou une source nouvellement trouvée
   ne justifient pas à eux seuls de monter une fiche.
3. Si une fiche est créée, inscrire son ID dans `src/data/claim-display-order.json`
   à une place justifiée parmi les fiches du même sexe. Si une actualisation
   change matériellement sa portée, revoir sa place ; sinon préserver l’ordre.
   Éviter les doublons thématiques inutiles. Un sujet insuffisamment documenté
   reste en veille plutôt que de produire une fiche fragile.
4. Réentrelacer les deux listes en commençant par les hommes, puis les femmes,
   sans changer les priorités internes. Quand une liste est épuisée, ajouter les
   fiches restantes de l’autre sexe. La première fiche reste `hommes-esperance-vie`.
5. Contrôler qu’aucune fiche n’a disparu du classement, que chaque ID figure
   exactement une fois et qu’aucun ID supprimé ne reste référencé. En cas de
   suppression ou de fusion de fiche, nettoyer le classement correspondant.
6. Exécuter `npm run claims:check`, puis `npm run seo` et `npm run build`.
   Vérifier les premières fiches dans l’aperçu : priorité sociale, alternance,
   ordre des filtres et recherche spécifique toujours disponible. Ne pas publier
   si un contrôle échoue ; corriger le classement et relancer les contrôles.
7. Dans le compte rendu de chaque veille, indiquer « classement vérifié,
   conservé » ou les fiches déplacées et leur raison. En cas d’ajout ou de
   déplacement, consigner une courte justification datée dans
   `docs/CLAIM_ORDER_REVIEWS.md` et inclure le fichier de classement dans le
   même commit que les nouvelles fiches. Aucun reclassement artificiel n’est
   nécessaire si la pertinence relative n’a pas changé.

Le contrôle `claims:check` lit directement `src/data/claims.ts`. Il vérifie la
couverture complète, les IDs uniques et existants, la première fiche et
l’alternance. Le même contrôle est intégré à la génération SEO, donc aussi au
`prebuild` : une nouvelle fiche non classée bloque la génération et le build.
`npm run claims:test` vérifie ces protections avec des cas de régression.

Le contrôle technique ne mesure pas la pertinence sociale. L’agent de veille
doit effectuer et expliquer la décision éditoriale ; il ne doit jamais réparer
une erreur de classement en ajoutant tous les IDs en fin de liste sans examen.
Le repli de l’interface en fin de liste sert uniquement pendant le travail local,
pas de dispense avant publication.

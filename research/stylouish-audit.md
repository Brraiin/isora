# Audit Stylouish - 16 juin 2026

Profil cible : https://www.tiktok.com/@stylouish

## Acces au profil

- Le profil public repond, avec le compte `@stylouish`, 81,7 k abonnes environ, 5,0 M de likes et 945 videos indiquees par TikTok.
- L'HTML public ne contient pas la liste des videos : `itemList` est vide.
- L'endpoint TikTok `/api/post/item_list/` a ete identifie et appele via Chromium avec les signatures `X-Bogus` / `X-Gnarly`, mais les reponses publiques etaient vides (`content-length: 0`).
- Conclusion : l'inventaire complet des 945 videos n'a pas pu etre extrait sans acces TikTok authentifie ou export fourni.

## Contenus indexables observes

- Des miroirs Instagram publics de `@stylouish` sont indexables, mais les resultats accessibles etaient surtout des cas narratifs ou d'actualite.
- Exemple observe : une video Instagram du 18 fevrier 2026 sur de fausses accusations, avec une source Le Parisien mentionnee dans le snippet. Cette entree n'a pas ete transformee en fiche Isora, car elle documente un cas individuel et non une asymetrie statistique robuste.
- Exemple observe : une video Instagram du 8 fevrier 2026 sur Sarah Stock / Elijah Schaffer. Non retenu : sujet narratif, pas une asymetrie documentee exploitable par Isora.

## Source retenue

Source institutionnelle verifiee : Ministere de l'Interieur / SSMSI, "Violences conjugales enregistrees par les services de securite : quasi-stabilisation en 2024", publie le 23 octobre 2025.

Donnees utilisees :

- 272 400 victimes de violences commises par partenaire ou ex-partenaire enregistrees en 2024.
- 84 % des victimes sont des femmes.
- 85 % des mis en cause sont des hommes.

Fiche ajoutee : `hommes-mis-en-cause-violences-conjugales-france`.

Note editoriale : la fiche est classee en `violence_exercée`, pas en `désavantage_subi`, pour distinguer clairement l'asymetrie des auteurs presumes des fiches sur les victimes.

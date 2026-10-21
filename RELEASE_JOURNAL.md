# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "e4129bdb05d4ddfd421d8afd9f1b60ff6a7cb595", "updated": {"dev": "2026-10-21 11:00 UTC", "staging": "2026-10-20 19:01 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `e4129bd` | 2026-10-20 19:01 UTC |
| dev | — | `c4beb3a` | 2026-10-21 11:00 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Ouvrir un événement lit désormais `GET /calendar/events/{id}` pour récupérer ses droits (`canEdit`, `canDelete`, `canValidate`), son créateur et sa description. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Messages de confirmation (toast, fermable) après création, modification, suppression, approbation ou refus d'un événement. (MAIR-126, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Placeholder de chargement, lien d'évitement en tête de page et thème partagé (lib-components 0.9.0). (MAIR-126, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- Le contrat du BFF Calendar passe à 1.0.0 (`contracts/openapi.json`) : il ajoute `GET /calendar/events/{id}` et documente une réponse 429 (`Retry-After`) sur plusieurs routes. Aucun traitement spécifique du 429 n'apparaît dans les diffs. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Les fronts importent le socle partagé depuis `@mairie360/lib-components` (sous-chemins) au lieu de `@mairie360/front-kit`. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269))

#### Corrections
- Avant : la fenêtre de détail d'un événement n'affichait jamais Modifier, Supprimer ni Valider, car les listes du BFF ne portaient plus les droits. Maintenant : les actions apparaissent quand la lecture du détail répond ; un refus garde l'événement visible sans action et affiche le message du BFF. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Stacks de test : images BFF Calendar 1.0.0, API 1.1.0, core 2.1.0, base et Liquibase 3.2.0 au lieu des builds `dev-*`. ([#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Test de bundle client (`npm run test:bundle`) et tests de non-régression ajoutés. ([#273](https://github.com/mairie360/Calendars_Web_Service/pull/273), [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269))
- Workflows CI : permissions en lecture seule par défaut, déclenchement sur push limité à `main`, `mairie360/CICD` en v4.3.1 puis v4.4.3, promotion staging/prod manuelle. ([#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271), [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))
- Pins de release (dev, staging, prod) et BFF Calendar 1.1.0 en dev. (MAIR-575, MAIR-600, MAIR-612)
- Mises à jour d'images Renovate : `calendar-api` 1.2.0, `core-api` 2.2.0, `database` et `liquibase-migrations` 3.3.0. ([#288](https://github.com/mairie360/Calendars_Web_Service/pull/288), [#289](https://github.com/mairie360/Calendars_Web_Service/pull/289), [#290](https://github.com/mairie360/Calendars_Web_Service/pull/290))

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Le front et les stacks de test utilisent désormais le BFF Calendar en 1.1.0 (`ghcr.io/mairie360/bff-calendar:1.1.0`, `contracts/source.json` au commit 3012a41) au lieu du build staging f6bf247. `contracts/openapi.json` reste identique. (MAIR-612, [#291](https://github.com/mairie360/Calendars_Web_Service/pull/291))

#### Technique
- Stacks de test (`docker-compose*.yml`) : `bff-user` passe de 1.0.0 à 1.1.0, `calendar-api` de 1.1.0 à 1.2.0, `core-api` de 2.1.0 à 2.2.0, `database` et `liquibase-migrations` de 3.2.0 à 3.3.0. Le code de ces services n'est pas dans les diffs, donc leur effet réel reste à vérifier. ([#291](https://github.com/mairie360/Calendars_Web_Service/pull/291), [#288](https://github.com/mairie360/Calendars_Web_Service/pull/288), [#289](https://github.com/mairie360/Calendars_Web_Service/pull/289), [#290](https://github.com/mairie360/Calendars_Web_Service/pull/290))
- Workflows : `mairie360/CICD` passe en v4.4.3 (correction de la promotion, [#280](https://github.com/mairie360/Calendars_Web_Service/pull/280)). Ajout de `promote-staging.yml` et `promote-prod.yml` (promotion manuelle), et `cicd.yml` s'arrête à `release-dev` sur push vers `main` ([#284](https://github.com/mairie360/Calendars_Web_Service/pull/284)).

## Différence staging → prod (en staging, pas encore en prod)

#### Nouveautés
- Toast de confirmation, fermable, après création, modification, suppression, approbation ou refus d'un événement (par exemple « Événement « … » supprimé. »). (MAIR-126, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Placeholder de chargement pendant la lecture du calendrier, et lien d'évitement placé avant la navigation. (MAIR-126, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- Le contrat du BFF Calendar passe à 1.0.0 : il ajoute `GET /calendar/events/{id}` et documente une réponse 429 (`Retry-After`) sur plusieurs routes. Aucun traitement spécifique du 429 n'apparaît dans les diffs. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Ouvrir un événement affiche l'événement tout de suite, puis lit `GET /calendar/events/{id}` pour compléter ses actions. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Les couleurs de fond, de texte et d'accent viennent des variables du thème partagé, et la feuille `municipal-theme.css` est supprimée. Le rendu visuel peut donc changer. (MAIR-126, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Avant : la fenêtre de détail d'un événement n'affichait jamais Modifier, Supprimer ni Valider, car les listes du BFF ne portaient plus les droits. Maintenant : ces actions apparaissent quand la lecture du détail répond. Un refus garde l'événement visible sans action et affiche le message du BFF. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Les fronts importent le socle partagé depuis les sous-chemins de `@mairie360/lib-components` (version 0.10.2) au lieu de `@mairie360/front-kit`, sans changement de comportement attendu. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))
- Stacks de test : BFF Calendar staging f6bf247 puis 1.0.0, API 1.1.0, core 2.1.0, base et Liquibase 3.2.0. ([#277](https://github.com/mairie360/Calendars_Web_Service/pull/277), [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Workflows CI : permissions en lecture seule par défaut, déclenchement sur push limité à `main`, `mairie360/CICD` en v4.3.2 puis v4.3.1 (secrets du journal de release). Journal de release généré par Claude sur `main`. ([#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))
- Mises à jour Renovate en staging : `core-api` 2.2.0 et `calendar-api` 1.2.0 ne sont pas dans cette plage ; seules les versions de la plage précédente sont présentes. Le `Dockerfile` passe à Node 24.21.0 (décrit dans la PR, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259)).

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-21 11:00 UTC | dev | — | `c4beb3a` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39587571414) |
| 2026-10-21 10:58 UTC | dev | — | `726df74` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39585029915) |
| 2026-10-21 10:57 UTC | dev | — | `9c5453b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39585115106) |
| 2026-10-21 10:56 UTC | dev | — | `b4f0ae5` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39584997281) |
| 2026-10-21 10:52 UTC | dev | — | `0f95062` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39584859301) |
| 2026-10-21 03:27 UTC | dev | — | `062845e` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39538125565) |
| 2026-10-20 19:01 UTC | staging | — | `e4129bd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39478616869) |
| 2026-10-20 18:57 UTC | dev | — | `e4129bd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39478616869) |
| 2026-10-20 13:40 UTC | dev | — | `dcbfb02` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39431647621) |
| 2026-10-20 12:23 UTC | dev | — | `4d59302` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39421275988) |
| 2026-10-19 22:13 UTC | dev | — | `fe1296b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39332782417) |
| 2026-10-19 21:58 UTC | dev | — | `5c3debe` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39330879464) |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->

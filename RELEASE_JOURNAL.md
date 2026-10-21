# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "b4f0ae578cca3cb0ede06762a1e2b79adc7ec2fc", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "e4129bdb05d4ddfd421d8afd9f1b60ff6a7cb595", "updated": {"dev": "2026-10-21 10:56 UTC", "staging": "2026-10-20 19:01 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `e4129bd` | 2026-10-20 19:01 UTC |
| dev | — | `b4f0ae5` | 2026-10-21 10:56 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Ouvrir un événement appelle désormais `GET /calendar/events/{id}` : la fenêtre de détails s'affiche aussitôt, puis la réponse complète l'événement avec `canEdit`, `canDelete`, `canValidate`, `createdById` et `description`. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Après une création, une modification, une suppression, une approbation ou un refus, un message de confirmation s'affiche (« Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. »). Un squelette de chargement remplace le texte pendant la lecture du calendrier. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- Le contrat BFF Calendar passe en 1.0.0 : les listes bootstrap et période ne portent plus `canEdit`, `canDelete`, `canValidate`, `createdById` ni `description`. Le front ignore les droits présents dans ces listes et n'affiche Modifier, Supprimer ou Valider qu'après la réponse de `GET /calendar/events/{id}`. Un appelant qui lit les droits dans les listes ne les trouve plus. (02f5ff1, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264) ; 68a218c, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Le contrat ajoute une réponse 429 (limite de débit, `Retry-After`) sur les routes calendrier. (02f5ff1, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Le thème et les composants viennent de `@mairie360/lib-components` 0.9.0 puis 0.10.2 : la feuille `municipal-theme.css` est retirée et un lien d'évitement précède la navigation. (199dacb, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262) ; fe1296b / 5c3debe, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269))
- Les pushs sur `main` ne vont plus jusqu'à staging ni prod : la promotion staging et prod est manuelle. (062845e, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))

#### Corrections
- Fenêtre de détails d'un événement. Avant : Modifier, Supprimer et Valider n'apparaissaient jamais, les listes ne portant plus les droits. Maintenant : ces actions apparaissent à la réponse de la lecture détaillée. Une réponse tardive ne remplace pas un autre événement sélectionné, une mutation confirmée annule une lecture antérieure, et une lecture refusée garde l'événement visible sans action en affichant le message du BFF. (68a218c, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Dépendances CICD mises à jour jusqu'à v4.4.3 avec promotion séparée (4d59302, 0eecbe1, 0f95062, [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#280](https://github.com/mairie360/Calendars_Web_Service/pull/280)). Journal de release rédigé par Claude, secrets transmis au workflow réutilisable.
- CI : `cicd.yml` et `contracts.yml` tournent sur push vers `main` seulement, le jeton est en lecture seule par défaut et seul le job de release reçoit les droits d'écriture. (11205c7, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259))
- `@mairie360/front-kit` est retiré au profit de `@mairie360/lib-components` 0.10.2, avec un test de bundle client. (5c3debe, fe1296b)
- Dépendance contrat : `@mairie360/bff-calendar-openapi` est d'abord épinglé sur un artefact dev (dcbfb02, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275)), puis sur un artefact staging `0.0.0-staging.f6bf247…` (e4129bd, [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277)).
- Stacks de test : images `database` et `liquibase-migrations` en 3.2.0, `core-api` en 2.1.0, `calendar-api` en 1.1.0, `bff-user` en 1.0.0 (02f5ff1, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264)). `bff-calendar` passe de `dev-45c8598` à `staging-f6bf247` (e4129bd).

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Le push sur `main` ne déclenche plus la mise en staging ni en prod : `cicd.yml` s'arrête à `release-dev`. Staging se lance avec `gh workflow run promote-staging.yml`, éventuellement avec `-f sha=<sha>`, et l'environnement `Staging` garde son approbation. (062845e, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))

#### Technique
- Le CICD passe en v4.4.3 avec la séparation de la promotion staging et prod (MAIR-494), et le workflow réutilisable est épinglé sur ce commit. (0f95062, [#280](https://github.com/mairie360/Calendars_Web_Service/pull/280))
- Ajout de `promote-staging.yml` et `promote-prod.yml`, de la documentation de promotion dans `CLAUDE.md`, de `tests/cicd-pin.test.cjs` et de `follow-redirects` 1.16.1 dans le lockfile pour `npm audit`. (062845e, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))
- Dans `docker-compose.yml` et les stacks de test, les images `database` et `liquibase-migrations` passent de 3.2.0 à 3.3.0. Le diff ne détaille pas le changement de schéma. (b4f0ae5, [#290](https://github.com/mairie360/Calendars_Web_Service/pull/290))

## Différence staging → prod (en staging, pas encore en prod)

#### Nouveautés
- Ouvrir un événement appelle désormais `GET /calendar/events/{id}` : la fenêtre de détails s'affiche aussitôt, puis la réponse complète l'événement avec ses droits et ses champs de détail. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Messages de confirmation après création, enregistrement, suppression, approbation ou refus d'un événement, et squelette de chargement pendant la lecture du calendrier. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- Le BFF Calendar passe en contrat 1.0.0, avec une réponse 429 documentée sur les routes calendrier. Les listes bootstrap et période ne portent plus les droits : Modifier, Supprimer et Valider n'apparaissent qu'après la lecture détaillée. (02f5ff1, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264) ; 68a218c, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Le front passe sur les sous-chemins publics de `@mairie360/lib-components` 0.10.2, et la feuille de thème locale `municipal-theme.css` est retirée. Un lien d'évitement précède la navigation répétée. (199dacb, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262) ; 5c3debe, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269))

#### Corrections
- Fenêtre de détails d'un événement. Avant : Modifier, Supprimer et Valider n'étaient jamais affichés. Maintenant : ces actions apparaissent à la réponse de la lecture détaillée. Une réponse tardive ne remplace pas la sélection en cours, une mutation confirmée annule une lecture antérieure, et une lecture refusée garde l'événement sans action en affichant le message du BFF. (68a218c, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Le contrat `@mairie360/bff-calendar-openapi` est épinglé sur l'artefact staging `0.0.0-staging.f6bf247…`, et les stacks de test utilisent `bff-calendar:staging-f6bf247`. (e4129bd, [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277) ; dcbfb02, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275))
- Le CICD passe en v4.3.1 puis v4.3.2 avec les secrets du journal de release, et les références CICD sont épinglées avec leur tag (0eecbe1, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267) ; 4d59302, [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271)).
- Les workflows `cicd.yml` et `contracts.yml` ne tournent sur push que pour `main`, avec un jeton en lecture seule par défaut (11205c7, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259)).
- Test de bundle client qui vérifie que le build n'embarque pas les entrées inutilisées de la lib (fe1296b, [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273) ; 5c3debe).

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
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

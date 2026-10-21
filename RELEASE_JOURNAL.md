# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "9c5453be44bd2a222247394ddf21a5a58eb765ac", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "e4129bdb05d4ddfd421d8afd9f1b60ff6a7cb595", "updated": {"dev": "2026-10-21 10:58 UTC", "staging": "2026-10-20 19:01 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `e4129bd` | 2026-10-20 19:01 UTC |
| dev | — | `9c5453b` | 2026-10-21 10:58 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Ouvrir un événement lit désormais `GET /calendar/events/{id}` : la fenêtre de détails affiche Modifier, Supprimer et Valider à la réponse de cette lecture. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Après création, modification, suppression ou validation d'un événement, un message de confirmation fermable s'affiche (« Événement « … » créé. », « enregistré. », « supprimé. », « approuvé » ou « refusé »). (shared UI 0.9.0, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le chargement du calendrier affiche un squelette à la place du seul texte. (shared UI 0.9.0, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le contrat BFF Calendar passe à 1.0.0 : il ajoute `GET /calendar/events/{id}` et documente une réponse 429 avec `Retry-After` sur les routes Calendar ; le proxy accepte la nouvelle route. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
#### Changements de comportement
- Les listes bootstrap et périodes ne transportent plus `canEdit`, `canDelete`, `canValidate`, `createdById` ni `description` : un appelant qui lisait ces champs dans les listes doit passer par `GET /calendar/events/{id}`. (BFF_Calendar, MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Le thème vient désormais de la feuille de style publiée de lib-components : `municipal-theme.css` est supprimé et les couleurs passent par des variables CSS. (shared UI 0.9.0, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
#### Corrections
- Modifier, Supprimer et Valider manquaient dans la fenêtre de détails, car les listes ne portaient plus les droits. Maintenant ces actions apparaissent à la réponse de la lecture du détail ; une lecture refusée garde l'événement visible sans action et affiche le message du BFF ; une lecture plus ancienne ne remplace plus la sélection courante ni un statut confirmé. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Les sélecteurs de tiroir mobile sont restreints afin de ne plus déplacer la navigation desktop partagée. (shared UI 0.9.0, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
#### Technique
- `@mairie360/front-kit` (archive vendored) est remplacé par `@mairie360/lib-components` 0.10.2 importé par sous-chemins, sans changement de comportement voulu ; un test vérifie que le bundle client n'embarque pas les entrées inutilisées. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))
- Les stacks de test et le `docker-compose.yml` local passent aux images prod : calendar-api 1.1.0, core-api 2.1.0, database et liquibase 3.2.0, bff-user 1.0.0, bff-calendar 1.0.0. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- CICD passe en v4.3.1 puis v4.3.2 avec épinglage par SHA ; `RELEASE_JOURNAL.md` est réécrit sur `main` à chaque release. (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))
- Les workflows CI ne se lancent en push que sur `main`, avec un jeton en lecture seule par défaut ; le Dockerfile épingle Node 24.21.0. (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259))
- Les rendus du calendrier et les tests de bundle sont ajustés ; sans effet visible. (MAIR-126, [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Un push sur `main` ne lance plus que la release dev : `cicd.yml` s'arrête à `release-dev`. Staging et prod se déclenchent à la main via `promote-staging.yml` et `promote-prod.yml`. (MAIR-494, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))
- Les stacks de test et le `docker-compose.yml` local passent à calendar-api 1.2.0, core-api 2.2.0 et database / liquibase-migrations 3.3.0. (renovate, [#288](https://github.com/mairie360/Calendars_Web_Service/pull/288), [#289](https://github.com/mairie360/Calendars_Web_Service/pull/289), [#290](https://github.com/mairie360/Calendars_Web_Service/pull/290))
#### Technique
- CICD est épinglé en v4.4.0 puis v4.4.3 (correction MAIR-494 du workflow de promotion) ; `cicd_version` est regroupé sur quatre fichiers et `tests/cicd-pin.test.cjs` compte 8 références. ([#280](https://github.com/mairie360/Calendars_Web_Service/pull/280), [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))
- `follow-redirects` passe en 1.16.1 dans le lockfile, ce qui débloque `npm audit`. (MAIR-494, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))

## Différence staging → prod (en staging, pas encore en prod)

#### Changements de comportement
- Le contrat `@mairie360/bff-calendar-openapi` pointe d'abord sur un build dev (`45c8598`, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275)), puis sur le build staging `0.0.0-staging.f6bf247…` ; les stacks utilisent `bff-calendar:staging-f6bf247`. Le contrat est identique au commit BFF précédent. (MAIR-575 et MAIR-600, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277))
- Les listes bootstrap et périodes ne transportent plus les droits ni `description` ; le détail d'un événement se lit via `GET /calendar/events/{id}`. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
#### Corrections
- Modifier, Supprimer et Valider apparaissent dans la fenêtre de détails à la réponse de la lecture du détail ; avant, ils manquaient. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
#### Nouveautés
- Confirmations fermables après création, modification, suppression ou validation, et squelette de chargement du calendrier. (shared UI 0.9.0, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le contrat BFF Calendar ajoute `GET /calendar/events/{id}` et des réponses 429. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
#### Technique
- Le front n'importe plus `@mairie360/front-kit` vendored mais `@mairie360/lib-components` 0.10.2 par sous-chemins ; le test de bundle client est ajouté. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))
- CICD v4.3.1 puis v4.3.2 ; `RELEASE_JOURNAL.md` est réécrit sur `main` à chaque release. (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))
- Les workflows CI ne se lancent en push que sur `main`, avec un jeton en lecture seule par défaut. (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259))

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
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

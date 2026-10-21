# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "0f95062ec1153b71ee5d9ac8e656d2e70ade716f", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "e4129bdb05d4ddfd421d8afd9f1b60ff6a7cb595", "updated": {"dev": "2026-10-21 10:52 UTC", "staging": "2026-10-20 19:01 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `e4129bd` | 2026-10-20 19:01 UTC |
| dev | — | `0f95062` | 2026-10-21 10:52 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Nouvelle route `GET /calendar/events/{id}` dans le contrat `@mairie360/bff-calendar-openapi` 1.0.0 ; le front la lit à l'ouverture d'un événement. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Message de confirmation (toast fermable) après création, modification, suppression, validation ou refus d'un événement ; squelette de chargement pendant la lecture ; lien d'évitement en tête de page. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
#### Changements de comportement
- Un push sur `main` ne lance plus que la release dev ; staging et prod se font à la main via `promote-staging.yml` et `promote-prod.yml`. (MAIR-494, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))
- Le contrat documente une réponse 429 (en-tête `Retry-After`) sur les routes calendrier : un appelant doit la prendre en compte. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Thème visuel repris des variables de lib-components 0.9.0 ; `municipal-theme.css` est supprimé, l'aspect des écrans change. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
#### Corrections
- Fenêtre de détails d'un événement. Avant : Modifier, Supprimer et Valider n'apparaissaient jamais, les listes du BFF ne portant plus les droits. Maintenant : l'événement s'affiche aussitôt, puis la lecture de `GET /calendar/events/{id}` complète les actions ; une lecture refusée garde l'événement sans action et affiche le message du BFF. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
#### Technique
- Renovate fait passer mairie360/CICD de v4.4.0 à v4.4.3 ([#280](https://github.com/mairie360/Calendars_Web_Service/pull/280)) ; le journal des releases (étape Release journal, secrets `ANTHROPIC_API_KEY`, `RELEASE_APP_ID`, `RELEASE_APP_PK`) arrive avec CICD v4.3.1 ([#267](https://github.com/mairie360/Calendars_Web_Service/pull/267)), et les références CICD sont épinglées avec leur tag ([#271](https://github.com/mairie360/Calendars_Web_Service/pull/271)).
- `cicd.yml` et `contracts.yml` ne se déclenchent sur push que pour `main`, le jeton est en lecture seule par défaut, et seul le job CICD reçoit les droits d'écriture (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259)).
- `@mairie360/front-kit` est remplacé par `@mairie360/lib-components` 0.10.2, sans changement de comportement annoncé ; `npm run test:bundle` vérifie le bundle client (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273)).
- Les stacks de test passent aux images prod (`bff-calendar` 1.0.0, `calendar-api` 1.1.0, `core-api` 2.1.0, `database` et `liquibase-migrations` 3.2.0) (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264)).
- Les pins du contrat et des images ont bougé plusieurs fois dans cette plage (builds dev MAIR-575, staging MAIR-600, puis 1.0.0) ; l'état final se lit dans `package.json` et `contracts/source.json`.

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Un push sur `main` ne lance plus que la release dev : `cicd.yml` s'arrête à `release-dev`. Staging et prod se déclenchent à la main via `promote-staging.yml` et `promote-prod.yml` (`workflow_dispatch`, `sha` optionnel). (MAIR-494, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))
#### Technique
- Renovate fait passer mairie360/CICD de v4.4.0 à v4.4.3 dans les trois workflows, avec le même commit épinglé. ([#280](https://github.com/mairie360/Calendars_Web_Service/pull/280))
- `tests/cicd-pin.test.cjs` couvre désormais les huit références CICD des quatre workflows, et `CLAUDE.md` décrit la promotion. (MAIR-494, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))

## Différence staging → prod (en staging, pas encore en prod)

#### Nouveautés
- Nouvelle route `GET /calendar/events/{id}` dans le contrat `@mairie360/bff-calendar-openapi` 1.0.0, avec description, créateur, membres et droits `canEdit`, `canDelete`, `canValidate` ; réponses documentées 200, 400, 401, 403, 404, 429, 500, 502, 503. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Messages de confirmation après création, modification, suppression et validation ou refus d'un événement (« Événement « … » créé. », « enregistré. », « supprimé. », « approuvé. » ou « refusé. »), dans un toast fermable ; squelette de chargement pendant la lecture ; lien d'évitement en tête de page. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
#### Changements de comportement
- Le contrat documente une réponse 429 (en-tête `Retry-After`) sur les routes calendrier : un appelant doit la gérer. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Thème visuel repris des variables de lib-components 0.9.0 ; `municipal-theme.css` est supprimé, l'aspect des écrans change. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Les actions de la fenêtre de détails n'apparaissent qu'après la réponse de `GET /calendar/events/{id}` ; une lecture refusée garde l'événement sans action et affiche le message du BFF. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
#### Corrections
- Fenêtre de détails d'un événement. Avant : Modifier, Supprimer et Valider n'apparaissaient jamais, les listes du BFF ne portant plus les droits. Maintenant : l'événement s'affiche aussitôt, puis la lecture complète les actions ; une réponse tardive ne remplace pas une autre sélection, et une mutation confirmée annule une lecture lancée avant elle. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
#### Technique
- Le journal des releases arrive avec mairie360/CICD v4.3.1 : l'étape Release journal réécrit `RELEASE_JOURNAL.md` sur `main`, avec les secrets `ANTHROPIC_API_KEY`, `RELEASE_APP_ID` et `RELEASE_APP_PK` transmis par `cicd.yml`. (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267))
- Les références CICD sont épinglées avec leur tag (v4.3.2 puis v4.4.0 sur cette plage), et Renovate les suit ensemble ; `tests/cicd-pin.test.cjs` le vérifie. (MAIR-571, [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))
- `cicd.yml` et `contracts.yml` ne se déclenchent sur push que pour `main`, le jeton est en lecture seule par défaut, et seul le job CICD reçoit les droits d'écriture (`tests/workflow-permissions.test.cjs`). (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259))
- `@mairie360/front-kit` est remplacé par `@mairie360/lib-components` 0.10.2 (imports `@mairie360/lib-components/<entrée>`), sans changement de comportement annoncé ; l'archive vendue est supprimée. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269))
- `npm run test:bundle` vérifie que le bundle client n'embarque ni entrée lib inutilisée ni code serveur de la lib (MAIR-126, [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273)).
- Les pins du contrat et des images de test changent plusieurs fois (builds dev MAIR-575 et staging MAIR-600, puis releases 1.0.0 MAIR-569) ; l'état final se lit dans `package.json` et `contracts/source.json`. ([#275](https://github.com/mairie360/Calendars_Web_Service/pull/275), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277))

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
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

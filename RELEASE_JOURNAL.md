# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "9c5453be44bd2a222247394ddf21a5a58eb765ac", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "e4129bdb05d4ddfd421d8afd9f1b60ff6a7cb595", "updated": {"dev": "2026-10-21 10:57 UTC", "staging": "2026-10-20 19:01 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `e4129bd` | 2026-10-20 19:01 UTC |
| dev | — | `9c5453b` | 2026-10-21 10:57 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Ouvrir un événement (clic ou lien `?event=`) l'affiche aussitôt, puis lit `GET /calendar/events/{id}` pour compléter la fenêtre de détails. Une lecture refusée garde l'événement visible sans action et affiche le message du BFF. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Après création, modification, suppression ou validation d'un événement, un bandeau de confirmation s'affiche (par exemple « Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. »). (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement du calendrier, un placeholder remplace le texte seul ; les résultats vides sont libellés ; un lien d'évitement unique précède la navigation. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- Les listes `GET /calendar/bootstrap` et des périodes ne portent plus `canEdit`, `canDelete`, `canValidate`, `createdById` ni `description` côté BFF : le front ne doit plus les attendre dans les listes. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Le front n'utilise plus `@mairie360/front-kit` ni les archives `vendor/` correspondantes ; il importe `@mairie360/lib-components` (0.10.2) par sous-chemins, et les styles viennent de la feuille publiée de lib-components (0.9.0 puis 0.10.2). Les couleurs passent par des variables CSS `--mairie-*` et `municipal-theme.css` est supprimé. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269) ; [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Avant : les actions Modifier, Supprimer et Valider n'apparaissaient jamais dans le détail d'un événement, car les listes ne transmettaient pas les droits. Maintenant : elles apparaissent à la réponse de `GET /calendar/events/{id}`, et une réponse tardive ne remplace pas la sélection courante. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Contrat `@mairie360/bff-calendar-openapi` passé de la version dev à `1.0.0`, avec les réponses 429 ajoutées et la nouvelle route `GET /calendar/events/{id}`; images des stacks de test sur les versions prod (bff-calendar 1.0.0, calendar-api 1.1.0, core-api 2.1.0, database et liquibase 3.2.0, bff-user 1.0.0). (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- CI : `cicd.yml` et `contracts.yml` ne se déclenchent sur push que pour `main`, le token est en lecture seule par défaut, le Dockerfile passe en Node 24.21.0 avec le token en secret BuildKit. Ajout de `tests/workflow-permissions.test.cjs`. (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259))
- CI : `mairie360/CICD` épinglé en v4.3.2 puis v4.3.1 (SHA + commentaire de tag), secrets du journal de release transmis. (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))
- Tests : `tests/bundle/client-bundle.test.cjs` vérifie que le bundle client n'embarque pas les entrées inutilisées de la lib ; analyse via l'AST TypeScript. (MAIR-126, [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))
- Versions internes : `@mairie360/bff-calendar-openapi` passé en dev puis en staging (MAIR-575, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275) ; MAIR-600, [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277)).

## Différence dev → staging (en dev, pas encore en staging)

#### Technique
- Mises à jour Renovate des images de test dans les `docker-compose*.yml` : `calendar-api` en 1.2.0 et `core-api` en 2.2.0 ([#288](https://github.com/mairie360/Calendars_Web_Service/pull/288), [#289](https://github.com/mairie360/Calendars_Web_Service/pull/289)). Le contenu de ces images n'est pas dans ce dépôt.
- Schéma : `database` et `liquibase-migrations` passent en 3.3.0 dans les stacks de test ([#290](https://github.com/mairie360/Calendars_Web_Service/pull/290)). Les migrations appliquées ne sont pas visibles dans les diffs : à vérifier avant staging.
- Release : un push sur `main` s'arrête à `release-dev`. Staging et prod passent par les workflows manuels `promote-staging.yml` et `promote-prod.yml`, épinglés sur `mairie360/CICD` v4.4.0 puis v4.4.3 (MAIR-494, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284) ; [#280](https://github.com/mairie360/Calendars_Web_Service/pull/280)). Le test `tests/cicd-pin.test.cjs` contrôle l'épinglage.

## Différence staging → prod (en staging, pas encore en prod)

#### Changements de comportement
- Les listes `GET /calendar/bootstrap` et des périodes ne portent plus `canEdit`, `canDelete`, `canValidate`, `createdById` ni `description`; le détail passe par `GET /calendar/events/{id}`. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265) ; contrat [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Les styles passent par la feuille publiée de `@mairie360/lib-components` 0.9.0 et des variables CSS `--mairie-*`; `municipal-theme.css` est supprimé. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Nouveautés
- Ouvrir un événement l'affiche aussitôt, puis complète ses actions après la lecture du détail. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Bandeaux de confirmation après création, modification, suppression ou validation d'un événement, et placeholder de chargement pendant la lecture. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Avant : Modifier, Supprimer et Valider n'apparaissaient pas dans le détail d'un événement. Maintenant : ils apparaissent à la réponse du détail ; une lecture refusée garde l'événement sans action et affiche le message du BFF. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Contrat `@mairie360/bff-calendar-openapi` aligné sur la version staging (commit `f6bf247`), puis images `bff-calendar` en `staging-f6bf247` dans les stacks de test. (MAIR-575, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275) ; MAIR-600, [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277))
- Dépendances `@mairie360/front-kit` remplacées par `@mairie360/lib-components` 0.10.2 par sous-chemins; test `tests/bundle/client-bundle.test.cjs` ajouté. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))
- CI : `mairie360/CICD` en v4.3.2 puis v4.3.1, journal de release (secrets transmis), triggers `main` only, permissions en lecture seule par défaut, Node 24.21.0 dans le Dockerfile. (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271) ; MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259))

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
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

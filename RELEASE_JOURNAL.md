# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "062845e7ef76eea7efc313c248a4bfcc0ab0faa8", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "e4129bdb05d4ddfd421d8afd9f1b60ff6a7cb595", "updated": {"dev": "2026-10-21 03:27 UTC", "staging": "2026-10-20 19:01 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `e4129bd` | 2026-10-20 19:01 UTC |
| dev | — | `062845e` | 2026-10-21 03:27 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Après la création, l'enregistrement, la suppression, l'approbation ou le refus d'un événement, un message de confirmation fermable s'affiche : « Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Un squelette de chargement s'affiche pendant la lecture du calendrier, et un lien d'évitement « passer au contenu » précède la navigation répétée. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- À l'ouverture d'un événement (clic ou lien `event`), le front appelle la nouvelle route `GET /calendar/events/{id}` du BFF pour compléter la fenêtre de détails. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Changements de comportement
- Dans la fenêtre de détails, Modifier, Supprimer et Valider n'apparaissent qu'après la réponse de `GET /calendar/events/{id}`. Avant : les droits venaient des listes. Maintenant : le BFF ne les renvoie plus dans le bootstrap ni dans les périodes (`canEdit`, `canDelete`, `canValidate`, `createdById`, `description`). Une lecture refusée garde l'événement visible sans action et affiche le message du BFF. Fermer ou changer d'événement annule la lecture, et une mutation confirmée annule une lecture lancée avant elle. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- L'apparence vient désormais des variables de la feuille publiée `@mairie360/lib-components` : le thème municipal local est supprimé et les couleurs peuvent donc différer. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Navigation de bureau : avant, les anciens sélecteurs du tiroir mobile ciblaient la navigation principale sans classe propre et pouvaient la remettre dans le flux normal. Maintenant, ils ne ciblent que `aside.app-published-sidebar`. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Technique
- Front : `@mairie360/front-kit` (archive vendorisée) est remplacé par `@mairie360/lib-components` 0.10.2, importé par sous-chemins ; un test de bundle client est ajouté au workflow de performance. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))
- Contrat BFF : `@mairie360/bff-calendar-openapi` passe de 1.0.0 à des builds dev puis staging (`f6bf247`) ; le contrat ajoute `GET /calendar/events/{id}` et des réponses 429 avec `Retry-After`. Les stacks de test pointent vers les images BFF et les images API/base en versions publiées. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277))
- CI : `mairie360/CICD` passe à v4.3.1 puis v4.3.2, avec les secrets du journal de release ; `cicd.yml` et `contracts.yml` ne se lancent sur push que pour `main`, avec un token en lecture seule par défaut. (MAIR-436, MAIR-571, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))
- Outillage : un `braces` de développement uniquement est vendorisé, avec sa licence et sa provenance. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

## Différence dev → staging (en dev, pas encore en staging)

#### Technique
- CI : `cicd.yml` passe à mairie360/CICD v4.4.0 ; un push sur `main` s'arrête à `release-dev` et ne lance plus staging ni prod. (MAIR-494, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))
- La promotion vers staging n'est plus automatique : elle se lance à la main avec le workflow `promote-staging.yml` (`workflow_dispatch`, entrée `sha` optionnelle). (MAIR-494, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))
- `follow-redirects` 1.16.1 est dans le lockfile, ce qui corrige les avis `npm audit` de niveau high. (MAIR-494, [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))

## Différence staging → prod (en staging, pas encore en prod)

#### Nouveautés
- Après la création, l'enregistrement, la suppression, l'approbation ou le refus d'un événement, un message de confirmation fermable s'affiche : « Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Un squelette de chargement s'affiche pendant la lecture du calendrier, et un lien d'évitement « passer au contenu » précède la navigation répétée. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- À l'ouverture d'un événement, le front appelle `GET /calendar/events/{id}` pour compléter la fenêtre de détails. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Changements de comportement
- Dans la fenêtre de détails, Modifier, Supprimer et Valider n'apparaissent qu'après la réponse de `GET /calendar/events/{id}`. Avant : les droits venaient des listes. Maintenant : le BFF ne les renvoie plus dans le bootstrap ni dans les périodes. Une lecture refusée garde l'événement visible sans action et affiche le message du BFF. Fermer ou changer d'événement annule la lecture, et une mutation confirmée annule une lecture lancée avant elle. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- L'apparence vient désormais des variables de la feuille publiée `@mairie360/lib-components` : le thème municipal local est supprimé et les couleurs peuvent donc différer. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Navigation de bureau : avant, les anciens sélecteurs du tiroir mobile pouvaient remettre la navigation principale dans le flux normal. Maintenant, ils ne ciblent que `aside.app-published-sidebar`. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Technique
- Front : `@mairie360/front-kit` est remplacé par `@mairie360/lib-components` 0.10.2, importé par sous-chemins ; un test de bundle client est ajouté. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))
- Contrat BFF : `@mairie360/bff-calendar-openapi` passe de 1.0.0 à la version dev puis à la version staging `f6bf247`, avec `GET /calendar/events/{id}` et des réponses 429. Les stacks de test suivent ces images. (MAIR-569, MAIR-575, MAIR-600, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277))
- CI : `mairie360/CICD` passe à v4.3.2 avec les secrets du journal de release ; `cicd.yml` et `contracts.yml` ne se lancent sur push que pour `main`, avec un token en lecture seule par défaut. (MAIR-436, MAIR-571, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-21 03:27 UTC | dev | — | `062845e` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39538125565) |
| 2026-10-20 19:01 UTC | staging | — | `e4129bd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39478616869) |
| 2026-10-20 18:57 UTC | dev | — | `e4129bd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39478616869) |
| 2026-10-20 13:40 UTC | dev | — | `dcbfb02` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39431647621) |
| 2026-10-20 12:23 UTC | dev | — | `4d59302` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39421275988) |
| 2026-10-19 22:13 UTC | dev | — | `fe1296b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39332782417) |
| 2026-10-19 21:58 UTC | dev | — | `5c3debe` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39330879464) |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->

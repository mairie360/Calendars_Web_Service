# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-10-21 11:00 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `c4beb3a` | 2026-10-21 11:00 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Ouvrir un événement affiche d'abord ses informations, puis lit `GET /calendar/events/{id}` pour compléter la fenêtre de détails. Ce détail apporte la description, le créateur et les droits de l'utilisateur. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Chaque création, enregistrement, suppression, approbation ou refus d'événement affiche un message de confirmation fermable : « Événement « … » créé. », « enregistré. », « supprimé. », « approuvé. » ou « refusé. ». (MAIR-126 / adoption du socle partagé, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement, le calendrier affiche un emplacement de chargement (Skeleton) sous le message de statut. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- Les listes du calendrier (bootstrap et périodes) ne portent plus `canEdit`, `canDelete`, `canValidate`, `createdById` ni `description` : ces champs ne viennent que de `GET /calendar/events/{id}`. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Si la lecture du détail est refusée, l'événement reste visible sans aucune action et le message d'erreur du BFF s'affiche. Fermer ou changer d'événement annule la lecture en cours ; une réponse tardive ne remplace jamais une autre sélection. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Contrat BFF `@mairie360/bff-calendar-openapi` : passage de la version dev à `1.0.0` (`contracts/source.json` pointe sur le commit `e07dbe0`), ajout de la route `GET /calendar/events/{id}` et de réponses 429 (limite de débit, `Retry-After`) sur les routes du calendrier. Aucun traitement particulier du 429 n'apparaît dans le diff. ([#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Le thème municipal local (`municipal-theme.css`) est remplacé par la feuille de styles commune de lib-components : couleurs et styles de la page changent. Le diff est tronqué, l'étendue exacte n'est pas vérifiée. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Release prod (MAIR-612) : le front est épinglé sur `@mairie360/bff-calendar-openapi` `1.1.0`, et l'image `bff-calendar` des stacks de test passe en `1.1.0`. Le diff ne contient pas le détail des changements du BFF 1.1.0. ([#291](https://github.com/mairie360/Calendars_Web_Service/pull/291))

#### Corrections
- Ouverture d'un événement (clic ou lien `?event=`) : avant, Modifier, Supprimer et Valider étaient absents de la fenêtre de détails ; maintenant, ces actions apparaissent quand la lecture du détail répond. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Une lecture de détail ou une approbation antérieure ne peut plus restaurer un ancien statut après une mutation confirmée. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Socle partagé : `@mairie360/front-kit` (archive vendorisée) est retiré au profit de `@mairie360/lib-components` 0.10.2, avec des imports par sous-chemins et un test de bundle `npm run test:bundle`. ([#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))
- Backport de développement de `braces` (vendor/braces, licence MIT et provenance) ajouté. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Contrats OpenAPI et types régénérés depuis BFF_Calendar ; `scripts/contracts.mjs` accepte les versions `0.0.0-staging.<sha>`. ([#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277))
- CI : workflows `cicd.yml` et `contracts.yml` lancés sur push uniquement vers `main`, jeton en lecture seule par défaut, écriture réservée au job de release ; pins mairie360/CICD v4.3.1 puis v4.4.3 ; promotion staging et prod par workflows manuels. ([#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271), [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284), [#280](https://github.com/mairie360/Calendars_Web_Service/pull/280), [#291](https://github.com/mairie360/Calendars_Web_Service/pull/291))
- Images des stacks de test (`docker-compose*.yml`) mises à jour : calendar-api 1.2.0, core-api 2.2.0, database et liquibase-migrations 3.3.0. Ces images ne concernent pas l'application déployée. ([#288](https://github.com/mairie360/Calendars_Web_Service/pull/288), [#289](https://github.com/mairie360/Calendars_Web_Service/pull/289), [#290](https://github.com/mairie360/Calendars_Web_Service/pull/290))
- Renovate : le gestionnaire regex suit désormais le couple SHA et tag des références CICD (`cicd_version`, `cicd_ref`), et des tests de cohérence les vérifient. ([#271](https://github.com/mairie360/Calendars_Web_Service/pull/271), [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))

## Différence dev → staging (en dev, pas encore en staging)

_Rien._

## Différence staging → prod (en staging, pas encore en prod)

#### Nouveautés
- Ouvrir un événement affiche d'abord ses informations, puis lit `GET /calendar/events/{id}` pour compléter la fenêtre de détails. Ce détail apporte la description, le créateur et les droits de l'utilisateur. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Chaque création, enregistrement, suppression, approbation ou refus d'événement affiche un message de confirmation fermable : « Événement « … » créé. », « enregistré. », « supprimé. », « approuvé. » ou « refusé. ». (MAIR-126 / adoption du socle partagé, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement, le calendrier affiche un emplacement de chargement (Skeleton) sous le message de statut. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- Les listes du calendrier (bootstrap et périodes) ne portent plus `canEdit`, `canDelete`, `canValidate`, `createdById` ni `description` : ces champs ne viennent que de `GET /calendar/events/{id}`. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Si la lecture du détail est refusée, l'événement reste visible sans aucune action et le message d'erreur du BFF s'affiche. Fermer ou changer d'événement annule la lecture en cours ; une réponse tardive ne remplace jamais une autre sélection. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Contrat BFF `@mairie360/bff-calendar-openapi` : passage de la version dev à `1.0.0` (`contracts/source.json` pointe sur le commit `e07dbe0`), ajout de la route `GET /calendar/events/{id}` et de réponses 429 (limite de débit, `Retry-After`) sur les routes du calendrier. Aucun traitement particulier du 429 n'apparaît dans le diff. ([#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Le thème municipal local (`municipal-theme.css`) est remplacé par la feuille de styles commune de lib-components : couleurs et styles de la page changent. Le diff est tronqué, l'étendue exacte n'est pas vérifiée. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Release prod (MAIR-612) : le front est épinglé sur `@mairie360/bff-calendar-openapi` `1.1.0`, et l'image `bff-calendar` des stacks de test passe en `1.1.0`. Le diff ne contient pas le détail des changements du BFF 1.1.0. ([#291](https://github.com/mairie360/Calendars_Web_Service/pull/291))

#### Corrections
- Ouverture d'un événement (clic ou lien `?event=`) : avant, Modifier, Supprimer et Valider étaient absents de la fenêtre de détails ; maintenant, ces actions apparaissent quand la lecture du détail répond. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Une lecture de détail ou une approbation antérieure ne peut plus restaurer un ancien statut après une mutation confirmée. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Socle partagé : `@mairie360/front-kit` (archive vendorisée) est retiré au profit de `@mairie360/lib-components` 0.10.2, avec des imports par sous-chemins et un test de bundle `npm run test:bundle`. ([#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))
- Backport de développement de `braces` (vendor/braces, licence MIT et provenance) ajouté. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Contrats OpenAPI et types régénérés depuis BFF_Calendar ; `scripts/contracts.mjs` accepte les versions `0.0.0-staging.<sha>`. ([#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277))
- CI : workflows `cicd.yml` et `contracts.yml` lancés sur push uniquement vers `main`, jeton en lecture seule par défaut, écriture réservée au job de release ; pins mairie360/CICD v4.3.1 puis v4.4.3 ; promotion staging et prod par workflows manuels. ([#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271), [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284), [#280](https://github.com/mairie360/Calendars_Web_Service/pull/280), [#291](https://github.com/mairie360/Calendars_Web_Service/pull/291))
- Images des stacks de test (`docker-compose*.yml`) mises à jour : calendar-api 1.2.0, core-api 2.2.0, database et liquibase-migrations 3.3.0. Ces images ne concernent pas l'application déployée. ([#288](https://github.com/mairie360/Calendars_Web_Service/pull/288), [#289](https://github.com/mairie360/Calendars_Web_Service/pull/289), [#290](https://github.com/mairie360/Calendars_Web_Service/pull/290))
- Renovate : le gestionnaire regex suit désormais le couple SHA et tag des références CICD (`cicd_version`, `cicd_ref`), et des tests de cohérence les vérifient. ([#271](https://github.com/mairie360/Calendars_Web_Service/pull/271), [#284](https://github.com/mairie360/Calendars_Web_Service/pull/284))

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-21 11:05 UTC | staging | — | `c4beb3a` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39588904477) |
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

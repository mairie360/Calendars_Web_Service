# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "4d59302927ba71c3e2dc58d1c17b13e8f5cc9364", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "updated": {"dev": "2026-10-20 12:23 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `9e21e34` | — |
| dev | — | `4d59302` | 2026-10-20 12:23 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Après une création, une modification, une suppression, une approbation ou un refus confirmé par le BFF, un bandeau de succès refermable s'affiche en haut de la page : « Événement « <titre> » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Le bandeau s'efface à l'ouverture d'un événement, du formulaire de création ou au lancement d'une nouvelle action. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un bloc de chargement (squelette) remplace la zone vide tant qu'aucune erreur de lecture n'est survenue. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le proxy du front relaie désormais `GET /calendar/events/{id}`, ajouté au contrat `@mairie360/bff-calendar-openapi` `1.0.0`. Avant, cette route renvoyait 404 (hors contrat). Le contrat documente aussi une réponse 429 (limite de débit de la Calendar API, avec `Retry-After`) sur les routes du calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Changements de comportement
- L'interface adopte le thème partagé de `@mairie360/lib-components` (feuille de style commune à la place de `municipal-theme.css`, couleurs via les variables `--mairie-*`) et passe aux imports modulaires (`/calendar`, `/primitives`, `/shell`). (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Fenêtre de détails d'un événement : avant, depuis que les listes du bootstrap et des périodes ne portent plus `canEdit`, `canDelete`, `canValidate`, `createdById` ni `description`, les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissaient jamais. Maintenant, l'événement ouvert (clic ou lien `?event=`) s'affiche aussitôt, puis il est complété par `GET /calendar/events/{id}`. Les actions apparaissent quand cette lecture répond. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
  - Fermer ou changer d'événement annule la lecture en cours, et une réponse tardive ne remplace jamais une autre sélection.
  - Une création, modification, suppression ou approbation confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action et affiche le message du BFF.

#### Technique
- Socle partagé importé depuis `@mairie360/lib-components` `0.10.2` (sous-chemins `next`, `guard`, `browser`, `shared`, `react`, `theme`) à la place de l'archive `@mairie360/front-kit`, sans changement de comportement. Nouveau contrôle `npm run test:bundle` du bundle client, puis amélioré (analyse AST). Backport de développement de `braces`. Images des stacks docker-compose passées sur les versions prod (`bff-calendar` 1.0.0, `calendar-api` 1.1.0, `core-api` 2.1.0, `database` 3.2.0). (MAIR-126, MAIR-569, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273), [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- CI, 3 changements :
  - jeton en lecture seule par défaut et pipeline lancé sur `push` vers `main` uniquement ;
  - CICD passé en v4.3.1 puis v4.3.2, avec les secrets du journal des releases ;
  - épinglage SHA + tag suivi par Renovate.
  (MAIR-436, MAIR-571, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))

## Différence dev → staging (en dev, pas encore en staging)

#### Nouveautés
- Après une création, une modification, une suppression, une approbation ou un refus confirmé par le BFF, un bandeau de succès refermable s'affiche en haut de la page : « Événement « <titre> » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Le bandeau s'efface à l'ouverture d'un événement, du formulaire de création ou au lancement d'une nouvelle action. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un bloc de chargement (squelette) remplace la zone vide tant qu'aucune erreur de lecture n'est survenue. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le proxy du front relaie désormais `GET /calendar/events/{id}`, ajouté au contrat `@mairie360/bff-calendar-openapi` `1.0.0`. Avant, cette route renvoyait 404 (hors contrat). Le contrat documente aussi une réponse 429 (limite de débit de la Calendar API, avec `Retry-After`) sur les routes du calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Changements de comportement
- L'interface adopte le thème partagé de `@mairie360/lib-components` (feuille de style commune à la place de `municipal-theme.css`, couleurs via les variables `--mairie-*`) et passe aux imports modulaires (`/calendar`, `/primitives`, `/shell`). (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Fenêtre de détails d'un événement : avant, depuis que les listes du bootstrap et des périodes ne portent plus `canEdit`, `canDelete`, `canValidate`, `createdById` ni `description`, les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissaient jamais. Maintenant, l'événement ouvert (clic ou lien `?event=`) s'affiche aussitôt, puis il est complété par `GET /calendar/events/{id}`. Les actions apparaissent quand cette lecture répond. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
  - Fermer ou changer d'événement annule la lecture en cours, et une réponse tardive ne remplace jamais une autre sélection.
  - Une création, modification, suppression ou approbation confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action et affiche le message du BFF.

#### Technique
- Socle partagé importé depuis `@mairie360/lib-components` `0.10.2` (sous-chemins `next`, `guard`, `browser`, `shared`, `react`, `theme`) à la place de l'archive `@mairie360/front-kit`, sans changement de comportement. Nouveau contrôle `npm run test:bundle` du bundle client, puis amélioré (analyse AST). Backport de développement de `braces`. Images des stacks docker-compose passées sur les versions prod (`bff-calendar` 1.0.0, `calendar-api` 1.1.0, `core-api` 2.1.0, `database` 3.2.0). (MAIR-126, MAIR-569, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273), [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- CI, 3 changements :
  - jeton en lecture seule par défaut et pipeline lancé sur `push` vers `main` uniquement ;
  - CICD passé en v4.3.1 puis v4.3.2, avec les secrets du journal des releases ;
  - épinglage SHA + tag suivi par Renovate.
  (MAIR-436, MAIR-571, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-20 12:23 UTC | dev | — | `4d59302` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39421275988) |
| 2026-10-19 22:13 UTC | dev | — | `fe1296b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39332782417) |
| 2026-10-19 21:58 UTC | dev | — | `5c3debe` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39330879464) |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->

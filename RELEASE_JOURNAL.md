# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "e4129bdb05d4ddfd421d8afd9f1b60ff6a7cb595", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "e4129bdb05d4ddfd421d8afd9f1b60ff6a7cb595", "updated": {"dev": "2026-10-20 18:57 UTC", "staging": "2026-10-20 19:01 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `e4129bd` | 2026-10-20 19:01 UTC |
| dev | — | `e4129bd` | 2026-10-20 18:57 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Un message de confirmation refermable (toast de succès) s'affiche après chaque action confirmée par le BFF : « Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Il disparaît dès qu'on ouvre la création, qu'on clique sur un événement ou qu'on lance une nouvelle action. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un bloc de chargement (squelette) s'affiche sous le message « Chargement des données du calendrier… », sauf en cas d'erreur de lecture. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le proxy du front relaie désormais `GET /calendar/events/{id}`, ajouté au contrat `@mairie360/bff-calendar-openapi` 1.0.0. Ce contrat documente aussi une réponse `429` (limite de débit de l'API Calendar, avec `Retry-After`) sur les routes calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Changements de comportement
- L'interface adopte le thème commun de `@mairie360/lib-components` : la feuille de styles publiée remplace `municipal-theme.css`, et les couleurs de fond, de texte, de bordure du jour courant et de focus suivent les variables du thème partagé. Le lien d'évitement partagé est placé avant la navigation répétée. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- À l'ouverture d'un événement (clic ou lien `?event=`), la fenêtre de détails s'affiche aussitôt, puis le front lit `GET /calendar/events/{id}` pour compléter les droits, `createdById` et `description`. Les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissent qu'à la réponse de cette lecture. Les droits éventuellement présents dans les listes ne sont plus utilisés. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Si cette lecture est refusée, l'événement reste visible sans actions et le message du BFF s'affiche. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Corrections
- Avant, comme le BFF ne transmet plus les droits dans les listes du bootstrap et des périodes, la fenêtre de détails n'affichait jamais **Modifier**, **Supprimer** ni **Valider**. Maintenant, ces actions apparaissent selon les droits renvoyés par la lecture détaillée. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Fermer un événement ou en ouvrir un autre annule la lecture détaillée en cours : une réponse tardive ne remplace plus la sélection courante. Une création, modification, suppression ou validation confirmée écarte une lecture lancée avant elle, qui ne peut plus rétablir un ancien statut. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Dépendances internes :
  - Le socle partagé passe de l'archive `@mairie360/front-kit` aux sous-chemins de `@mairie360/lib-components` 0.10.2, sans changement de comportement (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273)).
  - `@mairie360/bff-calendar-openapi` passe de 1.0.0 à `0.0.0-staging.f6bf247…`, et l'image `bff-calendar` des stacks compose suit le même commit (MAIR-575, MAIR-600, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277)).
  - Les images API et base des stacks de test passent en versions prod (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264)).
- CI : jeton en lecture seule par défaut et push limité à `main` (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259)) ; CICD passe à v4.3.2 avec journal des releases et épinglage suivi par Renovate (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271)) ; tests de bundle client ajoutés.

## Différence dev → staging (en dev, pas encore en staging)

_Rien._

## Différence staging → prod (en staging, pas encore en prod)

#### Nouveautés
- Un message de confirmation refermable (toast de succès) s'affiche après chaque action confirmée par le BFF : « Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Il disparaît dès qu'on ouvre la création, qu'on clique sur un événement ou qu'on lance une nouvelle action. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un bloc de chargement (squelette) s'affiche sous le message « Chargement des données du calendrier… », sauf en cas d'erreur de lecture. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le proxy du front relaie désormais `GET /calendar/events/{id}`, ajouté au contrat `@mairie360/bff-calendar-openapi` 1.0.0. Ce contrat documente aussi une réponse `429` (limite de débit de l'API Calendar, avec `Retry-After`) sur les routes calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Changements de comportement
- L'interface adopte le thème commun de `@mairie360/lib-components` : la feuille de styles publiée remplace `municipal-theme.css`, et les couleurs de fond, de texte, de bordure du jour courant et de focus suivent les variables du thème partagé. Le lien d'évitement partagé est placé avant la navigation répétée. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- À l'ouverture d'un événement (clic ou lien `?event=`), la fenêtre de détails s'affiche aussitôt, puis le front lit `GET /calendar/events/{id}` pour compléter les droits, `createdById` et `description`. Les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissent qu'à la réponse de cette lecture. Les droits éventuellement présents dans les listes ne sont plus utilisés. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Si cette lecture est refusée, l'événement reste visible sans actions et le message du BFF s'affiche. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Corrections
- Avant, comme le BFF ne transmet plus les droits dans les listes du bootstrap et des périodes, la fenêtre de détails n'affichait jamais **Modifier**, **Supprimer** ni **Valider**. Maintenant, ces actions apparaissent selon les droits renvoyés par la lecture détaillée. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Fermer un événement ou en ouvrir un autre annule la lecture détaillée en cours : une réponse tardive ne remplace plus la sélection courante. Une création, modification, suppression ou validation confirmée écarte une lecture lancée avant elle, qui ne peut plus rétablir un ancien statut. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Dépendances internes :
  - Le socle partagé passe de l'archive `@mairie360/front-kit` aux sous-chemins de `@mairie360/lib-components` 0.10.2, sans changement de comportement (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273)).
  - `@mairie360/bff-calendar-openapi` passe de 1.0.0 à `0.0.0-staging.f6bf247…`, et l'image `bff-calendar` des stacks compose suit le même commit (MAIR-575, MAIR-600, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277)).
  - Les images API et base des stacks de test passent en versions prod (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264)).
- CI : jeton en lecture seule par défaut et push limité à `main` (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259)) ; CICD passe à v4.3.2 avec journal des releases et épinglage suivi par Renovate (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271)) ; tests de bundle client ajoutés.

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-20 19:01 UTC | staging | — | `e4129bd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39478616869) |
| 2026-10-20 18:57 UTC | dev | — | `e4129bd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39478616869) |
| 2026-10-20 13:40 UTC | dev | — | `dcbfb02` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39431647621) |
| 2026-10-20 12:23 UTC | dev | — | `4d59302` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39421275988) |
| 2026-10-19 22:13 UTC | dev | — | `fe1296b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39332782417) |
| 2026-10-19 21:58 UTC | dev | — | `5c3debe` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39330879464) |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->

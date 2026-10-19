# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "5c3debeba3ac74af7cf2ccfc1c2a9175f348a81d", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "updated": {"dev": "2026-10-19 21:58 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `9e21e34` | — |
| dev | — | `5c3debe` | 2026-10-19 21:58 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Après une création, une modification, une suppression, une approbation ou un refus confirmés, un message de succès refermable s'affiche en haut du calendrier : « Événement « titre » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Il disparaît à l'ouverture d'un formulaire, d'un événement ou d'une nouvelle opération. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un squelette de chargement s'affiche sous le message « Chargement des données du calendrier… », sauf en cas d'erreur de lecture. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le proxy du front relaie désormais `GET /calendar/events/{id}`, ajouté au contrat `@mairie360/bff-calendar-openapi` `1.0.0`. Cette route répondait auparavant 404, car elle était hors contrat. Le contrat documente aussi une réponse 429 (limite de débit de l'API Calendar, header `Retry-After`) sur les routes du calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Changements de comportement
- L'interface adopte le thème et la feuille de style communs de `@mairie360/lib-components` `0.9.0`, à la place de l'ancien `municipal-theme.css` : couleurs de fond, de texte et d'accent, marqueur du jour, contours de focus. Le lien d'évitement partagé précède la navigation répétée. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Fenêtre de détails d'un événement : avant, les listes du BFF ne portaient plus les droits, si bien que les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissaient jamais. Maintenant, l'ouverture d'un événement (clic ou lien `?event=`) l'affiche aussitôt puis lit `GET /calendar/events/{id}`. Cette réponse complète les droits (`canEdit`, `canDelete`, `canValidate`), `createdById` et `description`, et les actions apparaissent à ce moment-là. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
  - Fermer l'événement ou en ouvrir un autre annule la lecture en cours, et une réponse tardive ne remplace jamais une autre sélection.
  - Une création, modification, suppression ou approbation confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action et affiche le message du BFF.

#### Technique
- Le socle partagé est désormais importé depuis `@mairie360/lib-components` `0.10.2` (sous-chemins `next`, `guard`, `browser`, `shared`, `react`, `theme`), à la place de l'archive vendorisée `@mairie360/front-kit`, sans changement de comportement. S'y ajoute le test `npm run test:bundle` sur le bundle client. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269))
- CI et outillage, 3 changements :
  - Jeton CI en lecture seule par défaut et pipelines sur push limités à `main` (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259)).
  - CICD passé en v4.3.1 avec les secrets du journal de release (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267)).
  - Images des stacks docker-compose passées aux versions prod, BFF, API et base (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264)).

## Différence dev → staging (en dev, pas encore en staging)

#### Nouveautés
- Après une création, une modification, une suppression, une approbation ou un refus confirmés, un message de succès refermable s'affiche en haut du calendrier : « Événement « titre » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Il disparaît à l'ouverture d'un formulaire, d'un événement ou d'une nouvelle opération. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un squelette de chargement s'affiche sous le message « Chargement des données du calendrier… », sauf en cas d'erreur de lecture. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le proxy du front relaie désormais `GET /calendar/events/{id}`, ajouté au contrat `@mairie360/bff-calendar-openapi` `1.0.0`. Cette route répondait auparavant 404, car elle était hors contrat. Le contrat documente aussi une réponse 429 (limite de débit de l'API Calendar, header `Retry-After`) sur les routes du calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Changements de comportement
- L'interface adopte le thème et la feuille de style communs de `@mairie360/lib-components` `0.9.0`, à la place de l'ancien `municipal-theme.css` : couleurs de fond, de texte et d'accent, marqueur du jour, contours de focus. Le lien d'évitement partagé précède la navigation répétée. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Fenêtre de détails d'un événement : avant, les listes du BFF ne portaient plus les droits, si bien que les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissaient jamais. Maintenant, l'ouverture d'un événement (clic ou lien `?event=`) l'affiche aussitôt puis lit `GET /calendar/events/{id}`. Cette réponse complète les droits (`canEdit`, `canDelete`, `canValidate`), `createdById` et `description`, et les actions apparaissent à ce moment-là. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
  - Fermer l'événement ou en ouvrir un autre annule la lecture en cours, et une réponse tardive ne remplace jamais une autre sélection.
  - Une création, modification, suppression ou approbation confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action et affiche le message du BFF.

#### Technique
- Le socle partagé est désormais importé depuis `@mairie360/lib-components` `0.10.2` (sous-chemins `next`, `guard`, `browser`, `shared`, `react`, `theme`), à la place de l'archive vendorisée `@mairie360/front-kit`, sans changement de comportement. S'y ajoute le test `npm run test:bundle` sur le bundle client. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269))
- CI et outillage, 3 changements :
  - Jeton CI en lecture seule par défaut et pipelines sur push limités à `main` (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259)).
  - CICD passé en v4.3.1 avec les secrets du journal de release (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267)).
  - Images des stacks docker-compose passées aux versions prod, BFF, API et base (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264)).

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-19 21:58 UTC | dev | — | `5c3debe` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39330879464) |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->

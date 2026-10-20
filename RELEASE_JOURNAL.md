# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "e4129bdb05d4ddfd421d8afd9f1b60ff6a7cb595", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "updated": {"dev": "2026-10-20 18:57 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `9e21e34` | — |
| dev | — | `e4129bd` | 2026-10-20 18:57 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Ouvrir un événement (clic ou lien `?event=`) l'affiche tout de suite, puis lit `GET /calendar/events/{id}` pour compléter la fenêtre de détails (droits, `createdById`, `description`). Les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissent qu'à la réponse de cette lecture. Fermer la fenêtre ou changer d'événement annule la lecture, et une réponse tardive ne remplace jamais une autre sélection. Une création, modification, suppression ou validation confirmée écarte une lecture lancée avant elle. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Le proxy du front relaie désormais `GET /calendar/events/{id}` vers BFF_Calendar ; avant, cette route était hors contrat. Le contrat déclare aussi une réponse 429 (limite de débit de la Calendar API, avec en-tête `Retry-After`) sur les routes calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Après une création, une modification, une suppression, une approbation ou un refus confirmé, un message de succès apparaît et peut être fermé : « Événement « … » créé. », « enregistré. », « supprimé. », « approuvé. » ou « refusé. ». Il disparaît à l'action suivante. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un squelette de chargement s'affiche sous le message « Chargement des données du calendrier… ». (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- L'interface adopte le thème partagé de `@mairie360/lib-components` (feuille de style commune, couleurs du fond, du texte et des accents par variables de thème). Le thème municipal local est retiré et un lien d'évitement unique précède la navigation. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Fenêtre de détails d'un événement : avant, elle n'affichait plus **Modifier**, **Supprimer** ni **Valider**, car les listes du BFF ne portent plus les droits. Maintenant, ces actions viennent de la lecture du détail. Si cette lecture est refusée, l'événement reste visible sans actions et le message du BFF s'affiche. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Dépendances et contrats :
  - `@mairie360/bff-calendar-openapi` passe à `1.0.0`, puis aux artefacts dev et staging du BFF, avec les images des stacks `docker-compose*.yml` alignées ; le contrat lui-même ne change pas entre ces deux dernières étapes. `scripts/contracts.mjs` accepte aussi les versions `0.0.0-staging.<sha40>`. (MAIR-569, MAIR-575, MAIR-600, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277))
  - Le socle partagé passe de `@mairie360/front-kit` à `@mairie360/lib-components` `0.10.2`, sans changement de comportement. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269))
- CI et tests : 4 changements.
  - Token en lecture seule par défaut et push limité à `main`. (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259))
  - CICD passe en v4.3.1 puis v4.3.2, avec le journal des releases et le suivi Renovate. (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))
  - Le test du bundle client est durci. (MAIR-126, [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))

## Différence dev → staging (en dev, pas encore en staging)

#### Nouveautés
- Ouvrir un événement (clic ou lien `?event=`) l'affiche tout de suite, puis lit `GET /calendar/events/{id}` pour compléter la fenêtre de détails (droits, `createdById`, `description`). Les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissent qu'à la réponse de cette lecture. Fermer la fenêtre ou changer d'événement annule la lecture, et une réponse tardive ne remplace jamais une autre sélection. Une création, modification, suppression ou validation confirmée écarte une lecture lancée avant elle. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))
- Le proxy du front relaie désormais `GET /calendar/events/{id}` vers BFF_Calendar ; avant, cette route était hors contrat. Le contrat déclare aussi une réponse 429 (limite de débit de la Calendar API, avec en-tête `Retry-After`) sur les routes calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- Après une création, une modification, une suppression, une approbation ou un refus confirmé, un message de succès apparaît et peut être fermé : « Événement « … » créé. », « enregistré. », « supprimé. », « approuvé. » ou « refusé. ». Il disparaît à l'action suivante. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un squelette de chargement s'affiche sous le message « Chargement des données du calendrier… ». (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- L'interface adopte le thème partagé de `@mairie360/lib-components` (feuille de style commune, couleurs du fond, du texte et des accents par variables de thème). Le thème municipal local est retiré et un lien d'évitement unique précède la navigation. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Corrections
- Fenêtre de détails d'un événement : avant, elle n'affichait plus **Modifier**, **Supprimer** ni **Valider**, car les listes du BFF ne portent plus les droits. Maintenant, ces actions viennent de la lecture du détail. Si cette lecture est refusée, l'événement reste visible sans actions et le message du BFF s'affiche. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Dépendances et contrats :
  - `@mairie360/bff-calendar-openapi` passe à `1.0.0`, puis aux artefacts dev et staging du BFF, avec les images des stacks `docker-compose*.yml` alignées ; le contrat lui-même ne change pas entre ces deux dernières étapes. `scripts/contracts.mjs` accepte aussi les versions `0.0.0-staging.<sha40>`. (MAIR-569, MAIR-575, MAIR-600, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275), [#277](https://github.com/mairie360/Calendars_Web_Service/pull/277))
  - Le socle partagé passe de `@mairie360/front-kit` à `@mairie360/lib-components` `0.10.2`, sans changement de comportement. (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269))
- CI et tests : 4 changements.
  - Token en lecture seule par défaut et push limité à `main`. (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259))
  - CICD passe en v4.3.1 puis v4.3.2, avec le journal des releases et le suivi Renovate. (MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271))
  - Le test du bundle client est durci. (MAIR-126, [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-20 18:57 UTC | dev | — | `e4129bd` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39478616869) |
| 2026-10-20 13:40 UTC | dev | — | `dcbfb02` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39431647621) |
| 2026-10-20 12:23 UTC | dev | — | `4d59302` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39421275988) |
| 2026-10-19 22:13 UTC | dev | — | `fe1296b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39332782417) |
| 2026-10-19 21:58 UTC | dev | — | `5c3debe` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39330879464) |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->

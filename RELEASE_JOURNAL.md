# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "dcbfb0243513c572241480cd87eb8526081bbc48", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "updated": {"dev": "2026-10-20 13:40 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `9e21e34` | — |
| dev | — | `dcbfb02` | 2026-10-20 13:40 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Un message de confirmation refermable s'affiche en haut de la page après une action confirmée par le BFF : « Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Il disparaît dès qu'on ouvre la création, qu'on ouvre un événement ou qu'on lance une nouvelle action. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un bloc de chargement (squelette) s'affiche sous le message « Chargement des données du calendrier… », sauf en cas d'erreur de lecture. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- L'interface adopte le thème commun de `@mairie360/lib-components` (feuille `styles.css` publiée, couleurs `--mairie-background`, `--mairie-text`, `--mairie-accent`) à la place de l'ancien thème municipal propre au front. La navigation partagée et le lien d'évitement suivent le gabarit commun. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le proxy du front relaie désormais `GET /calendar/events/{id}` vers BFF_Calendar ; cette route répondait avant 404 car elle était hors contrat. Le contrat déclare aussi une réponse 429 (limite de débit de l'API Calendar, avec `Retry-After`) sur les routes du calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Corrections
- Fenêtre de détails d'un événement : avant, les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissaient jamais, car les listes du BFF ne portent plus les droits ni `createdById` et `description`. Maintenant, l'événement ouvert (clic ou lien `?event=`) s'affiche aussitôt, puis est complété par `GET /calendar/events/{id}`, et les actions apparaissent à la réponse.
  - Fermer ou changer d'événement annule la lecture.
  - Une réponse tardive ne remplace jamais une autre sélection.
  - Une création, modification, suppression ou validation confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action et affiche le message du BFF. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- 3 mises à jour de dépendances sans changement de comportement :
  - le socle partagé passe de l'archive `@mairie360/front-kit` à `@mairie360/lib-components` (0.9.0 puis 0.10.2) ;
  - `@mairie360/bff-calendar-openapi` passe à 1.0.0, puis à la build dev `0.0.0-dev.45c8598…` (contrat inchangé) ;
  - les images des piles de test sont alignées.
  (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269) ; MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264) ; MAIR-575, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275))
- 4 changements de CI et de tests :
  - jeton en lecture seule par défaut, `push` limité à `main` ;
  - CICD v4.3.1 puis v4.3.2 avec l'étape de journal des releases et le suivi par Renovate ;
  - test du bundle client.
  (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259) ; MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271) ; MAIR-126, [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))

## Différence dev → staging (en dev, pas encore en staging)

#### Nouveautés
- Un message de confirmation refermable s'affiche en haut de la page après une action confirmée par le BFF : « Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Il disparaît dès qu'on ouvre la création, qu'on ouvre un événement ou qu'on lance une nouvelle action. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un bloc de chargement (squelette) s'affiche sous le message « Chargement des données du calendrier… », sauf en cas d'erreur de lecture. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- L'interface adopte le thème commun de `@mairie360/lib-components` (feuille `styles.css` publiée, couleurs `--mairie-background`, `--mairie-text`, `--mairie-accent`) à la place de l'ancien thème municipal propre au front. La navigation partagée et le lien d'évitement suivent le gabarit commun. ([#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le proxy du front relaie désormais `GET /calendar/events/{id}` vers BFF_Calendar ; cette route répondait avant 404 car elle était hors contrat. Le contrat déclare aussi une réponse 429 (limite de débit de l'API Calendar, avec `Retry-After`) sur les routes du calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Corrections
- Fenêtre de détails d'un événement : avant, les boutons **Modifier**, **Supprimer** et **Valider** n'apparaissaient jamais, car les listes du BFF ne portent plus les droits ni `createdById` et `description`. Maintenant, l'événement ouvert (clic ou lien `?event=`) s'affiche aussitôt, puis est complété par `GET /calendar/events/{id}`, et les actions apparaissent à la réponse.
  - Fermer ou changer d'événement annule la lecture.
  - Une réponse tardive ne remplace jamais une autre sélection.
  - Une création, modification, suppression ou validation confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action et affiche le message du BFF. (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- 3 mises à jour de dépendances sans changement de comportement :
  - le socle partagé passe de l'archive `@mairie360/front-kit` à `@mairie360/lib-components` (0.9.0 puis 0.10.2) ;
  - `@mairie360/bff-calendar-openapi` passe à 1.0.0, puis à la build dev `0.0.0-dev.45c8598…` (contrat inchangé) ;
  - les images des piles de test sont alignées.
  (MAIR-126, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269) ; MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264) ; MAIR-575, [#275](https://github.com/mairie360/Calendars_Web_Service/pull/275))
- 4 changements de CI et de tests :
  - jeton en lecture seule par défaut, `push` limité à `main` ;
  - CICD v4.3.1 puis v4.3.2 avec l'étape de journal des releases et le suivi par Renovate ;
  - test du bundle client.
  (MAIR-436, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259) ; MAIR-571, [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267), [#271](https://github.com/mairie360/Calendars_Web_Service/pull/271) ; MAIR-126, [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273))

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-20 13:40 UTC | dev | — | `dcbfb02` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39431647621) |
| 2026-10-20 12:23 UTC | dev | — | `4d59302` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39421275988) |
| 2026-10-19 22:13 UTC | dev | — | `fe1296b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39332782417) |
| 2026-10-19 21:58 UTC | dev | — | `5c3debe` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39330879464) |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->

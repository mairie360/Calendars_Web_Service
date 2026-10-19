# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "0eecbe179b794febf7375ab7dd89450a46f948e2", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "updated": {"dev": "2026-10-19 20:07 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `9e21e34` | — |
| dev | — | `0eecbe1` | 2026-10-19 20:07 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Après la création, la modification, la suppression, l'approbation ou le refus d'un événement, un message de confirmation refermable s'affiche en haut de la page (par exemple « Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » / « … refusé. »). Il disparaît à l'ouverture d'un événement, du formulaire de création ou au lancement d'une nouvelle opération. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le premier chargement du calendrier, un bloc de chargement s'affiche sous le message « Chargement des données du calendrier… », sauf si la lecture a échoué. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- Le front adopte le thème partagé de `@mairie360/lib-components` 0.9.0 (feuille de style commune, couleurs du thème à la place des couleurs fixes, lien d'évitement placé avant la navigation). L'ancien `municipal-theme.css` local est retiré. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le contrat BFF passe à `@mairie360/bff-calendar-openapi` 1.0.0. Il ajoute `GET /calendar/events/{id}` et des réponses 429 (limite de débit de l'API Calendar, en-tête `Retry-After`) sur les routes du calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Corrections
- Avant, la fenêtre de détails d'un événement n'affichait jamais **Modifier**, **Supprimer** ni **Valider**, car les listes du BFF ne portent plus les droits, `createdById` ni `description`. Maintenant, l'ouverture d'un événement (clic ou lien `?event=`) l'affiche aussitôt puis lit `GET /calendar/events/{id}` pour compléter les détails ; les actions apparaissent à la réponse de cette lecture.
  - Fermer ou changer d'événement annule la lecture, et une réponse tardive ne remplace pas une autre sélection.
  - Une modification confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action, avec le message du BFF.
  (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- CI durcie : jeton en lecture seule par défaut, droits d'écriture réservés au job `CICD`, `push` limité à `main` ; puis passage au workflow CICD v4.3.1 avec les secrets `ANTHROPIC_API_KEY`, `RELEASE_APP_ID` et `RELEASE_APP_PK` pour le journal de release. (MAIR-436, MAIR-571, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267))
- Les stacks docker-compose de test utilisent les images de release (`bff-calendar`/`bff-user` 1.0.0, `calendar-api` 1.1.0, `core-api` 2.1.0, `database`/`liquibase-migrations` 3.2.0). Un backport `braces` est ajouté en dev-dependency, avec docs et tests associés. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

## Différence dev → staging (en dev, pas encore en staging)

#### Nouveautés
- Après la création, la modification, la suppression, l'approbation ou le refus d'un événement, un message de confirmation refermable s'affiche en haut de la page (par exemple « Événement « … » créé. », « … enregistré. », « … supprimé. », « … approuvé. » / « … refusé. »). Il disparaît à l'ouverture d'un événement, du formulaire de création ou au lancement d'une nouvelle opération. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le premier chargement du calendrier, un bloc de chargement s'affiche sous le message « Chargement des données du calendrier… », sauf si la lecture a échoué. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- Le front adopte le thème partagé de `@mairie360/lib-components` 0.9.0 (feuille de style commune, couleurs du thème à la place des couleurs fixes, lien d'évitement placé avant la navigation). L'ancien `municipal-theme.css` local est retiré. (MAIR-526, MAIR-515, MAIR-540, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le contrat BFF passe à `@mairie360/bff-calendar-openapi` 1.0.0. Il ajoute `GET /calendar/events/{id}` et des réponses 429 (limite de débit de l'API Calendar, en-tête `Retry-After`) sur les routes du calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Corrections
- Avant, la fenêtre de détails d'un événement n'affichait jamais **Modifier**, **Supprimer** ni **Valider**, car les listes du BFF ne portent plus les droits, `createdById` ni `description`. Maintenant, l'ouverture d'un événement (clic ou lien `?event=`) l'affiche aussitôt puis lit `GET /calendar/events/{id}` pour compléter les détails ; les actions apparaissent à la réponse de cette lecture.
  - Fermer ou changer d'événement annule la lecture, et une réponse tardive ne remplace pas une autre sélection.
  - Une modification confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action, avec le message du BFF.
  (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- CI durcie : jeton en lecture seule par défaut, droits d'écriture réservés au job `CICD`, `push` limité à `main` ; puis passage au workflow CICD v4.3.1 avec les secrets `ANTHROPIC_API_KEY`, `RELEASE_APP_ID` et `RELEASE_APP_PK` pour le journal de release. (MAIR-436, MAIR-571, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267))
- Les stacks docker-compose de test utilisent les images de release (`bff-calendar`/`bff-user` 1.0.0, `calendar-api` 1.1.0, `core-api` 2.1.0, `database`/`liquibase-migrations` 3.2.0). Un backport `braces` est ajouté en dev-dependency, avec docs et tests associés. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264), [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->

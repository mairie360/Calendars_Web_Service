# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "fe1296b859e263afb856bc3adef60e9784908740", "prod": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "prod_tag": "v0.4.0", "staging": "9e21e348015b41cc3c22535c7b38433c50a7a2ed", "updated": {"dev": "2026-10-19 22:13 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.4.0 | `9e21e34` | — |
| staging | — | `9e21e34` | — |
| dev | — | `fe1296b` | 2026-10-19 22:13 UTC |

## Ajouté sur main depuis la dernière release prod (v0.4.0)

#### Nouveautés
- Après une création, une modification, une suppression, une approbation ou un refus confirmés, un message de succès refermable s'affiche en haut de la page Calendrier : « Événement « <titre> » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Il disparaît dès qu'une nouvelle action ou l'ouverture d'un événement commence. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un bloc de chargement (`Skeleton`) s'affiche sous « Chargement des données du calendrier… », sauf en cas d'erreur de lecture. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- L'interface prend le thème commun de `@mairie360/lib-components` (0.9.0, feuille `styles.css` publiée). Le thème local `municipal-theme.css` est retiré : fond, texte et couleurs d'accent (marqueur du jour, contours de focus) viennent des variables partagées `--mairie-*`. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le contrat BFF passe à `@mairie360/bff-calendar-openapi` 1.0.0. Le proxy du front relaie maintenant `GET /calendar/events/{id}`, qui était auparavant hors contrat. Le contrat documente aussi une réponse 429 (limite de débit de l'API Calendar, en-tête `Retry-After`) sur les routes calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Corrections
- Avant, la fenêtre de détails d'un événement n'affichait jamais **Modifier**, **Supprimer** ni **Valider**, car les listes du bootstrap et des périodes ne transmettent plus les droits, `createdById` ni `description`. Maintenant, l'ouverture d'un événement (clic ou lien `?event=`) l'affiche aussitôt puis lit `GET /calendar/events/{id}`, et les actions apparaissent à la réponse.
  - Fermer ou changer d'événement annule la lecture, et une réponse tardive ne remplace jamais une autre sélection.
  - Une mutation confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action et affiche le message du BFF.
  (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Socle partagé importé depuis les sous-chemins de `@mairie360/lib-components` 0.10.2 au lieu de l'archive `@mairie360/front-kit`, sans changement de comportement. S'y ajoutent un nouveau contrôle `npm run test:bundle` du bundle client et son durcissement, ainsi que des images de test docker-compose passées en versions prod. (MAIR-126, MAIR-569, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273), [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- CI :
  - jeton en lecture seule par défaut, droits d'écriture réservés au job `CICD` ;
  - push uniquement sur `main` ;
  - passage au workflow CICD v4.3.1, qui ajoute l'étape de journal des releases ;
  - documentation alignée sur Node 24.21.0.
  (MAIR-436, MAIR-571, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267))

## Différence dev → staging (en dev, pas encore en staging)

#### Nouveautés
- Après une création, une modification, une suppression, une approbation ou un refus confirmés, un message de succès refermable s'affiche en haut de la page Calendrier : « Événement « <titre> » créé. », « … enregistré. », « … supprimé. », « … approuvé. » ou « … refusé. ». Il disparaît dès qu'une nouvelle action ou l'ouverture d'un événement commence. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Pendant le chargement initial du calendrier, un bloc de chargement (`Skeleton`) s'affiche sous « Chargement des données du calendrier… », sauf en cas d'erreur de lecture. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))

#### Changements de comportement
- L'interface prend le thème commun de `@mairie360/lib-components` (0.9.0, feuille `styles.css` publiée). Le thème local `municipal-theme.css` est retiré : fond, texte et couleurs d'accent (marqueur du jour, contours de focus) viennent des variables partagées `--mairie-*`. (MAIR-526, [#262](https://github.com/mairie360/Calendars_Web_Service/pull/262))
- Le contrat BFF passe à `@mairie360/bff-calendar-openapi` 1.0.0. Le proxy du front relaie maintenant `GET /calendar/events/{id}`, qui était auparavant hors contrat. Le contrat documente aussi une réponse 429 (limite de débit de l'API Calendar, en-tête `Retry-After`) sur les routes calendrier. (MAIR-569, [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))

#### Corrections
- Avant, la fenêtre de détails d'un événement n'affichait jamais **Modifier**, **Supprimer** ni **Valider**, car les listes du bootstrap et des périodes ne transmettent plus les droits, `createdById` ni `description`. Maintenant, l'ouverture d'un événement (clic ou lien `?event=`) l'affiche aussitôt puis lit `GET /calendar/events/{id}`, et les actions apparaissent à la réponse.
  - Fermer ou changer d'événement annule la lecture, et une réponse tardive ne remplace jamais une autre sélection.
  - Une mutation confirmée écarte une lecture lancée avant elle.
  - Une lecture refusée laisse l'événement visible sans action et affiche le message du BFF.
  (MAIR-557, [#265](https://github.com/mairie360/Calendars_Web_Service/pull/265))

#### Technique
- Socle partagé importé depuis les sous-chemins de `@mairie360/lib-components` 0.10.2 au lieu de l'archive `@mairie360/front-kit`, sans changement de comportement. S'y ajoutent un nouveau contrôle `npm run test:bundle` du bundle client et son durcissement, ainsi que des images de test docker-compose passées en versions prod. (MAIR-126, MAIR-569, [#269](https://github.com/mairie360/Calendars_Web_Service/pull/269), [#273](https://github.com/mairie360/Calendars_Web_Service/pull/273), [#264](https://github.com/mairie360/Calendars_Web_Service/pull/264))
- CI :
  - jeton en lecture seule par défaut, droits d'écriture réservés au job `CICD` ;
  - push uniquement sur `main` ;
  - passage au workflow CICD v4.3.1, qui ajoute l'étape de journal des releases ;
  - documentation alignée sur Node 24.21.0.
  (MAIR-436, MAIR-571, [#259](https://github.com/mairie360/Calendars_Web_Service/pull/259), [#267](https://github.com/mairie360/Calendars_Web_Service/pull/267))

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-19 22:13 UTC | dev | — | `fe1296b` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39332782417) |
| 2026-10-19 21:58 UTC | dev | — | `5c3debe` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39330879464) |
| 2026-10-19 20:07 UTC | dev | — | `0eecbe1` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39315904414) |
<!-- release-journal-history:end -->

# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "55a2624f5bd52538b64c63da66eb579390424ddc", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-10-21 18:00 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `55a2624` | 2026-10-21 18:00 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

#### Nouveautés
- Les fenêtres de création et de détail d'événement utilisent désormais la fenêtre modale de la lib (piégeage du focus, Échap, titre et description). Depuis l'éditeur de détail, Échap, le fond ou la fermeture ferment toute la fenêtre, et « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- L'en-tête de la page calendrier repose sur le `PageHeader` de la lib, et la carte de chargement est un composant dédié. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Changements de comportement
- La coque de l'application (barre latérale, barre supérieure, pied de page) vient désormais de `AccessibleShell` (`@mairie360/lib-components/shell`), relié à la session et à la déconnexion par `AppShell`. Les composants locaux `desktop-navigation`, `accessible-shell` et `sidebar-preference` sont supprimés. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Les grilles mois / semaine / jour, la barre d'outils, la barre latérale et les fenêtres d'événement sont désormais des composants locaux sous `src/components/CalendarPage/` (un dossier par composant, un test co-localisé). Le rendu HTML est annoncé comme identique. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Dépendance `@mairie360/lib-components` passée de 0.10.2 à 1.0.3 (saut majeur, d'où le `feat!`), et ajout de Vitest, Testing Library et jest-axe (`npm run test:components`, intégré à `npm test`). (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Le diff fourni est tronqué : certains changements de fichiers n'ont pas pu être vérifiés ligne à ligne.

## Différence dev → staging (en dev, pas encore en staging)

#### Nouveautés
- Les fenêtres de création et de détail d'événement utilisent désormais la fenêtre modale de la lib (piégeage du focus, Échap, titre et description). Depuis l'éditeur de détail, Échap, le fond ou la fermeture ferment toute la fenêtre, et « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- L'en-tête de la page calendrier repose sur le `PageHeader` de la lib, et la carte de chargement est un composant dédié. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Changements de comportement
- La coque de l'application (barre latérale, barre supérieure, pied de page) vient désormais de `AccessibleShell` (`@mairie360/lib-components/shell`), relié à la session et à la déconnexion par `AppShell`. Les composants locaux `desktop-navigation`, `accessible-shell` et `sidebar-preference` sont supprimés. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Les grilles mois / semaine / jour, la barre d'outils, la barre latérale et les fenêtres d'événement sont désormais des composants locaux sous `src/components/CalendarPage/` (un dossier par composant, un test co-localisé). Le rendu HTML est annoncé comme identique. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Dépendance `@mairie360/lib-components` passée de 0.10.2 à 1.0.3 (saut majeur, d'où le `feat!`), et ajout de Vitest, Testing Library et jest-axe (`npm run test:components`, intégré à `npm test`). (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Le diff fourni est tronqué : certains changements de fichiers n'ont pas pu être vérifiés ligne à ligne.

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-21 18:00 UTC | dev | — | `55a2624` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39647828387) |
| 2026-10-21 11:08 UTC | prod | v0.5.0 | `c4beb3a` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39589435988) |
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

# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "bbd2aa82fb48e7ce6d97be66a846e724ee5d7e0e", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-10-23 13:29 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `bbd2aa8` | 2026-10-23 13:29 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

#### Changements de comportement
- Les fenêtres d'événement (création et détails) utilisent désormais la modale de la lib, avec piège de focus, Échap, titre et description. Depuis l'éditeur de détails, Échap, le clic sur le fond ou le bouton de fermeture ferme toute la fenêtre (`onDismiss`) ; « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- L'en-tête de la page calendrier passe sur le `PageHeader` de la lib. Les ids des champs du formulaire (`event-title`, `event-date`…) sont conservés. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Node.js passe de 24.21.0 à 24.22.1 dans la CI, `contracts.yml`, `cicd.yml`, `Dockerfile` et `development.Dockerfile`, avec les images de base épinglées sur de nouveaux digests. Correctif de sécurité officiel. (#298, [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))
- Next.js et les paquets ESLint de configuration passent en 16.4.2, lockfiles synchronisés. (#298, [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))
- `@mairie360/lib-components` passe de 0.10.2 à 1.0.3. Ajout de Vitest, Testing Library et jest-axe ; `npm test` lance aussi `test:components` et la couverture exclut les `*.test.tsx`. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Découpage des composants calendrier dans `src/components/CalendarPage/` selon une convention d'arborescence testée, et shell fourni par la lib (`AppShell`) à la place des copies locales supprimées. (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Les fenêtres d'événement (création et détails) utilisent désormais la modale de la lib, avec piège de focus, Échap, titre et description. Depuis l'éditeur de détails, Échap, le clic sur le fond ou le bouton de fermeture ferme toute la fenêtre (`onDismiss`) ; « Annuler » revient aux détails. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- L'en-tête de la page calendrier passe sur le `PageHeader` de la lib. Les ids des champs du formulaire (`event-title`, `event-date`…) sont conservés. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Node.js passe de 24.21.0 à 24.22.1 dans la CI, `contracts.yml`, `cicd.yml`, `Dockerfile` et `development.Dockerfile`, avec les images de base épinglées sur de nouveaux digests. Correctif de sécurité officiel. (#298, [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))
- Next.js et les paquets ESLint de configuration passent en 16.4.2, lockfiles synchronisés. (#298, [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298))
- `@mairie360/lib-components` passe de 0.10.2 à 1.0.3. Ajout de Vitest, Testing Library et jest-axe ; `npm test` lance aussi `test:components` et la couverture exclut les `*.test.tsx`. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- Découpage des composants calendrier dans `src/components/CalendarPage/` selon une convention d'arborescence testée, et shell fourni par la lib (`AppShell`) à la place des copies locales supprimées. (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-10-23 13:29 UTC | dev | — | `bbd2aa8` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/39960628876) |
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

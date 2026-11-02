# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "e928c4ffd40493ef463a4b4c8e2092fd50625520", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-11-02 19:55 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `e928c4f` | 2026-11-02 19:55 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

#### Changements de comportement
- La fenêtre d'événement s'appuie désormais sur le composant Modal de la lib (piège de focus, titre et description). La barre latérale et l'en-tête viennent du shell partagé de la lib (AccessibleShell) : la navigation locale et la préférence de barre latérale sont retirées. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Installation et build : `postinstall`, `prebuild` et `pretest` ne interrogent plus le service d'avis npm ; cette vérification passe par `npm run audit:upstream` et un workflow quotidien. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- Stack d'accessibilité RGAA (`docker-compose-accessibility.yml`, `accessibility_test.sh`, `rgaa.yaml`, `init-accessibility.sql`) avec engine CICD v5.1.0, verrou de run et readiness bornées. (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218) ; MAIR-768, [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- Workflow `gdpr-pr.yml` de contrôle RGPD sur les PR. (MAIR-295, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223))
- Dépendances : `follow-redirects` 1.16.2 (GHSA-mrwp-f3q8-3g9p) ([#307](https://github.com/mairie360/Calendars_Web_Service/pull/307)), CICD v4.4.3 à v4.12.0 puis v5.1.0 ([#301](https://github.com/mairie360/Calendars_Web_Service/pull/301), [#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218)), `jsdom` et `playwright-core` ([#297](https://github.com/mairie360/Calendars_Web_Service/pull/297)), Node 24.22.1 et Next.js 16.4.2 ([#298](https://github.com/mairie360/Calendars_Web_Service/pull/298)).
- Zod 3 vendorisé avec backport de validation bornée des collections, et provenance des bundles en CI ([#299](https://github.com/mairie360/Calendars_Web_Service/pull/299)).

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- La fenêtre d'événement s'appuie désormais sur le composant Modal de la lib (piège de focus, titre et description). La barre latérale et l'en-tête viennent du shell partagé de la lib (AccessibleShell) : la navigation locale et la préférence de barre latérale sont retirées. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Installation et build : `postinstall`, `prebuild` et `pretest` ne interrogent plus le service d'avis npm ; cette vérification passe par `npm run audit:upstream` et un workflow quotidien. (MAIR-744, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- Stack d'accessibilité RGAA (`docker-compose-accessibility.yml`, `accessibility_test.sh`, `rgaa.yaml`, `init-accessibility.sql`) avec engine CICD v5.1.0, verrou de run et readiness bornées. (MAIR-316, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218) ; MAIR-768, [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- Workflow `gdpr-pr.yml` de contrôle RGPD sur les PR. (MAIR-295, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223))
- Dépendances : `follow-redirects` 1.16.2 (GHSA-mrwp-f3q8-3g9p) ([#307](https://github.com/mairie360/Calendars_Web_Service/pull/307)), CICD v4.4.3 à v4.12.0 puis v5.1.0 ([#301](https://github.com/mairie360/Calendars_Web_Service/pull/301), [#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218)), `jsdom` et `playwright-core` ([#297](https://github.com/mairie360/Calendars_Web_Service/pull/297)), Node 24.22.1 et Next.js 16.4.2 ([#298](https://github.com/mairie360/Calendars_Web_Service/pull/298)).
- Zod 3 vendorisé avec backport de validation bornée des collections, et provenance des bundles en CI ([#299](https://github.com/mairie360/Calendars_Web_Service/pull/299)).

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-11-02 19:55 UTC | dev | — | `e928c4f` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41513000368) |
| 2026-11-02 18:21 UTC | dev | — | `c82f8ab` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41470499855) |
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

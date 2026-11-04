# Journal des releases — Calendars_Web_Service

<!-- release-journal-state {"dev": "94812cf5f403d93a06f02fe27f1bec8e2d58d47b", "prod": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "prod_tag": "v0.5.0", "staging": "c4beb3aaa105badfa3bed14d91c40d9a5de34b2b", "updated": {"dev": "2026-11-04 18:21 UTC", "prod": "2026-10-21 11:08 UTC", "staging": "2026-10-21 11:05 UTC"}} -->
> Tenu à jour par la CI (`mairie360/CICD`, action `release/release-journal`) à chaque passage en dev, staging et prod. Ne pas modifier à la main : le fichier est réécrit au passage suivant.

| Environnement | Version | Commit | Mis à jour |
| --- | --- | --- | --- |
| prod | v0.5.0 | `c4beb3a` | 2026-10-21 11:08 UTC |
| staging | — | `c4beb3a` | 2026-10-21 11:05 UTC |
| dev | — | `94812cf` | 2026-11-04 18:21 UTC |

## Ajouté sur main depuis la dernière release prod (v0.5.0)

#### Changements de comportement
- Les fenêtres d'événement (création et détails) utilisent désormais le composant `Modal` de la lib. Depuis l'éditeur de détails, Échap, le fond ou la fermeture ferment toute la fenêtre, et « Annuler » revient aux détails. Les identifiants de champs (`event-title`, `event-date`…) sont conservés. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- L'en-tête de page passe par le `PageHeader` de la lib, et les grilles, la barre latérale et les modales vivent désormais dans `src/components/CalendarPage/`. (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- `@mairie360/lib-components` passe à 1.0.3 dans `package.json`. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Corrections
- Le focus du `Modal` de la lib est corrigé (mairie360/lib-components#471, inclus dans la version de la lib adoptée par cette PR). (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Dépendances de développement et runtime : Node 24.22.1 pour la CI et Docker (image Bookworm épinglée par digest), `eslint-config-next` et Next.js en 16.4.2, `jsdom` en 30.1.3 et `playwright-core` en 1.64.1, `follow-redirects` en 1.16.2 dans le lock. (bbd2aa8, 3e4ec4a, c82f8ab, [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298), [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297), [#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))
- Réparation des locks de dépendances et backport Zod 3 vendorisé (`vendor/zod`) avec garde d'intégrité, sans fonction visible dans les diffs fournis (diff tronqué). (a7e43ee, [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299))
- `postinstall`, `prebuild` et `pretest` ne contactent plus le service d'avis npm ; la vérification amont passe dans `npm run audit:upstream`, lancé chaque jour par un workflow dédié. Un `npm ci` ne dépend donc plus du réseau. (e928c4f, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- Les workflows appellent mairie360/CICD v4.5.0, puis v4.12.0, puis v5.2.2, et le scan Semgrep/Gitleaks passe par les actions du CICD. (4ce01f2, 1fe930e, 41ee6aa, 2dc1983, [#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301), [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311))
- Stack d'accessibilité RGAA : `accessibility_test.sh`, `docker-compose-accessibility.yml` avec son propre nom de projet, états RGAA dans `rgaa.yaml`, et tests de politique CI. (3cc7a6d, 2dc1983, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218), [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- Checklist RGPD sur chaque PR (`.github/workflows/gdpr-pr.yml`) et simulation d'usage RGPD avant prod (`gdpr_simulation_test.sh`, `docker-compose-gdpr-simulation.yml`). Ces travaux n'ont pas d'effet sur l'application livrée. (74f5362, 63d8030, 94812cf, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223), [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313), [#314](https://github.com/mairie360/Calendars_Web_Service/pull/314))

## Différence dev → staging (en dev, pas encore en staging)

#### Changements de comportement
- Les fenêtres d'événement (création et détails) utilisent désormais le composant `Modal` de la lib. Depuis l'éditeur de détails, Échap, le fond ou la fermeture ferment toute la fenêtre, et « Annuler » revient aux détails. Les identifiants de champs (`event-title`, `event-date`…) sont conservés. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- L'en-tête de page passe par le `PageHeader` de la lib, et les grilles, la barre latérale et les modales vivent désormais dans `src/components/CalendarPage/`. (MAIR-607, MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))
- `@mairie360/lib-components` passe à 1.0.3 dans `package.json`. (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Corrections
- Le focus du `Modal` de la lib est corrigé (mairie360/lib-components#471, inclus dans la version de la lib adoptée par cette PR). (MAIR-608, [#287](https://github.com/mairie360/Calendars_Web_Service/pull/287))

#### Technique
- Dépendances de développement et runtime : Node 24.22.1 pour la CI et Docker (image Bookworm épinglée par digest), `eslint-config-next` et Next.js en 16.4.2, `jsdom` en 30.1.3 et `playwright-core` en 1.64.1, `follow-redirects` en 1.16.2 dans le lock. (bbd2aa8, 3e4ec4a, c82f8ab, [#298](https://github.com/mairie360/Calendars_Web_Service/pull/298), [#297](https://github.com/mairie360/Calendars_Web_Service/pull/297), [#307](https://github.com/mairie360/Calendars_Web_Service/pull/307))
- Réparation des locks de dépendances et backport Zod 3 vendorisé (`vendor/zod`) avec garde d'intégrité, sans fonction visible dans les diffs fournis (diff tronqué). (a7e43ee, [#299](https://github.com/mairie360/Calendars_Web_Service/pull/299))
- `postinstall`, `prebuild` et `pretest` ne contactent plus le service d'avis npm ; la vérification amont passe dans `npm run audit:upstream`, lancé chaque jour par un workflow dédié. Un `npm ci` ne dépend donc plus du réseau. (e928c4f, [#310](https://github.com/mairie360/Calendars_Web_Service/pull/310))
- Les workflows appellent mairie360/CICD v4.5.0, puis v4.12.0, puis v5.2.2, et le scan Semgrep/Gitleaks passe par les actions du CICD. (4ce01f2, 1fe930e, 41ee6aa, 2dc1983, [#296](https://github.com/mairie360/Calendars_Web_Service/pull/296), [#301](https://github.com/mairie360/Calendars_Web_Service/pull/301), [#311](https://github.com/mairie360/Calendars_Web_Service/pull/311))
- Stack d'accessibilité RGAA : `accessibility_test.sh`, `docker-compose-accessibility.yml` avec son propre nom de projet, états RGAA dans `rgaa.yaml`, et tests de politique CI. (3cc7a6d, 2dc1983, [#218](https://github.com/mairie360/Calendars_Web_Service/pull/218), [#305](https://github.com/mairie360/Calendars_Web_Service/pull/305))
- Checklist RGPD sur chaque PR (`.github/workflows/gdpr-pr.yml`) et simulation d'usage RGPD avant prod (`gdpr_simulation_test.sh`, `docker-compose-gdpr-simulation.yml`). Ces travaux n'ont pas d'effet sur l'application livrée. (74f5362, 63d8030, 94812cf, [#223](https://github.com/mairie360/Calendars_Web_Service/pull/223), [#313](https://github.com/mairie360/Calendars_Web_Service/pull/313), [#314](https://github.com/mairie360/Calendars_Web_Service/pull/314))

## Différence staging → prod (en staging, pas encore en prod)

_Rien._

## Historique des passages

<!-- release-journal-history:start -->
| Date | Environnement | Version | Commit | Run |
| --- | --- | --- | --- | --- |
| 2026-11-04 18:21 UTC | dev | — | `94812cf` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41883110375) |
| 2026-11-03 14:57 UTC | dev | — | `63d8030` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41656732248) |
| 2026-11-02 23:02 UTC | dev | — | `41ee6aa` | [run](https://github.com/mairie360/Calendars_Web_Service/actions/runs/41540123493) |
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
